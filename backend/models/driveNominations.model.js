import { pool } from '../config/db.js';
import { MIN_CGPA_FOR_ELIGIBILITY } from '../constants/collegeStudentNominations.constants.js';


// ─── Eligible Students for a Drive ───────────────────────────────────────────
// Queries the eligible_students VIEW (backed by the students table) so that
// every student added to the student database is automatically included.
// Filters by:
//   - drive's CGPA cutoff (falls back to MIN_CGPA_FOR_ELIGIBILITY)
//   - drive's allowed_branches (skipped when no eligibility row exists)
//   - placement_status != 'Placed'
//   - optional college_id so each college only sees their own students
export const getEligibleForDrive = async (driveId, collegeId = null) => {
  const params = [driveId, MIN_CGPA_FOR_ELIGIBILITY];
  let collegeFilter = '';
  if (collegeId) {
    params.push(collegeId);
    collegeFilter = `AND es.college_id = $${params.length}`;
  }

  const result = await pool.query(
    `SELECT
       es.*,
       CASE WHEN dn.id IS NOT NULL THEN true ELSE false END AS already_nominated
     FROM eligible_students es
     LEFT JOIN drive_nominations dn
       ON dn.student_id = es.id
      AND dn.drive_id = $1
      -- Withdrawn nominations do not count as active
      AND dn.status != 'Withdrawn'
     WHERE
       es.placement_status != 'Placed'
       ${collegeFilter}
       AND es.cgpa >= (
         SELECT COALESCE(MAX(de.cgpa_cutoff), $2)
         FROM drive_eligibility de
         WHERE de.drive_id = $1
       )
       AND (
         -- pass if drive has no branch restrictions
         NOT EXISTS (
           SELECT 1 FROM drive_eligibility
           WHERE drive_id = $1
             AND allowed_branches IS NOT NULL
             AND array_length(allowed_branches, 1) > 0
         )
         OR es.department = ANY(
           SELECT UNNEST(allowed_branches)
           FROM drive_eligibility
           WHERE drive_id = $1
         )
       )
     ORDER BY es.cgpa DESC`,
    params
  );
  return result.rows;
};

// ─── Get Drive Nominees (registered / pending approval) ──────────────────────
export const getDriveNominees = async (driveId) => {
  const result = await pool.query(
    `SELECT
       dn.*,
       es.name           AS student_name,
       es.enrollment_no,
       es.department,
       es.course,
       es.cgpa,
       es.batch,
       es.email,
       es.skills
     FROM drive_nominees dn
     JOIN eligible_students es ON es.id = dn.student_id
     WHERE dn.drive_id = $1
     ORDER BY dn.registered_at DESC`,
    [driveId]
  );
  return result.rows;
};

// ─── Approve / Reject a nominee's eligibility ────────────────────────────────
export const setNomineeEligibility = async (driveId, studentId, approved, approvedBy) => {
  const status = approved ? 'Approved' : 'Rejected';
  const result = await pool.query(
    `INSERT INTO drive_nominees (drive_id, student_id, status, approved_by)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (drive_id, student_id)
     DO UPDATE SET
       status      = EXCLUDED.status,
       approved_by = EXCLUDED.approved_by,
       updated_at  = NOW()
     RETURNING *`,
    [driveId, studentId, status, approvedBy]
  );
  return result.rows[0];
};

// ─── Get all nominations for a drive (paginated) ─────────────────────────────
export const getDriveNominations = async (driveId, { status, limit, offset } = {}) => {
  const params = [driveId];
  let statusFilter = '';
  if (status) {
    params.push(status);
    statusFilter = `AND dn.status = $${params.length}`;
  }

  const countRes = await pool.query(
    `SELECT COUNT(*)
     FROM drive_nominations dn
     WHERE dn.drive_id = $1 ${statusFilter}`,
    params
  );
  const total = parseInt(countRes.rows[0].count);

  const dataParams = [...params, limit ?? 100, offset ?? 0];

  const result = await pool.query(
    `SELECT
       dn.*,
       es.name           AS student_name,
       es.enrollment_no,
       es.department,
       es.course,
       es.cgpa,
       es.batch,
       es.email,
       pd.company,
       pd.role,
       pd.package
     FROM drive_nominations dn
     JOIN eligible_students   es ON es.id    = dn.student_id
     JOIN placement_drives    pd ON pd.id    = dn.drive_id
     WHERE dn.drive_id = $1
     ${statusFilter}
     ORDER BY dn.nominated_at DESC
     LIMIT $${dataParams.length - 1} OFFSET $${dataParams.length}`,
    dataParams
  );

  return { rows: result.rows, total };
};

// ─── Nominate multiple students to a drive (bulk) ────────────────────────────
export const nominateStudentsToDrive = async (
  driveId,
  studentIds,
  nominatedBy,
  collegeId = null
) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const requestedIds = [...new Set(studentIds.map(Number))];

    if (
      requestedIds.length === 0 ||
      requestedIds.some((id) => !Number.isInteger(id))
    ) {
      const err = new Error('studentIds must contain valid integer IDs');
      err.statusCode = 400;
      throw err;
    }

    const params = [
      driveId,
  requestedIds,
  nominatedBy,
  collegeId,
    ];

    const collegeFilter = collegeId
  ? `AND es.college_id = $4`
  : "";

    // ------------------------------------------------------------
    // 1. Insert only students who are eligible for this drive
    // ------------------------------------------------------------
    const result = await client.query(
  `INSERT INTO drive_nominations (
     drive_id,
     student_id,
     nominated_by,
     status
   )
   SELECT
     $1::int,
     es.id,
     $3::int,
     'Nominated'
   FROM eligible_students es
   WHERE es.id = ANY($2::int[])
     AND es.placement_status != 'Placed'
     ${collegeFilter}
     AND es.cgpa >= (
       SELECT COALESCE(
         MAX(de.cgpa_cutoff),
         $5::numeric
       )
       FROM drive_eligibility de
       WHERE de.drive_id = $1::int
     )
     AND (
       NOT EXISTS (
         SELECT 1
         FROM drive_eligibility de
         WHERE de.drive_id = $1::int
           AND de.allowed_branches IS NOT NULL
           AND array_length(de.allowed_branches, 1) > 0
       )
       OR EXISTS (
         SELECT 1
         FROM drive_eligibility de
         WHERE de.drive_id = $1::int
           AND es.department = ANY(de.allowed_branches)
       )
     )
   ON CONFLICT (drive_id, student_id) DO UPDATE SET
     status      = 'Nominated',
     updated_at  = NOW()
   WHERE drive_nominations.status = 'Withdrawn'
   RETURNING *`,
  [...params, MIN_CGPA_FOR_ELIGIBILITY]
);
    const inserted = result.rows;

    // IDs that were actually inserted in this request
    const insertedIds = new Set(
      inserted.map((row) => Number(row.student_id))
    );

    // ------------------------------------------------------------
    // 2. Find existing ACTIVE nominations ONLY for requested students
    //    (Withdrawn rows are reinstatable, not "already nominated")
    // ------------------------------------------------------------
    const existingResult = await client.query(
      `SELECT student_id, status
       FROM drive_nominations
       WHERE drive_id = $1
         AND student_id = ANY($2::int[])
         AND status != 'Withdrawn'`,
      [driveId, requestedIds]
    );

    const existingMap = new Map(
      existingResult.rows.map((row) => [
        Number(row.student_id),
        row.status,
      ])
    );

    // ------------------------------------------------------------
    // 3. Find which requested students satisfy drive eligibility
    // ------------------------------------------------------------
   const eligibleParams = [
  driveId,
  requestedIds,
  collegeId,
  MIN_CGPA_FOR_ELIGIBILITY,
];

const eligibleCollegeFilter = collegeId
  ? `AND es.college_id = $3::int`
  : "";

const eligibleResult = await client.query(
  `SELECT es.id
   FROM eligible_students es
   WHERE es.id = ANY($2::int[])
     AND es.placement_status != 'Placed'
     ${eligibleCollegeFilter}

     AND es.cgpa >= (
       SELECT COALESCE(
         MAX(de.cgpa_cutoff),
         $4::numeric
       )
       FROM drive_eligibility de
       WHERE de.drive_id = $1::int
     )

     AND (
       NOT EXISTS (
         SELECT 1
         FROM drive_eligibility de
         WHERE de.drive_id = $1::int
           AND de.allowed_branches IS NOT NULL
           AND array_length(de.allowed_branches, 1) > 0
       )
       OR EXISTS (
         SELECT 1
         FROM drive_eligibility de
         WHERE de.drive_id = $1::int
           AND es.department = ANY(de.allowed_branches)
       )
     )`,
  eligibleParams
);
    const eligibleIds = new Set(
      eligibleResult.rows.map((row) => Number(row.id))
    );

    // ------------------------------------------------------------
    // 4. Build skipped list ONLY for students in this request
    // ------------------------------------------------------------
    const skipped = [];

    for (const studentId of requestedIds) {
      // Successfully inserted
      if (insertedIds.has(studentId)) {
        continue;
      }

      // Already exists in this drive
      if (existingMap.has(studentId)) {
        skipped.push({
          studentId,
          reason: 'Already nominated',
          existingStatus: existingMap.get(studentId),
        });
        continue;
      }

      // Student was requested but failed drive eligibility
      if (!eligibleIds.has(studentId)) {
        skipped.push({
          studentId,
          reason: collegeId
            ? 'Student is not eligible for this drive or does not belong to your college'
            : 'Student is not eligible for this drive',
        });
      }
    }

    // ------------------------------------------------------------
    // 5. Update drive statistics
    // ------------------------------------------------------------
    await client.query(
      `UPDATE drive_statistics
       SET total_applied = (
         SELECT COUNT(*)
         FROM drive_nominations
         WHERE drive_id = $1
           AND status != 'Withdrawn'
       )
       WHERE drive_id = $1`,
      [driveId]
    );

    await client.query('COMMIT');

    return {
      inserted,
      skipped,
    };
  } catch (err) {
    await client.query('ROLLBACK');

    console.error(
      'nominateStudentsToDrive error:',
      err.message,
      err.stack?.split('\n')[1]
    );

    throw err;
  } finally {
    client.release();
  }
};
// ─── Shortlist multiple nominated students for a drive (bulk) ────────────────
export const shortlistStudentsForDrive = async (
  driveId,
  studentIds,
  shortlistedBy
) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Always work with numeric IDs
    const normalizedDriveId = Number(driveId);
    const normalizedStudentIds = studentIds.map(Number);
    const normalizedShortlistedBy = shortlistedBy
      ? Number(shortlistedBy)
      : null;

    const existingRes = await client.query(
      `
      SELECT
        student_id,
        id AS nomination_id
      FROM drive_nominations
      WHERE drive_id = $1
        AND student_id = ANY($2::int[])
        AND status = 'Nominated'
      `,
      [normalizedDriveId, normalizedStudentIds]
    );

    console.log("🔥 SHORTLIST EXISTING NOMINATIONS:", existingRes.rows);

    const existingIds = new Set(
      existingRes.rows.map((row) => Number(row.student_id))
    );

    const shortlisted = [];
    const skipped = [];

    if (existingRes.rows.length > 0) {
      // 1. Change nomination status
      await client.query(
        `
        UPDATE drive_nominations
        SET
          status = 'Shortlisted',
          updated_at = NOW()
        WHERE drive_id = $1
          AND student_id = ANY($2::int[])
          AND status = 'Nominated'
        `,
        [normalizedDriveId, normalizedStudentIds]
      );

      // 2. Create shortlist records
      const slResult = await client.query(
        `
        INSERT INTO drive_shortlists (
          drive_id,
          nomination_id,
          student_id,
          shortlisted_by,
          status
        )
        SELECT
          $1,
          dn.id,
          dn.student_id,
          $2,
          'Shortlisted'
        FROM drive_nominations dn
        WHERE dn.drive_id = $1
          AND dn.student_id = ANY($3::int[])
          AND dn.status = 'Shortlisted'
        ON CONFLICT (drive_id, student_id)
        DO UPDATE SET
          status = 'Shortlisted',
          shortlisted_by = EXCLUDED.shortlisted_by,
          updated_at = NOW()
        RETURNING *
        `,
        [
          normalizedDriveId,
          normalizedShortlistedBy,
          normalizedStudentIds,
        ]
      );

      console.log("🔥 SHORTLIST INSERTED:", slResult.rows);

      shortlisted.push(...slResult.rows);
    }

    // Students that were requested but had no active nomination
    for (const studentId of normalizedStudentIds) {
      if (!existingIds.has(studentId)) {
        skipped.push({
          studentId,
          reason: "No nomination found for this drive",
        });
      }
    }

    // Update statistics
    await client.query(
      `
      UPDATE drive_statistics
      SET total_selected = (
        SELECT COUNT(*)
        FROM drive_nominations
        WHERE drive_id = $1
          AND status = 'Selected'
      )
      WHERE drive_id = $1
      `,
      [normalizedDriveId]
    );

    await client.query("COMMIT");

    return {
      shortlisted,
      skipped,
    };
  } catch (err) {
    await client.query("ROLLBACK");

    console.error(
      "❌ shortlistStudentsForDrive error:",
      err.message,
      err.stack?.split("\n")[1]
    );

    throw err;
  } finally {
    client.release();
  }
};
// ─── Withdraw / remove a student's nomination for a drive ────────────────────
export const withdrawNominationFromDrive = async (driveId, studentId) => {
  const result = await pool.query(
    `UPDATE drive_nominations
     SET status = 'Withdrawn', updated_at = NOW()
     WHERE drive_id = $1 AND student_id = $2 AND status != 'Withdrawn'
     RETURNING *`,
    [Number(driveId), Number(studentId)]
  );

  if (result.rows.length === 0) {
    return null;
  }

  // Keep drive statistics consistent
  await pool.query(
    `UPDATE drive_statistics
     SET total_applied = (
       SELECT COUNT(*)
       FROM drive_nominations
       WHERE drive_id = $1 AND status != 'Withdrawn'
     )
     WHERE drive_id = $1`,
    [Number(driveId)]
  );

  return result.rows[0];
};

export const selectStudentForDrive = async (
driveId,
studentId,
selectedBy
) => {
const client = await pool.connect();

try {
  await client.query("BEGIN");

  const result = await client.query(
    `
    UPDATE drive_nominations
    SET
      status = 'Selected',
      updated_at = NOW()
    WHERE drive_id = $1
      AND student_id = $2
      AND status = 'Shortlisted'
    RETURNING *
    `,
    [Number(driveId), Number(studentId)]
  );

  if (result.rows.length === 0) {
    await client.query("ROLLBACK");

    return {
      selected: false,
      message: "Student must be shortlisted before selection",
    };
  }

  await client.query(
    `
    UPDATE drive_statistics
    SET total_selected = (
      SELECT COUNT(*)
      FROM drive_nominations
      WHERE drive_id = $1
        AND status = 'Selected'
    )
    WHERE drive_id = $1
    `,
    [Number(driveId)]
  );

  await client.query("COMMIT");

  return {
    selected: true,
    data: result.rows[0],
  };
} catch (err) {
  await client.query("ROLLBACK");
  throw err;
} finally {
  client.release();
}
};

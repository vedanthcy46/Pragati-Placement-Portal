import { pool } from '../../../config/db.js';

export const getDashboardStats = async (companyId) => {
  // Query active drives
  const drivesRes = await pool.query(
    `SELECT COUNT(*) FROM recruitment_drives WHERE company_id = $1 AND status = 'active'`,
    [companyId]
  );
  const activeDrivesDb = parseInt(drivesRes.rows[0].count, 10);

  // Query total applications
  const appsRes = await pool.query(
    `SELECT COUNT(*) FROM student_drive_progress WHERE company_id = $1`,
    [companyId]
  );
  const totalAppsDb = parseInt(appsRes.rows[0].count, 10);

  // Query interviews scheduled
  let interviewsDb = 0;

try {
  const interviewsRes = await pool.query(
    `SELECT COUNT(*) FROM interviews`
  );

  interviewsDb = parseInt(interviewsRes.rows[0].count, 10);
} catch (err) {
  interviewsDb = 0;
}

  // Query offers released (stage is Offered or Selected)
  const offersRes = await pool.query(
    `SELECT COUNT(*) FROM student_drive_progress 
     WHERE company_id = $1 AND stage IN ('Offered', 'Selected')`,
    [companyId]
  );
  const offersDb = parseInt(offersRes.rows[0].count, 10);

  const hiringSuccessRate = Math.round((offersDb / totalAppsDb) * 100);

  return {
    activeDrives: activeDrivesDb,
    totalApplications: totalAppsDb,
    interviewsScheduled: interviewsDb,
    offersReleased: offersDb,
    hiringSuccessRate
  };
};

export const getDashboardFunnel = async (companyId) => {
  const appliedRes = await pool.query(
    `SELECT COUNT(*) FROM student_drive_progress WHERE company_id = $1`,
    [companyId]
  );
  const applied = parseInt(appliedRes.rows[0].count, 10);

  const screenedRes = await pool.query(
    `SELECT COUNT(*) FROM student_drive_progress 
     WHERE company_id = $1 AND stage IN ('tested', 'trained', 'selected')`,
    [companyId]
  );
  const screened = parseInt(screenedRes.rows[0].count, 10);

  const trainedRes = await pool.query(
    `SELECT COUNT(*) FROM student_drive_progress 
     WHERE company_id = $1 AND stage IN ('trained', 'selected')`,
    [companyId]
  );
  const trained = parseInt(trainedRes.rows[0].count, 10);

  const shortlistedRes = await pool.query(
    `SELECT COUNT(*) FROM student_drive_progress 
     WHERE company_id = $1 AND stage ='selected'`,[companyId]);
  const shortlisted = parseInt(shortlistedRes.rows[0].count, 10);

  const selectedRes = await pool.query(
    `SELECT COUNT(*) FROM student_drive_progress 
     WHERE company_id = $1 AND stage = 'selected'`,
    [companyId]
  );
  const selected = parseInt(selectedRes.rows[0].count, 10);

  return {
    applied,
    screened,
    trained,
    shortlisted,
    selected
  };
};

export const getCollegeStats = async (companyId) => {
  const query = `
    SELECT
    c.name AS "collegeName",
    COUNT(*)::int AS "candidateCount"
FROM student_drive_progress sdp
JOIN students s
    ON s.user_id = sdp.student_id
LEFT JOIN colleges c
    ON c.id = s.college_id
WHERE sdp.company_id = $1
GROUP BY c.name
ORDER BY "candidateCount" DESC
  `;
  const result = await pool.query(query, [companyId]);

  return result.rows;
};

export const getRecentActivities = async (companyId) => {
  const query = `
    SELECT 
      sdp.stage AS "activity",
      s.name AS "candidateName",
      sdp.updated_at AS "time"
    FROM student_drive_progress sdp
    JOIN students s ON s.user_id = sdp.student_id
    WHERE sdp.company_id = $1
    ORDER BY sdp.updated_at DESC
    LIMIT 10
  `;
  const result = await pool.query(query, [companyId]);

  // Format activity messages
  return result.rows.map(row => {
    let actMessage = "Applied for role";
    if (row.activity === "tested")
    actMessage = "Assessment completed";

else if (row.activity === "trained")
    actMessage = "Training completed";

else if (row.activity === "selected")
    actMessage = "Candidate selected";

else
    actMessage = "Candidate applied";
    return {
      activity: actMessage,
      candidateName: row.candidateName,
      time: row.time
    };
  });
};

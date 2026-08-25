import { pool } from '../config/db.js';

/* ==========================================
   Company Model
========================================== */

const getAllCompanies = async () => {

    const result = await pool.query(`
        SELECT
            id,
            name,
            email,
            location,
            package,
            status,
            created_at AS "createdAt"
        FROM companies
        ORDER BY id DESC
    `);

    return result.rows;
};

const getCompanyById = async (id) => {

    const result = await pool.query(
        `
        SELECT
            id,
            name,
            email,
            location,
            package,
            status,
            created_at AS "createdAt"
        FROM companies
        WHERE id = $1
        `,
        [id]
    );

    return result.rows[0];
};

const getCompanyByName = async (name) => {

    const result = await pool.query(
        `
        SELECT id, name
        FROM companies
        WHERE name = $1
        `,
        [name]
    );

    return result.rows[0];
};

const createCompany = async ({
    name,
    email,
    location,
    package: packageValue
}) => {

    if (!email || !String(email).trim()) {
        const err = new Error("Company email is required");
        err.statusCode = 400;
        throw err;
    }

    try {
        const result = await pool.query(
            `
            INSERT INTO companies
            (
                name,
                email,
                location,
                package
            )
            VALUES
            (
                $1,$2,$3,$4
            )
            RETURNING *
            `,
            [
                name,
                String(email).trim().toLowerCase(),
                location,
                packageValue
            ]
        );

        return result.rows[0];
    } catch (err) {
        // Unique violation on companies.email
        if (err.code === "23505") {
            const friendly = new Error("A company with this email already exists");
            friendly.statusCode = 409;
            throw friendly;
        }
        throw err;
    }
};
const updateCompany = async (
    id,
    {
        name,
        email,
        location,
        package: packageValue
    }
) => {

    try {
        const result = await pool.query(
            `
            UPDATE companies
            SET
                name=$1,
                email=COALESCE($2, email),
                location=$3,
                package=$4,
                updated_at=NOW()
            WHERE id=$5
            RETURNING *
            `,
            [
                name,
                email ? String(email).trim().toLowerCase() : null,
                location,
                packageValue,
                id
            ]
        );

        return result.rows[0];
    } catch (err) {
        if (err.code === "23505") {
            const friendly = new Error("A company with this email already exists");
            friendly.statusCode = 409;
            throw friendly;
        }
        throw err;
    }
};

const deleteCompany = async (id) => {

    await pool.query(
        `
        DELETE FROM companies
        WHERE id=$1
        `,
        [id]
    );

    return true;
};

const searchCompanies = async (keyword) => {

    const result = await pool.query(
        `
        SELECT *
        FROM companies
        WHERE
            name ILIKE $1
            OR location ILIKE $1
            OR package ILIKE $1
        `,
        [`%${keyword}%`]
    );

    return result.rows;
};

/* ==========================================
   Job Posting Model
========================================== */

const getAllJobPostings = async () => {

    const result = await pool.query(
        `
        SELECT
            jp.id,
            jp.company_id,

            c.name AS company,

            -- Legacy rows (seeded before the college upgrade) store the
            -- position in the title column; fall back so they render correctly.
            COALESCE(jp.role, jp.title) AS role,
            jp.department,
            jp.location,
            jp.package,

            jp.cgpa_limit AS cgpa,

            jp.batch,

            jp.application_deadline AS deadline,

            COALESCE(jp.job_description, jp.description) AS "jobDescription",

            jp.hiring_process AS "hiringProcess",

            jp.status,

            jp.created_at

        FROM job_postings jp

        LEFT JOIN companies c
        ON jp.company_id = c.id

        ORDER BY jp.id DESC
        `
    );


    return result.rows;
};

const getJobPostingById = async (id) => {
    const result = await pool.query(
        `
        SELECT *
        FROM job_postings
        WHERE id = $1
        `,
        [id]
    );

    return result.rows[0];
};

const createJobPosting = async (job) => {

    const result = await pool.query(
        `
        INSERT INTO job_postings
        (
            company_id,
            title,
            role,
            department,
            location,
            package,
            cgpa_limit,
            batch,
            application_deadline,
            job_description,
            hiring_process,
            status
        )
        VALUES
        (
            $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12
        )
        RETURNING *
        `,
        [
            job.company_id,
            job.role,          // mirror role → title to satisfy NOT NULL
            job.role,
            job.department,
            job.location,
            job.package,
            job.cgpa_limit,
            job.batch,
            job.application_deadline,
            job.job_description,
            job.hiring_process,
            job.status || "Open"
        ]
    );

    return result.rows[0];
};
const updateJobPosting = async (id, job) => {

    // Build dynamic SET clause - only include defined fields
    const allowedFields = [
        'company_id', 'role', 'department', 'location', 'package',
        'cgpa_limit', 'batch', 'application_deadline', 'job_description',
        'hiring_process', 'status'
    ];

    const setClauses = [];
    const values = [];
    let paramIndex = 1;

    for (const field of allowedFields) {
        if (job[field] !== undefined) {
            setClauses.push(`${field} = $${paramIndex}`);
            values.push(job[field]);
            paramIndex++;
        }
    }

    if (setClauses.length === 0) {
        // Nothing to update
        const result = await pool.query(
            `SELECT * FROM job_postings WHERE id = $1`, [id]
        );
        return result.rows[0];
    }

    setClauses.push(`updated_at = NOW()`);
    values.push(id);

    await pool.query(
        `UPDATE job_postings SET ${setClauses.join(', ')} WHERE id = $${paramIndex}`,
        values
    );

    const result = await pool.query(
        `SELECT
            jp.id,
            jp.company_id,
            c.name AS company,
            jp.role,
            jp.department,
            jp.location,
            jp.package,
            jp.cgpa_limit AS cgpa,
            jp.batch,
            jp.application_deadline AS deadline,
            jp.job_description AS "jobDescription",
            jp.hiring_process AS "hiringProcess",
            jp.status,
            jp.created_at
        FROM job_postings jp
        LEFT JOIN companies c ON jp.company_id = c.id
        WHERE jp.id = $1`,
        [id]
    );

    return result.rows[0];
};

const deleteJobPosting = async (id) => {

    await pool.query(
        `
        DELETE FROM job_postings
        WHERE id=$1
        `,
        [id]
    );

    return true;
};

const getOpenJobs = async () => {

    const result = await pool.query(`
        SELECT *
        FROM job_postings
        WHERE status='Open'
    `);

    return result.rows;
};

const getClosedJobs = async () => {

    const result = await pool.query(`
        SELECT *
        FROM job_postings
        WHERE status='Closed'
    `);

    return result.rows;
};

/* ==========================================
   Eligibility Model
========================================== */

const getEligibility = async (jobId) => {

    const result = await pool.query(
        `
        SELECT *
        FROM job_eligibility
        WHERE job_id = $1
        `,
        [jobId]
    );

    return result.rows[0];
};

const createEligibility = async (data) => {

    const result = await pool.query(
        `
        INSERT INTO job_eligibility
        (
            job_id,
            qualification,
            min_percentage,
            max_backlogs,
            allowed_batch_year,
            gender_preference
        )
        VALUES
        (
            $1,$2,$3,$4,$5,$6
        )
        RETURNING *
        `,
        [
            data.job_id,
            data.qualification,
            data.min_percentage,
            data.max_backlogs,
            data.allowed_batch_year,
            data.gender_preference,
        ]
    );

    return result.rows[0];
};

const updateEligibility = async (jobId, data) => {

    const result = await pool.query(
        `
        UPDATE job_eligibility
        SET
            qualification = $1,
            min_percentage = $2,
            max_backlogs = $3,
            allowed_batch_year = $4,
            gender_preference = $5
        WHERE job_id = $6
        RETURNING *
        `,
        [
            data.qualification,
            data.min_percentage,
            data.max_backlogs,
            data.allowed_batch_year,
            data.gender_preference,
            jobId,
        ]
    );

    return result.rows[0];
};

const deleteEligibility = async (jobId) => {

    await pool.query(
        `
        DELETE FROM job_eligibility
        WHERE job_id = $1
        `,
        [jobId]
    );

    return true;
};
export {

    // Company
    getAllCompanies,
    getCompanyById,
    getCompanyByName,
    createCompany,
    updateCompany,
    deleteCompany,
    searchCompanies,

    // Job Posting
    getAllJobPostings,
    getJobPostingById,
    createJobPosting,
    updateJobPosting,
    deleteJobPosting,
    getOpenJobs,
    getClosedJobs,

    // Eligibility
    getEligibility,
    createEligibility,
    updateEligibility,
    deleteEligibility,
};
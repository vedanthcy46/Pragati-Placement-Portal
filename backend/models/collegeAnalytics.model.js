/**
 * Location: backend/models/collegeAnalytics.model.js
 */
import { pool } from "../config/db.js";

/**
 * Helper to parse package numeric values in SQL
 */
const SQL_AVG_PACKAGE = `COALESCE(AVG(NULLIF(regexp_replace(package, '[^0-9.]', '', 'g'), '')::numeric), 0)`;
const SQL_VAL_PACKAGE = `NULLIF(regexp_replace(package, '[^0-9.]', '', 'g'), '')::numeric`;

/**
 * Computes real package distribution (placed students grouped by package range).
 */
const getPackageDistribution = async (collegeId) => {
  const { rows } = await pool.query(
    `SELECT
      COUNT(*) FILTER (WHERE ${SQL_VAL_PACKAGE} >= 3 AND ${SQL_VAL_PACKAGE} < 6)::int as range_3_6,
      COUNT(*) FILTER (WHERE ${SQL_VAL_PACKAGE} >= 6 AND ${SQL_VAL_PACKAGE} < 10)::int as range_6_10,
      COUNT(*) FILTER (WHERE ${SQL_VAL_PACKAGE} >= 10 AND ${SQL_VAL_PACKAGE} < 15)::int as range_10_15,
      COUNT(*) FILTER (WHERE ${SQL_VAL_PACKAGE} >= 15 AND ${SQL_VAL_PACKAGE} < 25)::int as range_15_25,
      COUNT(*) FILTER (WHERE ${SQL_VAL_PACKAGE} >= 25)::int as range_25_plus
     FROM students
     WHERE college_id = $1 AND placement_status = 'Placed' AND package IS NOT NULL AND package <> ''`,
    [collegeId]
  );

  const r = rows[0];
  return [
    { range: "3-6 LPA", count: r.range_3_6 },
    { range: "6-10 LPA", count: r.range_6_10 },
    { range: "10-15 LPA", count: r.range_10_15 },
    { range: "15-25 LPA", count: r.range_15_25 },
    { range: "25+ LPA", count: r.range_25_plus },
  ];
};

/**
 * Computes real monthly hiring trend from the monthly_reports table,
 * falling back to placed students grouped by creation month.
 */
const getMonthlyHiring = async (collegeId) => {
  const { rows } = await pool.query(
    `SELECT report_month as month, total_placed as hired, average_package
     FROM monthly_reports
     WHERE college_id = $1
     ORDER BY report_month ASC`,
    [collegeId]
  );

  if (rows.length > 0) {
    return rows;
  }

  const dynamicRes = await pool.query(
    `SELECT
      TO_CHAR(created_at, 'Mon') as month,
      COUNT(*) FILTER (WHERE placement_status = 'Placed')::int as hired,
      ${SQL_AVG_PACKAGE}::numeric(8,2) as avgPkg
     FROM students
     WHERE college_id = $1
     GROUP BY TO_CHAR(created_at, 'Mon'), DATE_TRUNC('month', created_at)
     ORDER BY DATE_TRUNC('month', created_at) ASC`,
    [collegeId]
  );

  return dynamicRes.rows;
};

/**
 * Gets dashboard analytics summary.
 */
export const getDashboardAnalytics = async (collegeId) => {
  const { rows } = await pool.query(
    "SELECT * FROM analytics_dashboard WHERE college_id = $1",
    [collegeId]
  );

  if (rows.length > 0) {
    const cached = rows[0];
    const [packageDistribution, monthlyHiring, activeDrivesCount] = await Promise.all([
      getPackageDistribution(collegeId),
      getMonthlyHiring(collegeId),
      pool.query(
        `SELECT COUNT(*)::int as count
         FROM placement_drives
         WHERE college_id = $1 AND status IN ('Upcoming', 'Open')`,
        [collegeId]
      ),
    ]);
    return {
      ...cached,
      active_drives: activeDrivesCount.rows[0]?.count || 0,
      packageDistribution,
      monthlyHiring,
    };
  }

  // Fallback: Compute dynamically from students table
  const statsRes = await pool.query(
    `SELECT 
      COUNT(*)::int as total_students,
      COUNT(*) FILTER (WHERE placement_status = 'Placed')::int as total_placed,
      ${SQL_AVG_PACKAGE}::numeric(8,2) as average_package,
      COUNT(DISTINCT placed_at)::int as total_companies
     FROM students 
     WHERE college_id = $1`,
    [collegeId]
  );

  const stats = statsRes.rows[0];
  const total = stats.total_students;
  const placed = stats.total_placed;
  const placementRate = total > 0 ? ((placed / total) * 100).toFixed(2) : "0.00";

  // Query top recruiter
  const recRes = await pool.query(
    `SELECT placed_at as top_recruiter, COUNT(*) as count 
     FROM students 
     WHERE college_id = $1 AND placement_status = 'Placed' AND placed_at IS NOT NULL 
     GROUP BY placed_at 
     ORDER BY count DESC, placed_at ASC 
     LIMIT 1`,
    [collegeId]
  );
  const topRecruiter = recRes.rows[0]?.top_recruiter || null;

  const [packageDistribution, monthlyHiring, activeDrivesCount] = await Promise.all([
    getPackageDistribution(collegeId),
    getMonthlyHiring(collegeId),
    pool.query(
      `SELECT COUNT(*)::int as count
       FROM placement_drives
       WHERE college_id = $1 AND status IN ('Upcoming', 'Open')`,
      [collegeId]
    ),
  ]);

  return {
    college_id: collegeId,
    total_students: total,
    total_placed: placed,
    placement_rate: parseFloat(placementRate),
    average_package: parseFloat(stats.average_package || 0),
    top_recruiter: topRecruiter,
    active_drives: activeDrivesCount.rows[0]?.count || 0,
    total_companies: stats.total_companies,
    packageDistribution,
    monthlyHiring,
  };
};

/**
 * Gets overview statistics (total students, placed, rates, active drives, companies).
 */
export const getOverviewStatistics = async (collegeId) => {
  return getDashboardAnalytics(collegeId);
};

/**
 * Gets placement analytics.
 */
export const getPlacementAnalytics = async (collegeId) => {
  const { rows } = await pool.query(
    "SELECT * FROM placement_statistics WHERE college_id = $1 ORDER BY year ASC",
    [collegeId]
  );

  if (rows.length > 0) {
    return rows;
  }

  // Fallback: Compute dynamically from students batch years
  const batchRes = await pool.query(
    `SELECT 
      batch::int as year,
      COUNT(*)::int as total_students,
      COUNT(*) FILTER (WHERE placement_status = 'Placed')::int as total_placed,
      ${SQL_AVG_PACKAGE}::numeric(8,2) as average_package,
      COALESCE(MAX(NULLIF(regexp_replace(package, '[^0-9.]', '', 'g'), '')::numeric), 0)::numeric(8,2) as highest_package
     FROM students 
     WHERE college_id = $1 AND batch ~ '^[0-9]+$'
     GROUP BY batch 
     ORDER BY batch ASC`,
    [collegeId]
  );

  return batchRes.rows.map(r => ({
    ...r,
    placement_rate: r.total_students > 0 ? parseFloat(((r.total_placed / r.total_students) * 100).toFixed(2)) : 0.00
  }));
};

/**
 * Gets department-wise analytics.
 */
export const getDepartmentAnalytics = async (collegeId) => {
  const { rows } = await pool.query(
    `SELECT 
      ds.*,
      d.name as department_name,
      d.code as department_code
     FROM department_statistics ds
     JOIN departments d ON d.id = ds.department_id
     WHERE ds.college_id = $1
     ORDER BY d.name ASC`,
    [collegeId]
  );

  if (rows.length > 0) {
    return rows;
  }

  // Fallback: Compute dynamically from students grouped by department
  const deptRes = await pool.query(
    `SELECT 
      department as department_name,
      COUNT(*)::int as total_students,
      COUNT(*) FILTER (WHERE placement_status = 'Placed')::int as total_placed,
      ${SQL_AVG_PACKAGE}::numeric(8,2) as average_package
     FROM students 
     WHERE college_id = $1 AND department IS NOT NULL
     GROUP BY department
     ORDER BY total_students DESC`,
    [collegeId]
  );

  return deptRes.rows.map((r, index) => ({
    id: index + 1,
    department_name: r.department_name,
    department_code: r.department_name.split(' ').map(w => w[0]).join('').toUpperCase().substring(0, 10),
    total_students: r.total_students,
    total_placed: r.total_placed,
    placement_rate: r.total_students > 0 ? parseFloat(((r.total_placed / r.total_students) * 100).toFixed(2)) : 0.00,
    average_package: parseFloat(r.average_package || 0),
  }));
};

/**
 * Gets company hiring statistics.
 */
export const getCompanyAnalytics = async (collegeId) => {
  const { rows } = await pool.query(
    "SELECT * FROM company_statistics WHERE college_id = $1 ORDER BY total_hired DESC",
    [collegeId]
  );

  if (rows.length > 0) {
    return rows;
  }

  // Fallback: Compute dynamically from students placed
  const companyRes = await pool.query(
    `SELECT 
      placed_at as company_name,
      COUNT(*)::int as total_hired,
      ${SQL_AVG_PACKAGE}::numeric(8,2) as average_package
     FROM students 
     WHERE college_id = $1 AND placement_status = 'Placed' AND placed_at IS NOT NULL AND placed_at <> ''
     GROUP BY placed_at
     ORDER BY total_hired DESC`,
    [collegeId]
  );

  return companyRes.rows.map((r, index) => ({
    id: index + 1,
    company_name: r.company_name,
    company_id: null,
    total_hired: r.total_hired,
    average_package: parseFloat(r.average_package || 0),
  }));
};

/**
 * Returns distinct filter options for a college, sourced from real data so
 * every module (students, reports, analytics, drives, job postings) uses the
 * same set of departments, courses, batches, semesters, statuses and companies.
 */
export const getFilterOptions = async (collegeId) => {
  const [
    depts,
    courses,
    batches,
    semesters,
    statuses,
    companies,
    hiringCompanies,
    registeredCompanies,
  ] = await Promise.all([
    pool.query(
      `SELECT DISTINCT department FROM students
       WHERE college_id = $1 AND department IS NOT NULL AND department <> ''
       ORDER BY department ASC`,
      [collegeId]
    ),
    pool.query(
      `SELECT DISTINCT course FROM students
       WHERE college_id = $1 AND course IS NOT NULL AND course <> ''
       ORDER BY course ASC`,
      [collegeId]
    ),
    pool.query(
      `SELECT DISTINCT batch FROM students
       WHERE college_id = $1 AND batch IS NOT NULL AND batch <> ''
       ORDER BY batch DESC`,
      [collegeId]
    ),
    pool.query(
      `SELECT DISTINCT semester FROM students
       WHERE college_id = $1 AND semester IS NOT NULL
       ORDER BY semester ASC`,
      [collegeId]
    ),
    pool.query(
      `SELECT DISTINCT placement_status FROM students
       WHERE college_id = $1 AND placement_status IS NOT NULL AND placement_status <> ''
       ORDER BY placement_status ASC`,
      [collegeId]
    ),
    pool.query(
      `SELECT DISTINCT company FROM placement_drives
       WHERE company IS NOT NULL AND company <> ''
       ORDER BY company ASC`
    ),
    pool.query(
      `SELECT DISTINCT placed_at FROM students
       WHERE college_id = $1 AND placement_status = 'Placed'
         AND placed_at IS NOT NULL AND placed_at <> ''
       ORDER BY placed_at ASC`,
      [collegeId]
    ),
    // Companies registered on the Companies page (source of job postings)
    pool.query(
      `SELECT DISTINCT name FROM companies
       WHERE name IS NOT NULL AND name <> ''
       ORDER BY name ASC`
    ),
  ]);

  const companySet = new Set([
    ...registeredCompanies.rows.map((r) => r.name),
    ...companies.rows.map((r) => r.company),
    ...hiringCompanies.rows.map((r) => r.placed_at),
  ]);

  return {
    departments: depts.rows.map((r) => r.department),
    courses: courses.rows.map((r) => r.course),
    batches: batches.rows.map((r) => r.batch),
    semesters: semesters.rows.map((r) => String(r.semester)),
    placementStatuses: statuses.rows.map((r) => r.placement_status),
    companies: Array.from(companySet).sort(),
  };
};

export default {
  getDashboardAnalytics,
  getOverviewStatistics,
  getPlacementAnalytics,
  getDepartmentAnalytics,
  getCompanyAnalytics,
  getFilterOptions,
};

import { pool } from "../config/db.js";
import {
  getPlacementAnalytics,
  getCompanyAnalytics,
  getDepartmentAnalytics,
  getDashboardAnalytics,
} from "./collegeAnalytics.model.js";

const getReports = async ({ limit = 20, offset = 0, type, status, collegeId } = {}) => {
  const values = [];
  let query =
    'SELECT id, title, type, status, format, content, college_id AS "collegeId", created_at AS "createdAt", updated_at AS "updatedAt" FROM generated_reports WHERE 1=1';
  if (collegeId) {
    values.push(collegeId);
    query += ` AND college_id = $${values.length}`;
  }
  if (type) {
    values.push(type);
    query += ` AND type = $${values.length}`;
  }
  if (status) {
    values.push(status);
    query += ` AND status = $${values.length}`;
  }
  values.push(limit, offset);
  query += ` ORDER BY created_at DESC LIMIT $${values.length - 1} OFFSET $${values.length}`;
  return (await pool.query(query, values)).rows;
};
const countReports = async ({ type, status, collegeId } = {}) => {
  const values = [];
  let query =
    "SELECT COUNT(*)::INTEGER AS total FROM generated_reports WHERE 1=1";
  if (collegeId) {
    values.push(collegeId);
    query += ` AND college_id = $${values.length}`;
  }
  if (type) {
    values.push(type);
    query += ` AND type = $${values.length}`;
  }
  if (status) {
    values.push(status);
    query += ` AND status = $${values.length}`;
  }
  return (await pool.query(query, values)).rows[0]?.total || 0;
};
const createReport = async (payload = {}) => {
  const createdBy = Number.isInteger(Number(payload.createdBy)) && Number(payload.createdBy) > 0 ? Number(payload.createdBy) : null;
  const collegeId = Number.isInteger(Number(payload.collegeId)) && Number(payload.collegeId) > 0 ? Number(payload.collegeId) : null;
  const result = await pool.query(
    `INSERT INTO generated_reports (title, type, status, format, content, created_by, college_id, created_at, updated_at) 
     VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW()) 
     RETURNING id, title, type, status, format, content, college_id AS "collegeId", created_at AS "createdAt", updated_at AS "updatedAt"`,
    [
      payload.title || "Generated Report",
      payload.type || "dashboard",
      payload.status || "completed",
      payload.format || "json",
      payload.content ? JSON.stringify(payload.content) : "{}",
      createdBy,
      collegeId,
    ]
  );
  return result.rows[0];
};
const createHistoryEntry = async ({ reportId, action = "generated" } = {}) =>
  (
    await pool.query(
      `INSERT INTO report_history (report_id, action, created_at) VALUES ($1, $2, NOW()) RETURNING id, report_id AS "reportId", action, created_at AS "createdAt"`,
      [reportId, action],
    )
  ).rows[0];
const getReportById = async (id) =>
  (
    await pool.query(
      'SELECT id, title, type, status, format, content, college_id AS "collegeId", created_at AS "createdAt", updated_at AS "updatedAt" FROM generated_reports WHERE id = $1',
      [id],
    )
  ).rows[0] || null;
const deleteReport = async (id) =>
  (
    await pool.query(
      "DELETE FROM generated_reports WHERE id = $1 RETURNING id",
      [id],
    )
  ).rows[0] || null;

/**
 * Real student records for a college, with the optional filters the UI
 * drives report generation with (department, hiring company, batch).
 * Falls back to an empty array when a college has no student rows yet;
 * the report generator then renders its static placeholder preview.
 */
const getStudentRecords = async (collegeId, { department, company, batch } = {}) => {
  const values = [collegeId];
  let where = "WHERE s.college_id = $1";
  if (department) {
    values.push(`%${department}%`);
    where += ` AND s.department ILIKE $${values.length}`;
  }
  if (company) {
    values.push(`%${company}%`);
    where += ` AND s.placed_at ILIKE $${values.length}`;
  }
  if (batch) {
    values.push(String(batch));
    where += ` AND s.batch::text = $${values.length}`;
  }
  const { rows } = await pool.query(
    `SELECT s.name, s.enrollment_no, s.department, s.course, s.cgpa, s.batch,
            s.placement_status, s.placed_at, s.package
     FROM students s
     ${where}
     ORDER BY s.name ASC
     LIMIT 500`,
    values
  );
  return rows.map((r, idx) => ({
    sNo: idx + 1,
    rollNo: r.enrollment_no || "-",
    studentName: r.name,
    department: r.department || "",
    course: r.course || "",
    cgpa: r.cgpa != null ? Number(r.cgpa) : null,
    batch: r.batch || "",
    company: r.placed_at || "",
    package: r.package || "",
    status: r.placement_status || "",
  }));
};

const toNumber = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

/**
 * Builds a report content subset (summary, records, chartData, company &
 * department breakdowns) from REAL analytics/student data for the college.
 * Every analytics getter already contains its own dynamic fallback, so this
 * is safe to call on sparsely seeded databases.
 */
const getLiveReportContent = async (collegeId, content = {}) => {
  const type = String(content.type || "dashboard").toLowerCase();
  const desiredBatch = content.batch || null;

  // "All Companies" / "All Departments" are UI sentinel values meaning "no filter".
  const desiredDepartment = content.department && content.department !== "All Departments" ? content.department : undefined;
  const desiredCompany = content.company && content.company !== "All Companies" ? content.company : undefined;

  const dashboard = await getDashboardAnalytics(collegeId);
  const placements = await getPlacementAnalytics(collegeId);
  const companies = await getCompanyAnalytics(collegeId);
  const departments = await getDepartmentAnalytics(collegeId);

  const matchingPlacement = desiredBatch
    ? placements.find((p) => String(p.year) === String(desiredBatch))
    : placements[placements.length - 1];

  const summary = {
    totalRegistered: toNumber(dashboard?.total_students ?? matchingPlacement?.total_students),
    totalPlaced: toNumber(dashboard?.total_placed ?? matchingPlacement?.total_placed),
    placementRate: toNumber(dashboard?.placement_rate ?? matchingPlacement?.placement_rate),
    averagePackage: toNumber(dashboard?.average_package ?? matchingPlacement?.average_package),
    highestPackage: toNumber(
      (desiredBatch && matchingPlacement?.highest_package) ||
        dashboard?.highest_package ||
        matchingPlacement?.highest_package
    ),
    topRecruiter: dashboard?.top_recruiter || null,
    activeDrives: toNumber(dashboard?.active_drives),
    totalCompanies: toNumber(dashboard?.total_companies ?? companies.length),
  };

  const records = await getStudentRecords(collegeId, {
    department: desiredDepartment,
    company: desiredCompany,
    batch: desiredBatch,
  });

  const chartData = departments.map((d) => ({
    label: d.department_name || d.department_code || "N/A",
    rate: toNumber(d.placement_rate),
    count: toNumber(d.total_placed),
  }));

  const companyData = (companies || []).map((c) => ({
    company: c.company_name,
    hired: toNumber(c.total_hired),
    averagePackage: toNumber(c.average_package),
  }));

  const departmentData = (departments || []).map((d) => ({
    department: d.department_name || d.department_code,
    totalStudents: toNumber(d.total_students),
    totalPlaced: toNumber(d.total_placed),
    placementRate: toNumber(d.placement_rate),
    averagePackage: toNumber(d.average_package),
  }));

  const placementData = (placements || []).map((p) => ({
    year: p.year,
    totalStudents: toNumber(p.total_students),
    totalPlaced: toNumber(p.total_placed),
    placementRate: toNumber(p.placement_rate),
    averagePackage: toNumber(p.average_package),
    highestPackage: toNumber(p.highest_package),
  }));

  return {
    type,
    // True when backed by real rows, so callers can keep the live dataset
    // instead of swapping in the static preview.
    live: records.length > 0 || placementData.length > 0 || companyData.length > 0 || departmentData.length > 0,
    summary,
    records,
    chartData,
    companyData,
    departmentData,
    placementData,
  };
};

const getMonthlyReport = async (collegeId, { month } = {}) => {
  const result = month
    ? await pool.query(
        "SELECT * FROM monthly_reports WHERE college_id = $1 AND report_month = $2",
        [collegeId, month],
      )
    : await pool.query(
        "SELECT * FROM monthly_reports WHERE college_id = $1 ORDER BY report_month DESC LIMIT 1",
        [collegeId],
      );
  return result.rows[0] || null;
};
const getYearlyReport = async (collegeId, { year } = {}) => {
  const result = year
    ? await pool.query(
        "SELECT * FROM yearly_reports WHERE college_id = $1 AND report_year = $2",
        [collegeId, Number.parseInt(year, 10)],
      )
    : await pool.query(
        "SELECT * FROM yearly_reports WHERE college_id = $1 ORDER BY report_year DESC LIMIT 1",
        [collegeId],
      );
  return result.rows[0] || null;
};
const exportAnalyticsReport = async (collegeId, reportType = "dashboard") => {
  switch (reportType.toLowerCase()) {
    case "placements":
      return getPlacementAnalytics(collegeId);
    case "companies":
      return getCompanyAnalytics(collegeId);
    case "departments":
      return getDepartmentAnalytics(collegeId);
    case "students":
      return (
        await pool.query(
          "SELECT enrollment_no, name, email, department, course, cgpa, placement_status, placed_at, package FROM students WHERE college_id = $1 ORDER BY name ASC",
          [collegeId],
        )
      ).rows;
    default:
      return [await getDashboardAnalytics(collegeId)];
  }
};
export {
  getReports,
  countReports,
  createReport,
  createHistoryEntry,
  getReportById,
  deleteReport,
  getStudentRecords,
  getLiveReportContent,
  getMonthlyReport,
  getYearlyReport,
  exportAnalyticsReport,
};
export default {
  getReports,
  countReports,
  createReport,
  createHistoryEntry,
  getReportById,
  deleteReport,
  getStudentRecords,
  getLiveReportContent,
  getMonthlyReport,
  getYearlyReport,
  exportAnalyticsReport,
};
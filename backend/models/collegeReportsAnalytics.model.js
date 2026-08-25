import { pool } from '../config/db.js';

const getCompaniesAnalytics = async () => {
  const totalCompaniesRes = await pool.query('SELECT COUNT(*)::INTEGER AS total FROM companies');
  const activeCompaniesRes = await pool.query(
    `SELECT COUNT(DISTINCT c.id)::INTEGER AS total
     FROM companies c
     JOIN recruitment_drives rd ON rd.company_id = c.id
     WHERE rd.status = 'active'`
  );
  const activeDrivesRes = await pool.query(
    `SELECT COUNT(*)::INTEGER AS total FROM recruitment_drives WHERE status = 'active'`
  );
  const selectionRes = await pool.query(
    `SELECT c.id, c.name,
            COUNT(DISTINCT rd.id) FILTER (WHERE rd.status = 'active') AS active_drives,
            COUNT(DISTINCT sdp.student_id) FILTER (WHERE sdp.stage = 'selected') AS selected_students
     FROM companies c
     LEFT JOIN recruitment_drives rd ON rd.company_id = c.id
     LEFT JOIN student_drive_progress sdp ON sdp.company_id = c.id
     GROUP BY c.id, c.name
     ORDER BY selected_students DESC NULLS LAST
     LIMIT 5`
  );

  return {
    totalCompanies: totalCompaniesRes.rows[0]?.total || 0,
    activeCompanies: activeCompaniesRes.rows[0]?.total || 0,
    activeDrives: activeDrivesRes.rows[0]?.total || 0,
    topCompanies: selectionRes.rows.map((row) => ({
      companyId: row.id,
      companyName: row.name,
      activeDrives: parseInt(row.active_drives, 10) || 0,
      selectedStudents: parseInt(row.selected_students, 10) || 0,
    })),
  };
};

const getDepartmentsAnalytics = async () => {
  const totalDepartmentsRes = await pool.query('SELECT COUNT(*)::INTEGER AS total FROM departments');
  const departmentsRes = await pool.query(
    `SELECT d.id, d.name, ds.total_students AS "totalStudents", ds.total_courses AS "totalCourses",
            ds.total_faculty AS "totalFaculty", ds.average_credits AS "averageCredits"
     FROM departments d
     LEFT JOIN department_statistics ds ON ds.department_id = d.id
     ORDER BY d.name ASC`
  );

  return {
    totalDepartments: totalDepartmentsRes.rows[0]?.total || 0,
    departments: departmentsRes.rows.map((row) => ({
      departmentId: row.id,
      departmentName: row.name,
      totalStudents: parseInt(row.totalStudents, 10) || 0,
      totalCourses: parseInt(row.totalCourses, 10) || 0,
      totalFaculty: parseInt(row.totalFaculty, 10) || 0,
      averageCredits: parseFloat(row.averageCredits) || 0,
    })),
  };
};

const getStudentsAnalytics = async () => {
  const totalStudentsRes = await pool.query('SELECT COUNT(*)::INTEGER AS total FROM students');
  const statusRes = await pool.query(
    `SELECT status, COUNT(*)::INTEGER AS count
     FROM students
     GROUP BY status`
  );
  const gpaRes = await pool.query('SELECT AVG(gpa)::NUMERIC(6,2) AS average_gpa FROM students');
  const skillRes = await pool.query(
    `SELECT skill, COUNT(*)::INTEGER AS count
     FROM (
       SELECT unnest(skills) AS skill
       FROM students
       WHERE skills IS NOT NULL
     ) sub
     GROUP BY skill
     ORDER BY count DESC
     LIMIT 10`
  );
  const placementStagesRes = await pool.query(
    `SELECT stage, COUNT(*)::INTEGER AS count
     FROM student_drive_progress
     GROUP BY stage`
  );

  const statusMap = statusRes.rows.reduce((acc, row) => {
    acc[row.status] = row.count;
    return acc;
  }, {});

  return {
    totalStudents: totalStudentsRes.rows[0]?.total || 0,
    averageGpa: parseFloat(gpaRes.rows[0]?.average_gpa) || 0,
    studentStatus: {
      pending: statusMap.pending || 0,
      verified: statusMap.verified || 0,
      blocked: statusMap.blocked || 0,
      other: Object.entries(statusMap).reduce((sum, [key, value]) => {
        if (!['pending', 'verified', 'blocked'].includes(key)) {
          return sum + value;
        }
        return sum;
      }, 0),
    },
    topSkills: skillRes.rows.map((row) => ({
      skill: row.skill,
      count: row.count,
    })),
    placementStages: placementStagesRes.rows.map((row) => ({
      stage: row.stage,
      count: row.count,
    })),
  };
};

export {
  getCompaniesAnalytics,
  getDepartmentsAnalytics,
  getStudentsAnalytics,
};

import { pool } from "../config/db.js";

export const getPerformanceMetrics = async (studentId) => {
  const query = `
    SELECT
      s.cgpa,
      s.placement_status,
      (SELECT COUNT(*) FROM student_skills WHERE student_id = s.id) AS total_skills,
      (SELECT COUNT(*) FROM certifications WHERE student_id = s.id) AS total_certifications,
      (SELECT COUNT(*) FROM internships WHERE student_id = s.id) AS total_internships,
      (SELECT COUNT(*) FROM projects WHERE student_id = s.id) AS total_projects,
      (SELECT COUNT(*) FROM achievements WHERE student_id = s.id) AS total_achievements,
      (SELECT AVG(attendance_percentage) FROM academic_records WHERE student_id = s.id) AS average_attendance,
      (SELECT COUNT(*) FROM placement_history WHERE student_id = s.id) AS total_applications,
      (SELECT COUNT(*) FROM placement_history WHERE student_id = s.id AND status IN ('Offered','Accepted')) AS total_offers
    FROM student_profiles s
    WHERE s.id = $1
  `;
  const { rows } = await pool.query(query, [studentId]);
  return rows[0] || null;
};

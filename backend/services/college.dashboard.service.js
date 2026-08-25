import { pool } from '../config/db.js';

// Helper to get college details by user_id
const getCollegeByUser = async (userId) => {
  const result = await pool.query('SELECT * FROM colleges WHERE user_id = $1', [userId]);
  return result.rows[0];
};

const SQL_AVG_PACKAGE = `COALESCE(AVG(NULLIF(regexp_replace(package, '[^0-9.]', '', 'g'), '')::numeric), 0)`;

export const getDashboardOverview = async (userId) => {
  try {
    const college = await getCollegeByUser(userId);
    if (!college) return { success: true, data: { totalStudents: 0, activeDrives: 0, departments: 0, placementRate: "0%" } };

    const studentsResult = await pool.query('SELECT count(*) as count FROM students WHERE college_id = $1', [college.id]);
    const totalStudents = parseInt(studentsResult.rows[0].count, 10);

    // Departments count is from colleges.departments array
    const departmentsCount = college.departments ? college.departments.length : 0;

    // Active drives: real count of drives that are currently open or upcoming
    const drivesResult = await pool.query("SELECT count(*) as count FROM placement_drives WHERE status IN ('Upcoming','Open')");
    const activeDrives = parseInt(drivesResult.rows[0].count, 10);

    // Placement Rate: number of students placed / total students
    const placedResult = await pool.query("SELECT count(*) as count FROM students WHERE college_id = $1 AND placement_status = 'Placed'", [college.id]);
    const totalPlaced = parseInt(placedResult.rows[0].count, 10);
    const placementRate = totalStudents > 0 ? Math.round((totalPlaced / totalStudents) * 100) + "%" : "0%";

    return {
      success: true,
      data: {
        totalStudents,
        activeDrives,
        departments: departmentsCount,
        placementRate,
      },
    };
  } catch (error) {
    console.error(error);
    throw new Error("Failed to fetch dashboard overview");
  }
};

export const getDashboardStats = async (userId) => {
  try {
    const college = await getCollegeByUser(userId);
    if (!college) return { success: true, data: [] };

    const studentsResult = await pool.query('SELECT count(*) as count FROM students WHERE college_id = $1', [college.id]);
    const totalStudents = parseInt(studentsResult.rows[0].count, 10);

    const placedResult = await pool.query("SELECT count(*) as count FROM students WHERE college_id = $1 AND placement_status = 'Placed'", [college.id]);
    const placements = parseInt(placedResult.rows[0].count, 10);
    const placementRate = totalStudents > 0 ? Math.round((placements / totalStudents) * 100) + "%" : "0%";

    // Active drives: real count
    const drivesResult = await pool.query("SELECT count(*) as count FROM placement_drives WHERE status IN ('Upcoming','Open')");
    const activeDrives = parseInt(drivesResult.rows[0].count, 10);

    // Companies: distinct companies that actually hired from this college
    const companiesResult = await pool.query(
      "SELECT COUNT(DISTINCT placed_at)::int as count FROM students WHERE college_id = $1 AND placement_status = 'Placed' AND placed_at IS NOT NULL AND placed_at <> ''",
      [college.id]
    );
    const companies = companiesResult.rows[0].count;

    // Faculty: sum of faculty across department statistics
    const facultyResult = await pool.query('SELECT COALESCE(SUM(total_faculty), 0)::int as count FROM department_statistics');
    const faculty = facultyResult.rows[0].count;

    // Internships: count of internships for students of this college
    const internshipsResult = await pool.query(
      `SELECT COUNT(*)::int as count
       FROM internships i
       JOIN student_profiles sp ON sp.id = i.student_id
       JOIN students s ON s.user_id = sp.user_id
       WHERE s.college_id = $1`,
      [college.id]
    );
    const internships = internshipsResult.rows[0].count;

    const stats = [
      { id: 1, title: "Total Students", value: totalStudents.toLocaleString(), change: "0%", trend: "neutral" },
      { id: 2, title: "Active Drives", value: activeDrives.toLocaleString(), change: "0%", trend: "neutral" },
      { id: 3, title: "Companies", value: companies.toLocaleString(), change: "0%", trend: "neutral" },
      { id: 4, title: "Placements", value: placements.toLocaleString(), change: "0%", trend: "neutral" },
      { id: 5, title: "Faculty", value: faculty.toLocaleString(), change: "0%", trend: "neutral" },
      { id: 6, title: "Departments", value: college?.departments?.length || 0, change: "0%", trend: "neutral" },
      { id: 7, title: "Internships", value: internships.toLocaleString(), change: "0%", trend: "neutral" },
      { id: 8, title: "Placement Rate", value: placementRate, change: "0%", trend: "neutral" }
    ];

    return {
      success: true,
      data: stats,
    };
  } catch (error) {
    console.error(error);
    throw new Error("Failed to fetch dashboard stats");
  }
};

export const getDashboardActivities = async (userId) => {
  try {
    const college = await getCollegeByUser(userId);
    if (!college) return { success: true, data: [] };

    // Fetch recently added students
    const recentStudents = await pool.query(
      'SELECT id, name, created_at FROM students WHERE college_id = $1 ORDER BY created_at DESC LIMIT 5',
      [college.id]
    );

    // Fetch recently created placement drives
    const recentDrives = await pool.query(
      'SELECT id, company, role, created_at FROM placement_drives ORDER BY created_at DESC LIMIT 5'
    );

    const activities = [
      ...recentStudents.rows.map((student) => ({
        id: `student_${student.id}`,
        type: 'student_added',
        title: 'New Student Registration',
        description: `${student.name} has registered.`,
        timestamp: student.created_at,
      })),
      ...recentDrives.rows.map((drive) => ({
        id: `drive_${drive.id}`,
        type: 'drive_created',
        title: 'New Placement Drive',
        description: `${drive.company} drive for ${drive.role}.`,
        timestamp: drive.created_at,
      })),
    ];

    return {
      success: true,
      data: activities,
    };
  } catch (error) {
    console.error(error);
    throw new Error("Failed to fetch dashboard activities");
  }
};

export const getPlacementAnalytics = async (userId) => {
  try {
    const college = await getCollegeByUser(userId);
    if (!college) {
      return { success: true, data: { totalPlacements: 0, averagePackage: 0, topRecruiters: [], placementTrends: [] } };
    }

    const statsRes = await pool.query(
      `SELECT
        COUNT(*) FILTER (WHERE placement_status = 'Placed')::int as total_placements,
        ${SQL_AVG_PACKAGE}::numeric(8,2) as average_package
       FROM students
       WHERE college_id = $1`,
      [college.id]
    );
    const stats = statsRes.rows[0];

    const trendRes = await pool.query(
      `SELECT TO_CHAR(created_at, 'Mon') as name, COUNT(*)::int as placements
       FROM students
       WHERE college_id = $1 AND placement_status = 'Placed'
       GROUP BY TO_CHAR(created_at, 'Mon'), DATE_TRUNC('month', created_at)
       ORDER BY DATE_TRUNC('month', created_at) ASC`,
      [college.id]
    );

    const recruitersRes = await pool.query(
      `SELECT placed_at as name, COUNT(*)::int as hires
       FROM students
       WHERE college_id = $1 AND placement_status = 'Placed' AND placed_at IS NOT NULL AND placed_at <> ''
       GROUP BY placed_at
       ORDER BY hires DESC
       LIMIT 5`,
      [college.id]
    );

    const placementData = {
      totalPlacements: stats.total_placements,
      averagePackage: parseFloat(stats.average_package || 0),
      topRecruiters: recruitersRes.rows,
      placementTrends: trendRes.rows,
    };
    return {
      success: true,
      data: placementData,
    };
  } catch (error) {
    console.error(error);
    throw new Error("Failed to fetch placement analytics");
  }
};

export const getRevenueAnalytics = async (userId) => {
  try {
    // Revenue is not tracked in the college module; return honest empty data.
    return {
      success: true,
      data: {
        totalRevenue: 0,
        monthlyRevenue: [],
        revenueGrowth: 0,
      },
    };
  } catch (error) {
    console.error(error);
    throw new Error("Failed to fetch revenue analytics");
  }
};

export const getAdmissionsAnalytics = async (userId) => {
  try {
    const college = await getCollegeByUser(userId);
    if (!college) {
      return { success: true, data: { totalAdmissions: 0, admissionsTrend: [], conversionRate: 0 } };
    }

    const totalRes = await pool.query(
      'SELECT COUNT(*)::int as count FROM students WHERE college_id = $1',
      [college.id]
    );

    const trendRes = await pool.query(
      `SELECT TO_CHAR(created_at, 'Mon') as month, COUNT(*)::int as admissions
       FROM students
       WHERE college_id = $1
       GROUP BY TO_CHAR(created_at, 'Mon'), DATE_TRUNC('month', created_at)
       ORDER BY DATE_TRUNC('month', created_at) ASC`,
      [college.id]
    );

    const admissionsData = {
      totalAdmissions: totalRes.rows[0].count,
      admissionsTrend: trendRes.rows,
      conversionRate: 0,
    };
    return {
      success: true,
      data: admissionsData,
    };
  } catch (error) {
    console.error(error);
    throw new Error("Failed to fetch admissions analytics");
  }
};

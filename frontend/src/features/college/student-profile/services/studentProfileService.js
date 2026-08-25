import { getStudentById } from "../../students/services/studentService";

/**
 * Maps backend student data into the structure expected by Student Profile components
 */
const mapStudentToProfile = (student) => {
  if (!student) return null;

  let technicalSkills = [];
  let softSkills = [];

  if (Array.isArray(student.skills)) {
    technicalSkills = student.skills.map((s) =>
      typeof s === "string" ? { name: s, level: "Intermediate" } : s
    );
  } else if (student.skills && typeof student.skills === "object") {
    technicalSkills = student.skills.technical || [];
    softSkills = student.skills.soft || [];
  }

  return {
    id: student.id,
    name: student.name || "Unknown Student",
    enrollmentNo: student.enrollmentNo || "N/A",
    department: student.department || "N/A",
    course: student.course || "N/A",
    semester: student.semester || 1,
    batch: student.batch || "N/A",
    cgpa: parseFloat(student.cgpa) || 0,
    attendance: student.attendance || "90%",
    placementStatus: student.placementStatus || "Eligible",
    email: student.email || "",
    phone: student.phone || "",
    address: student.address || "",
    resumeStatus: student.resumeStatus || "Not Uploaded",
    linkedin: student.linkedin || "",
    github: student.github || "",
    placedAt: student.placedAt || null,
    package: student.package || null,
    gender: student.gender || "—",
    section: student.section || "A",
    skills: {
      technical: technicalSkills,
      soft: softSkills
    },
    certifications: student.certifications || [],
    projects: student.projects || [],
    internships: student.internships || [],
    achievements: student.achievements || []
  };
};

/**
 * Generates semester performance based on student details
 */
const mapStudentToAcademics = (student) => {
  if (Array.isArray(student?.academicPerformance) && student.academicPerformance.length > 0) {
    return student.academicPerformance;
  }
  return [];
};

/**
 * Maps placement records from backend student data. Returns only real records.
 */
const mapStudentToPlacements = (student) => {
  if (Array.isArray(student?.placementHistory) && student.placementHistory.length > 0) {
    return student.placementHistory;
  }
  return [];
};

export const getStudentProfile = async (studentId) => {
  if (!studentId || String(studentId).toLowerCase() === "invalid-id") {
    throw new Error("Student Not Found");
  }
  try {
    const response = await getStudentById(studentId);
    const rawData = response?.data || response;
    if (!rawData || !rawData.id) {
      throw new Error("Student Not Found");
    }
    return mapStudentToProfile(rawData);
  } catch (error) {
    if (error.response?.status === 404 || error.message === "Student Not Found") {
      throw new Error("Student Not Found", { cause: error });
    }
    throw new Error("Failed to load student profile", { cause: error });
  }
};

export const getAcademicPerformance = async (studentId) => {
  if (!studentId || String(studentId).toLowerCase() === "invalid-id") {
    return [];
  }
  try {
    const response = await getStudentById(studentId);
    const rawData = response?.data || response;
    if (!rawData || !rawData.id) {
      return [];
    }
    return mapStudentToAcademics(rawData);
  } catch (error) {
    if (error.response?.status === 404 || error.message === "Student Not Found") {
      return [];
    }
    return [];
  }
};

export const getPlacementHistory = async (studentId) => {
  if (!studentId || String(studentId).toLowerCase() === "invalid-id") {
    return [];
  }
  try {
    const response = await getStudentById(studentId);
    const rawData = response?.data || response;
    if (!rawData || !rawData.id) {
      return [];
    }
    return mapStudentToPlacements(rawData);
  } catch (error) {
    if (error.response?.status === 404 || error.message === "Student Not Found") {
      return [];
    }
    return [];
  }
};

export const getSkills = async (studentId) => {
  const profile = await getStudentProfile(studentId);
  return profile?.skills || { technical: [], soft: [] };
};

export const getCertifications = async (studentId) => {
  const profile = await getStudentProfile(studentId);
  return profile?.certifications || [];
};

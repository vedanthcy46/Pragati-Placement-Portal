import api from "../../../../services/api";

/**
 * Student Nomination & Shortlisting API Service Layer
 *
 * DATA STRATEGY (source of truth):
 *   Primary flows — eligible students, nominations, single/bulk nominate,
 *   bulk shortlist, withdraw — are DRIVE-SCOPED and stored in
 *   drive_nominees / drive_nominations / drive_shortlists via
 *   /api/placement-drives/:id/*.
 *
 *   Legacy college-level endpoints (/api/college/nominations,
 *   /api/college/shortlists over student_nominations / shortlisted_students)
 *   remain ONLY for the aggregate statistics views and backward
 *   compatibility. They are marked @deprecated below and must not be used
 *   for new nomination mutations. See NOMINATION_DATA_STRATEGY.md.
 */

// ─── Drive-Scoped Endpoints (primary) ───────────────────────────────────────

/**
 * Fetch students eligible for a specific placement drive.
 * Drive eligibility rules (CGPA cutoff, allowed branches) are enforced
 * by the backend; results are scoped to the caller's college.
 */
export const getDriveEligibleStudents = async (driveId) => {
  try {
    const response = await api.get(`/placement-drives/${driveId}/eligible`);
    return {
      success: true,
      data: response.data.data || [],
      message: response.data.message,
    };
  } catch (err) {
    throw new Error(
      err.response?.data?.message || "Failed to fetch eligible students"
    );
  }
};

/**
 * Fetch all nominations for a specific drive (paginated).
 * @param {Object} params - { status, page, limit }
 */
export const getDriveNominations = async (driveId, params = {}) => {
  try {
    const response = await api.get(`/placement-drives/${driveId}/nominations`, { params });
    return {
      success: true,
      data: response.data.data || [],
      pagination: response.data.pagination || null,
    };
  } catch (err) {
    throw new Error(
      err.response?.data?.message || "Failed to fetch nominations"
    );
  }
};

/**
 * Nominate one or many students to a drive (single + bulk unified).
 * @param {number} driveId
 * @param {number[]} studentIds
 */
export const nominateStudentsToDrive = async (driveId, studentIds) => {
  try {
    const response = await api.post(`/placement-drives/${driveId}/nominate`, {
      studentIds: studentIds.map(Number),
    });
    return {
      success: true,
      data: response.data.data,
      message: response.data.message || "Students nominated successfully",
    };
  } catch (err) {
    throw new Error(
      err.response?.data?.message || "Failed to nominate students"
    );
  }
};

/**
 * Bulk-shortlist nominated students for a drive.
 * @param {number} driveId
 * @param {number[]} studentIds
 */
export const shortlistStudentsForDrive = async (driveId, studentIds) => {
  try {
    const response = await api.put(`/placement-drives/${driveId}/shortlist`, {
      studentIds: studentIds.map(Number),
    });
    return {
      success: true,
      data: response.data.data,
      message: response.data.message || "Students shortlisted successfully",
    };
  } catch (err) {
    throw new Error(
      err.response?.data?.message || "Failed to shortlist students"
    );
  }
};

/**
 * Mark a shortlisted student as Selected for a drive.
 */
export const selectStudentForDrive = async (driveId, studentId) => {
  try {
    const response = await api.put(`/placement-drives/${driveId}/select`, {
      studentId: Number(studentId),
    });
    return {
      success: true,
      data: response.data.data,
      message: response.data.message || "Student selected successfully",
    };
  } catch (err) {
    throw new Error(
      err.response?.data?.message || "Failed to select student"
    );
  }
};

/**
 * Withdraw a student's nomination for a drive.
 */
export const withdrawNominationFromDrive = async (driveId, studentId) => {
  try {
    const response = await api.delete(
      `/placement-drives/${driveId}/nominations/${studentId}`
    );
    return {
      success: true,
      data: response.data.data,
      message: response.data.message || "Nomination withdrawn successfully",
    };
  } catch (err) {
    throw new Error(
      err.response?.data?.message || "Failed to withdraw nomination"
    );
  }
};

// ─── Legacy Endpoints (@deprecated — statistics/back-compat only) ────────────

/** @deprecated Aggregate statistics view only — not part of the nomination flow. */
export const getNominationStatistics = async () => {
  try {
    const response = await api.get("/college/nominations/statistics");
    return {
      success: true,
      data: response.data.data || null,
    };
  } catch (err) {
    throw new Error(
      err.response?.data?.message || "Failed to fetch placement statistics"
    );
  }
};

/** @deprecated Legacy shortlist table (shortlisted_students). Used by the ShortlistedStudents panel until it is migrated to drive_shortlists. */
export const getShortlistedStudents = async (params = {}) => {
  try {
    const response = await api.get("/college/shortlists", { params });
    return {
      success: true,
      data: response.data.data || [],
      pagination: response.data.pagination || null,
    };
  } catch (err) {
    throw new Error(
      err.response?.data?.message || "Failed to fetch shortlisted students"
    );
  }
};

/** @deprecated See getShortlistedStudents. */
export const updateShortlistStatus = async (shortlistId, data) => {
  try {
    const response = await api.put(`/college/shortlists/${shortlistId}`, data);
    return {
      success: true,
      data: response.data.data,
      message: response.data.message || "Shortlist status updated",
    };
  } catch (err) {
    throw new Error(
      err.response?.data?.message || "Failed to update shortlist status"
    );
  }
};

/** @deprecated See getShortlistedStudents. */
export const removeShortlistEntry = async (shortlistId) => {
  try {
    const response = await api.delete(`/college/shortlists/${shortlistId}`);
    return {
      success: true,
      message: response.data.message || "Student removed from shortlist",
    };
  } catch (err) {
    throw new Error(
      err.response?.data?.message || "Failed to remove student from shortlist"
    );
  }
};

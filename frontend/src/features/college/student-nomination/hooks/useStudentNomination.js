import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import {
  getDriveEligibleStudents,
  getDriveNominations,
  nominateStudentsToDrive,
  shortlistStudentsForDrive,
  withdrawNominationFromDrive,
  selectStudentForDrive,
} from "../services/studentNominationService";
import { validateDuplicateNomination } from "../validations/studentNominationValidation";

// ─── Query Keys Definition ───────────────────────────────────────────────────
export const nominationQueryKeys = {
  all: ["nominations"],
  eligible: (driveId) => ["nominations", "eligible", driveId || "none"],
  nominated: (driveId, params) => ["nominations", "nominated", driveId || "none", params],
};

// ─── Normalizer Helpers ──────────────────────────────────────────────────────
const normaliseEligible = (s) => ({
  ...s,
  id: s.id || s.student_id,
  student_id: s.student_id || s.id,
  name: s.name || `${s.first_name || ""} ${s.last_name || ""}`.trim() || "—",
  enrollmentNo: s.enrollment_no || s.enrollmentNo || "—",
  placementStatus: s.placement_status || s.status || "Eligible",
  company: s.company_name || s.company || "—",
  // Per-drive state, not a static label: the backend flags students who
  // already hold an active nomination on THIS drive.
  status: s.already_nominated ? "Nominated" : "Eligible",
  alreadyNominated: Boolean(s.already_nominated),
  timeline: {
    nominated: s.nomination_date
      ? new Date(s.nomination_date).toLocaleDateString("en-IN")
      : "—",
  },
});

const normaliseNomination = (n) => ({
  ...n,
  id: n.student_id ?? n.id,
  nominationRowId: n.id,
  drive_id: n.drive_id,
  student_id: n.student_id,
  name: n.student_name || n.name || "—",
  enrollmentNo: n.enrollment_no || n.enrollmentNo || "—",
  company: n.company || n.company_name || "—",
  role: n.role || "",
  package: n.package || "",
  status: n.status || "Nominated",
  timeline: {
    nominated: n.nominated_at
      ? new Date(n.nominated_at).toLocaleDateString("en-IN")
      : (n.nomination_date
        ? new Date(n.nomination_date).toLocaleDateString("en-IN")
        : "—"),
  },
});

/**
 * Drive-scoped React Query hook powering the Student Nomination page.
 * Every query and mutation requires a selected placement drive; the
 * selected driveId is part of the actual API request (never UI-only).
 *
 * @param {string|number|null} selectedDriveId - active placement drive id
 */
const useStudentNomination = (selectedDriveId = null) => {
  const queryClient = useQueryClient();

  const invalidateNominationQueries = () => {
    queryClient.invalidateQueries({ queryKey: nominationQueryKeys.all });
  };

  // ─── 1. Eligible students for THIS drive ──────────────────────────────────
  const eligibleQuery = useQuery({
    queryKey: nominationQueryKeys.eligible(selectedDriveId),
    queryFn: async () => {
      const res = await getDriveEligibleStudents(selectedDriveId);
      return (res.data || []).map(normaliseEligible);
    },
    enabled: !!selectedDriveId,
    placeholderData: keepPreviousData,
  });

  // ─── 2. Nominations for THIS drive ────────────────────────────────────────
  const nominatedQuery = useQuery({
    queryKey: nominationQueryKeys.nominated(selectedDriveId),
    queryFn: async () => {
      const res = await getDriveNominations(selectedDriveId);
      return {
        data: (res.data || []).map(normaliseNomination),
        pagination: res.pagination || null,
      };
    },
    enabled: !!selectedDriveId,
    placeholderData: keepPreviousData,
  });

  // ─── 3. Nominate (single + bulk unified) ─────────────────────────────────
  const nominateMutation = useMutation({
    mutationFn: ({ studentIds }) =>
      nominateStudentsToDrive(Number(selectedDriveId), studentIds),
    onSuccess: invalidateNominationQueries,
  });

  // ─── 4. Bulk shortlist ───────────────────────────────────────────────────
  const shortlistMutation = useMutation({
    mutationFn: ({ studentIds }) =>
      shortlistStudentsForDrive(Number(selectedDriveId), studentIds),
    onSuccess: invalidateNominationQueries,
  });

  // ─── 5. Withdraw nomination ──────────────────────────────────────────────
  const withdrawMutation = useMutation({
    mutationFn: ({ studentId }) =>
      withdrawNominationFromDrive(Number(selectedDriveId), studentId),
    onSuccess: invalidateNominationQueries,
  });

  // ─── 6. Mark selected (Shortlisted → Selected) ───────────────────────────
  const selectMutation = useMutation({
    mutationFn: ({ studentId }) =>
      selectStudentForDrive(Number(selectedDriveId), studentId),
    onSuccess: invalidateNominationQueries,
  });

  const requireDriveAndIds = (studentIds, actionLabel) => {
    if (!selectedDriveId) {
      return { success: false, message: "Please select a placement drive first." };
    }
    if (!studentIds || studentIds.length === 0) {
      return { success: false, message: `Select at least one candidate to ${actionLabel}.` };
    }
    return null;
  };

  // ─── Consumer Wrapper Methods ──────────────────────────────────────────────

  /**
   * Single-student nomination against the selected drive.
   * Accepts a student object (uses its id/student_id).
   */
  const nominateStudent = async (studentData) => {
    const studentId = Number(
      studentData?.student_id || studentData?.id || studentData?.studentId
    );
    const guard = requireDriveAndIds([studentId], "nominate");
    if (guard) return guard;

    const duplicate = validateDuplicateNomination(
      studentId,
      nominatedQuery.data?.data || []
    );
    if (duplicate.isDuplicate && studentData?.alreadyNominated !== false) {
      // Drive-scoped eligible rows already flag existing nominations.
      if (studentData?.alreadyNominated) {
        return { success: false, message: duplicate.message };
      }
    }

    try {
      const res = await nominateMutation.mutateAsync({ studentIds: [studentId] });
      return { success: true, data: res.data, message: res.message };
    } catch (err) {
      return { success: false, message: err.message || "Unable to complete nomination." };
    }
  };

  /** Bulk nomination of the given student ids against the selected drive. */
  const bulkNominate = async (studentIds) => {
    const guard = requireDriveAndIds(studentIds, "nominate");
    if (guard) return guard;
    try {
      const res = await nominateMutation.mutateAsync({
        studentIds: studentIds.map(Number),
      });
      const skipped = res.data?.skipped || [];
      const skippedMsg = skipped.length
        ? ` (${skipped.length} skipped: ${skipped[0].reason}${skipped.length > 1 ? "…" : ""})`
        : "";
      return { success: true, data: res.data, message: `${res.message}${skippedMsg}` };
    } catch (err) {
      return { success: false, message: err.message || "Bulk nomination failed." };
    }
  };

  /** Bulk shortlist of nominated students within the selected drive only. */
  const bulkShortlist = async (studentIds) => {
    const guard = requireDriveAndIds(studentIds, "shortlist");
    if (guard) return guard;
    try {
      const res = await shortlistMutation.mutateAsync({
        studentIds: studentIds.map(Number),
      });
      const skipped = res.data?.skipped || [];
      const skippedMsg = skipped.length
        ? ` (${skipped.length} skipped — no active nomination on this drive)`
        : "";
      return { success: true, data: res.data, message: `${res.message}${skippedMsg}` };
    } catch (err) {
      return { success: false, message: err.message || "Bulk shortlisting failed." };
    }
  };

  /** Withdraw a student's nomination from the selected drive. */
  const removeNomination = async (studentId) => {
    if (!selectedDriveId) {
      return { success: false, message: "Please select a placement drive first." };
    }
    try {
      const res = await withdrawMutation.mutateAsync({ studentId: Number(studentId) });
      return { success: true, data: res.data, message: res.message };
    } catch (err) {
      return { success: false, message: err.message || "Unable to remove nomination." };
    }
  };

  /** Mark a shortlisted student as Selected within the selected drive. */
  const selectStudent = async (studentId) => {
    if (!selectedDriveId) {
      return { success: false, message: "Please select a placement drive first." };
    }
    try {
      const res = await selectMutation.mutateAsync({ studentId: Number(studentId) });
      return { success: true, data: res.data, message: res.message || "Student selected successfully" };
    } catch (err) {
      return { success: false, message: err.message || "Failed to select student." };
    }
  };

  // Loading & Error composite state
  const loading =
    eligibleQuery.isLoading ||
    nominatedQuery.isLoading ||
    nominateMutation.isPending ||
    shortlistMutation.isPending ||
    withdrawMutation.isPending ||
    selectMutation.isPending;

  const error =
    eligibleQuery.error?.message ||
    nominatedQuery.error?.message ||
    null;

  return {
    // Data lists
    eligibleStudents: eligibleQuery.data || [],
    nominatedStudents: nominatedQuery.data?.data || [],
    nominatedPagination: nominatedQuery.data?.pagination || null,

    // Loading & Error States
    loading,
    isFetching: eligibleQuery.isFetching || nominatedQuery.isFetching,
    error,

    // Action Methods
    nominateStudent,
    bulkNominate,
    bulkShortlist,
    removeNomination,
    selectStudent,

    // Query Refetch Trigger
    refreshData: invalidateNominationQueries,
  };
};

export default useStudentNomination;

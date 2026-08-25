import { useState, useEffect, useCallback } from "react";
import * as service from "../services/reportsService";

export const useReports = (initialParams = {}) => {
  const [reports, setReports] = useState([]);
  const [statistics, setStatistics] = useState({
    totalReports: 0,
    generatedToday: 0,
    downloadedReports: 0,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all reports
  const fetchReports = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await service.getReports();

      if (response?.success) {
        setReports(response?.data?.reports || []);
        setStatistics(
          response?.data?.reportStatistics || {
            totalReports: 0,
            generatedToday: 0,
            downloadedReports: 0,
          }
        );
      } else {
        setReports([]);
        setStatistics({
          totalReports: 0,
          generatedToday: 0,
          downloadedReports: 0,
        });
      }
    } catch {
      setReports([]);
      setStatistics({
        totalReports: 0,
        generatedToday: 0,
        downloadedReports: 0,
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Generate a new report
  const createReport = useCallback(
    async (formData) => {
      setIsGenerating(true);
      setError(null);

      try {
        const response = await service.generateReport(formData);

        if (!response?.success) {
          throw new Error(
            response?.message || "Unable to create report."
          );
        }

        // Refresh reports after successful generation
        await fetchReports();

        return {
          success: true,
          report: response?.data,
        };
      } catch (err) {
        console.error("Generate report error:", err);

        const errorMessage =
          err?.response?.data?.message ||
          err?.message ||
          "Failed to generate report.";

        setError(errorMessage);

        return {
          success: false,
          error: errorMessage,
        };
      } finally {
        setIsGenerating(false);
      }
    },
    [fetchReports]
  );

  // Delete report
  const removeReport = useCallback(
    async (id) => {
      if (!id) {
        const errorMessage = "Report ID is required.";
        setError(errorMessage);

        return {
          success: false,
          error: errorMessage,
        };
      }

      setIsDeleting(true);
      setError(null);

      try {
        const response = await service.deleteReport(id);

        if (!response?.success) {
          throw new Error(
            response?.message || "Unable to delete report."
          );
        }

        // Refresh reports after deletion
        await fetchReports();

        return {
          success: true,
        };
      } catch (err) {
        console.error("Delete report error:", err);

        const errorMessage =
          err?.response?.data?.message ||
          err?.message ||
          "Failed to delete report.";

        setError(errorMessage);

        return {
          success: false,
          error: errorMessage,
        };
      } finally {
        setIsDeleting(false);
      }
    },
    [fetchReports]
  );

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Initial fetch
  useEffect(() => {
    const loadReports = async () => {
      await fetchReports();
    };

    loadReports();
  }, [fetchReports]);

  return {
    reports,
    statistics,

    // Loading states
    isLoading,
    isGenerating,
    isDeleting,

    // Error
    error,
    clearError,

    // Actions
    fetchReports,
    createReport,
    removeReport,
  };
};

export default useReports;
import { useState, useCallback } from "react";
import * as service from "../services/reportsService";
import { validateExport } from "../validations/reportsValidation";

export const useExportReports = (onExportSuccess) => {
  const [exportingId, setExportingId] = useState(null);
  const [exportingType, setExportingType] = useState(null);
  const [error, setError] = useState(null);

  /**
   * Common export handler
   */
  const handleExport = useCallback(
    async (report, type, exportFunction) => {
      if (!report?.id) {
        setError("Report ID is missing.");
        return {
          success: false,
          error: "Report ID is missing.",
        };
      }

      const validation = validateExport(report, type);

      if (!validation.isValid) {
        const validationError = Object.values(validation.errors).join(" ");

        setError(validationError);

        return {
          success: false,
          error: validationError,
        };
      }

      setExportingId(report.id);
      setExportingType(type);
      setError(null);

      try {
        const response = await exportFunction(report.id);

        if (!response?.success) {
          throw new Error(
            response?.message || `Failed to export as ${type}.`
          );
        }

        if (onExportSuccess) {
          onExportSuccess(response);
        }

        return {
          success: true,
          data: response?.data,
        };
      } catch (err) {
        console.error(`${type} export error:`, err);

        const errorMessage =
          err?.response?.data?.message ||
          err?.message ||
          `Failed to export as ${type}.`;

        setError(errorMessage);

        return {
          success: false,
          error: errorMessage,
        };
      } finally {
        setExportingId(null);
        setExportingType(null);
      }
    },
    [onExportSuccess]
  );

  /**
   * Export PDF
   */
  const exportPDF = useCallback(
    async (report) => {
      return handleExport(report, "PDF", async (id) => {
        return await service.exportPDF(id);
      });
    },
    [handleExport]
  );

  /**
   * Export Excel
   */
  const exportExcel = useCallback(
    async (report) => {
      return handleExport(report, "EXCEL", async (id) => {
        return await service.exportExcel(id);
      });
    },
    [handleExport]
  );

  /**
   * Export CSV
   */
  const exportCSV = useCallback(
    async (report) => {
      return handleExport(report, "CSV", async (id) => {
        return await service.exportCSV(id);
      });
    },
    [handleExport]
  );

  /**
   * Download generated report
   */
  const downloadReportFile = useCallback(
    async (report) => {
      if (!report?.id) {
        const errorMessage = "Report ID is missing.";
        setError(errorMessage);

        return {
          success: false,
          error: errorMessage,
        };
      }

      setExportingId(report.id);
      setExportingType("DOWNLOAD");
      setError(null);

      try {
        const response = await service.downloadReport(report.id);

        if (!response?.success) {
          throw new Error(
            response?.message || "Failed to download report."
          );
        }

        if (onExportSuccess) {
          onExportSuccess(response);
        }

        return {
          success: true,
          data: response?.data,
        };
      } catch (err) {
        console.error("Download report error:", err);

        const errorMessage =
          err?.response?.data?.message ||
          err?.message ||
          "Failed to download report.";

        setError(errorMessage);

        return {
          success: false,
          error: errorMessage,
        };
      } finally {
        setExportingId(null);
        setExportingType(null);
      }
    },
    [onExportSuccess]
  );

  /**
   * Print report
   */
  const printReport = useCallback((report) => {
    if (!report) {
      setError("Report information is missing.");
      return;
    }

    const printWindow = window.open("", "_blank");

    if (!printWindow) {
      setError("Popup blocker prevented opening the print window.");
      return;
    }

    const dateStr = report.generatedOn
      ? new Date(report.generatedOn).toLocaleDateString()
      : "N/A";

    const escapeHtml = (value) => {
      if (value === null || value === undefined) {
        return "";
      }

      return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    };

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${escapeHtml(report.reportName || "Report")}</title>

          <style>
            * {
              box-sizing: border-box;
            }

            body {
              font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
              padding: 40px;
              color: #1e293b;
              line-height: 1.5;
            }

            .header {
              display: flex;
              justify-content: space-between;
              border-bottom: 2px solid #e2e8f0;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }

            .logo {
              font-size: 24px;
              font-weight: bold;
              color: #ff6d34;
            }

            .meta {
              font-size: 14px;
              text-align: right;
              color: #64748b;
            }

            .title {
              font-size: 28px;
              font-weight: bold;
              color: #0f172a;
              margin-top: 0;
            }

            .details-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 20px;
              margin-bottom: 40px;
              background: #f8fafc;
              padding: 20px;
              border-radius: 8px;
              border: 1px solid #e2e8f0;
            }

            .detail-item {
              font-size: 14px;
            }

            .detail-label {
              font-weight: 600;
              color: #64748b;
              margin-bottom: 4px;
            }

            .detail-val {
              font-size: 16px;
              color: #0f172a;
              font-weight: 500;
            }

            .section-title {
              font-size: 20px;
              font-weight: 600;
              color: #0f172a;
              border-bottom: 1px solid #e2e8f0;
              padding-bottom: 8px;
              margin-top: 30px;
              margin-bottom: 15px;
            }

            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 15px;
            }

            th {
              background: #f1f5f9;
              text-align: left;
              padding: 10px;
              font-size: 13px;
              font-weight: 600;
              border-bottom: 2px solid #e2e8f0;
            }

            td {
              padding: 10px;
              font-size: 13px;
              border-bottom: 1px solid #e2e8f0;
            }

            .footer {
              margin-top: 60px;
              font-size: 12px;
              text-align: center;
              color: #94a3b8;
              border-top: 1px solid #e2e8f0;
              padding-top: 15px;
            }

            @media print {
              body {
                padding: 0;
              }
            }
          </style>
        </head>

        <body>

          <div class="header">

            <div>
              <div class="logo">
                UpToSkills
              </div>

              <div style="font-size: 12px; color: #64748b;">
                AI-Powered Placement & Training
              </div>
            </div>

            <div class="meta">
              <div>
                <strong>Generated:</strong>
                ${escapeHtml(dateStr)}
              </div>

              <div>
                <strong>Operator:</strong>
                ${escapeHtml(report.generatedBy || "N/A")}
              </div>

              <div>
                <strong>Status:</strong>
                ${escapeHtml(report.status || "N/A")}
              </div>
            </div>

          </div>

          <h1 class="title">
            ${escapeHtml(report.reportName || "Report")}
          </h1>

          <p style="color: #475569; margin-bottom: 25px;">
            ${escapeHtml(report.description || "")}
          </p>

          <div class="details-grid">

            <div class="detail-item">
              <div class="detail-label">
                Report Type
              </div>

              <div class="detail-val">
                ${escapeHtml(report.type || "N/A")}
              </div>
            </div>

            <div class="detail-item">
              <div class="detail-label">
                Department Scope
              </div>

              <div class="detail-val">
                ${escapeHtml(report.department || "All Departments")}
              </div>
            </div>

            <div class="detail-item">
              <div class="detail-label">
                Target Company
              </div>

              <div class="detail-val">
                ${escapeHtml(report.company || "All Companies")}
              </div>
            </div>

            <div class="detail-item">
              <div class="detail-label">
                Batch Year
              </div>

              <div class="detail-val">
                ${escapeHtml(report.batch || "All")}
              </div>
            </div>

          </div>

          <div class="section-title">
            Report Content Preview
          </div>

          <p style="font-size: 13px; color: #64748b;">
            Below is a structured representation of the generated report metadata.
            Use the official downloads for spreadsheet analytics.
          </p>

          <table>

            <thead>
              <tr>
                <th>Report ID</th>
                <th>Report Name</th>
                <th>Category</th>
                <th>Size</th>
                <th>Downloads</th>
                <th>Generated On</th>
              </tr>
            </thead>

            <tbody>

              <tr>
                <td>
                  #${escapeHtml(report.id)}
                </td>

                <td>
                  <strong>
                    ${escapeHtml(report.reportName || "N/A")}
                  </strong>
                </td>

                <td>
                  ${escapeHtml(report.type || "N/A")}
                </td>

                <td>
                  ${escapeHtml(report.size || "N/A")}
                </td>

                <td>
                  ${escapeHtml(report.downloadCount || 0)} downloads
                </td>

                <td>
                  ${escapeHtml(report.generatedOn || "N/A")}
                </td>
              </tr>

            </tbody>

          </table>

          <div class="footer">
            © ${new Date().getFullYear()} UpToSkills.
            Generated via Placement Portal Admin Console.
            All rights reserved.
          </div>

          <script>
            window.onload = function () {
              window.print();

              setTimeout(function () {
                window.close();
              }, 500);
            };
          </script>

        </body>
      </html>
    `);

    printWindow.document.close();
  }, []);

  /**
   * Clear error
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    exportingId,
    exportingType,
    error,

    exportPDF,
    exportExcel,
    exportCSV,
    downloadReportFile,
    printReport,

    clearError,
  };
};

export default useExportReports;

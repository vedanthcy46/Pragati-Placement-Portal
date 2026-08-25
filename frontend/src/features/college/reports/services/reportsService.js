import api from "../../../../services/api";

const downloadBlob = (blob, filename, contentType) => {
  const safeBlob = blob instanceof Blob ? blob : new Blob([blob], { type: contentType || "application/octet-stream" });
  const url = window.URL.createObjectURL(safeBlob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

const getDownloadFilename = (contentDisposition, fallback) => {
  const header = contentDisposition || "";
  const match = header.match(/filename\*=(?:UTF-8'')?([^;]+)/i) || header.match(/filename="?([^";]+)"?/i);
  if (match?.[1]) {
    return decodeURIComponent(match[1]);
  }
  return fallback;
};

// Map frontend report type to backend report type
const mapTypeToBackend = (type) => {
  if (!type) return "PLACEMENTS";

  const mapping = {
    placement: "PLACEMENTS",
    placements: "PLACEMENTS",
    student: "STUDENTS",
    students: "STUDENTS",
    company: "COMPANIES",
    companies: "COMPANIES",
    department: "DEPARTMENTS",
    departments: "DEPARTMENTS",
    analytics: "DASHBOARD",
    dashboard: "DASHBOARD",
    drive: "DRIVES",
    drives: "DRIVES",
  };

  return mapping[String(type).toLowerCase()] || type;
};

// Map backend report to the format expected by the frontend
const mapBackendReportToFrontend = (report) => {
  if (!report) return null;

  const content = report.content || {};

  return {
    id: report.id,

    reportName:
      report.title ||
      report.reportName ||
      "Untitled Report",

    type: report.type || "PLACEMENTS",

    generatedOn:
      report.createdAt ||
      report.generatedAt ||
      new Date().toISOString(),

    status:
      report.status ||
      "Completed",

    department:
      content.department ||
      report.department ||
      "All",

    company:
      content.company ||
      report.company ||
      "All",

    batch:
      content.batch ||
      report.batch ||
      "All",

    downloadCount:
      content.downloadCount ||
      report.downloadCount ||
      0,

    size:
      content.size ||
      report.size ||
      "N/A",

    generatedBy:
      content.generatedBy ||
      report.generatedBy ||
      "System",

    description:
      content.description ||
      report.description ||
      `Report details compiled for ${
        report.title || report.reportName || "this report"
      }`,
  };
};


/*
|--------------------------------------------------------------------------
| GET REPORTS
|--------------------------------------------------------------------------
| GET /api/reports
*/
export const getReports = async () => {
  const token = localStorage.getItem("token") || sessionStorage.getItem("token");

  if (!token) {
    return {
      success: false,
      data: {
        reports: [],
        reportStatistics: {
          totalReports: 0,
          generatedToday: 0,
          downloadedReports: 0,
        },
      },
      message: "Not authenticated",
    };
  }

  try {
    const response = await api.get("/reports", {
      validateStatus: (status) => status < 500,
      timeout: 4000,
    });

    const responseData = response?.data || {};
    const payload = responseData.data ?? responseData;
    const data = payload && typeof payload === "object" ? payload : {};

    const reports = Array.isArray(data.reports)
      ? data.reports
      : [];

  const mappedReports = reports
    .map(mapBackendReportToFrontend)
    .filter(Boolean);

    const today = new Date().toISOString().split("T")[0];

    const generatedToday = mappedReports.filter((report) => {
      const generatedDate = report.generatedOn
        ? new Date(report.generatedOn)
            .toISOString()
            .split("T")[0]
        : null;

      return generatedDate === today;
    }).length;

    const downloadedReports = mappedReports.reduce(
      (total, report) =>
        total + Number(report.downloadCount || 0),
      0
    );

    return {
      success: responseData.success !== false,
      data: {
        reports: mappedReports,
        reportStatistics: {
          totalReports: data.total ?? mappedReports.length,
          generatedToday,
          downloadedReports,
        },
      },
    };
  } catch (error) {
    const status = error?.response?.status;
    const message =
      error?.code === "ECONNABORTED" || error?.message?.includes("timeout")
        ? "Reports service unavailable"
        : error?.response?.data?.message || error?.message || "Failed to load reports";

    return {
      success: false,
      data: {
        reports: [],
        reportStatistics: {
          totalReports: 0,
          generatedToday: 0,
          downloadedReports: 0,
        },
      },
      message: status === 401 ? "Not authenticated" : message,
    };
  }
};


/*
|--------------------------------------------------------------------------
| GENERATE REPORT
|--------------------------------------------------------------------------
| POST /api/reports/generate
*/
export const generateReport = async (reportData) => {
  const payload = {
    title:
      reportData.reportName ||
      reportData.title,

    type: mapTypeToBackend(reportData.type),

    format:
      reportData.format ||
      "json",

    content: {
      department:
        reportData.department || "All",

      company:
        reportData.company || "All",

      batch:
        reportData.batch || "All",

      description:
        reportData.description || "",

      generatedBy:
        reportData.generatedBy ||
        "Placement Portal Admin",
    },
  };

  const response = await api.post(
    "/reports/generate",
    payload
  );

  const responseData = response?.data || {};

  return {
    success:
      responseData.success !== false,

    data: mapBackendReportToFrontend(
      responseData.data
    ),
  };
};


/*
|--------------------------------------------------------------------------
| DELETE REPORT
|--------------------------------------------------------------------------
| DELETE /api/reports/:id
*/
export const deleteReport = async (id) => {
  if (!id) {
    throw new Error("Report ID is required.");
  }

  const response = await api.delete(
    `/reports/${id}`
  );

  const responseData = response?.data || {};

  return {
    success:
      responseData.success !== false,

    data: {
      id,
    },

    message:
      responseData.message ||
      "Report deleted successfully.",
  };
};


/*
|--------------------------------------------------------------------------
| PREVIEW REPORT
|--------------------------------------------------------------------------
| GET /api/reports/:id/preview
*/
export const previewReport = async (id) => {
  if (!id) {
    throw new Error("Report ID is required.");
  }

  const response = await api.get(
    `/reports/${id}/preview`
  );

  const responseData = response?.data || {};

  if (responseData.success === false) {
    throw new Error(
      responseData.message ||
        "Failed to load report preview."
    );
  }

  const reportData =
    responseData.data || responseData;

  return {
    success: true,

    data: mapBackendReportToFrontend(
      reportData
    ),
  };
};


/*
|--------------------------------------------------------------------------
| DOWNLOAD REPORT
|--------------------------------------------------------------------------
| GET /api/reports/:id/download
*/
export const downloadReport = async (id) => {
  if (!id) {
    throw new Error("Report ID is required.");
  }

  const response = await api.get(`/reports/${id}/download`, {
    responseType: "blob",
    params: { format: "pdf" },
  });

  const contentType = response?.headers?.["content-type"] || "application/pdf";
  const filename = getDownloadFilename(
    response?.headers?.["content-disposition"],
    `report_${id}.pdf`
  );

  downloadBlob(response?.data, filename, contentType);

  return {
    success: true,
    data: {
      filename,
      contentType,
    },
  };
};


/*
|--------------------------------------------------------------------------
| REPORT HISTORY
|--------------------------------------------------------------------------
| GET /api/reports/history
*/
export const getHistory = async () => {
  const response = await api.get(
    "/reports/history"
  );

  const responseData = response?.data || {};

  return {
    success:
      responseData.success !== false,

    data:
      responseData.data || [],
  };
};


/*
|--------------------------------------------------------------------------
| GET EXPORTS
|--------------------------------------------------------------------------
| GET /api/reports/exports
*/
export const getExports = async () => {
  const response = await api.get(
    "/reports/exports"
  );

  const responseData = response?.data || {};

  return {
    success:
      responseData.success !== false,

    data:
      responseData.data || [],
  };
};


/*
|--------------------------------------------------------------------------
| CREATE EXPORT
|--------------------------------------------------------------------------
| POST /api/reports/exports
|--------------------------------------------------------------------------
| Used to request/record an export.
*/
export const createExportRecord = async (
  payload
) => {
  if (!payload?.reportId) {
    throw new Error(
      "Report ID is required to create an export."
    );
  }

  const response = await api.post(
    "/reports/exports",
    payload
  );

  const responseData = response?.data || {};

  if (responseData.success === false) {
    throw new Error(
      responseData.message ||
        "Failed to create export."
    );
  }

  return {
    success: true,

    data:
      responseData.data || responseData,
  };
};


/*
|--------------------------------------------------------------------------
| EXPORT REPORT
|--------------------------------------------------------------------------
| POST /api/reports/exports
|--------------------------------------------------------------------------
| This is the common export API.
|
| format can be:
| - pdf
| - excel
| - csv
*/
export const exportReport = async (
  reportId,
  format
) => {
  if (!reportId) {
    throw new Error("Report ID is required.");
  }

  if (!format) {
    throw new Error("Export format is required.");
  }

  const normalizedFormat =
    String(format).toLowerCase();

  const allowedFormats = [
    "pdf",
    "excel",
    "csv",
  ];

  if (!allowedFormats.includes(normalizedFormat)) {
    throw new Error(
      `Unsupported export format: ${format}`
    );
  }

  return createExportRecord({
    reportId: Number(reportId),
    format: normalizedFormat,
  });
};


/*
|--------------------------------------------------------------------------
| EXPORT PDF
|--------------------------------------------------------------------------
| Uses POST /api/reports/exports
*/
export const exportPDF = async (id) => {
  if (!id) {
    throw new Error("Report ID is required.");
  }

  const response = await api.get(`/reports/${id}/export/pdf`, {
    responseType: "blob",
  });

  const contentType = response?.headers?.["content-type"] || "application/pdf";
  const filename = getDownloadFilename(
    response?.headers?.["content-disposition"],
    `report_${id}.pdf`
  );

  downloadBlob(response?.data, filename, contentType);

  return {
    success: true,
    data: {
      filename,
      contentType,
    },
  };
};


/*
|--------------------------------------------------------------------------
| EXPORT EXCEL
|--------------------------------------------------------------------------
| Uses GET /api/reports/:id/export/excel
*/
export const exportExcel = async (id) => {
  if (!id) {
    throw new Error("Report ID is required.");
  }

  const response = await api.get(`/reports/${id}/export/excel`, {
    responseType: "blob",
  });

  const contentType = response?.headers?.["content-type"] || "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
  const filename = getDownloadFilename(
    response?.headers?.["content-disposition"],
    `report_${id}.xlsx`
  );

  downloadBlob(response?.data, filename, contentType);

  return {
    success: true,
    data: {
      filename,
      contentType,
    },
  };
};


/*
|--------------------------------------------------------------------------
| EXPORT CSV
|--------------------------------------------------------------------------
| Uses GET /api/reports/:id/export/csv
*/
export const exportCSV = async (id) => {
  if (!id) {
    throw new Error("Report ID is required.");
  }

  const response = await api.get(`/reports/${id}/export/csv`, {
    responseType: "blob",
  });

  const contentType = response?.headers?.["content-type"] || "text/csv; charset=utf-8";
  const filename = getDownloadFilename(
    response?.headers?.["content-disposition"],
    `report_${id}.csv`
  );

  downloadBlob(response?.data, filename, contentType);

  return {
    success: true,
    data: {
      filename,
      contentType,
    },
  };
};

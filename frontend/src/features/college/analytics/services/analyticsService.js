import api from "../../../../services/api";
import { API_ENDPOINTS } from "../constants/analyticsConstants";

const parseCSV = (csvText) => {
  if (!csvText) return [];
  const lines = csvText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
  if (lines.length === 0) return [];

  const headers = lines[0]
    .split(",")
    .map((h) => h.replace(/^["']|["']$/g, "").trim());

  const result = [];
  for (let i = 1; i < lines.length; i++) {
    const currentLine = lines[i]
      .split(",")
      .map((val) => val.replace(/^["']|["']$/g, "").trim());
    if (currentLine.length === headers.length) {
      const obj = {};
      for (let j = 0; j < headers.length; j++) {
        obj[headers[j]] = currentLine[j];
      }
      result.push(obj);
    }
  }
  return result;
};

export const getDashboardAnalytics = async (params = {}) => {
  const { data } = await api.get(API_ENDPOINTS.DASHBOARD, { params });
  if (data?.success && data.data) {
    const raw = data.data;

    data.data = {
      ...raw,
      totalStudents: raw.total_students,
      totalPlaced: raw.total_placed,
      placementRate:
        typeof raw.placement_rate === "number"
          ? `${raw.placement_rate}%`
          : raw.placement_rate,
      averagePackage:
        typeof raw.average_package === "number"
          ? `${raw.average_package} LPA`
          : raw.average_package,
      topRecruiter: raw.top_recruiter,
      activeDrives: raw.active_drives,
      totalCompanies: raw.total_companies,
      packageDistribution: Array.isArray(raw.packageDistribution)
        ? raw.packageDistribution
        : [],
      monthlyHiring: Array.isArray(raw.monthlyHiring)
        ? raw.monthlyHiring
        : [],
    };
  }
  return data;
};

export const getOverviewStatistics = async (params = {}) => {
  const { data } = await api.get(API_ENDPOINTS.OVERVIEW, { params });
  if (data?.success && data.data) {
    const raw = data.data;
    data.data = {
      ...raw,
      totalStudents: raw.total_students,
      totalPlaced: raw.total_placed,
      placementRate:
        typeof raw.placement_rate === "number"
          ? `${raw.placement_rate}%`
          : raw.placement_rate,
      averagePackage:
        typeof raw.average_package === "number"
          ? `${raw.average_package} LPA`
          : raw.average_package,
      topRecruiter: raw.top_recruiter,
      activeDrives: raw.active_drives,
      totalCompanies: raw.total_companies,
    };
  }
  return data;
};

export const getPlacementAnalytics = async (params = {}) => {
  const { data } = await api.get(API_ENDPOINTS.PLACEMENTS, { params });
  if (data?.success && Array.isArray(data.data)) {
    data.data = data.data.map((item) => ({
      ...item,
      month: String(item.year || ""),
      placed: item.total_placed || 0,
      rate: item.placement_rate || 0,
      avgPkg: item.average_package || 0,
      maxPkg: item.highest_package || 0,
      year: item.year,
      totalStudents: item.total_students,
      total_students: item.total_students,
      total_placed: item.total_placed,
      placement_rate: item.placement_rate,
      average_package: item.average_package,
      highest_package: item.highest_package,
    }));
  }
  return data;
};

export const getPlacementTrends = async (params = {}) => {
  const { data } = await api.get(API_ENDPOINTS.PLACEMENT_TRENDS, { params });
  if (data?.success && Array.isArray(data.data)) {
    data.data = data.data.map((item) => ({
      ...item,
      month: String(item.year || ""),
      placed: item.total_placed || 0,
      rate: item.placement_rate || 0,
      avgPkg: item.average_package || 0,
      maxPkg: item.highest_package || 0,
    }));
  }
  return data;
};

export const getCompanyAnalytics = async (params = {}) => {
  const { data } = await api.get(API_ENDPOINTS.COMPANIES, { params });
  if (data?.success && Array.isArray(data.data)) {
    data.data = data.data.map((item) => ({
      ...item,
      company: item.company_name || "",
      offers: item.total_hired || 0,
      company_name: item.company_name,
      total_hired: item.total_hired,
      average_package: item.average_package,
    }));
  }
  return data;
};

export const getDepartmentAnalytics = async (params = {}) => {
  const { data } = await api.get(API_ENDPOINTS.DEPARTMENTS, { params });
  if (data?.success && Array.isArray(data.data)) {
    data.data = data.data.map((item) => ({
      ...item,
      dept: item.department_code || item.department_name || "",
      rate: item.placement_rate || 0,
      department_name: item.department_name,
      department_code: item.department_code,
      total_students: item.total_students,
      total_placed: item.total_placed,
      placement_rate: item.placement_rate,
      average_package: item.average_package,
    }));
  }
  return data;
};

export const getStudentAnalytics = async (params = {}) => {
  const { data } = await api.get(API_ENDPOINTS.STUDENTS, { params });
  if (data?.success && data.data) {
    data.data.studentPerformance = Array.isArray(data.data.studentPerformance)
      ? data.data.studentPerformance
      : [];
  }
  return data;
};

export const getCompanyReport = async (params = {}) => {
  const { data } = await api.get(API_ENDPOINTS.COMPANY_REPORT, { params });
  if (data?.success && data?.data?.report) {
    const parsed = parseCSV(data.data.report);
    return {
      success: true,
      data: parsed.map((item) => ({
        company_name: item["Company Name"] || item["company_name"],
        total_hired: parseInt(
          item["Total Students Placed"] || item["total_hired"] || 0,
          10,
        ),
        average_package: parseFloat(
          item["Average Salary Package (LPA)"] || item["average_package"] || 0,
        ),
        company: item["Company Name"] || item["company_name"] || "",
        offers: parseInt(
          item["Total Students Placed"] || item["total_hired"] || 0,
          10,
        ),
      })),
    };
  }
  return data;
};

export const getDepartmentReport = async (params = {}) => {
  const { data } = await api.get(API_ENDPOINTS.DEPARTMENT_REPORT, { params });
  if (data?.success && data?.data?.report) {
    const parsed = parseCSV(data.data.report);
    return {
      success: true,
      data: parsed.map((item) => ({
        department_name: item["Department Name"] || item["department_name"],
        department_code: item["Code"] || item["department_code"],
        total_students: parseInt(
          item["Total Students"] || item["total_students"] || 0,
          10,
        ),
        total_placed: parseInt(
          item["Placed Students"] || item["total_placed"] || 0,
          10,
        ),
        placement_rate: parseFloat(
          item["Placement Rate (%)"] || item["placement_rate"] || 0,
        ),
        average_package: parseFloat(
          item["Average Salary Package (LPA)"] || item["average_package"] || 0,
        ),
        dept:
          item["Code"] ||
          item["department_code"] ||
          item["Department Name"] ||
          "",
        rate: parseFloat(
          item["Placement Rate (%)"] || item["placement_rate"] || 0,
        ),
      })),
    };
  }
  return data;
};

export const exportAnalytics = async (format, reportType = "dashboard") => {
  const endpoint =
    format === "pdf" ? API_ENDPOINTS.EXPORT_PDF : API_ENDPOINTS.EXPORT_EXCEL;
  const { data } = await api.get(endpoint, {
    params: { reportType },
    responseType: "blob",
  });
  return data;
};

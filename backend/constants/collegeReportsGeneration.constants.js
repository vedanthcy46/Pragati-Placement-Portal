export const REPORT_TYPES = {
    DASHBOARD: 'dashboard',
    PLACEMENT: 'placement',
    PLACEMENTS: 'placements',
    COMPANY: 'company',
    COMPANIES: 'companies',
    DEPARTMENT: 'department',
    DEPARTMENTS: 'departments',
    STUDENT: 'student',
    STUDENTS: 'students',
    DRIVE: 'drive',
    DRIVES: 'drives',
    ANALYTICS: 'analytics',
};

export const REPORT_FORMATS = {
    JSON: 'json',
    CSV: 'csv',
    PDF: 'pdf',
    EXCEL: 'excel',
};

export const REPORT_STATUSES = {
    PENDING: 'pending',
    COMPLETED: 'completed',
    FAILED: 'failed',
};

export const REPORT_COLUMNS = {
    dashboard: [
        { header: 'Metric', key: 'metric' },
        { header: 'Value', key: 'value' },
    ],
    placements: [
        { header: 'Company', key: 'company' },
        { header: 'Drive Title', key: 'driveTitle' },
        { header: 'Status', key: 'status' },
        { header: 'Applicants', key: 'applicants' },
    ],
    students: [
        { header: 'Student Name', key: 'studentName' },
        { header: 'Email', key: 'email' },
        { header: 'College', key: 'college' },
        { header: 'GPA', key: 'gpa' },
        { header: 'Status', key: 'status' },
    ],
    drives: [
        { header: 'Drive Title', key: 'driveTitle' },
        { header: 'Company', key: 'company' },
        { header: 'Status', key: 'status' },
        { header: 'Applicants', key: 'applicants' },
        { header: 'Selected', key: 'selected' },
    ],
};

export const EXPORT_STATUSES = {
    QUEUED: 'queued',
    PROCESSING: 'processing',
    COMPLETED: 'completed',
    FAILED: 'failed',
};

export const ANALYTICS_REPORT_TYPES = ['DASHBOARD', 'PLACEMENTS', 'COMPANIES', 'DEPARTMENTS', 'STUDENTS', 'DRIVES'];

export const normalizeReportType = (value) => {
    if (typeof value !== 'string') return REPORT_TYPES.DASHBOARD;

    const normalized = value.trim().toUpperCase();
    return Object.values(REPORT_TYPES).includes(normalized) ? normalized : REPORT_TYPES.DASHBOARD;
};

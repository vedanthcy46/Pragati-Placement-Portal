import PDFDocument from 'pdfkit';
import XLSX from 'xlsx';
import { EXPORT_STATUSES, REPORT_COLUMNS, REPORT_FORMATS } from '../constants/collegeReportsGeneration.constants.js';

const normalizeExportFormat = (value) => {
    const normalized = typeof value === 'string' ? value.toLowerCase() : '';
    return Object.values(REPORT_FORMATS).includes(normalized) ? normalized : REPORT_FORMATS.PDF;
};

const normalizeExportStatus = (value) => {
    const normalized = typeof value === 'string' ? value.toLowerCase() : '';
    return Object.values(EXPORT_STATUSES).includes(normalized) ? normalized : EXPORT_STATUSES.COMPLETED;
};

const buildExportPayload = ({ reportId, format, status = EXPORT_STATUSES.COMPLETED } = {}) => ({
    reportId: reportId || null,
    format: normalizeExportFormat(format),
    status: normalizeExportStatus(status),
});

const buildExportResponse = (record = {}) => ({
    id: record.id || null,
    reportId: record.reportId || record.report_id || null,
    format: normalizeExportFormat(record.format),
    status: normalizeExportStatus(record.status),
    createdAt: record.createdAt || record.created_at || null,
});

const escapeHtml = (value) => String(value ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');

const convertToCSV = (data, headers, labels = []) => {
    if (!Array.isArray(data)) return '';
    const row = (values) => values.map((value) => `"${String(value ?? '').replace(/"/g, '""')}"`).join(',');
    return [row(labels.length ? labels : headers), ...data.map((item) => row(headers.map((key) => item[key])))].join('\n');
};

const convertToHTMLReport = (data = [], title, headers, labels = []) => {
    const headerLabels = labels.length ? labels : headers;
    const headerHtml = headerLabels.map((label) => `<th>${escapeHtml(label)}</th>`).join('');
    const rowsHtml = data.map((item) => `<tr>${headers.map((key) => `<td>${escapeHtml(item[key] ?? '-')}</td>`).join('')}</tr>`).join('');
    return `<!DOCTYPE html><html><head><title>${escapeHtml(title)}</title><style>body{font-family:Arial,sans-serif;margin:40px;color:#333}h1{color:#4CAF50}table{width:100%;border-collapse:collapse;margin-top:20px}th,td{border:1px solid #ddd;padding:12px;text-align:left}th{background:#4CAF50;color:white}.footer{margin-top:30px;font-size:12px;color:#777}</style></head><body><h1>${escapeHtml(title)}</h1><p>Report Generated on: ${new Date().toLocaleString()}</p><table><thead><tr>${headerHtml}</tr></thead><tbody>${rowsHtml}</tbody></table><div class="footer">Pragati Placement &amp; Training Management System - Confidential</div></body></html>`;
};

const normalizeReportType = (value) => {
    return typeof value === 'string' ? value.toLowerCase() : 'dashboard';
};

const getReportRows = (report = {}) => {
    const content = report.content || {};

    if (Array.isArray(content)) {
        return content;
    }

    if (Array.isArray(content.rows)) {
        return content.rows;
    }

    if (Array.isArray(content.data)) {
        return content.data;
    }

    if (content && typeof content === 'object' && Object.keys(content).length > 0) {
        return [content];
    }

    return [{
        reportTitle: report.title || 'Generated Report',
        reportType: report.type || 'dashboard',
        generatedAt: report.createdAt || report.created_at || null,
    }];
};

const getReportColumns = (reportType, rows = []) => {
    const normalizedType = normalizeReportType(reportType);

    if (REPORT_COLUMNS[normalizedType]) {
        return REPORT_COLUMNS[normalizedType];
    }

    if (rows.length > 0 && typeof rows[0] === 'object') {
        return Object.keys(rows[0]).map((key) => ({ header: String(key), key }));
    }

    return [
        { header: 'Field', key: 'field' },
        { header: 'Value', key: 'value' },
    ];
};

const escapeCsvValue = (value) => {
    if (value === null || value === undefined) {
        return '';
    }
    const stringValue = typeof value === 'object' ? JSON.stringify(value) : String(value);
    const escaped = stringValue.replace(/"/g, '""');
    return `"${escaped}"`;
};

const generateCsvBuffer = (report = {}) => {
    const rows = getReportRows(report);
    const columns = getReportColumns(report.type, rows);
    const header = columns.map((column) => escapeCsvValue(column.header)).join(',');
    const lines = rows.map((row) => columns.map((column) => escapeCsvValue(row[column.key] ?? '')).join(','));
    const csvContent = [header, ...lines].join('\n');
    return Buffer.from(csvContent, 'utf-8');
};

const generateExcelBuffer = (report = {}) => {
    const rows = getReportRows(report);
    const columns = getReportColumns(report.type, rows);
    const worksheetData = [columns.map((column) => column.header)];

    rows.forEach((row) => {
        worksheetData.push(columns.map((column) => row[column.key] ?? ''));
    });

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Report');

    return Buffer.from(XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' }));
};

const generateJsonBuffer = (report = {}) => {
    const jsonContent = JSON.stringify(report.content ?? report, null, 2);
    return Buffer.from(jsonContent, 'utf-8');
};

const generatePdfBuffer = async (report = {}) => {
    const rows = getReportRows(report);
    const columns = getReportColumns(report.type, rows);
    const doc = new PDFDocument({ size: 'A4', margin: 40 });
    const chunks = [];

    doc.on('data', (chunk) => chunks.push(chunk));

    const title = report.title || 'Report Export';
    const subtitle = `Type: ${report.type || 'dashboard'} | Generated At: ${report.createdAt || report.created_at || ''}`;

    doc.fontSize(18).text(title, { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(10).fillColor('#444444').text(subtitle);
    doc.moveDown(1);

    columns.forEach((column, index) => {
        doc.font('Helvetica-Bold').fontSize(10).text(column.header, 40 + (index * 140), doc.y, {
            width: 140,
            continued: index !== columns.length - 1,
        });
    });

    doc.moveDown();
    doc.font('Helvetica').fontSize(10);

    rows.forEach((row) => {
        columns.forEach((column, index) => {
            const text = row[column.key] !== undefined ? String(row[column.key]) : '';
            doc.text(text, 40 + (index * 140), doc.y, {
                width: 140,
                continued: index !== columns.length - 1,
            });
        });
        doc.moveDown(0.75);
    });

    doc.end();

    return new Promise((resolve, reject) => {
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);
    });
};

const getExportContent = async (report = {}, format = REPORT_FORMATS.PDF) => {
    const normalizedFormat = normalizeExportFormat(format);

    switch (normalizedFormat) {
        case REPORT_FORMATS.CSV:
            return {
                contentType: 'text/csv',
                extension: 'csv',
                buffer: generateCsvBuffer(report),
            };
        case REPORT_FORMATS.EXCEL:
            return {
                contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                extension: 'xlsx',
                buffer: generateExcelBuffer(report),
            };
        case REPORT_FORMATS.JSON:
            return {
                contentType: 'application/json',
                extension: 'json',
                buffer: generateJsonBuffer(report),
            };
        case REPORT_FORMATS.PDF:
        default:
            return {
                contentType: 'application/pdf',
                extension: 'pdf',
                buffer: await generatePdfBuffer(report),
            };
    }
};

export {
    buildExportPayload,
    buildExportResponse,
    normalizeExportFormat,
    convertToCSV,
    convertToHTMLReport,
    generateCsvBuffer,
    generateExcelBuffer,
    generateJsonBuffer,
    generatePdfBuffer,
    getExportContent,
};

export default {
    buildExportPayload,
    buildExportResponse,
    convertToCSV,
    convertToHTMLReport,
    normalizeExportFormat,
    generateCsvBuffer,
    generateExcelBuffer,
    generateJsonBuffer,
    generatePdfBuffer,
    getExportContent,
};

-- ============================================================
-- Migration: 023_add_generated_reports_college_id.sql
-- Multi-tenancy: scope generated_reports to the owning college.
-- Previously every college could read every report; this column
-- lets list/count/create be filtered by the authenticated college.
-- ============================================================

ALTER TABLE generated_reports
    ADD COLUMN IF NOT EXISTS college_id INTEGER REFERENCES colleges(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_generated_reports_college_id
    ON generated_reports(college_id);
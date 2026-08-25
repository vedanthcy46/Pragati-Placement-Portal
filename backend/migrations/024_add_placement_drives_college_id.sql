-- ============================================================
-- Migration: 024_add_placement_drives_college_id.sql
-- Multi-tenancy: scope placement drives to the owning college.
-- Previously every college could read every drive; this column
-- lets list/get/create/update/delete be filtered by the
-- authenticated college.
-- ============================================================

ALTER TABLE placement_drives
    ADD COLUMN IF NOT EXISTS college_id INTEGER REFERENCES colleges(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_placement_drives_college_id
    ON placement_drives(college_id);
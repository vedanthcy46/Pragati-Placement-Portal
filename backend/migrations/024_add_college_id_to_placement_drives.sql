-- Add college_id to placement_drives for multi-tenancy
ALTER TABLE placement_drives ADD COLUMN IF NOT EXISTS college_id INTEGER REFERENCES colleges(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_placement_drives_college_id ON placement_drives(college_id);
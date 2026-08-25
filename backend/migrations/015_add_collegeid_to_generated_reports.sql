-- Add college ownership to generated reports
ALTER TABLE generated_reports ADD COLUMN IF NOT EXISTS college_id INTEGER REFERENCES colleges(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_generated_reports_college_id ON generated_reports(college_id);

-- Note: existing legacy reports will have college_id = NULL

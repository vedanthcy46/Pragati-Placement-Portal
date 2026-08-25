-- ============================================================
-- COMPANY STATS TABLE
-- ============================================================


CREATE TABLE IF NOT EXISTS company_stats (
    id SERIAL PRIMARY KEY,


    company_id INTEGER NOT NULL
    REFERENCES companies(id)
    ON DELETE CASCADE,


    offer_acceptance_rate NUMERIC(5,2) DEFAULT 0.00,


    interview_to_hire_rate NUMERIC(5,2) DEFAULT 0.00,


    avg_response_time_days NUMERIC(6,2) DEFAULT 0.00,


    total_jobs_posted INTEGER DEFAULT 0,


    total_hires INTEGER DEFAULT 0,


    engagement_score NUMERIC(6,2) DEFAULT 0.00,


    last_updated TIMESTAMPTZ DEFAULT NOW(),


    UNIQUE(company_id)
);


-- ============================================================
-- INDEXES
-- ============================================================


CREATE INDEX IF NOT EXISTS idx_company_stats_engagement
ON company_stats(engagement_score DESC);


-- ============================================================
-- SAMPLE DATA
-- ============================================================


INSERT INTO company_stats (company_id, offer_acceptance_rate, interview_to_hire_rate, avg_response_time_days, total_jobs_posted, total_hires, engagement_score)
SELECT id, 78.5, 35.0, 24, 12, 8, 82.5 FROM companies WHERE name = 'TechNova Solutions';

INSERT INTO company_stats (company_id, offer_acceptance_rate, interview_to_hire_rate, avg_response_time_days, total_jobs_posted, total_hires, engagement_score)
SELECT id, 91.2, 48.5, 12, 30, 20, 95.8 FROM companies WHERE name = 'DataSphere Pvt Ltd';

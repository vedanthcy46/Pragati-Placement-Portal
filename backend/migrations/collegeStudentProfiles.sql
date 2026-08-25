-- ============================================================
-- `student_profiles` was previously removed in a partial revision
-- that claimed the new tables would anchor on the existing `students`
-- table, but the foreign keys below still reference
-- `student_profiles(id)`, and the app code (models, controllers,
-- seed scripts) queries `student_profiles` directly. Restore the
-- table here so the schema matches the code.
-- ============================================================

CREATE TABLE IF NOT EXISTS student_profiles (
    id                  SERIAL PRIMARY KEY,
    user_id             INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name                VARCHAR(255) NOT NULL,
    email               VARCHAR(255) UNIQUE,
    phone               VARCHAR(20),
    enrollment_no       VARCHAR(50) UNIQUE,
    department          VARCHAR(100),
    semester            INTEGER,
    cgpa                NUMERIC(4,2),
    placement_status    VARCHAR(50) DEFAULT 'Not Eligible',
    city                VARCHAR(100),
    skills              TEXT[],
    profile_image       TEXT,
    bio                 TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- student_skills ALREADY EXISTS (student_module.sql) — only add what's missing
ALTER TABLE student_skills ADD COLUMN IF NOT EXISTS proficiency_level VARCHAR(20) DEFAULT 'Beginner'
    CHECK (proficiency_level IN ('Beginner','Intermediate','Advanced','Expert'));
ALTER TABLE student_skills ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Before uncommenting: run this check first — if it returns 0 rows, safe to add.
-- SELECT student_id, skill_name, COUNT(*) FROM student_skills GROUP BY 1,2 HAVING COUNT(*) > 1;
-- ALTER TABLE student_skills ADD CONSTRAINT uq_student_skill UNIQUE (student_id, skill_name);


-- ==== Genuinely new tables, all anchored on student_profiles(id) ====

CREATE TABLE IF NOT EXISTS academic_records (
    id                      SERIAL PRIMARY KEY,
    student_id              INTEGER NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
    semester                SMALLINT NOT NULL CHECK (semester BETWEEN 1 AND 12),
    academic_year           VARCHAR(20) NOT NULL,
    sgpa                    NUMERIC(3,2) CHECK (sgpa >= 0 AND sgpa <= 10),
    cgpa_till_date          NUMERIC(3,2) CHECK (cgpa_till_date >= 0 AND cgpa_till_date <= 10),
    attendance_percentage   NUMERIC(5,2) CHECK (attendance_percentage >= 0 AND attendance_percentage <= 100),
    subjects                JSONB,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (student_id, semester)
);
CREATE INDEX IF NOT EXISTS idx_academic_records_student ON academic_records(student_id);

CREATE TABLE IF NOT EXISTS certifications (
    id                      SERIAL PRIMARY KEY,
    student_id              INTEGER NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
    title                   VARCHAR(200) NOT NULL,
    issuing_organization    VARCHAR(150) NOT NULL,
    credential_id           VARCHAR(100),
    credential_url          TEXT,
    issue_date              DATE NOT NULL,
    expiry_date             DATE,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CHECK (expiry_date IS NULL OR expiry_date >= issue_date)
);
CREATE INDEX IF NOT EXISTS idx_certifications_student ON certifications(student_id);

CREATE TABLE IF NOT EXISTS internships (
    id              SERIAL PRIMARY KEY,
    student_id      INTEGER NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
    company_name    VARCHAR(150) NOT NULL,
    role            VARCHAR(150) NOT NULL,
    start_date      DATE NOT NULL,
    end_date        DATE,
    is_ongoing      BOOLEAN NOT NULL DEFAULT FALSE,
    stipend         NUMERIC(10,2),
    description     TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CHECK (end_date IS NULL OR end_date >= start_date)
);
CREATE INDEX IF NOT EXISTS idx_internships_student ON internships(student_id);

-- `projects` ALREADY EXISTS (017_add_hiring_pipeline_fields.sql) for the
-- mentor hiring pipeline. Merge the student-facing columns into it so both
-- features share one table (matches collegeProjects.model.js + seedHiring.js).
ALTER TABLE projects ADD COLUMN IF NOT EXISTS student_id INTEGER REFERENCES student_profiles(id) ON DELETE CASCADE;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS tech_stack TEXT[];
ALTER TABLE projects ADD COLUMN IF NOT EXISTS project_url TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS github_url TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS start_date DATE;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS end_date DATE;
CREATE INDEX IF NOT EXISTS idx_projects_student ON projects(student_id);

CREATE TABLE IF NOT EXISTS achievements (
    id                  SERIAL PRIMARY KEY,
    student_id          INTEGER NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
    title               VARCHAR(200) NOT NULL,
    description         TEXT,
    category            VARCHAR(50) NOT NULL DEFAULT 'Other'
                            CHECK (category IN ('Academic','Sports','Cultural','Technical','Other')),
    issuing_body        VARCHAR(150),
    achievement_date    DATE NOT NULL,
    certificate_url     TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_achievements_student ON achievements(student_id);

CREATE TABLE IF NOT EXISTS placement_history (
    id                  SERIAL PRIMARY KEY,
    student_id          INTEGER NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
    company_name        VARCHAR(150) NOT NULL,
    role_applied        VARCHAR(150) NOT NULL,
    application_date    DATE NOT NULL,
    status               VARCHAR(30) NOT NULL DEFAULT 'Applied'
                            CHECK (status IN ('Applied','Shortlisted','Interview Scheduled','Interviewed','Offered','Rejected','Accepted','Declined')),
    interview_date       DATE,
    offer_package        NUMERIC(10,2),
    offer_date           DATE,
    remarks              TEXT,
    created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_placement_history_student ON placement_history(student_id);
CREATE INDEX IF NOT EXISTS idx_placement_history_status ON placement_history(status);

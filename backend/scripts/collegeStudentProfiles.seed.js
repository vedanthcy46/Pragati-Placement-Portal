// scripts/collegeStudentProfiles.seed.js
// Usage: node scripts/collegeStudentProfiles.seed.js
// Seeds one demo student (Rahul Sharma, per the task doc's sample data)
// with data across every table: academic_records, student_skills,
// certifications, internships, projects, achievements, placement_history.
// Safe to re-run -- clears any previous run of this exact seed first.

import bcrypt from "bcrypt";
import { randomUUID } from "crypto";
import { pool } from "../config/db.js";

const SEED_EMAIL = "rahul.sharma.seed@pragati.test";
const SEED_PASSWORD = "Seed@1234";

const studentProfileSeed = {
  name: "Rahul Sharma",
  enrollment_no: "2023CS001",
  department: "Computer Science",
  cgpa: 8.75,
  placement_status: "Eligible",
};

const run = async () => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Clean up any previous run of this seed
    await client.query(`DELETE FROM student_profiles WHERE email = $1`, [SEED_EMAIL]);
    await client.query(`DELETE FROM users WHERE email = $1`, [SEED_EMAIL]);
    await client.query(`DELETE FROM auth_users WHERE email = $1`, [SEED_EMAIL]);

    // 1. auth_users
    const passwordHash = await bcrypt.hash(SEED_PASSWORD, 10);
    const authUuid = randomUUID();
    const authUserResult = await client.query(
      `INSERT INTO auth_users (email, password_hash, role, uuid_id)
       VALUES ($1, $2, 'student', $3)
       RETURNING id`,
      [SEED_EMAIL, passwordHash, authUuid],
    );
    const authUserId = authUserResult.rows[0].id;

    // 2. users
    const userResult = await client.query(
      `INSERT INTO users (auth_user_id, email, role, created_at, phone, username)
       VALUES ($1, $2, 'student', NOW(), NULL, $3)
       RETURNING id`,
      [authUserId, SEED_EMAIL, SEED_EMAIL.split("@")[0]],
    );
    const userId = userResult.rows[0].id;

    // 3. student_profiles
    const studentResult = await client.query(
      `INSERT INTO student_profiles (user_id, name, enrollment_no, department, cgpa, placement_status, email)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id`,
      [
        userId,
        studentProfileSeed.name,
        studentProfileSeed.enrollment_no,
        studentProfileSeed.department,
        studentProfileSeed.cgpa,
        studentProfileSeed.placement_status,
        SEED_EMAIL,
      ],
    );
    const studentId = studentResult.rows[0].id;

    // 4. academic_records
    await client.query(
      `INSERT INTO academic_records (student_id, semester, academic_year, sgpa, cgpa_till_date, attendance_percentage)
       VALUES
       ($1, 1, '2023-24', 8.60, 8.60, 88.0),
       ($1, 2, '2023-24', 8.90, 8.75, 91.5)`,
      [studentId],
    );

    // 5. student_skills
    await client.query(
      `INSERT INTO student_skills (student_id, skill_name, proficiency_level)
       VALUES
       ($1, 'Node.js', 'Advanced'),
       ($1, 'PostgreSQL', 'Intermediate'),
       ($1, 'React', 'Intermediate')`,
      [studentId],
    );

    // 6. certifications
    await client.query(
      `INSERT INTO certifications (student_id, title, issuing_organization, issue_date)
       VALUES ($1, 'AWS Cloud Practitioner', 'Amazon Web Services', '2024-03-10')`,
      [studentId],
    );

    // 7. internships
    await client.query(
      `INSERT INTO internships (student_id, company_name, role, start_date, end_date, stipend, description)
       VALUES ($1, 'TCS', 'Backend Developer Intern', '2024-05-01', '2024-07-31', 15000, 'Worked on REST APIs using Node.js and Express.')`,
      [studentId],
    );

    // 8. projects
    await client.query(
      `INSERT INTO projects (student_id, title, description, tech_stack, github_url)
       VALUES ($1, 'Student Performance Tracker', 'A backend module to track student profiles and placement history.', $2, 'https://github.com/example/student-tracker')`,
      [studentId, ["Node.js", "Express", "PostgreSQL"]],
    );

    // 9. achievements
    await client.query(
      `INSERT INTO achievements (student_id, title, category, achievement_date, issuing_body)
       VALUES ($1, 'Winner - College Hackathon', 'Technical', '2024-02-20', 'Pragati College')`,
      [studentId],
    );

    // 10. placement_history
    await client.query(
      `INSERT INTO placement_history (student_id, company_name, role_applied, application_date, status, interview_date, offer_package, offer_date)
       VALUES ($1, 'Google', 'SDE Intern', '2024-08-01', 'Offered', '2024-08-15', 60000, '2024-08-20')`,
      [studentId],
    );

    await client.query("COMMIT");

    console.log("✅ Seed data inserted successfully");
    console.log(`   Login email:    ${SEED_EMAIL}`);
    console.log(`   Login password: ${SEED_PASSWORD}`);
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("❌ Seeding failed:", error.message);
  } finally {
    client.release();
    await pool.end();
  }
};

run();

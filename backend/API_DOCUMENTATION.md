# Live Session API Documentation

## Base URL
http://localhost:5000/api/student/live-sessions

## Authentication
All routes require a Bearer JWT token with the `student` role.

## Endpoints

### Live Sessions
- GET /api/student/live-sessions
- GET /api/student/live-sessions/:id
- POST /api/student/live-sessions/:id/join
- POST /api/student/live-sessions/:id/leave

### Attendance
- GET /api/student/live-sessions/attendance
- POST /api/student/live-sessions/:id/attendance
- PATCH /api/student/live-sessions/:id/attendance

### Recordings
- GET /api/student/live-sessions/recordings
- GET /api/student/live-sessions/recordings/:id

### Participants
- GET /api/student/live-sessions/:id/participants
- POST /api/student/live-sessions/:id/participants
- DELETE /api/student/live-sessions/:id/participants/:participantId

### Schedules
- GET /api/student/live-sessions/schedules
- GET /api/student/live-sessions/upcoming

## Sample Payloads

### Attendance
{
  "status": "Present"
}

### Participant
{
  "studentId": 101
}

---

# ?? API Documentation — Module 6: Training Coordination

**Base URL:** `http://localhost:5000/api/v1/company/training`  
**Auth:** All endpoints require `Authorization: Bearer <JWT_TOKEN>` header

---

## ?? Authentication

All endpoints are protected by JWT authentication.  
JWT token is obtained from the `/api/v1/auth/login` endpoint.

**Header Format:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Error Responses:**
| Status | Message |
|--------|---------|
| 401 | "Invalid or expired JWT token" |
| 403 | "Access denied. Insufficient permissions." |

---

## ?? Endpoints

---

### 1. GET `/api/v1/company/training`

**Description:** List all training programs for the authenticated company.  
**Auth Required:** ? Yes  
**Target Response Time:** < 500ms

**Query Parameters:**

| Parameter | Type   | Required | Default | Description            |
|-----------|--------|----------|---------|------------------------|
| status    | string | No       | —       | Filter by status: `ACTIVE`, `COMPLETED`, `PAUSED`, `CANCELLED` |
| limit     | number | No       | 10      | Max results per page   |
| offset    | number | No       | 0       | Number of results to skip |

**Example Request:**
```bash
curl -X GET "http://localhost:5000/api/v1/company/training?status=ACTIVE&limit=10&offset=0" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "trainingId": "T101",
      "title": "React Bootcamp",
      "status": "ACTIVE",
      "mentorAssigned": true,
      "mentor": {
        "mentorId": 1,
        "name": "John Doe",
        "email": "mentor@example.com"
      },
      "candidatesEnrolled": 1,
      "startDate": "2026-05-15T00:00:00.000Z",
      "endDate": "2026-06-15T00:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 2,
    "limit": 10,
    "offset": 0
  }
}
```

**Error Responses:**
| Status | Description |
|--------|-------------|
| 401 | Invalid/missing JWT token |
| 500 | Internal server error |

---

### 2. GET `/api/v1/company/training/:id`

**Description:** Get detailed information for a specific training program.  
**Auth Required:** ? Yes  
**Target Response Time:** < 300ms

**Path Parameters:**

| Parameter | Type   | Required | Description             |
|-----------|--------|----------|-------------------------|
| id        | string | Yes      | Training ID (e.g. T101) |

**Example Request:**
```bash
curl -X GET "http://localhost:5000/api/v1/company/training/T101" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "trainingId": "T101",
    "title": "React Bootcamp",
    "description": "Complete React training covering fundamentals, hooks, and context API",
    "duration": 30,
    "startDate": "2026-05-15T00:00:00.000Z",
    "endDate": "2026-06-15T00:00:00.000Z",
    "status": "ACTIVE",
    "curriculum": ["React Basics", "Components & Props", "State & Lifecycle", "Hooks", "Context API"],
    "mentor": {
      "mentorId": 1,
      "name": "John Doe",
      "email": "mentor@example.com"
    },
    "enrolledCandidates": 1
  }
}
```

**Error Responses:**
| Status | Description |
|--------|-------------|
| 401 | Invalid/missing JWT token |
| 404 | Training not found or does not belong to company |
| 500 | Internal server error |

---

### 3. PATCH `/api/v1/company/training/:id/assign-mentor`

**Description:** Assign a mentor to a training program.  
**Auth Required:** ? Yes  
**Target Response Time:** < 400ms

**Path Parameters:**

| Parameter | Type   | Required | Description             |
|-----------|--------|----------|-------------------------|
| id        | string | Yes      | Training ID (e.g. T101) |

**Request Body:**
```json
{
  "mentorId": "1"
}
```

| Field    | Type           | Required | Description         |
|----------|----------------|----------|---------------------|
| mentorId | string/number  | Yes      | ID of the mentor to assign |

**Example Request:**
```bash
curl -X PATCH "http://localhost:5000/api/v1/company/training/T101/assign-mentor" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"mentorId": "1"}'
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Mentor assigned successfully"
}
```

**Error Responses:**
| Status | Description |
|--------|-------------|
| 400 | `mentorId` is required or invalid |
| 401 | Invalid/missing JWT token |
| 404 | Mentor not found or Training not found |
| 500 | Internal server error |

---

### 4. GET `/api/v1/company/training/:id/progress`

**Description:** Get comprehensive analytics and progress data for a training program.  
**Auth Required:** ? Yes  
**Target Response Time:** < 600ms

**Path Parameters:**

| Parameter | Type   | Required | Description             |
|-----------|--------|----------|-------------------------|
| id        | string | Yes      | Training ID (e.g. T101) |

**Example Request:**
```bash
curl -X GET "http://localhost:5000/api/v1/company/training/T101/progress" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "trainingId": "T101",
    "title": "React Bootcamp",
    "totalCandidates": 1,
    "completionPercentage": 0,
    "attendanceRate": 100,
    "assignmentSubmissions": {
      "submitted": 0,
      "pending": 0
    }
  }
}
```

**Error Responses:**
| Status | Description |
|--------|-------------|
| 401 | Invalid/missing JWT token |
| 404 | Training not found or does not belong to company |
| 500 | Internal server error |

---

## ?? Quick Test Reference

```bash
# Get auth token first
TOKEN=$(curl -s -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"company@example.com","password":"password123"}' \
  | jq -r '.token')

# 1. List trainings
curl -s http://localhost:5000/api/v1/company/training \
  -H "Authorization: Bearer $TOKEN" | jq .

# 2. Get training by ID
curl -s http://localhost:5000/api/v1/company/training/T101 \
  -H "Authorization: Bearer $TOKEN" | jq .

# 3. Assign mentor
curl -s -X PATCH http://localhost:5000/api/v1/company/training/T101/assign-mentor \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"mentorId":"1"}' | jq .

# 4. Get progress analytics
curl -s http://localhost:5000/api/v1/company/training/T101/progress \
  -H "Authorization: Bearer $TOKEN" | jq .

---

# 📊 API Documentation - Module 7: College Analytics Dashboard

**Base URL:** `http://localhost:5000/api/analytics`  
**Auth:** All endpoints require `Authorization: Bearer <JWT_TOKEN>` header with `college` role.

---

## 🔒 Authentication

All endpoints are protected by JWT authentication and role authorization.  
JWT token is obtained from the `/api/auth/login` endpoint.

---

## 🚀 Endpoints

### 1. GET `/api/analytics/dashboard`
- **Description:** Get high-level dashboard KPIs (total students, placed, rates, active drives, companies).
- **Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Dashboard analytics fetched successfully.",
  "data": {
    "college_id": 3,
    "total_students": 2450,
    "total_placed": 1280,
    "placement_rate": 82,
    "average_package": 12,
    "top_recruiter": "Google",
    "active_drives": 15,
    "total_companies": 45
  }
}
```

### 2. GET `/api/analytics/overview`
- **Description:** Get overview statistics (mirrors dashboard analytics).
- **Success Response (200 OK):** Same as dashboard.

### 3. GET `/api/analytics/placements`
- **Description:** Get year-wise placement trends.
- **Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Placement analytics fetched successfully.",
  "data": [
    {
      "college_id": 3,
      "year": 2026,
      "total_students": 2450,
      "total_placed": 1280,
      "placement_rate": 82,
      "average_package": 12,
      "highest_package": 45
    }
  ]
}
```

### 4. GET `/api/analytics/placement-trends`
- **Description:** Get placement trends (historic yearly placements).
- **Success Response (200 OK):** Same as placements.

### 5. GET `/api/analytics/companies`
- **Description:** Get company hiring statistics.
- **Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Company analytics fetched successfully.",
  "data": [
    {
      "college_id": 3,
      "company_name": "Google",
      "total_hired": 45,
      "average_package": 24.5
    }
  ]
}
```

### 6. GET `/api/analytics/company-report`
- **Description:** Generate Company CSV placement report.
- **Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Company report generated successfully.",
  "data": {
    "report": "\"Company Name\",\"Total Students Placed\",\"Average Salary Package (LPA)\"\n\"Google\",\"45\",\"24.50\"...",
    "filename": "companies_report_1710000000000.csv"
  }
}
```

### 7. GET `/api/analytics/departments`
- **Description:** Get department-wise performance metrics.
- **Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Department analytics fetched successfully.",
  "data": [
    {
      "department_name": "Computer Science Engineering",
      "department_code": "CSE",
      "total_students": 240,
      "total_placed": 210,
      "placement_rate": 87.5,
      "average_package": 14.5
    }
  ]
}
```

### 8. GET `/api/analytics/department-report`
- **Description:** Generate Department CSV placement report.
- **Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Department report generated successfully.",
  "data": {
    "report": "\"Department Name\",\"Code\",\"Total Students\",\"Placed Students\",\"Placement Rate (%)\",\"Average Salary Package (LPA)\"...",
    "filename": "departments_report_1710000000000.csv"
  }
}
```

### 9. GET `/api/analytics/students`
- **Description:** Get students counts grouped by placement status and CGPA ranges.
- **Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Student analytics statistics fetched successfully.",
  "data": {
    "statusCounts": [
      { "status": "Placed", "count": 4 },
      { "status": "Eligible", "count": 1 }
    ],
    "cgpaRanges": {
      "range_9_10": 1,
      "range_8_9": 2,
      "range_7_8": 1,
      "range_below_7": 0
    }
  }
}
```

### 10. GET `/api/analytics/student-report`
- **Description:** Generate Student CSV placement report.
- **Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Student report generated successfully.",
  "data": {
    "report": "\"Enrollment Number\",\"Student Name\",\"Email ID\",\"Department\",\"Course\",\"CGPA\",\"Status\",\"Placed At Company\",\"Salary Package\"...",
    "filename": "students_report_1710000000000.csv"
  }
}
```

### 11. GET `/api/analytics/export/pdf`
- **Description:** Export analytics report in PDF (HTML) format.
- **Query Parameters:** `reportType` (placements, companies, departments, students, dashboard).
- **Success Response (200 OK):** HTML document binary.

### 12. GET `/api/analytics/export/excel`
- **Description:** Export analytics report in Excel (CSV) format.
- **Query Parameters:** `reportType` (placements, companies, departments, students, dashboard).
- **Success Response (200 OK):** CSV file binary/text.
```

---

# 🎓 API Documentation — Student Profile & Performance Tracking Module

**Base URL:** `http://localhost:5000/api`
**Auth:** All routes require `Authorization: Bearer <JWT_TOKEN>` header (`student` role). Token is obtained from `/api/auth/login`.

**Standard Response Shape:**
```json
// success
{ "success": true, "data": { } }

// success (list endpoints)
{ "success": true, "data": [ ], "meta": { "totalItems": 0, "totalPages": 1, "currentPage": 1, "itemsPerPage": 10 } }

// error
{ "error": "message" }
```

---

## Endpoints

### Student Profile
- `GET /api/student-profile` — get the logged-in student's profile
- `PUT /api/student-profile` — update profile fields
- `GET /api/student-profile/overview` — profile + counts across all modules
- `GET /api/student-profile/statistics` — average SGPA/attendance, application/offer counts

### Academic (read-only)
- `GET /api/student-profile/academics` — full academic history
- `GET /api/student-profile/academics/semester?semester=1` — single semester result
- `GET /api/student-profile/academics/cgpa-trend` — semester-wise CGPA trend
- `GET /api/student-profile/attendance` — attendance overall + per-semester

### Placement History (read-only)
- `GET /api/student-profile/placements` — full placement/application history
- `GET /api/student-profile/applied-companies` — companies applied to
- `GET /api/student-profile/interviews` — interview history
- `GET /api/student-profile/offers` — offer history

### Skills
- `GET /api/student-profile/skills`
- `POST /api/student-profile/skills`
- `PUT /api/student-profile/skills/:id`
- `DELETE /api/student-profile/skills/:id`

### Certifications
- `GET /api/student-profile/certifications`
- `POST /api/student-profile/certifications`
- `PUT /api/student-profile/certifications/:id`
- `DELETE /api/student-profile/certifications/:id`

### Internships
- `GET /api/student-profile/internships`
- `POST /api/student-profile/internships`
- `PUT /api/student-profile/internships/:id`
- `DELETE /api/student-profile/internships/:id`

### Projects
- `GET /api/student-profile/projects`
- `POST /api/student-profile/projects`
- `PUT /api/student-profile/projects/:id`
- `DELETE /api/student-profile/projects/:id`

### Achievements
- `GET /api/student-profile/achievements`
- `POST /api/student-profile/achievements`
- `PUT /api/student-profile/achievements/:id`
- `DELETE /api/student-profile/achievements/:id`

### Performance Analytics
- `GET /api/student-profile/performance-analytics` — CGPA, activity counts, and a computed readiness score (0-100)

---

## Sample Payloads

### Update Profile — `PUT /student-profile`
```json
{ "name": "Rahul Sharma", "department": "Computer Science", "semester": 3, "cgpa": 8.75, "phone": "9876543210", "bio": "Backend enthusiast" }
```

### Add Skill — `POST /skills`
```json
{ "skill_name": "Node.js", "proficiency_level": "Intermediate" }
```
`proficiency_level` must be one of: `Beginner`, `Intermediate`, `Advanced`, `Expert`.

### Add Certification — `POST /certifications`
```json
{ "title": "AWS Cloud Practitioner", "issuing_organization": "Amazon", "issue_date": "2024-06-15", "expiry_date": "2027-06-15" }
```

### Add Internship — `POST /internships`
```json
{ "company_name": "TCS", "role": "Backend Intern", "start_date": "2024-01-01", "end_date": "2024-06-30", "stipend": 15000 }
```

### Add Project — `POST /projects`
```json
{ "title": "Student Tracker App", "description": "Backend for tracking student performance", "tech_stack": ["Node.js", "Postgres"], "github_url": "https://github.com/example/repo" }
```

### Add Achievement — `POST /achievements`
```json
{ "title": "Hackathon Winner", "category": "Technical", "achievement_date": "2024-03-10", "issuing_body": "Pragati College" }
```
`category` must be one of: `Academic`, `Sports`, `Cultural`, `Technical`, `Other`.

---

## Error Responses

| Status | Meaning |
|--------|---------|
| 400 | Validation failed — response includes `errors: [...]` |
| 401 | Missing, invalid, or expired token |
| 404 | Student profile or requested resource not found |
| 500 | Internal server error |
# HRMS SaaS Application — Implementation Plan

## Overview

A full-stack Human Resource Management System (HRMS) inspired by the **XCELTECH** Figma design. The system includes authentication, employee management, leave, attendance, recruitment, performance, payroll, real-time chat, announcements, LMS, and an admin panel.

**Brand**: XCELTECH  
**Color palette**: Dark navy sidebar (`#0f1b2d`), yellow accent (`#f5a623`), white content area, blue primary (`#1e40af`), green for success actions.

---

## User Review Required

> [!IMPORTANT]
> **Prerequisites required before starting**:
> 1. **PostgreSQL** must be installed and running locally (default port 5432)
> 2. **Redis** must be installed and running locally (default port 6379)
> 3. **Cloudinary** account needed — provide API key, secret, and cloud name
> 4. **Node.js 18+** and **Python 3.10+** required
>
> Please confirm these are available before I proceed. If any are missing, I can adjust the plan (e.g., use SQLite instead of PostgreSQL, skip Redis/Cloudinary for local dev).

> [!WARNING]
> This is a large project built in phases. I will scaffold all modules with real API connections. Some advanced features (LMS progress tracking, full payroll calculations) will be functionally scaffolded with basic CRUD — complex business logic can be added later.

---

## Proposed Changes

### Project Structure

```
d:/Intern/Employee MS/
├── backend/                  # Flask REST API
│   ├── app/
│   │   ├── __init__.py
│   │   ├── models/           # SQLAlchemy models
│   │   ├── routes/           # Blueprint route files per module
│   │   ├── utils/            # JWT helpers, Cloudinary, Redis
│   │   └── config.py
│   ├── requirements.txt
│   ├── .env.example
│   └── run.py
├── frontend/                 # Next.js App Router
│   ├── app/
│   │   ├── (auth)/           # login, register pages
│   │   ├── (dashboard)/      # all protected pages
│   │   │   ├── layout.tsx    # sidebar + topbar layout
│   │   │   ├── dashboard/
│   │   │   ├── employees/
│   │   │   ├── leaves/
│   │   │   ├── attendance/
│   │   │   ├── recruitment/
│   │   │   ├── performance/
│   │   │   ├── payroll/
│   │   │   ├── messages/
│   │   │   ├── announcements/
│   │   │   ├── courses/
│   │   │   └── profile/
│   │   └── globals.css
│   ├── components/
│   │   ├── layout/           # Sidebar, Topbar
│   │   ├── ui/               # Button, Card, Modal, Table, Badge
│   │   └── charts/           # Chart.js wrappers
│   ├── lib/                  # axios instance, auth helpers
│   ├── .env.example
│   ├── tailwind.config.ts
│   └── package.json
└── README.md
```

---

### Backend — Flask API

#### [NEW] `backend/requirements.txt`
All dependencies as specified.

#### [NEW] `backend/app/models/`
- `user.py` — User, roles, sessions
- `employee.py` — Employee, Department, Role
- `attendance.py` — Attendance records
- `leave.py` — Leave, LeaveBalance, LeaveType
- `recruitment.py` — Job, Candidate, Resume
- `performance.py` — Goal, KeyResult, Feedback, Recognition
- `payroll.py` — Payroll, PaySlip
- `document.py` — Document, EmployeeDocument
- `chat.py` — Chat, Message, Channel
- `announcement.py` — Announcement, Survey, Response
- `course.py` — Course, Enrollment, Progress

#### [NEW] `backend/app/routes/`
- `auth.py` — `/auth/login`, `/auth/register`, `/auth/refresh`
- `employees.py` — CRUD for `/employees`
- `attendance.py` — `/attendance`
- `leaves.py` — `/leaves`, `/leaves/admin`
- `recruitment.py` — `/jobs`, `/candidates`, `/resumes`
- `performance.py` — `/performance/goals`, `/performance/feedback`
- `payroll.py` — `/payroll`
- `documents.py` — `/documents/upload` (Cloudinary)
- `chat.py` — `/chat` (Socket.IO)
- `announcements.py` — `/announcements`, `/surveys`
- `courses.py` — `/courses`, `/enrollments`
- `dashboard.py` — `/dashboard/stats` (Redis cached)

---

### Frontend — Next.js

#### [NEW] `frontend/components/layout/Sidebar.tsx`
Dark navy sidebar (`bg-[#0f1b2d]`) with:
- XCELTECH logo (top)
- Admin avatar + name + role
- **Features**: Dashboard (yellow active pill), Messages (red badge)
- **Recruitment**: Jobs, Candidates, Resumes
- **Organization**: Employee Management, Leave Management, Performance Management, Payroll Management
- Red "Log Out" button (bottom)

#### [NEW] `frontend/components/layout/Topbar.tsx`
- Hamburger menu, "All Candidates" filter dropdown, search bar
- Notification bell (badge), settings gear, mail icon, user avatar

#### [NEW] Auth Pages
- `/login` — Full-screen blue background with XCELTECH logo overlay, centered login card (Email, Password, Remember me, yellow Sign In button)
- `/register` — Split-screen (left: dark blue hero with "HR Management Platform", right: registration form)

#### [NEW] Dashboard Page
- Profile hero card (blue gradient, avatar, name, role, Edit Profile button)
- Quick Actions row (Apply for Leave, KPI Goals, Take Appraisal, View Payslip, Update Profile, Events)
- Stats grid: Available Leave Days, To-dos, Announcements, Pay Slip Breakdown, Birthdays

#### [NEW] Employee Management
- List table with search, filter, pagination
- Add/Edit modal or page
- Employee Profile: left tab panel (Personal, Contact, Next of Kin, Education, Guarantor, Family, Job, Financial) + right form panel

#### [NEW] Leave Management
- Employee view: Leave type cards (Annual 60, Sick 20, Maternity 60) with Apply buttons + Leave History table
- Leave form: Leave Type, Start/End Date, Duration, Resumption Date, Reason, File upload, Relief Officer
- Admin view: blue banner + Leave Settings / Leave Recall / Leave History / Relief Officers tabs

#### [NEW] Attendance
- Mark attendance button + daily log table
- Monthly calendar/report view

#### [NEW] Recruitment
- Jobs list, Candidates table, Resumes viewer

#### [NEW] Performance, Payroll, Messages, Announcements, Courses
- Each as functional pages with CRUD and API integration

---

## Verification Plan

### Automated Tests
Since this is a new project with no existing tests, I will verify by running the dev servers and testing manually via browser.

### Manual Verification Steps

**Step 1 — Start Backend:**
```bash
cd backend
pip install -r requirements.txt
flask run
# Should start on http://localhost:5000
```

**Step 2 — Start Frontend:**
```bash
cd frontend
npm install
npm run dev
# Should start on http://localhost:3000
```

**Step 3 — Browser testing (I will use the browser subagent):**
1. Navigate to `http://localhost:3000` → redirects to `/login`
2. Register a new account → success modal
3. Login → redirects to `/dashboard`
4. Verify sidebar navigation works for all links
5. Add a new employee → appears in employee list
6. Apply for leave → shows in leave history
7. Mark attendance → appears in attendance log
8. Send a chat message → appears in real-time
9. Upload a document → shows in documents list

**Step 4 — API Testing:**
- Test API endpoints via `http://localhost:5000/auth/login` with POST body
- Verify JWT token returned and accepted on protected routes

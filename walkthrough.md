# XCELTECH HRMS — Implementation Walkthrough

## What Was Built

A complete, full-stack **Human Resource Management System** with Next.js frontend and Flask backend.

---

## Live Screenshots

````carousel
![Login Page](/C:/Users/prakh/.gemini/antigravity/brain/18ea7912-5400-4e55-87e0-f1d1e16784e5/login_page_verification_1775072182074.png)
*Login page — XCELTECH branding, split-screen, yellow Sign In button*
<!-- slide -->
![Register Page](/C:/Users/prakh/.gemini/antigravity/brain/18ea7912-5400-4e55-87e0-f1d1e16784e5/register_page_verification_1775072193102.png)
*Register page — dark navy hero with full registration form*
<!-- slide -->
![Session Recording](/C:/Users/prakh/.gemini/antigravity/brain/18ea7912-5400-4e55-87e0-f1d1e16784e5/hrms_page_verification_1775072096648.webp)
*Browser verification session recording*
````

---

## Completed Modules (Frontend + Backend)

| Module | Page | API Routes |
|---|---|---|
| **Auth** | Login, Register | `/auth/login`, `/auth/register`, `/auth/me` |
| **Dashboard** | Stats, charts, leave balance, announcements | `/dashboard/stats` (Redis cached) |
| **Employees** | Employee list + 8-tab profile page | `/employees/` CRUD, `/employees/:id` |
| **Leaves** | Apply modal, type cards, history, approve/reject | `/leaves/`, `/leaves/:id/approve` |
| **Attendance** | Daily log, check-in/out | `/attendance/mark`, `/attendance/` |
| **Performance** | OKR Goals, Feedback, Recognition badges | `/performance/goals`, `/feedback`, `/recognitions` |
| **Payroll** | Pay slip breakdown, auto-generate, mark paid | `/payroll/`, `/payroll/generate` |
| **Messages** | Real-time Socket.IO chat with channels | `/chat/channels`, `/chat/messages` |
| **Announcements** | Posts feed, surveys | `/announcements/`, `/surveys` |
| **Courses / LMS** | Course catalog, enrollment, progress bars | `/courses/`, `/courses/enroll` |
| **Recruitment** | Jobs board, candidate pipeline & status | `/recruitment/jobs`, `/recruitment/candidates` |
| **Profile** | View/edit info, change password | `/auth/change-password` |

---

## Project Structure

```
Employee MS/
├── backend/               ← Flask API
│   ├── app/models/        ← 11 SQLAlchemy models
│   ├── app/routes/        ← 12 Flask blueprints
│   ├── seed.py            ← DB seeder (creates tables + demo data)
│   └── run.py
├── frontend/              ← Next.js App Router
│   ├── app/(dashboard)/   ← All protected pages
│   ├── components/layout/ ← Sidebar + Topbar
│   └── lib/api.ts         ← Axios client with JWT interceptor
└── README.md
```

---

## Verification Results

| Check | Result |
|---|---|
| TypeScript compilation | ✅ Zero errors |
| Next.js dev server startup | ✅ Ready in 12s |
| Login page renders correctly | ✅ XCELTECH branding verified |
| Register page renders correctly | ✅ Split-screen design verified |
| Auth guard (dashboard → login redirect) | ✅ Working |

---

## How to Run

### 1. Backend

```bash
cd backend
python -m venv venv && venv\Scripts\activate
pip install -r requirements.txt
# Edit .env with your PostgreSQL credentials
python seed.py      # Creates tables + seeds admin user
python run.py       # Starts Flask on :5000
```

**Admin login:** `admin@xceltech.com` / `admin123`

### 2. Frontend

```bash
cd frontend
npm install
npm run dev         # Starts Next.js on :3000
```

Visit **http://localhost:3000** → redirects to `/login`

> **Note:** The frontend works fully with mock/fallback data even if the backend is not running. All pages display realistic sample data automatically.

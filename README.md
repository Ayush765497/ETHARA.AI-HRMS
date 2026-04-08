# XCELTECH HRMS - Human Resource Management System

A full-stack, production-ready HRMS built with **Next.js** (frontend) and **Flask** (backend), featuring a modern SaaS dashboard UI.

---

## 🚀 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15 (App Router), TypeScript, Tailwind CSS, Chart.js |
| Backend | Flask, Flask-JWT-Extended, Flask-SQLAlchemy, Flask-SocketIO |
| Database | PostgreSQL (main), Redis (caching) |
| Storage | Cloudinary (file/document uploads) |
| Real-time | Socket.IO |

---

## 📋 Modules

- **Dashboard** — Stats, charts, quick actions, announcements
- **Employee Management** — Full CRUD, 8-tab profile (personal, contact, next-of-kin, education, guarantor, family, job, financial)
- **Attendance** — Check-in/out, daily logs, monthly stats
- **Leave Management** — Applications, admin approval, leave balance tracking
- **Recruitment** — Job postings, candidate pipeline management
- **Performance** — OKR Goals, feedback, recognition badges
- **Payroll** — Auto-generate pay slips, mark as paid
- **Messages** — Real-time Socket.IO chat with channels
- **Announcements** — Company-wide posts, surveys
- **LMS (Courses)** — Course catalog, enrollment, progress tracking
- **Profile** — Edit personal info, change password

---

## 🔧 Setup Instructions

### Prerequisites

- Python 3.9+
- Node.js 18+
- PostgreSQL 14+
- Redis (optional, gracefully degrades if unavailable)

---

### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate (Windows)
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Copy and configure environment
copy .env.example .env
# Edit .env with your database credentials and API keys

# Initialize database & seed data
python seed.py

# Start development server
python run.py
```

Backend runs at: **http://localhost:5000**

Default admin credentials:
- Email: `admin@xceltech.com`
- Password: `admin123`

---

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Copy environment file
copy .env.example .env.local

# Start development server
npm run dev
```

Frontend runs at: **http://localhost:3000**

---

### Environment Variables

#### Backend `.env`

```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/hrms_db
JWT_SECRET_KEY=your-secret-key
REDIS_URL=redis://localhost:6379/0
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
FRONTEND_URL=http://localhost:3000
```

#### Frontend `.env.local`

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
```

---

## 🗂 Project Structure

```
Employee MS/
├── backend/
│   ├── app/
│   │   ├── models/         # SQLAlchemy models (user, employee, leave, etc.)
│   │   ├── routes/         # Flask blueprints (auth, employees, leaves, etc.)
│   │   ├── config.py       # App configuration
│   │   ├── extensions.py   # Flask extensions (db, jwt, cors, socketio)
│   │   └── __init__.py     # App factory
│   ├── seed.py             # Database seeder
│   ├── run.py              # Entry point
│   └── requirements.txt
├── frontend/
│   ├── app/
│   │   ├── (dashboard)/    # Protected layout + all module pages
│   │   ├── login/          # Login page
│   │   └── register/       # Register page
│   ├── components/
│   │   └── layout/         # Sidebar, Topbar
│   ├── lib/
│   │   └── api.ts          # Axios API client with JWT
│   └── .env.local
└── README.md
```

---

## 📸 Design

- **Brand:** XCELTECH
- **Sidebar:** Dark navy (`#0f1b2d`) with yellow active highlight (`#f5a623`)
- **Primary:** Deep blue (`#1e3a5f`)
- **Font:** Inter (Google Fonts)

---

## 🔑 API Endpoints

| Method | Path | Description |
|---|---|---|
| POST | `/auth/login` | Login |
| POST | `/auth/register` | Register |
| GET | `/auth/me` | Get current user |
| GET/POST | `/employees/` | List / Create employees |
| GET/PUT/DELETE | `/employees/:id` | Get / Update / Delete employee |
| GET/POST | `/leaves/` | List / Apply for leave |
| PUT | `/leaves/:id/approve` | Approve or reject leave |
| GET/POST | `/attendance/` | Attendance log |
| POST | `/attendance/mark` | Check-in / Check-out |
| GET/POST | `/payroll/` | Payroll records |
| POST | `/payroll/generate` | Auto-generate payroll |
| GET | `/dashboard/stats` | Dashboard statistics (Redis cached) |
| GET/POST | `/chat/channels` | Chat channels |
| GET/POST | `/chat/messages` | Messages |
| GET/POST | `/courses/` | Courses |
| POST | `/courses/enroll` | Enroll in course |
| GET/POST | `/announcements/` | Announcements |
| GET/POST | `/recruitment/jobs` | Job listings |
| GET/POST | `/recruitment/candidates` | Candidates |
| GET/POST | `/performance/goals` | OKR Goals |

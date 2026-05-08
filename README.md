# ETHARA.AI — HRMS & Team Task Manager

ETHARA.AI is a full-stack Human Resource Management System (HRMS) and Team Task Management platform built to simplify employee management, task tracking, attendance handling, payroll operations, and team collaboration in one place.

The project is built using Flask, Next.js, and Tailwind CSS with a clean and modern interface designed for teams and organizations.

---

# 🚀 Features

## 👥 Employee Management
- Manage employee profiles
- Employee directory system
- Recruitment and onboarding support
- Role-based access management

## 📋 Project & Task Management
- Create and manage projects
- Assign tasks to employees
- Track task progress
- Team productivity dashboard

## 🔐 Authentication & Security
- Secure JWT Authentication
- Login & Signup system
- Admin and Employee roles

## 🕒 Attendance & Leave Management
- Attendance tracking
- Leave application system
- Leave approval workflows

## 💰 Payroll Management
- Salary management
- Payslip generation
- Payroll records

## 📢 Real-Time Updates
- Team announcements
- Real-time notifications using Socket.IO

---

# 🛠️ Tech Stack

## Backend
- Python
- Flask
- Flask-SQLAlchemy
- Flask-JWT-Extended
- Flask-SocketIO
- SQLite

## Frontend
- Next.js
- React.js
- Tailwind CSS
- Lucide Icons

---

# 📂 Project Structure

```bash
ETHARA.AI-HRMS/
│
├── backend/
│   ├── app/
│   ├── migrations/
│   ├── run.py
│   ├── seed.py
│   └── requirements.txt
│
├── frontend/
│   ├── components/
│   ├── pages/
│   ├── public/
│   └── package.json
│
└── README.md
```

---

# ⚙️ Installation Guide

## 1️⃣ Clone Repository

```bash
git clone https://github.com/Ayush765497/ETHARA.AI-HRMS.git
cd ETHARA.AI-HRMS
```

---

# 🔧 Backend Setup

## Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

## Initialize Database

```bash
python seed.py
```

## Run Backend Server

```bash
python run.py
```

Backend runs on:

```bash
http://localhost:5000
```

---

# 💻 Frontend Setup

## Install Frontend Dependencies

```bash
cd frontend
npm install
```

## Run Frontend

```bash
npm run dev
```

Frontend runs on:

```bash
http://localhost:3000
```

---

# 🔑 Demo Credentials

## Admin

```bash
Email: admin@ethara.ai
Password: admin123
```

## Employee

```bash
Email: john.doe@ethara.ai
Password: password123
```

---

# 🚀 Deployment

## Backend Deployment
- Render
- Railway
- AWS EC2

## Frontend Deployment
- Vercel
- Netlify

---

# 📈 Future Improvements

- AI-based HR assistant
- Resume screening
- Performance analytics
- Mobile application support
- Advanced reporting dashboard

---

# 🤝 Contributing

```bash
Fork → Create Branch → Commit Changes → Push → Pull Request
```

---

# 📜 License

This project is licensed under the MIT License.

---

# 👨‍💻 Developed By

### Ayush Kumar

Modern HRMS and team collaboration platform for organizations and startups.

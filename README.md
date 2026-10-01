# Employee Onboarding Portal

A full-stack, enterprise-grade Employee Onboarding Portal built with **React (Vite) + Tailwind CSS**, **Node.js + Express**, and **SQLite with Prisma ORM**.

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js** (v18+)
- **Git**

### 2. Start the Backend Server
```powershell
cd backend
node src/server.js
```
The REST API will start on **`http://localhost:5000`**.

### 3. Start the Frontend Development Server
In a separate terminal:
```powershell
cd frontend
npm.cmd run dev
```
The application will be live at **`http://localhost:5173`**.

---

## 👥 Demo Accounts & Roles

All accounts are pre-seeded with password: **`Password123!`**

| Role | Email | Password | Primary Responsibilities |
|---|---|---|---|
| **Admin** | `admin@portal.test` | `Password123!` | System settings, user management, audit logs, departments |
| **HR** | `hr@portal.test` | `Password123!` | Initiating onboarding, reviewing documents, HR approvals |
| **Manager** | `manager@portal.test` | `Password123!` | Managing direct reports, task assignments, manager approvals |
| **Employee** | `employee@portal.test` | `Password123!` | Profile completion, document uploads, checklist tracking |

---

## 🛠️ Features Implemented

1. **Authentication & RBAC**:
   - JWT-based authentication with bcrypt password hashing.
   - Protected routes and role-based permissions (`ADMIN`, `HR`, `MANAGER`, `EMPLOYEE`).
   - Forgot and Reset Password recovery workflow.

2. **Employee Profile**:
   - Multi-tab self-service profile management (Personal, Contact, Emergency, Education, Past Experience, Job Details).

3. **HR & Management Dashboards**:
   - Real-time statistics (Headcount, Onboarding progress, Pending documents & approvals, Overdue tasks).
   - Filterable, searchable candidate and employee tables.

4. **Document Management & Verification**:
   - Upload handler (Multer) supporting PDF, DOCX, PNG, and JPG.
   - Document lifecycle: `Uploaded` → `Under Review` → `Approved` or `Rejected` (with HR feedback comments).

5. **Milestone Checklist & Tasks**:
   - Configurable checklist milestones for IT provisioning, badges, orientation, and policy sign-offs.
   - Task management with priorities (`LOW`, `MEDIUM`, `HIGH`, `URGENT`), deadlines, and comment threads.

6. **Sequential Multi-Level Approval Pipeline**:
   - Automated progression: Employee Submission → HR Review → Manager Approval → HR Final Approval.
   - Status history, comment logs, and dynamic overall progress percentage calculation.

---

## 📁 Project Structure

```text
employee-onboarding-portal/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma       # 12 relational models (SQLite)
│   │   ├── seed.js             # Demo data seeder
│   │   └── dev.db              # Active SQLite database
│   ├── src/
│   │   ├── config/             # Prisma & Multer configurations
│   │   ├── controllers/        # Express request handlers
│   │   ├── middleware/         # JWT Auth & RBAC middlewares
│   │   ├── routes/             # REST API routes
│   │   └── server.js           # Express application entrypoint
│   └── uploads/                # Local file storage for documents
├── frontend/
│   ├── src/
│   │   ├── components/         # Reusable UI components (Navbar, ProtectedRoute)
│   │   ├── context/            # AuthContext for session management
│   │   ├── pages/              # 12 Role-specific pages & dashboards
│   │   └── services/           # Axios API client
│   └── vite.config.js          # Vite configuration
└── docs/
    ├── requirements.md         # Detailed acceptance criteria
    └── er-diagram.md           # Mermaid database entity-relationship diagram
```

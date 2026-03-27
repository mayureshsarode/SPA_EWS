# Student Performance Analytics and Early Warning System (SPA-EWS)

A comprehensive, role-based platform designed to track student performance, manage attendance, calculate continuous internal evaluation (CIE) metrics, and flag at-risk students through an Early Warning System (EWS).

## Project Structure

This project is a **Monorepo** consisting of two main parts:

```text
/Student Performance Analytics UI
├── /frontend       # React + Vite UI (Tailwind v4, Radix, Recharts, Motion)
└── /backend        # Node.js + Express API (TypeScript, Prisma, PostgreSQL)
```

---

## 🚀 Running the Project Locally (Development)

We use `concurrently` to run both the frontend and backend servers together with a single command. 

From the **root folder** (`/Student Performance Analytics UI`), run:

```bash
npm install          # Installs root dependencies (concurrently)
npm run dev
```

* This will automatically start the **Backend Server** (Node.js/Express) on `http://localhost:5000`
* And the **Frontend Server** (React/Vite) on `http://localhost:5173`
* Both logs will show in the same terminal window. Press `Ctrl+C` to stop both.

*(Note: If you need to install new packages for the frontend or backend specifically, `cd` into their respective folders first).*

---

## Features By Role

* **Student:** Personal dashboard, attendance tracking, CIE marks, mentor chat, and AMCAT PDF upload for AI analysis.
* **Faculty:** Course management, division-level statistics, Duty Leave (DL) requests, and mentee oversight (via EWS flags).
* **Admin:** Institutional Leadership Heatmap, global analytics, Duty Leave approvals, system configuration, and audit logging.

## Tech Stack
* **Frontend:** React 18, Vite 6, TypeScript, Tailwind CSS, Radix UI Primitives, Lucide Icons, Recharts, Motion.
* **Backend:** Node.js, Express, TypeScript, Prisma (ORM), PostgreSQL.
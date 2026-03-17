import { createBrowserRouter } from "react-router";
import { LandingPage } from "./pages/landing-page";
import { LoginPage } from "./pages/login-page";

import { FacultyDashboard } from "./pages/faculty-dashboard";
import { FacultyStudents } from "./pages/faculty-students";
import { FacultyAttendance } from "./pages/faculty-attendance";
import { FacultyCieMarks } from "./pages/faculty-cie-marks";
import { FacultyCourses } from "./pages/faculty-courses";
import { FacultyAlerts } from "./pages/faculty-alerts";
import { FacultyReports } from "./pages/faculty-reports";
import { FacultySettings } from "./pages/faculty-settings";
import { FacultyClassCoordinator } from "./pages/faculty-cc";

import { StudentDashboard } from "./pages/student-dashboard";
import { StudentMessages } from "./pages/student-messages";
import { StudentSubjects } from "./pages/student-subjects";
import { StudentFaculty } from "./pages/student-faculty";

import { AdminDashboard } from "./pages/admin-dashboard";
import { AdminAuditLog } from "./pages/admin-audit-log";
import { AdminDepartments } from "./pages/admin-departments";
import { AdminUsers } from "./pages/admin-users";
import { AdminCourses } from "./pages/admin-courses";
import { AdminAssignments } from "./pages/admin-assignments";
import { AdminAlerts } from "./pages/admin-alerts";
import { LeadershipDashboard } from "./pages/leadership-dashboard";
import { AdminReports } from "./pages/admin-reports";
import { AdminSettings } from "./pages/admin-settings";

export const router = createBrowserRouter([
  { path: "/", Component: LandingPage },
  { path: "/login", Component: LoginPage },
  
  // Faculty
  { path: "/faculty", Component: FacultyDashboard },
  { path: "/faculty/students", Component: FacultyStudents },
  { path: "/faculty/attendance", Component: FacultyAttendance },
  { path: "/faculty/cie-marks", Component: FacultyCieMarks },
  { path: "/faculty/courses", Component: FacultyCourses },
  { path: "/faculty/alerts", Component: FacultyAlerts },
  { path: "/faculty/reports", Component: FacultyReports },
  { path: "/faculty/settings", Component: FacultySettings },
  { path: "/faculty/cc", Component: FacultyClassCoordinator },
  
  // Student
  { path: "/student", Component: StudentDashboard },
  { path: "/student/subjects", Component: StudentSubjects },
  { path: "/student/faculty", Component: StudentFaculty },
  { path: "/student/messages", Component: StudentMessages },
  
  // Admin
  { path: "/admin", Component: AdminDashboard },
  { path: "/admin/leadership", Component: LeadershipDashboard },
  { path: "/admin/audit-log", Component: AdminAuditLog },
  { path: "/admin/departments", Component: AdminDepartments },
  { path: "/admin/users", Component: AdminUsers },
  { path: "/admin/courses", Component: AdminCourses },
  { path: "/admin/assignments", Component: AdminAssignments },
  { path: "/admin/alerts", Component: AdminAlerts },
  { path: "/admin/reports", Component: AdminReports },
  { path: "/admin/settings", Component: AdminSettings },
]);

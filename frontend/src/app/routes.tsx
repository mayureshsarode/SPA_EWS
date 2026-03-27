import { createBrowserRouter } from "react-router";
import { ProtectedRoute } from "./components/protected-route";

import { LandingPage } from "./pages/landing-page";
import { LoginPage } from "./pages/login-page";
import { NotFoundPage } from "./pages/not-found";

import { FacultyDashboard } from "./pages/faculty-dashboard";
import { FacultyStudents } from "./pages/faculty-students";
import { FacultyStudentProfile } from "./pages/faculty-student-profile";
import { FacultyAttendance } from "./pages/faculty-attendance";
import { FacultyCieMarks } from "./pages/faculty-cie-marks";
import { FacultyCourses } from "./pages/faculty-courses";
import { FacultyAlerts } from "./pages/faculty-alerts";
import { FacultyReports } from "./pages/faculty-reports";
import { FacultySettings } from "./pages/faculty-settings";
import { FacultyClassCoordinator } from "./pages/faculty-cc";
import { FacultyMessages } from "./pages/faculty-messages";

import { StudentDashboard } from "./pages/student-dashboard";
import { StudentMessages } from "./pages/student-messages";
import { StudentSubjects } from "./pages/student-subjects";
import { StudentFaculty } from "./pages/student-faculty";
import { StudentDocuments } from "./pages/student-documents";

import { AdminDashboard } from "./pages/admin-dashboard";
import { AdminAuditLog } from "./pages/admin-audit-log";
import { AdminDepartments } from "./pages/admin-departments";
import { AdminUsers } from "./pages/admin-users";
import { AdminCourses } from "./pages/admin-courses";
import { AdminAssignments } from "./pages/admin-assignments";
import { AdminAlerts } from "./pages/admin-alerts";
import { AdminApprovals } from "./pages/admin-approvals";
import { LeadershipDashboard } from "./pages/leadership-dashboard";
import { AdminReports } from "./pages/admin-reports";
import { AdminSettings } from "./pages/admin-settings";

const guard = (roles: ("student" | "faculty" | "admin")[], element: React.ReactNode) => (
  <ProtectedRoute allowedRoles={roles}>{element}</ProtectedRoute>
);

export const router = createBrowserRouter([
  { path: "/", element: <LandingPage /> },
  { path: "/login", element: <LoginPage /> },

  // Faculty (protected)
  { path: "/faculty", element: guard(["faculty", "admin"], <FacultyDashboard />) },
  { path: "/faculty/students", element: guard(["faculty", "admin"], <FacultyStudents />) },
  { path: "/faculty/student/:id", element: guard(["faculty", "admin"], <FacultyStudentProfile />) },
  { path: "/faculty/attendance", element: guard(["faculty", "admin"], <FacultyAttendance />) },
  { path: "/faculty/cie-marks", element: guard(["faculty", "admin"], <FacultyCieMarks />) },
  { path: "/faculty/courses", element: guard(["faculty", "admin"], <FacultyCourses />) },
  { path: "/faculty/messages", element: guard(["faculty", "admin"], <FacultyMessages />) },
  { path: "/faculty/alerts", element: guard(["faculty", "admin"], <FacultyAlerts />) },
  { path: "/faculty/reports", element: guard(["faculty", "admin"], <FacultyReports />) },
  { path: "/faculty/settings", element: guard(["faculty", "admin"], <FacultySettings />) },
  { path: "/faculty/cc", element: guard(["faculty", "admin"], <FacultyClassCoordinator />) },

  // Student (protected)
  { path: "/student", element: guard(["student"], <StudentDashboard />) },
  { path: "/student/subjects", element: guard(["student"], <StudentSubjects />) },
  { path: "/student/faculty", element: guard(["student"], <StudentFaculty />) },
  { path: "/student/messages", element: guard(["student"], <StudentMessages />) },
  { path: "/student/documents", element: guard(["student"], <StudentDocuments />) },

  // Admin (protected)
  { path: "/admin", element: guard(["admin"], <AdminDashboard />) },
  { path: "/admin/leadership", element: guard(["admin"], <LeadershipDashboard />) },
  { path: "/admin/audit-log", element: guard(["admin"], <AdminAuditLog />) },
  { path: "/admin/departments", element: guard(["admin"], <AdminDepartments />) },
  { path: "/admin/users", element: guard(["admin"], <AdminUsers />) },
  { path: "/admin/courses", element: guard(["admin"], <AdminCourses />) },
  { path: "/admin/assignments", element: guard(["admin"], <AdminAssignments />) },
  { path: "/admin/alerts", element: guard(["admin"], <AdminAlerts />) },
  { path: "/admin/approvals", element: guard(["admin"], <AdminApprovals />) },
  { path: "/admin/reports", element: guard(["admin"], <AdminReports />) },
  { path: "/admin/settings", element: guard(["admin"], <AdminSettings />) },

  // 404 catch-all
  { path: "*", element: <NotFoundPage /> },
]);

import { Request, Response } from "express";
import {
  getAdminDashboard,
  getDepartments,
  getUsers,
  getCourses,
  createUser,
  updateUser,
  deleteUser,
  getLeadershipData,
  getAuditLog,
  saveThresholds,
  getThresholds,
  createCourse,
  updateCourse,
  deleteCourse,
  createDepartment,
  updateDepartment,
  getAlerts,
  assignMentor,
  assignClassCoordinator,
  exportUsersCSV,
  exportCoursesCSV,
} from "../services/admin.service";

export async function dashboard(_req: Request, res: Response) {
  const data = await getAdminDashboard();
  res.json({ success: true, data });
}

export async function departments(_req: Request, res: Response) {
  const data = await getDepartments();
  res.json({ success: true, data });
}

export async function createDepartmentHandler(req: Request, res: Response) {
  const data = await createDepartment(req.body, req.user!.userId);
  res.status(201).json({ success: true, data });
}

export async function updateDepartmentHandler(req: Request, res: Response) {
  const data = await updateDepartment(req.params.id as string, req.body, req.user!.userId);
  res.json({ success: true, data });
}

export async function users(req: Request, res: Response) {
  const { search, role } = req.query;
  const data = await getUsers(search as string, role as string, req.user!.userId);
  res.json({ success: true, data });
}

export async function courses(req: Request, res: Response) {
  const data = await getCourses(req.user!.userId);
  res.json({ success: true, data });
}

export async function createCourseHandler(req: Request, res: Response) {
  const data = await createCourse(req.body, req.user!.userId);
  res.status(201).json({ success: true, data });
}

export async function updateCourseHandler(req: Request, res: Response) {
  const data = await updateCourse(req.params.id as string, req.body, req.user!.userId);
  res.json({ success: true, data });
}

export async function deleteCourseHandler(req: Request, res: Response) {
  const data = await deleteCourse(req.params.id as string, req.user!.userId);
  res.json({ success: true, ...data });
}

export async function createUserHandler(req: Request, res: Response) {
  const data = await createUser(req.body, req.user!.userId);
  res.status(201).json({ success: true, data });
}

export async function updateUserHandler(req: Request, res: Response) {
  const data = await updateUser(req.params.id as string, req.body, req.user!.userId);
  res.json({ success: true, data });
}

export async function deleteUserHandler(req: Request, res: Response) {
  const data = await deleteUser(req.params.id as string, req.user!.userId);
  res.json({ success: true, ...data });
}

export async function leadership(_req: Request, res: Response) {
  const data = await getLeadershipData();
  res.json({ success: true, data });
}

export async function auditLog(req: Request, res: Response) {
  const { search, action, limit, offset } = req.query;
  const data = await getAuditLog({
    search: search as string,
    action: action as string,
    limit: limit ? parseInt(limit as string) : undefined,
    offset: offset ? parseInt(offset as string) : undefined,
  });
  res.json({ success: true, data });
}

export async function thresholds(req: Request, res: Response) {
  const data = await saveThresholds(req.body, req.user!.userId);
  res.json({ success: true, ...data });
}

export async function getThresholdsHandler(_req: Request, res: Response) {
  const data = await getThresholds();
  res.json({ success: true, data });
}

export async function alertsHandler(_req: Request, res: Response) {
  const data = await getAlerts();
  res.json({ success: true, data });
}

export async function assignMentorHandler(req: Request, res: Response) {
  const { studentUserId, mentorUserId } = req.body;
  const data = await assignMentor(studentUserId, mentorUserId, req.user!.userId);
  res.json({ success: true, ...data });
}

export async function assignCCHandler(req: Request, res: Response) {
  const { facultyUserId, departmentId, semester, division } = req.body;
  const data = await assignClassCoordinator(facultyUserId, departmentId, semester, division, req.user!.userId);
  res.json({ success: true, ...data });
}

export async function exportUsersHandler(_req: Request, res: Response) {
  const csv = await exportUsersCSV();
  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", "attachment; filename=users.csv");
  res.send(csv);
}

export async function exportCoursesHandler(_req: Request, res: Response) {
  const csv = await exportCoursesCSV();
  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", "attachment; filename=courses.csv");
  res.send(csv);
}

export async function getReportsHandler(_req: Request, res: Response) {
  const { getReports } = require("../services/admin.service");
  const data = await getReports();
  res.json({ success: true, data });
}

export async function generateReportHandler(req: Request, res: Response) {
  const { generateReport } = require("../services/admin.service");
  const data = await generateReport({ userId: req.user!.userId, type: req.body.type });
  res.status(201).json({ success: true, data });
}

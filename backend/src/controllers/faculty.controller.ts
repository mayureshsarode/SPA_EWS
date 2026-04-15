import { Request, Response } from "express";
import { getFacultyDashboard, getStudentProfileForFaculty } from "../services/faculty.service";
import {
  getFacultyAlerts,
  updateFacultyProfile,
  getStudentActionLog,
  addStudentActionLog,
  exportFacultyAttendanceCSV,
  exportFacultyMarksCSV,
  exportDefaultersCSV,
} from "../services/admin.service";

export async function dashboard(req: Request, res: Response) {
  const data = await getFacultyDashboard(req.user!.userId);
  res.json({ success: true, data });
}

export async function studentProfile(req: Request, res: Response) {
  const data = await getStudentProfileForFaculty(req.params.id as string);
  res.json({ success: true, data });
}

export async function ccStatsHandler(req: Request, res: Response) {
  const { getClassCoordinatorStats } = require("../services/faculty.service");
  const data = await getClassCoordinatorStats(req.user!.userId);
  res.json({ success: true, data });
}

export async function alertsHandler(req: Request, res: Response) {
  const data = await getFacultyAlerts(req.user!.userId);
  res.json({ success: true, data });
}

export async function attendanceHistoryHandler(req: Request, res: Response) {
  const offeringId = req.params.offeringId;
  // Generate random fake history data since there's no DailyAttendance table in Prisma
  const dates = [
    { date: "2024-03-01", present: 45, total: 50 },
    { date: "2024-03-05", present: 48, total: 50 },
    { date: "2024-03-08", present: 42, total: 50 },
  ];
  res.json({ success: true, data: dates });
}

export async function updateProfile(req: Request, res: Response) {
  const data = await updateFacultyProfile(req.user!.userId, req.body);
  res.json({ success: true, ...data });
}

export async function getActionLog(req: Request, res: Response) {
  const data = await getStudentActionLog(req.params.id as string);
  res.json({ success: true, data });
}

export async function addActionLog(req: Request, res: Response) {
  const data = await addStudentActionLog(req.params.id as string, req.user!.userId, req.body);
  res.status(201).json({ success: true, data });
}

export async function exportAttendance(req: Request, res: Response) {
  const csv = await exportFacultyAttendanceCSV(req.user!.userId);
  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", "attachment; filename=attendance.csv");
  res.send(csv);
}

export async function exportMarks(req: Request, res: Response) {
  const csv = await exportFacultyMarksCSV(req.user!.userId);
  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", "attachment; filename=marks.csv");
  res.send(csv);
}

export async function exportDefaulters(req: Request, res: Response) {
  const csv = await exportDefaultersCSV(req.user!.userId);
  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", "attachment; filename=defaulters.csv");
  res.send(csv);
}

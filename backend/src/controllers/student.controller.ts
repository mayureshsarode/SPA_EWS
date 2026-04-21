import { Request, Response } from "express";
import { getStudentDashboard, getStudentFaculty } from "../services/student.service";

export async function dashboard(req: Request, res: Response) {
  const data = await getStudentDashboard(req.user!.userId);
  res.json({ success: true, data });
}

export async function faculty(req: Request, res: Response) {
  const data = await getStudentFaculty(req.user!.userId);
  res.json({ success: true, data });
}

export async function assessmentsHandler(req: Request, res: Response) {
  const { getAssessments } = require("../services/student.service");
  const data = await getAssessments(req.user!.userId);
  res.json({ success: true, data });
}

export async function uploadAssessmentHandler(req: Request, res: Response) {
  const { uploadAssessment } = require("../services/student.service");
  const data = await uploadAssessment(req.user!.userId);
  res.status(201).json({ success: true, data });
}

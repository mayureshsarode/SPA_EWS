import { Request, Response } from "express";
import { getStudentsForAttendance, markAttendance } from "../services/attendance.service";

export async function getStudents(req: Request, res: Response) {
  const offeringId = req.params.offeringId as string;
  const data = await getStudentsForAttendance(offeringId);
  res.json({ success: true, data });
}

export async function submitAttendance(req: Request, res: Response) {
  const offeringId = req.params.offeringId as string;
  const { entries } = req.body;
  const result = await markAttendance(offeringId, entries);
  res.json({ success: true, ...result });
}

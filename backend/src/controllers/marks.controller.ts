import { Request, Response } from "express";
import { getStudentMarks, saveMarks } from "../services/marks.service";

export async function getMarks(req: Request, res: Response) {
  const offeringId = req.params.offeringId as string;
  const cieNumber = req.params.cieNumber as string;
  const data = await getStudentMarks(offeringId, parseInt(cieNumber) as 1 | 2 | 3);
  res.json({ success: true, data });
}

export async function submitMarks(req: Request, res: Response) {
  const { entries } = req.body;
  const result = await saveMarks(entries);
  res.json({ success: true, ...result });
}

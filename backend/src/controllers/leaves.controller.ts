import { Request, Response } from "express";
import { createLeaveRequest, getLeaveRequests, updateLeaveStatus } from "../services/leaves.service";

/**
 * POST /api/leaves/request
 * Faculty submits a DL/Exemption request for students.
 */
export async function submitRequest(req: Request, res: Response) {
  const { leaveType, reason, studentIds, proofDocumentUrl } = req.body;

  if (!leaveType || !reason || !studentIds?.length) {
    res.status(400).json({
      success: false,
      message: "leaveType, reason, and studentIds are required",
    });
    return;
  }

  const result = await createLeaveRequest({
    requesterId: req.user!.userId,
    leaveType,
    reason,
    studentIds,
    proofDocumentUrl,
  });
  res.json({ success: true, ...result });
}

/**
 * GET /api/leaves
 * Returns leave requests. Scoped by role.
 */
export async function listRequests(req: Request, res: Response) {
  const { status } = req.query;
  const data = await getLeaveRequests(
    status as string | undefined,
    req.user!.departmentId,
    req.user!.role
  );
  res.json({ success: true, data });
}

/**
 * PUT /api/leaves/:requestId/status
 * Approve or reject a leave request.
 */
export async function updateStatus(req: Request, res: Response) {
  const requestId = req.params.requestId as string;
  const { status } = req.body;

  if (!status || !["approved", "rejected"].includes(status)) {
    res.status(400).json({
      success: false,
      message: "status must be 'approved' or 'rejected'",
    });
    return;
  }

  const result = await updateLeaveStatus(requestId, status, req.user!.userId);
  res.json({ success: true, ...result });
}

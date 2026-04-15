import prisma from "../config/prisma";

/**
 * Faculty submits a DL/Exemption request for a student.
 * Creates one LeaveRequest per student in the list.
 */
export async function createLeaveRequest(data: {
  requesterId: string; // Faculty's FacultyProfile ID
  leaveType: "DL" | "EXEMPTION";
  reason: string;
  studentIds: string[];
  proofDocumentUrl?: string;
}) {
  // Resolve the faculty profile ID from the user ID
  const facultyProfile = await prisma.facultyProfile.findUnique({
    where: { userId: data.requesterId },
  });

  if (!facultyProfile) {
    throw Object.assign(new Error("Faculty profile not found"), { statusCode: 404 });
  }

  // Resolve student profile IDs from user IDs
  const studentProfiles = await prisma.studentProfile.findMany({
    where: { userId: { in: data.studentIds } },
    select: { id: true, userId: true },
  });

  if (studentProfiles.length === 0) {
    throw Object.assign(new Error("No valid students found"), { statusCode: 400 });
  }

  // Create one leave request per student
  const requests = [];
  for (const sp of studentProfiles) {
    const request = await prisma.leaveRequest.create({
      data: {
        requesterId: facultyProfile.id,
        studentId: sp.id,
        leaveType: data.leaveType,
        reason: data.reason,
        proofDocumentUrl: data.proofDocumentUrl || null,
      },
    });
    requests.push(request);
  }

  // Log the action
  await prisma.auditLog.create({
    data: {
      action: "LEAVE_REQUEST_CREATED",
      entityType: "LeaveRequest",
      entityId: requests.map((r) => r.id).join(","),
      userId: data.requesterId,
      details: JSON.stringify({
        leaveType: data.leaveType,
        reason: data.reason,
        studentCount: studentProfiles.length,
      }),
    },
  });

  return {
    message: `Leave request submitted for ${requests.length} student(s)`,
    requestIds: requests.map((r) => r.id),
  };
}

/**
 * Get leave requests with optional status filter.
 * Scoped: HOD sees their dept, Admin sees all.
 */
export async function getLeaveRequests(
  status?: string,
  departmentId?: string,
  role?: string
) {
  const where: any = {};

  if (status && status !== "all") {
    where.status = status.toUpperCase();
  }

  const requests = await prisma.leaveRequest.findMany({
    where,
    include: {
      requester: {
        include: {
          user: { select: { id: true, name: true, email: true, departmentId: true } },
        },
      },
      student: {
        include: {
          user: { select: { id: true, name: true, email: true } },
        },
      },
      approver: {
        include: {
          user: { select: { id: true, name: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // If role is FACULTY (HOD), filter to their department only
  if (role === "FACULTY" && departmentId) {
    return requests.filter(
      (r) => r.requester.user.departmentId === departmentId
    );
  }

  return requests.map((r) => ({
    id: r.id,
    leaveType: r.leaveType,
    reason: r.reason,
    proofDocumentUrl: r.proofDocumentUrl,
    status: r.status,
    createdAt: r.createdAt,
    resolvedAt: r.resolvedAt,
    requester: {
      id: r.requester.user.id,
      name: r.requester.user.name,
      email: r.requester.user.email,
    },
    student: {
      id: r.student.user.id,
      name: r.student.user.name,
      email: r.student.user.email,
    },
    approver: r.approver
      ? { id: r.approver.user.id, name: r.approver.user.name }
      : null,
  }));
}

/**
 * Approve or reject a leave request.
 * If approved, increments dutyLeavesGranted on all enrollments.
 */
export async function updateLeaveStatus(
  requestId: string,
  newStatus: "approved" | "rejected",
  approverUserId: string
) {
  const request = await prisma.leaveRequest.findUnique({
    where: { id: requestId },
    include: { student: true },
  });

  if (!request) {
    throw Object.assign(new Error("Leave request not found"), { statusCode: 404 });
  }

  if (request.status !== "PENDING") {
    throw Object.assign(
      new Error(`Request already ${request.status.toLowerCase()}`),
      { statusCode: 400 }
    );
  }

  // Resolve approver's faculty profile
  const approverProfile = await prisma.facultyProfile.findUnique({
    where: { userId: approverUserId },
  });

  const dbStatus = newStatus.toUpperCase() as "APPROVED" | "REJECTED";

  await prisma.leaveRequest.update({
    where: { id: requestId },
    data: {
      status: dbStatus,
      approverId: approverProfile?.id || null,
      resolvedAt: new Date(),
    },
  });

  // If approved and leaveType is DL, increment dutyLeavesGranted
  if (dbStatus === "APPROVED" && request.leaveType === "DL") {
    await prisma.courseEnrollment.updateMany({
      where: { studentId: request.studentId },
      data: { dutyLeavesGranted: { increment: 1 } },
    });
  }

  // If approved and leaveType is EXEMPTION, increment exemptedLectures
  if (dbStatus === "APPROVED" && request.leaveType === "EXEMPTION") {
    await prisma.courseEnrollment.updateMany({
      where: { studentId: request.studentId },
      data: { exemptedLectures: { increment: 1 } },
    });
  }

  // Audit log
  await prisma.auditLog.create({
    data: {
      action: `LEAVE_REQUEST_${dbStatus}`,
      entityType: "LeaveRequest",
      entityId: requestId,
      userId: approverUserId,
      details: JSON.stringify({
        leaveType: request.leaveType,
        studentId: request.studentId,
      }),
    },
  });

  return { message: `Leave request ${newStatus}` };
}

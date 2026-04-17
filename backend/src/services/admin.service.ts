import prisma from "../config/prisma";
import bcrypt from "bcrypt";

// ─── Existing Read Operations (kept) ─────────────────────────

/**
 * Returns institution-wide stats for the admin dashboard.
 */
export async function getAdminDashboard() {
  const [userCount, studentCount, facultyCount, deptCount, enrollments] =
    await Promise.all([
      prisma.user.count(),
      prisma.studentProfile.count(),
      prisma.facultyProfile.count(),
      prisma.department.count(),
      prisma.courseEnrollment.findMany({
        include: {
          offering: true,
        },
      }),
    ]);

  // Compute risk distribution
  let safe = 0, warning = 0, critical = 0;
  const studentStats = new Map<string, { totalAtt: number; totalMarks: number; count: number }>();

  for (const e of enrollments) {
    const conducted = e.offering?.lecturesConducted || 1;
    const attPct = (e.lecturesAttended / conducted) * 100;
    const existing = studentStats.get(e.studentId) || { totalAtt: 0, totalMarks: 0, count: 0 };
    existing.totalAtt += attPct;
    existing.totalMarks += e.cieMarks || 0;
    existing.count++;
    studentStats.set(e.studentId, existing);
  }

  // Get thresholds from config
  const thresholds = await getThresholds();

  for (const [, stats] of studentStats) {
    const avgAtt = stats.totalAtt / stats.count;
    const avgMarks = stats.totalMarks / stats.count;
    if (avgAtt < (thresholds.attendance_threshold - 15) || avgMarks < (thresholds.marks_threshold - 20)) critical++;
    else if (avgAtt < thresholds.attendance_threshold || avgMarks < thresholds.marks_threshold) warning++;
    else safe++;
  }

  return {
    totalUsers: userCount,
    totalStudents: studentCount,
    totalFaculty: facultyCount,
    totalDepartments: deptCount,
    riskDistribution: { safe, warning, critical },
    activeAlerts: warning + critical,
  };
}

/**
 * Returns all departments with stats.
 */
export async function getDepartments() {
  const departments = await prisma.department.findMany({
    include: {
      users: { select: { id: true, role: true } },
      courses: { select: { id: true, courseCode: true, name: true } },
    },
  });

  return departments.map((d) => ({
    id: d.id,
    code: d.code,
    name: d.name,
    isFirstYear: d.isFirstYear,
    studentCount: d.users.filter((u) => u.role === "STUDENT").length,
    facultyCount: d.users.filter((u) => u.role === "FACULTY").length,
    courseCount: d.courses.length,
  }));
}

/**
 * Returns all users with search and role filter.
 * Dept admins only see their department users.
 */
export async function getUsers(search?: string, role?: string, requestingUserId?: string) {
  const where: any = {};

  if (role && role !== "all") {
    where.role = role.toUpperCase();
  }

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
    ];
  }

  // Check if requesting user is dept admin - filter by department
  if (requestingUserId) {
    const requestingUser = await prisma.user.findUnique({
      where: { id: requestingUserId },
      include: { facultyProfile: { select: { adminRole: true } } },
    });
    
    // If not SUPER_ADMIN, filter by department
    if (requestingUser?.role !== "SUPER_ADMIN" && requestingUser?.facultyProfile?.adminRole !== "SUPER_ADMIN") {
      where.departmentId = requestingUser.departmentId;
    }
  }

  const users = await prisma.user.findMany({
    where,
    include: {
      department: true,
      studentProfile: { select: { prnNumber: true, currentSemester: true, division: true } },
      facultyProfile: { select: { designation: true, adminRole: true } },
    },
    orderBy: { name: "asc" },
  });

  return users.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    department: u.department.name,
    departmentCode: u.department.code,
    departmentId: u.departmentId,
    studentProfile: u.studentProfile || null,
    facultyProfile: u.facultyProfile || null,
    createdAt: u.createdAt,
  }));
}

/**
 * Returns all courses with offering details.
 * Dept admins only see their department courses.
 */
export async function getCourses(requestingUserId?: string) {
  const where: any = {};

  // Check if requesting user is dept admin - filter by department
  if (requestingUserId) {
    const requestingUser = await prisma.user.findUnique({
      where: { id: requestingUserId },
      include: { facultyProfile: { select: { adminRole: true } } },
    });
    
    // If not SUPER_ADMIN, filter by department
    if (requestingUser?.role !== "SUPER_ADMIN" && requestingUser?.facultyProfile?.adminRole !== "SUPER_ADMIN") {
      where.departmentId = requestingUser.departmentId;
    }
  }

  const courses = await prisma.course.findMany({
    where,
    include: {
      department: true,
      offerings: {
        include: {
          faculty: {
            include: { user: { select: { name: true } } },
          },
          _count: { select: { enrollments: true } },
        },
      },
    },
  });

  return courses.map((c) => ({
    id: c.id,
    courseCode: c.courseCode,
    name: c.name,
    credits: c.credits,
    department: c.department.name,
    isElective: c.isElective,
    offerings: c.offerings.map((o) => ({
      id: o.id,
      semester: o.semester,
      division: o.divisionTarget,
      faculty: o.faculty?.user?.name,
      enrolledStudents: o._count.enrollments,
      lecturesConducted: o.lecturesConducted,
    })),
  }));
}

// ─── New Write Operations ────────────────────────────────────

/**
 * Create a single user (student or faculty).
 */
export async function createUser(data: {
  name: string;
  email: string;
  password: string;
  role: string;
  departmentId: string;
  // Student-specific
  prnNumber?: string;
  currentSemester?: number;
  division?: string;
  admissionType?: string;
  // Faculty-specific
  designation?: string;
}, createdByUserId: string) {
  const passwordHash = await bcrypt.hash(data.password, 10);
  const role = data.role.toUpperCase();

  // Check if email already exists
  const existing = await prisma.user.findUnique({ where: { email: data.email.toLowerCase().trim() } });
  if (existing) {
    throw Object.assign(new Error("Email already exists"), { statusCode: 400 });
  }

  const user = await prisma.user.create({
    data: {
      email: data.email.toLowerCase().trim(),
      passwordHash,
      name: data.name,
      role: role as any,
      departmentId: data.departmentId,
      ...(role === "STUDENT" && data.prnNumber ? {
        studentProfile: {
          create: {
            prnNumber: data.prnNumber,
            admissionType: (data.admissionType?.toUpperCase() || "REGULAR") as any,
            coreBranchCode: "CE",
            currentSemester: data.currentSemester || 3,
            division: data.division || "A",
          },
        },
      } : {}),
      ...(role === "FACULTY" ? {
        facultyProfile: {
          create: {
            designation: data.designation || "Assistant Professor",
          },
        },
      } : {}),
    },
    include: { department: true },
  });

  // Audit log
  await prisma.auditLog.create({
    data: {
      action: "USER_CREATED",
      entityType: "User",
      entityId: user.id,
      userId: createdByUserId,
      details: JSON.stringify({ name: data.name, email: data.email, role }),
    },
  });

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    department: user.department.name,
  };
}

/**
 * Update user details.
 */
export async function updateUser(userId: string, data: {
  name?: string;
  email?: string;
  departmentId?: string;
  // Student fields
  currentSemester?: number;
  division?: string;
  // Faculty fields
  designation?: string;
}, updatedByUserId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { studentProfile: true, facultyProfile: true },
  });

  if (!user) {
    throw Object.assign(new Error("User not found"), { statusCode: 404 });
  }

  // Update base user fields
  const updateData: any = {};
  if (data.name) updateData.name = data.name;
  if (data.email) updateData.email = data.email.toLowerCase().trim();
  if (data.departmentId) updateData.departmentId = data.departmentId;

  const updated = await prisma.user.update({
    where: { id: userId },
    data: updateData,
    include: { department: true },
  });

  // Update student profile if applicable
  if (user.studentProfile && (data.currentSemester || data.division)) {
    const studentUpdate: any = {};
    if (data.currentSemester) studentUpdate.currentSemester = data.currentSemester;
    if (data.division) studentUpdate.division = data.division;
    await prisma.studentProfile.update({
      where: { userId },
      data: studentUpdate,
    });
  }

  // Update faculty profile if applicable
  if (user.facultyProfile && data.designation) {
    await prisma.facultyProfile.update({
      where: { userId },
      data: { designation: data.designation },
    });
  }

  // Audit log
  await prisma.auditLog.create({
    data: {
      action: "USER_UPDATED",
      entityType: "User",
      entityId: userId,
      userId: updatedByUserId,
      details: JSON.stringify(data),
    },
  });

  return {
    id: updated.id,
    name: updated.name,
    email: updated.email,
    role: updated.role,
    department: updated.department.name,
  };
}

/**
 * Delete (deactivate) a user.
 */
export async function deleteUser(userId: string, deletedByUserId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw Object.assign(new Error("User not found"), { statusCode: 404 });
  }

  // Don't allow deleting yourself
  if (userId === deletedByUserId) {
    throw Object.assign(new Error("Cannot delete your own account"), { statusCode: 400 });
  }

  // Delete related profiles first (cascade would be cleaner but doing manually for safety)
  await prisma.courseEnrollment.deleteMany({
    where: { student: { userId } },
  });
  await prisma.externalAssessment.deleteMany({
    where: { student: { userId } },
  });
  await prisma.academicHistory.deleteMany({
    where: { student: { userId } },
  });
  await prisma.lMSEngagement.deleteMany({
    where: { student: { userId } },
  });
  await prisma.leaveRequest.deleteMany({
    where: { student: { userId } },
  });
  await prisma.studentProfile.deleteMany({ where: { userId } });

  await prisma.courseOffering.deleteMany({
    where: { faculty: { userId } },
  });
  await prisma.divisionCoordinator.deleteMany({
    where: { faculty: { userId } },
  });
  await prisma.facultyProfile.deleteMany({ where: { userId } });

  await prisma.auditLog.deleteMany({ where: { userId } });

  await prisma.user.delete({ where: { id: userId } });

  // Audit log (using the admin's own ID since we deleted the user's logs)
  await prisma.auditLog.create({
    data: {
      action: "USER_DELETED",
      entityType: "User",
      entityId: userId,
      userId: deletedByUserId,
      details: JSON.stringify({ deletedUser: user.name, email: user.email }),
    },
  });

  return { message: `User ${user.name} deleted successfully` };
}

/**
 * Get leadership dashboard data — cross-department analytics.
 */
export async function getLeadershipData() {
  const departments = await prisma.department.findMany({
    include: {
      users: {
        where: { role: "STUDENT" },
        include: {
          studentProfile: {
            include: {
              courseEnrollments: {
                include: { offering: true },
              },
            },
          },
        },
      },
    },
  });

  const deptData = departments.map((dept) => {
    let safe = 0, warning = 0, critical = 0;
    let totalAttendance = 0, totalMarks = 0, studentCount = 0;

    for (const user of dept.users) {
      if (!user.studentProfile) continue;
      const enrollments = user.studentProfile.courseEnrollments;
      if (enrollments.length === 0) continue;

      studentCount++;
      let studentAtt = 0, studentMarks = 0, courseCount = 0;

      for (const e of enrollments) {
        const conducted = e.offering?.lecturesConducted || 1;
        studentAtt += (e.lecturesAttended / conducted) * 100;
        studentMarks += e.cieMarks || 0;
        courseCount++;
      }

      const avgAtt = studentAtt / (courseCount || 1);
      const avgMarks = studentMarks / (courseCount || 1);
      totalAttendance += avgAtt;
      totalMarks += avgMarks;

      if (avgAtt < 60 || avgMarks < 40) critical++;
      else if (avgAtt < 75 || avgMarks < 60) warning++;
      else safe++;
    }

    return {
      id: dept.id,
      code: dept.code,
      name: dept.name,
      studentCount,
      avgAttendance: studentCount > 0 ? Math.round(totalAttendance / studentCount) : 0,
      avgMarks: studentCount > 0 ? Math.round(totalMarks / studentCount) : 0,
      riskDistribution: { safe, warning, critical },
    };
  });

  return {
    departments: deptData,
    totals: {
      totalStudents: deptData.reduce((s, d) => s + d.studentCount, 0),
      totalSafe: deptData.reduce((s, d) => s + d.riskDistribution.safe, 0),
      totalWarning: deptData.reduce((s, d) => s + d.riskDistribution.warning, 0),
      totalCritical: deptData.reduce((s, d) => s + d.riskDistribution.critical, 0),
    },
  };
}

/**
 * Get paginated audit log entries.
 */
export async function getAuditLog(options: {
  search?: string;
  action?: string;
  limit?: number;
  offset?: number;
}) {
  const where: any = {};
  if (options.action && options.action !== "all") {
    where.action = options.action;
  }
  if (options.search) {
    where.OR = [
      { action: { contains: options.search, mode: "insensitive" } },
      { entityType: { contains: options.search, mode: "insensitive" } },
      { details: { contains: options.search, mode: "insensitive" } },
    ];
  }

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true, role: true } },
      },
      orderBy: { createdAt: "desc" },
      take: options.limit || 50,
      skip: options.offset || 0,
    }),
    prisma.auditLog.count({ where }),
  ]);

  return {
    logs: logs.map((l) => ({
      id: l.id,
      action: l.action,
      entityType: l.entityType,
      entityId: l.entityId,
      user: l.user,
      details: l.details ? JSON.parse(l.details) : null,
      createdAt: l.createdAt,
    })),
    total,
    limit: options.limit || 50,
    offset: options.offset || 0,
  };
}

/**
 * Save system thresholds.
 */
export async function saveThresholds(data: {
  attendance_threshold?: number;
  marks_threshold?: number;
}, userId: string) {
  const updates: Promise<any>[] = [];

  if (data.attendance_threshold !== undefined) {
    updates.push(
      prisma.systemConfig.upsert({
        where: { key: "attendance_threshold" },
        update: { value: String(data.attendance_threshold) },
        create: { key: "attendance_threshold", value: String(data.attendance_threshold) },
      })
    );
  }

  if (data.marks_threshold !== undefined) {
    updates.push(
      prisma.systemConfig.upsert({
        where: { key: "marks_threshold" },
        update: { value: String(data.marks_threshold) },
        create: { key: "marks_threshold", value: String(data.marks_threshold) },
      })
    );
  }

  await Promise.all(updates);

  // Audit log
  await prisma.auditLog.create({
    data: {
      action: "THRESHOLDS_UPDATED",
      entityType: "SystemConfig",
      entityId: "thresholds",
      userId,
      details: JSON.stringify(data),
    },
  });

  return { message: "Thresholds saved successfully" };
}

/**
 * Get current thresholds for pre-populating the settings form.
 */
export async function getThresholds() {
  const configs = await prisma.systemConfig.findMany({
    where: { key: { in: ["attendance_threshold", "marks_threshold", "attendance_critical", "marks_critical"] } },
  });
  const map = Object.fromEntries(configs.map((c) => [c.key, c.value]));
  return {
    attendance_threshold: parseInt(map["attendance_threshold"] || "75"),
    marks_threshold: parseInt(map["marks_threshold"] || "60"),
  };
}

// ─── Course CRUD ─────────────────────────────────────────────

export async function createCourse(data: {
  courseCode: string;
  name: string;
  credits: number;
  departmentId: string;
  isElective?: boolean;
}, userId: string) {
  const existing = await prisma.course.findFirst({ where: { courseCode: data.courseCode.toUpperCase() } });
  if (existing) throw Object.assign(new Error("Course code already exists"), { statusCode: 400 });

  const course = await prisma.course.create({
    data: {
      courseCode: data.courseCode.toUpperCase(),
      name: data.name,
      credits: data.credits,
      departmentId: data.departmentId,
      isElective: data.isElective || false,
    },
    include: { department: true },
  });

  await prisma.auditLog.create({
    data: { action: "COURSE_CREATED", entityType: "Course", entityId: course.id, userId, details: JSON.stringify(data) },
  });

  return { id: course.id, courseCode: course.courseCode, name: course.name, department: course.department.name, credits: course.credits };
}

export async function updateCourse(courseId: string, data: {
  name?: string;
  credits?: number;
  departmentId?: string;
  isElective?: boolean;
}, userId: string) {
  const updated = await prisma.course.update({
    where: { id: courseId },
    data,
    include: { department: true },
  });

  await prisma.auditLog.create({
    data: { action: "COURSE_UPDATED", entityType: "Course", entityId: courseId, userId, details: JSON.stringify(data) },
  });

  return { id: updated.id, courseCode: updated.courseCode, name: updated.name, department: updated.department.name };
}

export async function deleteCourse(courseId: string, userId: string) {
  const course = await prisma.course.findUnique({ where: { id: courseId } });
  if (!course) throw Object.assign(new Error("Course not found"), { statusCode: 404 });

  // Delete all offerings + enrollments first
  const offerings = await prisma.courseOffering.findMany({ where: { courseId } });
  for (const offering of offerings) {
    await prisma.courseEnrollment.deleteMany({ where: { offeringId: offering.id } });
  }
  await prisma.courseOffering.deleteMany({ where: { courseId } });
  await prisma.course.delete({ where: { id: courseId } });

  await prisma.auditLog.create({
    data: { action: "COURSE_DELETED", entityType: "Course", entityId: courseId, userId, details: JSON.stringify({ name: course.name }) },
  });

  return { message: `Course ${course.name} deleted successfully` };
}

// ─── Department CRUD ──────────────────────────────────────────

export async function createDepartment(data: {
  name: string;
  code: string;
  isFirstYear?: boolean;
}, userId: string) {
  const existing = await prisma.department.findFirst({ where: { code: data.code.toUpperCase() } });
  if (existing) throw Object.assign(new Error("Department code already exists"), { statusCode: 400 });

  const dept = await prisma.department.create({
    data: {
      name: data.name,
      code: data.code.toUpperCase(),
      isFirstYear: data.isFirstYear || false,
    },
  });

  await prisma.auditLog.create({
    data: { action: "DEPARTMENT_CREATED", entityType: "Department", entityId: dept.id, userId, details: JSON.stringify(data) },
  });

  return dept;
}

export async function updateDepartment(deptId: string, data: { name?: string; code?: string }, userId: string) {
  const updated = await prisma.department.update({ where: { id: deptId }, data });

  await prisma.auditLog.create({
    data: { action: "DEPARTMENT_UPDATED", entityType: "Department", entityId: deptId, userId, details: JSON.stringify(data) },
  });

  return updated;
}

// ─── Alerts Engine ────────────────────────────────────────────

/**
 * Auto-generate alerts from live attendance/marks data.
 * Returns students below threshold as alert records.
 */
export async function getAlerts() {
  const [thresholdConfigs, enrollments] = await Promise.all([
    prisma.systemConfig.findMany({ where: { key: { in: ["attendance_threshold", "marks_threshold"] } } }),
    prisma.courseEnrollment.findMany({
      include: {
        student: { include: { user: { select: { id: true, name: true } }, courseEnrollments: { include: { offering: { include: { course: true } } } } } },
        offering: { include: { course: true, faculty: { include: { user: { select: { name: true } } } } } },
      },
    }),
  ]);

  const map = Object.fromEntries(thresholdConfigs.map((c) => [c.key, c.value]));
  const attThreshold = parseInt(map["attendance_threshold"] || "75");
  const marksThreshold = parseInt(map["marks_threshold"] || "60");

  const alerts: any[] = [];
  const seen = new Set<string>();

  for (const e of enrollments) {
    const conducted = e.offering?.lecturesConducted || 1;
    const attPct = Math.round((e.lecturesAttended / conducted) * 100);
    const marks = e.cieMarks || 0;
    const studentName = e.student?.user?.name || "Unknown";
    const courseName = e.offering?.course?.name || "Unknown";
    const faculty = e.offering?.faculty?.user?.name || "Unknown";

    if (attPct < attThreshold) {
      const key = `att-${e.studentId}-${e.offeringId}`;
      if (!seen.has(key)) {
        seen.add(key);
        alerts.push({
          id: key,
          type: attPct < attThreshold - 15 ? "critical" : "warning",
          category: "attendance",
          title: `Low Attendance — ${studentName}`,
          message: `${studentName}'s attendance in ${courseName} is ${attPct}% (threshold: ${attThreshold}%). Faculty: ${faculty}`,
          student: { id: e.student?.user?.id, name: studentName },
          course: courseName,
          value: attPct,
          threshold: attThreshold,
          createdAt: new Date().toISOString(),
        });
      }
    }

    if (marks > 0 && marks < marksThreshold) {
      const key = `marks-${e.studentId}-${e.offeringId}`;
      if (!seen.has(key)) {
        seen.add(key);
        alerts.push({
          id: key,
          type: marks < marksThreshold - 20 ? "critical" : "warning",
          category: "marks",
          title: `Low CIE Marks — ${studentName}`,
          message: `${studentName}'s CIE marks in ${courseName} are ${marks} (threshold: ${marksThreshold}). Faculty: ${faculty}`,
          student: { id: e.student?.user?.id, name: studentName },
          course: courseName,
          value: marks,
          threshold: marksThreshold,
          createdAt: new Date().toISOString(),
        });
      }
    }
  }

  // Sort: critical first, then warning
  return alerts.sort((a, b) => (a.type === "critical" ? -1 : 1));
}

// ─── Assignments Engine ───────────────────────────────────────

export async function assignMentor(studentUserId: string, mentorUserId: string, adminUserId: string) {
  const mentorProfile = await prisma.facultyProfile.findUnique({ where: { userId: mentorUserId } });
  if (!mentorProfile) throw Object.assign(new Error("Faculty not found"), { statusCode: 404 });

  const studentProfile = await prisma.studentProfile.findUnique({ where: { userId: studentUserId } });
  if (!studentProfile) throw Object.assign(new Error("Student not found"), { statusCode: 404 });

  await prisma.studentProfile.update({
    where: { userId: studentUserId },
    data: { mentorId: mentorProfile.id },
  });

  await prisma.auditLog.create({
    data: {
      action: "MENTOR_ASSIGNED",
      entityType: "StudentProfile",
      entityId: studentProfile.id,
      userId: adminUserId,
      details: JSON.stringify({ studentUserId, mentorUserId }),
    },
  });

  return { message: "Mentor assigned successfully" };
}

export async function assignClassCoordinator(facultyUserId: string, departmentId: string, semester: number, division: string, adminUserId: string) {
  const facultyProfile = await prisma.facultyProfile.findUnique({ where: { userId: facultyUserId } });
  if (!facultyProfile) throw Object.assign(new Error("Faculty not found"), { statusCode: 404 });

  const dept = await prisma.department.findUnique({ where: { id: departmentId } });
  if (!dept) throw Object.assign(new Error("Department not found"), { statusCode: 404 });

  // Upsert coordinator record
  await prisma.divisionCoordinator.upsert({
    where: {
      departmentCode_semester_division: {
        departmentCode: dept.code,
        semester,
        division,
      },
    },
    update: { facultyId: facultyProfile.id },
    create: { facultyId: facultyProfile.id, departmentCode: dept.code, semester, division },
  });

  await prisma.auditLog.create({
    data: {
      action: "CC_ASSIGNED",
      entityType: "DivisionCoordinator",
      entityId: facultyProfile.id,
      userId: adminUserId,
      details: JSON.stringify({ facultyUserId, departmentId, semester, division }),
    },
  });

  return { message: "Class Coordinator assigned successfully" };
}

// ─── CSV Export Helpers ───────────────────────────────────────

export async function exportUsersCSV(): Promise<string> {
  const users = await prisma.user.findMany({
    include: {
      department: true,
      studentProfile: true,
      facultyProfile: true,
    },
    orderBy: { role: "asc" },
  });

  const header = "Name,Email,Role,Department,PRN/Designation,Semester,Division";
  const rows = users.map((u) => {
    const extra = u.studentProfile
      ? `${u.studentProfile.prnNumber || ""},${u.studentProfile.currentSemester},${u.studentProfile.division}`
      : u.facultyProfile
      ? `${u.facultyProfile.designation},,`
      : ",,";
    return `"${u.name}","${u.email}","${u.role}","${u.department.name}",${extra}`;
  });

  return [header, ...rows].join("\n");
}

export async function exportCoursesCSV(): Promise<string> {
  const courses = await prisma.course.findMany({
    include: {
      department: true,
      offerings: {
        include: {
          faculty: { include: { user: { select: { name: true } } } },
          _count: { select: { enrollments: true } },
        },
      },
    },
  });

  const header = "Code,Name,Department,Credits,Semester,Division,Faculty,Enrolled";
  const rows: string[] = [];

  for (const c of courses) {
    if (c.offerings.length === 0) {
      rows.push(`"${c.courseCode}","${c.name}","${c.department.name}",${c.credits},,,,"0"`);
    } else {
      for (const o of c.offerings) {
        rows.push(`"${c.courseCode}","${c.name}","${c.department.name}",${c.credits},${o.semester},"${o.divisionTarget}","${o.faculty?.user?.name || "Unassigned"}",${o._count.enrollments}`);
      }
    }
  }

  return [header, ...rows].join("\n");
}

// ─── Faculty Alerts ───────────────────────────────────────────

export async function getFacultyAlerts(facultyUserId: string) {
  const profile = await prisma.facultyProfile.findUnique({
    where: { userId: facultyUserId },
    include: {
      courseOfferings: {
        include: {
          course: true,
          enrollments: {
            include: {
              student: { include: { user: { select: { id: true, name: true } } } },
            },
          },
        },
      },
    },
  });

  if (!profile) return [];

  const alerts: any[] = [];

  for (const offering of profile.courseOfferings) {
    for (const e of offering.enrollments) {
      const conducted = offering.lecturesConducted || 1;
      const attPct = Math.round((e.lecturesAttended / conducted) * 100);
      const marks = e.cieMarks || 0;
      const name = e.student?.user?.name || "Unknown";

      if (attPct < 75) {
        alerts.push({
          id: `att-${e.id}`,
          type: attPct < 60 ? "critical" : "warning",
          category: "attendance",
          title: `Low Attendance — ${name}`,
          message: `${name}'s attendance in ${offering.course.name} is ${attPct}%`,
          studentId: e.student?.user?.id,
          course: offering.course.name,
          value: attPct,
        });
      }
      if (marks > 0 && marks < 60) {
        alerts.push({
          id: `marks-${e.id}`,
          type: marks < 40 ? "critical" : "warning",
          category: "marks",
          title: `Low CIE Marks — ${name}`,
          message: `${name}'s CIE marks in ${offering.course.name} are ${marks}/100`,
          studentId: e.student?.user?.id,
          course: offering.course.name,
          value: marks,
        });
      }
    }
  }

  return alerts.sort((a, b) => (a.type === "critical" ? -1 : 1));
}

// ─── Faculty Profile & Action Log ────────────────────────────

export async function updateFacultyProfile(userId: string, data: { name?: string; designation?: string }) {
  const updates: Promise<any>[] = [];

  if (data.name) {
    updates.push(prisma.user.update({ where: { id: userId }, data: { name: data.name } }));
  }
  if (data.designation) {
    updates.push(prisma.facultyProfile.update({ where: { userId }, data: { designation: data.designation } }));
  }

  await Promise.all(updates);
  return { message: "Profile updated successfully" };
}

export async function getStudentActionLog(studentUserId: string) {
  const logs = await prisma.auditLog.findMany({
    where: {
      entityType: "StudentCounselling",
      entityId: studentUserId,
    },
    include: {
      user: { select: { name: true, role: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return logs.map((l) => ({
    id: l.id,
    action: l.action,
    details: l.details ? JSON.parse(l.details) : null,
    user: l.user,
    createdAt: l.createdAt,
  }));
}

export async function addStudentActionLog(studentUserId: string, facultyUserId: string, data: {
  action: string;
  notes: string;
  followUpDate?: string;
}) {
  const log = await prisma.auditLog.create({
    data: {
      action: data.action,
      entityType: "StudentCounselling",
      entityId: studentUserId,
      userId: facultyUserId,
      details: JSON.stringify({ notes: data.notes, followUpDate: data.followUpDate }),
    },
  });

  return { id: log.id, action: log.action, createdAt: log.createdAt };
}

// ─── Faculty Export CSVs ──────────────────────────────────────

export async function exportFacultyAttendanceCSV(facultyUserId: string): Promise<string> {
  const profile = await prisma.facultyProfile.findUnique({
    where: { userId: facultyUserId },
    include: {
      courseOfferings: {
        include: {
          course: true,
          enrollments: {
            include: {
              student: {
                include: { user: { select: { name: true } } },
              },
            },
          },
        },
      },
    },
  });

  if (!profile) return "No data found";

  const header = "Student,Course,Code,Attended,Conducted,Percentage";
  const rows: string[] = [];

  for (const offering of profile.courseOfferings) {
    for (const e of offering.enrollments) {
      const conducted = offering.lecturesConducted || 1;
      const pct = Math.round((e.lecturesAttended / conducted) * 100);
      rows.push(`"${e.student?.user?.name}","${offering.course.name}","${offering.course.courseCode}",${e.lecturesAttended},${conducted},${pct}%`);
    }
  }

  return [header, ...rows].join("\n");
}

export async function exportFacultyMarksCSV(facultyUserId: string): Promise<string> {
  const profile = await prisma.facultyProfile.findUnique({
    where: { userId: facultyUserId },
    include: {
      courseOfferings: {
        include: {
          course: true,
          enrollments: {
            include: {
              student: { include: { user: { select: { name: true } } } },
            },
          },
        },
      },
    },
  });

  if (!profile) return "No data found";

  const header = "Student,Course,Code,CIE Marks";
  const rows: string[] = [];

  for (const offering of profile.courseOfferings) {
    for (const e of offering.enrollments) {
      rows.push(`"${e.student?.user?.name}","${offering.course.name}","${offering.course.courseCode}",${e.cieMarks ?? "N/A"}`);
    }
  }

  return [header, ...rows].join("\n");
}

export async function exportDefaultersCSV(facultyUserId: string): Promise<string> {
  const profile = await prisma.facultyProfile.findUnique({
    where: { userId: facultyUserId },
    include: {
      courseOfferings: {
        include: {
          course: true,
          enrollments: {
            include: {
              student: { include: { user: { select: { name: true } } } },
            },
          },
        },
      },
    },
  });

  if (!profile) return "No data found";

  const header = "Student,Course,Code,Attendance%,CIE Marks,Risk";
  const rows: string[] = [];

  for (const offering of profile.courseOfferings) {
    for (const e of offering.enrollments) {
      const conducted = offering.lecturesConducted || 1;
      const pct = Math.round((e.lecturesAttended / conducted) * 100);
      if (pct < 75) {
        const risk = pct < 60 ? "CRITICAL" : "WARNING";
        rows.push(`"${e.student?.user?.name}","${offering.course.name}","${offering.course.courseCode}",${pct}%,${e.cieMarks ?? 0},${risk}`);
      }
    }
  }

  if (rows.length === 0) return [header, "No defaulters found"].join("\n");
  return [header, ...rows].join("\n");
}

/**
 * Returns a mock report history using generated events.
 */
export async function getReports() {
  const logs = await prisma.auditLog.findMany({
    where: { action: "REPORT_GENERATED" },
    include: { user: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return logs.map((l) => {
    const details = l.details ? JSON.parse(l.details as string) : {};
    return {
      id: l.id,
      title: details.title || "Admin Report",
      type: details.type || "SUMMARY",
      date: l.createdAt,
      generatedBy: l.user.name,
      status: "COMPLETED",
      fileSize: Math.floor(Math.random() * 500 + 100) + " KB",
    };
  });
}

/**
 * Generates a mock summary report and saves an audit log representing it.
 */
export async function generateReport({ userId, type }: { userId: string, type: string }) {
  await new Promise((r) => setTimeout(r, 2000)); // Simulate generation
  const title = `Campus Wide Summary Report - ${new Date().toISOString().split("T")[0]}`;
  
  const log = await prisma.auditLog.create({
    data: {
      action: "REPORT_GENERATED",
      entityType: "Report",
      entityId: "generated-" + Date.now(),
      userId,
      details: JSON.stringify({ title, type }),
    },
    include: { user: { select: { name: true } } },
  });

  return {
    id: log.id,
    title,
    type,
    date: log.createdAt,
    generatedBy: log.user.name,
    status: "COMPLETED",
    fileSize: "2.4 MB",
  };
}

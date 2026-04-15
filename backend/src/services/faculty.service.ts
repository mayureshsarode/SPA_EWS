import prisma from "../config/prisma";

/**
 * Returns dashboard data for a faculty member.
 */
export async function getFacultyDashboard(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      department: true,
      facultyProfile: {
        include: {
          courseOfferings: {
            include: {
              course: true,
              enrollments: {
                include: {
                  student: {
                    include: { user: { select: { id: true, name: true, email: true } } },
                  },
                },
              },
            },
          },
          classCoordinatorFor: true,
          mentoredStudents: {
            include: {
              user: { select: { id: true, name: true, email: true } },
              courseEnrollments: {
                include: {
                  offering: { include: { course: true } },
                },
              },
            },
          },
        },
      },
    },
  });

  if (!user?.facultyProfile) {
    throw Object.assign(new Error("Faculty not found"), { statusCode: 404 });
  }

  const profile = user.facultyProfile;

  // Build course list
  const courses = profile.courseOfferings.map((o) => ({
    id: o.id,
    courseCode: o.course.courseCode,
    courseName: o.course.name,
    semester: o.semester,
    division: o.divisionTarget,
    lecturesConducted: o.lecturesConducted,
    enrolledStudents: o.enrollments.length,
  }));

  // Collect all unique students from all course offerings
  const studentMap = new Map<string, any>();
  for (const offering of profile.courseOfferings) {
    for (const enrollment of offering.enrollments) {
      const s = enrollment.student;
      if (!studentMap.has(s.id)) {
        const conducted = offering.lecturesConducted || 1;
        const attendancePercent = Math.round((enrollment.lecturesAttended / conducted) * 100);
        let status: "safe" | "warning" | "critical" = "safe";
        if (attendancePercent < 60 || (enrollment.cieMarks || 0) < 40) status = "critical";
        else if (attendancePercent < 75 || (enrollment.cieMarks || 0) < 60) status = "warning";

        studentMap.set(s.id, {
          id: s.userId,
          profileId: s.id,
          name: s.user.name,
          email: s.user.email,
          attendance: attendancePercent,
          internalMarks: enrollment.cieMarks || 0,
          status,
          division: s.division,
          semester: s.currentSemester,
        });
      }
    }
  }
  const students = Array.from(studentMap.values());

  // Compute stats
  const safeCount = students.filter((s) => s.status === "safe").length;
  const warningCount = students.filter((s) => s.status === "warning").length;
  const criticalCount = students.filter((s) => s.status === "critical").length;

  // Mentees
  const mentees = profile.mentoredStudents.map((s) => {
    const enrollments = s.courseEnrollments || [];
    let totalAtt = 0, totalMarks = 0, count = 0;
    for (const e of enrollments) {
      const conducted = e.offering?.lecturesConducted || 1;
      totalAtt += (e.lecturesAttended / conducted) * 100;
      totalMarks += e.cieMarks || 0;
      count++;
    }
    const avgAtt = count > 0 ? Math.round(totalAtt / count) : 0;
    const avgMarks = count > 0 ? Math.round(totalMarks / count) : 0;
    let status: "safe" | "warning" | "critical" = "safe";
    if (avgAtt < 60 || avgMarks < 40) status = "critical";
    else if (avgAtt < 75 || avgMarks < 60) status = "warning";

    return {
      id: s.userId,
      profileId: s.id,
      name: s.user.name,
      email: s.user.email,
      attendance: avgAtt,
      internalMarks: avgMarks,
      status,
    };
  });

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    department: user.department.name,
    designation: profile.designation,
    adminRole: profile.adminRole,
    isClassCoordinator: profile.classCoordinatorFor.length > 0,
    coordinatorFor: profile.classCoordinatorFor,
    courses,
    students,
    mentees,
    stats: {
      totalStudents: students.length,
      safe: safeCount,
      warning: warningCount,
      critical: criticalCount,
      totalMentees: mentees.length,
    },
  };
}

/**
 * Get a specific student's full profile (for faculty viewing a student).
 */
export async function getStudentProfileForFaculty(studentUserId: string) {
  const user = await prisma.user.findUnique({
    where: { id: studentUserId },
    include: {
      department: true,
      studentProfile: {
        include: {
          mentor: {
            include: { user: { select: { id: true, name: true, email: true } } },
          },
          courseEnrollments: {
            include: {
              offering: {
                include: {
                  course: true,
                  faculty: {
                    include: { user: { select: { id: true, name: true } } },
                  },
                },
              },
            },
          },
          academicHistory: true,
          externalAssessments: true,
          lmsEngagement: true,
        },
      },
    },
  });

  if (!user?.studentProfile) {
    throw Object.assign(new Error("Student not found"), { statusCode: 404 });
  }

  const profile = user.studentProfile;
  const enrollments = profile.courseEnrollments || [];

  const subjects = enrollments.map((e) => {
    const conducted = e.offering?.lecturesConducted || 1;
    return {
      code: e.offering?.course?.courseCode,
      name: e.offering?.course?.name,
      attendance: Math.round((e.lecturesAttended / conducted) * 100),
      cieMarks: e.cieMarks,
      lecturesAttended: e.lecturesAttended,
      lecturesConducted: conducted,
      faculty: e.offering?.faculty?.user?.name,
    };
  });

  const totalAtt = subjects.reduce((s, sub) => s + sub.attendance, 0);
  const totalMarks = subjects.reduce((s, sub) => s + (sub.cieMarks || 0), 0);
  const count = subjects.length || 1;
  const avgAttendance = Math.round(totalAtt / count);
  const avgMarks = Math.round(totalMarks / count);

  let status: "safe" | "warning" | "critical" = "safe";
  if (avgAttendance < 60 || avgMarks < 40) status = "critical";
  else if (avgAttendance < 75 || avgMarks < 60) status = "warning";

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    department: user.department.name,
    semester: profile.currentSemester,
    division: profile.division,
    prnNumber: profile.prnNumber,
    admissionType: profile.admissionType,
    activeBacklogs: profile.activeBacklogs,
    isHosteler: profile.isHosteler,
    commuteHours: profile.commuteHours,
    financialStressFlag: profile.financialStressFlag,
    attendance: avgAttendance,
    internalMarks: avgMarks,
    status,
    subjects,
    mentor: profile.mentor
      ? { id: profile.mentor.userId, name: profile.mentor.user.name, email: profile.mentor.user.email }
      : null,
    academicHistory: profile.academicHistory,
    externalAssessments: profile.externalAssessments,
    lmsEngagement: profile.lmsEngagement,
  };
}

/**
 * Returns subject-level aggregates for the divisions this faculty coordinates.
 */
export async function getClassCoordinatorStats(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      facultyProfile: {
        include: {
          classCoordinatorFor: true,
        },
      },
    },
  });

  if (!user?.facultyProfile) {
    throw Object.assign(new Error("Faculty profile not found"), { statusCode: 404 });
  }

  const coordinatorRoles = user.facultyProfile.classCoordinatorFor;
  if (coordinatorRoles.length === 0) {
    return [];
  }

  const result = [];
  for (const role of coordinatorRoles) {
    // Find all course offerings for this semester and division target
    const offerings = await prisma.courseOffering.findMany({
      where: {
        semester: role.semester,
        divisionTarget: role.division,
      },
      include: {
        course: true,
        faculty: { include: { user: { select: { name: true } } } },
        enrollments: true,
      },
    });

    for (const off of offerings) {
      if (off.enrollments.length === 0) continue;

      let totalAtt = 0, totalMarks = 0;
      let criticals = 0, warnings = 0;
      const conducted = off.lecturesConducted || 1;

      for (const e of off.enrollments) {
        const pct = Math.round((e.lecturesAttended / conducted) * 100);
        const marks = e.cieMarks || 0;
        totalAtt += pct;
        totalMarks += marks;

        if (pct < 60 || marks < 40) criticals++;
        else if (pct < 75 || marks < 60) warnings++;
      }

      result.push({
        id: off.id,
        courseCode: off.course.courseCode,
        courseName: off.course.name,
        semester: role.semester,
        division: role.division,
        faculty: off.faculty?.user?.name || "Unknown",
        avgAttendance: Math.round(totalAtt / off.enrollments.length),
        avgMarks: Math.round(totalMarks / off.enrollments.length),
        totalStudents: off.enrollments.length,
        criticalCount: criticals,
        warningCount: warnings,
      });
    }
  }

  return result;
}

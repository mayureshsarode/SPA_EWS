import prisma from "../config/prisma";

/**
 * Returns dashboard data for a specific student.
 */
export async function getStudentDashboard(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
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
        },
      },
    },
  });

  if (!user || !user.studentProfile) {
    throw Object.assign(new Error("Student not found"), { statusCode: 404 });
  }

  const profile = user.studentProfile;
  const enrollments = profile.courseEnrollments || [];

  // Build per-subject stats
  const subjects = enrollments.map((e) => {
    const conducted = e.offering?.lecturesConducted || 1;
    const attendancePercent = Math.round((e.lecturesAttended / conducted) * 100);
    return {
      code: e.offering?.course?.courseCode,
      name: e.offering?.course?.name,
      attendance: attendancePercent,
      cieMarks: e.cieMarks,
      lecturesAttended: e.lecturesAttended,
      lecturesConducted: conducted,
      dutyLeaves: e.dutyLeavesGranted,
      exempted: e.exemptedLectures,
      faculty: e.offering?.faculty?.user?.name,
      facultyId: e.offering?.faculty?.userId,
    };
  });

  // Compute aggregates
  const totalAttendance = subjects.reduce((s, sub) => s + sub.attendance, 0);
  const totalMarks = subjects.reduce((s, sub) => s + (sub.cieMarks || 0), 0);
  const count = subjects.length || 1;
  const avgAttendance = Math.round(totalAttendance / count);
  const avgMarks = Math.round(totalMarks / count);

  let status: "safe" | "warning" | "critical" = "safe";
  if (avgAttendance < 60 || avgMarks < 40) status = "critical";
  else if (avgAttendance < 75 || avgMarks < 60) status = "warning";

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    department: user.department.name,
    departmentCode: user.department.code,
    semester: profile.currentSemester,
    division: profile.division,
    prnNumber: profile.prnNumber,
    admissionType: profile.admissionType,
    activeBacklogs: profile.activeBacklogs,
    attendance: avgAttendance,
    internalMarks: avgMarks,
    status,
    subjects,
    mentor: profile.mentor
      ? { id: profile.mentor.userId, name: profile.mentor.user.name, email: profile.mentor.user.email }
      : null,
    academicHistory: profile.academicHistory,
    externalAssessments: profile.externalAssessments,
  };
}

/**
 * Returns the list of faculty teaching a student's courses.
 */
export async function getStudentFaculty(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      studentProfile: {
        include: {
          courseEnrollments: {
            include: {
              offering: {
                include: {
                  course: true,
                  faculty: {
                    include: {
                      user: { select: { id: true, name: true, email: true } },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  if (!user?.studentProfile) {
    throw Object.assign(new Error("Student not found"), { statusCode: 404 });
  }

  const facultyMap = new Map<string, any>();
  for (const e of user.studentProfile.courseEnrollments) {
    const f = e.offering?.faculty;
    if (f && !facultyMap.has(f.id)) {
      facultyMap.set(f.id, {
        id: f.userId,
        name: f.user.name,
        email: f.user.email,
        designation: f.designation,
        course: e.offering?.course?.name,
        courseCode: e.offering?.course?.courseCode,
      });
    }
  }

  return Array.from(facultyMap.values());
}

/**
 * Returns external assessments for a student.
 */
export async function getAssessments(userId: string) {
  const profile = await prisma.studentProfile.findUnique({
    where: { userId },
    include: { externalAssessments: { orderBy: { dateTaken: "desc" } } },
  });

  if (!profile) throw Object.assign(new Error("Student profile not found"), { statusCode: 404 });

  return profile.externalAssessments;
}

/**
 * Mocks the uploading and AI processing of a PDF assessment.
 */
export async function uploadAssessment(userId: string) {
  const profile = await prisma.studentProfile.findUnique({
    where: { userId }
  });

  if (!profile) throw Object.assign(new Error("Student profile not found"), { statusCode: 404 });

  // Simulate AI parsing delay and generate a random assessment record
  await new Promise((resolve) => setTimeout(resolve, 2000));

  const assessment = await prisma.externalAssessment.create({
    data: {
      studentId: profile.id,
      vendorName: "AMCAT MOCK",
      dateTaken: new Date(),
      logicalScore: Math.floor(Math.random() * 40) + 60,
      quantitativeScore: Math.floor(Math.random() * 40) + 60,
      verbalScore: Math.floor(Math.random() * 40) + 60,
      domainScore: Math.floor(Math.random() * 40) + 60,
      overallPercentile: Math.floor(Math.random() * 30) + 70,
      parsedAnalysisPayload: {
        strengths: ["Problem Solving", "Algorithm Design"],
        weaknesses: ["Data Visualization", "Verbal Precision"],
        recommendation: "Focus on communication skills for technical interviews.",
      },
    },
  });

  return assessment;
}

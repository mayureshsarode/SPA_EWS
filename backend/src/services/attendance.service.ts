import prisma from "../config/prisma";

/**
 * Returns students for a specific course offering + division, ready for marking.
 */
export async function getStudentsForAttendance(offeringId: string) {
  const offering = await prisma.courseOffering.findUnique({
    where: { id: offeringId },
    include: {
      course: true,
      enrollments: {
        include: {
          student: {
            include: { user: { select: { id: true, name: true } } },
          },
        },
        orderBy: { student: { user: { name: "asc" } } },
      },
    },
  });

  if (!offering) {
    throw Object.assign(new Error("Course offering not found"), { statusCode: 404 });
  }

  return {
    offering: {
      id: offering.id,
      courseCode: offering.course.courseCode,
      courseName: offering.course.name,
      semester: offering.semester,
      division: offering.divisionTarget,
      lecturesConducted: offering.lecturesConducted,
    },
    students: offering.enrollments.map((e) => ({
      enrollmentId: e.id,
      studentId: e.student.userId,
      name: e.student.user.name,
      lecturesAttended: e.lecturesAttended,
      dutyLeaves: e.dutyLeavesGranted,
      exempted: e.exemptedLectures,
      attendancePercent: offering.lecturesConducted > 0
        ? Math.round((e.lecturesAttended / offering.lecturesConducted) * 100)
        : 0,
    })),
  };
}

interface AttendanceEntry {
  enrollmentId: string;
  status: "PRESENT" | "ABSENT" | "DL";
}

/**
 * Marks attendance for a batch of students in a single lecture.
 * Increments lecturesConducted on the offering and lecturesAttended on each present student.
 */
export async function markAttendance(offeringId: string, entries: AttendanceEntry[]) {
  // Increment lectures conducted
  await prisma.courseOffering.update({
    where: { id: offeringId },
    data: { lecturesConducted: { increment: 1 } },
  });

  // Update each student's attendance
  const updates = entries.map((entry) => {
    const data: any = {};
    if (entry.status === "PRESENT") {
      data.lecturesAttended = { increment: 1 };
    } else if (entry.status === "DL") {
      data.dutyLeavesGranted = { increment: 1 };
    }
    // ABSENT = no change needed

    if (Object.keys(data).length > 0) {
      return prisma.courseEnrollment.update({
        where: { id: entry.enrollmentId },
        data,
      });
    }
    return null;
  });

  await Promise.all(updates.filter(Boolean));

  return { message: "Attendance marked successfully", count: entries.length };
}

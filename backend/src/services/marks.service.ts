import prisma from "../config/prisma";

/**
 * Returns students with their CIE marks for a specific offering.
 */
export async function getStudentMarks(offeringId: string, cieNumber: 1 | 2 | 3) {
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
    },
    cieNumber,
    students: offering.enrollments.map((e) => ({
      enrollmentId: e.id,
      studentId: e.student.userId,
      name: e.student.user.name,
      marks: e.cieMarks, // Current cumulative CIE
    })),
  };
}

interface MarksEntry {
  enrollmentId: string;
  marks: number;
}

/**
 * Saves CIE marks for a batch of students.
 * Sets the cieMarks field directly (not incremental).
 */
export async function saveMarks(entries: MarksEntry[]) {
  const updates = entries.map((entry) =>
    prisma.courseEnrollment.update({
      where: { id: entry.enrollmentId },
      data: { cieMarks: entry.marks },
    })
  );

  await Promise.all(updates);

  return { message: "Marks saved successfully", count: entries.length };
}

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('STUDENT', 'FACULTY', 'ADMIN', 'SUPER_ADMIN');

-- CreateEnum
CREATE TYPE "AdmissionType" AS ENUM ('REGULAR', 'DSE');

-- CreateEnum
CREATE TYPE "AdminRoleLevel" AS ENUM ('NONE', 'DEPARTMENT_ADMIN', 'FY_ADMIN', 'SUPER_ADMIN');

-- CreateEnum
CREATE TYPE "RequestStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "Department" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isFirstYear" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Department_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "departmentId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudentProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "prnNumber" TEXT NOT NULL,
    "admissionType" "AdmissionType" NOT NULL,
    "coreBranchCode" TEXT NOT NULL,
    "currentSemester" INTEGER NOT NULL,
    "division" TEXT NOT NULL,
    "batchNumber" INTEGER,
    "activeBacklogs" INTEGER NOT NULL DEFAULT 0,
    "isHosteler" BOOLEAN NOT NULL DEFAULT false,
    "commuteHours" DOUBLE PRECISION,
    "financialStressFlag" BOOLEAN NOT NULL DEFAULT false,
    "mentorId" TEXT,

    CONSTRAINT "StudentProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FacultyProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "designation" TEXT NOT NULL,
    "adminRole" "AdminRoleLevel" NOT NULL DEFAULT 'NONE',
    "isCollegeBody" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "FacultyProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DivisionCoordinator" (
    "id" TEXT NOT NULL,
    "facultyId" TEXT NOT NULL,
    "departmentCode" TEXT NOT NULL,
    "semester" INTEGER NOT NULL,
    "division" TEXT NOT NULL,

    CONSTRAINT "DivisionCoordinator_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Course" (
    "id" TEXT NOT NULL,
    "courseCode" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "departmentId" TEXT NOT NULL,
    "credits" INTEGER NOT NULL,
    "isElective" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Course_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CourseOffering" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "facultyId" TEXT NOT NULL,
    "semester" INTEGER NOT NULL,
    "divisionTarget" TEXT,
    "lecturesConducted" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "CourseOffering_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CourseEnrollment" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "offeringId" TEXT NOT NULL,
    "lecturesAttended" INTEGER NOT NULL DEFAULT 0,
    "dutyLeavesGranted" INTEGER NOT NULL DEFAULT 0,
    "exemptedLectures" INTEGER NOT NULL DEFAULT 0,
    "cieMarks" DOUBLE PRECISION,

    CONSTRAINT "CourseEnrollment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LeaveRequest" (
    "id" TEXT NOT NULL,
    "requesterId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "leaveType" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "proofDocumentUrl" TEXT,
    "status" "RequestStatus" NOT NULL DEFAULT 'PENDING',
    "approverId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),

    CONSTRAINT "LeaveRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExternalAssessment" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "vendorName" TEXT NOT NULL,
    "dateTaken" TIMESTAMP(3) NOT NULL,
    "logicalScore" DOUBLE PRECISION NOT NULL,
    "quantitativeScore" DOUBLE PRECISION NOT NULL,
    "verbalScore" DOUBLE PRECISION NOT NULL,
    "domainScore" DOUBLE PRECISION,
    "overallPercentile" DOUBLE PRECISION NOT NULL,
    "parsedAnalysisPayload" JSONB,

    CONSTRAINT "ExternalAssessment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AcademicHistory" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "tenthBoard" TEXT,
    "tenthPercentage" DOUBLE PRECISION,
    "tenthYear" INTEGER,
    "twelfthBoard" TEXT,
    "twelfthPercentage" DOUBLE PRECISION,
    "twelfthYear" INTEGER,
    "diplomaUniversity" TEXT,
    "diplomaPercentage" DOUBLE PRECISION,
    "diplomaYear" INTEGER,

    CONSTRAINT "AcademicHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LMSEngagement" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "weekStarting" TIMESTAMP(3) NOT NULL,
    "portalLoginsCount" INTEGER NOT NULL DEFAULT 0,
    "resourcesDownloaded" INTEGER NOT NULL DEFAULT 0,
    "assignmentsSubmittedLate" INTEGER NOT NULL DEFAULT 0,
    "assignmentsSubmittedEarly" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "LMSEngagement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Department_code_key" ON "Department"("code");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "StudentProfile_userId_key" ON "StudentProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "StudentProfile_prnNumber_key" ON "StudentProfile"("prnNumber");

-- CreateIndex
CREATE UNIQUE INDEX "FacultyProfile_userId_key" ON "FacultyProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "DivisionCoordinator_departmentCode_semester_division_key" ON "DivisionCoordinator"("departmentCode", "semester", "division");

-- CreateIndex
CREATE UNIQUE INDEX "Course_courseCode_key" ON "Course"("courseCode");

-- CreateIndex
CREATE UNIQUE INDEX "CourseEnrollment_studentId_offeringId_key" ON "CourseEnrollment"("studentId", "offeringId");

-- CreateIndex
CREATE UNIQUE INDEX "AcademicHistory_studentId_key" ON "AcademicHistory"("studentId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentProfile" ADD CONSTRAINT "StudentProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentProfile" ADD CONSTRAINT "StudentProfile_mentorId_fkey" FOREIGN KEY ("mentorId") REFERENCES "FacultyProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FacultyProfile" ADD CONSTRAINT "FacultyProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DivisionCoordinator" ADD CONSTRAINT "DivisionCoordinator_facultyId_fkey" FOREIGN KEY ("facultyId") REFERENCES "FacultyProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Course" ADD CONSTRAINT "Course_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseOffering" ADD CONSTRAINT "CourseOffering_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseOffering" ADD CONSTRAINT "CourseOffering_facultyId_fkey" FOREIGN KEY ("facultyId") REFERENCES "FacultyProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseEnrollment" ADD CONSTRAINT "CourseEnrollment_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "StudentProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseEnrollment" ADD CONSTRAINT "CourseEnrollment_offeringId_fkey" FOREIGN KEY ("offeringId") REFERENCES "CourseOffering"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeaveRequest" ADD CONSTRAINT "LeaveRequest_requesterId_fkey" FOREIGN KEY ("requesterId") REFERENCES "FacultyProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeaveRequest" ADD CONSTRAINT "LeaveRequest_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "StudentProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeaveRequest" ADD CONSTRAINT "LeaveRequest_approverId_fkey" FOREIGN KEY ("approverId") REFERENCES "FacultyProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExternalAssessment" ADD CONSTRAINT "ExternalAssessment_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "StudentProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AcademicHistory" ADD CONSTRAINT "AcademicHistory_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "StudentProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LMSEngagement" ADD CONSTRAINT "LMSEngagement_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "StudentProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

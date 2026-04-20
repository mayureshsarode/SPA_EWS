/**
 * seed-05-enrollments.ts (FIXED with FY Group mapping)
 *
 * Creates all past-semester data:
 *   - CourseEnrollment (with CIE marks, attendance, duty leaves)
 *   - CIEAssessment (3 per enrollment)
 *   - LMSEngagement (4 weeks per student)
 *   - ExternalAssessment (AMCAT for ~80% of students)
 *
 * Usage:
 *   npx ts-node seed-05-enrollments.ts fe    # FE students → Sem 1 only
 *   npx ts-node seed-05-enrollments.ts se    # SE students → Sem 1, 2, 3
 *
 * FY GROUP MAPPING FOR SE STUDENTS:
 *   SE students' PRN roll numbers map back to their original FE division
 *   to determine which FY group (1 or 2) they had in Sem 1 & 2.
 *
 *   Example: f24ce001 → roll 1 → was in FE-1 (Group 1)
 *            f24ce223 → roll 223 → was in FE-13 (Group 2)
 */

import { PrismaClient, Role } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import "dotenv/config";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// ═════════════════════════════════════════════════════════════════════════════
// Helpers
// ═════════════════════════════════════════════════════════════════════════════

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randFloat(min: number, max: number): number {
  return parseFloat((Math.random() * (max - min) + min).toFixed(2));
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function recentMondays(n: number): Date[] {
  const mondays: Date[] = [];
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  const day = d.getDay();
  d.setDate(d.getDate() - ((day + 6) % 7));
  for (let i = 0; i < n; i++) {
    mondays.push(new Date(d));
    d.setDate(d.getDate() - 7);
  }
  return mondays;
}

// ═════════════════════════════════════════════════════════════════════════════
// FE Division cumulative roll counts (to map SE PRN → original FE division)
// ═════════════════════════════════════════════════════════════════════════════

// Branch distribution per FE division (from seed-04)
const FE_BRANCH_COUNTS: Record<string, { CE: number; ENTC: number; IT: number; AIDS: number; ECE: number }> = {
  "FE-1":  { CE: 19, ENTC: 19, IT: 14, AIDS: 4,  ECE: 4 },
  "FE-2":  { CE: 19, ENTC: 19, IT: 14, AIDS: 4,  ECE: 4 },
  "FE-3":  { CE: 19, ENTC: 19, IT: 13, AIDS: 5,  ECE: 4 },
  "FE-4":  { CE: 19, ENTC: 19, IT: 13, AIDS: 5,  ECE: 4 },
  "FE-5":  { CE: 18, ENTC: 18, IT: 13, AIDS: 5,  ECE: 6 },
  "FE-6":  { CE: 18, ENTC: 18, IT: 13, AIDS: 5,  ECE: 6 },
  "FE-7":  { CE: 18, ENTC: 18, IT: 13, AIDS: 4,  ECE: 7 },
  "FE-8":  { CE: 18, ENTC: 18, IT: 13, AIDS: 4,  ECE: 7 },
  "FE-9":  { CE: 18, ENTC: 18, IT: 13, AIDS: 5,  ECE: 6 },
  "FE-10": { CE: 18, ENTC: 18, IT: 13, AIDS: 5,  ECE: 6 },
  "FE-11": { CE: 18, ENTC: 18, IT: 13, AIDS: 4,  ECE: 7 },
  "FE-12": { CE: 18, ENTC: 18, IT: 14, AIDS: 5,  ECE: 5 },
  "FE-13": { CE: 18, ENTC: 18, IT: 14, AIDS: 5,  ECE: 5 }
};

/**
 * Maps a PRN roll number to the FE division it came from, then to FY group (1 or 2).
 * Returns: 1 (Group 1: FE-1 to FE-7) or 2 (Group 2: FE-8 to FE-13)
 */
function inferFyGroupFromPrn(prn: string): 1 | 2 {
  // Extract branch and roll: e.g. "f24ce123" → branch="CE", roll=123
  const match = prn.match(/^f\d{2}([a-z]{2})(\d{3})$/);
  if (!match) return 1; // fallback

  const branchCode = match[1];
  const roll = parseInt(match[2], 10);

  const BRANCH_MAP: Record<string, keyof typeof FE_BRANCH_COUNTS["FE-1"]> = {
    ce: "CE", et: "ENTC", it: "IT", ad: "AIDS", ec: "ECE"
  };
  const branch = BRANCH_MAP[branchCode];
  if (!branch) return 1;

  // Walk through FE divisions, summing up rolls per branch
  let cumulative = 0;
  for (let i = 1; i <= 13; i++) {
    const div = `FE-${i}`;
    const count = FE_BRANCH_COUNTS[div][branch];
    cumulative += count;
    if (roll <= cumulative) {
      // This student was in div
      return i <= 7 ? 1 : 2;
    }
  }

  return 2; // fallback
}

// ═════════════════════════════════════════════════════════════════════════════
// Course Offering Map Builder
// ═════════════════════════════════════════════════════════════════════════════

/**
 * Returns offering IDs grouped by: deptCode → semester → divisionTarget → offeringIds[]
 *
 * For FY:
 *   "FY" → 1 → "FE-1,FE-2,...,FE-7" → [offering IDs for Group 1 Sem 1]
 *   "FY" → 1 → "FE-8,FE-9,...,FE-13" → [offering IDs for Group 2 Sem 1]
 *   "FY" → 2 → "FE-1,...,FE-7" → [offering IDs for Group 1 Sem 2]
 *   "FY" → 2 → "FE-8,...,FE-13" → [offering IDs for Group 2 Sem 2]
 *
 * For SE depts:
 *   "CE" → 3 → "ALL" → [CE Sem 3 offerings]
 *   "CE" → 4 → "ALL" → [CE Sem 4 offerings]
 *   ... same for ENTC, IT, AIDS, ECE
 */
async function buildOfferingMap() {
  const offerings = await prisma.courseOffering.findMany({
    where: { semester: { in: [1, 2, 3, 4] } },
    include: { course: { include: { department: true } } }
  });

  type OfferingMap = Record<string, Record<number, Record<string, string[]>>>;
  const map: OfferingMap = {};

  for (const off of offerings) {
    const deptCode = off.course.department.code;
    const sem = off.semester;
    const divTarget = off.divisionTarget || "ALL";

    if (!map[deptCode]) map[deptCode] = {};
    if (!map[deptCode][sem]) map[deptCode][sem] = {};
    if (!map[deptCode][sem][divTarget]) map[deptCode][sem][divTarget] = [];
    map[deptCode][sem][divTarget].push(off.id);
  }

  return map;
}

// ═════════════════════════════════════════════════════════════════════════════
// Main
// ═════════════════════════════════════════════════════════════════════════════

async function main() {
  const batch = process.argv[2]?.toLowerCase() as "fe" | "se" | undefined;
  if (batch !== "fe" && batch !== "se") {
    console.log("Usage: npx ts-node seed-05-enrollments.ts <fe|se>");
    console.log("  fe  →  FE students, Sem 1 (past)");
    console.log("  se  →  SE students, Sem 1+2+3 (past)");
    process.exit(1);
  }

  console.log(`🌱 Seeding ${batch.toUpperCase()} enrollments + CIE + LMS + ExternalAssessment...\n`);

  // ── Fetch students ─────────────────────────────────────────────────────────

  const FE_DIVS = ["FE-1","FE-2","FE-3","FE-4","FE-5","FE-6","FE-7","FE-8","FE-9","FE-10","FE-11","FE-12","FE-13"];
  const SE_DIVS = ["SE-1","SE-2","SE-3","SE-4","SE-5","SE-6","SE-7","SE-8","SE-9","SE-10","SE-11","SE-12","SE-13"];

  const divs = batch === "fe" ? FE_DIVS : SE_DIVS;

  const students = await prisma.studentProfile.findMany({
    where: { division: { in: divs } },
    select: { id: true, prnNumber: true, division: true, coreBranchCode: true }
  });

  if (students.length === 0) {
    console.error(`❌ No students found for ${batch.toUpperCase()}. Run seed-04-students.ts first!`);
    process.exit(1);
  }
  console.log(`   Found ${students.length} students\n`);

  // ── Check existing enrollments ─────────────────────────────────────────────

  const existingCount = await prisma.courseEnrollment.count({
    where: { studentId: { in: students.map(s => s.id) } }
  });
  if (existingCount > 0) {
    console.log(`   ⚠️  Already have ${existingCount} enrollments. Skipping enrollment creation.\n`);
  }

  // ── Build offering map ─────────────────────────────────────────────────────

  const offeringMap = await buildOfferingMap();

  console.log("📊 Offering map summary:");
  for (const [dept, semMap] of Object.entries(offeringMap)) {
    for (const [sem, divMap] of Object.entries(semMap)) {
      for (const [divTarget, ids] of Object.entries(divMap)) {
        console.log(`   ${dept} Sem${sem} [${divTarget}]: ${ids.length} offerings`);
      }
    }
  }
  console.log();

  // ── Enrollments + CIE ──────────────────────────────────────────────────────

  const CHUNK = 30;
  let totalEnrollments = 0;
  let totalCIE = 0;

  if (existingCount === 0) {
    console.log("   Creating CourseEnrollment + CIEAssessment records...\n");

    for (let si = 0; si < students.length; si += CHUNK) {
      const chunk = students.slice(si, si + CHUNK);

      const enrollmentBatch: {
        studentId: string;
        offeringId: string;
        lecturesAttended: number;
        dutyLeavesGranted: number;
        exemptedLectures: number;
        cieMarks: number;
      }[] = [];

      for (const student of chunk) {
        let pastSemesters: number[] = [];
        let fyGroup: 1 | 2 = 1;

        if (batch === "fe") {
          // FE: only Sem 1 (past)
          pastSemesters = [1];
          // Determine group from current division (FE-1 to FE-7 = Group 1, FE-8+ = Group 2)
          const divNum = parseInt(student.division.replace("FE-", ""), 10);
          fyGroup = divNum <= 7 ? 1 : 2;
        } else {
          // SE: Sem 1, 2, 3 (all past)
          pastSemesters = [1, 2, 3];
          // Determine group from PRN
          fyGroup = inferFyGroupFromPrn(student.prnNumber);
        }

        for (const sem of pastSemesters) {
          let offeringIds: string[] = [];

          if (sem === 1 || sem === 2) {
            // FY semesters: get offerings for the appropriate group
            const divTarget = fyGroup === 1
              ? "FE-1,FE-2,FE-3,FE-4,FE-5,FE-6,FE-7"
              : "FE-8,FE-9,FE-10,FE-11,FE-12,FE-13";

            offeringIds = offeringMap["FY"]?.[sem]?.[divTarget] || [];
          } else if (sem === 3) {
            // SE Sem 3: dept-specific courses
            offeringIds = offeringMap[student.coreBranchCode]?.[sem]?.["ALL"] || [];
          }

          if (offeringIds.length === 0) {
            console.warn(`   ⚠️  No offerings found for student ${student.prnNumber} sem ${sem}`);
            continue;
          }

          for (const offeringId of offeringIds) {
            const attended = randInt(22, 38);
            const dutyLeaves = randInt(0, 3);
            const exempted = randInt(0, 2);
            const cie1 = randInt(10, 50);
            const cie2 = randInt(10, 50);
            const cie3 = randInt(10, 50);
            const totalCieMarks = cie1 + cie2 + cie3;

            enrollmentBatch.push({
              studentId: student.id,
              offeringId,
              lecturesAttended: attended,
              dutyLeavesGranted: dutyLeaves,
              exemptedLectures: exempted,
              cieMarks: totalCieMarks
            });
          }
        }
      }

      // Insert enrollments
      await prisma.courseEnrollment.createMany({ data: enrollmentBatch, skipDuplicates: true });
      totalEnrollments += enrollmentBatch.length;

      // Fetch created enrollments for CIE
      const studentIds = chunk.map(s => s.id);
      const createdEnrollments = await prisma.courseEnrollment.findMany({
        where: { studentId: { in: studentIds } },
        select: { id: true }
      });

      // Create 3 CIE assessments per enrollment
      const cieBatch: {
        enrollmentId: string;
        cieNumber: number;
        maxMarks: number;
        marksObtained: number;
      }[] = [];

      for (const enr of createdEnrollments) {
        cieBatch.push(
          { enrollmentId: enr.id, cieNumber: 1, maxMarks: 50, marksObtained: randInt(10, 50) },
          { enrollmentId: enr.id, cieNumber: 2, maxMarks: 50, marksObtained: randInt(10, 50) },
          { enrollmentId: enr.id, cieNumber: 3, maxMarks: 50, marksObtained: randInt(10, 50) }
        );
      }

      await prisma.cIEAssessment.createMany({ data: cieBatch, skipDuplicates: true });
      totalCIE += cieBatch.length;

      process.stdout.write(`\r   Enrollments: ${totalEnrollments} | CIE: ${totalCIE} | Students: ${Math.min(si + CHUNK, students.length)}/${students.length}`);
    }
    console.log("\n");
  }

  // ── LMSEngagement ──────────────────────────────────────────────────────────

  console.log("   Creating LMSEngagement records...\n");

  const existingLMS = await prisma.lMSEngagement.count({
    where: { studentId: { in: students.map(s => s.id) } }
  });

  if (existingLMS > 0) {
    console.log(`   ⚠️  Already have ${existingLMS} LMS records. Skipping.\n`);
  } else {
    const mondays = recentMondays(4);
    const lmsBatch: {
      studentId: string;
      weekStarting: Date;
      portalLoginsCount: number;
      resourcesDownloaded: number;
      assignmentsSubmittedLate: number;
      assignmentsSubmittedEarly: number;
    }[] = [];

    for (const student of students) {
      for (const monday of mondays) {
        lmsBatch.push({
          studentId: student.id,
          weekStarting: monday,
          portalLoginsCount: randInt(1, 15),
          resourcesDownloaded: randInt(0, 20),
          assignmentsSubmittedLate: randInt(0, 3),
          assignmentsSubmittedEarly: randInt(0, 5)
        });
      }
    }

    for (let i = 0; i < lmsBatch.length; i += 500) {
      await prisma.lMSEngagement.createMany({ data: lmsBatch.slice(i, i + 500), skipDuplicates: true });
      process.stdout.write(`\r   LMS: ${Math.min(i + 500, lmsBatch.length)}/${lmsBatch.length}`);
    }
    console.log(`\n   ✅ LMS: ${lmsBatch.length} records\n`);
  }

  // ── ExternalAssessment (AMCAT) ─────────────────────────────────────────────

  console.log("   Creating ExternalAssessment (AMCAT) records...\n");

  const existingExt = await prisma.externalAssessment.count({
    where: { studentId: { in: students.map(s => s.id) } }
  });

  if (existingExt > 0) {
    console.log(`   ⚠️  Already have ${existingExt} ExternalAssessment records. Skipping.\n`);
  } else {
    const amcatCandidates = students.filter((_, i) => i % 5 !== 0); // 80%

    const extBatch: {
      studentId: string;
      vendorName: string;
      dateTaken: Date;
      logicalScore: number;
      quantitativeScore: number;
      verbalScore: number;
      domainScore: number;
      overallPercentile: number;
      parsedAnalysisPayload: object;
    }[] = [];

    const baseDate = batch === "fe" ? new Date("2025-09-01") : new Date("2024-10-01");

    for (const student of amcatCandidates) {
      const daysOffset = randInt(0, 180);
      const dateTaken = new Date(baseDate);
      dateTaken.setDate(dateTaken.getDate() + daysOffset);

      const logical = randFloat(40, 95);
      const quant   = randFloat(35, 95);
      const verbal  = randFloat(40, 95);
      const domain  = randFloat(35, 90);
      const overall = randFloat(20, 98);

      extBatch.push({
        studentId: student.id,
        vendorName: "AMCAT",
        dateTaken,
        logicalScore: logical,
        quantitativeScore: quant,
        verbalScore: verbal,
        domainScore: domain,
        overallPercentile: overall,
        parsedAnalysisPayload: {
          sections: [
            { name: "Logical Ability", score: logical, maxScore: 100 },
            { name: "Quantitative Aptitude", score: quant, maxScore: 100 },
            { name: "Verbal English", score: verbal, maxScore: 100 },
            { name: "Domain Specific", score: domain, maxScore: 100 }
          ],
          overallPercentile: overall,
          reportUrl: `https://amcat.in/report/${student.prnNumber}`
        }
      });
    }

    for (let i = 0; i < extBatch.length; i += 500) {
      await prisma.externalAssessment.createMany({ data: extBatch.slice(i, i + 500), skipDuplicates: true });
      process.stdout.write(`\r   AMCAT: ${Math.min(i + 500, extBatch.length)}/${extBatch.length}`);
    }
    console.log(`\n   ✅ ExternalAssessment: ${extBatch.length} records\n`);
  }

  // ── Final summary ──────────────────────────────────────────────────────────

  console.log("═".repeat(60));
  console.log(`✅ ${batch.toUpperCase()} SEED COMPLETE`);
  console.log(`   Students:           ${students.length}`);
  console.log(`   Enrollments added:  ${totalEnrollments}`);
  console.log(`   CIE assessments:    ${totalCIE}`);
  console.log("═".repeat(60));

  const totalStudents = await prisma.user.count({ where: { role: Role.STUDENT } });
  const totalEnrDB    = await prisma.courseEnrollment.count();
  const totalCIEDB    = await prisma.cIEAssessment.count();
  const totalLMS      = await prisma.lMSEngagement.count();
  const totalExt      = await prisma.externalAssessment.count();

  console.log("\n📊 DB Totals:");
  console.log(`   Students:          ${totalStudents}`);
  console.log(`   Enrollments:       ${totalEnrDB}`);
  console.log(`   CIE Assessments:   ${totalCIEDB}`);
  console.log(`   LMS Records:       ${totalLMS}`);
  console.log(`   AMCAT Records:     ${totalExt}`);
  console.log("═".repeat(60) + "\n");
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); await pool.end(); });
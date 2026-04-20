import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import "dotenv/config";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// ═════════════════════════════════════════════════════════════════════════════
// FIRST YEAR COURSES (Group 1 & 2)
// ═════════════════════════════════════════════════════════════════════════════

const FY_GROUP1_SEM1 = [
  { code: "F-001", name: "Linear Algebra and Calculus", credits: 4 },
  { code: "F-003", name: "Quantum Physics", credits: 2 },
  { code: "F-004", name: "Quantum Physics Lab", credits: 1 },
  { code: "F-007", name: "Mechanics for Robotics", credits: 2 },
  { code: "F-008", name: "Mechanics for Robotics Lab", credits: 1 },
  { code: "F-009", name: "Integrated Electrical and Electronics Engineering", credits: 2 },
  { code: "F-010", name: "IEEE Lab", credits: 1 },
  { code: "F-013", name: "C Programming for Problem Solving", credits: 2 },
  { code: "F-014", name: "CPPS Lab", credits: 1 },
  { code: "F-017", name: "FAB Lab", credits: 1 },
  { code: "F-020", name: "Indian Knowledge System", credits: 2 },
  { code: "F-023", name: "Cocurricular Activity-1", credits: 1 }
];

const FY_GROUP2_SEM1 = [
  { code: "F-001", name: "Linear Algebra and Calculus", credits: 4 },
  { code: "F-005", name: "Chemical Science and Technology", credits: 2 },
  { code: "F-006", name: "Chemical Science and Technology Lab", credits: 1 },
  { code: "F-011", name: "Computer Graphics and Design", credits: 2 },
  { code: "F-012", name: "CGD Lab", credits: 1 },
  { code: "F-013", name: "C Programming for Problem Solving", credits: 2 },
  { code: "F-014", name: "CPPS Lab", credits: 1 },
  { code: "F-018", name: "Innovative Idea and Design Thinking Lab", credits: 1 },
  { code: "F-019", name: "Environment and Sustainable Engineering", credits: 2 },
  { code: "F-021", name: "Soft Skills", credits: 2 },
  { code: "F-022", name: "NPTEL / SWAYAM / MOOCs", credits: 1 },
  { code: "F-023", name: "Cocurricular Activity-1", credits: 1 }
];

const FY_GROUP1_SEM2 = [
  { code: "F-002", name: "Statistics and Integral Calculus", credits: 4 },
  { code: "F-005", name: "Chemical Science and Technology", credits: 2 },
  { code: "F-006", name: "Chemical Science and Technology Lab", credits: 1 },
  { code: "F-011", name: "Computer Graphics and Design", credits: 2 },
  { code: "F-012", name: "CGD Lab", credits: 1 },
  { code: "F-015", name: "Object Oriented Programming Using C++", credits: 2 },
  { code: "F-016", name: "Object Oriented Programming Lab", credits: 1 },
  { code: "F-018", name: "Innovative Idea and Design Thinking Lab", credits: 1 },
  { code: "F-019", name: "Environment and Sustainable Engineering", credits: 2 },
  { code: "F-021", name: "Soft Skills", credits: 2 },
  { code: "F-024", name: "Cocurricular Activity-2", credits: 1 }
];

const FY_GROUP2_SEM2 = [
  { code: "F-002", name: "Statistics and Integral Calculus", credits: 4 },
  { code: "F-003", name: "Quantum Physics", credits: 2 },
  { code: "F-004", name: "Quantum Physics Lab", credits: 1 },
  { code: "F-007", name: "Mechanics for Robotics", credits: 2 },
  { code: "F-008", name: "Mechanics for Robotics Lab", credits: 1 },
  { code: "F-009", name: "Integrated Electrical and Electronics Engineering", credits: 2 },
  { code: "F-010", name: "IEEE Lab", credits: 1 },
  { code: "F-015", name: "Object Oriented Programming Using C++", credits: 2 },
  { code: "F-016", name: "Object Oriented Programming Lab", credits: 1 },
  { code: "F-017", name: "FAB Lab", credits: 1 },
  { code: "F-020", name: "Indian Knowledge System", credits: 2 },
  { code: "F-021", name: "Soft Skills", credits: 2 },
  { code: "F-024", name: "Cocurricular Activity-2", credits: 1 }
];

// ═════════════════════════════════════════════════════════════════════════════
// SECOND YEAR COURSES (Department-wise)
// ═════════════════════════════════════════════════════════════════════════════

const CE_SEM3 = [
  { code: "1303101", name: "Data Structures", credits: 3 },
  { code: "1303102", name: "Computer Organization and Architecture", credits: 3 },
  { code: "1303103", name: "Discrete Mathematics", credits: 3 },
  { code: "1303204", name: "Data Structures Lab", credits: 2 },
  { code: "1303205", name: "COA Lab", credits: 1 },
  { code: "03051X1", name: "MDM-I", credits: 2 },
  { code: "03053X1", name: "MDM-I #", credits: 1 },
  { code: "1309101", name: "Engineering Economics and Financial Management", credits: 1 },
  { code: "0308202", name: "PDCR", credits: 1 },
  { code: "03063XX", name: "FLS", credits: 2 },
  { code: "0311101", name: "UHV", credits: 2 },
  { code: "03132XX", name: "CEP", credits: 1 }
];

const CE_SEM4 = [
  { code: "1403106", name: "Software Engineering", credits: 2 },
  { code: "1403107", name: "DBMS", credits: 3 },
  { code: "1403108", name: "Operating Systems", credits: 2 },
  { code: "1403209", name: "OSL", credits: 1 },
  { code: "1403210", name: "DMSL", credits: 2 },
  { code: "04051X2", name: "MDM-II", credits: 2 },
  { code: "04052X2", name: "MDM-II #", credits: 1 },
  { code: "04063XX", name: "OE-II", credits: 2 },
  { code: "1407201", name: "PBL", credits: 2 },
  { code: "1409102", name: "Entrepreneurship", credits: 1 },
  { code: "1409202", name: "EPL", credits: 1 },
  { code: "0408203", name: "CDC", credits: 1 },
  { code: "0411102", name: "ICSR", credits: 1 },
  { code: "04132XX", name: "CEP", credits: 1 }
];

const IT_SEM3 = [
  { code: "3303101", name: "Data Structures & Applications", credits: 3 },
  { code: "3303102", name: "Computer Network Technology", credits: 3 },
  { code: "3303203", name: "DS Lab", credits: 2 },
  { code: "3303204", name: "CNT Lab", credits: 2 },
  { code: "03051X1", name: "MDM-I", credits: 2 },
  { code: "03052X1", name: "MDM-I #", credits: 1 },
  { code: "03063XX", name: "FLS", credits: 2 },
  { code: "3307201", name: "ESDL", credits: 1 },
  { code: "0308202", name: "PDCR", credits: 1 },
  { code: "3309101", name: "ESDM", credits: 2 },
  { code: "0311101", name: "UHV", credits: 2 },
  { code: "0313201", name: "CEP", credits: 1 }
];

const IT_SEM4 = [
  { code: "3403105", name: "ADSA", credits: 2 },
  { code: "3403106", name: "DIS", credits: 2 },
  { code: "3403107", name: "DSM", credits: 3 },
  { code: "3403208", name: "ADSAL", credits: 2 },
  { code: "3403209", name: "DISL", credits: 2 },
  { code: "04051X2", name: "MDM-II", credits: 2 },
  { code: "04052X2", name: "MDM-II #", credits: 1 },
  { code: "04063XX", name: "OE-II", credits: 2 },
  { code: "3407202", name: "PBL", credits: 1 },
  { code: "0408203", name: "CDC", credits: 1 },
  { code: "3409302", name: "IPSE", credits: 2 },
  { code: "0411102", name: "ICSR", credits: 1 },
  { code: "0413201", name: "CEP", credits: 1 }
];

const AIDS_SEM3 = [
  { code: "4303101", name: "Discrete Mathematics", credits: 2 },
  { code: "4303102", name: "Data Structures", credits: 3 },
  { code: "4303103", name: "Artificial Intelligence", credits: 3 },
  { code: "4303204", name: "DSL", credits: 1 },
  { code: "4303205", name: "AIDSL", credits: 2 },
  { code: "03051X1", name: "MDM-I", credits: 2 },
  { code: "03053X1", name: "MDM-I #", credits: 1 },
  { code: "03063XX", name: "FLS", credits: 2 },
  { code: "0308202", name: "PDCR", credits: 1 },
  { code: "4309101", name: "MIS", credits: 2 },
  { code: "0311101", name: "UHV", credits: 2 },
  { code: "0313201", name: "CEP", credits: 1 }
];

const AIDS_SEM4 = [
  { code: "4403106", name: "Machine Learning", credits: 3 },
  { code: "4403107", name: "DBMS", credits: 3 },
  { code: "4403108", name: "Operating Systems", credits: 2 },
  { code: "4403109", name: "FCN", credits: 2 },
  { code: "4403210", name: "LP-1", credits: 2 },
  { code: "4407203", name: "KSEL", credits: 1 },
  { code: "04051X2", name: "MDM-II", credits: 2 },
  { code: "04053X2", name: "MDM-II #", credits: 1 },
  { code: "04063XX", name: "OE-II", credits: 2 },
  { code: "0408203", name: "CDC", credits: 1 },
  { code: "4409102", name: "Project Management", credits: 2 },
  { code: "0411103", name: "ICSR", credits: 1 },
  { code: "0413201", name: "CEP", credits: 1 }
];

const ENTC_SEM3 = [
  { code: "2303101", name: "Signals and Systems", credits: 3 },
  { code: "2303102", name: "Analog Circuit Design", credits: 3 },
  { code: "2303203", name: "ACD Lab", credits: 2 },
  { code: "2303104", name: "Network Analysis", credits: 3 },
  { code: "2307101", name: "ESD", credits: 2 },
  { code: "03051X1", name: "MDM-I", credits: 2 },
  { code: "03052X1", name: "MDM-I #", credits: 1 },
  { code: "0306301", name: "FLS", credits: 2 },
  { code: "0311101", name: "UHV", credits: 2 },
  { code: "0308202", name: "PDCR", credits: 1 },
  { code: "03132XX", name: "CEP", credits: 1 }
];

const ENTC_SEM4 = [
  { code: "2403105", name: "Communication Engineering", credits: 3 },
  { code: "2403206", name: "PCEL", credits: 2 },
  { code: "2403107", name: "Digital Circuit Design", credits: 3 },
  { code: "2403208", name: "DCDL", credits: 2 },
  { code: "2403109", name: "Control Systems", credits: 3 },
  { code: "2407202", name: "PBL", credits: 1 },
  { code: "2409101", name: "PMFE", credits: 2 },
  { code: "04051X2", name: "MDM-II", credits: 2 },
  { code: "04052X2", name: "MDM-II #", credits: 1 },
  { code: "04063XX", name: "OE-II", credits: 2 },
  { code: "0408203", name: "CDC", credits: 1 },
  { code: "0411102", name: "ICSR", credits: 1 }
];

const ECE_SEM3 = [
  { code: "5303101", name: "Analog and Digital Electronics", credits: 3 },
  { code: "5303202", name: "ADEL", credits: 1 },
  { code: "5303103", name: "Operating Systems", credits: 3 },
  { code: "5303104", name: "Data Structures", credits: 3 },
  { code: "5303205", name: "PDSL", credits: 2 },
  { code: "03051X1", name: "MDM-I", credits: 2 },
  { code: "03052X1", name: "MDM-I #", credits: 1 },
  { code: "5309101", name: "FLB", credits: 2 },
  { code: "03063XX", name: "FLS", credits: 2 },
  { code: "0311101", name: "UHV", credits: 2 },
  { code: "0308202", name: "PDCR", credits: 1 },
  { code: "0313201", name: "CEP", credits: 1 }
];

const ECE_SEM4 = [
  { code: "5403106", name: "Analog Communication", credits: 3 },
  { code: "5403107", name: "Microcontroller", credits: 3 },
  { code: "5403208", name: "ECEL-I", credits: 1 },
  { code: "5403109", name: "OOP", credits: 3 },
  { code: "5403210", name: "OOPL", credits: 1 },
  { code: "5407201", name: "PBL", credits: 1 },
  { code: "5409102", name: "Project Management", credits: 2 },
  { code: "04051X2", name: "MDM-II", credits: 2 },
  { code: "04052X2", name: "MDM-II #", credits: 1 },
  { code: "04063XX", name: "OE-II", credits: 2 },
  { code: "0408203", name: "CDC", credits: 1 },
  { code: "0411102", name: "ICSR", credits: 1 },
  { code: "0413201", name: "CEP", credits: 1 }
];

// ═════════════════════════════════════════════════════════════════════════════
// Helper
// ═════════════════════════════════════════════════════════════════════════════

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ═════════════════════════════════════════════════════════════════════════════
// Main
// ═════════════════════════════════════════════════════════════════════════════

async function main() {
  console.log("🌱 Step 3: Creating Courses & Offerings (CORRECTED)...\n");

  // Clean slate
  const existing = await prisma.course.count();
  if (existing > 0) {
    console.log(`   ⚠️  Found ${existing} existing courses. Dropping all courses and offerings...`);
    await prisma.courseOffering.deleteMany();
    await prisma.course.deleteMany();
    console.log("   ✅ Cleared.\n");
  }

  const depts = await prisma.department.findMany();
  const deptMap = new Map(depts.map(d => [d.code, d]));
  const fyDept = deptMap.get("FY")!;

  const faculty = await prisma.facultyProfile.findMany({ include: { user: true } });
  const facultyByDept: Record<string, typeof faculty> = {};
  for (const f of faculty) {
    const dept = depts.find(d => d.id === f.user.departmentId);
    if (dept) {
      if (!facultyByDept[dept.code]) facultyByDept[dept.code] = [];
      facultyByDept[dept.code].push(f);
    }
  }

  let totalCourses = 0;
  let totalOfferings = 0;

  // ─── FY Group 1 & 2 ────────────────────────────────────────────────────────

  type CourseData = { code: string; name: string; credits: number; semester: number; group: string };
  const fyCourses: CourseData[] = [
    ...FY_GROUP1_SEM1.map(c => ({ ...c, semester: 1, group: "G1" })),
    ...FY_GROUP2_SEM1.map(c => ({ ...c, semester: 1, group: "G2" })),
    ...FY_GROUP1_SEM2.map(c => ({ ...c, semester: 2, group: "G1" })),
    ...FY_GROUP2_SEM2.map(c => ({ ...c, semester: 2, group: "G2" }))
  ];

  // Deduplicate courses by code (since some courses appear in both groups)
  const uniqueFyCourses = new Map<string, CourseData>();
  for (const c of fyCourses) {
    if (!uniqueFyCourses.has(c.code)) {
      uniqueFyCourses.set(c.code, c);
    }
  }

  console.log("📘 Creating FY courses...");
  for (const c of uniqueFyCourses.values()) {
    await prisma.course.create({
      data: { courseCode: c.code, name: c.name, credits: c.credits, departmentId: fyDept.id }
    });
    totalCourses++;
  }

  // Create offerings: one offering per (course, semester, group)
  // Group 1 offerings for FE-1 to FE-7, Group 2 for FE-8 to FE-13
  const fyFaculty = facultyByDept["FY"] || faculty;

  for (const c of fyCourses) {
    const course = await prisma.course.findFirst({ where: { courseCode: c.code } });
    if (!course) continue;

    const divTarget = c.group === "G1" ? "FE-1,FE-2,FE-3,FE-4,FE-5,FE-6,FE-7" : "FE-8,FE-9,FE-10,FE-11,FE-12,FE-13";

    await prisma.courseOffering.create({
      data: {
        courseId: course.id,
        facultyId: pick(fyFaculty).id,
        semester: c.semester,
        divisionTarget: divTarget,
        lecturesConducted: 40
      }
    });
    totalOfferings++;
  }
  console.log(`   ✅ FY: ${uniqueFyCourses.size} courses, ${totalOfferings} offerings (Group 1 & 2)\n`);

  // ─── Second Year Courses ───────────────────────────────────────────────────

  type DeptCourses = { code: string; courses: typeof CE_SEM3; sem: number }[];
  const seCoursesBySemDept: Record<string, DeptCourses> = {
    CE: [
      { code: "CE", courses: CE_SEM3, sem: 3 },
      { code: "CE", courses: CE_SEM4, sem: 4 }
    ],
    ENTC: [
      { code: "ENTC", courses: ENTC_SEM3, sem: 3 },
      { code: "ENTC", courses: ENTC_SEM4, sem: 4 }
    ],
    IT: [
      { code: "IT", courses: IT_SEM3, sem: 3 },
      { code: "IT", courses: IT_SEM4, sem: 4 }
    ],
    AIDS: [
      { code: "AIDS", courses: AIDS_SEM3, sem: 3 },
      { code: "AIDS", courses: AIDS_SEM4, sem: 4 }
    ],
    ECE: [
      { code: "ECE", courses: ECE_SEM3, sem: 3 },
      { code: "ECE", courses: ECE_SEM4, sem: 4 }
    ]
  };

  for (const [deptCode, semList] of Object.entries(seCoursesBySemDept)) {
    const dept = deptMap.get(deptCode);
    if (!dept) continue;

    const deptFaculty = facultyByDept[deptCode] || faculty;

    console.log(`📗 Creating ${deptCode} courses...`);
    let deptCoursesCount = 0;
    let deptOfferingsCount = 0;

    for (const { courses, sem } of semList) {
      for (const c of courses) {
        // Create course
        const created = await prisma.course.create({
          data: { courseCode: c.code, name: c.name, credits: c.credits, departmentId: dept.id }
        });
        deptCoursesCount++;
        totalCourses++;

        // Create offering
        await prisma.courseOffering.create({
          data: {
            courseId: created.id,
            facultyId: pick(deptFaculty).id,
            semester: sem,
            divisionTarget: "ALL",
            lecturesConducted: 40
          }
        });
        deptOfferingsCount++;
        totalOfferings++;
      }
    }
    console.log(`   ✅ ${deptCode}: ${deptCoursesCount} courses, ${deptOfferingsCount} offerings\n`);
  }

  // ─── Summary ───────────────────────────────────────────────────────────────

  console.log("═".repeat(60));
  console.log(`✅ Step 3 COMPLETE`);
  console.log(`   Total Courses:   ${totalCourses}`);
  console.log(`   Total Offerings: ${totalOfferings}`);
  console.log("═".repeat(60));

  // Verify by semester
  const bySem = await prisma.courseOffering.groupBy({ by: ["semester"], _count: true });
  console.log("\n📊 Offerings per semester:");
  bySem.sort((a, b) => a.semester - b.semester).forEach(r =>
    console.log(`   Sem ${r.semester}: ${r._count} offerings`)
  );
  console.log();
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); await pool.end(); });
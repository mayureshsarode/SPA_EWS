import { PrismaClient, Role, AdmissionType } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import path from "path";
import fs from "fs";
import bcrypt from "bcrypt";
import dotenv from "dotenv";

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

const pool = new Pool({
  connectionString,
  ssl: connectionString.includes("supabase.com") ? { rejectUnauthorized: false } : undefined,
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const CSV_PATH = path.resolve(__dirname, "../../ml_service/spa_ews_historical_data_v4.csv");

const FIRST_NAMES = [
  "Aarav", "Vivaan", "Aditya", "Vihaan", "Arjun", "Sai", "Reyansh", "Ayaan", "Krishna", "Ishaan",
  "Shaurya", "Atharva", "Advik", "Pranav", "Advaith", "Aaryan", "Dhruv", "Kabir", "Rudra", "Ananya",
  "Diya", "Gauri", "Saanvi", "Aadhya", "Pari", "Anushka", "Khushi", "Aarohi", "Myra", "Sara",
  "Isha", "Riya", "Avni", "Kavya", "Tanvi", "Sia", "Navya", "Meera", "Anika", "Palak",
  "Rohan", "Sakshi", "Mayuresh", "Tia", "Aditi", "Chinmay", "Sneha", "Kunal", "Pooja", "Shreyas"
];

const LAST_NAMES = [
  "Sharma", "Verma", "Patil", "Deshmukh", "Kulkarni", "Joshi", "Pawar", "Shinde", "Kale", "Chavan",
  "More", "Kadam", "Bhosale", "Jadhav", "Gaikwad", "Tambe", "Gawande", "Thakur", "Sawant", "Salunkhe",
  "Bapat", "Gore", "Saraf", "Deshpande", "Phadke", "Godbole", "Oak", "Pendse", "Gokhale", "Apte"
];

function generateName(index: number) {
  const first = FIRST_NAMES[index % FIRST_NAMES.length];
  const last = LAST_NAMES[Math.floor(index / FIRST_NAMES.length) % LAST_NAMES.length];
  return `${first} ${last}`;
}

async function main() {
  console.log("🚀 Starting import of students from spa_ews_historical_data_v4.csv...");

  if (!fs.existsSync(CSV_PATH)) {
    throw new Error(`CSV file not found at ${CSV_PATH}`);
  }

  const csvContent = fs.readFileSync(CSV_PATH, "utf-8");
  const lines = csvContent.trim().split(/\r?\n/);
  const header = lines[0].split(",");
  const rows = lines.slice(1);

  console.log(`📊 Found ${rows.length} student records in CSV.`);

  // 1. Get CE department
  const ceDept = await prisma.department.findUnique({
    where: { code: "CE" },
  });
  if (!ceDept) {
    throw new Error("Computer Engineering (CE) department not found in database.");
  }

  // 2. Get CE faculty profiles for mentors and course instructors
  const ceFaculty = await prisma.facultyProfile.findMany({
    where: { user: { departmentId: ceDept.id } },
    include: { user: true },
  });
  if (ceFaculty.length === 0) {
    throw new Error("No CE faculty members found. Run main seed first.");
  }
  console.log(`👨‍🏫 Found ${ceFaculty.length} CE faculty members.`);

  // 3. Ensure the 6 courses exist
  const courseDefs = [
    { code: "1403108", name: "Operating Systems", short: "OS" },
    { code: "1403107", name: "Database Management Systems", short: "DBMS" },
    { code: "1403106", name: "Software Engineering", short: "SE" },
    { code: "04051X2", name: "Modern Digital Methods (MDM)", short: "MDM" },
    { code: "1409102", name: "Entrepreneurship", short: "Entrepreneurship" },
    { code: "0411102", name: "Industry & Cyber Security (ICSR)", short: "ICSR" },
  ];

  const courseOfferings: Record<string, string> = {};

  for (let i = 0; i < courseDefs.length; i++) {
    const def = courseDefs[i];
    let course = await prisma.course.findFirst({
      where: {
        departmentId: ceDept.id,
        courseCode: def.code,
      },
    });

    if (!course) {
      course = await prisma.course.create({
        data: {
          courseCode: def.code,
          name: def.name,
          credits: 4,
          departmentId: ceDept.id,
        },
      });
    }

    // Ensure course offering exists
    let offering = await prisma.courseOffering.findFirst({
      where: { courseId: course.id, semester: 4 },
    });

    if (!offering) {
      const assignedFaculty = ceFaculty[i % ceFaculty.length];
      offering = await prisma.courseOffering.create({
        data: {
          courseId: course.id,
          facultyId: assignedFaculty.id,
          semester: 4,
          lecturesConducted: 50,
        },
      });
    }

    courseOfferings[def.short] = offering.id;
  }
  console.log("📚 6 semester 4 courses and offerings verified.");

  // 4. Clean up previous student users and profiles
  console.log("🧹 Cleaning up old student records...");
  const oldStudents = await prisma.user.findMany({
    where: { role: Role.STUDENT },
    select: { id: true, studentProfile: { select: { id: true } } },
  });

  const studentProfileIds = oldStudents.map((s) => s.studentProfile?.id).filter(Boolean) as string[];
  const studentUserIds = oldStudents.map((s) => s.id);

  if (studentProfileIds.length > 0) {
    await prisma.courseEnrollment.deleteMany({ where: { studentId: { in: studentProfileIds } } });
    await prisma.externalAssessment.deleteMany({ where: { studentId: { in: studentProfileIds } } });
    await prisma.academicHistory.deleteMany({ where: { studentId: { in: studentProfileIds } } });
    await prisma.lMSEngagement.deleteMany({ where: { studentId: { in: studentProfileIds } } });
    await prisma.leaveRequest.deleteMany({ where: { studentId: { in: studentProfileIds } } });
    await prisma.studentProfile.deleteMany({ where: { id: { in: studentProfileIds } } });
  }

  if (studentUserIds.length > 0) {
    await prisma.user.deleteMany({ where: { id: { in: studentUserIds } } });
  }
  console.log(`✅ Removed ${oldStudents.length} previous student records.`);

  // 5. Hash password for all new students
  const passwordHash = await bcrypt.hash("spaews123", 10);

  // 6. Process each student from CSV
  console.log("📥 Creating students and enrollments from CSV...");
  const CONDUCTED = 50;
  const now = new Date();

  // Create users in batches of 100
  const BATCH_SIZE = 100;
  let createdCount = 0;

  for (let b = 0; b < rows.length; b += BATCH_SIZE) {
    const chunk = rows.slice(b, b + BATCH_SIZE);

    for (let j = 0; j < chunk.length; j++) {
      const idx = b + j + 1;
      const values = chunk[j].split(",");
      const data: Record<string, string> = {};
      header.forEach((h, col) => {
        data[h.trim()] = values[col]?.trim() || "0";
      });

      const prn = `f24ce${String(idx).padStart(3, "0")}`;
      const email = `${prn}@spa-ews.edu.in`;
      const name = generateName(idx);
      const division = `SE-${((idx - 1) % 4) + 1}`;
      const mentor = ceFaculty[idx % ceFaculty.length];

      const activeBacklogs = parseInt(data.Active_Backlogs) || 0;
      const portalLogins = parseInt(data.Portal_Logins_Per_Month) || 10;

      // Create User + StudentProfile
      const user = await prisma.user.create({
        data: {
          email,
          passwordHash,
          name,
          role: Role.STUDENT,
          departmentId: ceDept.id,
          studentProfile: {
            create: {
              prnNumber: prn,
              admissionType: AdmissionType.REGULAR,
              coreBranchCode: "ce",
              currentSemester: 4,
              academicYear: "2025-26",
              division,
              batchNumber: ((idx - 1) % 3) + 1,
              activeBacklogs,
              isHosteler: idx % 3 === 0,
              commuteHours: idx % 2 === 0 ? 1.5 : 0.5,
              mentorId: mentor.id,
              academicHistory: {
                create: {
                  tenthBoard: "CBSE",
                  tenthPercentage: 75 + (idx % 20),
                  twelfthBoard: "State Board",
                  twelfthPercentage: 70 + (idx % 25),
                },
              },
              externalAssessments: {
                create: {
                  vendorName: "AMCAT",
                  dateTaken: new Date(2025, 11, 15),
                  logicalScore: parseFloat(data.AMCAT_Logical) || 300,
                  quantitativeScore: parseFloat(data.AMCAT_Quant) || 300,
                  verbalScore: parseFloat(data.AMCAT_Verbal) || 300,
                  domainScore: parseFloat(data.AMCAT_Domain) || 300,
                  overallPercentile: Math.min(99.9, Math.max(10, parseFloat((((parseFloat(data.AMCAT_Domain) || 300) / 500) * 100).toFixed(1)))),
                },
              },
              lmsEngagement: {
                create: {
                  weekStarting: now,
                  portalLoginsCount: portalLogins,
                  resourcesDownloaded: Math.round(portalLogins * 1.8),
                  assignmentsSubmittedEarly: Math.max(0, 4 - activeBacklogs),
                  assignmentsSubmittedLate: activeBacklogs,
                },
              },
              courseEnrollments: {
                create: [
                  {
                    offeringId: courseOfferings.OS,
                    lecturesAttended: Math.min(CONDUCTED, Math.round(CONDUCTED * ((parseFloat(data.OS_Attendance) || 0) / 100))),
                    cieMarks: parseFloat(data.OS_CIE) || 0,
                  },
                  {
                    offeringId: courseOfferings.DBMS,
                    lecturesAttended: Math.min(CONDUCTED, Math.round(CONDUCTED * ((parseFloat(data.DBMS_Attendance) || 0) / 100))),
                    cieMarks: parseFloat(data.DBMS_CIE) || 0,
                  },
                  {
                    offeringId: courseOfferings.SE,
                    lecturesAttended: Math.min(CONDUCTED, Math.round(CONDUCTED * ((parseFloat(data.SE_Attendance) || 0) / 100))),
                    cieMarks: parseFloat(data.SE_CIE) || 0,
                  },
                  {
                    offeringId: courseOfferings.MDM,
                    lecturesAttended: Math.min(CONDUCTED, Math.round(CONDUCTED * ((parseFloat(data.MDM_Attendance) || 0) / 100))),
                    cieMarks: parseFloat(data.MDM_CIE) || 0,
                  },
                  {
                    offeringId: courseOfferings.Entrepreneurship,
                    lecturesAttended: Math.min(CONDUCTED, Math.round(CONDUCTED * ((parseFloat(data.Entrepreneurship_Attendance) || 0) / 100))),
                    cieMarks: parseFloat(data.Entrepreneurship_CIE) || 0,
                  },
                  {
                    offeringId: courseOfferings.ICSR,
                    lecturesAttended: Math.min(CONDUCTED, Math.round(CONDUCTED * ((parseFloat(data.ICSR_Attendance) || 0) / 100))),
                    cieMarks: parseFloat(data.ICSR_CIE) || 0,
                  },
                ],
              },
            },
          },
        },
      });

      createdCount++;
    }
    console.log(`  ... ${createdCount}/${rows.length} students imported`);
  }

  console.log(`\n🎉 Successfully imported all ${createdCount} students with complete enrollments and marks!`);

  // Verify dashboard numbers
  const totalStudents = await prisma.studentProfile.count();
  const totalEnrollments = await prisma.courseEnrollment.count();
  const totalAssessments = await prisma.externalAssessment.count();

  console.log("┌──────────────────────────────────────────────┐");
  console.log(`│ Total Students in Database:     ${String(totalStudents).padStart(12)} │`);
  console.log(`│ Total Course Enrollments:       ${String(totalEnrollments).padStart(12)} │`);
  console.log(`│ Total AMCAT Assessments:        ${String(totalAssessments).padStart(12)} │`);
  console.log("└──────────────────────────────────────────────┘");
}

main()
  .catch((e) => {
    console.error("❌ Error importing CSV students:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });

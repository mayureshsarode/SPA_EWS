import { PrismaClient, Role, AdmissionType, AdminRoleLevel } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import bcrypt from "bcrypt";
import "dotenv/config";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// ─── Naming Arrays (50%+ Maharashtrian) ──────────────────────

const maharashtrianFirstNames = {
  male: [
    "Aarav", "Aditya", "Aniket", "Arjun", "Atharva", "Chinmay", "Devendra",
    "Ganesh", "Harsh", "Jayesh", "Kartik", "Mandar", "Mihir", "Nikhil",
    "Omkar", "Pranav", "Prathamesh", "Rahul", "Rushikesh", "Sachin",
    "Sagar", "Sahil", "Sanket", "Saurabh", "Shubham", "Siddharth",
    "Soham", "Tanmay", "Tejas", "Vaibhav", "Vedant", "Vikas",
    "Vinayak", "Vishal", "Yash", "Akshay", "Amey", "Bhavesh",
  ],
  female: [
    "Aishwarya", "Ananya", "Ankita", "Apoorva", "Dhanashree", "Gauri",
    "Isha", "Janhavi", "Kajal", "Komal", "Madhura", "Manasi",
    "Mrunmayee", "Neha", "Pallavi", "Pooja", "Prajakta", "Priya",
    "Radhika", "Rina", "Riya", "Rutuja", "Sakshi", "Sayali",
    "Shruti", "Sneha", "Sonal", "Swati", "Tanvi", "Tejal",
    "Vaishnavi", "Vrushali", "Yukta",
  ],
};

const otherFirstNames = {
  male: [
    "Abhinav", "Akash", "Aryan", "Deepak", "Gaurav", "Himanshu",
    "Kunal", "Lokesh", "Mohit", "Neeraj", "Piyush", "Rajat",
    "Rohit", "Sumit", "Vivek", "Ankit", "Dhruv", "Ishaan",
  ],
  female: [
    "Aditi", "Bhavna", "Deepika", "Kavya", "Meera", "Nandini",
    "Payal", "Rashmi", "Simran", "Tanya", "Urvi", "Zara",
  ],
};

const maharashtrianMiddleNames = [
  "Suresh", "Rajesh", "Ramesh", "Anil", "Pramod", "Sanjay",
  "Dilip", "Milind", "Sandip", "Vijay", "Manoj", "Ravi",
  "Ashok", "Dinesh", "Sunil", "Mohan", "Deepak", "Satish",
];

const maharashtrianSurnames = [
  "Patil", "Deshmukh", "Kulkarni", "Joshi", "More", "Pawar",
  "Shinde", "Jadhav", "Chavan", "Gaikwad", "Bhosale", "Deshpande",
  "Kale", "Kamble", "Salunkhe", "Sonawane", "Wagh", "Mane",
  "Gokhale", "Phadke", "Kelkar", "Tambe", "Naik", "Bhat",
  "Thakur", "Rane", "Ghate", "Sawant", "Dange", "Khare",
];

const otherSurnames = [
  "Sharma", "Gupta", "Singh", "Kumar", "Verma", "Agarwal",
  "Mishra", "Pandey", "Jain", "Mehta", "Reddy", "Patel",
  "Rao", "Nair", "Iyer", "Menon", "Bose", "Das",
];

// ─── Utility Functions ───────────────────────────────────────

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randFloat(min: number, max: number): number {
  return parseFloat((Math.random() * (max - min) + min).toFixed(1));
}

/**
 * Generates a realistic Indian student name.
 * ~50% will be Maharashtrian with optional middle names.
 * Format varies: "First Surname", "First Middle Surname"
 */
function generateStudentName(): { name: string; gender: "male" | "female" } {
  const isMaharashtrian = Math.random() < 0.55;
  const gender: "male" | "female" = Math.random() < 0.55 ? "male" : "female";

  let firstName: string;
  let surname: string;
  let middleName: string | null = null;

  if (isMaharashtrian) {
    firstName = pick(maharashtrianFirstNames[gender]);
    surname = pick(maharashtrianSurnames);
    // ~60% of Maharashtrian students have a middle name (father's first name)
    if (Math.random() < 0.6) {
      middleName = pick(maharashtrianMiddleNames);
    }
  } else {
    firstName = pick(otherFirstNames[gender]);
    surname = pick(otherSurnames);
  }

  const name = middleName
    ? `${firstName} ${middleName} ${surname}`
    : `${firstName} ${surname}`;

  return { name, gender };
}

function generateEmail(name: string, index: number): string {
  const cleanName = name
    .toLowerCase()
    .replace(/\s+/g, ".")
    .replace(/[^a-z.]/g, "");
  return `${cleanName}${index}@spa-ews.edu.in`;
}

// ─── Course Definitions ──────────────────────────────────────
// FY BTech - Semester 1 (First Year) - Common for all depts
// Using simplified courses for GROUP-1
const FY_COURSES = [
  { code: "F-001", name: "Linear Algebra and Calculus", credits: 4 },
  { code: "F-003", name: "Quantum Physics", credits: 2 },
  { code: "F-004", name: "Quantum Physics Lab", credits: 1 },
  { code: "F-007", name: "Mechanics for Robotics", credits: 2 },
  { code: "F-008", name: "Mechanics for Robotics Lab", credits: 1 },
  { code: "F-009", name: "Integrated Electrical and Electronics Engineering", credits: 2 },
  { code: "F-010", name: "Integrated EE Lab", credits: 1 },
  { code: "F-013", name: "C Programming for Problem Solving", credits: 2 },
  { code: "F-014", name: "C Programming Lab", credits: 1 },
  { code: "F-017", name: "FAB Lab", credits: 1 },
  { code: "F-020", name: "Indian Knowledge System", credits: 2 },
  { code: "F-023", name: "Cocurricular Activity-1", credits: 1 },
];

// SY BTech - Semester 3 (Second Year) - CE only for now
const SY_COURSES = [
  { code: "1303101", name: "Data Structures", credits: 3 },
  { code: "1303102", name: "Computer Organization and Architecture", credits: 3 },
  { code: "1303103", name: "Discrete Mathematics", credits: 3 },
  { code: "1303204", name: "Data Structures Lab", credits: 2 },
  { code: "1303205", name: "COA Lab", credits: 1 },
];

// ─── CONFIGURATION ─────────────────────────────────────
// SET VALUES TO CHANGE STUDENT COUNTS:
// FY: FY_PER_DIV * DIVISIONS * NUM_FY_DEPARTMENTS
// SY: SY_PER_DIV * DIVISIONS (CE only)
// 
// ═══════════════════════════════════════════════════════════════════
// STUDENT COUNT CONFIGURATION:
// ============================================
// FY (Sem 1): First Year - ALL departments
//   CE: 240 (60 * 4 divisions A-D)
//   ENTC: 240 (60 * 4 divisions A-D)
//   IT: 180 (60 * 3 divisions A-C)
//   AIDS: 60 (60 * 1 division A)
//   Total FY: 720
//
// SY (Sem 3): Second Year - CE department only
//   CE: 240 (60 * 4 divisions A-D)
//   Total SY: 240
// ============================================
const FY_PER_DIV = 60;       // Students per division
const SY_PER_DIV = 60;      // Students per division (CE only)
const DIVISIONS = 4;        // Divisions per dept

// BASE PASSWORD - All users can reset later
const BASE_PASSWORD = "spaews123";

// Academic Year
const ACADEMIC_YEAR = "2025-26";

// ─── Faculty Definitions ─────────────────────────────────────
// HOD should be first entry (index 0)
const FACULTY_DEFS = [
  { name: "Dr. Meera Kulkarni", designation: "Professor & HOD", adminRole: AdminRoleLevel.DEPARTMENT_ADMIN, email: "meera.kulkarni@spa-ews.edu.in" },
  { name: "Prof. Sanjay Deshmukh", designation: "Associate Professor", adminRole: AdminRoleLevel.NONE, email: "sanjay.deshmukh@spa-ews.edu.in" },
  { name: "Prof. Anjali Patil", designation: "Assistant Professor", adminRole: AdminRoleLevel.NONE, email: "anjali.patil@spa-ews.edu.in" },
  { name: "Prof. Ramesh Joshi", designation: "Associate Professor", adminRole: AdminRoleLevel.NONE, email: "ramesh.joshi@spa-ews.edu.in" },
  { name: "Prof. Sunita Bhosale", designation: "Assistant Professor", adminRole: AdminRoleLevel.NONE, email: "sunita.bhosale@spa-ews.edu.in" },
  { name: "Prof. Vikram Naik", designation: "Assistant Professor", adminRole: AdminRoleLevel.NONE, email: "vikram.naik@spa-ews.edu.in" },
  { name: "Prof. Priya Sharma", designation: "Associate Professor", adminRole: AdminRoleLevel.NONE, email: "priya.sharma@spa-ews.edu.in" },
  { name: "Prof. Ajay Pawar", designation: "Assistant Professor", adminRole: AdminRoleLevel.NONE, email: "ajay.pawar@spa-ews.edu.in" },
  { name: "Prof. Kavita Deshpande", designation: "Assistant Professor", adminRole: AdminRoleLevel.NONE, email: "kavita.deshpande@spa-ews.edu.in" },
  { name: "Prof. Nilesh Kale", designation: "Assistant Professor", adminRole: AdminRoleLevel.NONE, email: "nilesh.kale@spa-ews.edu.in" },
];

// ─── Main Seed Function ─────────────────────────────────────

async function main() {
  console.log("🌱 Seeding SPA-EWS database...\n");

  // 1. Clean existing data
  console.log("  🧹 Cleaning existing data...");
  await prisma.auditLog.deleteMany();
  await prisma.systemConfig.deleteMany();
  await prisma.lMSEngagement.deleteMany();
  await prisma.academicHistory.deleteMany();
  await prisma.externalAssessment.deleteMany();
  await prisma.leaveRequest.deleteMany();
  await prisma.courseEnrollment.deleteMany();
  await prisma.courseOffering.deleteMany();
  await prisma.course.deleteMany();
  await prisma.divisionCoordinator.deleteMany();
  await prisma.studentProfile.deleteMany();
  await prisma.facultyProfile.deleteMany();
  await prisma.user.deleteMany();
  await prisma.department.deleteMany();

  // 2. Create Departments
  console.log("  🏛️  Creating departments...");
  const fyDept = await prisma.department.create({
    data: { code: "FY", name: "Basic Sciences and Engineering(F. Y. B. Tech)", isFirstYear: true },
  });
  const compDept = await prisma.department.create({
    data: { code: "CE", name: "Computer Engineering" },
  });
  const entcDept = await prisma.department.create({
    data: { code: "ENTC", name: "Electronics and Telecommunication Engineering" },
  });
  const itDept = await prisma.department.create({
    data: { code: "IT", name: "Information Technology" },
  });
  const eceDept = await prisma.department.create({
    data: { code: "ECE", name: "Electronics and Computer Engineering" },
  });
  const aidsDept = await prisma.department.create({
    data: { code: "AIDS", name: "Artificial Intelligence and Data Science Engineering" },
  });

  // 3. Create Super Admin
  console.log("  👑 Creating admin users...");
  const adminPassword = await bcrypt.hash("admin123", 10);
  
  // Super Admin (university level)
  await prisma.user.create({
    data: {
      email: "admin@spa-ews.edu.in",
      passwordHash: adminPassword,
      name: "System Administrator",
      role: Role.ADMIN,
      departmentId: compDept.id,
    },
  });

  // CE Department Admin (HOD acts as dept admin)
  await prisma.user.create({
    data: {
      email: "ce.admin@spa-ews.edu.in",
      passwordHash: adminPassword,
      name: "CE Department Admin",
      role: Role.ADMIN,
      departmentId: compDept.id,
    },
  });

  // ENTC Department Admin
  await prisma.user.create({
    data: {
      email: "entc.admin@spa-ews.edu.in",
      passwordHash: adminPassword,
      name: "ENTC Department Admin",
      role: Role.ADMIN,
      departmentId: entcDept.id,
    },
  });

  // IT Department Admin
  await prisma.user.create({
    data: {
      email: "it.admin@spa-ews.edu.in",
      passwordHash: adminPassword,
      name: "IT Department Admin",
      role: Role.ADMIN,
      departmentId: itDept.id,
    },
  });

  // 4. Create Faculty
  console.log("  👨‍🏫 Creating 10 faculty members...");
  const facultyPassword = await bcrypt.hash("faculty123", 10);
  const facultyProfiles: { id: string; userId: string; name: string }[] = [];

  for (const def of FACULTY_DEFS) {
    const user = await prisma.user.create({
      data: {
        email: def.email,
        passwordHash: facultyPassword,
        name: def.name,
        role: Role.FACULTY,
        departmentId: compDept.id,
        facultyProfile: {
          create: {
            designation: def.designation,
            adminRole: def.adminRole,
            isCollegeBody: def.name.includes("Pawar"), // One faculty is NSS coordinator
          },
        },
      },
      include: { facultyProfile: true },
    });
    facultyProfiles.push({
      id: user.facultyProfile!.id,
      userId: user.id,
      name: user.name,
    });
  }

  // 5. Assign Class Coordinators
  console.log("  📋 Assigning Class Coordinators...");
  // Prof. Sanjay Deshmukh -> CC for Sem 3, Div A
  await prisma.divisionCoordinator.create({
    data: {
      facultyId: facultyProfiles[1].id,
      departmentCode: "CE",
      semester: 3,
      division: "A",
    },
  });
  // Prof. Anjali Patil -> CC for Sem 5, Div A
  await prisma.divisionCoordinator.create({
    data: {
      facultyId: facultyProfiles[2].id,
      departmentCode: "COMP",
      semester: 5,
      division: "A",
    },
  });

  // 6. Create Courses
  console.log("  📚 Creating courses...");
  const sem3CourseIds: string[] = [];
  for (const c of SEM3_COURSES) {
    const course = await prisma.course.create({
      data: {
        courseCode: c.code,
        name: c.name,
        departmentId: compDept.id,
        credits: c.credits,
      },
    });
    sem3CourseIds.push(course.id);
  }

  const sem4CourseIds: string[] = [];
  for (const c of SEM4_COURSES) {
    const course = await prisma.course.create({
      data: {
        courseCode: c.code,
        name: c.name,
        departmentId: compDept.id,
        credits: c.credits,
      },
    });
    sem4CourseIds.push(course.id);
  }

  // 7. Create Course Offerings (assign faculty to courses)
  console.log("  🎓 Creating course offerings...");
  const sem3Offerings: string[] = [];
  for (let i = 0; i < sem3CourseIds.length; i++) {
    // Assign faculty 1-5 to sem 3 courses
    const offering = await prisma.courseOffering.create({
      data: {
        courseId: sem3CourseIds[i],
        facultyId: facultyProfiles[i + 1].id, // Skip HOD (index 0)
        semester: 3,
        divisionTarget: "A",
        lecturesConducted: randInt(30, 45),
      },
    });
    sem3Offerings.push(offering.id);
  }

  const sem4Offerings: string[] = [];
  for (let i = 0; i < sem4CourseIds.length; i++) {
    const offering = await prisma.courseOffering.create({
      data: {
        courseId: sem4CourseIds[i],
        facultyId: facultyProfiles[i + 5].id, // Faculty 5-9
        semester: 4,
        divisionTarget: "A",
        lecturesConducted: randInt(30, 45),
      },
    });
    sem4Offerings.push(offering.id);
  }

  // 8. Create Students
  console.log("  🧑‍🎓 Creating students...\n");
  const studentPassword = await bcrypt.hash("student123", 10);
  const usedNames = new Set<string>();
  let studentIndex = 0;

  const createStudentBatch = async (
    semester: number,
    division: string,
    count: number,
    offerings: string[],
    mentorPoolStart: number,
    mentorPoolEnd: number,
    academicYear: string = "2025-26"    
  ) => {
  console.log(`  Creating ${count} students for Sem ${semester} Div ${division} (${academicYear})...`);
  for (let i = 0; i < count; i++) {
      studentIndex++;
      let nameResult = generateStudentName();
      // Ensure unique names  
      while (usedNames.has(nameResult.name)) {
        nameResult = generateStudentName();
      }
      usedNames.add(nameResult.name);

      const email = generateEmail(nameResult.name, studentIndex);
      const prn = `PRN${String(studentIndex).padStart(4, "0")}`;
      const isDSE = semester >= 3 && Math.random() < 0.2;

      // Pick a random mentor from the pool
      const mentorIdx = randInt(mentorPoolStart, mentorPoolEnd);

      const user = await prisma.user.create({
        data: {
          email,
          passwordHash: studentPassword,
          name: nameResult.name,
          role: Role.STUDENT,
          departmentId: compDept.id,
          studentProfile: {
            create: {
              prnNumber: prn,
              admissionType: isDSE ? AdmissionType.DSE : AdmissionType.REGULAR,
              coreBranchCode: "CE",
              currentSemester: semester,
              division,
              batchNumber: randInt(1, 3),
              activeBacklogs: Math.random() < 0.15 ? randInt(1, 3) : 0,
              isHosteler: Math.random() < 0.3,
              commuteHours: Math.random() < 0.5 ? randFloat(0.5, 3.0) : null,
              financialStressFlag: Math.random() < 0.08,
              mentorId: facultyProfiles[mentorIdx].id,
            },
          },
        },
        include: { studentProfile: true },
      });

      const profile = user.studentProfile!;

      // Enroll in all courses for this semester
      for (const offeringId of offerings) {
        const offering = await prisma.courseOffering.findUnique({
          where: { id: offeringId },
        });
        if (!offering) continue;

        // Generate realistic attendance & CIE data
        // Categories: ~40% safe, ~35% warning, ~25% critical
        const roll = Math.random();
        let attendedRatio: number;
        let cieBase: number;

        if (roll < 0.40) {
          // Safe student
          attendedRatio = randFloat(0.78, 0.95);
          cieBase = randFloat(60, 95);
        } else if (roll < 0.75) {
          // Warning student
          attendedRatio = randFloat(0.60, 0.77);
          cieBase = randFloat(40, 65);
        } else {
          // Critical student
          attendedRatio = randFloat(0.30, 0.59);
          cieBase = randFloat(15, 45);
        }

        const lecturesAttended = Math.round(
          offering.lecturesConducted * attendedRatio
        );

        await prisma.courseEnrollment.create({
          data: {
            studentId: profile.id,
            offeringId: offeringId,
            lecturesAttended,
            dutyLeavesGranted: Math.random() < 0.2 ? randInt(1, 4) : 0,
            exemptedLectures: Math.random() < 0.1 ? randInt(1, 3) : 0,
            cieMarks: parseFloat(cieBase.toFixed(1)),
          },
        });
      }

      // Academic History
      await prisma.academicHistory.create({
        data: {
          studentId: profile.id,
          tenthBoard: pick(["CBSE", "State Board", "ICSE"]),
          tenthPercentage: randFloat(55, 98),
          tenthYear: isDSE ? 2021 : 2022,
          twelfthBoard: isDSE ? null : pick(["CBSE", "State Board", "ICSE"]),
          twelfthPercentage: isDSE ? null : randFloat(50, 95),
          twelfthYear: isDSE ? null : 2024,
          diplomaUniversity: isDSE ? pick(["MSBTE", "VTU"]) : null,
          diplomaPercentage: isDSE ? randFloat(55, 90) : null,
          diplomaYear: isDSE ? 2024 : null,
        },
      });

      // ~30% of students have AMCAT scores
      if (Math.random() < 0.30) {
        await prisma.externalAssessment.create({
          data: {
            studentId: profile.id,
            vendorName: pick(["AMCAT", "CoCubes", "TCS NQT"]),
            dateTaken: new Date(
              2026,
              randInt(0, 2),
              randInt(1, 28)
            ),
            logicalScore: randFloat(300, 900),
            quantitativeScore: randFloat(250, 900),
            verbalScore: randFloat(300, 850),
            domainScore: randFloat(200, 800),
            overallPercentile: randFloat(20, 99),
          },
        });
      }
    }
};
  
  // Create FY students (Sem 1) - First Year
  const divisions = ["A", "B", "C", "D"].slice(0, DIVISIONS);
  const fyOfferingsList = fyOfferings.length > 0 ? fyOfferings : [];
  for (const div of divisions) {
    await createStudentBatch(1, div, FY_PER_DIV, fyOfferingsList, 1, FACULTY_DEFS.length - 1, ACADEMIC_YEAR);
  }

  // Create SY students (Sem 3) - Second Year
  for (const div of divisions) {
    await createStudentBatch(3, div, SY_PER_DIV, sem3Offerings, 1, FACULTY_DEFS.length - 1, ACADEMIC_YEAR);
  }

  // 9. Print Credentials Summary
  console.log("\n  ┌─────────────────────────────────────────────────────────────────────────────┐");
  console.log("  │                    LOGIN CREDENTIALS                                     │");
  console.log("  ├─────────────────────────────────────────────────────────────────────────────┤");
  console.log("  │ SUPER ADMIN:                                                              │");
  console.log("  │   Email: admin@spa-ews.edu.in                                           │");
  console.log("  │   Password: admin123                                                    │");
  console.log("  ├─────────────────────────────────────────────────────────────────────────────┤");
  console.log("  │ DEPARTMENT ADMINS:                                                    │");
  console.log("  │   CE Admin:   ce.admin@spa-ews.edu.in    / admin123                     │");
  console.log("  │   ENTC Admin: entc.admin@spa-ews.edu.in  / admin123                     │");
  console.log("  │   IT Admin:   it.admin@spa-ews.edu.in    / admin123                     │");
  console.log("  ├─────────────────────────────────────────────────────────────────────────────┤");
  console.log("  │ FACULTY (sample):                                                       │");
  console.log("  │   meera.kulkarni@spa-ews.edu.in / faculty123                            │");
  console.log("  │   sanjay.deshmukh@spa-ews.edu.in / faculty123                           │");
  console.log("  ├─────────────────────────────────────────────────────────────────────────────┤");
  console.log("  │ STUDENTS (base password for all students): student123                      │");
  console.log("  │ Sample emails: student1@spa-ews.edu.in to student40@spa-ews.edu.in   │");
  console.log("  └─────────────────────────────────────────────────────────────────────────────┘\n");

  // 10. System Configuration Defaults
  console.log("  ⚙️  Creating system config defaults...");
  const configDefaults = [
    { key: "attendance_threshold", value: "75" },
    { key: "marks_threshold", value: "60" },
    { key: "ai_insights_for_base_faculty", value: "false" },
    { key: "students_see_ai_insights", value: "false" },
    { key: "dl_submission_open", value: "true" },
    { key: "cie_visible_before_announcement", value: "false" },
    { key: "maintenance_mode", value: "false" },
  ];
  for (const cfg of configDefaults) {
    await prisma.systemConfig.create({ data: cfg });
  }

  // 10. Summary
  const userCount = await prisma.user.count();
  const studentCount = await prisma.studentProfile.count();
  const facultyCount = await prisma.facultyProfile.count();
  const courseCount = await prisma.course.count();
  const enrollmentCount = await prisma.courseEnrollment.count();
  const amcatCount = await prisma.externalAssessment.count();
  const configCount = await prisma.systemConfig.count();

  console.log("  ✅ Seeding complete!\n");
  console.log("  ┌─────────────────────────────────┐");
  console.log(`  │ Users:          ${String(userCount).padStart(15)} │`);
  console.log(`  │ Students:       ${String(studentCount).padStart(15)} │`);
  console.log(`  │ Faculty:        ${String(facultyCount).padStart(15)} │`);
  console.log(`  │ Courses:        ${String(courseCount).padStart(15)} │`);
  console.log(`  │ Enrollments:    ${String(enrollmentCount).padStart(15)} │`);
  console.log(`  │ AMCAT Reports:  ${String(amcatCount).padStart(15)} │`);
  console.log(`  │ Config Entries: ${String(configCount).padStart(15)} │`);
  console.log("  └─────────────────────────────────┘\n");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });

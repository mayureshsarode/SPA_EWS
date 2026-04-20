/**
 * seed-04-students.ts (FIXED with proper counter tracking)
 *
 * Seeds 1560 students: 780 FE + 780 SE
 *
 * Run per batch:
 *   npx ts-node seed-04-students.ts fe1    # FE-1  (60 students, mixed branches)
 *   npx ts-node seed-04-students.ts fe2    # FE-2
 *   ...
 *   npx ts-node seed-04-students.ts fe13   # FE-13
 *   npx ts-node seed-04-students.ts se1    # SE CE (SE-1 to SE-4, 240 students)
 *   npx ts-node seed-04-students.ts se2    # SE ENTC (SE-5 to SE-8, 240 students)
 *   npx ts-node seed-04-students.ts se3    # SE IT (SE-9 to SE-11, 180 students)
 *   npx ts-node seed-04-students.ts se4    # SE AIDS (SE-12, 60 students)
 *   npx ts-node seed-04-students.ts se5    # SE ECE (SE-13, 60 students)
 *
 * PRN LOGIC:
 *   - FE students: f25<branch><roll> (continues across divisions per branch)
 *   - SE students: f24<branch><roll> (continues across divisions per branch)
 *
 * FY GROUP TRACKING:
 *   - Stores which FY group (1 or 2) SE students had when they were in FE
 *   - This is inferred from their PRN roll number (mapped back to FE divisions)
 */

import { PrismaClient, Role, AdmissionType } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import "dotenv/config";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// ═════════════════════════════════════════════════════════════════════════════
// Constants
// ═════════════════════════════════════════════════════════════════════════════

const PASSWORD_HASH = "$2b$10$yLqipbpl0YsYNEQhliV6du3.zDuf5UykxtHul3xVwDHqHO8AvAKDq";

const BRANCH_CODES: Record<string, string> = {
  CE: "ce", ENTC: "et", IT: "it", AIDS: "ad", ECE: "ec"
};

const BOARDS = ["CBSE", "ICSE", "Maharashtra State Board", "CBSE", "Maharashtra State Board"];

const FIRST_NAMES = [
  "Aarav", "Aryan", "Vihaan", "Sai", "Arjun", "Reyansh", "Ayaan", "Krishna", "Ishaan", "Aditya",
  "Saarthak", "Kabir", "Dhruv", "Atharv", "Vivaan", "Anay", "Kian", "Veer", "Shaurya", "Pranav",
  "Priya", "Saanvi", "Aditi", "Ananya", "Kavya", "Ira", "Neha", "Riya", "Aisha", "Kiara",
  "Avani", "Zara", "Myra", "Sia", "Pari", "Anika", "Navya", "Rhea", "Diya", "Kyra",
  "Siddharth", "Rohan", "Amit", "Vikram", "Rahul", "Kartik", "Ayush", "Dev", "Parth", "Manav",
  "Harsh", "Raj", "Akash", "Nikhil", "Saurabh", "Kunal", "Yash", "Raghav", "Jay", "Om",
  "Tanvi", "Shruti", "Pooja", "Sneha", "Swati", "Pallavi", "Rutuja", "Gauri", "Komal", "Tejal",
  "Omkar", "Tejas", "Chinmay", "Gaurav", "Sumit", "Varun", "Sameer", "Karan", "Rohit", "Nitin"
];

const LAST_NAMES = [
  "Sharma", "Patel", "Singh", "Kumar", "Gupta", "Reddy", "Rao", "Joshi", "Shah", "Mehta",
  "Kapoor", "Agarwal", "Chopra", "Malhotra", "Khatri", "Narayan", "Iyer", "Pillai", "Nair", "Menon",
  "Varghese", "Thomas", "George", "Abraham", "Mathew", "Das", "Bose", "Dey", "Banerjee", "Mukherjee",
  "Chatterjee", "Sengupta", "Mitra", "Sinha", "Pandey", "Yadav", "Verma", "Bhatia", "Patil", "Deshmukh",
  "Kulkarni", "Shinde", "Jadhav", "More", "Gaikwad", "Pawar", "Kadam", "Salunkhe", "Bhosale", "Waghmare"
];

function generateName(seed: number): string {
  const first = FIRST_NAMES[seed % FIRST_NAMES.length];
  const last = LAST_NAMES[Math.floor(seed / FIRST_NAMES.length) % LAST_NAMES.length];
  return `${first} ${last}`;
}

// ═════════════════════════════════════════════════════════════════════════════
// FE Division config (mixed branches per division)
// ═════════════════════════════════════════════════════════════════════════════

const FE_DIV_CONFIG: Record<string, { deptCode: string; count: number }[]> = {
  "FE-1":  [{ deptCode: "CE", count: 19 }, { deptCode: "ENTC", count: 19 }, { deptCode: "IT", count: 14 }, { deptCode: "AIDS", count: 4  }, { deptCode: "ECE", count: 4 }],
  "FE-2":  [{ deptCode: "CE", count: 19 }, { deptCode: "ENTC", count: 19 }, { deptCode: "IT", count: 14 }, { deptCode: "AIDS", count: 4  }, { deptCode: "ECE", count: 4 }],
  "FE-3":  [{ deptCode: "CE", count: 19 }, { deptCode: "ENTC", count: 19 }, { deptCode: "IT", count: 13 }, { deptCode: "AIDS", count: 5  }, { deptCode: "ECE", count: 4 }],
  "FE-4":  [{ deptCode: "CE", count: 19 }, { deptCode: "ENTC", count: 19 }, { deptCode: "IT", count: 13 }, { deptCode: "AIDS", count: 5  }, { deptCode: "ECE", count: 4 }],
  "FE-5":  [{ deptCode: "CE", count: 18 }, { deptCode: "ENTC", count: 18 }, { deptCode: "IT", count: 13 }, { deptCode: "AIDS", count: 5  }, { deptCode: "ECE", count: 6 }],
  "FE-6":  [{ deptCode: "CE", count: 18 }, { deptCode: "ENTC", count: 18 }, { deptCode: "IT", count: 13 }, { deptCode: "AIDS", count: 5  }, { deptCode: "ECE", count: 6 }],
  "FE-7":  [{ deptCode: "CE", count: 18 }, { deptCode: "ENTC", count: 18 }, { deptCode: "IT", count: 13 }, { deptCode: "AIDS", count: 4  }, { deptCode: "ECE", count: 7 }],
  "FE-8":  [{ deptCode: "CE", count: 18 }, { deptCode: "ENTC", count: 18 }, { deptCode: "IT", count: 13 }, { deptCode: "AIDS", count: 4  }, { deptCode: "ECE", count: 7 }],
  "FE-9":  [{ deptCode: "CE", count: 18 }, { deptCode: "ENTC", count: 18 }, { deptCode: "IT", count: 13 }, { deptCode: "AIDS", count: 5  }, { deptCode: "ECE", count: 6 }],
  "FE-10": [{ deptCode: "CE", count: 18 }, { deptCode: "ENTC", count: 18 }, { deptCode: "IT", count: 13 }, { deptCode: "AIDS", count: 5  }, { deptCode: "ECE", count: 6 }],
  "FE-11": [{ deptCode: "CE", count: 18 }, { deptCode: "ENTC", count: 18 }, { deptCode: "IT", count: 13 }, { deptCode: "AIDS", count: 4  }, { deptCode: "ECE", count: 7 }],
  "FE-12": [{ deptCode: "CE", count: 18 }, { deptCode: "ENTC", count: 18 }, { deptCode: "IT", count: 14 }, { deptCode: "AIDS", count: 5  }, { deptCode: "ECE", count: 5 }],
  "FE-13": [{ deptCode: "CE", count: 18 }, { deptCode: "ENTC", count: 18 }, { deptCode: "IT", count: 14 }, { deptCode: "AIDS", count: 5  }, { deptCode: "ECE", count: 5 }]
};

// ═════════════════════════════════════════════════════════════════════════════
// SE batch config
// ═════════════════════════════════════════════════════════════════════════════

const SE_DIV_CONFIG: Record<string, { divisions: string[]; deptCode: string }> = {
  se1: { divisions: ["SE-1",  "SE-2",  "SE-3",  "SE-4"],  deptCode: "CE"   },
  se2: { divisions: ["SE-5",  "SE-6",  "SE-7",  "SE-8"],  deptCode: "ENTC" },
  se3: { divisions: ["SE-9",  "SE-10", "SE-11"],           deptCode: "IT"   },
  se4: { divisions: ["SE-12"],                              deptCode: "AIDS" },
  se5: { divisions: ["SE-13"],                              deptCode: "ECE"  }
};

// ═════════════════════════════════════════════════════════════════════════════
// Helpers
// ═════════════════════════════════════════════════════════════════════════════

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randFloat(min: number, max: number): number {
  return parseFloat((Math.random() * (max - min) + min).toFixed(2));
}

async function getMaxRoll(prefix: string): Promise<number> {
  const existing = await prisma.studentProfile.findMany({
    where: { prnNumber: { startsWith: prefix } },
    select: { prnNumber: true }
  });
  if (existing.length === 0) return 0;
  const rolls = existing.map(s => parseInt(s.prnNumber.replace(prefix, ""), 10));
  return Math.max(...rolls);
}

// ═════════════════════════════════════════════════════════════════════════════
// Main
// ═════════════════════════════════════════════════════════════════════════════

async function main() {
  const batch = process.argv[2]?.toLowerCase();

  const isFE = batch?.startsWith("fe");
  const isSE = batch?.startsWith("se");
  const divName = isFE ? "FE-" + batch!.replace("fe", "") : null;

  if (!batch || (!isFE && !isSE) || (isFE && !FE_DIV_CONFIG[divName!]) || (isSE && !SE_DIV_CONFIG[batch])) {
    console.log("Usage: npx ts-node seed-04-students.ts <batch>");
    console.log("  FE: fe1 ... fe13");
    console.log("  SE: se1 (CE) | se2 (ENTC) | se3 (IT) | se4 (AIDS) | se5 (ECE)");
    process.exit(1);
  }

  console.log(`🌱 Seeding batch: ${batch.toUpperCase()} ...\n`);

  // ── Load DB state ──────────────────────────────────────────────────────────

  const depts = await prisma.department.findMany();
  const deptMap = new Map(depts.map(d => [d.code, d]));
  const fyDept = deptMap.get("FY")!;

  const allFaculty = await prisma.facultyProfile.findMany({ include: { user: true } });
  if (allFaculty.length === 0) {
    console.error("❌ No faculty found. Run seed-02-faculty.ts first!");
    process.exit(1);
  }

  const facultyByDept: Record<string, typeof allFaculty> = {};
  for (const f of allFaculty) {
    const dept = depts.find(d => d.id === f.user.departmentId);
    if (dept) {
      if (!facultyByDept[dept.code]) facultyByDept[dept.code] = [];
      facultyByDept[dept.code].push(f);
    }
  }

  // ── Build student records ──────────────────────────────────────────────────

  const year = isFE ? 25 : 24;
  const currentSem = isFE ? 2 : 4;
  const acYear = isFE ? "2025-26" : "2024-25";

  const BATCH_NAME_OFFSETS: Record<string, number> = {
    fe1: 0,    fe2: 60,   fe3: 120,  fe4: 180,  fe5: 240,  fe6: 300,
    fe7: 360,  fe8: 420,  fe9: 480,  fe10: 540, fe11: 600, fe12: 660, fe13: 720,
    se1: 800,  se2: 1040, se3: 1280, se4: 1460, se5: 1520
  };
  let nameSeed = BATCH_NAME_OFFSETS[batch] ?? 0;

  type StudentRow = {
    prn: string;
    name: string;
    deptCode: string;
    division: string;
  };

  const rows: StudentRow[] = [];

  if (isFE) {
    // ── FE students ──────────────────────────────────────────────────────────

    const config = FE_DIV_CONFIG[divName!];
    const branchCounters: Record<string, number> = {};

    // Get current max roll per branch
    for (const g of config) {
      if (branchCounters[g.deptCode] === undefined) {
        const prefix = `f${year}${BRANCH_CODES[g.deptCode]}`;
        branchCounters[g.deptCode] = await getMaxRoll(prefix);
      }
    }

    // Check if already seeded
    const alreadySeeded = await prisma.studentProfile.count({ where: { division: divName! } });
    if (alreadySeeded > 0) {
      console.log(`   ⚠️  ${divName} already has ${alreadySeeded} students. Skipping.`);
      return;
    }

    for (const g of config) {
      for (let i = 0; i < g.count; i++) {
        branchCounters[g.deptCode]++;
        const prn = `f${year}${BRANCH_CODES[g.deptCode]}${String(branchCounters[g.deptCode]).padStart(3, "0")}`;
        rows.push({ prn, name: generateName(nameSeed++), deptCode: g.deptCode, division: divName! });
      }
    }

  } else {
    // ── SE students ──────────────────────────────────────────────────────────

    const config = SE_DIV_CONFIG[batch];
    const prefix = `f${year}${BRANCH_CODES[config.deptCode]}`;
    let rollCounter = await getMaxRoll(prefix);

    for (const division of config.divisions) {
      const alreadySeeded = await prisma.studentProfile.count({ where: { division } });
      if (alreadySeeded > 0) {
        console.log(`   ⚠️  ${division} already has ${alreadySeeded} students. Skipping division but advancing counter.`);
        rollCounter += 60;
        continue;
      }

      for (let i = 0; i < 60; i++) {
        rollCounter++;
        const prn = `f${year}${BRANCH_CODES[config.deptCode]}${String(rollCounter).padStart(3, "0")}`;
        rows.push({ prn, name: generateName(nameSeed++), deptCode: config.deptCode, division });
      }
    }
  }

  if (rows.length === 0) {
    console.log("   Nothing to insert.");
    return;
  }

  console.log(`   Planning to insert ${rows.length} students...\n`);

  // ── Insert in batches ──────────────────────────────────────────────────────

  let inserted = 0;

  for (let i = 0; i < rows.length; i += 50) {
    const chunk = rows.slice(i, i + 50);

    // 1. Create User records
    await prisma.user.createMany({
      data: chunk.map(r => ({
        email: `${r.prn}@spa-ews.edu.in`,
        passwordHash: PASSWORD_HASH,
        name: r.name,
        role: Role.STUDENT,
        departmentId: isFE ? fyDept.id : deptMap.get(chunk[0].deptCode)!.id
      })),
      skipDuplicates: true
    });

    // 2. Fetch user IDs
    const emails = chunk.map(r => `${r.prn}@spa-ews.edu.in`);
    const users = await prisma.user.findMany({
      where: { email: { in: emails } },
      select: { id: true, email: true }
    });
    const userByEmail = new Map(users.map(u => [u.email, u.id]));

    // 3. Create StudentProfile records
    await prisma.studentProfile.createMany({
      data: chunk.map(r => {
        const deptFaculty = facultyByDept[r.deptCode] || allFaculty;
        return {
          userId: userByEmail.get(`${r.prn}@spa-ews.edu.in`)!,
          prnNumber: r.prn,
          admissionType: AdmissionType.REGULAR,
          coreBranchCode: r.deptCode,
          currentSemester: currentSem,
          academicYear: acYear,
          division: r.division,
          mentorId: pick(deptFaculty).id
        };
      }).filter(p => p.userId),
      skipDuplicates: true
    });

    // 4. Fetch StudentProfile IDs
    const prns = chunk.map(r => r.prn);
    const profiles = await prisma.studentProfile.findMany({
      where: { prnNumber: { in: prns } },
      select: { id: true, prnNumber: true }
    });
    const profileByPrn = new Map(profiles.map(p => [p.prnNumber, p.id]));

    // 5. Create AcademicHistory records
    const twelfthYear = isFE ? 2025 : 2024;
    const tenthYear   = isFE ? 2023 : 2022;

    await prisma.academicHistory.createMany({
      data: chunk.map(r => ({
        studentId: profileByPrn.get(r.prn)!,
        tenthBoard: pick(BOARDS),
        tenthPercentage: randFloat(70, 95),
        tenthYear,
        twelfthBoard: pick(BOARDS),
        twelfthPercentage: randFloat(65, 95),
        twelfthYear
      })).filter(h => h.studentId),
      skipDuplicates: true
    });

    inserted += chunk.length;
    process.stdout.write(`\r   Inserted ${inserted}/${rows.length}...`);
  }

  console.log(`\n\n✅ ${batch.toUpperCase()} COMPLETE: ${inserted} students seeded`);

  const total = await prisma.user.count({ where: { role: Role.STUDENT } });
  console.log(`   Total students in DB so far: ${total}\n`);
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); await pool.end(); });
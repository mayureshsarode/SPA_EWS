import { PrismaClient, Role, AdminRoleLevel } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import bcrypt from "bcrypt";
import "dotenv/config";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Step 1: Setup Departments & Super Admin...");
  
  // Clear existing
  await prisma.$executeRawUnsafe(`TRUNCATE TABLE "User" RESTART IDENTITY CASCADE;`);
  await prisma.$executeRawUnsafe(`TRUNCATE TABLE "Department" RESTART IDENTITY CASCADE;`);
  await prisma.$executeRawUnsafe(`TRUNCATE TABLE "Course" RESTART IDENTITY CASCADE;`);
  await prisma.$executeRawUnsafe(`TRUNCATE TABLE "CourseOffering" RESTART IDENTITY CASCADE;`);
  await prisma.$executeRawUnsafe(`TRUNCATE TABLE "SystemConfig" RESTART IDENTITY CASCADE;`);
  
  // Create departments
  const depts = await prisma.department.createMany({
    data: [
      { code: "FY", name: "First Year B.Tech", isFirstYear: true },
      { code: "CE", name: "Computer Engineering", isFirstYear: false },
      { code: "ENTC", name: "Electronics & Telecommunication Engineering", isFirstYear: false },
      { code: "IT", name: "Information Technology", isFirstYear: false },
      { code: "AIDS", name: "Artificial Intelligence & Data Science", isFirstYear: false },
      { code: "ECE", name: "Electronics & Computer Engineering", isFirstYear: false }
    ],
    skipDuplicates: true
  });
  console.log(`   ✅ Created ${depts.count} departments`);
  
  // Get dept map
  const allDepts = await prisma.department.findMany();
  const deptMap = new Map(allDepts.map(d => [d.code, d]));
  
  // Super Admin
  const password = await bcrypt.hash("spaews123", 10);
  await prisma.user.create({
    data: {
      email: "system.admin@spa-ews.edu.in",
      passwordHash: password,
      name: "Super Administrator",
      role: Role.SUPER_ADMIN,
      departmentId: deptMap.get("CE")!.id
    }
  });
  console.log("   ✅ Created super admin");
  
  // System Config
  await prisma.systemConfig.createMany({
    data: [
      { key: "attendance_threshold", value: "75" },
      { key: "marks_threshold", value: "60" }
    ]
  });
  console.log("   ✅ Created system config");
  
  console.log("✅ Step 1 COMPLETE");
}

main().catch(e => { console.error(e); process.exit(1); }).finally(async () => { await prisma.$disconnect(); await pool.end(); });
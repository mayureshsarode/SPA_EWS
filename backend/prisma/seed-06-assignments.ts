import { PrismaClient, AdminRoleLevel } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import "dotenv/config";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Step 6: Assigning Special Roles (FY Admin, Class Coordinators)...");

  const depts = await prisma.department.findMany();
  const deptMap = new Map(depts.map((d) => [d.code, d]));

  const allFaculty = await prisma.facultyProfile.findMany({
    include: { user: true },
  });

  const facultyByDept: Record<string, typeof allFaculty> = {};
  for (const f of allFaculty) {
    const dept = depts.find((d) => d.id === f.user.departmentId);
    if (dept) {
      if (!facultyByDept[dept.code]) facultyByDept[dept.code] = [];
      facultyByDept[dept.code].push(f);
    }
  }

  // 1. Assign FY_ADMIN
  const fyDept = deptMap.get("FY");
  if (fyDept) {
    const fyFaculty = facultyByDept["FY"] || [];
    // HOD is already DEPARTMENT_ADMIN, let's also give them FY_ADMIN or pick another senior
    const fyHead = fyFaculty.find(f => f.adminRole === AdminRoleLevel.DEPARTMENT_ADMIN) || fyFaculty[0];
    if (fyHead) {
      await prisma.facultyProfile.update({
        where: { id: fyHead.id },
        data: { adminRole: AdminRoleLevel.FY_ADMIN }
      });
      console.log(`   ✅ FY_ADMIN assigned to: ${fyHead.user.name}`);
    }
  }

  // 2. Assign Division Coordinators
  console.log("   Assigning Class Coordinators for all divisions...");
  
  const feDivisions = ["FE-1","FE-2","FE-3","FE-4","FE-5","FE-6","FE-7","FE-8","FE-9","FE-10","FE-11","FE-12","FE-13"];
  const seDivConfigs = [
    { dept: "CE", divs: ["SE-1", "SE-2", "SE-3", "SE-4"] },
    { dept: "ENTC", divs: ["SE-5", "SE-6", "SE-7", "SE-8"] },
    { dept: "IT", divs: ["SE-9", "SE-10", "SE-11"] },
    { dept: "AIDS", divs: ["SE-12"] },
    { dept: "ECE", divs: ["SE-13"] }
  ];

  let coordCount = 0;

  // FY Coordinators (Semester 2)
  const fyFacultyPool = [...(facultyByDept["FY"] || [])];
  for (const div of feDivisions) {
    const faculty = fyFacultyPool.pop() || (facultyByDept["FY"]?.[0]);
    if (faculty) {
      await prisma.divisionCoordinator.upsert({
        where: { departmentCode_semester_division: { departmentCode: "FY", semester: 2, division: div } },
        update: { facultyId: faculty.id },
        create: { facultyId: faculty.id, departmentCode: "FY", semester: 2, division: div }
      });
      coordCount++;
    }
  }

  // SE Coordinators (Semester 4)
  for (const config of seDivConfigs) {
    const deptFacultyPool = [...(facultyByDept[config.dept] || [])];
    for (const div of config.divs) {
      const faculty = deptFacultyPool.pop() || (facultyByDept[config.dept]?.[0]);
      if (faculty) {
        await prisma.divisionCoordinator.upsert({
          where: { departmentCode_semester_division: { departmentCode: config.dept, semester: 4, division: div } },
          update: { facultyId: faculty.id },
          create: { facultyId: faculty.id, departmentCode: config.dept, semester: 4, division: div }
        });
        coordCount++;
      }
    }
  }

  console.log(`   ✅ Created ${coordCount} Division Coordinator mappings.`);
  console.log("✅ Step 6 COMPLETE.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });

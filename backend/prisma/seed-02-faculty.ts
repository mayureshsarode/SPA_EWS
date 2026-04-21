import { PrismaClient, Role, AdminRoleLevel } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import bcrypt from "bcrypt";
import "dotenv/config";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const FACULTY_DATA: Record<string, { name: string; desig: string; qual: string }[]> = {
  FY: [
    { name: "SHARADCHANDRA TUKARAM GAWHALE", desig: "ASSO.PROFESSOR", qual: "Ph.D.- Chemistry" },
    { name: "EMANI MAHESWARA REDDY", desig: "ASSTT.PROFESSOR", qual: "M.E.(CIVIL)" },
    { name: "ASMITA AJAY JOSHI", desig: "ASSTT.PROFESSOR", qual: "M.E.(Electrical)" },
    { name: "BHAVNA MUKESH VYAS", desig: "ASSTT.PROFESSOR", qual: "Ph.D.- Chemical Engg." },
    { name: "AVINASH MADHUKARRAO DESHMUKH", desig: "ASSTT.PROFESSOR", qual: "Ph.D. - Mechanical Engineering" },
    { name: "HRUSHIKESH MADHUKAR HIWASE", desig: "Workshop Suptd.", qual: "M.E.(MECHANICAL)" },
    { name: "SHIVAJI VITTHALRAO MUNDHE", desig: "ASSTT.PROFESSOR", qual: "Ph.D.- Mechanical Engineering" },
    { name: "NITEEN PANDITRAO SAPKAL", desig: "ASSTT.PROFESSOR", qual: "M.E.(MECHANICAL)" },
    { name: "MAKRAND DINANATH BANDKAR", desig: "ASSTT.PROFESSOR", qual: "M.E.(PRODUCTION)" },
    { name: "SUJATA ASHOK BARDE", desig: "ASSTT.PROFESSOR", qual: "M.E.(CIVIL)" },
    { name: "ABHISHEK MAKARAND KULKARNI", desig: "ASSTT.PROFESSOR", qual: "M.Sc.(Org.Chemistry)" },
    { name: "KRANTI RAMRAO JADHAV", desig: "ASSTT.PROFESSOR", qual: "M.E.(CIVIL)" },
    { name: "AMOL ASHOK CHAVAN", desig: "ASSTT.PROFESSOR", qual: "M.E.(PRODUCTION)" },
    { name: "PRASHANT DADASAHEB JADHAV", desig: "ASSTT.PROFESSOR", qual: "M.E.(CIVIL)" },
    { name: "SHRIKANT DINKAR HADE", desig: "ASSTT.PROFESSOR", qual: "M.E.(MECHANICAL)" },
    { name: "VIVEK BANESHWAR PATOLE", desig: "ASSTT.PROFESSOR", qual: "M.Sc.(Maths)" },
    { name: "HRUSHIKESH SHIRISH KHATRI", desig: "ASSTT.PROFESSOR", qual: "M.Sc.(Physics)" },
    { name: "NIKHIL VASANT SANGADE", desig: "ASSTT.PROFESSOR", qual: "M.Tech. (Thermal Engg.)" },
    { name: "SUMIT UTTAM BAGADE", desig: "ASSTT.PROFESSOR", qual: "M.Tech. (Electrical)" },
    { name: "PRASHANT GANPAT UMAPE", desig: "ASSTT.PROFESSOR", qual: "Ph.D.- Chemistry" },
    { name: "PANKAJ SUMERSING PATIL", desig: "ASSTT.PROFESSOR", qual: "M.Sc.(Maths)" },
    { name: "NADEEM ANWER NISAR AHMED", desig: "ASSTT.PROFESSOR", qual: "M.Tech.(Ind. Maths)" },
    { name: "KAUSTUBH DILIPRAO KULKARNI", desig: "ASSTT.PROFESSOR", qual: "M.Sc.(Physics)" },
    { name: "ROHAN RAVINDRA VARDHAMAN", desig: "ASSTT.PROFESSOR", qual: "M.E.(CIVIL)" },
    { name: "ANIL SHRAWAN BODHE", desig: "ASSTT.PROFESSOR", qual: "M.Tech. (POWER ELCTRX)" },
    { name: "MANSINGH KUMAR KADAM", desig: "ASSTT.PROFESSOR", qual: "M.Sc.(Maths)" },
    { name: "SUJATA SHIVAPPA PATIL", desig: "ASSTT.PROFESSOR", qual: "M.Sc.(Maths)" },
    { name: "ROHIDAS TUKARAM MALI", desig: "ASSTT.PROFESSOR", qual: "M.Sc.(Physics)" },
    { name: "ASMA NASAR SAYYAD", desig: "ASSTT.PROFESSOR", qual: "M.E.(Mechanical)" },
    { name: "KIRAN LALASO BHOITE", desig: "ASSTT.PROFESSOR", qual: "M.E.(Mechanical)" },
    { name: "SAGAR ARVIND KALE", desig: "ASSTT.PROFESSOR", qual: "M.E.(Structures)" },
    { name: "KANAKA KAUSHIK KOLHATKAR", desig: "ASSTT.PROFESSOR", qual: "M.Sc. (Maths)" },
    { name: "MANDREKAR TANVESH SANDIP", desig: "ASSTT.PROFESSOR", qual: "M.Sc. (Maths)" },
    { name: "MOHINI SADASHIV GHADAGE", desig: "ASSTT.PROFESSOR", qual: "M.E.(Electrical)" },
    { name: "JAYANT SUDHIR YADAV", desig: "ASSTT.PROFESSOR", qual: "Ph. D. (Physics)" },
    { name: "BHIMASHANKAR PRAKASH KUMBHARE", desig: "ASSTT.PROFESSOR", qual: "M.E.(Mechanical)" },
    { name: "PANKAJ KUMAR SAHU", desig: "ASSTT.PROFESSOR", qual: "Post Doctorate.,Ph.D(Electrical)" }
  ],
  CE: [
    { name: "SARANG ACHYUT JOSHI", desig: "PROFESSOR", qual: "Ph.D.- Computer Engineering" },
    { name: "BALWANT AMBADAS SONKAMBLE", desig: "PROFESSOR (PG-DS)", qual: "Ph.D.- Computer Engineering" },
    { name: "MUKTA SUNIL TAKALIKAR", desig: "ASSO.PROFESSOR", qual: "Ph.D.- Computer Science & Tech." },
    { name: "ARATI RAGHURAJ DESHPANDE", desig: "ASSO.PROFESSOR (PG-CE)", qual: "Ph.D.- Computer Engineering" },
    { name: "GEETANJALI VINAYAK KALE", desig: "ASSO.PROFESSOR", qual: "Ph.D.- Computer Engineering" },
    { name: "SHEETAL SAGAR SONAWANE", desig: "ASSO.PROFESSOR", qual: "Ph.D.- Computer Engineering" },
    { name: "ARCHANA SANTOSH GHOTKAR", desig: "ASSO.PROFESSOR", qual: "Ph.D.- Computer Engineering" },
    { name: "REKHA ANILKUMAR KULKARNI", desig: "ASSTT.PROFESSOR", qual: "Ph.D.- Computer Science & Tech." },
    { name: "KALYANI CHETAN WAGHMARE", desig: "ASSTT.PROFESSOR (PG-DS)", qual: "Ph.D.- Computer Engineering" },
    { name: "ANUPAMA GANESH PHAKATKAR", desig: "ASSTT.PROFESSOR", qual: "Ph.D.- Computer Engineering" },
    { name: "PRANJALI PRASHANT JOSHI", desig: "ASSTT.PROFESSOR", qual: "M.E.(COMPUTER)" },
    { name: "PREETI ANAND JAIN", desig: "ASSTT.PROFESSOR", qual: "M.Tech.(I.T.)" },
    { name: "MADHURI SACHIN WAKODE", desig: "ASSTT.PROFESSOR", qual: "M.E.(COMPUTER)" },
    { name: "PRAVIN RAMDAS PATIL", desig: "ASSTT.PROFESSOR", qual: "Ph.D.- Computer Engineering" },
    { name: "SHITAL NAYAN GIRME", desig: "ASSTT.PROFESSOR", qual: "Ph.D.- Computer Engineering" },
    { name: "RATNAMALA KUMAR SUDHIR PASWAN", desig: "ASSTT.PROFESSOR", qual: "M.E.(COMPUTER)" },
    { name: "SUMIT SATISHRAO SHEVTEKAR", desig: "ASSTT.PROFESSOR", qual: "M.E.(COMPUTER)" },
    { name: "ASHWINI DIGAMBAR BUNDELE", desig: "ASSTT.PROFESSOR", qual: "M.E.(COMPUTER)" },
    { name: "ARUNDHATI ATUL CHANDORKAR", desig: "ASSTT.PROFESSOR", qual: "M.E.(COMPUTER)" },
    { name: "YOGESH ASHOK HANDGE", desig: "ASSTT.PROFESSOR", qual: "M.Tech.(S/W Engg.)" },
    { name: "VIRENDRA VISHNUDAS BAGADE", desig: "ASSTT.PROFESSOR (PG-CE)", qual: "M.Tech. (I.T.)" },
    { name: "MAYUR SUBHASH CHAVAN", desig: "ASSTT.PROFESSOR", qual: "M.TECH.(C.S.E.)" },
    { name: "DIPALI DATTATRAY KADAM", desig: "ASSTT.PROFESSOR", qual: "M.TECH.(I.T.)" },
    { name: "SNEHAL PARAG SHINTRE", desig: "ASSTT.PROFESSOR", qual: "M.E.(COMPUTER)" },
    { name: "PARAG JAYGOPAL JAMBHULKAR", desig: "ASSTT.PROFESSOR", qual: "M.E.(C.S.E.)" },
    { name: "PALLAVI SANJAY JOSHI", desig: "ASSTT.PROFESSOR", qual: "M.E.(C.S.E.)" },
    { name: "URMILA SHRIKANT PAWAR", desig: "ASSTT.PROFESSOR", qual: "M.E.(COMPUTER)" },
    { name: "RUTUJA ABHIJIT KULKARNI", desig: "ASSTT.PROFESSOR", qual: "M.E.(C.S.E.)" },
    { name: "BHUMESH PURUSHOTTAM MASRAM", desig: "ASSTT.PROFESSOR", qual: "M.Tech. (Computer)" },
    { name: "MANISH RAVINDRA JANSARI", desig: "ASSTT.PROFESSOR", qual: "M.Tech. (Computer)" },
    { name: "VIJAYENDRA SANJAY GAIKWAD", desig: "ASSTT.PROFESSOR", qual: "M.E.(C.S.E.)" },
    { name: "KOPAL GANGRADE", desig: "ASSTT.PROFESSOR", qual: "M.Tech.(C.S.E.)" },
    { name: "MADHURI VIKAS MANE", desig: "ASSTT.PROFESSOR", qual: "M.E.(C.S.E.)" },
    { name: "SHWETA SHAH", desig: "ASSTT.PROFESSOR", qual: "M.Tech. (Computer)" },
    { name: "POOJA TRIMBAK KOHOK", desig: "ASSTT.PROFESSOR", qual: "M.E.(Computer)" },
    { name: "PRANALI RAJENDRA NAOGHARE", desig: "ASSTT.PROFESSOR", qual: "M.Tech. (IT)" },
    { name: "NIKITA YOGESH KAPADNIS", desig: "ASSTT.PROFESSOR", qual: "M.E.(Computer)" },
    { name: "DIPIKA DILIP BHAIYYA", desig: "ASSTT.PROFESSOR", qual: "M.Tech. (C.S.E.)" },
    { name: "PRIYANKA SATISH SHAHANE", desig: "ASSTT.PROFESSOR", qual: "M.Tech.(CSE.)" },
    { name: "RAJANI RAJESH JADHAV", desig: "ASSTT.PROFESSOR", qual: "M.E.(Computer)" },
    { name: "VAISHALI RAMESH KANDEKAR", desig: "ASSTT.PROFESSOR", qual: "M.E.(Computer)" },
    { name: "SAMADHAN WALU JADHAV", desig: "ASSTT.PROFESSOR", qual: "M.E.(Computer)" },
    { name: "KIMAYA RAHUL URANE", desig: "ASSTT.PROFESSOR", qual: "M.E. (Data Science)" },
    { name: "JAYSHREE SACHIN MAHAJAN", desig: "ASSTT.PROFESSOR", qual: "M.E.(Computer)" },
    { name: "HEMA SAGAR KUMBHAR", desig: "ASSTT.PROFESSOR", qual: "M. E. (I.T)" },
    { name: "MADHURI SOMNATH PATIL", desig: "ASSTT.PROFESSOR", qual: "M. E. (I.T)" },
    { name: "SARIKA ABHIJEET PAWAR", desig: "ASSTT.PROFESSOR", qual: "M.E.(Computer)" },
    { name: "ACHALA RAGHVENDRA DESHPANDE", desig: "ASSTT.PROFESSOR", qual: "M.Tech. (C.S.)" },
    { name: "KUMARI DEEPIKA", desig: "ASSTT.PROFESSOR", qual: "M.Tech. (C.S.T.)" },
    { name: "HINA KAUSAR FEROZ KHAN", desig: "ASSTT.PROFESSOR", qual: "M.E.(Computer)" }
  ],
  ENTC: [
    { name: "SANJAY TRYMBAK GANDHE", desig: "PRINCIPAL", qual: "Ph.D.- E&TC Engg." },
    { name: "RAVINDER BHADRAIAH YERRAM", desig: "PROFESSOR", qual: "Ph.D.- Electronics & Comm." },
    { name: "GIRISH SHRIKISAN MUNDADA", desig: "PROFESSOR", qual: "Ph.D.- E&TC Engg." },
    { name: "MOUSAMI VAIBHAV MUNOT", desig: "ASSO.PROFESSOR", qual: "Ph.D.- E&TC Engg." },
    { name: "RUPESH CHANDRAKANT JAISWAL", desig: "ASSO.PROFESSOR", qual: "Ph.D.- E&TC Engg." },
    { name: "SANDEEP VINAYAK GAIKWAD", desig: "ASSO.PROFESSOR", qual: "Ph.D.- E&TC Engg." },
    { name: "PRADIP SHANKAR VARADE", desig: "ASSO.PROFESSOR", qual: "Ph.D.- Electronics Engg." },
    { name: "RAJENDRA GANGARAM YELALWAR", desig: "ASSO.PROFESSOR", qual: "Ph.D.- E&TC Engg." },
    { name: "SATISH SUDHAKAR NARKHEDE", desig: "ASSO.PROFESSOR", qual: "Ph.D.- E&TC Engg." },
    { name: "SREEMATHY RAMESH", desig: "ASSO.PROFESSOR", qual: "Ph.D.- Electronics Engg." },
    { name: "MOUSAMI PRASHANT TURUK", desig: "ASSTT.PROFESSOR", qual: "Ph.D.- E&TC Engg." },
    { name: "NITIN BARSU PATIL", desig: "ASSTT.PROFESSOR", qual: "M.E.(E&TC)" },
    { name: "VAIBHAV BHARATRAO VAIJAPURKAR", desig: "ASSTT.PROFESSOR", qual: "Ph.D.- E&TC Engg." },
    { name: "ANNAGHA ARVIND BIDKAR", desig: "ASSTT.PROFESSOR", qual: "M.E.(ELECTRONICS)" },
    { name: "DEEPAK MADANRAO SHINDE", desig: "ASSTT.PROFESSOR", qual: "M.E.(ELECTRONICS)" },
    { name: "MAHESH ANANDRAO GANGARDE", desig: "ASSTT.PROFESSOR", qual: "Ph.D.- Electronics Engg." },
    { name: "AMOL SUKHADEORAO INGOLE", desig: "ASSTT.PROFESSOR", qual: "M.E.(ELECTRONICS)" },
    { name: "SUNIL SHRIPAL KHOT", desig: "ASSTT.PROFESSOR (PG-E&C)", qual: "M.E.(E&TC)" },
    { name: "LALIT PURUSHOTTAM PATIL", desig: "ASSTT.PROFESSOR", qual: "M.E.(ELECTRONICS)" },
    { name: "SHAHADEV DATTATRAYA HAKE", desig: "ASSTT.PROFESSOR", qual: "M.E.E&TC - MICROWAVE" },
    { name: "RISHIKESH JANARDAN SUTAR", desig: "ASSTT.PROFESSOR", qual: "M.E.(Electronics)" },
    { name: "NILESH SURESH SHIRUDE", desig: "ASSTT.PROFESSOR", qual: "M.Tech.(Electronics)" },
    { name: "HARSH SHARADKUMAR THAKAR", desig: "ASSTT.PROFESSOR", qual: "M.E.(Electronics)" },
    { name: "SAKSHI MAHESH HOSAMANI", desig: "ASSTT.PROFESSOR", qual: "M.E.(E&TC)" },
    { name: "ANKITA KETAN PATEL", desig: "ASSTT.PROFESSOR", qual: "M.Tech. (E&TC)" },
    { name: "SIDDHESH NARENDRA UPASANI", desig: "ASSTT.PROFESSOR", qual: "M.Tech.(E&TC)" },
    { name: "MANDAR NITIN KAKADE", desig: "ASSTT.PROFESSOR", qual: "Ph.D.- Electronics & Comm. Engg" },
    { name: "BHAKTI DEEPAK KADAM", desig: "ASSTT.PROFESSOR", qual: "M.Tech.(Electronics)" },
    { name: "HEMANTKUMAR BAPU MALI", desig: "ASSTT.PROFESSOR", qual: "M.E.(Electronics)" },
    { name: "ANAGHA VIJAYSINHA RAJPUT", desig: "ASSTT.PROFESSOR", qual: "Ph.D.-Wireless Sensor Network" },
    { name: "PRAGTEE BHAGVAN TATHE", desig: "ASSTT.PROFESSOR", qual: "M.E. (E&TC)" },
    { name: "SHRIDEVI SUKHADEO VASEKAR", desig: "ASSTT.PROFESSOR", qual: "Ph.D.- E&TE Engg." },
    { name: "MANISHA JAYANT SAGADE", desig: "ASSTT.PROFESSOR", qual: "M.E. (E&TC)" },
    { name: "SONALI VIJAY SHINKAR", desig: "ASSTT.PROFESSOR", qual: "Ph.D.- E& C Engg." },
    { name: "NILESH GEORGE NIRMAL", desig: "ASSTT.PROFESSOR", qual: "M.E.(Electronics)" },
    { name: "KOMAL MAHADEO MASAL", desig: "ASSTT.PROFESSOR", qual: "M.E. (Dig.Sys.)" },
    { name: "ASHWINI RAJARAM BANKAR", desig: "ASSTT.PROFESSOR", qual: "M.E. (E&TC)" },
    { name: "TANISHA SANJAYKUMAR LONDHE", desig: "ASSTT.PROFESSOR", qual: "M.E.(Electronics)" },
    { name: "VAISHALI SANJAY KULKARNI", desig: "ASSTT.PROFESSOR", qual: "Ph.D.- E&TC Engg." },
    { name: "PRIYANKA SWAPNIL AGNIHOTRI", desig: "ASSTT.PROFESSOR", qual: "M.E. (E&TC)" },
    { name: "SACHIN DATTATRAYA SHINGADE", desig: "ASSTT.PROFESSOR", qual: "M.E. (E&TC)" },
    { name: "SWAPNIL VITTHAL TATHE", desig: "ASSTT.PROFESSOR", qual: "M.E. (E&TC)" },
    { name: "KANCHAN PRASAD JOSHI", desig: "ASSTT.PROFESSOR", qual: "M.E. (E&TC)" },
    { name: "SHAVETA THAKRAL", desig: "ASSTT.PROFESSOR", qual: "Ph.D" }
  ],
  IT: [
    { name: "EMMANUEL MARK", desig: "PROFESSOR", qual: "Ph.D.- Computer Science & Engg." },
    { name: "GIRISH PANDURANG POTDAR", desig: "ASSO.PROFESSOR", qual: "Ph.D.- Computer Science & Engg" },
    { name: "ANANT MADHUKAR BAGADE", desig: "ASSO.PROFESSOR", qual: "Ph.D.- Computer Science & Engg." },
    { name: "SHYAM BABASAHEB DESHMUKH", desig: "ASSTT.PROFESSOR", qual: "Ph.D.- Computer Science & Engg." },
    { name: "SACHIN SURESH PANDE", desig: "ASSTT.PROFESSOR", qual: "M.E.(I.T.)" },
    { name: "MANISH RAMBHAU KHODASKAR", desig: "ASSTT.PROFESSOR", qual: "M.E.(COMPUTER)" },
    { name: "TUSHAR ANANT RANE", desig: "ASSTT.PROFESSOR", qual: "M.E.(COMPUTER)" },
    { name: "KIRTI YOGESH DIGHOLKAR", desig: "ASSTT.PROFESSOR", qual: "M.E.(COMPUTER SCI.)" },
    { name: "VISHAL RAMESH JAISWAL", desig: "ASSTT.PROFESSOR", qual: "M.E.(COMPUTER)" },
    { name: "RACHNA AMISH KARNAVAT", desig: "ASSTT.PROFESSOR", qual: "M.E.(C.S.E.)" },
    { name: "RAVINDRA BABURAO MURUMKAR", desig: "ASSTT.PROFESSOR", qual: "M.E.(COMPUTER)" },
    { name: "NAMAN VIJAY BURADKAR", desig: "ASSTT.PROFESSOR", qual: "M.E.(COMPUTER)" },
    { name: "SACHIN DASHARATH SHELKE", desig: "ASSTT.PROFESSOR", qual: "M.Tech. (INFO.TECH.)" },
    { name: "SANDEEP RAMBHAU WARHADE", desig: "ASSTT.PROFESSOR", qual: "M.Tech. (INFO.TECH.)" },
    { name: "SUMITRA AMIT JAKHETE", desig: "ASSTT.PROFESSOR", qual: "M.E.(COMPUTER)" },
    { name: "ABHINAY GULABRAO DHAMANKAR", desig: "ASSTT.PROFESSOR", qual: "M.E.(COMPUTER)" },
    { name: "JAGDISH KASHINATH KAMBLE", desig: "ASSTT.PROFESSOR", qual: "M.Tech. (Info.&Com.Tech.)" },
    { name: "ABHIJEET CHANDRAKANT KARVE", desig: "ASSTT.PROFESSOR", qual: "M.E.(C.S.E.)" },
    { name: "PRAJAKTA SUBHASH SHINDE", desig: "ASSTT.PROFESSOR", qual: "M.E.(Computer)" },
    { name: "JYOTI HINDURAO JADHAV", desig: "ASSTT.PROFESSOR", qual: "M.E.(Computer)" },
    { name: "SWAPNAJA RAJESH HIRAY", desig: "ASSTT.PROFESSOR", qual: "M.E.(Computer)" },
    { name: "AMRUTA ABHINANDAN PATIL", desig: "ASSTT.PROFESSOR", qual: "M.E.(Computer)" },
    { name: "DEEPALI PRASHANT SALAPURKAR", desig: "ASSTT.PROFESSOR", qual: "M.E. (Computer Network)" },
    { name: "VINIT RAJEEV TRIBHUVAN", desig: "ASSTT.PROFESSOR", qual: "M.E.(Computer)" },
    { name: "SAYALI GAURAV GAIKWAD", desig: "ASSTT.PROFESSOR", qual: "M.E.(Computer)" },
    { name: "AMEYA ANIL KADAM", desig: "ASSTT.PROFESSOR", qual: "M.E.(DS)" },
    { name: "ARTI GORAKHNATH GHULE", desig: "ASSTT.PROFESSOR", qual: "M.E.(C.S.E.)" },
    { name: "PUNAM ASHISH SHINDE", desig: "ASSTT.PROFESSOR", qual: "M.E.(Computer)" },
    { name: "NEHA NIVRUTTI JAMDAR", desig: "ASSTT.PROFESSOR", qual: "M.E.(Computer)" },
    { name: "HRUCHA CHANDRASHEKHAR DESHMUKH", desig: "ASSTT.PROFESSOR", qual: "M.E.(DS)" },
    { name: "BHAGYASHREE SWAPNIL KADAM", desig: "ASSTT.PROFESSOR", qual: "M.E.(Computer)" }
  ],
  ECE: [
    { name: "SUNIL KANHOBAJI MOON", desig: "ASSO.PROFESSOR", qual: "Ph.D.- Electronics Engg." },
    { name: "MOHAN ANNA CHIMANNA", desig: "ASSTT.PROFESSOR", qual: "M.E. (E&TC)" },
    { name: "SNEHA CHANDRAKANT NAHATKAR", desig: "ASSTT.PROFESSOR", qual: "M. TECH (Dig. Comm.)" },
    { name: "SUDERSHAN PRAKASH DOLLI", desig: "ASSTT.PROFESSOR", qual: "M.E.(E&TC)" },
    { name: "RUPALI ASHOK PATIL", desig: "ASSTT.PROFESSOR", qual: "M.E.(E&TC)" },
    { name: "ASHOK DNYANDEO VIDHATE", desig: "ASSTT.PROFESSOR", qual: "M.E.(E&TC)" },
    { name: "ANJALI ABHIJIT YADAV", desig: "ASSTT.PROFESSOR", qual: "M.E.(E&TC)" },
    { name: "TEJASWEENI GIRISH HAMPE", desig: "ASSTT.PROFESSOR", qual: "M.E.(E&TC)" }
  ],
  AIDS: [
    { name: "SHWETA CHANDRASHEKHAR DHARMADHIKARI", desig: "ASSO.PROFESSOR", qual: "Ph.D.- Computer Science" },
    { name: "ANJALI ANIL DESHPANDE", desig: "ASTT. PROFESSOR", qual: "M.E.(COMPUTER)" },
    { name: "MRUNAL MAHADEO MULE", desig: "ASTT. PROFESSOR", qual: "M. TECH (C.S.E)" },
    { name: "DEEPA BAPOO MANE", desig: "ASTT. PROFESSOR", qual: "M.E (IT)" },
    { name: "MANJUSHRI VILAS RAUT", desig: "ASTT. PROFESSOR", qual: "M.E (IT)" },
    { name: "TANUJA SAJID MULLA", desig: "ASTT. PROFESSOR", qual: "M.Tech. (Computer)" },
    { name: "DIVYA DILIPKUMAR CHECHANI", desig: "ASTT. PROFESSOR", qual: "M.E.(Computer)" },
    { name: "BHAGYASHRI SARANG KULKARNI", desig: "ASTT. PROFESSOR", qual: "M.Tech(Nano Technology)" }
  ]
};

function slugifyName(name: string) {
  return name.toLowerCase().replace(/[^\w\s.]/g, "").replace(/\s+/g, ".").trim();
}

async function main() {
  console.log("🌱 Step 2: Seeding Faculty (178 members)...");
  
  // Check existing
  const existing = await prisma.user.count({ where: { role: Role.FACULTY } });
  if (existing > 0) {
    console.log(`   ⚠️  Already have ${existing} faculty. Skipping.`);
    console.log("   To re-seed: DELETE FROM \"User\" WHERE \"role\" = 'FACULTY';");
    return;
  }
  
  const depts = await prisma.department.findMany();
  const deptMap = new Map(depts.map(d => [d.code, d]));
  
  const password = await bcrypt.hash("spaews123", 10);
  let total = 0;
  
  for (const [deptCode, list] of Object.entries(FACULTY_DATA)) {
    const dept = deptMap.get(deptCode);
    if (!dept) continue;
    
    // HOD = first with Ph.D
    const hod = list.find(f => f.qual.includes("Ph.D")) || list[0];
    
    for (const f of list) {
      const isHod = f === hod;
      const cleanName = f.name.split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
      const email = `${slugifyName(f.name)}@spa-ews.edu.in`;
      
      await prisma.user.create({
        data: {
          email,
          passwordHash: password,
          name: cleanName,
          role: Role.FACULTY,
          departmentId: dept.id,
          facultyProfile: {
            create: {
              designation: f.desig,
              adminRole: isHod ? AdminRoleLevel.DEPARTMENT_ADMIN : AdminRoleLevel.NONE
            }
          }
        }
      });
      total++;
    }
    console.log(`   ✅ ${deptCode}: ${list.length} faculty (HOD: ${hod.name})`);
  }
  
  console.log(`✅ Step 2 COMPLETE: ${total} faculty`);
}

main().catch(e => { console.error(e); process.exit(1); }).finally(async () => { await prisma.$disconnect(); await pool.end(); });
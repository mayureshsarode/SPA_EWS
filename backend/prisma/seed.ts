import { PrismaClient, Role, AdmissionType, AdminRoleLevel } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import bcrypt from "bcrypt";
import "dotenv/config";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// ─── FULL FACULTY DATA (178 MEMBERS) ─────────────────────────

const FACULTY_DATA = {
  FY: [
    { name: "SHARADCHANDRA TUKARAM GAWHALE", desig: "ASSO.PROFESSOR", join: "2017-09-01", qual: "Ph.D.- Chemistry" },
    { name: "EMANI MAHESWARA REDDY", desig: "ASSTT.PROFESSOR", join: "2006-08-16", qual: "M.E.(CIVIL)" },
    { name: "ASMITA AJAY JOSHI", desig: "ASSTT.PROFESSOR", join: "1996-07-15", qual: "M.E.(Electrical)" },
    { name: "BHAVNA MUKESH VYAS", desig: "ASSTT.PROFESSOR", join: "1996-08-01", qual: "Ph.D.- Chemical Engg." },
    { name: "AVINASH MADHUKARRAO DESHMUKH", desig: "ASSTT.PROFESSOR", join: "2000-09-20", qual: "Ph.D. - Mechanical Engineering" },
    { name: "HRUSHIKESH MADHUKAR HIWASE", desig: "Workshop Suptd.", join: "2004-09-06", qual: "M.E.(MECHANICAL)" },
    { name: "SHIVAJI VITTHALRAO MUNDHE", desig: "ASSTT.PROFESSOR", join: "2008-07-01", qual: "Ph.D.- Mechanical Engineering" },
    { name: "NITEEN PANDITRAO SAPKAL", desig: "ASSTT.PROFESSOR", join: "2009-03-02", qual: "M.E.(MECHANICAL)" },
    { name: "MAKRAND DINANATH BANDKAR", desig: "ASSTT.PROFESSOR", join: "2009-12-01", qual: "M.E.(PRODUCTION)" },
    { name: "SUJATA ASHOK BARDE", desig: "ASSTT.PROFESSOR", join: "2011-02-10", qual: "M.E.(CIVIL)" },
    { name: "ABHISHEK MAKARAND KULKARNI", desig: "ASSTT.PROFESSOR", join: "2012-07-16", qual: "M.Sc.(Org.Chemistry)" },
    { name: "KRANTI RAMRAO JADHAV", desig: "ASSTT.PROFESSOR", join: "2012-07-16", qual: "M.E.(CIVIL)" },
    { name: "AMOL ASHOK CHAVAN", desig: "ASSTT.PROFESSOR", join: "2012-07-26", qual: "M.E.(PRODUCTION)" },
    { name: "PRASHANT DADASAHEB JADHAV", desig: "ASSTT.PROFESSOR", join: "2013-07-06", qual: "M.E.(CIVIL)" },
    { name: "SHRIKANT DINKAR HADE", desig: "ASSTT.PROFESSOR", join: "2013-07-18", qual: "M.E.(MECHANICAL)" },
    { name: "VIVEK BANESHWAR PATOLE", desig: "ASSTT.PROFESSOR", join: "2015-07-24", qual: "M.Sc.(Maths)" },
    { name: "HRUSHIKESH SHIRISH KHATRI", desig: "ASSTT.PROFESSOR", join: "2016-12-15", qual: "M.Sc.(Physics)" },
    { name: "NIKHIL VASANT SANGADE", desig: "ASSTT.PROFESSOR", join: "2017-06-27", qual: "M.Tech. (Thermal Engg.)" },
    { name: "SUMIT UTTAM BAGADE", desig: "ASSTT.PROFESSOR", join: "2017-06-27", qual: "M.Tech. (Electrical)" },
    { name: "PRASHANT GANPAT UMAPE", desig: "ASSTT.PROFESSOR", join: "2017-07-21", qual: "Ph.D.- Chemistry" },
    { name: "PANKAJ SUMERSING PATIL", desig: "ASSTT.PROFESSOR", join: "2019-07-15", qual: "M.Sc.(Maths)" },
    { name: "NADEEM ANWER NISAR AHMED", desig: "ASSTT.PROFESSOR", join: "2021-01-01", qual: "M.Tech.(Ind. Maths)" },
    { name: "KAUSTUBH DILIPRAO KULKARNI", desig: "ASSTT.PROFESSOR", join: "2021-01-01", qual: "M.Sc.(Physics)" },
    { name: "ROHAN RAVINDRA VARDHAMAN", desig: "ASSTT.PROFESSOR", join: "2021-01-01", qual: "M.E.(CIVIL)" },
    { name: "ANIL SHRAWAN BODHE", desig: "ASSTT.PROFESSOR", join: "2021-01-01", qual: "M.Tech. (POWER ELCTRX)" },
    { name: "MANSINGH KUMAR KADAM", desig: "ASSTT.PROFESSOR", join: "2021-08-26", qual: "M.Sc.(Maths)" },
    { name: "SUJATA SHIVAPPA PATIL", desig: "ASSTT.PROFESSOR", join: "2021-08-26", qual: "M.Sc.(Maths)" },
    { name: "ROHIDAS TUKARAM MALI", desig: "ASSTT.PROFESSOR", join: "2021-11-18", qual: "M.Sc.(Physics)" },
    { name: "ASMA NASAR SAYYAD", desig: "ASSTT.PROFESSOR", join: "2021-12-01", qual: "M.E.(Mechanical)" },
    { name: "KIRAN LALASO BHOITE", desig: "ASSTT.PROFESSOR", join: "2023-01-02", qual: "M.E.(Mechanical)" },
    { name: "SAGAR ARVIND KALE", desig: "ASSTT.PROFESSOR", join: "2023-09-04", qual: "M.E.(Structures)" },
    { name: "KANAKA KAUSHIK KOLHATKAR", desig: "ASSTT.PROFESSOR", join: "2024-01-10", qual: "M.Sc. (Maths)" },
    { name: "MANDREKAR TANVESH SANDIP", desig: "ASSTT.PROFESSOR", join: "2024-02-01", qual: "M.Sc. (Maths)" },
    { name: "MOHINI SADASHIV GHADAGE", desig: "ASSTT.PROFESSOR", join: "2024-08-01", qual: "M.E.(Electrical)" },
    { name: "JAYANT SUDHIR YADAV", desig: "ASSTT.PROFESSOR", join: "2024-10-07", qual: "Ph. D. (Physics)" },
    { name: "BHIMASHANKAR PRAKASH KUMBHARE", desig: "ASSTT.PROFESSOR", join: "2025-08-01", qual: "M.E.(Mechanical)" },
    { name: "PANKAJ KUMAR SAHU", desig: "ASSTT.PROFESSOR", join: "2025-11-17", qual: "Post Doctorate.,Ph.D(Electrical)" }
  ],
  CE: [
    { name: "SARANG ACHYUT JOSHI", desig: "PROFESSOR", join: "1991-07-01", qual: "Ph.D.- Computer Engineering" },
    { name: "BALWANT AMBADAS SONKAMBLE", desig: "PROFESSOR (PG-DS)", join: "1997-08-05", qual: "Ph.D.- Computer Engineering" },
    { name: "MUKTA SUNIL TAKALIKAR", desig: "ASSO.PROFESSOR", join: "1996-11-26", qual: "Ph.D.- Computer Science & Tech." },
    { name: "ARATI RAGHURAJ DESHPANDE", desig: "ASSO.PROFESSOR (PG-CE)", join: "2002-08-01", qual: "Ph.D.- Computer Engineering" },
    { name: "GEETANJALI VINAYAK KALE", desig: "ASSO.PROFESSOR", join: "2002-08-07", qual: "Ph.D.- Computer Engineering" },
    { name: "SHEETAL SAGAR SONAWANE", desig: "ASSO.PROFESSOR", join: "2003-01-01", qual: "Ph.D.- Computer Engineering" },
    { name: "ARCHANA SANTOSH GHOTKAR", desig: "ASSO.PROFESSOR", join: "2005-12-01", qual: "Ph.D.- Computer Engineering" },
    { name: "REKHA ANILKUMAR KULKARNI", desig: "ASSTT.PROFESSOR", join: "1997-08-25", qual: "Ph.D.- Computer Science & Tech." },
    { name: "KALYANI CHETAN WAGHMARE", desig: "ASSTT.PROFESSOR (PG-DS)", join: "1999-10-01", qual: "Ph.D.- Computer Engineering" },
    { name: "ANUPAMA GANESH PHAKATKAR", desig: "ASSTT.PROFESSOR", join: "2002-08-08", qual: "Ph.D.- Computer Engineering" },
    { name: "PRANJALI PRASHANT JOSHI", desig: "ASSTT.PROFESSOR", join: "2005-06-27", qual: "M.E.(COMPUTER)" },
    { name: "PREETI ANAND JAIN", desig: "ASSTT.PROFESSOR", join: "2005-07-11", qual: "M.Tech.(I.T.)" },
    { name: "MADHURI SACHIN WAKODE", desig: "ASSTT.PROFESSOR", join: "2005-08-01", qual: "M.E.(COMPUTER)" },
    { name: "PRAVIN RAMDAS PATIL", desig: "ASSTT.PROFESSOR", join: "2005-09-03", qual: "Ph.D.- Computer Engineering" },
    { name: "SHITAL NAYAN GIRME", desig: "ASSTT.PROFESSOR", join: "2006-07-10", qual: "Ph.D.- Computer Engineering" },
    { name: "RATNAMALA KUMAR SUDHIR PASWAN", desig: "ASSTT.PROFESSOR", join: "2006-12-21", qual: "M.E.(COMPUTER)" },
    { name: "SUMIT SATISHRAO SHEVTEKAR", desig: "ASSTT.PROFESSOR", join: "2008-01-18", qual: "M.E.(COMPUTER)" },
    { name: "ASHWINI DIGAMBAR BUNDELE", desig: "ASSTT.PROFESSOR", join: "2009-09-22", qual: "M.E.(COMPUTER)" },
    { name: "ARUNDHATI ATUL CHANDORKAR", desig: "ASSTT.PROFESSOR", join: "2010-10-01", qual: "M.E.(COMPUTER)" },
    { name: "YOGESH ASHOK HANDGE", desig: "ASSTT.PROFESSOR", join: "2011-08-31", qual: "M.Tech.(S/W Engg.)" },
    { name: "VIRENDRA VISHNUDAS BAGADE", desig: "ASSTT.PROFESSOR (PG-CE)", join: "2011-12-10", qual: "M.Tech. (I.T.)" },
    { name: "MAYUR SUBHASH CHAVAN", desig: "ASSTT.PROFESSOR", join: "2012-07-19", qual: "M.TECH.(C.S.E.)" },
    { name: "DIPALI DATTATRAY KADAM", desig: "ASSTT.PROFESSOR", join: "2012-08-02", qual: "M.TECH.(I.T.)" },
    { name: "SNEHAL PARAG SHINTRE", desig: "ASSTT.PROFESSOR", join: "2014-06-02", qual: "M.E.(COMPUTER)" },
    { name: "PARAG JAYGOPAL JAMBHULKAR", desig: "ASSTT.PROFESSOR", join: "2014-11-24", qual: "M.E.(C.S.E.)" },
    { name: "PALLAVI SANJAY JOSHI", desig: "ASSTT.PROFESSOR", join: "2015-06-02", qual: "M.E.(C.S.E.)" },
    { name: "URMILA SHRIKANT PAWAR", desig: "ASSTT.PROFESSOR", join: "2015-06-08", qual: "M.E.(COMPUTER)" },
    { name: "RUTUJA ABHIJIT KULKARNI", desig: "ASSTT.PROFESSOR", join: "2016-06-20", qual: "M.E.(C.S.E.)" },
    { name: "BHUMESH PURUSHOTTAM MASRAM", desig: "ASSTT.PROFESSOR", join: "2017-06-27", qual: "M.Tech. (Computer)" },
    { name: "MANISH RAVINDRA JANSARI", desig: "ASSTT.PROFESSOR", join: "2017-06-27", qual: "M.Tech. (Computer)" },
    { name: "VIJAYENDRA SANJAY GAIKWAD", desig: "ASSTT.PROFESSOR", join: "2020-09-02", qual: "M.E.(C.S.E.)" },
    { name: "KOPAL GANGRADE", desig: "ASSTT.PROFESSOR", join: "2021-01-25", qual: "M.Tech.(C.S.E.)" },
    { name: "MADHURI VIKAS MANE", desig: "ASSTT.PROFESSOR", join: "2021-08-24", qual: "M.E.(C.S.E.)" },
    { name: "SHWETA SHAH", desig: "ASSTT.PROFESSOR", join: "2022-01-06", qual: "M.Tech. (Computer)" },
    { name: "POOJA TRIMBAK KOHOK", desig: "ASSTT.PROFESSOR", join: "2022-03-02", qual: "M.E.(Computer)" },
    { name: "PRANALI RAJENDRA NAOGHARE", desig: "ASSTT.PROFESSOR", join: "2022-03-02", qual: "M.Tech. (IT)" },
    { name: "NIKITA YOGESH KAPADNIS", desig: "ASSTT.PROFESSOR", join: "2022-07-04", qual: "M.E.(Computer)" },
    { name: "DIPIKA DILIP BHAIYYA", desig: "ASSTT.PROFESSOR", join: "2022-07-04", qual: "M.Tech. (C.S.E.)" },
    { name: "PRIYANKA SATISH SHAHANE", desig: "ASSTT.PROFESSOR", join: "2022-07-04", qual: "M.Tech.(CSE.)" },
    { name: "RAJANI RAJESH JADHAV", desig: "ASSTT.PROFESSOR", join: "2022-08-25", qual: "M.E.(Computer)" },
    { name: "VAISHALI RAMESH KANDEKAR", desig: "ASSTT.PROFESSOR", join: "2022-10-07", qual: "M.E.(Computer)" },
    { name: "SAMADHAN WALU JADHAV", desig: "ASSTT.PROFESSOR", join: "2022-12-15", qual: "M.E.(Computer)" },
    { name: "KIMAYA RAHUL URANE", desig: "ASSTT.PROFESSOR", join: "2022-12-19", qual: "M.E. (Data Science)" },
    { name: "JAYSHREE SACHIN MAHAJAN", desig: "ASSTT.PROFESSOR", join: "2023-01-16", qual: "M.E.(Computer)" },
    { name: "HEMA SAGAR KUMBHAR", desig: "ASSTT.PROFESSOR", join: "2024-08-01", qual: "M. E. (I.T)" },
    { name: "MADHURI SOMNATH PATIL", desig: "ASSTT.PROFESSOR", join: "2024-10-08", qual: "M. E. (I.T)" },
    { name: "SARIKA ABHIJEET PAWAR", desig: "ASSTT.PROFESSOR", join: "2024-08-23", qual: "M.E.(Computer)" },
    { name: "ACHALA RAGHVENDRA DESHPANDE", desig: "ASSTT.PROFESSOR", join: "2024-08-27", qual: "M.Tech. (C.S.)" },
    { name: "KUMARI DEEPIKA", desig: "ASSTT.PROFESSOR", join: "2024-08-27", qual: "M.Tech. (C.S.T.)" },
    { name: "HINA KAUSAR FEROZ KHAN", desig: "ASSTT.PROFESSOR", join: "2025-08-18", qual: "M.E.(Computer)" }
  ],
  ENTC: [
    { name: "SANJAY TRYMBAK GANDHE", desig: "PRINCIPAL", join: "2022-09-27", qual: "Ph.D.- E&TC Engg." },
    { name: "RAVINDER BHADRAIAH YERRAM", desig: "PROFESSOR", join: "1996-07-30", qual: "Ph.D.- Electronics & Comm." },
    { name: "GIRISH SHRIKISAN MUNDADA", desig: "PROFESSOR", join: "1994-08-09", qual: "Ph.D.- E&TC Engg." },
    { name: "MOUSAMI VAIBHAV MUNOT", desig: "ASSO.PROFESSOR", join: "2005-01-01", qual: "Ph.D.- E&TC Engg." },
    { name: "RUPESH CHANDRAKANT JAISWAL", desig: "ASSO.PROFESSOR", join: "1999-04-09", qual: "Ph.D.- E&TC Engg." },
    { name: "SANDEEP VINAYAK GAIKWAD", desig: "ASSO.PROFESSOR", join: "2007-07-11", qual: "Ph.D.- E&TC Engg." },
    { name: "PRADIP SHANKAR VARADE", desig: "ASSO.PROFESSOR", join: "2002-01-04", qual: "Ph.D.- Electronics Engg." },
    { name: "RAJENDRA GANGARAM YELALWAR", desig: "ASSO.PROFESSOR", join: "2003-08-08", qual: "Ph.D.- E&TC Engg." },
    { name: "SATISH SUDHAKAR NARKHEDE", desig: "ASSO.PROFESSOR", join: "2024-12-09", qual: "Ph.D.- E&TC Engg." },
    { name: "SREEMATHY RAMESH", desig: "ASSO.PROFESSOR", join: "2024-12-09", qual: "Ph.D.- Electronics Engg." },
    { name: "MOUSAMI PRASHANT TURUK", desig: "ASSTT.PROFESSOR", join: "2003-01-01", qual: "Ph.D.- E&TC Engg." },
    { name: "NITIN BARSU PATIL", desig: "ASSTT.PROFESSOR", join: "2006-07-07", qual: "M.E.(E&TC)" },
    { name: "VAIBHAV BHARATRAO VAIJAPURKAR", desig: "ASSTT.PROFESSOR", join: "2007-07-07", qual: "Ph.D.- E&TC Engg." },
    { name: "ANNAGHA ARVIND BIDKAR", desig: "ASSTT.PROFESSOR", join: "2007-07-16", qual: "M.E.(ELECTRONICS)" },
    { name: "DEEPAK MADANRAO SHINDE", desig: "ASSTT.PROFESSOR", join: "2008-07-01", qual: "M.E.(ELECTRONICS)" },
    { name: "MAHESH ANANDRAO GANGARDE", desig: "ASSTT.PROFESSOR", join: "2008-07-01", qual: "Ph.D.- Electronics Engg." },
    { name: "AMOL SUKHADEORAO INGOLE", desig: "ASSTT.PROFESSOR", join: "2008-07-01", qual: "M.E.(ELECTRONICS)" },
    { name: "SUNIL SHRIPAL KHOT", desig: "ASSTT.PROFESSOR (PG-E&C)", join: "2008-07-03", qual: "M.E.(E&TC)" },
    { name: "LALIT PURUSHOTTAM PATIL", desig: "ASSTT.PROFESSOR", join: "2009-12-01", qual: "M.E.(ELECTRONICS)" },
    { name: "SHAHADEV DATTATRAYA HAKE", desig: "ASSTT.PROFESSOR", join: "2011-12-07", qual: "M.E.E&TC - MICROWAVE" },
    { name: "RISHIKESH JANARDAN SUTAR", desig: "ASSTT.PROFESSOR", join: "2014-06-02", qual: "M.E.(Electronics)" },
    { name: "NILESH SURESH SHIRUDE", desig: "ASSTT.PROFESSOR", join: "2014-09-04", qual: "M.Tech.(Electronics)" },
    { name: "HARSH SHARADKUMAR THAKAR", desig: "ASSTT.PROFESSOR", join: "2014-06-16", qual: "M.E.(Electronics)" },
    { name: "SAKSHI MAHESH HOSAMANI", desig: "ASSTT.PROFESSOR", join: "2014-07-01", qual: "M.E.(E&TC)" },
    { name: "ANKITA KETAN PATEL", desig: "ASSTT.PROFESSOR", join: "2019-06-18", qual: "M.Tech. (E&TC)" },
    { name: "SIDDHESH NARENDRA UPASANI", desig: "ASSTT.PROFESSOR", join: "2019-06-25", qual: "M.Tech.(E&TC)" },
    { name: "MANDAR NITIN KAKADE", desig: "ASSTT.PROFESSOR", join: "2021-01-01", qual: "Ph.D.- Electronics & Comm. Engg" },
    { name: "BHAKTI DEEPAK KADAM", desig: "ASSTT.PROFESSOR", join: "2021-01-01", qual: "M.Tech.(Electronics)" },
    { name: "HEMANTKUMAR BAPU MALI", desig: "ASSTT.PROFESSOR", join: "2021-08-02", qual: "M.E.(Electronics)" },
    { name: "ANAGHA VIJAYSINHA RAJPUT", desig: "ASSTT.PROFESSOR", join: "2021-08-25", qual: "Ph.D.-Wireless Sensor Network" },
    { name: "PRAGTEE BHAGVAN TATHE", desig: "ASSTT.PROFESSOR", join: "2021-08-26", qual: "M.E. (E&TC)" },
    { name: "SHRIDEVI SUKHADEO VASEKAR", desig: "ASSTT.PROFESSOR", join: "2022-03-10", qual: "Ph.D.- E&TE Engg." },
    { name: "MANISHA JAYANT SAGADE", desig: "ASSTT.PROFESSOR", join: "2022-03-17", qual: "M.E. (E&TC)" },
    { name: "SONALI VIJAY SHINKAR", desig: "ASSTT.PROFESSOR", join: "2022-04-19", qual: "Ph.D.- E& C Engg." },
    { name: "NILESH GEORGE NIRMAL", desig: "ASSTT.PROFESSOR", join: "2022-07-04", qual: "M.E.(Electronics)" },
    { name: "KOMAL MAHADEO MASAL", desig: "ASSTT.PROFESSOR", join: "2022-08-01", qual: "M.E. (Dig.Sys.)" },
    { name: "ASHWINI RAJARAM BANKAR", desig: "ASSTT.PROFESSOR", join: "2024-08-16", qual: "M.E. (E&TC)" },
    { name: "TANISHA SANJAYKUMAR LONDHE", desig: "ASSTT.PROFESSOR", join: "2024-08-26", qual: "M.E.(Electronics)" },
    { name: "VAISHALI SANJAY KULKARNI", desig: "ASSTT.PROFESSOR", join: "2024-08-30", qual: "Ph.D.- E&TC Engg." },
    { name: "PRIYANKA SWAPNIL AGNIHOTRI", desig: "ASSTT.PROFESSOR", join: "2024-08-31", qual: "M.E. (E&TC)" },
    { name: "SACHIN DATTATRAYA SHINGADE", desig: "ASSTT.PROFESSOR", join: "2025-07-04", qual: "M.E. (E&TC)" },
    { name: "SWAPNIL VITTHAL TATHE", desig: "ASSTT.PROFESSOR", join: "2025-07-10", qual: "M.E. (E&TC)" },
    { name: "KANCHAN PRASAD JOSHI", desig: "ASSTT.PROFESSOR", join: "2026-01-05", qual: "M.E. (E&TC)" },
    { name: "SHAVETA THAKRAL", desig: "ASSTT.PROFESSOR", join: "2026-01-13", qual: "Ph.D" }
  ],
  IT: [
    { name: "EMMANUEL MARK", desig: "PROFESSOR", join: "2003-06-02", qual: "Ph.D.- Computer Science & Engg." },
    { name: "GIRISH PANDURANG POTDAR", desig: "ASSO.PROFESSOR", join: "1995-06-07", qual: "Ph.D.- Computer Science & Engg" },
    { name: "ANANT MADHUKAR BAGADE", desig: "ASSO.PROFESSOR", join: "2001-01-02", qual: "Ph.D.- Computer Science & Engg." },
    { name: "SHYAM BABASAHEB DESHMUKH", desig: "ASSTT.PROFESSOR", join: "1999-10-01", qual: "Ph.D.- Computer Science & Engg." },
    { name: "SACHIN SURESH PANDE", desig: "ASSTT.PROFESSOR", join: "2002-09-05", qual: "M.E.(I.T.)" },
    { name: "MANISH RAMBHAU KHODASKAR", desig: "ASSTT.PROFESSOR", join: "2004-01-01", qual: "M.E.(COMPUTER)" },
    { name: "TUSHAR ANANT RANE", desig: "ASSTT.PROFESSOR", join: "2005-07-11", qual: "M.E.(COMPUTER)" },
    { name: "KIRTI YOGESH DIGHOLKAR", desig: "ASSTT.PROFESSOR", join: "2005-08-01", qual: "M.E.(COMPUTER SCI.)" },
    { name: "VISHAL RAMESH JAISWAL", desig: "ASSTT.PROFESSOR", join: "2006-01-13", qual: "M.E.(COMPUTER)" },
    { name: "RACHNA AMISH KARNAVAT", desig: "ASSTT.PROFESSOR", join: "2006-08-01", qual: "M.E.(C.S.E.)" },
    { name: "RAVINDRA BABURAO MURUMKAR", desig: "ASSTT.PROFESSOR", join: "2006-08-28", qual: "M.E.(COMPUTER)" },
    { name: "NAMAN VIJAY BURADKAR", desig: "ASSTT.PROFESSOR", join: "2007-01-22", qual: "M.E.(COMPUTER)" },
    { name: "SACHIN DASHARATH SHELKE", desig: "ASSTT.PROFESSOR", join: "2007-06-01", qual: "M.Tech. (INFO.TECH.)" },
    { name: "SANDEEP RAMBHAU WARHADE", desig: "ASSTT.PROFESSOR", join: "2007-07-14", qual: "M.Tech. (INFO.TECH.)" },
    { name: "SUMITRA AMIT JAKHETE", desig: "ASSTT.PROFESSOR", join: "2009-10-03", qual: "M.E.(COMPUTER)" },
    { name: "ABHINAY GULABRAO DHAMANKAR", desig: "ASSTT.PROFESSOR", join: "2011-12-03", qual: "M.E.(COMPUTER)" },
    { name: "JAGDISH KASHINATH KAMBLE", desig: "ASSTT.PROFESSOR", join: "2017-07-03", qual: "M.Tech. (Info.&Com.Tech.)" },
    { name: "ABHIJEET CHANDRAKANT KARVE", desig: "ASSTT.PROFESSOR", join: "2020-09-02", qual: "M.E.(C.S.E.)" },
    { name: "PRAJAKTA SUBHASH SHINDE", desig: "ASSTT.PROFESSOR", join: "2021-08-24", qual: "M.E.(Computer)" },
    { name: "JYOTI HINDURAO JADHAV", desig: "ASSTT.PROFESSOR", join: "2021-09-01", qual: "M.E.(Computer)" },
    { name: "SWAPNAJA RAJESH HIRAY", desig: "ASSTT.PROFESSOR", join: "2022-03-02", qual: "M.E.(Computer)" },
    { name: "AMRUTA ABHINANDAN PATIL", desig: "ASSTT.PROFESSOR", join: "2022-12-19", qual: "M.E.(Computer)" },
    { name: "DEEPALI PRASHANT SALAPURKAR", desig: "ASSTT.PROFESSOR", join: "2023-04-06", qual: "M.E. (Computer Network)" },
    { name: "VINIT RAJEEV TRIBHUVAN", desig: "ASSTT.PROFESSOR", join: "2023-09-01", qual: "M.E.(Computer)" },
    { name: "SAYALI GAURAV GAIKWAD", desig: "ASSTT.PROFESSOR", join: "2024-08-12", qual: "M.E.(Computer)" },
    { name: "AMEYA ANIL KADAM", desig: "ASSTT.PROFESSOR", join: "2024-08-20", qual: "M.E.(DS)" },
    { name: "ARTI GORAKHNATH GHULE", desig: "ASSTT.PROFESSOR", join: "2024-08-27", qual: "M.E.(C.S.E.)" },
    { name: "PUNAM ASHISH SHINDE", desig: "ASSTT.PROFESSOR", join: "2024-08-29", qual: "M.E.(Computer)" },
    { name: "NEHA NIVRUTTI JAMDAR", desig: "ASSTT.PROFESSOR", join: "2024-08-31", qual: "M.E.(Computer)" },
    { name: "HRUCHA CHANDRASHEKHAR DESHMUKH", desig: "ASSTT.PROFESSOR", join: "2025-07-02", qual: "M.E.(DS)" },
    { name: "BHAGYASHREE SWAPNIL KADAM", desig: "ASSTT.PROFESSOR", join: "2026-01-23", qual: "M.E.(Computer)" }
  ],
  ECE: [
    { name: "SUNIL KANHOBAJI MOON", desig: "ASSO.PROFESSOR", join: "1999-07-10", qual: "Ph.D.- Electronics Engg." },
    { name: "MOHAN ANNA CHIMANNA", desig: "ASSTT.PROFESSOR", join: "2023-01-02", qual: "M.E. (E&TC)" },
    { name: "SNEHA CHANDRAKANT NAHATKAR", desig: "ASSTT.PROFESSOR", join: "2024-08-20", qual: "M. TECH (Dig. Comm.)" },
    { name: "SUDERSHAN PRAKASH DOLLI", desig: "ASSTT.PROFESSOR", join: "2025-07-01", qual: "M.E.(E&TC)" },
    { name: "RUPALI ASHOK PATIL", desig: "ASSTT.PROFESSOR", join: "2025-07-01", qual: "M.E.(E&TC)" },
    { name: "ASHOK DNYANDEO VIDHATE", desig: "ASSTT.PROFESSOR", join: "2025-07-03", qual: "M.E.(E&TC)" },
    { name: "ANJALI ABHIJIT YADAV", desig: "ASSTT.PROFESSOR", join: "2025-07-04", qual: "M.E.(E&TC)" },
    { name: "TEJASWEENI GIRISH HAMPE", desig: "ASSTT.PROFESSOR", join: "2026-01-13", qual: "M.E.(E&TC)" }
  ],
  AIDS: [
    { name: "SHWETA CHANDRASHEKHAR DHARMADHIKARI", desig: "ASSO.PROFESSOR", join: "2002-08-01", qual: "Ph.D.- Computer Science" },
    { name: "ANJALI ANIL DESHPANDE", desig: "ASTT. PROFESSOR", join: "2024-08-20", qual: "M.E.(COMPUTER)" },
    { name: "MRUNAL MAHADEO MULE", desig: "ASTT. PROFESSOR", join: "2024-08-26", qual: "M. TECH (C.S.E)" },
    { name: "DEEPA BAPOO MANE", desig: "ASTT. PROFESSOR", join: "2025-07-01", qual: "M.E (IT)" },
    { name: "MANJUSHRI VILAS RAUT", desig: "ASTT. PROFESSOR", join: "2025-07-02", qual: "M.E (IT)" },
    { name: "TANUJA SAJID MULLA", desig: "ASTT. PROFESSOR", join: "2025-07-02", qual: "M.Tech. (Computer)" },
    { name: "DIVYA DILIPKUMAR CHECHANI", desig: "ASTT. PROFESSOR", join: "2025-07-03", qual: "M.E.(Computer)" },
    { name: "BHAGYASHRI SARANG KULKARNI", desig: "ASTT. PROFESSOR", join: "2026-01-12", qual: "M.Tech(Nano Technology)" }
  ]
};

// ─── UTILS ───────────────────────────────────────────────────

function slugifyName(name: string) {
  return name.toLowerCase().replace(/[^\w\s.]/g, "").replace(/\s+/g, ".").trim();
}

function pick<T>(arr: T[]): T {
  if (arr.length === 0) throw new Error("Pick from empty array");
  return arr[Math.floor(Math.random() * arr.length)];
}

const BASE_PASSWORD = "spaews123";

// ─── CONFIG ──────────────────────────────────────────────────

const DEPT_DIVISIONS: Record<string, number> = {
  CE: 4, ENTC: 4, IT: 3, AIDS: 1, ECE: 1
};
const BRANCH_CODES: Record<string, string> = {
  CE: "ce", ENTC: "et", IT: "it", AIDS: "ad", ECE: "ec"
};

// ─── MAIN SEED ───────────────────────────────────────────────

async function main() {
  console.log("🌱 Starting SPA-EWS FULL SEED (178 Faculty members)...");

  // 1. Reset Database
  const tables = ["User", "Department", "StudentProfile", "FacultyProfile", "Course", "CourseOffering", "CourseEnrollment", "DivisionCoordinator", "AcademicHistory", "ExternalAssessment", "SystemConfig"];
  for (const t of tables) {
    await prisma.$executeRawUnsafe(`TRUNCATE TABLE "${t}" RESTART IDENTITY CASCADE;`);
  }

  // 2. Departments
  const departments: Record<string, any> = {};
  for (const code of ["FY", "CE", "ENTC", "IT", "AIDS", "ECE"]) {
    departments[code] = await prisma.department.create({
      data: { code, name: code === "FY" ? "First Year B.Tech" : `${code} Department`, isFirstYear: code === "FY" }
    });
  }

  // 3. Super Admin
  const adminPassword = await bcrypt.hash(BASE_PASSWORD, 10);
  await prisma.user.create({
    data: {
      email: "system.admin@spa-ews.edu.in",
      passwordHash: adminPassword,
      name: "Super Administrator",
      role: Role.SUPER_ADMIN,
      departmentId: departments.CE.id
    }
  });

  // 4. Faculty Seeding (Full List)
  const facultyByDept: Record<string, any[]> = { FY: [], CE: [], ENTC: [], IT: [], AIDS: [], ECE: [] };
  const facultyPassword = await bcrypt.hash(BASE_PASSWORD, 10);

  for (const [deptCode, rawList] of Object.entries(FACULTY_DATA)) {
    const hodCand = rawList.find(f => f.qual.includes("Ph.D")) || rawList[0];

    for (const f of rawList) {
      const isHod = f === hodCand;
      const cleanName = f.name.toLowerCase().split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
      const email = `${slugifyName(f.name)}@spa-ews.edu.in`;

      const user = await prisma.user.create({
        data: {
          email,
          passwordHash: facultyPassword,
          name: cleanName,
          role: Role.FACULTY,
          departmentId: departments[deptCode].id,
          facultyProfile: {
            create: {
              designation: f.desig,
              adminRole: isHod ? AdminRoleLevel.DEPARTMENT_ADMIN : AdminRoleLevel.NONE,
            }
          }
        },
        include: { facultyProfile: true }
      });
      facultyByDept[deptCode].push(user.facultyProfile);
    }
  }

  // 5. Courses
  const courses: Record<string, any[]> = { FY1: [], FY2: [], SE3: [], SE4: [] };
  const fySetup = [ {c:"FY101", n:"Linear Algebra", s:1}, {c:"FY102", n:"Physics", s:1}, {c:"FY201", n:"Calculus", s:2}, {c:"FY202", n:"Chemistry", s:2} ];
  for (const c of fySetup) {
    const res = await prisma.course.create({ data: { courseCode: c.c, name: c.n, credits: 4, departmentId: departments.FY.id } });
    courses[c.s === 1 ? "FY1" : "FY2"].push(res);
  }

  for (const code of ["CE", "ENTC", "IT", "AIDS", "ECE"]) {
    const s3 = await prisma.course.create({ data: { courseCode: `${code}301`, name: `${code} Engineering I`, credits: 4, departmentId: departments[code].id } });
    const s4 = await prisma.course.create({ data: { courseCode: `${code}401`, name: `${code} Engineering II`, credits: 4, departmentId: departments[code].id } });
    courses.SE3.push(s3); courses.SE4.push(s4);
  }

  // 6. Offerings
  const offerings: any[] = [];
  const allCourses = [...courses.FY1, ...courses.FY2, ...courses.SE3, ...courses.SE4];
  for (const c of allCourses) {
    const dCode = c.courseCode.substring(0, 2);
    const pool = facultyByDept[dCode] || facultyByDept.CE;
    const off = await prisma.courseOffering.create({
      data: { courseId: c.id, facultyId: pick(pool).id, semester: parseInt(c.courseCode.match(/\d/)?.[0] || "1"), lecturesConducted: 40 }
    });
    offerings.push(off);
  }

  // 7. Student Seeding (BATCHED for performance)
  const studentPassword = await bcrypt.hash(BASE_PASSWORD, 10);
  
  const seedBatch = async (year: number, currentSem: number, acYear: string) => {
    let divCounter = 1;
    const studentBatchData: any[] = [];
    const profileBatchData: any[] = [];
    const historyBatchData: any[] = [];
    const enrollmentBatchData: any[] = [];
    
    // Phase 1: Build all data in memory
    for (const [deptCode, numDivs] of Object.entries(DEPT_DIVISIONS)) {
      for (let d = 0; d < numDivs; d++) {
        const divName = `${year === 25 ? 'FE' : 'SE'}-${divCounter++}`;
        
        for (let i = 1; i <= 60; i++) {
          const prn = `f${year}${BRANCH_CODES[deptCode]}${String(i).padStart(3, "0")}`;
          const deptId = year === 25 ? departments.FY.id : departments[deptCode].id;
          const mentorId = pick(facultyByDept[deptCode]).id;
          
          studentBatchData.push({
            email: prn,
            passwordHash: studentPassword,
            name: `Student ${prn.toUpperCase()}`,
            role: Role.STUDENT,
            departmentId: deptId
          });
          
          profileBatchData.push({
            prnNumber: prn,
            admissionType: AdmissionType.REGULAR,
            coreBranchCode: deptCode,
            currentSemester: currentSem,
            academicYear: acYear,
            division: divName,
            mentorId: mentorId
          });
          
          historyBatchData.push({
            tenthPercentage: 70 + (i % 25),
            twelfthPercentage: 65 + (i % 30)
          });
        }
      }
    }

    // Phase 2: Batch insert users (50 at a time)
    console.log(`    Creating ${studentBatchData.length} users...`);
    const createdUsers: any[] = [];
    for (let i = 0; i < studentBatchData.length; i += 50) {
      const batch = studentBatchData.slice(i, i + 50);
      const created = await prisma.user.createMany({ data: batch, skipDuplicates: true });
      createdUsers.push(...batch);
    }
    
    // Fetch created users to get IDs
    const emails = studentBatchData.map(s => s.email);
    const users = await prisma.user.findMany({ where: { email: { in: emails } }, select: { id: true, email: true } });
    const userMap = new Map(users.map(u => [u.email, u.id]));

    // Phase 3: Batch insert studentProfiles (100 at a time)
    console.log(`    Creating student profiles...`);
    for (let i = 0; i < profileBatchData.length; i += 100) {
      const profiles = profileBatchData.slice(i, i + 100).map((p, idx) => ({
        ...p,
        userId: userMap.get(profileBatchData[i + idx].prnNumber) || ""
      })).filter(p => p.userId);
      await prisma.studentProfile.createMany({ data: profiles, skipDuplicates: true });
    }

    // Fetch student profiles to get IDs
    const allProfiles = await prisma.studentProfile.findMany({
      where: { prnNumber: { in: profileBatchData.map(p => p.prnNumber) } },
      select: { id: true, prnNumber: true }
    });
    const profileMap = new Map(allProfiles.map(p => [p.prnNumber, p.id]));

    // Phase 4: Batch insert academicHistory
    console.log(`    Creating academic history...`);
    for (let i = 0; i < historyBatchData.length; i += 100) {
      const history = historyBatchData.slice(i, i + 100).map((h, idx) => ({
        ...h,
        studentId: profileMap.get(profileBatchData[i + idx].prnNumber) || ""
      })).filter(h => h.studentId);
      await prisma.academicHistory.createMany({ data: history, skipDuplicates: true });
    }

    // Phase 5: Batch insert course enrollments
    console.log(`    Creating course enrollments...`);
    const relevantOfferings = offerings.filter(o => o.semester <= currentSem);
    for (const [deptCode] of Object.entries(DEPT_DIVISIONS)) {
      const deptProfiles = allProfiles.filter(p => p.prnNumber.startsWith(BRANCH_CODES[deptCode]));
      for (const profile of deptProfiles) {
        for (const off of relevantOfferings) {
          const isPast = off.semester < currentSem;
          const randIdx = Math.floor(Math.random() * 60) + 1;
          enrollmentBatchData.push({
            studentId: profile.id,
            offeringId: off.id,
            lecturesAttended: isPast ? 35 + (randIdx % 6) : 10 + (randIdx % 15),
            cieMarks: isPast ? 75 + (randIdx % 20) : 15 + (randIdx % 20)
          });
        }
      }
    }
    
    // Insert enrollments in batches
    for (let i = 0; i < enrollmentBatchData.length; i += 100) {
      await prisma.courseEnrollment.createMany({ data: enrollmentBatchData.slice(i, i + 100), skipDuplicates: true });
    }
    
    console.log(`    ✅ Batch complete: ${profileBatchData.length} students`);
  };

  console.log("  🧑‍🎓 Creating FE batch (Sem 2)...");
  await seedBatch(25, 2, "2025-26");
  
  console.log("  🧑‍🎓 Creating SE batch (Sem 4)...");
  await seedBatch(24, 4, "2024-25");

  // 8. Config Defaults
  await prisma.systemConfig.createMany({
    data: [{ key: "attendance_threshold", value: "75" }, { key: "marks_threshold", value: "60" }]
  });

  console.log("✅ FULL SEED COMPLETE!");
}

main().catch(e => { console.error(e); process.exit(1); }).finally(async () => { await prisma.$disconnect(); await pool.end(); });

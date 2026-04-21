// Centralized mock data for the entire application

export interface Student {
  id: string;
  name: string;
  email: string;
  division: string;
  department: string;
  semester: number;
  attendance: number;
  internalMarks: number;
  status: "safe" | "warning" | "critical";
  mentorId?: string;
  subjects: SubjectData[];
}

export interface SubjectData {
  code: string;
  name: string;
  attendance: number;
  cie1: number;
  cie2: number;
  cie3: number;
  maxMarks: number;
  facultyId: string;
}

export interface Faculty {
  id: string;
  name: string;
  email: string;
  department: string;
  designation: string;
  courses: CourseAssignment[];
}

export interface CourseAssignment {
  courseCode: string;
  courseName: string;
  divisions: string[];
  semester: number;
}

export interface AttendanceRecord {
  date: string;
  courseCode: string;
  division: string;
  students: { studentId: string; present: boolean }[];
}

// Faculty data
export const faculties: Faculty[] = [
  {
    id: "F001",
    name: "Prof. Sunita Pawar",
    email: "sunita.pawar@pict.edu",
    department: "Computer Engineering",
    designation: "Associate Professor",
    courses: [
      { courseCode: "CS301", courseName: "Data Structures & Algorithms", divisions: ["A", "B"], semester: 3 },
      { courseCode: "CS501", courseName: "Database Management Systems", divisions: ["A"], semester: 5 },
    ],
  },
  {
    id: "F002",
    name: "Dr. B. A. Sonkamble",
    email: "ba.sonkamble@pict.edu",
    department: "Computer Engineering",
    designation: "Professor",
    courses: [
      { courseCode: "CS302", courseName: "Operating Systems", divisions: ["A", "B"], semester: 3 },
      { courseCode: "CS502", courseName: "Computer Networks", divisions: ["B"], semester: 5 },
    ],
  },
  {
    id: "F003",
    name: "Prof. Sarah Wilson",
    email: "sarah.wilson@university.edu",
    department: "Mathematics",
    designation: "Assistant Professor",
    courses: [
      { courseCode: "MA301", courseName: "Engineering Mathematics III", divisions: ["A", "B"], semester: 3 },
    ],
  },
];

// Student data
export const students: Student[] = [
  {
    id: "S001", name: "Aditi Patil", email: "aditi.p@pict.edu", division: "A", department: "Computer Engineering", semester: 3, attendance: 95, internalMarks: 88, status: "safe", mentorId: "F001",
    subjects: [
      { code: "CS301", name: "DSA", attendance: 96, cie1: 42, cie2: 44, cie3: 45, maxMarks: 50, facultyId: "F001" },
      { code: "CS302", name: "OS", attendance: 94, cie1: 38, cie2: 40, cie3: 42, maxMarks: 50, facultyId: "F002" },
      { code: "MA301", name: "Maths III", attendance: 95, cie1: 44, cie2: 43, cie3: 46, maxMarks: 50, facultyId: "F003" },
    ],
  },
  {
    id: "S002", name: "Rohan Deshmukh", email: "rohan.d@pict.edu", division: "A", department: "Computer Engineering", semester: 3, attendance: 78, internalMarks: 72, status: "warning", mentorId: "F001",
    subjects: [
      { code: "CS301", name: "DSA", attendance: 80, cie1: 35, cie2: 36, cie3: 38, maxMarks: 50, facultyId: "F001" },
      { code: "CS302", name: "OS", attendance: 76, cie1: 30, cie2: 32, cie3: 34, maxMarks: 50, facultyId: "F002" },
      { code: "MA301", name: "Maths III", attendance: 78, cie1: 36, cie2: 38, cie3: 35, maxMarks: 50, facultyId: "F003" },
    ],
  },
  {
    id: "S003", name: "Sneha Kulkarni", email: "sneha.k@pict.edu", division: "A", department: "Computer Engineering", semester: 3, attendance: 92, internalMarks: 85, status: "safe",
    subjects: [
      { code: "CS301", name: "DSA", attendance: 94, cie1: 40, cie2: 42, cie3: 44, maxMarks: 50, facultyId: "F001" },
      { code: "CS302", name: "OS", attendance: 90, cie1: 38, cie2: 40, cie3: 41, maxMarks: 50, facultyId: "F002" },
      { code: "MA301", name: "Maths III", attendance: 92, cie1: 42, cie2: 43, cie3: 44, maxMarks: 50, facultyId: "F003" },
    ],
  },
  {
    id: "S004", name: "Abhishek Joshi", email: "abhishek.j@pict.edu", division: "A", department: "Computer Engineering", semester: 3, attendance: 65, internalMarks: 58, status: "critical",
    subjects: [
      { code: "CS301", name: "DSA", attendance: 60, cie1: 25, cie2: 28, cie3: 30, maxMarks: 50, facultyId: "F001" },
      { code: "CS302", name: "OS", attendance: 62, cie1: 22, cie2: 25, cie3: 28, maxMarks: 50, facultyId: "F002" },
      { code: "MA301", name: "Maths III", attendance: 73, cie1: 30, cie2: 32, cie3: 35, maxMarks: 50, facultyId: "F003" },
    ],
  },
  {
    id: "S005", name: "Priya Shinde", email: "priya.s@pict.edu", division: "B", department: "Computer Engineering", semester: 3, attendance: 88, internalMarks: 90, status: "safe",
    subjects: [
      { code: "CS301", name: "DSA", attendance: 90, cie1: 45, cie2: 46, cie3: 48, maxMarks: 50, facultyId: "F001" },
      { code: "CS302", name: "OS", attendance: 86, cie1: 42, cie2: 44, cie3: 45, maxMarks: 50, facultyId: "F002" },
      { code: "MA301", name: "Maths III", attendance: 88, cie1: 44, cie2: 45, cie3: 46, maxMarks: 50, facultyId: "F003" },
    ],
  },
  {
    id: "S006", name: "Rahul Chavan", email: "rahul.c@pict.edu", division: "B", department: "Computer Engineering", semester: 3, attendance: 70, internalMarks: 65, status: "warning",
    subjects: [
      { code: "CS301", name: "DSA", attendance: 72, cie1: 30, cie2: 32, cie3: 35, maxMarks: 50, facultyId: "F001" },
      { code: "CS302", name: "OS", attendance: 68, cie1: 28, cie2: 30, cie3: 32, maxMarks: 50, facultyId: "F002" },
      { code: "MA301", name: "Maths III", attendance: 70, cie1: 32, cie2: 34, cie3: 36, maxMarks: 50, facultyId: "F003" },
    ],
  },
  {
    id: "S007", name: "Shruti Kamble", email: "shruti.k@pict.edu", division: "B", department: "Computer Engineering", semester: 3, attendance: 60, internalMarks: 55, status: "critical",
    subjects: [
      { code: "CS301", name: "DSA", attendance: 58, cie1: 22, cie2: 24, cie3: 26, maxMarks: 50, facultyId: "F001" },
      { code: "CS302", name: "OS", attendance: 56, cie1: 20, cie2: 22, cie3: 25, maxMarks: 50, facultyId: "F002" },
      { code: "MA301", name: "Maths III", attendance: 66, cie1: 28, cie2: 30, cie3: 32, maxMarks: 50, facultyId: "F003" },
    ],
  },
  {
    id: "S008", name: "Varun Bhosale", email: "varun.b@pict.edu", division: "A", department: "Computer Engineering", semester: 3, attendance: 94, internalMarks: 92, status: "safe",
    subjects: [
      { code: "CS301", name: "DSA", attendance: 96, cie1: 46, cie2: 47, cie3: 48, maxMarks: 50, facultyId: "F001" },
      { code: "CS302", name: "OS", attendance: 92, cie1: 44, cie2: 45, cie3: 46, maxMarks: 50, facultyId: "F002" },
      { code: "MA301", name: "Maths III", attendance: 94, cie1: 45, cie2: 46, cie3: 47, maxMarks: 50, facultyId: "F003" },
    ],
  },
  {
    id: "S009", name: "Neha Deshpande", email: "neha.d@pict.edu", division: "A", department: "Computer Engineering", semester: 3, attendance: 75, internalMarks: 68, status: "warning",
    subjects: [
      { code: "CS301", name: "DSA", attendance: 76, cie1: 32, cie2: 34, cie3: 36, maxMarks: 50, facultyId: "F001" },
      { code: "CS302", name: "OS", attendance: 74, cie1: 28, cie2: 30, cie3: 33, maxMarks: 50, facultyId: "F002" },
      { code: "MA301", name: "Maths III", attendance: 75, cie1: 34, cie2: 36, cie3: 38, maxMarks: 50, facultyId: "F003" },
    ],
  },
  {
    id: "S010", name: "Aditya Kale", email: "aditya.k@pict.edu", division: "B", department: "Computer Engineering", semester: 3, attendance: 90, internalMarks: 87, status: "safe",
    subjects: [
      { code: "CS301", name: "DSA", attendance: 92, cie1: 42, cie2: 44, cie3: 45, maxMarks: 50, facultyId: "F001" },
      { code: "CS302", name: "OS", attendance: 88, cie1: 40, cie2: 42, cie3: 44, maxMarks: 50, facultyId: "F002" },
      { code: "MA301", name: "Maths III", attendance: 90, cie1: 43, cie2: 44, cie3: 45, maxMarks: 50, facultyId: "F003" },
    ],
  },
  {
    id: "S011", name: "Mrunmayee Thakur", email: "mrunmayee.t@pict.edu", division: "B", department: "Computer Engineering", semester: 3, attendance: 58, internalMarks: 52, status: "critical",
    subjects: [
      { code: "CS301", name: "DSA", attendance: 55, cie1: 20, cie2: 22, cie3: 24, maxMarks: 50, facultyId: "F001" },
      { code: "CS302", name: "OS", attendance: 54, cie1: 18, cie2: 20, cie3: 22, maxMarks: 50, facultyId: "F002" },
      { code: "MA301", name: "Maths III", attendance: 65, cie1: 26, cie2: 28, cie3: 30, maxMarks: 50, facultyId: "F003" },
    ],
  },
  {
    id: "S012", name: "Rohit Salunkhe", email: "rohit.s@pict.edu", division: "A", department: "Computer Engineering", semester: 3, attendance: 85, internalMarks: 80, status: "safe",
    subjects: [
      { code: "CS301", name: "DSA", attendance: 86, cie1: 38, cie2: 40, cie3: 42, maxMarks: 50, facultyId: "F001" },
      { code: "CS302", name: "OS", attendance: 84, cie1: 36, cie2: 38, cie3: 40, maxMarks: 50, facultyId: "F002" },
      { code: "MA301", name: "Maths III", attendance: 85, cie1: 40, cie2: 42, cie3: 43, maxMarks: 50, facultyId: "F003" },
    ],
  },
];

// Departments
export const departments = [
  { id: "D001", name: "Basic Sciences and Engineering(F. Y. B. Tech)", code: "FY", divisions: ["A", "B", "C"], hod: "Prof. E. M. Reddy" },
  { id: "D002", name: "Computer Engineering", code: "CE", divisions: ["A", "B"], hod: "Dr. B. A. Sonkamble" },
  { id: "D003", name: "Electronics and Telecommunication Engineering", code: "ENTC", divisions: ["A", "B"], hod: "Dr. G. S. Mundada" },
  { id: "D004", name: "Information Technology", code: "IT", divisions: ["A"], hod: "Dr. Emmanuel Mark" },
  { id: "D005", name: "Electronics and Computer Engineering", code: "ECE", divisions: ["A"], hod: "Dr. Sunil K. Moon" },
  { id: "D006", name: "Artificial Intelligence and Data Science Engineering", code: "AIDS", divisions: ["A"], hod: "Dr. Shweta C. Dharmadhikari" },
];

// Helper functions
export function getStudentsByDivision(division: string) {
  return students.filter((s) => s.division === division);
}

export function getStudentsByCourse(courseCode: string, division: string) {
  return students.filter(
    (s) => s.division === division && s.subjects.some((sub) => sub.code === courseCode)
  );
}

export function getStatusColor(status: string) {
  if (status === "safe") return "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400";
  if (status === "warning") return "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400";
  if (status === "critical") return "bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400";
  return "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-400";
}

export function getStatusGradient(status: string) {
  if (status === "safe") return "from-emerald-500 to-teal-500";
  if (status === "warning") return "from-amber-500 to-orange-500";
  return "from-rose-500 to-red-500";
}

import { useState } from "react";
import { motion } from "motion/react";
import {
  Calendar,
  Check,
  CheckCircle,
  ChevronDown,
  Users,
  XCircle,
  Briefcase,
} from "lucide-react";
import { students, faculties, getStudentsByCourse } from "../data/mock-data";
import { FacultyLayout } from "../components/faculty-layout";

export function FacultyAttendance() {
  const faculty = faculties[0]; // Current faculty
  const [selectedCourse, setSelectedCourse] = useState(faculty.courses[0].courseCode);
  const [selectedDivision, setSelectedDivision] = useState(faculty.courses[0].divisions[0]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [attendanceMap, setAttendanceMap] = useState<Record<string, "present" | "absent" | "dl">>({});
  const [submitted, setSubmitted] = useState(false);

  const currentCourse = faculty.courses.find((c) => c.courseCode === selectedCourse);
  const divisionStudents = getStudentsByCourse(selectedCourse, selectedDivision);

  const setAttendance = (studentId: string, status: "present" | "absent" | "dl") => {
    setAttendanceMap((prev) => ({ ...prev, [studentId]: status }));
  };

  const markAll = (status: "present" | "absent" | "dl") => {
    const map: Record<string, "present" | "absent" | "dl"> = {};
    divisionStudents.forEach((s) => (map[s.id] = status));
    setAttendanceMap(map);
  };

  const presentCount = divisionStudents.filter((s) => attendanceMap[s.id] === "present").length;
  const dlCount = divisionStudents.filter((s) => attendanceMap[s.id] === "dl").length;
  const absentCount = divisionStudents.length - presentCount - dlCount;

  const handleSubmit = () => {
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <FacultyLayout activeItem="Attendance">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Attendance</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Mark student attendance for your courses</p>
        </div>

        {/* Filters */}
        <motion.div
          className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Course</label>
              <select
                value={selectedCourse}
                onChange={(e) => {
                  setSelectedCourse(e.target.value);
                  const course = faculty.courses.find((c) => c.courseCode === e.target.value);
                  if (course) setSelectedDivision(course.divisions[0]);
                  setAttendanceMap({});
                }}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {faculty.courses.map((c) => (
                  <option key={c.courseCode} value={c.courseCode}>{c.courseCode} — {c.courseName}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Division</label>
              <select
                value={selectedDivision}
                onChange={(e) => { setSelectedDivision(e.target.value); setAttendanceMap({}); }}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {currentCourse?.divisions.map((d) => (
                  <option key={d} value={d}>Division {d}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Date</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </motion.div>

        {/* Summary + Bulk Actions */}
        <motion.div
          className="flex flex-wrap items-center gap-3 justify-between"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 font-bold text-sm">
              <CheckCircle className="w-4 h-4" />
              Present: {presentCount}
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-400 font-bold text-sm" title="Duty Leave">
              <Briefcase className="w-4 h-4" />
              DL: {dlCount}
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 font-bold text-sm">
              <XCircle className="w-4 h-4" />
              Absent: {absentCount}
            </div>
            <div className="text-sm text-slate-500 dark:text-slate-400 ml-2">
              Total: {divisionStudents.length}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => markAll("present")}
              className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition-colors"
            >
              Mark All Present
            </button>
            <button
              onClick={() => markAll("absent")}
              className="px-4 py-2 rounded-xl bg-rose-600 text-white text-sm font-semibold hover:bg-rose-700 transition-colors"
            >
              Mark All Absent
            </button>
          </div>
        </motion.div>

        {/* Student List */}
        <motion.div
          className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <div className="divide-y divide-slate-200 dark:divide-slate-800">
            {divisionStudents.map((student, i) => {
              const status = attendanceMap[student.id] || "absent";
              return (
                <motion.div
                  key={student.id}
                  className={`flex items-center justify-between p-4 transition-colors ${
                    status === "present" ? "bg-emerald-50/50 dark:bg-emerald-950/10" :
                    status === "dl" ? "bg-indigo-50/50 dark:bg-indigo-950/10" :
                    "hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  }`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, delay: i * 0.03 }}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
                        status === "present" ? "bg-gradient-to-br from-emerald-500 to-teal-500 shadow-lg shadow-emerald-500/20" :
                        status === "dl" ? "bg-gradient-to-br from-indigo-500 to-violet-500 shadow-lg shadow-indigo-500/20" :
                        "bg-slate-200 dark:bg-slate-700"
                      }`}
                    >
                      {status === "present" ? <Check className="w-5 h-5 text-white" /> :
                       status === "dl" ? <Briefcase className="w-5 h-5 text-white" /> :
                       <span className="text-sm font-bold text-slate-500 dark:text-slate-400">{student.name.charAt(0)}</span>
                      }
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900 dark:text-white">{student.name}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">{student.id} • Div {student.division}</div>
                    </div>
                  </div>
                  
                  {/* 3-way toggle */}
                  <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                    <button
                      onClick={() => setAttendance(student.id, "present")}
                      className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        status === "present" ? "bg-emerald-500 text-white shadow-sm" : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
                      }`}
                    >
                      Present
                    </button>
                    <button
                      onClick={() => setAttendance(student.id, "dl")}
                      className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        status === "dl" ? "bg-indigo-500 text-white shadow-sm" : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
                      }`}
                    >
                      DL
                    </button>
                    <button
                      onClick={() => setAttendance(student.id, "absent")}
                      className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        status === "absent" ? "bg-rose-500 text-white shadow-sm" : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
                      }`}
                    >
                      Absent
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Submit */}
        <motion.div
          className="flex justify-end"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <button
            onClick={handleSubmit}
            className={`px-8 py-3.5 rounded-xl font-semibold text-white transition-all duration-300 ${
              submitted
                ? "bg-emerald-600 shadow-lg shadow-emerald-500/25"
                : "bg-gradient-to-r from-indigo-600 to-violet-600 hover:shadow-xl shadow-indigo-500/20 hover:-translate-y-0.5"
            }`}
          >
            {submitted ? "✓ Attendance Submitted!" : "Submit Attendance"}
          </button>
        </motion.div>
      </div>
    </FacultyLayout>
  );
}

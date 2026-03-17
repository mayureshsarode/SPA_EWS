import { motion } from "motion/react";
import {
  Mail,
  MessageSquare,
  BookOpen,
  Star,
} from "lucide-react";
import { faculties, students } from "../data/mock-data";
import { StudentLayout } from "../components/student-layout";
import { Link } from "react-router";

export function StudentFaculty() {
  const student = students[0]; // Current student

  // Get faculty who teach this student's subjects
  const myFaculty = faculties.filter((f) =>
    f.courses.some((c) =>
      student.subjects.some((s) => s.facultyId === f.id)
    )
  );

  return (
    <StudentLayout activeItem="My Faculty">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">My Faculty</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Faculty members teaching your courses</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {myFaculty.map((faculty, i) => {
            const teachingCourses = faculty.courses.filter((c) =>
              student.subjects.some((s) => s.code === c.courseCode)
            );

            return (
              <motion.div
                key={faculty.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden hover:shadow-lg dark:hover:shadow-2xl dark:hover:shadow-indigo-500/5 transition-all duration-300"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
              >
                {/* Gradient Header */}
                <div className="bg-gradient-to-r from-indigo-600 to-violet-600 p-6 text-center relative">
                  <div className="w-20 h-20 mx-auto rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                    {faculty.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                  </div>
                </div>

                <div className="p-6">
                  <div className="text-center mb-4">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">{faculty.name}</h3>
                    <div className="text-sm text-slate-500 dark:text-slate-400">{faculty.designation}</div>
                    <div className="text-sm text-indigo-600 dark:text-indigo-400 font-medium">{faculty.department}</div>
                  </div>

                  {/* Courses */}
                  <div className="space-y-2 mb-4">
                    {teachingCourses.map((course) => (
                      <div
                        key={course.courseCode}
                        className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50"
                      >
                        <BookOpen className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                        <div className="text-sm">
                          <span className="font-medium text-slate-900 dark:text-white">{course.courseName}</span>
                          <span className="text-slate-500 dark:text-slate-400 ml-1">({course.courseCode})</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      to="/student/messages"
                      className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-sm font-semibold hover:shadow-lg shadow-indigo-500/20 transition-all"
                    >
                      <MessageSquare className="w-4 h-4" />
                      Message
                    </Link>
                    <a
                      href={`mailto:${faculty.email}`}
                      className="flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    >
                      <Mail className="w-4 h-4" />
                      Email
                    </a>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </StudentLayout>
  );
}

import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Link } from "react-router";
import {
  BookOpen,
  Users,
  Calendar,
  ClipboardList,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { api } from "../lib/api";
import { FacultyLayout } from "../components/faculty-layout";

export function FacultyCourses() {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api('/faculty/me/dashboard')
      .then(res => setCourses(res.data.courses || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <FacultyLayout activeItem="My Courses">
        <div className="flex justify-center items-center min-h-[50vh]">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        </div>
      </FacultyLayout>
    );
  }

  return (
    <FacultyLayout activeItem="My Courses">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">My Courses</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Courses and divisions assigned to you</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {courses.map((course: any, i: number) => (
            <motion.div
              key={course.id}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden hover:shadow-lg dark:hover:shadow-2xl dark:hover:shadow-indigo-500/5 transition-all duration-300"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
            >
              {/* Course Header */}
              <div className="bg-gradient-to-r from-indigo-600 to-violet-600 p-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <BookOpen className="w-7 h-7 text-white" />
                  </div>
                  <div className="text-white">
                    <div className="text-xs font-medium text-indigo-200 mb-0.5">{course.courseCode}</div>
                    <h3 className="text-lg font-bold">{course.courseName}</h3>
                    <div className="text-sm text-indigo-200">Semester {course.semester} — Division {course.division}</div>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="p-6">
                <div className="grid grid-cols-3 gap-3 mb-5">
                  <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 text-center">
                    <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{course.safeStudents ?? '—'}</div>
                    <div className="text-xs text-slate-500 mt-0.5">Safe</div>
                  </div>
                  <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/20 text-center">
                    <div className="text-lg font-bold text-amber-600 dark:text-amber-400">{course.warningStudents ?? '—'}</div>
                    <div className="text-xs text-slate-500 mt-0.5">Warning</div>
                  </div>
                  <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/20 text-center">
                    <div className="text-lg font-bold text-rose-600 dark:text-rose-400">{course.criticalStudents ?? '—'}</div>
                    <div className="text-xs text-slate-500 mt-0.5">Critical</div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    to="/faculty/attendance"
                    className="flex items-center justify-center gap-2 py-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 text-sm font-semibold hover:bg-indigo-100 dark:hover:bg-indigo-950/40 transition-colors"
                  >
                    <Calendar className="w-4 h-4" />
                    Attendance
                  </Link>
                  <Link
                    to="/faculty/cie-marks"
                    className="flex items-center justify-center gap-2 py-3 rounded-xl bg-violet-50 dark:bg-violet-950/20 text-violet-600 dark:text-violet-400 text-sm font-semibold hover:bg-violet-100 dark:hover:bg-violet-950/40 transition-colors"
                  >
                    <ClipboardList className="w-4 h-4" />
                    CIE Marks
                  </Link>
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 flex items-center justify-between text-sm">
                <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                  <Users className="w-4 h-4" />
                  {course.totalStudents ?? 0} students
                </span>
                <Link to="/faculty/students" className="flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400 font-medium hover:underline">
                  View students <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </motion.div>
          ))}

          {courses.length === 0 && (
            <div className="col-span-2 text-center py-16 text-slate-500 dark:text-slate-400">
              <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-40" />
              <p className="font-medium">No courses assigned</p>
              <p className="text-sm">Contact your administrator to assign course offerings.</p>
            </div>
          )}
        </div>
      </div>
    </FacultyLayout>
  );
}

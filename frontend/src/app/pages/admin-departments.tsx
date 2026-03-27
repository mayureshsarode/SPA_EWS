import { useState } from "react";
import { motion } from "motion/react";
import {
  Building,
  Users,
  UserPlus,
  BookOpen,
  Edit,
  ChevronDown,
  ChevronUp,
  Plus,
} from "lucide-react";
import { departments, faculties, students } from "../data/mock-data";
import { AdminLayout } from "../components/admin-layout";
import { AnimatedCounter } from "../components/animated-counter";

export function AdminDepartments() {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <AdminLayout activeItem="Departments">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Department Management</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Manage departments, divisions, and assignments</p>
          </div>
          <button className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white hover:shadow-lg shadow-indigo-500/20 font-semibold text-sm transition-all">
            <Plus className="w-4 h-4" />
            Add Department
          </button>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: "Departments", value: departments.length, gradient: "from-indigo-600 to-violet-600", icon: Building },
            { label: "Faculty Members", value: faculties.length, gradient: "from-emerald-500 to-teal-500", icon: Users },
            { label: "Total Students", value: students.length, gradient: "from-amber-500 to-orange-500", icon: Users },
          ].map((card, i) => {
            const CardIcon = card.icon;
            return (
              <motion.div
                key={i}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 flex items-center gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.gradient} flex items-center justify-center shadow-lg`}>
                  <CardIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
                    <AnimatedCounter target={card.value} />
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">{card.label}</div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Department Cards */}
        <div className="space-y-4">
          {departments.map((dept, i) => {
            const isExpanded = expanded === dept.id;
            const deptFaculty = faculties.filter((f) => f.department === dept.name);
            const deptStudents = students.filter((s) => s.department === dept.name);

            return (
              <motion.div
                key={dept.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 + i * 0.05 }}
              >
                {/* Header */}
                <button
                  onClick={() => setExpanded(isExpanded ? null : dept.id)}
                  className="w-full p-6 text-left flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center text-white text-lg font-bold shadow-lg shadow-indigo-500/20">
                      {dept.code}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white">{dept.name}</h3>
                      <div className="text-sm text-slate-500 dark:text-slate-400">
                        HOD: {dept.hod} • {dept.divisions.length} Division{dept.divisions.length > 1 ? "s" : ""}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="hidden sm:flex items-center gap-3">
                      <span className="px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 text-xs font-bold">
                        {deptFaculty.length} Faculty
                      </span>
                      <span className="px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                        {deptStudents.length} Students
                      </span>
                    </div>
                    {isExpanded ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                  </div>
                </button>

                {/* Expanded */}
                {isExpanded && (
                  <motion.div
                    className="border-t border-slate-200 dark:border-slate-800"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    {/* Divisions */}
                    <div className="p-6">
                      <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Divisions</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                        {dept.divisions.map((div) => {
                          const divStudents = deptStudents.filter((s) => s.division === div);
                          return (
                            <div key={div} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950/30 flex items-center justify-center font-bold text-indigo-600 dark:text-indigo-400">
                                  {div}
                                </div>
                                <div>
                                  <div className="font-medium text-slate-900 dark:text-white">Division {div}</div>
                                  <div className="text-xs text-slate-500 dark:text-slate-400">{divStudents.length} students</div>
                                </div>
                              </div>
                              <button className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 transition-colors">
                                <Edit className="w-4 h-4" />
                              </button>
                            </div>
                          );
                        })}
                      </div>

                      {/* Faculty */}
                      <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Faculty Members</h4>
                      <div className="space-y-2">
                        {deptFaculty.map((faculty) => (
                          <div key={faculty.id} className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white text-sm font-bold">
                                {faculty.name.charAt(0)}
                              </div>
                              <div>
                                <div className="font-medium text-slate-900 dark:text-white">{faculty.name}</div>
                                <div className="text-xs text-slate-500 dark:text-slate-400">
                                  {faculty.designation} • {faculty.courses.length} course{faculty.courses.length > 1 ? "s" : ""}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {faculty.courses.map((c) => (
                                <span key={c.courseCode} className="px-2 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 text-xs font-bold">
                                  {c.courseCode}
                                </span>
                              ))}
                            </div>
                          </div>
                        ))}
                        {deptFaculty.length === 0 && (
                          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-center text-sm text-slate-500 dark:text-slate-400">
                            No faculty assigned
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </AdminLayout>
  );
}

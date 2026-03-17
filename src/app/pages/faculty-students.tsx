import { useState } from "react";
import { motion } from "motion/react";
import { Search, Filter, Mail, User, ShieldAlert, CheckCircle, AlertCircle } from "lucide-react";
import { FacultyLayout } from "../components/faculty-layout";
import { students } from "../data/mock-data";

import { useAuth } from "../contexts/auth-context";

export function FacultyStudents() {
  const { user } = useAuth();
  const faculty = user as any;
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"course" | "mentees">("course");

  const filteredStudents = students.filter((student: any) => {
    if (viewMode === "mentees" && student.mentorId !== faculty?.id) return false;
    // Note: If course mode, we should logically filter by course enrollments. For mock purposes, all others show up.
    if (statusFilter !== "all" && student.status !== statusFilter) return false;
    if (searchQuery && !student.name.toLowerCase().includes(searchQuery.toLowerCase()) && !student.id.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <FacultyLayout activeItem="Students">
      <div className="space-y-6 max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Student Directory</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">View and manage students enrolled in your courses or assigned to your mentorship batch.</p>
          </div>
        </div>

        {/* View Toggle */}
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl w-fit">
          <button
            onClick={() => setViewMode("course")}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
              viewMode === "course"
                ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
            }`}
          >
            Course Students
          </button>
          <button
            onClick={() => setViewMode("mentees")}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
              viewMode === "mentees"
                ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
            }`}
          >
            My Mentees
          </button>
        </div>

        {/* Filters */}
        <motion.div
          className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by student name or ID..."
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 border border-slate-200 dark:border-slate-700"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">All Statuses</option>
                <option value="safe">Safe (&gt;75%)</option>
                <option value="warning">Warning (60-75%)</option>
                <option value="critical">Critical (&lt;60%)</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Students Table */}
        <motion.div
          className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-sm">
                  <th className="px-6 py-4 font-medium">Student Details</th>
                  <th className="px-6 py-4 font-medium">Division</th>
                  <th className="px-6 py-4 font-medium">Aggregate Attendance</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {filteredStudents.map((student: any) => (
                  <tr key={student.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 font-bold">
                          {student.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white">{student.name}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{student.id} • {student.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">
                       Semester {student.semester} - Division {student.division}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="text-sm font-medium text-slate-900 dark:text-white">{student.attendance}%</div>
                        <div className="w-24 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              student.status === "safe" ? "bg-emerald-500" :
                              student.status === "warning" ? "bg-amber-500" : "bg-rose-500"
                            }`}
                            style={{ width: `${student.attendance}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium ${
                        student.status === "safe" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" :
                        student.status === "warning" ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" :
                        "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400"
                      }`}>
                        {student.status === "safe" && <CheckCircle className="w-3 h-3" />}
                        {student.status === "warning" && <AlertCircle className="w-3 h-3" />}
                        {student.status === "critical" && <ShieldAlert className="w-3 h-3" />}
                        <span className="capitalize">{student.status}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <button className="p-2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors" title="Message Student">
                        <Mail className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors" title="View Profile">
                        <User className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {filteredStudents.length === 0 && (
              <div className="p-12 text-center text-slate-500 dark:text-slate-400">
                <User className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="font-medium">No students found</p>
                <p className="text-sm">Try adjusting your filters</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </FacultyLayout>
  );
}

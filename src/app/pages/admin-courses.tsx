import { useState } from "react";
import { motion } from "motion/react";
import { Search, Filter, BookOpen, Plus, MoreVertical, Users, GraduationCap } from "lucide-react";
import { AdminLayout } from "../components/admin-layout";

const mockCourses = [
  { id: "C001", code: "CS101", name: "Introduction to Computer Science", department: "Computer Science", faculty: "Prof. Jane Doe", students: 120, credits: 4 },
  { id: "C002", code: "MA201", name: "Advanced Mathematics", department: "Mathematics", faculty: "Dr. John Smith", students: 85, credits: 4 },
  { id: "C003", code: "PH105", name: "Engineering Physics", department: "Physics", faculty: "Dr. Emily Chen", students: 110, credits: 3 },
  { id: "C004", code: "CS302", name: "Data Structures", department: "Computer Science", faculty: "Prof. Jane Doe", students: 95, credits: 4 },
  { id: "C005", code: "EC201", name: "Digital Logic Design", department: "Electronics", faculty: "Prof. Alan Turing", students: 78, credits: 3 },
];

export function AdminCourses() {
  const [searchQuery, setSearchQuery] = useState("");
  const [deptFilter, setDeptFilter] = useState("all");

  const filteredCourses = mockCourses.filter((course) => {
    if (deptFilter !== "all" && course.department.toLowerCase() !== deptFilter) return false;
    if (searchQuery && !course.name.toLowerCase().includes(searchQuery.toLowerCase()) && !course.code.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <AdminLayout activeItem="Courses">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Course Management</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Manage institution courses and faculty assignments</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors shadow-lg shadow-indigo-500/20 w-full sm:w-auto justify-center">
            <Plus className="w-5 h-5" />
            Add Course
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
                placeholder="Search by course code or name..."
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 border border-slate-200 dark:border-slate-700"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
                className="px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">All Departments</option>
                <option value="computer science">Computer Science</option>
                <option value="mathematics">Mathematics</option>
                <option value="physics">Physics</option>
                <option value="electronics">Electronics</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredCourses.map((course, i) => (
            <motion.div
              key={course.id}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-lg dark:hover:shadow-2xl transition-all duration-300 p-6 flex flex-col"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-1 rounded-md mb-1 inline-block">
                      {course.code}
                    </span>
                    <h3 className="font-bold text-slate-900 dark:text-white leading-tight">{course.name}</h3>
                  </div>
                </div>
                <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>
              
              <div className="mt-4 space-y-3 flex-1">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 dark:text-slate-400">Department</span>
                  <span className="font-medium text-slate-700 dark:text-slate-300">{course.department}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 dark:text-slate-400">Faculty</span>
                  <span className="font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1">
                    <GraduationCap className="w-4 h-4 text-indigo-500" />
                    {course.faculty}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 dark:text-slate-400">Credits</span>
                  <span className="font-medium text-slate-700 dark:text-slate-300">{course.credits}</span>
                </div>
              </div>
              
              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                  <Users className="w-4 h-4 text-emerald-500" />
                  <span className="font-medium">{course.students}</span> Enrolled
                </div>
                <button className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors">
                  Manage Course
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredCourses.length === 0 && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center text-slate-500 dark:text-slate-400">
            <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="font-medium">No courses found</p>
            <p className="text-sm">Try adjusting your search criteria</p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

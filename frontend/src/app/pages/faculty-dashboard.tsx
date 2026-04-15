import { useState, useEffect } from "react";
import { Link } from "react-router";
import { motion } from "motion/react";
import {
  LayoutDashboard,
  Users,
  AlertTriangle,
  FileText,
  Filter,
  Eye,
  TrendingUp,
  Calendar,
  ClipboardList,
  BarChart3,
  BookOpen,
  Shield,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { FacultyLayout } from "../components/faculty-layout";
import { AnimatedCounter } from "../components/animated-counter";
import { useAuth } from "../contexts/auth-context";
import { api } from "../lib/api";

export function FacultyDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [classFilter, setClassFilter] = useState<string>("all");

  useEffect(() => {
    api('/faculty/me/dashboard')
      .then(res => setData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const faculty = data || {};
  const studentsList = faculty.students || [];
  const stats = faculty.stats || { totalStudents: 0, safe: 0, warning: 0, critical: 0, totalMentees: 0 };
  const coursesList = faculty.courses || [];

  const chartData = studentsList.map((s: any) => ({
    name: s.name.split(" ")[0],
    attendance: s.attendance,
    marks: s.internalMarks,
    status: s.status,
  }));

  const filteredStudents = studentsList.filter((student: any) => {
    if (statusFilter !== "all" && student.status !== statusFilter) return false;
    // For class filter, we might need a mapping if we have the student's courses. For now just filtering by status.
    return true;
  });

  const getStatusColor = (status: string) => {
    if (status === "safe") return "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400";
    if (status === "warning") return "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400";
    if (status === "critical") return "bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400";
    return "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-400";
  };

  const getBarColor = (status: string) => {
    if (status === "safe") return "#10b981";
    if (status === "warning") return "#f59e0b";
    return "#ef4444";
  };

  if (loading) {
    return (
      <FacultyLayout activeItem="Dashboard">
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </FacultyLayout>
    );
  }

  return (
    <FacultyLayout activeItem="Dashboard">
      <div className="max-w-7xl mx-auto space-y-6 px-4 sm:px-6">
          {/* Faculty Roles Overview */}
          <motion.div
            className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row gap-6 items-start md:items-center justify-between"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center text-xl font-bold text-white shadow-lg shadow-indigo-500/25">
                {faculty?.name?.split(" ").map((n: string) => n[0]).join("") || "JD"}
              </div>
              <div>
                <h1 className="text-xl font-extrabold text-slate-900 dark:text-white">{faculty?.name || "Prof. Jane Doe"}</h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">{faculty?.department || "Computer Science"} • {faculty?.designation || "Associate Professor"}</p>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <span className="px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-sm font-medium border border-blue-200 dark:border-blue-800/50 flex items-center gap-1.5">
                <BookOpen className="w-4 h-4" /> Course Faculty ({coursesList.length} courses)
              </span>
              <span className="px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 text-sm font-medium border border-indigo-200 dark:border-indigo-800/50 flex items-center gap-1.5">
                <Users className="w-4 h-4" /> Mentor ({stats.totalMentees} Mentees)
              </span>
              {faculty.isClassCoordinator && (
                <span className="px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-sm font-medium border border-emerald-200 dark:border-emerald-800/50 flex items-center gap-1.5">
                  <Shield className="w-4 h-4" /> Class Coordinator
                </span>
              )}
            </div>
          </motion.div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { label: "Total Students", value: stats.totalStudents, gradient: "from-indigo-600 to-violet-600", shadow: "shadow-indigo-500/20", icon: Users },
              { label: "Safe Students", value: stats.safe, gradient: "from-emerald-500 to-teal-500", shadow: "shadow-emerald-500/20", icon: Users },
              { label: "Warning Students", value: stats.warning, gradient: "from-amber-500 to-orange-500", shadow: "shadow-amber-500/20", icon: AlertTriangle },
              { label: "Critical Students", value: stats.critical, gradient: "from-rose-500 to-red-500", shadow: "shadow-rose-500/20", icon: AlertTriangle },
            ].map((card, i) => {
              const CardIcon = card.icon;
              return (
                <motion.div
                  key={i}
                  className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-lg dark:hover:shadow-2xl transition-all duration-300"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.gradient} flex items-center justify-center shadow-lg ${card.shadow}`}>
                      <CardIcon className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
                      <AnimatedCounter target={card.value} />
                    </div>
                  </div>
                  <div className="text-sm font-medium text-slate-600 dark:text-slate-400">{card.label}</div>
                </motion.div>
              );
            })}
          </div>

          {/* Performance Chart */}
          <motion.div
            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Student Attendance Overview</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">Attendance by student</p>
              </div>
              <TrendingUp className="w-5 h-5 text-slate-400" />
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f033" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                  <YAxis stroke="#94a3b8" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(15,23,42,0.9)",
                      border: "none",
                      borderRadius: "12px",
                      padding: "12px",
                      color: "#fff",
                    }}
                  />
                  <Bar dataKey="attendance" name="Attendance %" radius={[6, 6, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={index} fill={getBarColor(entry.status)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Student Performance Table */}
          <motion.div
            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.5 }}
          >
            <div className="p-6 border-b border-slate-200 dark:border-slate-800">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Student Performance</h2>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-slate-400" />
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="all">All Status</option>
                      <option value="safe">Safe</option>
                      <option value="warning">Warning</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>
                  <select
                    value={classFilter}
                    onChange={(e) => setClassFilter(e.target.value)}
                    className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="all">All Classes</option>
                    <option value="cs101">CS101</option>
                    <option value="cs102">CS102</option>
                    <option value="cs201">CS201</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Student ID</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Attendance %</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">CIE Marks</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {filteredStudents.map((student, i) => (
                    <motion.tr
                      key={student.id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: i * 0.05 }}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-slate-600 dark:text-slate-400">{student.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white text-sm font-bold shadow-sm">
                            {student.name.charAt(0)}
                          </div>
                          <span className="text-sm font-medium text-slate-900 dark:text-white">{student.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="flex-1 bg-slate-200 dark:bg-slate-700 rounded-full h-2 max-w-[80px]">
                            <div
                              className={`h-2 rounded-full ${
                                student.attendance >= 75 ? "bg-emerald-500" : student.attendance >= 60 ? "bg-amber-500" : "bg-rose-500"
                              }`}
                              style={{ width: `${student.attendance}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium text-slate-900 dark:text-white">{student.attendance}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-white">{student.internalMarks}/100</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${getStatusColor(student.status)}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            student.status === "safe" ? "bg-emerald-500" : student.status === "warning" ? "bg-amber-500" : "bg-rose-500"
                          }`} />
                          {student.status.charAt(0).toUpperCase() + student.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link to={`/faculty/student/${student.id}`} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 transition-all duration-200">
                          <Eye className="w-4 h-4" />
                          View
                        </Link>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden divide-y divide-slate-200 dark:divide-slate-800">
              {filteredStudents.map((student, i) => (
                <motion.div
                  key={student.id}
                  className="p-4"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white font-bold shadow-sm">
                        {student.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900 dark:text-white">{student.name}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">{student.id}</div>
                      </div>
                    </div>
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${getStatusColor(student.status)}`}>
                      {student.status.charAt(0).toUpperCase() + student.status.slice(1)}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Attendance</div>
                      <div className="text-sm font-bold text-slate-900 dark:text-white">{student.attendance}%</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">CIE Marks</div>
                      <div className="text-sm font-bold text-slate-900 dark:text-white">{student.internalMarks}/100</div>
                    </div>
                  </div>
                  <Link to={`/faculty/student/${student.id}`} className="w-full py-2.5 px-3 rounded-xl text-sm font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/30 hover:bg-indigo-100 dark:hover:bg-indigo-950/50 transition-colors flex items-center justify-center gap-2">
                    <Eye className="w-4 h-4" />
                    View Details
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
      </div>
    </FacultyLayout>
  );
}

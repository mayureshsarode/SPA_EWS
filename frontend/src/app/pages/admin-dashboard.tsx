import { useState } from "react";
import { Link } from "react-router";
import { motion } from "motion/react";
import {
  LayoutDashboard,
  Users,
  AlertTriangle,
  FileText,
  Settings,
  Save,
  Download,
  UserPlus,
  Sliders,
  Shield,
  Activity,
  BookOpen,
  Building,
  BarChart3,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { AnimatedCounter } from "../components/animated-counter";
import { AdminLayout } from "../components/admin-layout";

const pieData = [
  { name: "Safe", value: 316, color: "#10b981" },
  { name: "Warning", value: 89, color: "#f59e0b" },
  { name: "Critical", value: 45, color: "#ef4444" },
];

const recentActivity = [
  { action: "Attendance marked", user: "Prof. Jane Doe", time: "2 min ago", type: "attendance" },
  { action: "CIE marks uploaded", user: "Dr. John Smith", time: "15 min ago", type: "marks" },
  { action: "Threshold updated", user: "Admin Smith", time: "1 hr ago", type: "setting" },
  { action: "New student added", user: "Admin Smith", time: "2 hrs ago", type: "user" },
  { action: "Alert generated", user: "System", time: "3 hrs ago", type: "alert" },
];

export function AdminDashboard() {
  const [attendanceThreshold, setAttendanceThreshold] = useState(75);
  const [marksThreshold, setMarksThreshold] = useState(60);

  const totalStudents = 450;
  const totalFaculty = 32;
  const activeAlerts = 67;
  const departments = 12;

  const handleSaveThresholds = () => alert("Thresholds saved successfully!");
  const handleExportReport = () => alert("Exporting report...");

  const getActivityIcon = (type: string) => {
    if (type === "attendance") return { icon: BarChart3, gradient: "from-blue-500 to-cyan-500" };
    if (type === "marks") return { icon: FileText, gradient: "from-violet-500 to-purple-500" };
    if (type === "setting") return { icon: Settings, gradient: "from-amber-500 to-orange-500" };
    if (type === "user") return { icon: UserPlus, gradient: "from-emerald-500 to-teal-500" };
    return { icon: AlertTriangle, gradient: "from-rose-500 to-red-500" };
  };

  return (
    <AdminLayout activeItem="Dashboard">
      <div className="max-w-7xl mx-auto space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { label: "Total Students", value: totalStudents, gradient: "from-indigo-600 to-violet-600", shadow: "shadow-indigo-500/20", icon: Users },
              { label: "Total Faculty", value: totalFaculty, gradient: "from-emerald-500 to-teal-500", shadow: "shadow-emerald-500/20", icon: Users },
              { label: "Active Alerts", value: activeAlerts, gradient: "from-rose-500 to-red-500", shadow: "shadow-rose-500/20", icon: AlertTriangle },
              { label: "Departments", value: departments, gradient: "from-amber-500 to-orange-500", shadow: "shadow-amber-500/20", icon: Building },
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

          {/* Distribution + Activity Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Risk Distribution Chart */}
            <motion.div
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.4 }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">Risk Distribution</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Student performance overview</p>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <ResponsiveContainer width={220} height={220}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={100}
                      dataKey="value"
                      strokeWidth={0}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(15,23,42,0.9)",
                        border: "none",
                        borderRadius: "12px",
                        padding: "12px",
                        color: "#fff",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex items-center justify-center gap-6 mt-4">
                {pieData.map((item, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-sm text-slate-600 dark:text-slate-400">{item.name} ({item.value})</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Recent Activity */}
            <motion.div
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.5 }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-violet-50 dark:bg-violet-950/30 flex items-center justify-center">
                  <Activity className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">Recent Activity</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Latest system actions</p>
                </div>
              </div>
              <div className="space-y-4">
                {recentActivity.map((item, i) => {
                  const activityConfig = getActivityIcon(item.type);
                  const ActivityIcon = activityConfig.icon;
                  return (
                    <motion.div
                      key={i}
                      className="flex items-start gap-3"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.5 + i * 0.1 }}
                    >
                      <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${activityConfig.gradient} flex items-center justify-center flex-shrink-0 shadow-sm`}>
                        <ActivityIcon className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-slate-900 dark:text-white">{item.action}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">{item.user} • {item.time}</div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          </div>

          {/* Manage Thresholds */}
          <motion.div
            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.6 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 flex items-center justify-center">
                <Sliders className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Manage Thresholds</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">Configure performance classification rules</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="block">
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 block">
                    Attendance Threshold (%)
                  </span>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={attendanceThreshold}
                      onChange={(e) => setAttendanceThreshold(Number(e.target.value))}
                      className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                    <div className="w-16 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-center font-bold text-slate-900 dark:text-white">
                      {attendanceThreshold}%
                    </div>
                  </div>
                </label>
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-sm text-slate-600 dark:text-slate-400">
                  Students with attendance below {attendanceThreshold}% will be flagged
                </div>
              </div>

              <div className="space-y-3">
                <label className="block">
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 block">
                    Marks Threshold (out of 100)
                  </span>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={marksThreshold}
                      onChange={(e) => setMarksThreshold(Number(e.target.value))}
                      className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                    <div className="w-16 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-center font-bold text-slate-900 dark:text-white">
                      {marksThreshold}
                    </div>
                  </div>
                </label>
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-sm text-slate-600 dark:text-slate-400">
                  Students with marks below {marksThreshold}/100 will be flagged
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={handleSaveThresholds}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white hover:shadow-xl shadow-indigo-500/20 hover:-translate-y-0.5 transition-all duration-300 font-semibold"
              >
                <Save className="w-5 h-5" />
                Save Thresholds
              </button>
            </div>
          </motion.div>

          {/* Manage Users */}
          <motion.div
            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.7 }}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center">
                  <Users className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">Manage Users</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Add and manage system users</p>
                </div>
              </div>
              <button className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:shadow-lg shadow-emerald-500/20 hover:-translate-y-0.5 transition-all duration-300 font-semibold text-sm">
                <UserPlus className="w-4 h-4" />
                Add User
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Name</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Role</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Department</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {[
                    { name: "Prof. Jane Doe", role: "Faculty", dept: "Computer Science", roleColor: "from-blue-500 to-cyan-500" },
                    { name: "Dr. John Smith", role: "Faculty", dept: "Mathematics", roleColor: "from-blue-500 to-cyan-500" },
                    { name: "Admin Smith", role: "Admin", dept: "Administration", roleColor: "from-indigo-500 to-violet-500" },
                  ].map((user, i) => (
                    <motion.tr
                      key={i}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.7 + i * 0.1 }}
                    >
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${user.roleColor} flex items-center justify-center text-white text-sm font-bold shadow-sm`}>
                            {user.name.charAt(0)}
                          </div>
                          <span className="text-sm font-medium text-slate-900 dark:text-white">{user.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r ${user.roleColor} text-white`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm text-slate-600 dark:text-slate-400">{user.dept}</td>
                      <td className="px-4 py-4">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          Active
                        </span>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* Export Reports */}
          <motion.div
            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.8 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/30 flex items-center justify-center">
                <FileText className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Export Reports</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">Download system reports and analytics</p>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { title: "Student Report", desc: "All student data", gradient: "from-indigo-500 to-violet-500" },
                { title: "Alert Report", desc: "Active alerts", gradient: "from-rose-500 to-red-500" },
                { title: "Performance Report", desc: "Analytics data", gradient: "from-emerald-500 to-teal-500" },
                { title: "Custom Report", desc: "Configure export", gradient: "from-amber-500 to-orange-500" },
              ].map((report, i) => (
                <motion.button
                  key={i}
                  onClick={handleExportReport}
                  className="group p-5 rounded-xl border-2 border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-600 hover:shadow-lg dark:hover:shadow-indigo-500/5 transition-all duration-300 text-left"
                  whileHover={{ y: -4 }}
                >
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${report.gradient} flex items-center justify-center shadow-sm mb-3`}>
                    <Download className="w-5 h-5 text-white" />
                  </div>
                  <div className="font-semibold text-slate-900 dark:text-white mb-1">{report.title}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">{report.desc}</div>
                </motion.button>
              ))}
            </div>
          </motion.div>
      </div>
    </AdminLayout>
  );
}

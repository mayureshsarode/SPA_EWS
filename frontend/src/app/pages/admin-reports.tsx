import { useState } from "react";
import { motion } from "motion/react";
import { FileText, Download, Filter, Calendar, BarChart3, PieChart, Users, BookOpen, AlertTriangle } from "lucide-react";
import { AdminLayout } from "../components/admin-layout";

const mockReports = [
  { id: 1, name: "Institutional Attendance Summary", type: "Attendance", date: "2024-03-15", size: "2.4 MB", icon: Calendar },
  { id: 2, name: "CIE Performance Analytics", type: "Marks", date: "2024-03-14", size: "3.1 MB", icon: BarChart3 },
  { type: "Department", name: "Computer Science Dept Overview", id: 3, date: "2024-03-10", size: "1.8 MB", icon: PieChart },
  { id: 4, name: "List of Defaulter Students", type: "Alerts", date: "2024-03-08", size: "850 KB", icon: Users },
  { id: 5, name: "Faculty Workload Distribution", type: "Faculty", date: "2024-03-01", size: "1.2 MB", icon: BookOpen },
];

export function AdminReports() {
  const [reportType, setReportType] = useState("all");

  const filteredReports = mockReports.filter(r => reportType === "all" || r.type.toLowerCase() === reportType);

  return (
    <AdminLayout activeItem="Reports">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Reports & Analytics</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Generate and download institutional performance reports</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors shadow-lg shadow-indigo-500/20 w-full sm:w-auto justify-center">
            <FileText className="w-5 h-5" />
            Generate New Report
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <motion.div
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Recent Reports</h2>
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-slate-400" />
                  <select
                    value={reportType}
                    onChange={(e) => setReportType(e.target.value)}
                    className="text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700 dark:text-slate-300"
                  >
                    <option value="all">All Types</option>
                    <option value="attendance">Attendance</option>
                    <option value="marks">Marks</option>
                    <option value="department">Department</option>
                    <option value="alerts">Alerts</option>
                  </select>
                </div>
              </div>

              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredReports.map((report, i) => {
                  const Icon = report.icon;
                  return (
                    <motion.div 
                      key={report.id}
                      className="py-4 flex items-center justify-between group"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2, delay: i * 0.1 }}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white">{report.name}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
                            <span>{report.date}</span>
                            <span>•</span>
                            <span className="text-indigo-600 dark:text-indigo-400">{report.type}</span>
                            <span>•</span>
                            <span>{report.size}</span>
                          </p>
                        </div>
                      </div>
                      <button className="p-2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100">
                        <Download className="w-5 h-5" />
                      </button>
                    </motion.div>
                  );
                })}

                {filteredReports.length === 0 && (
                  <div className="py-8 text-center text-slate-500 dark:text-slate-400">
                    <p className="font-medium">No reports matches the selected filter.</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          <div className="space-y-6">
            <motion.div
              className="bg-gradient-to-br from-indigo-600 to-violet-600 rounded-2xl p-6 text-white shadow-xl shadow-indigo-500/20"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <FileText className="w-8 h-8 mb-4 opacity-80" />
              <h3 className="text-xl font-bold mb-2">Automated Reports</h3>
              <p className="text-indigo-100 text-sm mb-6 leading-relaxed">
                Set up scheduled reports to be automatically emailed to department heads and administration at the end of every week or month.
              </p>
              <button className="w-full bg-white text-indigo-600 px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-slate-50 transition-colors">
                Configure Schedule
              </button>
            </motion.div>

            <motion.div
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
            >
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">Quick Exports</h3>
              <div className="space-y-3">
                <button className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left text-sm font-medium text-slate-700 dark:text-slate-300">
                  <span className="flex items-center gap-2"><Users className="w-4 h-4 text-emerald-500" /> Export All Users (CSV)</span>
                  <Download className="w-4 h-4 text-slate-400" />
                </button>
                <button className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left text-sm font-medium text-slate-700 dark:text-slate-300">
                  <span className="flex items-center gap-2"><BookOpen className="w-4 h-4 text-blue-500" /> Export All Courses (CSV)</span>
                  <Download className="w-4 h-4 text-slate-400" />
                </button>
                <button className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left text-sm font-medium text-slate-700 dark:text-slate-300">
                  <span className="flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-rose-500" /> Export Active Alerts (PDF)</span>
                  <Download className="w-4 h-4 text-slate-400" />
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

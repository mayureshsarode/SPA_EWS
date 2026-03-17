import { useState } from "react";
import { motion } from "motion/react";
import {
  Activity,
  Filter,
  Search,
  AlertTriangle,
  Settings,
  UserPlus,
  FileText,
  BarChart3,
  Calendar,
  Clock,
  User,
} from "lucide-react";
import { AdminLayout } from "../components/admin-layout";

const auditLogs = [
  { id: 1, action: "Attendance Marked", user: "Prof. Jane Doe", role: "Faculty", details: "CS301, Division A — 6 students present, 0 absent", timestamp: "2024-03-15 10:30:00", type: "attendance" as const },
  { id: 2, action: "CIE Marks Uploaded", user: "Dr. John Smith", role: "Faculty", details: "CS302 CIE 2, Division B — 6 students updated", timestamp: "2024-03-15 09:45:00", type: "marks" as const },
  { id: 3, action: "Threshold Updated", user: "Admin Smith", role: "Admin", details: "Attendance threshold changed from 70% to 75%", timestamp: "2024-03-15 09:15:00", type: "setting" as const },
  { id: 4, action: "User Created", user: "Admin Smith", role: "Admin", details: "New student Matthew Harris (S012) added to Division A", timestamp: "2024-03-14 16:00:00", type: "user" as const },
  { id: 5, action: "Alert Generated", user: "System", role: "System", details: "David Brown (S004) attendance dropped below 65%", timestamp: "2024-03-14 14:30:00", type: "alert" as const },
  { id: 6, action: "Report Exported", user: "Admin Smith", role: "Admin", details: "Exported full student performance report (CSV)", timestamp: "2024-03-14 12:00:00", type: "report" as const },
  { id: 7, action: "CIE Marks Uploaded", user: "Prof. Jane Doe", role: "Faculty", details: "CS301 CIE 3, Division A — 6 students updated", timestamp: "2024-03-14 11:30:00", type: "marks" as const },
  { id: 8, action: "Attendance Marked", user: "Prof. Sarah Wilson", role: "Faculty", details: "MA301, Division A — 5 present, 1 absent", timestamp: "2024-03-14 10:00:00", type: "attendance" as const },
  { id: 9, action: "Alert Generated", user: "System", role: "System", details: "Emma Taylor (S007) CIE average dropped below 50%", timestamp: "2024-03-13 15:00:00", type: "alert" as const },
  { id: 10, action: "Threshold Updated", user: "Admin Smith", role: "Admin", details: "CIE marks threshold changed from 50 to 60", timestamp: "2024-03-13 11:00:00", type: "setting" as const },
];

type LogType = "attendance" | "marks" | "setting" | "user" | "alert" | "report";

const typeConfig: Record<LogType, { icon: any; gradient: string; label: string }> = {
  attendance: { icon: Calendar, gradient: "from-blue-500 to-cyan-500", label: "Attendance" },
  marks: { icon: FileText, gradient: "from-violet-500 to-purple-500", label: "Marks" },
  setting: { icon: Settings, gradient: "from-amber-500 to-orange-500", label: "Settings" },
  user: { icon: UserPlus, gradient: "from-emerald-500 to-teal-500", label: "User" },
  alert: { icon: AlertTriangle, gradient: "from-rose-500 to-red-500", label: "Alert" },
  report: { icon: BarChart3, gradient: "from-indigo-500 to-violet-500", label: "Report" },
};

export function AdminAuditLog() {
  const [filterType, setFilterType] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredLogs = auditLogs.filter((log) => {
    if (filterType !== "all" && log.type !== filterType) return false;
    if (searchQuery && !log.action.toLowerCase().includes(searchQuery.toLowerCase()) && !log.user.toLowerCase().includes(searchQuery.toLowerCase()) && !log.details.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <AdminLayout activeItem="Audit Log">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Audit Log</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Track all system actions and changes</p>
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
                placeholder="Search audit logs..."
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 border border-slate-200 dark:border-slate-700"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">All Types</option>
                <option value="attendance">Attendance</option>
                <option value="marks">Marks</option>
                <option value="setting">Settings</option>
                <option value="user">User</option>
                <option value="alert">Alerts</option>
                <option value="report">Reports</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Log Entries */}
        <motion.div
          className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <div className="divide-y divide-slate-200 dark:divide-slate-800">
            {filteredLogs.map((log, i) => {
              const config = typeConfig[log.type];
              const Icon = config.icon;
              return (
                <motion.div
                  key={log.id}
                  className="p-5 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, delay: i * 0.03 }}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${config.gradient} flex items-center justify-center flex-shrink-0 shadow-sm`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-slate-900 dark:text-white">{log.action}</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold bg-gradient-to-r ${config.gradient} text-white`}>
                          {config.label}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">{log.details}</p>
                      <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {log.user} ({log.role})
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {log.timestamp}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {filteredLogs.length === 0 && (
            <div className="p-12 text-center text-slate-500 dark:text-slate-400">
              <Activity className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="font-medium">No audit logs found</p>
              <p className="text-sm">Try adjusting your filters</p>
            </div>
          )}
        </motion.div>
      </div>
    </AdminLayout>
  );
}

import { motion } from "motion/react";
import { AlertTriangle, Bell, Info, Filter, Trash2, CheckCircle } from "lucide-react";
import { AdminLayout } from "../components/admin-layout";

const mockAlerts = [
  { id: 1, title: "Critical Attendance Drop", message: "Multiple students in CS101 have dropped below 60% attendance this week.", type: "critical", time: "1 hour ago", department: "Computer Science" },
  { id: 2, title: "System Maintenance", message: "Scheduled database backup will occur tonight at 2:00 AM.", type: "info", time: "3 hours ago", department: "System" },
  { id: 3, title: "Low CIE Marks Detected", message: "Division B of MA201 has an unusually low passing rate (45%) in CIE 2.", type: "warning", time: "5 hours ago", department: "Mathematics" },
  { id: 4, title: "New Faculty Required", message: "Pending unassigned courses in Electronics department for upcoming semester.", type: "warning", time: "1 day ago", department: "Electronics" },
  { id: 5, title: "Report Generation Failed", message: "Monthly institutional report failed to generate. Manual trigger required.", type: "critical", time: "1 day ago", department: "System" },
];

export function AdminAlerts() {
  return (
    <AdminLayout activeItem="Alerts">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">System Alerts</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Monitor critical issues and system notifications</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Mark All Read
            </button>
            <button className="p-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
              <Filter className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {mockAlerts.map((alert, i) => (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.1 }}
              className={`p-5 rounded-2xl border ${
                alert.type === "critical"
                  ? "bg-rose-50 dark:bg-rose-900/10 border-rose-200 dark:border-rose-900/50"
                  : alert.type === "warning"
                  ? "bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-900/50"
                  : "bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-900/50"
              } flex items-start gap-4`}
            >
              <div className={`mt-1 flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                alert.type === "critical" ? "bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400" :
                alert.type === "warning" ? "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400" :
                "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
              }`}>
                {alert.type === "critical" ? <AlertTriangle className="w-5 h-5" /> :
                 alert.type === "warning" ? <Bell className="w-5 h-5" /> :
                 <Info className="w-5 h-5" />}
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                  <h3 className={`font-bold ${
                    alert.type === "critical" ? "text-rose-900 dark:text-rose-400" :
                    alert.type === "warning" ? "text-amber-900 dark:text-amber-400" :
                    "text-blue-900 dark:text-blue-400"
                  }`}>
                    {alert.title}
                  </h3>
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400 bg-white/50 dark:bg-slate-800/50 px-2 py-1 rounded-md">
                    {alert.time}
                  </span>
                </div>
                <p className={`text-sm mb-3 ${
                  alert.type === "critical" ? "text-rose-700 dark:text-rose-300/80" :
                  alert.type === "warning" ? "text-amber-700 dark:text-amber-300/80" :
                  "text-blue-700 dark:text-blue-300/80"
                }`}>
                  {alert.message}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium uppercase tracking-wider opacity-70">
                    {alert.department}
                  </span>
                  <div className="flex gap-2">
                    <button className="text-sm font-medium hover:underline opacity-80 transition-opacity hover:opacity-100">
                      View Details
                    </button>
                    <button className="text-slate-400 hover:text-rose-600 transition-colors ml-2">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}

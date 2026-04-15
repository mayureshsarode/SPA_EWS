import { useState, useEffect } from "react";
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
  Loader2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { AdminLayout } from "../components/admin-layout";
import { api } from "../lib/api";

type LogType = "attendance" | "marks" | "setting" | "user" | "alert" | "report";

const typeConfig: Record<string, { icon: any; gradient: string; label: string }> = {
  ATTENDANCE_MARKED: { icon: Calendar, gradient: "from-blue-500 to-cyan-500", label: "Attendance" },
  MARKS_UPLOADED: { icon: FileText, gradient: "from-violet-500 to-purple-500", label: "Marks" },
  THRESHOLDS_UPDATED: { icon: Settings, gradient: "from-amber-500 to-orange-500", label: "Settings" },
  CONFIG_UPDATED: { icon: Settings, gradient: "from-amber-500 to-orange-500", label: "Settings" },
  USER_CREATED: { icon: UserPlus, gradient: "from-emerald-500 to-teal-500", label: "User" },
  USER_UPDATED: { icon: UserPlus, gradient: "from-emerald-500 to-teal-500", label: "User" },
  USER_DELETED: { icon: UserPlus, gradient: "from-rose-500 to-red-500", label: "User" },
  ALERT_GENERATED: { icon: AlertTriangle, gradient: "from-rose-500 to-red-500", label: "Alert" },
  REPORT_EXPORTED: { icon: BarChart3, gradient: "from-indigo-500 to-violet-500", label: "Report" },
  COURSE_CREATED: { icon: FileText, gradient: "from-blue-500 to-indigo-500", label: "Course" },
  COURSE_UPDATED: { icon: FileText, gradient: "from-blue-500 to-indigo-500", label: "Course" },
  COURSE_DELETED: { icon: FileText, gradient: "from-rose-500 to-red-500", label: "Course" },
  DEPARTMENT_CREATED: { icon: BarChart3, gradient: "from-emerald-500 to-teal-500", label: "Dept" },
  MENTOR_ASSIGNED: { icon: UserPlus, gradient: "from-violet-500 to-purple-500", label: "Assignment" },
  CC_ASSIGNED: { icon: UserPlus, gradient: "from-violet-500 to-purple-500", label: "Assignment" },
};

const DEFAULT_CONFIG = { icon: Activity, gradient: "from-slate-500 to-slate-600", label: "System" };
const PAGE_SIZE = 20;

export function AdminAuditLog() {
  const [logs, setLogs] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(0);

  const fetchLogs = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (searchQuery) params.set("search", searchQuery);
    if (filterType !== "all") params.set("action", filterType);
    params.set("limit", String(PAGE_SIZE));
    params.set("offset", String(page * PAGE_SIZE));

    api(`/admin/audit-log?${params.toString()}`)
      .then((res) => {
        setLogs(res.data.logs || []);
        setTotal(res.data.total || 0);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchLogs();
  }, [filterType, page]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0);
    fetchLogs();
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <AdminLayout activeItem="Audit Log">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Audit Log</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {total} total system actions recorded
          </p>
        </div>

        <motion.div
          className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by action, user, or details..."
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 border border-slate-200 dark:border-slate-700"
              />
            </div>
            <select
              value={filterType}
              onChange={(e) => { setFilterType(e.target.value); setPage(0); }}
              className="px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Actions</option>
              <option value="USER_CREATED">User Created</option>
              <option value="USER_UPDATED">User Updated</option>
              <option value="USER_DELETED">User Deleted</option>
              <option value="COURSE_CREATED">Course Created</option>
              <option value="ATTENDANCE_MARKED">Attendance Marked</option>
              <option value="MARKS_UPLOADED">Marks Uploaded</option>
              <option value="THRESHOLDS_UPDATED">Thresholds Updated</option>
              <option value="MENTOR_ASSIGNED">Mentor Assigned</option>
            </select>
            <button type="submit" className="px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition-colors">
              Search
            </button>
          </form>
        </motion.div>

        <motion.div
          className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            </div>
          ) : (
            <>
              <div className="divide-y divide-slate-200 dark:divide-slate-800">
                {logs.map((log, i) => {
                  const config = typeConfig[log.action] || DEFAULT_CONFIG;
                  const Icon = config.icon;
                  return (
                    <motion.div
                      key={log.id}
                      className="p-5 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2, delay: i * 0.02 }}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${config.gradient} flex items-center justify-center flex-shrink-0 shadow-sm`}>
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-slate-900 dark:text-white">{log.action.replace(/_/g, " ")}</span>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-bold bg-gradient-to-r ${config.gradient} text-white`}>
                              {config.label}
                            </span>
                          </div>
                          <p className="text-sm text-slate-600 dark:text-slate-400 mb-2 truncate">
                            {typeof log.details === "object" ? JSON.stringify(log.details).slice(0, 120) : log.details}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                            <span className="flex items-center gap-1">
                              <User className="w-3 h-3" />
                              {log.user?.name || "System"} ({log.user?.role || "SYSTEM"})
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {new Date(log.createdAt).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}

                {logs.length === 0 && (
                  <div className="p-12 text-center text-slate-500 dark:text-slate-400">
                    <Activity className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p className="font-medium">No audit logs found</p>
                    <p className="text-sm">Try adjusting your filters</p>
                  </div>
                )}
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-between p-4 border-t border-slate-200 dark:border-slate-800">
                  <span className="text-sm text-slate-500 dark:text-slate-400">
                    Page {page + 1} of {totalPages} ({total} records)
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPage((p) => Math.max(0, p - 1))}
                      disabled={page === 0}
                      className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                      disabled={page >= totalPages - 1}
                      className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 transition-colors"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </motion.div>
      </div>
    </AdminLayout>
  );
}

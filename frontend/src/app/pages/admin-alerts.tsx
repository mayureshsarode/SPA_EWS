import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { AlertTriangle, Bell, Info, Filter, Trash2, CheckCircle, Loader2, TrendingDown, Users } from "lucide-react";
import { AdminLayout } from "../components/admin-layout";
import { api } from "../lib/api";
import { useNavigate } from "react-router";

interface Alert {
  id: string;
  type: "critical" | "warning" | "info";
  category: string;
  title: string;
  message: string;
  student?: { id: string; name: string };
  course: string;
  value: number;
  threshold: number;
  createdAt: string;
}

export function AdminAlerts() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "critical" | "warning">("all");
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const navigate = useNavigate();

  useEffect(() => {
    api("/admin/alerts")
      .then((res) => setAlerts(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const visibleAlerts = alerts.filter((a) => {
    if (dismissed.has(a.id)) return false;
    if (filter !== "all" && a.type !== filter) return false;
    return true;
  });

  const handleDismiss = (id: string) => setDismissed((prev) => new Set([...prev, id]));
  const handleMarkAllRead = () => setDismissed(new Set(alerts.map((a) => a.id)));

  return (
    <AdminLayout activeItem="Alerts">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">System Alerts</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {loading ? "Loading…" : `${visibleAlerts.length} active alerts across all courses`}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleMarkAllRead}
              className="px-4 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              Mark All Read
            </button>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Types</option>
              <option value="critical">Critical</option>
              <option value="warning">Warning</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
          </div>
        ) : visibleAlerts.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-16 text-center">
            <CheckCircle className="w-14 h-14 mx-auto mb-4 text-emerald-400" />
            <p className="text-lg font-bold text-slate-700 dark:text-slate-300">All clear!</p>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">No alerts matching current filter.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {visibleAlerts.map((alert, i) => (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.04 }}
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
                  {alert.type === "critical" ? <TrendingDown className="w-5 h-5" /> :
                   alert.type === "warning" ? <AlertTriangle className="w-5 h-5" /> :
                   <Info className="w-5 h-5" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                    <h3 className={`font-bold ${
                      alert.type === "critical" ? "text-rose-900 dark:text-rose-400" :
                      alert.type === "warning" ? "text-amber-900 dark:text-amber-400" :
                      "text-blue-900 dark:text-blue-400"
                    }`}>{alert.title}</h3>
                    <span className="text-xs text-slate-500 dark:text-slate-400">{alert.category.toUpperCase()}</span>
                  </div>
                  <p className={`text-sm mb-3 ${
                    alert.type === "critical" ? "text-rose-700 dark:text-rose-300/80" :
                    alert.type === "warning" ? "text-amber-700 dark:text-amber-300/80" :
                    "text-blue-700 dark:text-blue-300/80"
                  }`}>{alert.message}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium uppercase tracking-wider opacity-70">
                      Course: {alert.course}
                    </span>
                    <div className="flex gap-3">
                      {alert.student?.id && (
                        <button
                          onClick={() => navigate(`/faculty/student/${alert.student!.id}`)}
                          className="text-sm font-medium hover:underline opacity-80 transition-opacity hover:opacity-100 flex items-center gap-1"
                        >
                          <Users className="w-3.5 h-3.5" /> View Student
                        </button>
                      )}
                      <button onClick={() => handleDismiss(alert.id)} className="text-slate-400 hover:text-rose-600 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

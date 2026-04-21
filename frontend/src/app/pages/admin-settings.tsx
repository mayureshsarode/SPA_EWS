import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Save, AlertTriangle, ShieldCheck, Settings as SettingsIcon, Loader2, CheckCircle } from "lucide-react";
import { AdminLayout } from "../components/admin-layout";
import { api } from "../lib/api";

export function AdminSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");

  const [thresholds, setThresholds] = useState({
    attendance_threshold: 75,
    marks_threshold: 40,
  });

  useEffect(() => {
    api("/admin/thresholds")
      .then((res) => {
        if (res.data) {
          setThresholds({
            attendance_threshold: res.data.attendance_threshold || 75,
            marks_threshold: res.data.marks_threshold || 40,
          });
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api("/admin/thresholds", {
        method: "PUT",
        body: JSON.stringify(thresholds),
      });
      setSuccess("Tolerances updated successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      alert(err.message || "Failed to update thresholds");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout activeItem="Settings">
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout activeItem="Settings">
      <div className="space-y-6 max-w-4xl mx-auto">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">System Settings</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Configure global parameters and risk thresholds</p>
        </div>

        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400"
          >
            <CheckCircle className="w-5 h-5" />
            <span className="font-medium">{success}</span>
          </motion.div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          <motion.div
            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3">
              <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Early Warning Thresholds</h2>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/30 rounded-xl p-4 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-amber-800 dark:text-amber-300">
                  Changing these values will instantly update the risk status (Safe, Warning, Critical) for all students across the entire institution.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div>
                    <label className="flex items-center justify-between text-sm font-semibold text-slate-900 dark:text-white mb-2">
                      <span>Minimum Attendance (%)</span>
                      <span className="text-indigo-600 dark:text-indigo-400">{thresholds.attendance_threshold}%</span>
                    </label>
                    <input
                      type="range"
                      min="50"
                      max="100"
                      value={thresholds.attendance_threshold}
                      onChange={(e) => setThresholds({ ...thresholds, attendance_threshold: parseInt(e.target.value) })}
                      className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                    <div className="mt-2 text-xs text-slate-500">
                      Students below this will be marked as <span className="font-semibold text-amber-600">Warning</span>. 
                      Below {thresholds.attendance_threshold - 15}% falls to <span className="font-semibold text-rose-600">Critical</span>.
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="flex items-center justify-between text-sm font-semibold text-slate-900 dark:text-white mb-2">
                      <span>Minimum CIE Marks (%)</span>
                      <span className="text-indigo-600 dark:text-indigo-400">{thresholds.marks_threshold}%</span>
                    </label>
                    <input
                      type="range"
                      min="30"
                      max="100"
                      value={thresholds.marks_threshold}
                      onChange={(e) => setThresholds({ ...thresholds, marks_threshold: parseInt(e.target.value) })}
                      className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                    <div className="mt-2 text-xs text-slate-500">
                      Students below this will be marked as <span className="font-semibold text-amber-600">Warning</span>. 
                      Below {thresholds.marks_threshold - 20}% falls to <span className="font-semibold text-rose-600">Critical</span>.
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 bg-slate-50 dark:bg-slate-800/50 flex justify-end gap-3 border-t border-slate-200 dark:border-slate-800">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl font-medium shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 transition-all disabled:opacity-60"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Configuration
              </button>
            </div>
          </motion.div>
        </form>
      </div>
    </AdminLayout>
  );
}

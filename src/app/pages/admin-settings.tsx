import { useState } from "react";
import { motion } from "motion/react";
import { Save, Bell, Shield, Globe, User, Database, Lock } from "lucide-react";
import { AdminLayout } from "../components/admin-layout";

export function AdminSettings() {
  const [attendanceStr, setAttendanceStr] = useState("75");
  const [marksStr, setMarksStr] = useState("50");

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    alert("System configurations saved successfully.");
  };

  return (
    <AdminLayout activeItem="Settings">
      <div className="space-y-6 max-w-4xl mx-auto">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">System Settings</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Configure global thresholds and application preferences</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="md:col-span-1 space-y-1">
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 font-medium text-sm text-left transition-colors">
              <Globe className="w-5 h-5" />
              Global Defaults
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 font-medium text-sm text-left transition-colors">
              <Shield className="w-5 h-5" />
              Security
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 font-medium text-sm text-left transition-colors">
              <Bell className="w-5 h-5" />
              Notifications
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 font-medium text-sm text-left transition-colors">
              <Database className="w-5 h-5" />
              Database Backup
            </button>
          </div>

          <div className="md:col-span-3 space-y-6">
            <motion.form
              onSubmit={handleSave}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <div className="p-6 border-b border-slate-200 dark:border-slate-800">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Academic Thresholds</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">Set the default thresholds that govern student status calculations.</p>
              </div>
              <div className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Minimum Attendance Percentage (%)
                  </label>
                  <input
                    type="number"
                    value={attendanceStr}
                    onChange={(e) => setAttendanceStr(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                    Students dropping below this percentage will be marked as "Warning" or "Critical".
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Passing CIE Marks Threshold
                  </label>
                  <input
                    type="number"
                    value={marksStr}
                    onChange={(e) => setMarksStr(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                    Students scoring below this cumulative value are flagged as underperforming.
                  </p>
                </div>
              </div>
              <div className="p-6 bg-slate-50 dark:bg-slate-800/50 flex justify-end">
                <button type="submit" className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors shadow-lg shadow-indigo-500/20">
                  <Save className="w-5 h-5" />
                  Save Changes
                </button>
              </div>
            </motion.form>

            <motion.div
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <div className="p-6 border-b border-slate-200 dark:border-slate-800">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Semester Lifecycle</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">Manage the current operational semester.</p>
              </div>
              <div className="p-6">
                <div className="flex flex-col sm:flex-row gap-4 items-center justify-between p-4 bg-rose-50 dark:bg-rose-900/10 border border-rose-200 dark:border-rose-900/50 rounded-xl">
                  <div>
                    <h3 className="font-bold text-rose-900 dark:text-rose-400 mb-1">End Current Semester</h3>
                    <p className="text-sm text-rose-700 dark:text-rose-300/80">Archive all current data and reset attendance and marks for a new academic term. This cannot be undone.</p>
                  </div>
                  <button className="shrink-0 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-medium transition-colors shadow-md shadow-rose-500/20">
                    Initiate Reset
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

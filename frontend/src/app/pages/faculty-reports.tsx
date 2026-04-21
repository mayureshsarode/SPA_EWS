import { useState } from "react";
import { motion } from "motion/react";
import { FileText, Download, Filter, Calendar, BarChart3, Users, BookOpen, Loader2 } from "lucide-react";
import { FacultyLayout } from "../components/faculty-layout";

// Base URL for the backend API
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

function downloadCSV(endpoint: string, filename: string) {
  const token = localStorage.getItem("token");
  return fetch(`${API_BASE}${endpoint}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
    .then((res) => {
      if (!res.ok) throw new Error("Export failed");
      return res.text();
    })
    .then((text) => {
      const blob = new Blob([text], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    });
}

const quickExports = [
  { label: "Export All Attendance (CSV)", endpoint: "/faculty/export/attendance", filename: "attendance.csv", icon: Calendar, color: "text-blue-500" },
  { label: "Export All Marks (CSV)", endpoint: "/faculty/export/marks", filename: "marks.csv", icon: BarChart3, color: "text-violet-500" },
  { label: "Export Defaulters (CSV)", endpoint: "/faculty/export/defaulters", filename: "defaulters.csv", icon: Users, color: "text-rose-500" },
];

export function FacultyReports() {
  const [downloading, setDownloading] = useState<string | null>(null);

  const handleExport = async (endpoint: string, filename: string) => {
    setDownloading(endpoint);
    try {
      await downloadCSV(endpoint, filename);
    } catch {
      alert("Export failed. Please try again.");
    } finally {
      setDownloading(null);
    }
  };

  return (
    <FacultyLayout activeItem="Reports">
      <div className="space-y-6 max-w-6xl mx-auto">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">My Reports</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Export live performance data for your assigned courses</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <motion.div
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Quick Exports</h2>
              <div className="space-y-4">
                {quickExports.map((exp) => {
                  const Icon = exp.icon;
                  const isLoading = downloading === exp.endpoint;
                  return (
                    <motion.div
                      key={exp.endpoint}
                      className="p-5 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between group hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors"
                      whileHover={{ scale: 1.01 }}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                          <Icon className={`w-5 h-5 ${exp.color}`} />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white">{exp.label}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Live data from your courses</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleExport(exp.endpoint, exp.filename)}
                        disabled={!!downloading}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-semibold text-sm hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors disabled:opacity-60"
                      >
                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                        {isLoading ? "Exporting…" : "Export"}
                      </button>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          </div>

          <div className="space-y-6">
            <motion.div
              className="bg-gradient-to-br from-indigo-600 to-violet-600 rounded-2xl p-6 text-white shadow-xl shadow-indigo-500/20"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <FileText className="w-8 h-8 mb-4 opacity-80" />
              <h3 className="text-xl font-bold mb-2">CSV Reports</h3>
              <p className="text-indigo-100 text-sm mb-4 leading-relaxed">
                All exports reflect live data from PostgreSQL. Attendance and marks are current as of your last submission.
              </p>
              <div className="bg-white/10 rounded-xl p-3 text-sm text-indigo-100">
                <p className="font-semibold mb-1">What's included:</p>
                <ul className="space-y-0.5 text-xs">
                  <li>✓ Attendance per student per course</li>
                  <li>✓ CIE marks by student and course</li>
                  <li>✓ Filtered defaulter list (&lt;75%)</li>
                </ul>
              </div>
            </motion.div>

            <motion.div
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-3">How to use</h3>
              <ol className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                <li className="flex gap-3"><span className="font-bold text-indigo-600 dark:text-indigo-400">1.</span>Click Export on any report above</li>
                <li className="flex gap-3"><span className="font-bold text-indigo-600 dark:text-indigo-400">2.</span>The CSV file will download automatically</li>
                <li className="flex gap-3"><span className="font-bold text-indigo-600 dark:text-indigo-400">3.</span>Open with Excel, Google Sheets, or Numbers</li>
              </ol>
            </motion.div>
          </div>
        </div>
      </div>
    </FacultyLayout>
  );
}

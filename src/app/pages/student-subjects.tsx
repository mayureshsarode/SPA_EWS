import { motion } from "motion/react";
import {
  BookOpen,
  Calendar,
  Target,
  TrendingUp,
  TrendingDown,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
} from "recharts";
import { students } from "../data/mock-data";
import { StudentLayout } from "../components/student-layout";

export function StudentSubjects() {
  const student = students[0]; // Current student (mock)
  const [expanded, setExpanded] = useState<string | null>(null);

  const chartData = student.subjects.map((s) => ({
    name: s.name,
    attendance: s.attendance,
    avg: Math.round((s.cie1 + s.cie2 + s.cie3) / 3),
    color: s.attendance >= 75 ? "#10b981" : s.attendance >= 60 ? "#f59e0b" : "#ef4444",
  }));

  return (
    <StudentLayout activeItem="Subjects">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Subject Breakdown</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Detailed performance by subject</p>
        </div>

        {/* Overview Chart */}
        <motion.div
          className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Attendance by Subject</h2>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f033" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(15,23,42,0.9)",
                    border: "none",
                    borderRadius: "12px",
                    padding: "12px",
                    color: "#fff",
                  }}
                />
                <Bar dataKey="attendance" name="Attendance %" radius={[8, 8, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Subject Cards */}
        <div className="space-y-4">
          {student.subjects.map((subject, i) => {
            const avg = Math.round((subject.cie1 + subject.cie2 + subject.cie3) / 3);
            const avgPercent = Math.round((avg / subject.maxMarks) * 100);
            const isExpanded = expanded === subject.code;
            const trend = subject.cie3 > subject.cie1 ? "up" : subject.cie3 < subject.cie1 ? "down" : "flat";

            return (
              <motion.div
                key={subject.code}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 + i * 0.05 }}
              >
                {/* Subject Header */}
                <button
                  onClick={() => setExpanded(isExpanded ? null : subject.code)}
                  className="w-full p-6 text-left flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      subject.attendance >= 75 ? "bg-emerald-50 dark:bg-emerald-950/30" : subject.attendance >= 60 ? "bg-amber-50 dark:bg-amber-950/30" : "bg-rose-50 dark:bg-rose-950/30"
                    }`}>
                      <BookOpen className={`w-6 h-6 ${
                        subject.attendance >= 75 ? "text-emerald-600 dark:text-emerald-400" : subject.attendance >= 60 ? "text-amber-600 dark:text-amber-400" : "text-rose-600 dark:text-rose-400"
                      }`} />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white">{subject.name}</h3>
                      <span className="text-xs text-slate-500 dark:text-slate-400">{subject.code}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="hidden sm:flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-sm font-bold text-slate-900 dark:text-white">{subject.attendance}%</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">Attendance</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-slate-900 dark:text-white">{avg}/{subject.maxMarks}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">CIE Avg</div>
                      </div>
                      <div className={`flex items-center gap-1 text-sm font-medium ${
                        trend === "up" ? "text-emerald-600 dark:text-emerald-400" : trend === "down" ? "text-rose-600 dark:text-rose-400" : "text-slate-500"
                      }`}>
                        {trend === "up" ? <TrendingUp className="w-4 h-4" /> : trend === "down" ? <TrendingDown className="w-4 h-4" /> : null}
                      </div>
                    </div>
                    {isExpanded ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                  </div>
                </button>

                {/* Expanded Detail */}
                {isExpanded && (
                  <motion.div
                    className="px-6 pb-6 border-t border-slate-200 dark:border-slate-800 pt-4"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {/* Attendance */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                          <Calendar className="w-4 h-4" />
                          Attendance Details
                        </div>
                        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                          <div className="flex items-center justify-between mb-3 text-sm border-b border-slate-200 dark:border-slate-700 pb-3">
                            <span className="text-slate-600 dark:text-slate-400">Total Classes Conducted</span>
                            <span className="font-bold text-slate-900 dark:text-white">40</span>
                          </div>
                          
                          <div className="space-y-2 mb-4">
                            <div className="flex items-center justify-between text-sm">
                              <span className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                                <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Present
                              </span>
                              <span className="font-medium text-slate-900 dark:text-white">
                                {Math.floor(40 * (subject.attendance / 100)) - (subject.code === 'CS301' ? 2 : 0)}
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className="flex items-center gap-2 text-slate-600 dark:text-slate-400" title="Duty Leave">
                                <span className="w-2 h-2 rounded-full bg-indigo-500"></span> Duty Leave (DL)
                              </span>
                              <span className="font-medium text-slate-900 dark:text-white">
                                {subject.code === 'CS301' ? 2 : 0}
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                                <span className="w-2 h-2 rounded-full bg-rose-500"></span> Absent
                              </span>
                              <span className="font-medium text-slate-900 dark:text-white">
                                {40 - Math.floor(40 * (subject.attendance / 100))}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between mt-4">
                            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Net Percentage</span>
                            <span className={`font-bold ${
                              subject.attendance >= 75 ? "text-emerald-600 dark:text-emerald-400" : subject.attendance >= 60 ? "text-amber-600 dark:text-amber-400" : "text-rose-600 dark:text-rose-400"
                            }`}>{subject.attendance}%</span>
                          </div>
                          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5 mt-2">
                            <div
                              className={`h-2.5 rounded-full ${
                                subject.attendance >= 75 ? "bg-emerald-500" : subject.attendance >= 60 ? "bg-amber-500" : "bg-rose-500"
                              }`}
                              style={{ width: `${subject.attendance}%` }}
                            />
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                            {subject.attendance >= 75 ? "✓ Above threshold" : "⚠ Below 75% threshold"}
                          </div>
                        </div>
                      </div>

                      {/* CIE Marks */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                          <Target className="w-4 h-4" />
                          CIE Marks
                        </div>
                        <div className="space-y-2">
                          {[
                            { label: "CIE 1", marks: subject.cie1 },
                            { label: "CIE 2", marks: subject.cie2 },
                            { label: "CIE 3", marks: subject.cie3 },
                          ].map((cie) => (
                            <div key={cie.label} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                              <span className="text-sm text-slate-600 dark:text-slate-400">{cie.label}</span>
                              <div className="flex items-center gap-2">
                                <div className="w-16 bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                                  <div
                                    className={`h-2 rounded-full ${
                                      (cie.marks / subject.maxMarks) * 100 >= 60 ? "bg-indigo-500" : "bg-amber-500"
                                    }`}
                                    style={{ width: `${(cie.marks / subject.maxMarks) * 100}%` }}
                                  />
                                </div>
                                <span className="font-bold text-sm text-slate-900 dark:text-white w-12 text-right">{cie.marks}/{subject.maxMarks}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </StudentLayout>
  );
}

import { useState, useEffect } from "react";
import { api } from "../lib/api";
import { motion } from "motion/react";
import { AdminLayout } from "../components/admin-layout";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, LineChart, Line, Legend,
} from "recharts";
import { Building, GraduationCap, AlertTriangle, TrendingUp, Info } from "lucide-react";
import { AnimatedCounter } from "../components/animated-counter";

// EWS Heatmap data: departments (Y) × semesters (X) → risk score 0-100
const DEPARTMENTS = ["Computer Sci.", "Electronics", "Mechanical", "Civil", "IT", "First Year"];
const SEMESTERS = ["Sem 1", "Sem 2", "Sem 3", "Sem 4", "Sem 5", "Sem 6", "Sem 7", "Sem 8"];

const heatmapData: number[][] = [
  [15, 18, 22, 35, 28, 20, 12, 10],  // CS
  [20, 24, 38, 44, 35, 30, 22, 18],  // ECE
  [30, 35, 55, 62, 50, 45, 38, 28],  // Mech
  [25, 29, 42, 48, 40, 35, 26, 20],  // Civil
  [12, 15, 18, 25, 20, 16, 10, 8],   // IT
  [40, 45, 0, 0, 0, 0, 0, 0],        // FY (only Sem 1-2)
];

const weeklyTrend = [
  { week: "W1", cs: 18, ece: 29, mech: 48, it: 14 },
  { week: "W2", cs: 20, ece: 32, mech: 52, it: 16 },
  { week: "W3", cs: 22, ece: 36, mech: 55, it: 15 },
  { week: "W4", cs: 19, ece: 34, mech: 58, it: 13 },
  { week: "W5", cs: 23, ece: 38, mech: 62, it: 18 },
  { week: "W6", cs: 21, ece: 35, mech: 59, it: 16 },
];


function riskColor(score: number): string {
  if (score === 0) return "bg-slate-100 dark:bg-slate-800/30";
  if (score < 20) return "bg-emerald-200 dark:bg-emerald-900/60";
  if (score < 35) return "bg-teal-200 dark:bg-teal-900/50";
  if (score < 50) return "bg-amber-200 dark:bg-amber-900/60";
  if (score < 65) return "bg-orange-300 dark:bg-orange-900/60";
  return "bg-rose-400 dark:bg-rose-800";
}

function riskLabel(score: number): string {
  if (score === 0) return "N/A";
  if (score < 20) return "Low";
  if (score < 35) return "Guarded";
  if (score < 50) return "Elevated";
  if (score < 65) return "High";
  return "Critical";
}

export function LeadershipDashboard() {
  const [hoveredCell, setHoveredCell] = useState<{ dept: number; sem: number } | null>(null);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    api('/admin/leadership')
      .then(res => setData(res.data))
      .catch(console.error);
  }, []);

  const deptData = data?.departments || [];
  const totals = data?.totals || { totalStudents: 0, totalCritical: 0 };

  const departmentBar = deptData.map((d: any) => {
    const total = d.studentCount || 1;
    return {
      name: d.name,
      safe: Math.round((d.riskDistribution.safe / total) * 100) || 0,
      warning: Math.round((d.riskDistribution.warning / total) * 100) || 0,
      critical: Math.round((d.riskDistribution.critical / total) * 100) || 0,
    };
  });

  const institutionAvgAtt = deptData.length > 0 
    ? Math.round(deptData.reduce((acc: number, d: any) => acc + d.avgAttendance, 0) / deptData.length)
    : 0;

  return (
    <AdminLayout activeItem="Leadership Board">
      <div className="max-w-7xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Institution Leadership Dashboard</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Global analytical rollups, EWS heatmap, and department comparisons for Deans and Principals.
          </p>
        </div>

        {/* Global KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            { label: "Total Departments", value: deptData.length || 6, icon: Building, gradient: "from-blue-500 to-cyan-500" },
            { label: "Total Students", value: totals.totalStudents || 0, icon: GraduationCap, gradient: "from-indigo-500 to-violet-500" },
            { label: "Institution Avg Attendance", value: institutionAvgAtt, icon: TrendingUp, gradient: "from-emerald-500 to-teal-500", suffix: "%" },
            { label: "Critical Cases", value: totals.totalCritical || 0, icon: AlertTriangle, gradient: "from-rose-500 to-red-500" },
          ].map((stat, i) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: i * 0.08 }}
                className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800"
              >
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center mb-3 shadow-lg`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div className="text-3xl font-black text-slate-900 dark:text-white mb-1">
                  <AnimatedCounter target={stat.value} suffix={stat.suffix || ""} />
                </div>
                <div className="text-sm text-slate-500 dark:text-slate-400">{stat.label}</div>
              </motion.div>
            );
          })}
        </div>

        {/* EWS Risk Heatmap */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800"
        >
          <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">EWS Risk Heatmap</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                Department × Semester risk matrix. Darker cells = higher early-warning risk score.
              </p>
            </div>
            {/* Legend */}
            <div className="flex items-center gap-2 text-xs text-slate-500 flex-wrap">
              {[
                { label: "Low", cls: "bg-emerald-200 dark:bg-emerald-900/60" },
                { label: "Guarded", cls: "bg-teal-200 dark:bg-teal-900/50" },
                { label: "Elevated", cls: "bg-amber-200 dark:bg-amber-900/60" },
                { label: "High", cls: "bg-orange-300 dark:bg-orange-900/60" },
                { label: "Critical", cls: "bg-rose-400 dark:bg-rose-800" },
              ].map((l) => (
                <div key={l.label} className="flex items-center gap-1.5">
                  <div className={`w-3 h-3 rounded-sm ${l.cls}`} />
                  <span>{l.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="w-32 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 pb-3 pr-4">Department</th>
                  {SEMESTERS.map((s) => (
                    <th key={s} className="text-xs font-semibold text-slate-500 dark:text-slate-400 pb-3 px-1 text-center">{s}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {DEPARTMENTS.map((dept, di) => (
                  <tr key={dept}>
                    <td className="pr-4 py-1 text-sm font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap">{dept}</td>
                    {SEMESTERS.map((_, si) => {
                      const score = heatmapData[di][si];
                      const isHovered = hoveredCell?.dept === di && hoveredCell?.sem === si;
                      return (
                        <td key={si} className="px-1 py-1">
                          <motion.div
                            onMouseEnter={() => setHoveredCell({ dept: di, sem: si })}
                            onMouseLeave={() => setHoveredCell(null)}
                            className={`relative h-10 rounded-lg flex items-center justify-center cursor-default transition-all duration-150 ${riskColor(score)} ${isHovered ? "scale-110 shadow-md z-10" : ""}`}
                            whileHover={{ scale: 1.1 }}
                          >
                            <span className="text-[10px] font-bold text-slate-700 dark:text-slate-200 select-none">
                              {score === 0 ? "—" : riskLabel(score)}
                            </span>
                            {isHovered && score > 0 && (
                              <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 rounded-lg bg-slate-900 text-white text-[10px] font-bold whitespace-nowrap z-20 shadow-xl">
                                Risk: {score}
                              </div>
                            )}
                          </motion.div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex items-center gap-2 p-3 rounded-xl bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
            <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
            <p className="text-xs text-blue-700 dark:text-blue-400">
              <strong>Mechanical Semester 3 & 4</strong> are showing the highest institutional risk. Consider allocating additional faculty mentors and scheduling department-wide counseling sessions.
            </p>
          </div>
        </motion.div>

        {/* Weekly Trend + Risk Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
            className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800"
          >
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Week-on-Week Risk Trend</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">Average EWS risk score per department over last 6 weeks</p>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={weeklyTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-slate-100 dark:text-slate-800" />
                <XAxis dataKey="week" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 80]} tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 10px 40px rgba(0,0,0,0.15)" }} />
                <Legend />
                <Line type="monotone" dataKey="cs" stroke="#6366f1" name="CS" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="ece" stroke="#f59e0b" name="ECE" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="mech" stroke="#ef4444" name="Mech" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="it" stroke="#10b981" name="IT" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.5 }}
            className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800"
          >
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Department Risk Distribution</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">Safe / Warning / Critical student split per department</p>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={departmentBar} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-slate-100 dark:text-slate-800" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 10px 40px rgba(0,0,0,0.15)" }} />
                <Bar dataKey="safe" name="Safe %" stackId="a" fill="#10b981" radius={[0, 0, 4, 4]} />
                <Bar dataKey="warning" name="Warning %" stackId="a" fill="#f59e0b" />
                <Bar dataKey="critical" name="Critical %" stackId="a" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        </div>
      </div>
    </AdminLayout>
  );
}

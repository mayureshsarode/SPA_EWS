import { motion } from "motion/react";
import { AdminLayout } from "../components/admin-layout";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Building, GraduationCap, AlertTriangle, TrendingUp } from "lucide-react";
import { AnimatedCounter } from "../components/animated-counter";

const departmentData = [
  { name: "Computer Science", safe: 85, warning: 10, critical: 5 },
  { name: "Electronics", safe: 75, warning: 15, critical: 10 },
  { name: "Mechanical", safe: 60, warning: 25, critical: 15 },
  { name: "Civil", safe: 70, warning: 20, critical: 10 },
  { name: "IT", safe: 90, warning: 8, critical: 2 },
];

export function LeadershipDashboard() {
  return (
    <AdminLayout activeItem="Leadership Board">
      <div className="max-w-7xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Institution Leadership Dashboard</h1>
          <p className="text-slate-500 dark:text-slate-400">
            Global analytical rollups and department comparisons for Deans and Principals.
          </p>
        </div>

        {/* Global KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: "Total Departments", value: 12, icon: Building, color: "blue" },
            { label: "Total Students", value: 4500, icon: GraduationCap, color: "indigo" },
            { label: "Institution Avg Attendance", value: 78, icon: TrendingUp, color: "emerald", suffix: "%" },
            { label: "Critical Cases", value: 142, icon: AlertTriangle, color: "rose" },
          ].map((stat, i) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-xl bg-${stat.color}-50 dark:bg-${stat.color}-900/30 text-${stat.color}-600 dark:text-${stat.color}-400`}>
                    <Icon className="w-6 h-6" />
                  </div>
                </div>
                <div className="text-3xl font-black text-slate-900 dark:text-white mb-1">
                  <AnimatedCounter target={stat.value} suffix={stat.suffix || ""} />
                </div>
                <div className="text-sm font-medium text-slate-500 dark:text-slate-400">{stat.label}</div>
              </motion.div>
            );
          })}
        </div>

        {/* Department Comparison Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm"
        >
          <div className="mb-6">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Department Risk Distribution</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Percentage of students in safe, warning, and critical zones by department.</p>
          </div>
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={departmentData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f033" vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{ backgroundColor: "rgba(15,23,42,0.9)", border: "none", borderRadius: "12px", color: "#fff" }}
                />
                <Bar dataKey="safe" name="Safe Zone %" stackId="a" fill="#10b981" radius={[0, 0, 4, 4]} />
                <Bar dataKey="warning" name="Warning Zone %" stackId="a" fill="#f59e0b" />
                <Bar dataKey="critical" name="Critical Zone %" stackId="a" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>
    </AdminLayout>
  );
}

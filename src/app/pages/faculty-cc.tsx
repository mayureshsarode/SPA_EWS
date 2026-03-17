import { motion } from "motion/react";
import { FacultyLayout } from "../components/faculty-layout";
import { useAuth } from "../contexts/auth-context";
import { Users, Target, CheckCircle, AlertTriangle, ShieldAlert } from "lucide-react";
import { AnimatedCounter } from "../components/animated-counter";

export function FacultyClassCoordinator() {
  const { user } = useAuth();
  const faculty = user as any;

  return (
    <FacultyLayout activeItem="Class Coordinator">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Class Coordinator Dashboard</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Division aggregate performance and oversight for {faculty?.department || "Computer Science"} Sem 3 Div A.
          </p>
        </div>

        {/* Division Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: "Total Students", value: 60, icon: Users, gradient: "from-indigo-600 to-violet-600" },
            { label: "Safe Zone", value: 45, icon: CheckCircle, gradient: "from-emerald-500 to-teal-500" },
            { label: "Warning Zone", value: 10, icon: AlertTriangle, gradient: "from-amber-500 to-orange-500" },
            { label: "Critical Zone", value: 5, icon: ShieldAlert, gradient: "from-rose-500 to-red-500" },
          ].map((stat, i) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={i}
                className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-lg text-white`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
                    <AnimatedCounter target={stat.value} />
                  </div>
                </div>
                <div className="text-sm font-medium text-slate-600 dark:text-slate-400">{stat.label}</div>
              </motion.div>
            );
          })}
        </div>

        {/* Aggregate Subject Performance */}
        <motion.div
          className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
        >
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Subject-wise Aggregates</h2>
          <div className="space-y-4">
            {[
              { subject: "DSA", attendance: 82, marks: 75 },
              { subject: "OS", attendance: 78, marks: 68 },
              { subject: "DBMS", attendance: 86, marks: 80 },
              { subject: "Maths III", attendance: 90, marks: 85 },
            ].map((subject, i) => (
              <div key={i} className="flex flex-col sm:flex-row gap-4 justify-between items-center p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <div className="font-semibold text-slate-900 dark:text-white w-32">{subject.subject}</div>
                <div className="flex-1 w-full space-y-2">
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>Attendance ({subject.attendance}%)</span>
                    <span>CIE Avg ({subject.marks}%)</span>
                  </div>
                  <div className="w-full h-2 rounded-full overflow-hidden flex">
                    <div className="bg-indigo-500 h-full" style={{ width: `${subject.attendance}%` }} />
                  </div>
                  <div className="w-full h-2 rounded-full overflow-hidden flex">
                    <div className="bg-blue-500 h-full" style={{ width: `${subject.marks}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </FacultyLayout>
  );
}

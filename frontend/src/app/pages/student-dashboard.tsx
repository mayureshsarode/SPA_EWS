import { Link } from "react-router";
import { motion } from "motion/react";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Calendar,
  Target,
  BookOpen,
  MessageSquare,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { AnimatedCounter } from "../components/animated-counter";
import { useAuth } from "../contexts/auth-context";
import { StudentLayout } from "../components/student-layout";
import { api } from "../lib/api";
import { useState, useEffect } from "react";

// Mock data
const performanceData = [
  { month: "Sep", attendance: 85, marks: 78 },
  { month: "Oct", attendance: 82, marks: 75 },
  { month: "Nov", attendance: 78, marks: 72 },
  { month: "Dec", attendance: 75, marks: 70 },
  { month: "Jan", attendance: 70, marks: 68 },
  { month: "Feb", attendance: 65, marks: 65 },
];

const subjectData = [
  { name: "DSA", attendance: 72, marks: 70, status: "warning" },
  { name: "DBMS", attendance: 85, marks: 78, status: "safe" },
  { name: "OS", attendance: 60, marks: 55, status: "critical" },
  { name: "CN", attendance: 78, marks: 72, status: "warning" },
  { name: "Maths", attendance: 90, marks: 85, status: "safe" },
];

const pieData = [
  { name: "Present", value: 65, color: "#6366f1" },
  { name: "Absent", value: 35, color: "#e2e8f0" },
];

export function StudentDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api('/students/me/dashboard')
      .then(res => setData(res.data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const student = data || {};
  const currentAttendance = student.attendance ?? 0;
  const currentMarks = student.internalMarks ?? 0;
  const status: "safe" | "warning" | "critical" = student.status || "safe";
  const studentSubjects = student.subjects || [];
  const mentor = student.mentor || null;

  // Pie chart counts
  const pieData = studentSubjects.length > 0 ? [
    { name: "Present", value: currentAttendance, color: "#6366f1" },
    { name: "Absent", value: 100 - currentAttendance, color: "#e2e8f0" },
  ] : [
    { name: "Present", value: 0, color: "#6366f1" },
    { name: "Absent", value: 100, color: "#e2e8f0" }
  ];

  const getStatusConfig = (status: string) => {
    if (status === "safe") {
      return {
        gradient: "from-emerald-500 to-teal-500",
        bg: "bg-emerald-50 dark:bg-emerald-950/30",
        text: "text-emerald-700 dark:text-emerald-400",
        border: "border-emerald-200 dark:border-emerald-800/50",
        icon: CheckCircle,
        message: "Great job! Keep up the good work!",
        label: "Safe",
      };
    }
    if (status === "warning") {
      return {
        gradient: "from-amber-500 to-orange-500",
        bg: "bg-amber-50 dark:bg-amber-950/30",
        text: "text-amber-700 dark:text-amber-400",
        border: "border-amber-200 dark:border-amber-800/50",
        icon: AlertTriangle,
        message: "Your performance needs attention. Consider meeting with your advisor.",
        label: "Warning",
      };
    }
    return {
      gradient: "from-rose-500 to-red-500",
      bg: "bg-rose-50 dark:bg-rose-950/30",
      text: "text-rose-700 dark:text-rose-400",
      border: "border-rose-200 dark:border-rose-800/50",
      icon: AlertTriangle,
      message: "Immediate action required! Please schedule a meeting with your faculty advisor.",
      label: "Critical",
    };
  };

  const statusConfig = getStatusConfig(status);
  const StatusIcon = statusConfig.icon;

  if (loading) {
    return (
      <StudentLayout activeItem="Dashboard">
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </StudentLayout>
    );
  }

  if (error) {
    return (
      <StudentLayout activeItem="Dashboard">
        <div className="p-8 text-center text-rose-500 font-medium bg-rose-50 rounded-xl my-8 mx-auto max-w-2xl border border-rose-200">
          Failed to load dashboard: {error}
        </div>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout activeItem="Dashboard">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Welcome Section */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-4 mb-2">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-indigo-500/25">
              {student?.name?.split(" ").map((n: string) => n[0]).join("") || "JD"}
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">
                Welcome, {student?.name || "John Doe"}
              </h1>
              <p className="text-slate-600 dark:text-slate-400 flex flex-wrap items-center gap-1.5 mt-1">
                <span>ID: {student.prnNumber || student.id?.substring(0,8)}</span>
                <span>•</span>
                <span>{student.department || "Unknown Dept"}</span>
                <span>•</span>
                <span>Division {student.division || "A"}</span>
                {mentor && (
                  <>
                    <span>•</span>
                    <span className="inline-flex items-center gap-1 font-medium text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-900/30">
                      Mentor: {mentor.name}
                    </span>
                  </>
                )}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Status Alert */}
        {status !== "safe" && (
          <motion.div
            className={`${statusConfig.bg} ${statusConfig.border} border-2 rounded-2xl p-6 mb-6`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-xl bg-gradient-to-br ${statusConfig.gradient} shadow-lg`}>
                <StatusIcon className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className={`font-bold ${statusConfig.text} mb-1 text-lg`}>
                  Performance {statusConfig.label}
                </h3>
                <p className="text-slate-700 dark:text-slate-300">{statusConfig.message}</p>
              </div>
              {/* Pulse indicator */}
              <div className="flex items-center gap-2">
                <span className="relative flex h-3 w-3">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 bg-gradient-to-r ${statusConfig.gradient}`}></span>
                  <span className={`relative inline-flex rounded-full h-3 w-3 bg-gradient-to-r ${statusConfig.gradient}`}></span>
                </span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Performance Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Attendance Card */}
          <motion.div
            className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-lg dark:hover:shadow-2xl dark:hover:shadow-indigo-500/5 transition-all duration-300"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex items-center gap-1 text-rose-500 text-sm font-medium">
                <TrendingDown className="w-4 h-4" />
                -5%
              </div>
            </div>
            <div className="mb-3">
              <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
                <AnimatedCounter target={currentAttendance} suffix="%" />
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Overall Attendance</div>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5">
              <div
                className={`h-2.5 rounded-full transition-all duration-1000 ${
                  currentAttendance >= 75 ? "bg-emerald-500" : currentAttendance >= 60 ? "bg-amber-500" : "bg-rose-500"
                }`}
                style={{ width: `${currentAttendance}%` }}
              />
            </div>
            <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
              Threshold: 75% (Required)
            </div>
          </motion.div>

          {/* Internal Marks Card */}
          <motion.div
            className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-lg dark:hover:shadow-2xl dark:hover:shadow-indigo-500/5 transition-all duration-300"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 flex items-center justify-center">
                <Target className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div className="flex items-center gap-1 text-rose-500 text-sm font-medium">
                <TrendingDown className="w-4 h-4" />
                -3%
              </div>
            </div>
            <div className="mb-3">
              <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
                <AnimatedCounter target={currentMarks} suffix="/100" />
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400">CIE Marks Average</div>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5">
              <div
                className={`h-2.5 rounded-full transition-all duration-1000 ${
                  currentMarks >= 60 ? "bg-emerald-500" : currentMarks >= 50 ? "bg-amber-500" : "bg-rose-500"
                }`}
                style={{ width: `${currentMarks}%` }}
              />
            </div>
            <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
              Threshold: 60/100 (Required)
            </div>
          </motion.div>

          {/* Status Card with Donut */}
          <motion.div
            className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-lg dark:hover:shadow-2xl dark:hover:shadow-indigo-500/5 transition-all duration-300"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-semibold text-slate-600 dark:text-slate-400">Attendance Ratio</div>
              <div className={`${statusConfig.bg} ${statusConfig.text} px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5`}>
                <span className="relative flex h-2 w-2">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 bg-gradient-to-r ${statusConfig.gradient}`}></span>
                  <span className={`relative inline-flex rounded-full h-2 w-2 bg-gradient-to-r ${statusConfig.gradient}`}></span>
                </span>
                {statusConfig.label}
              </div>
            </div>
            <div className="flex items-center justify-center">
              <ResponsiveContainer width={160} height={160}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    dataKey="value"
                    startAngle={90}
                    endAngle={-270}
                    strokeWidth={0}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center justify-center gap-4 text-xs text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-indigo-500" />Present</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-slate-200 dark:bg-slate-700" />Absent</span>
            </div>
          </motion.div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Performance Trend (2/3 width) */}
          <motion.div
            className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Performance Trend</h2>
                <p className="text-sm text-slate-600 dark:text-slate-400">Attendance & marks over time</p>
              </div>
              <TrendingUp className="w-5 h-5 text-slate-400" />
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={performanceData}>
                  <defs>
                    <linearGradient id="gradAttend" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gradMarks" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f033" />
                  <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
                  <YAxis stroke="#94a3b8" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(15,23,42,0.9)",
                      border: "none",
                      borderRadius: "12px",
                      padding: "12px",
                      color: "#fff",
                    }}
                  />
                  <Area type="monotone" dataKey="attendance" stroke="#3b82f6" strokeWidth={3} fill="url(#gradAttend)" name="Attendance %" dot={{ fill: "#3b82f6", r: 4 }} />
                  <Area type="monotone" dataKey="marks" stroke="#8b5cf6" strokeWidth={3} fill="url(#gradMarks)" name="CIE Marks" dot={{ fill: "#8b5cf6", r: 4 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-slate-200 dark:border-slate-800">
              <span className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400"><span className="w-3 h-3 rounded-full bg-blue-500" />Attendance</span>
              <span className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400"><span className="w-3 h-3 rounded-full bg-violet-500" />CIE Marks</span>
            </div>
          </motion.div>

          {/* Subject Breakdown (1/3) */}
          <motion.div
            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.5 }}
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">By Subject</h2>
              <BookOpen className="w-5 h-5 text-slate-400" />
            </div>
            <div className="space-y-4">
              {studentSubjects.map((subject: any, i: number) => {
                const computedStatus = subject.attendance >= 75 ? "safe" : subject.attendance >= 65 ? "warning" : "critical";
                const config = getStatusConfig(computedStatus);
                return (
                  <div key={i} className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-900 dark:text-white">{subject.name}</span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${config.bg} ${config.text}`}>
                        {subject.attendance}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full bg-gradient-to-r ${config.gradient} transition-all duration-700`}
                        style={{ width: `${subject.attendance}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>

        {/* Recommendations */}
        <motion.div
          className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.6 }}
        >
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Recommendations</h2>
          <div className="space-y-3">
            {currentAttendance < 75 && (
              <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/30">
                <div className="p-2 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 shadow-lg shadow-amber-500/20">
                  <AlertTriangle className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="font-semibold text-amber-900 dark:text-amber-300 mb-0.5">Improve Attendance</div>
                  <p className="text-sm text-amber-700 dark:text-amber-400/80">
                    Your attendance is below the required 75%. Try to attend all upcoming classes.
                  </p>
                </div>
              </div>
            )}
            {currentMarks < 60 && (
              <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/30">
                <div className="p-2 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 shadow-lg shadow-amber-500/20">
                  <Target className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="font-semibold text-amber-900 dark:text-amber-300 mb-0.5">Focus on CIE Assessments</div>
                  <p className="text-sm text-amber-700 dark:text-amber-400/80">
                    Your marks are below the required threshold. Consider seeking help from faculty or peers.
                  </p>
                </div>
              </div>
            )}
            <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800/30">
              <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 shadow-lg shadow-blue-500/20">
                <MessageSquare className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="font-semibold text-blue-900 dark:text-blue-300 mb-0.5">Schedule a Meeting</div>
                <p className="text-sm text-blue-700 dark:text-blue-400/80">
                  Book a session with your faculty advisor to discuss your performance and create an improvement plan.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </StudentLayout>
  );
}

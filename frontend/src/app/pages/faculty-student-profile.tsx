import { useParams, useNavigate, Link } from "react-router";
import { useState } from "react";
import { motion } from "motion/react";
import {
  ArrowLeft,
  User,
  Mail,
  BookOpen,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Activity,
  BarChart3,
  MessageSquare,
  Award,
  Clock,
  ChevronRight,
} from "lucide-react";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
} from "recharts";
import { FacultyLayout } from "../components/faculty-layout";
import { students, faculties, getStatusColor, getStatusGradient } from "../data/mock-data";

const TABS = ["Overview", "Subjects", "AI Insights", "Action Log"] as const;
type Tab = (typeof TABS)[number];

// Mock trend data
const semesterTrend = [
  { sem: "Sem 1", attendance: 88, marks: 75 },
  { sem: "Sem 2", attendance: 82, marks: 70 },
  { sem: "Sem 3 (now)", attendance: 0, marks: 0 },
];

// Mock AMCAT data
const amcatData = [
  { subject: "Logical", amcat: 78, internal: 85 },
  { subject: "Quantitative", amcat: 55, internal: 72 },
  { subject: "Verbal", amcat: 80, internal: 78 },
  { subject: "Domain (CS)", amcat: 62, internal: 88 },
  { subject: "Attention", amcat: 70, internal: 80 },
];

const radarData = [
  { metric: "Attendance", value: 0 },
  { metric: "CIE Avg", value: 0 },
  { metric: "AMCAT", value: 65 },
  { metric: "Engagement", value: 72 },
  { metric: "Consistency", value: 0 },
];

const mockActionLog = [
  { id: 1, type: "message", text: "Sent a message about CIE 2 performance", time: "2 days ago", icon: MessageSquare, color: "from-blue-500 to-cyan-500" },
  { id: 2, type: "alert", text: "Marked attendance warning for low attendance in OS", time: "1 week ago", icon: AlertTriangle, color: "from-amber-500 to-orange-500" },
  { id: 3, type: "note", text: "Student met for counseling session — committed to improvement", time: "2 weeks ago", icon: CheckCircle, color: "from-emerald-500 to-teal-500" },
];

export function FacultyStudentProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>("Overview");

  const student = students.find((s) => s.id === id);
  const mentor = student?.mentorId ? faculties.find((f) => f.id === student.mentorId) : null;

  if (!student) {
    return (
      <FacultyLayout activeItem="Students">
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <User className="w-8 h-8 text-slate-400" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Student Not Found</h2>
          <p className="text-slate-500 dark:text-slate-400">No student with ID "{id}" exists.</p>
          <button
            onClick={() => navigate("/faculty/students")}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-medium text-sm"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Students
          </button>
        </div>
      </FacultyLayout>
    );
  }

  // Populate trend with real current semester data
  semesterTrend[2].attendance = student.attendance;
  semesterTrend[2].marks = student.internalMarks;
  radarData[0].value = student.attendance;
  radarData[1].value = Math.round((student.internalMarks / 100) * 100);
  radarData[4].value = student.status === "safe" ? 85 : student.status === "warning" ? 60 : 40;

  const avgCIE =
    student.subjects.reduce((acc, s) => {
      const avg = (s.cie1 + s.cie2 + s.cie3) / 3;
      return acc + avg / s.maxMarks;
    }, 0) /
    student.subjects.length *
    100;

  return (
    <FacultyLayout activeItem="Students">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-6">
        <Link to="/faculty/students" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Students</Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-slate-900 dark:text-white font-medium">{student.name}</span>
      </div>

      {/* Header Ribbon */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden mb-6"
      >
        <div className={`h-2 bg-gradient-to-r ${getStatusGradient(student.status)}`} />
        <div className="p-6 flex flex-col md:flex-row md:items-center gap-6">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center text-white text-2xl font-bold shadow-xl shadow-indigo-500/20 flex-shrink-0">
            {student.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap items-start gap-3 mb-2">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{student.name}</h1>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${getStatusColor(student.status)}`}>
                {student.status}
              </span>
            </div>
            <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1.5"><User className="w-3.5 h-3.5" />{student.id}</span>
              <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" />{student.email}</span>
              <span className="flex items-center gap-1.5"><BookOpen className="w-3.5 h-3.5" />{student.department}</span>
              <span className="flex items-center gap-1.5"><Award className="w-3.5 h-3.5" />Sem {student.semester} · Div {student.division}</span>
              {mentor && (
                <span className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400">
                  <MessageSquare className="w-3.5 h-3.5" />Mentor: {mentor.name}
                </span>
              )}
            </div>
          </div>
          <div className="flex gap-3">
            <Link
              to="/student/messages"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-sm font-medium shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 transition-shadow"
            >
              <MessageSquare className="w-4 h-4" />
              Message
            </Link>
          </div>
        </div>

        {/* Quick stat strip */}
        <div className="border-t border-slate-100 dark:border-slate-800 grid grid-cols-3 divide-x divide-slate-100 dark:divide-slate-800">
          {[
            { label: "Attendance", value: `${student.attendance}%`, icon: Activity, good: student.attendance >= 75 },
            { label: "Avg CIE", value: `${avgCIE.toFixed(1)}%`, icon: BarChart3, good: avgCIE >= 60 },
            { label: "Active KTs", value: "0", icon: AlertTriangle, good: true },
          ].map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="p-4 text-center">
                <div className={`text-xl font-bold mb-0.5 ${stat.good ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                  {stat.value}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center justify-center gap-1">
                  <Icon className="w-3.5 h-3.5" />{stat.label}
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-slate-100 dark:bg-slate-800/60 rounded-xl mb-6 w-fit">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeTab === tab
                ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab: Overview */}
      {activeTab === "Overview" && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
            <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-500" />Semester Performance Trend
            </h3>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={semesterTrend}>
                <defs>
                  <linearGradient id="attendGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="marksGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-slate-100 dark:text-slate-800" />
                <XAxis dataKey="sem" tick={{ fontSize: 12 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                <Tooltip contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 10px 40px rgba(0,0,0,0.15)" }} />
                <Area type="monotone" dataKey="attendance" stroke="#6366f1" fill="url(#attendGrad)" strokeWidth={2} name="Attendance %" />
                <Area type="monotone" dataKey="marks" stroke="#8b5cf6" fill="url(#marksGrad)" strokeWidth={2} name="Marks %" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
            <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Activity className="w-4 h-4 text-violet-500" />Performance Radar
            </h3>
            <ResponsiveContainer width="100%" height={220}>
              <RadarChart data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="metric" tick={{ fontSize: 11 }} />
                <Radar dataKey="value" stroke="#6366f1" fill="#6366f1" fillOpacity={0.25} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      )}

      {/* Tab: Subjects */}
      {activeTab === "Subjects" && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                  {["Subject", "Code", "Attendance", "CIE 1", "CIE 2", "CIE 3", "Avg %"].map((h) => (
                    <th key={h} className="px-5 py-3.5 text-left font-semibold text-slate-600 dark:text-slate-400">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {student.subjects.map((sub, i) => {
                  const avg = ((sub.cie1 + sub.cie2 + sub.cie3) / (sub.maxMarks * 3)) * 100;
                  const faculty = faculties.find((f) => f.id === sub.facultyId);
                  return (
                    <tr key={i} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="px-5 py-4">
                        <div className="font-semibold text-slate-900 dark:text-white">{sub.name}</div>
                        <div className="text-xs text-slate-400">{faculty?.name}</div>
                      </td>
                      <td className="px-5 py-4 text-slate-600 dark:text-slate-400 font-mono text-xs">{sub.code}</td>
                      <td className="px-5 py-4">
                        <span className={`font-semibold ${sub.attendance >= 75 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                          {sub.attendance}%
                        </span>
                      </td>
                      <td className="px-5 py-4 text-slate-700 dark:text-slate-300">{sub.cie1}/{sub.maxMarks}</td>
                      <td className="px-5 py-4 text-slate-700 dark:text-slate-300">{sub.cie2}/{sub.maxMarks}</td>
                      <td className="px-5 py-4 text-slate-700 dark:text-slate-300">{sub.cie3}/{sub.maxMarks}</td>
                      <td className="px-5 py-4">
                        <span className={`font-bold ${avg >= 60 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                          {avg.toFixed(1)}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* Tab: AI Insights */}
      {activeTab === "AI Insights" && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
            <h3 className="font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-indigo-500" />AMCAT vs Internal Marks
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Compares external aptitude scores to internal exam performance.</p>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={amcatData} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-slate-100 dark:text-slate-800" />
                <XAxis dataKey="subject" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 10px 40px rgba(0,0,0,0.15)" }} />
                <Bar dataKey="internal" name="Internal %" fill="#6366f1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="amcat" name="AMCAT %" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-4">
            <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-5">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="font-semibold text-amber-900 dark:text-amber-300 text-sm mb-1">AI Insight: Rote-Learning Risk</div>
                  <p className="text-xs text-amber-800 dark:text-amber-400">
                    {student.name} scores well in internal CS exams (88%) but only 62% in AMCAT Domain test. This gap suggests pattern-memorization rather than conceptual understanding. Recommend: practical coding assignments and peer problem-solving sessions.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-5">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
                  <Activity className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="font-semibold text-blue-900 dark:text-blue-300 text-sm mb-1">EWS Risk Score</div>
                  <div className="flex items-center gap-3 mt-2">
                    <div className="flex-1 h-2.5 rounded-full bg-blue-200 dark:bg-blue-900">
                      <div
                        className={`h-full rounded-full bg-gradient-to-r ${getStatusGradient(student.status)}`}
                        style={{ width: student.status === "safe" ? "15%" : student.status === "warning" ? "55%" : "82%" }}
                      />
                    </div>
                    <span className="text-sm font-bold text-blue-900 dark:text-blue-300">
                      {student.status === "safe" ? "Low" : student.status === "warning" ? "Medium" : "High"} Risk
                    </span>
                  </div>
                  <p className="text-xs text-blue-800 dark:text-blue-400 mt-2">
                    Based on attendance trend, CIE performance, and engagement signals. AMCAT data partially available.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl p-5">
              <div className="font-semibold text-slate-700 dark:text-slate-300 text-sm mb-1 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" /> AMCAT PDF Upload Status
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Student has not yet uploaded their AMCAT report. Scores shown above are extrapolated estimates.
              </p>
              <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-200 dark:bg-slate-700 text-xs text-slate-600 dark:text-slate-400 font-medium">
                ⏳ Pending upload
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Tab: Action Log */}
      {activeTab === "Action Log" && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
            <h3 className="font-bold text-slate-900 dark:text-white mb-6">Mentor Action History</h3>
            <div className="space-y-4">
              {mockActionLog.map((entry) => {
                const Icon = entry.icon;
                return (
                  <div key={entry.id} className="flex items-start gap-4">
                    <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${entry.color} flex items-center justify-center flex-shrink-0 shadow-lg`}>
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1 pb-4 border-b border-slate-100 dark:border-slate-800">
                      <div className="text-sm font-semibold text-slate-900 dark:text-white">{entry.text}</div>
                      <div className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{entry.time}</div>
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-4 text-center">All interactions with this student are recorded here for accountability.</p>
          </div>
        </motion.div>
      )}
    </FacultyLayout>
  );
}

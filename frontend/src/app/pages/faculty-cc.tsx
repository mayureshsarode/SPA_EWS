import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { FacultyLayout } from "../components/faculty-layout";
import { useAuth } from "../contexts/auth-context";
import {
  Users, CheckCircle, AlertTriangle, ShieldAlert, Upload, X,
  FileText, CalendarDays, Send, ChevronDown, Info,
} from "lucide-react";
import { AnimatedCounter } from "../components/animated-counter";
import { students } from "../data/mock-data";

// Division students (mocked as all mentees for this demo)
const divisionStudents = students.slice(0, 10);

type LeaveType = "DL" | "EXEMPTION";

interface SubmittedRequest {
  id: string;
  type: LeaveType;
  reason: string;
  dates: string;
  studentCount: number;
  status: "pending" | "approved" | "rejected";
}

const mockPastRequests: SubmittedRequest[] = [
  { id: "R001", type: "DL", reason: "IEEE Conference — Paper Presentation", dates: "Mar 15, 2026", studentCount: 3, status: "approved" },
  { id: "R002", type: "EXEMPTION", reason: "National Sports Tournament", dates: "Mar 5 – Mar 7, 2026", studentCount: 2, status: "pending" },
];

const statusStyle = {
  pending: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400",
  approved: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400",
  rejected: "bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400",
};

export function FacultyClassCoordinator() {
  const { user } = useAuth();
  const faculty = user as any;

  // DL Form state
  const [showForm, setShowForm] = useState(false);
  const [leaveType, setLeaveType] = useState<LeaveType>("DL");
  const [reason, setReason] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [fileName, setFileName] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [requests, setRequests] = useState(mockPastRequests);

  const toggleStudent = (id: string) =>
    setSelectedStudents((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );

  const selectAll = () =>
    setSelectedStudents(divisionStudents.map((s) => s.id));

  const clearAll = () => setSelectedStudents([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason || !dateFrom || selectedStudents.length === 0) return;
    const label = dateFrom === dateTo || !dateTo ? dateFrom : `${dateFrom} – ${dateTo}`;
    setRequests((prev) => [
      {
        id: `R${Date.now()}`,
        type: leaveType,
        reason,
        dates: label,
        studentCount: selectedStudents.length,
        status: "pending",
      },
      ...prev,
    ]);
    // Reset
    setReason("");
    setDateFrom("");
    setDateTo("");
    setSelectedStudents([]);
    setFileName("");
    setShowForm(false);
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 4000);
  };

  return (
    <FacultyLayout activeItem="Class Coordinator">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Class Coordinator Dashboard</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Division aggregate performance for {faculty?.department || "Computer Science"} · Sem 3 Div A
            </p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-semibold text-sm shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-shadow"
          >
            <CalendarDays className="w-4 h-4" />
            Request Duty Leave / Exemption
          </button>
        </div>

        {/* Success toast */}
        <AnimatePresence>
          {submitted && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center gap-3 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400"
            >
              <CheckCircle className="w-5 h-5 flex-shrink-0" />
              <span className="font-medium text-sm">Duty Leave request submitted · Pending HOD approval</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Division KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
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
                className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: i * 0.07 }}
              >
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center mb-3 shadow-lg text-white`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="text-3xl font-black text-slate-900 dark:text-white mb-1">
                  <AnimatedCounter target={stat.value} />
                </div>
                <div className="text-sm text-slate-500 dark:text-slate-400">{stat.label}</div>
              </motion.div>
            );
          })}
        </div>

        {/* Subject Aggregates */}
        <motion.div
          className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.3 }}
        >
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-5">Subject-wise Division Aggregates</h2>
          <div className="space-y-4">
            {[
              { subject: "DSA", code: "CS301", attendance: 82, marks: 75, faculty: "Prof. Jane Doe" },
              { subject: "Operating Systems", code: "CS302", attendance: 78, marks: 68, faculty: "Dr. John Smith" },
              { subject: "DBMS", code: "CS303", attendance: 86, marks: 80, faculty: "Prof. Sarah Wilson" },
              { subject: "Maths III", code: "MA301", attendance: 90, marks: 85, faculty: "Prof. Sarah Wilson" },
            ].map((s, i) => (
              <div key={i} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 flex flex-wrap gap-4 items-center">
                <div className="w-40">
                  <div className="font-semibold text-sm text-slate-900 dark:text-white">{s.subject}</div>
                  <div className="text-xs text-slate-400 dark:text-slate-500">{s.code} · {s.faculty}</div>
                </div>
                <div className="flex-1 min-w-48 space-y-2">
                  <div className="flex justify-between text-xs text-slate-500 mb-0.5">
                    <span>Attendance</span><span className="font-semibold text-slate-700 dark:text-slate-300">{s.attendance}%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-200 dark:bg-slate-700">
                    <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500" style={{ width: `${s.attendance}%` }} />
                  </div>
                  <div className="flex justify-between text-xs text-slate-500 mb-0.5">
                    <span>CIE Avg</span><span className="font-semibold text-slate-700 dark:text-slate-300">{s.marks}%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-200 dark:bg-slate-700">
                    <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-500" style={{ width: `${s.marks}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Past DL Requests */}
        <motion.div
          className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.4 }}
        >
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-5">My Leave Requests</h2>
          {requests.length === 0 ? (
            <div className="text-center py-10 text-slate-400">
              <CalendarDays className="w-10 h-10 mx-auto mb-3 opacity-40" />
              <p className="font-medium">No requests submitted yet</p>
              <p className="text-sm">Use the button above to submit a new Duty Leave request.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {requests.map((req) => (
                <div key={req.id} className="flex flex-wrap items-center gap-3 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm text-slate-900 dark:text-white">{req.reason}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{req.dates} · {req.studentCount} students</div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusStyle[req.status]}`}>
                    {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                  </span>
                  <span className={`px-2 py-0.5 rounded-md text-xs font-bold ${req.type === "DL" ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400" : "bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400"}`}>
                    {req.type === "DL" ? "Duty Leave" : "Exemption"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* DL Request Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowForm(false)} />

            {/* Modal */}
            <motion.div
              className="relative z-10 w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden"
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">Request Duty Leave / Exemption</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Will be sent to HOD for approval</p>
                </div>
                <button onClick={() => setShowForm(false)} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
                {/* Type toggle */}
                <div>
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 block">Leave Type</label>
                  <div className="flex gap-2">
                    {(["DL", "EXEMPTION"] as LeaveType[]).map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setLeaveType(t)}
                        className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${leaveType === t ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/20" : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"}`}
                      >
                        {t === "DL" ? "Duty Leave (DL)" : "Exemption"}
                      </button>
                    ))}
                  </div>
                  <p className="mt-2 text-xs text-slate-400 flex items-start gap-1.5">
                    <Info className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                    {leaveType === "DL"
                      ? "Duty Leave grants additional lectures to the tally (counts as attended). Use for institution-sanctioned events."
                      : "Exemption removes specific dates from the tally denominator. Use when classes were cancelled for official reasons."}
                  </p>
                </div>

                {/* Reason */}
                <div>
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 block">Event / Reason <span className="text-rose-500">*</span></label>
                  <input
                    type="text"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="e.g. NSS Regional Camp — Annual Outreach Drive"
                    required
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {/* Dates */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 block">From Date <span className="text-rose-500">*</span></label>
                    <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} required
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 block">To Date <span className="text-slate-400">(optional)</span></label>
                    <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} min={dateFrom}
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                  </div>
                </div>

                {/* Student Selector */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Select Affected Students <span className="text-rose-500">*</span></label>
                    <div className="flex gap-2">
                      <button type="button" onClick={selectAll} className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline">All</button>
                      <span className="text-slate-300 dark:text-slate-600">|</span>
                      <button type="button" onClick={clearAll} className="text-xs text-slate-500 hover:underline">Clear</button>
                    </div>
                  </div>
                  <div className="max-h-40 overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                    {divisionStudents.map((s) => (
                      <label key={s.id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-white dark:hover:bg-slate-800 cursor-pointer transition-colors">
                        <input
                          type="checkbox"
                          checked={selectedStudents.includes(s.id)}
                          onChange={() => toggleStudent(s.id)}
                          className="w-4 h-4 rounded accent-indigo-600"
                        />
                        <div className="flex-1 min-w-0">
                          <span className="text-sm font-medium text-slate-900 dark:text-white">{s.name}</span>
                          <span className="ml-2 text-xs text-slate-400">{s.id}</span>
                        </div>
                        {selectedStudents.includes(s.id) && <CheckCircle className="w-4 h-4 text-indigo-500 flex-shrink-0" />}
                      </label>
                    ))}
                  </div>
                  {selectedStudents.length > 0 && (
                    <p className="mt-1.5 text-xs text-indigo-600 dark:text-indigo-400 font-medium">{selectedStudents.length} student{selectedStudents.length !== 1 ? "s" : ""} selected</p>
                  )}
                </div>

                {/* Proof Upload */}
                <div>
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 block">Supporting Document <span className="text-slate-400">(PDF, recommended)</span></label>
                  <label className="flex items-center gap-3 px-4 py-3 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600 hover:border-indigo-400 cursor-pointer transition-colors bg-slate-50 dark:bg-slate-800/50">
                    <input type="file" accept="application/pdf,image/*" className="hidden" onChange={(e) => setFileName(e.target.files?.[0]?.name || "")} />
                    <Upload className="w-5 h-5 text-slate-400 flex-shrink-0" />
                    <span className={`text-sm ${fileName ? "text-slate-900 dark:text-white font-medium" : "text-slate-400"}`}>
                      {fileName || "Click to upload event letter or proof"}
                    </span>
                    {fileName && <button type="button" onClick={() => setFileName("")}><X className="w-4 h-4 text-slate-400 hover:text-rose-500" /></button>}
                  </label>
                </div>

                {/* Submit */}
                <div className="flex gap-3 pt-1">
                  <button type="button" onClick={() => setShowForm(false)}
                    className="flex-1 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                    Cancel
                  </button>
                  <button type="submit"
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-semibold text-sm shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/35 transition-shadow disabled:opacity-50"
                    disabled={!reason || !dateFrom || selectedStudents.length === 0}
                  >
                    <Send className="w-4 h-4" />
                    Submit to HOD
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </FacultyLayout>
  );
}

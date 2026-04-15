import { useState, useEffect } from "react";
import { Users, AlertTriangle, Filter, ChevronRight, FileText, Calendar, Plus, BookOpen, Loader2 } from "lucide-react";
import { FacultyLayout } from "../components/faculty-layout";
import { motion, AnimatePresence } from "motion/react";
import { api } from "../lib/api";

interface CCStat {
  id: string;
  courseCode: string;
  courseName: string;
  semester: number;
  division: string;
  faculty: string;
  avgAttendance: number;
  avgMarks: number;
  totalStudents: number;
  criticalCount: number;
  warningCount: number;
}

export function FacultyClassCoordinator() {
  const [activeTab, setActiveTab] = useState("overview");

  // Requests state
  const [requests, setRequests] = useState<any[]>([]);
  const [reqLoading, setReqLoading] = useState(true);

  // CC Stats state
  const [stats, setStats] = useState<CCStat[]>([]);
  const [statsLoading, setStatsLoading] = useState(true);

  // Leave form state
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [leaveForm, setLeaveForm] = useState({
    studentId: "",
    leaveType: "MEDICAL",
    reason: "",
  });
  const [submittingLeave, setSubmittingLeave] = useState(false);

  useEffect(() => {
    // Determine active requests
    api("/leaves/me/requests")
      .then((res) => setRequests(res.data))
      .catch(console.error)
      .finally(() => setReqLoading(false));

    // Get CC stats
    api("/faculty/me/cc-stats")
      .then((res) => setStats(res.data))
      .catch(console.error)
      .finally(() => setStatsLoading(false));
  }, []);

  const handleSubmitLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingLeave(true);
    try {
      await api("/leaves/request", {
        method: "POST",
        body: JSON.stringify(leaveForm),
      });
      setShowRequestModal(false);
      setLeaveForm({ studentId: "", leaveType: "MEDICAL", reason: "" });
      const res = await api("/leaves/me/requests");
      setRequests(res.data);
    } catch (err: any) {
      alert(err.message || "Failed to submit request");
    } finally {
      setSubmittingLeave(false);
    }
  };

  const pendingRequests = requests.filter(r => r.status === "PENDING").length;

  return (
    <FacultyLayout activeItem="Class Coordinator">
      <div className="space-y-6 max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Class Coordinator Workspace</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Manage cohort performance and approve leaves</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowRequestModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 border border-transparent hover:border-indigo-500 text-white rounded-xl font-medium shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              Apply Duty Leave
            </button>
          </div>
        </div>

        {/* Overview Stats */}
        {statsLoading ? (
           <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-indigo-500"/></div>
        ) : stats.length === 0 ? (
           <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 flex flex-col items-center justify-center text-center">
              <BookOpen className="w-12 h-12 text-slate-400 mb-4" />
              <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">Not Assigned</h3>
              <p className="text-slate-500 mt-2 max-w-md">You are not currently assigned as a Class Coordinator for any active divisions.</p>
           </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4"><Users className="w-5 h-5"/></div>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Cohort Students</p>
                <div className="text-2xl font-black mt-1">{stats.reduce((a,b)=>Math.max(a, b.totalStudents), 0)}</div>
              </motion.div>
              <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} transition={{delay:0.1}} className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4"><FileText className="w-5 h-5"/></div>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Pending Approvals</p>
                <div className="text-2xl font-black mt-1">{pendingRequests}</div>
              </motion.div>
              <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} transition={{delay:0.2}} className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4"><AlertTriangle className="w-5 h-5"/></div>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Total Warnings</p>
                <div className="text-2xl font-black mt-1">{stats.reduce((a,b)=>a+b.warningCount, 0)}</div>
              </motion.div>
              <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} transition={{delay:0.3}} className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-rose-200 dark:border-rose-900/50 bg-rose-50/50 dark:bg-rose-900/10 shadow-sm text-rose-900 dark:text-rose-400">
                <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center mb-4"><AlertTriangle className="w-5 h-5"/></div>
                <p className="text-sm font-medium">Total Criticals</p>
                <div className="text-2xl font-black mt-1">{stats.reduce((a,b)=>a+b.criticalCount, 0)}</div>
              </motion.div>
            </div>

            <div className="flex gap-4 border-b border-slate-200 dark:border-slate-800 mt-8 mb-6">
              {["overview", "approvals"].map(t => (
                <button
                  key={t}
                  onClick={() => setActiveTab(t)}
                  className={`pb-3 font-semibold px-2 transition-colors ${
                    activeTab === t 
                      ? "border-b-2 border-indigo-600 text-indigo-600 dark:text-indigo-400" 
                      : "border-b-2 border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                  }`}
                >
                  {t === "overview" ? "Subject Aggregates" : "Duty Leave Approvals"}
                </button>
              ))}
            </div>

            {activeTab === "overview" && (
              <motion.div initial={{opacity:0}} animate={{opacity:1}} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                 <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                       <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500">
                         <tr>
                           <th className="p-4 font-semibold">Subject</th>
                           <th className="p-4 font-semibold">Faculty</th>
                           <th className="p-4 font-semibold">Cohorts</th>
                           <th className="p-4 font-semibold text-right">Avg Attendance</th>
                           <th className="p-4 font-semibold text-right">Avg CIE Marks</th>
                           <th className="p-4 font-semibold text-center">Criticals</th>
                         </tr>
                       </thead>
                       <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                         {stats.map((row, i) => (
                           <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                              <td className="p-4">
                                <div className="font-bold text-slate-900 dark:text-white">{row.courseName}</div>
                                <div className="text-xs text-slate-500">{row.courseCode}</div>
                              </td>
                              <td className="p-4 font-medium text-slate-700 dark:text-slate-300">{row.faculty}</td>
                              <td className="p-4 text-xs font-semibold uppercase text-slate-500">SEM {row.semester} / {row.division}</td>
                              <td className="p-4 text-right font-bold text-slate-900 dark:text-white">{row.avgAttendance}%</td>
                              <td className="p-4 text-right font-bold text-slate-900 dark:text-white">{row.avgMarks}/100</td>
                              <td className="p-4 text-center">
                                {row.criticalCount > 0 ? (
                                  <span className="inline-flex py-1 px-2.5 rounded-full text-xs font-bold bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400">
                                    {row.criticalCount} students
                                  </span>
                                ) : (
                                  <span className="text-slate-400 font-medium">-</span>
                                )}
                              </td>
                           </tr>
                         ))}
                       </tbody>
                    </table>
                 </div>
              </motion.div>
            )}

            {activeTab === "approvals" && (
              <motion.div initial={{opacity:0}} animate={{opacity:1}}>
                <div className="flex gap-4 mb-4">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700">Pending ({pendingRequests})</span>
                </div>
                {reqLoading ? (
                  <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-indigo-500"/></div>
                ) : (
                  <div className="space-y-4">
                    {requests.map((req, i) => (
                      <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row gap-4 sm:items-center">
                         <div className="bg-indigo-50 dark:bg-indigo-900/30 w-12 h-12 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                            <Calendar className="w-6 h-6"/>
                         </div>
                         <div className="flex-1">
                            <h4 className="font-bold text-slate-900 dark:text-white mb-1">{req.leaveType} Leave</h4>
                            <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">{req.reason}</p>
                            <div className="flex items-center gap-4 text-xs font-medium uppercase text-slate-500">
                               <span className="flex gap-1 items-center"><Users className="w-3.5 h-3.5"/> Student: {req.studentId}</span>
                               <span className={`px-2 py-0.5 rounded-md ${req.status==='PENDING'?'bg-amber-100 text-amber-700':req.status==='APPROVED'?'bg-emerald-100 text-emerald-700':'bg-rose-100 text-rose-700'}`}>{req.status}</span>
                            </div>
                         </div>
                      </div>
                    ))}
                    {requests.length === 0 && <p className="text-center text-slate-500 p-8">No leave requests found.</p>}
                  </div>
                )}
              </motion.div>
            )}
          </>
        )}
      </div>

      <AnimatePresence>
        {showRequestModal && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60" onClick={() => setShowRequestModal(false)} />
            <motion.form 
              onSubmit={handleSubmitLeave}
              initial={{scale: 0.95}} animate={{scale: 1}}
              className="relative bg-white dark:bg-slate-900 w-full max-w-sm rounded-2xl p-6 shadow-xl"
            >
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Request Duty Leave</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Student ID (UUID)</label>
                  <input required className="w-full border dark:border-slate-700 bg-transparent rounded-lg p-2.5" value={leaveForm.studentId} onChange={e=>setLeaveForm({...leaveForm, studentId:e.target.value})} placeholder="e.g. 1234-5678..."/>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Leave Type</label>
                  <select className="w-full border dark:border-slate-700 bg-transparent rounded-lg p-2.5" value={leaveForm.leaveType} onChange={e=>setLeaveForm({...leaveForm, leaveType:e.target.value})}>
                    <option value="MEDICAL">Medical</option><option value="COCURRICULAR">Co-curricular / Sports</option><option value="EMERGENCY">Emergency</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Reason</label>
                  <textarea required rows={3} className="w-full border dark:border-slate-700 bg-transparent rounded-lg p-2.5 resize-none" value={leaveForm.reason} onChange={e=>setLeaveForm({...leaveForm, reason:e.target.value})} placeholder="Explain reason..."/>
                </div>
              </div>
              <div className="flex gap-3 justify-end mt-6">
                 <button type="button" onClick={()=>setShowRequestModal(false)} className="px-4 py-2 border dark:border-slate-700 rounded-lg text-sm font-bold">Cancel</button>
                 <button type="submit" disabled={submittingLeave} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold flex items-center gap-2">
                    {submittingLeave && <Loader2 className="w-4 h-4 animate-spin"/>} Submit
                 </button>
              </div>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>
    </FacultyLayout>
  );
}

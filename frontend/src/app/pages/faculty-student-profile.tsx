import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import {
  ChevronLeft, Loader2, User, Phone, MapPin, Building, Calendar, Bookmark,
  AlertTriangle, CheckCircle, BrainCircuit, LineChart, FileText, Download, TrendingUp, Info, Activity, Clock
} from "lucide-react";
import { FacultyLayout } from "../components/faculty-layout";
import { api } from "../lib/api";

export function FacultyStudentProfile() {
  const { studentId } = useParams<{ studentId: string }>();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  // Action log state
  const [logs, setLogs] = useState<any[]>([]);
  const [showLogModal, setShowLogModal] = useState(false);
  const [logForm, setLogForm] = useState({ action: "COUNSELLING_SESSION", notes: "", followUpDate: "" });
  const [savingLog, setSavingLog] = useState(false);

  useEffect(() => {
    if (!studentId) return;
    setLoading(true);
    Promise.all([
      api(`/faculty/students/${studentId}`).then(res => setProfile(res.data)),
      api(`/faculty/students/${studentId}/action-log`).then(res => setLogs(res.data))
    ]).catch(console.error).finally(() => setLoading(false));
  }, [studentId]);

  const handleSaveLog = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingLog(true);
    try {
      await api(`/faculty/students/${studentId}/action-log`, { method: "POST", body: JSON.stringify(logForm) });
      setShowLogModal(false);
      setLogForm({ action: "COUNSELLING_SESSION", notes: "", followUpDate: "" });
      const logsRes = await api(`/faculty/students/${studentId}/action-log`);
      setLogs(logsRes.data);
    } catch (err: any) { alert(err.message); }
    finally { setSavingLog(false); }
  }

  if (loading) {
    return (
      <FacultyLayout activeItem="Dashboard">
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        </div>
      </FacultyLayout>
    );
  }

  if (!profile) return <FacultyLayout activeItem="Dashboard"><p>Student not found</p></FacultyLayout>;

  return (
    <FacultyLayout activeItem="Dashboard">
      <div className="space-y-6 max-w-6xl mx-auto">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
          <ChevronLeft className="w-4 h-4" /> Back
        </button>

        {/* Profile Header */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm flex flex-col md:flex-row gap-8 items-start relative overflow-hidden">
          <div className={`absolute top-0 right-0 w-64 h-64 blur-3xl -z-10 opacity-20 bg-gradient-to-br ${
             profile.status === "critical" ? "from-rose-500 to-red-500" :
             profile.status === "warning" ? "from-amber-500 to-orange-500" :
             "from-emerald-500 to-teal-500"
          }`} />

          <div className="flex-shrink-0 flex flex-col items-center gap-4">
            <div className="w-32 h-32 rounded-full border-4 border-white dark:border-slate-800 shadow-xl overflow-hidden bg-slate-100 dark:bg-slate-800">
               <img src={`https://ui-avatars.com/api/?name=${profile.name}&size=256&background=random`} alt={profile.name} className="w-full h-full object-cover"/>
            </div>
            <div className={`px-4 py-1.5 rounded-full text-sm font-bold shadow-sm ${
               profile.status === "critical" ? "bg-rose-100 text-rose-700" :
               profile.status === "warning" ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"
            }`}>
               {profile.status.toUpperCase()}
            </div>
          </div>

          <div className="flex-1 space-y-4">
            <div>
              <h1 className="text-3xl font-black text-slate-900 dark:text-white">{profile.name}</h1>
              <p className="text-slate-500 dark:text-slate-400 font-medium">PRN: {profile.prnNumber} • {profile.email}</p>
            </div>
            <div className="flex flex-wrap gap-4 text-sm">
              <span className="flex items-center gap-2 text-slate-600 dark:text-slate-300"><Building className="w-4 h-4"/> {profile.department}</span>
              <span className="flex items-center gap-2 text-slate-600 dark:text-slate-300"><Bookmark className="w-4 h-4"/> Sem {profile.semester} / Div {profile.division}</span>
              <span className="flex items-center gap-2 text-slate-600 dark:text-slate-300"><User className="w-4 h-4"/> Mentor: {profile.mentor?.name || "Unassigned"}</span>
            </div>
          </div>

          <div className="flex-shrink-0 grid grid-cols-2 gap-4">
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 text-center border border-slate-100 dark:border-slate-700">
               <p className="text-xs text-slate-500 dark:text-slate-400 font-bold mb-1">ATTENDANCE</p>
               <p className="text-2xl font-black text-slate-900 dark:text-white">{profile.attendance}%</p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 text-center border border-slate-100 dark:border-slate-700">
               <p className="text-xs text-slate-500 dark:text-slate-400 font-bold mb-1">CIE MARKS</p>
               <p className="text-2xl font-black text-slate-900 dark:text-white">{profile.internalMarks}/100</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 border-b border-slate-200 dark:border-slate-800">
          {[
            { id: "overview", label: "Academic Overview", icon: LineChart },
            { id: "ai-insights", label: "AI Insights", icon: BrainCircuit },
            { id: "action-log", label: "Action Log", icon: Clock },
            { id: "assessments", label: "External Assessments", icon: FileText }
          ].map(t => {
            const Icon = t.icon;
            return (
              <button key={t.id} onClick={() => setActiveTab(t.id)} className={`pb-3 font-semibold px-4 flex items-center gap-2 border-b-2 transition-colors ${activeTab === t.id ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
                <Icon className="w-4 h-4"/> {t.label}
              </button>
            )
          })}
        </div>

        {/* Tab Content */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 gap-6">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
               <h3 className="text-lg font-bold mb-4">Course Performance</h3>
               <div className="overflow-x-auto">
                 <table className="w-full text-left text-sm">
                   <thead className="text-slate-500 border-b dark:border-slate-800"><tr><th className="pb-3">Course</th><th className="pb-3">Faculty</th><th className="pb-3 text-right">Attendance</th><th className="pb-3 text-right">Marks</th></tr></thead>
                   <tbody className="divide-y dark:divide-slate-800">
                      {profile.subjects?.map((s: any, i: number) => (
                        <tr key={i}>
                          <td className="py-4 font-bold">{s.name} <span className="text-xs text-slate-400 block font-normal">{s.code}</span></td>
                          <td className="py-4 text-slate-600 dark:text-slate-400">{s.faculty}</td>
                          <td className="py-4 text-right font-medium text-slate-900 dark:text-white">{s.attendance}%</td>
                          <td className="py-4 text-right font-medium text-slate-900 dark:text-white">{s.cieMarks ?? "N/A"}</td>
                        </tr>
                      ))}
                   </tbody>
                 </table>
               </div>
            </div>
          </div>
        )}

        {activeTab === "action-log" && (
           <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                 <h3 className="text-lg font-bold">Counselling & Action Log</h3>
                 <button onClick={()=>setShowLogModal(true)} className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold flex gap-2 items-center text-sm"><FileText className="w-4 h-4"/> Add Note</button>
              </div>
              <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 dark:before:via-slate-800 before:to-transparent">
                 {logs.map((log, idx) => (
                   <div key={log.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                     <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white dark:border-slate-900 bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                        <Activity className="w-4 h-4"/>
                     </div>
                     <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm">
                        <div className="flex items-center justify-between mb-1">
                           <span className="font-bold text-slate-900 dark:text-white text-sm">{log.action.replace("_", " ")}</span>
                           <span className="text-xs text-slate-500 font-medium">{new Date(log.createdAt).toLocaleDateString()}</span>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-300">{log.details.notes}</p>
                        {log.details.followUpDate && <p className="text-xs text-indigo-600 font-bold mt-2">Follow up: {log.details.followUpDate}</p>}
                        <p className="text-xs text-slate-400 mt-2 text-right">- {log.user.name}</p>
                     </div>
                   </div>
                 ))}
                 {logs.length === 0 && <p className="text-center text-slate-500 py-8 relative z-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">No action logs found for this student.</p>}
              </div>
           </div>
        )}

        {activeTab === "ai-insights" && (
           <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 rounded-2xl border border-indigo-500/20 p-8 shadow-2xl relative overflow-hidden">
             <div className="absolute top-0 right-0 p-8 opacity-10"><BrainCircuit className="w-48 h-48"/></div>
             <div className="relative z-10 flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-indigo-500 text-white flex items-center justify-center shadow-lg shadow-indigo-500/50"><BrainCircuit className="w-6 h-6"/></div>
                <h3 className="text-xl font-bold text-white">AI Assistant Insights</h3>
             </div>
             
             <div className="space-y-6">
                <div className="bg-white/5 backdrop-blur-md rounded-xl p-5 border border-white/10">
                   <h4 className="text-indigo-300 font-bold text-sm mb-2 uppercase tracking-wider">Predictive Analysis</h4>
                   <p className="text-white text-base leading-relaxed">
                      Based on current velocity, {profile.name} is tracking to fall below the 60% critical attendance threshold within 14 days if the current absentee rate continues.
                   </p>
                </div>
                <div className="bg-white/5 backdrop-blur-md rounded-xl p-5 border border-white/10">
                   <h4 className="text-indigo-300 font-bold text-sm mb-2 uppercase tracking-wider">Root Cause Hypothesis</h4>
                   <ul className="text-white text-base leading-relaxed space-y-2 list-disc list-inside">
                      <li>Commute profile indicates 2+ hours daily travel.</li>
                      <li>Drops correlate heavily with morning 8AM sessions (45% miss rate).</li>
                      <li>Historical external assessments show strong baseline aptitude (TCS NQT: 82nd percentile), suggesting absences are circumstantial, not academic struggle.</li>
                   </ul>
                </div>
                <div className="bg-white/5 backdrop-blur-md rounded-xl p-5 border border-white/10">
                   <h4 className="text-indigo-300 font-bold text-sm mb-2 uppercase tracking-wider">Recommended Action</h4>
                   <p className="text-white text-base leading-relaxed">
                      Schedule a counselling session focusing on morning transit logistics. Ensure student is aware of library access prior to 8AM as an incentive to arrive early.
                   </p>
                </div>
             </div>
           </div>
        )}
      </div>

      <AnimatePresence>
        {showLogModal && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4">
             <div className="absolute inset-0 bg-slate-900/60" onClick={()=>setShowLogModal(false)}></div>
             <motion.form onSubmit={handleSaveLog} className="relative bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl p-6 space-y-4">
               <h2 className="text-xl font-bold mb-4">Add Action Note</h2>
               
               <div>
                 <label className="block text-sm font-bold mb-1">Action Type</label>
                 <select className="w-full border p-2 rounded-lg" value={logForm.action} onChange={e=>setLogForm({...logForm, action:e.target.value})}>
                    <option value="COUNSELLING_SESSION">Counselling Session</option>
                    <option value="PHONE_CALL">Phone Call Home</option>
                    <option value="WARNING_LETTER_SENT">Warning Letter Sent</option>
                    <option value="MENTORING_MEETING">Mentoring Meeting</option>
                 </select>
               </div>
               
               <div>
                 <label className="block text-sm font-bold mb-1">Notes</label>
                 <textarea required rows={4} className="w-full border p-2 rounded-lg resize-none" value={logForm.notes} onChange={e=>setLogForm({...logForm, notes:e.target.value})} placeholder="Session details..."></textarea>
               </div>

               <div>
                 <label className="block text-sm font-bold mb-1">Follow up date (Optional)</label>
                 <input type="date" className="w-full border p-2 rounded-lg" value={logForm.followUpDate} onChange={e=>setLogForm({...logForm, followUpDate:e.target.value})}/>
               </div>

               <div className="flex justify-end gap-3 mt-6">
                 <button type="button" onClick={()=>setShowLogModal(false)} className="px-4 py-2 border rounded-lg">Cancel</button>
                 <button type="submit" disabled={savingLog} className="px-4 py-2 bg-indigo-600 text-white rounded-lg">{savingLog?"Saving...":"Save Note"}</button>
               </div>
             </motion.form>
          </motion.div>
        )}
      </AnimatePresence>
    </FacultyLayout>
  )
}

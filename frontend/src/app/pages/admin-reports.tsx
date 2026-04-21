import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { FileText, Download, Filter, Calendar, BarChart3, Users, BookOpen, Clock, Loader2, Plus, X, Search } from "lucide-react";
import { AdminLayout } from "../components/admin-layout";
import { api } from "../lib/api";

type Report = {
  id: string;
  title: string;
  type: string;
  date: string;
  generatedBy: string;
  status: "COMPLETED" | "PENDING" | "FAILED";
  fileSize?: string;
};

export function AdminReports() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");

  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [genForm, setGenForm] = useState({ type: "SUMMARY" });

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = () => {
    api("/admin/reports")
      .then(res => setReports(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setGenerating(true);
    try {
      await api("/admin/reports/generate", {
        method: "POST",
        body: JSON.stringify(genForm),
      });
      setShowGenerateModal(false);
      fetchReports();
    } catch (err: any) {
      alert("Failed to generate report: " + err.message);
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = (type: string) => {
    // This connects to the CSV export endpoints from P1
    const endpoint = type === 'USERS' ? '/admin/export/users' : '/admin/export/courses';
    const token = localStorage.getItem("token");
    fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}${endpoint}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(r => r.text())
    .then(t => {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(new Blob([t]));
      a.download = `${type.toLowerCase()}_export.csv`;
      a.click();
    });
  };

  const filteredReports = reports.filter(r => {
    const matchesSearch = r.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === "ALL" || r.type === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <AdminLayout activeItem="Reports">
      <div className="space-y-6 max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Reports & Exports</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Generate and schedule system-wide data exports</p>
          </div>
          <div className="flex gap-3">
             <button onClick={() => setShowGenerateModal(true)} className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-medium flex gap-2 items-center hover:bg-indigo-700 transition">
               <Plus className="w-5 h-5"/> Generate Report
             </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                 <input 
                   type="text" 
                   placeholder="Search reports..." 
                   className="w-full pl-9 pr-4 py-2 border rounded-xl dark:bg-slate-800 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                   value={searchQuery}
                   onChange={e => setSearchQuery(e.target.value)}
                 />
              </div>
              <select 
                className="px-4 py-2 border rounded-xl dark:bg-slate-800 dark:border-slate-700 focus:outline-none"
                value={typeFilter}
                onChange={e => setTypeFilter(e.target.value)}
              >
                 <option value="ALL">All Types</option>
                 <option value="SUMMARY">Summary Reports</option>
                 <option value="USERS">User Exports</option>
                 <option value="COURSES">Course Exports</option>
              </select>
            </div>

            <div className="bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
               {loading ? <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-indigo-500" /></div> : (
                  <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-slate-50 dark:bg-slate-800/50 border-b dark:border-slate-800 uppercase text-xs font-semibold text-slate-500">
                      <tr>
                         <th className="p-4">Report Details</th>
                         <th className="p-4">Generated By</th>
                         <th className="p-4">Status</th>
                         <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y dark:divide-slate-800">
                       {filteredReports.map(r => (
                         <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                           <td className="p-4">
                              <div className="flex items-center gap-3">
                                 <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                                   <FileText className="w-5 h-5"/>
                                 </div>
                                 <div>
                                    <div className="font-bold text-slate-900 dark:text-white">{r.title}</div>
                                    <div className="text-xs text-slate-500 flex items-center gap-2">
                                       <span className="font-semibold text-slate-600 dark:text-slate-400">{r.type}</span>
                                       <span>•</span>
                                       {new Date(r.date).toLocaleString()}
                                    </div>
                                 </div>
                              </div>
                           </td>
                           <td className="p-4 text-slate-600 dark:text-slate-400">{r.generatedBy}</td>
                           <td className="p-4">
                              <span className={`px-2 py-1 flex w-fit items-center gap-1.5 rounded-full text-xs font-bold ${
                                r.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                              }`}>
                                {r.status === 'COMPLETED' && <CheckCircle className="w-3 h-3" />}
                                {r.status}
                              </span>
                           </td>
                           <td className="p-4 text-right">
                              <button disabled className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 font-medium text-xs flex items-center gap-1.5 ml-auto hover:bg-slate-100 dark:hover:bg-slate-800 transition">
                                <Download className="w-3 h-3" /> {r.fileSize}
                              </button>
                           </td>
                         </tr>
                       ))}
                       {filteredReports.length === 0 && (
                          <tr><td colSpan={4} className="p-8 text-center text-slate-500">No reports generated yet.</td></tr>
                       )}
                    </tbody>
                  </table>
               )}
            </div>
          </div>

          <div className="space-y-6">
            <motion.div initial={{opacity:0, scale:0.95}} animate={{opacity:1, scale:1}} className="bg-gradient-to-br from-slate-800 to-slate-950 rounded-2xl p-6 text-white shadow-xl">
               <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><Download className="w-5 h-5" /> Quick Exports</h3>
               <div className="space-y-3">
                  <button onClick={() => handleDownload('USERS')} className="w-full flex items-center justify-between p-3 rounded-xl bg-white/10 hover:bg-white/20 transition group">
                     <div className="flex items-center gap-3">
                        <Users className="w-5 h-5 text-indigo-300" />
                        <div className="text-left">
                           <p className="font-bold text-sm">All Users CSV</p>
                           <p className="text-xs text-slate-300">Export student & faculty roster</p>
                        </div>
                     </div>
                     <Download className="w-4 h-4 opacity-50 group-hover:opacity-100 transition" />
                  </button>
                  <button onClick={() => handleDownload('COURSES')} className="w-full flex items-center justify-between p-3 rounded-xl bg-white/10 hover:bg-white/20 transition group">
                     <div className="flex items-center gap-3">
                        <BookOpen className="w-5 h-5 text-emerald-300" />
                        <div className="text-left">
                           <p className="font-bold text-sm">All Courses CSV</p>
                           <p className="text-xs text-slate-300">Export curriculum data</p>
                        </div>
                     </div>
                     <Download className="w-4 h-4 opacity-50 group-hover:opacity-100 transition" />
                  </button>
               </div>
            </motion.div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
               <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4">Storage Info</h3>
               <div className="space-y-2">
                 <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Reports Archived</span>
                    <span className="font-bold text-slate-900 dark:text-white">{reports.length}</span>
                 </div>
                 <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
                    <div className="bg-indigo-500 h-2 rounded-full" style={{ width: '15%' }}></div>
                 </div>
                 <p className="text-xs text-slate-500 mt-2">15% of free tier storage used.</p>
               </div>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showGenerateModal && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4">
             <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowGenerateModal(false)}></div>
             <motion.form onSubmit={handleGenerate} className="relative z-10 w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-xl overflow-hidden">
                <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                   <h2 className="text-lg font-bold">Generate System Report</h2>
                   <button type="button" onClick={() => setShowGenerateModal(false)}><X className="w-5 h-5 opacity-60" /></button>
                </div>
                <div className="p-6 space-y-4">
                   <div>
                      <label className="block text-sm font-bold mb-2">Report Type</label>
                      <select className="w-full px-4 py-2.5 border rounded-xl dark:bg-slate-800 dark:border-slate-700 outline-none focus:ring-2 focus:ring-indigo-500" value={genForm.type} onChange={e => setGenForm({ type: e.target.value })}>
                         <option value="SUMMARY">Executive Summary Report (PDF)</option>
                         <option value="ACADEMIC">Academic Defaulters Analysis (PDF)</option>
                         <option value="OPERATIONAL">System Operational Log (CSV)</option>
                      </select>
                   </div>
                   <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-800 dark:text-indigo-300 rounded-xl text-sm leading-relaxed">
                      This will queue a background job. The report will appear in your history list once generation completes.
                   </div>
                </div>
                <div className="p-6 pt-0 border-slate-200 dark:border-slate-800 flex justify-end">
                   <button type="submit" disabled={generating} className="w-full px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition flex items-center justify-center gap-2">
                      {generating && <Loader2 className="w-4 h-4 animate-spin" />}
                      {generating ? "Generating..." : "Generate Report"}
                   </button>
                </div>
             </motion.form>
          </motion.div>
        )}
      </AnimatePresence>
    </AdminLayout>
  )
}

function CheckCircle(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
      <polyline points="22 4 12 14.01 9 11.01"></polyline>
    </svg>
  );
}

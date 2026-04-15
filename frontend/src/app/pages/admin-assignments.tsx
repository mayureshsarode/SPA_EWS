import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Users, GraduationCap, ChevronRight, Loader2, Save, X, BookOpen } from "lucide-react";
import { AdminLayout } from "../components/admin-layout";
import { api } from "../lib/api";

export function AdminAssignments() {
  const [users, setUsers] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [activeTab, setActiveTab] = useState("mentors");
  const [search, setSearch] = useState("");

  const [saving, setSaving] = useState(false);
  const [showMentorModal, setShowMentorModal] = useState(false);
  const [showCCModal, setShowCCModal] = useState(false);

  const [mentorForm, setMentorForm] = useState({ studentUserId: "", mentorUserId: "" });
  const [ccForm, setCCForm] = useState({ facultyUserId: "", departmentId: "", semester: 3, division: "A" });

  const fetchData = () => {
    Promise.all([
      api("/admin/users"),
      api("/admin/departments")
    ]).then(([uRes, dRes]) => {
      setUsers(uRes.data);
      setDepartments(dRes.data);
      if(!ccForm.departmentId && dRes.data.length > 0) setCCForm(prev => ({...prev, departmentId: dRes.data[0].id}));
    }).catch(console.error).finally(()=>setLoading(false));
  };

  useEffect(() => { fetchData() }, []);

  const students = users.filter(u => u.role === "STUDENT");
  const faculties = users.filter(u => u.role === "FACULTY");

  const assignMentor = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api("/admin/assignments/mentor", { method: "PUT", body: JSON.stringify(mentorForm) });
      setShowMentorModal(false);
      fetchData();
    } catch(err: any) { alert(err.message); }
    finally { setSaving(false); }
  }

  const assignCC = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api("/admin/assignments/cc", { method: "PUT", body: JSON.stringify(ccForm) });
      setShowCCModal(false);
      fetchData();
    } catch (err: any) { alert(err.message); }
    finally { setSaving(false); }
  }

  return (
    <AdminLayout activeItem="Assignments">
      <div className="space-y-6 max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div><h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Assignments Engine</h1></div>
        </div>

        <div className="flex gap-4 border-b border-slate-200 dark:border-slate-800">
           <button onClick={()=>setActiveTab("mentors")} className={`pb-3 font-semibold px-2 border-b-2 transition-colors ${activeTab==="mentors"?'border-indigo-600 text-indigo-600': 'border-transparent text-slate-500'}`}>Mentor Allocation</button>
           <button onClick={()=>setActiveTab("cc")} className={`pb-3 font-semibold px-2 border-b-2 transition-colors ${activeTab==="cc"?'border-indigo-600 text-indigo-600': 'border-transparent text-slate-500'}`}>Class Coordinators</button>
        </div>

        {loading ? <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-indigo-500"/></div> : (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
             {activeTab === "mentors" && (
                <div>
                   <div className="flex justify-between mb-4">
                     <input type="text" placeholder="Search students..." value={search} onChange={e=>setSearch(e.target.value)} className="px-4 py-2 border rounded-xl w-64"/>
                     <button onClick={()=>{setMentorForm({studentUserId: students[0]?.id||"", mentorUserId: faculties[0]?.id||""}); setShowMentorModal(true);}} className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold">Assign Mentor</button>
                   </div>
                   <table className="w-full text-left text-sm">
                      <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500"><tr><th className="p-3">Student</th><th className="p-3">PRN</th><th className="p-3">Current Mentor ID</th></tr></thead>
                      <tbody className="divide-y dark:divide-slate-800">
                         {students.filter(s=>s.name.toLowerCase().includes(search.toLowerCase())).slice(0,20).map(s => (
                           <tr key={s.id}><td className="p-3 font-bold">{s.name}</td><td className="p-3">{s.studentProfile?.prnNumber}</td><td className="p-3 text-slate-500">{s.studentProfile?.mentorId || "Unassigned"}</td></tr>
                         ))}
                      </tbody>
                   </table>
                </div>
             )}
             {activeTab === "cc" && (
                <div>
                   <div className="flex justify-between mb-4">
                     <div></div>
                     <button onClick={()=>{setCCForm({...ccForm, facultyUserId: faculties[0]?.id||""}); setShowCCModal(true);}} className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold">Assign Class Coordinator</button>
                   </div>
                   <div className="text-center p-12 text-slate-500">
                       <Users className="w-12 h-12 mx-auto mb-2 opacity-50"/>
                       <p>Class coordinators are managed by Division and Semester.</p>
                       <p className="text-xs mt-1">Click "Assign Class Coordinator" to set a faculty member as the CC.</p>
                   </div>
                </div>
             )}
          </div>
        )}
      </div>

      <AnimatePresence>
        {showMentorModal && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60" onClick={()=>setShowMentorModal(false)}></div>
            <form onSubmit={assignMentor} className="relative bg-white dark:bg-slate-900 w-full max-w-sm rounded-2xl p-6">
               <h2 className="text-lg font-bold mb-4">Allocate Mentor</h2>
               <div className="space-y-4">
                 <div><label className="block text-sm font-bold mb-1">Student</label><select className="w-full border p-2 rounded-lg" value={mentorForm.studentUserId} onChange={e=>setMentorForm({...mentorForm, studentUserId: e.target.value})}><option value="">Select Student</option>{students.map(s=><option key={s.id} value={s.id}>{s.name} ({s.studentProfile?.prnNumber})</option>)}</select></div>
                 <div><label className="block text-sm font-bold mb-1">Faculty Mentor</label><select className="w-full border p-2 rounded-lg" value={mentorForm.mentorUserId} onChange={e=>setMentorForm({...mentorForm, mentorUserId: e.target.value})}><option value="">Select Faculty</option>{faculties.map(f=><option key={f.id} value={f.id}>{f.name}</option>)}</select></div>
               </div>
               <button type="submit" disabled={saving} className="w-full mt-6 bg-indigo-600 text-white p-2 rounded-xl font-bold">{saving?"Saving...":"Save Assignment"}</button>
            </form>
          </motion.div>
        )}
        {showCCModal && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60" onClick={()=>setShowCCModal(false)}></div>
            <form onSubmit={assignCC} className="relative bg-white dark:bg-slate-900 w-full max-w-sm rounded-2xl p-6">
               <h2 className="text-lg font-bold mb-4">Assign Class Coordinator</h2>
               <div className="space-y-4">
                 <div><label className="block text-sm font-bold mb-1">Faculty</label><select className="w-full border p-2 rounded-lg" value={ccForm.facultyUserId} onChange={e=>setCCForm({...ccForm, facultyUserId: e.target.value})}><option value="">Select Faculty</option>{faculties.map(f=><option key={f.id} value={f.id}>{f.name}</option>)}</select></div>
                 <div><label className="block text-sm font-bold mb-1">Department</label><select className="w-full border p-2 rounded-lg" value={ccForm.departmentId} onChange={e=>setCCForm({...ccForm, departmentId: e.target.value})}>{departments.map(d=><option key={d.id} value={d.id}>{d.name}</option>)}</select></div>
                 <div className="grid grid-cols-2 gap-4">
                   <div><label className="block text-sm font-bold mb-1">Semester</label><input type="number" min="1" max="8" className="w-full border p-2 rounded-lg" value={ccForm.semester} onChange={e=>setCCForm({...ccForm, semester: parseInt(e.target.value)})}/></div>
                   <div><label className="block text-sm font-bold mb-1">Division</label><input type="text" className="w-full border p-2 rounded-lg uppercase" maxLength={2} value={ccForm.division} onChange={e=>setCCForm({...ccForm, division: e.target.value.toUpperCase()})}/></div>
                 </div>
               </div>
               <button type="submit" disabled={saving} className="w-full mt-6 bg-indigo-600 text-white p-2 rounded-xl font-bold">{saving?"Saving...":"Save Assignment"}</button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </AdminLayout>
  )
}

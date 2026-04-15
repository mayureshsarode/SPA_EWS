import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Users, Search, Filter, Plus, Edit2, Trash2, Shield, MoreVertical, X, Save, Download } from "lucide-react";
import { AdminLayout } from "../components/admin-layout";
import { api } from "../lib/api";

type Role = "STUDENT" | "FACULTY" | "ADMIN";

interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  department: string;
  departmentId: string;
  studentProfile?: { prnNumber: string; currentSemester: number; division: string };
  facultyProfile?: { designation: string; adminRole: string };
}

interface Dept { id: string; name: string }

export function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [departments, setDepartments] = useState<Dept[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [saving, setSaving] = useState(false);
  
  const [form, setForm] = useState({
    name: "", email: "", password: "", role: "STUDENT" as Role, departmentId: "",
    prnNumber: "", currentSemester: 3, division: "A", designation: "Assistant Professor"
  });

  const fetchUsers = () => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (roleFilter !== "all") params.set("role", roleFilter);
    
    api(`/admin/users?${params.toString()}`)
      .then((res) => setUsers(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchUsers();
    api("/admin/departments").then(res => setDepartments(res.data)).catch(console.error);
  }, []);

  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); fetchUsers(); };
  
  const handleExport = () => {
    const token = localStorage.getItem("token");
    fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}/admin/export/users`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(r => r.text()).then(t => {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(new Blob([t]));
      a.download = "users.csv";
      a.click();
    });
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete user ${name}? This action cannot be undone.`)) return;
    try {
      await api(`/admin/users/${id}`, { method: "DELETE" });
      fetchUsers();
    } catch (err: any) { alert(err.message); }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingUser) {
        await api(`/admin/users/${editingUser.id}`, { method: "PUT", body: JSON.stringify(form) });
      } else {
        await api("/admin/users", { method: "POST", body: JSON.stringify(form) });
      }
      setShowModal(false);
      fetchUsers();
    } catch(err: any) { alert(err.message); }
    finally { setSaving(false); }
  }

  return (
    <AdminLayout activeItem="Users">
      <div className="space-y-6 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div><h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">User Management</h1></div>
          <div className="flex gap-3">
             <button onClick={handleExport} className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-medium flex gap-2 items-center"><Download size={18}/> Export CSV</button>
             <button onClick={() => { setEditingUser(null); setForm({...form, password: "password123"}); setShowModal(true); }} className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-medium flex gap-2 items-center"><Plus size={18}/> Add User</button>
          </div>
        </div>

        <form onSubmit={handleSearch} className="flex gap-4 mb-6">
          <input type="text" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search name or email..." className="flex-1 px-4 py-2 bg-white dark:bg-slate-800 border dark:border-slate-700 rounded-xl" />
          <select value={roleFilter} onChange={e=>setRoleFilter(e.target.value)} className="w-32 px-4 py-2 bg-white dark:bg-slate-800 border dark:border-slate-700 rounded-xl">
             <option value="all">All Roles</option><option value="student">Students</option><option value="faculty">Faculty</option><option value="admin">Admins</option>
          </select>
          <button type="submit" className="px-4 py-2 bg-slate-900 text-white rounded-xl">Search</button>
        </form>

        <div className="bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
           <div className="overflow-x-auto">
             <table className="w-full text-left text-sm whitespace-nowrap">
               <thead className="bg-slate-50 dark:bg-slate-800/50 border-b dark:border-slate-800 uppercase text-xs font-semibold text-slate-500">
                 <tr><th className="p-4">Name/Email</th><th className="p-4">Role</th><th className="p-4">Department</th><th className="p-4">Details</th><th className="p-4 text-right">Actions</th></tr>
               </thead>
               <tbody className="divide-y dark:divide-slate-800">
                  {users.map(u => (
                    <tr key={u.id}>
                      <td className="p-4"><div className="font-bold dark:text-white">{u.name}</div><div className="text-slate-500 text-xs">{u.email}</div></td>
                      <td className="p-4"><span className={`px-2 py-1 rounded-md text-xs font-bold ${u.role==='STUDENT'?'bg-blue-100 text-blue-700':u.role==='FACULTY'?'bg-indigo-100 text-indigo-700':'bg-rose-100 text-rose-700'}`}>{u.role}</span></td>
                      <td className="p-4 font-medium">{u.department}</td>
                      <td className="p-4 text-xs">
                        {u.role==='STUDENT' && u.studentProfile ? <>{u.studentProfile.prnNumber} / Sem {u.studentProfile.currentSemester} / Div {u.studentProfile.division}</> : 
                         u.role==='FACULTY' && u.facultyProfile ? <>{u.facultyProfile.designation}</> : "-"}
                      </td>
                      <td className="p-4 flex gap-2 justify-end">
                         <button onClick={()=>{setEditingUser(u); setForm({...form, name:u.name, email:u.email, role:u.role, departmentId:u.departmentId}); setShowModal(true)}} className="p-2 text-indigo-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"><Edit2 size={16}/></button>
                         <button onClick={()=>handleDelete(u.id, u.name)} className="p-2 text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"><Trash2 size={16}/></button>
                      </td>
                    </tr>
                  ))}
               </tbody>
             </table>
           </div>
        </div>
      </div>

      <AnimatePresence>
        {showModal && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4">
             <div className="absolute inset-0 bg-slate-900/60" onClick={()=>setShowModal(false)}></div>
             <motion.form onSubmit={handleSave} className="relative bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl p-6 space-y-4">
                <h2 className="text-xl font-bold mb-4">{editingUser?"Edit User":"Add User"}</h2>
                <div className="grid grid-cols-2 gap-4">
                   <div><label className="block text-sm font-bold mb-1">Name</label><input required className="w-full border p-2 rounded-lg" value={form.name} onChange={e=>setForm({...form, name:e.target.value})}/></div>
                   <div><label className="block text-sm font-bold mb-1">Email</label><input type="email" required className="w-full border p-2 rounded-lg" value={form.email} onChange={e=>setForm({...form, email:e.target.value})}/></div>
                   {!editingUser && <div className="col-span-2"><label className="block text-sm font-bold mb-1">Password</label><input required className="w-full border p-2 rounded-lg" value={form.password} onChange={e=>setForm({...form, password:e.target.value})}/></div>}
                   <div>
                     <label className="block text-sm font-bold mb-1">Role</label>
                     <select disabled={!!editingUser} className="w-full border p-2 rounded-lg" value={form.role} onChange={e=>setForm({...form, role:e.target.value as Role})}>
                        <option value="STUDENT">Student</option><option value="FACULTY">Faculty</option><option value="ADMIN">Admin</option>
                     </select>
                   </div>
                   <div>
                     <label className="block text-sm font-bold mb-1">Department</label>
                     <select required className="w-full border p-2 rounded-lg" value={form.departmentId} onChange={e=>setForm({...form, departmentId:e.target.value})}>
                        <option value="">Select...</option>
                        {departments.map(d=><option key={d.id} value={d.id}>{d.name}</option>)}
                     </select>
                   </div>
                   {form.role === "STUDENT" && <>
                     <div><label className="block text-sm font-bold mb-1">PRN</label><input className="w-full border p-2 rounded-lg" value={form.prnNumber} onChange={e=>setForm({...form, prnNumber:e.target.value})}/></div>
                     <div><label className="block text-sm font-bold mb-1">Semester</label><input type="number" className="w-full border p-2 rounded-lg" value={form.currentSemester} onChange={e=>setForm({...form, currentSemester:parseInt(e.target.value)})}/></div>
                   </>}
                   {form.role === "FACULTY" && <>
                     <div className="col-span-2"><label className="block text-sm font-bold mb-1">Designation</label><input className="w-full border p-2 rounded-lg" value={form.designation} onChange={e=>setForm({...form, designation:e.target.value})}/></div>
                   </>}
                </div>
                <div className="flex justify-end gap-3 mt-6">
                   <button type="button" onClick={()=>setShowModal(false)} className="px-4 py-2 border rounded-lg">Cancel</button>
                   <button type="submit" disabled={saving} className="px-4 py-2 bg-indigo-600 text-white rounded-lg">{saving?"Saving...":"Save"}</button>
                </div>
             </motion.form>
          </motion.div>
        )}
      </AnimatePresence>
    </AdminLayout>
  )
}

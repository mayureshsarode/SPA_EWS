import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Building2, Search, Plus, Edit2, Trash2, Users, BookOpen, ChevronRight, Loader2, X, Save } from "lucide-react";
import { AdminLayout } from "../components/admin-layout";
import { api } from "../lib/api";

interface Department {
  id: string;
  code: string;
  name: string;
  isFirstYear: boolean;
  studentCount: number;
  facultyCount: number;
  courseCount: number;
}

export function AdminDepartments() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", code: "", isFirstYear: false });

  const fetchDepartments = () => {
    api("/admin/departments")
      .then((res) => setDepartments(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const filteredDepts = departments.filter(
    (d) =>
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenAdd = () => {
    setEditingDept(null);
    setForm({ name: "", code: "", isFirstYear: false });
    setShowModal(true);
  };

  const handleOpenEdit = (dept: Department) => {
    setEditingDept(dept);
    setForm({ name: dept.name, code: dept.code, isFirstYear: dept.isFirstYear });
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingDept) {
        await api(`/admin/departments/${editingDept.id}`, {
          method: "PUT",
          body: JSON.stringify(form),
        });
      } else {
        await api("/admin/departments", {
          method: "POST",
          body: JSON.stringify(form),
        });
      }
      await fetchDepartments();
      setShowModal(false);
    } catch (err: any) {
      alert(err.message || "Failed to save department");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout activeItem="Departments">
      <div className="space-y-6 max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Departments</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Manage structure & cohorts</p>
          </div>
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:shadow-lg text-white rounded-xl font-medium transition-all shadow-indigo-500/20 w-full sm:w-auto justify-center"
          >
            <Plus className="w-5 h-5" />
            Add Department
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-indigo-500" /></div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredDepts.map((dept, i) => (
              <motion.div
                key={dept.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-lg transition-all p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
                      <Building2 className="w-7 h-7" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2.5 py-1 rounded-md mb-1.5 inline-block">
                        {dept.code}
                      </span>
                      <h3 className="font-bold text-lg text-slate-900 dark:text-white leading-tight">{dept.name}</h3>
                      {dept.isFirstYear && (
                        <span className="text-xs font-medium text-amber-600 dark:text-amber-400 flex items-center gap-1 mt-1">
                          ↳ First Year Cohort
                        </span>
                      )}
                    </div>
                  </div>
                  <button onClick={() => handleOpenEdit(dept)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors">
                    <Edit2 className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-4 border-t border-slate-100 dark:border-slate-800 pt-5">
                  <div>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1"><Users className="w-4 h-4"/>Students</p>
                    <p className="text-xl font-bold text-slate-900 dark:text-white">{dept.studentCount}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1"><Users className="w-4 h-4"/>Faculty</p>
                    <p className="text-xl font-bold text-slate-900 dark:text-white">{dept.facultyCount}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1"><BookOpen className="w-4 h-4"/>Courses</p>
                    <p className="text-xl font-bold text-slate-900 dark:text-white">{dept.courseCount}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {showModal && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowModal(false)} />
            <motion.form onSubmit={handleSave} className="relative z-10 w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-xl overflow-hidden">
              <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <h2 className="text-lg font-bold">{editingDept ? "Edit Department" : "New Department"}</h2>
                <button type="button" onClick={() => setShowModal(false)}><X className="w-5 h-5 opacity-60" /></button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-bold mb-2">Code</label>
                  <input type="text" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} required className="w-full px-4 py-2 border rounded-xl dark:bg-slate-800 dark:border-slate-700" />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2">Name</label>
                  <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="w-full px-4 py-2 border rounded-xl dark:bg-slate-800 dark:border-slate-700" />
                </div>
                <label className="flex items-center gap-2 cursor-pointer pt-2">
                  <input type="checkbox" checked={form.isFirstYear} onChange={(e) => setForm({ ...form, isFirstYear: e.target.checked })} />
                  <span className="text-sm font-medium">Is First Year Core Department</span>
                </label>
              </div>
              <div className="p-6 pt-0 flex justify-end gap-3">
                <button type="submit" disabled={saving} className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-bold w-full hover:bg-indigo-700">
                  {saving ? "Saving..." : "Save"}
                </button>
              </div>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>
    </AdminLayout>
  );
}

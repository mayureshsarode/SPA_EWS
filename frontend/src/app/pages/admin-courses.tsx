import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Search, Filter, BookOpen, Plus, Edit2, Trash2, X, Save, Loader2, MoreVertical, Users, GraduationCap } from "lucide-react";
import { AdminLayout } from "../components/admin-layout";
import { api } from "../lib/api";

interface Course {
  id: string;
  courseCode: string;
  name: string;
  department: string;
  credits: number;
  isElective: boolean;
  offerings: {
    id: string;
    semester: number;
    division: string;
    faculty: string;
    enrolledStudents: number;
  }[];
}

interface Dept {
  id: string;
  name: string;
  code: string;
}

export function AdminCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [departments, setDepartments] = useState<Dept[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [deptFilter, setDeptFilter] = useState("all");

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [saving, setSaving] = useState(false);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);

  // Form state
  const [form, setForm] = useState({
    courseCode: "",
    name: "",
    credits: 4,
    departmentId: "",
    isElective: false,
  });

  const fetchCourses = () => {
    return api("/admin/courses")
      .then((res) => setCourses(res.data))
      .catch(console.error);
  };

  useEffect(() => {
    Promise.all([
      fetchCourses(),
      api("/admin/departments").then((res) => setDepartments(res.data)),
    ]).finally(() => setLoading(false));
  }, []);

  const filteredCourses = courses.filter((course) => {
    if (deptFilter !== "all" && course.department.toLowerCase() !== deptFilter.toLowerCase()) return false;
    if (searchQuery && !course.name.toLowerCase().includes(searchQuery.toLowerCase()) && !course.courseCode.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const openAddModal = () => {
    setEditingCourse(null);
    setForm({ courseCode: "", name: "", credits: 4, departmentId: departments[0]?.id || "", isElective: false });
    setShowModal(true);
  };

  const openEditModal = (course: Course) => {
    setEditingCourse(course);
    const dept = departments.find((d) => d.name === course.department);
    setForm({
      courseCode: course.courseCode,
      name: course.name,
      credits: course.credits,
      departmentId: dept?.id || "",
      isElective: course.isElective,
    });
    setShowModal(true);
    setMenuOpen(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingCourse) {
        await api(`/admin/courses/${editingCourse.id}`, {
          method: "PUT",
          body: JSON.stringify({ name: form.name, credits: form.credits, departmentId: form.departmentId, isElective: form.isElective }),
        });
      } else {
        await api("/admin/courses", {
          method: "POST",
          body: JSON.stringify(form),
        });
      }
      await fetchCourses();
      setShowModal(false);
    } catch (err: any) {
      alert(err.message || "Failed to save course");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (course: Course) => {
    if (!confirm(`Delete course "${course.name}"? This will remove all offerings and enrollments.`)) return;
    try {
      await api(`/admin/courses/${course.id}`, { method: "DELETE" });
      await fetchCourses();
    } catch (err: any) {
      alert(err.message || "Failed to delete course");
    }
    setMenuOpen(null);
  };

  if (loading) {
    return (
      <AdminLayout activeItem="Courses">
        <div className="flex justify-center items-center min-h-[50vh]">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout activeItem="Courses">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Course Management</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Manage institution courses ({courses.length} total)</p>
          </div>
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:shadow-lg text-white rounded-xl font-medium transition-all shadow-indigo-500/20 w-full sm:w-auto justify-center"
          >
            <Plus className="w-5 h-5" />
            Add Course
          </button>
        </div>

        {/* Filters */}
        <motion.div
          className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by code or name..."
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 border border-slate-200 dark:border-slate-700"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
                className="px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">All Departments</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.name}>{d.name}</option>
                ))}
              </select>
            </div>
          </div>
        </motion.div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredCourses.map((course, i) => (
            <motion.div
              key={course.id}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-lg dark:hover:shadow-2xl transition-all duration-300 p-6 flex flex-col"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20 flex-shrink-0">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-1 rounded-md mb-1 inline-block">
                      {course.courseCode}
                    </span>
                    <h3 className="font-bold text-slate-900 dark:text-white leading-tight truncate">{course.name}</h3>
                  </div>
                </div>
                <div className="relative flex-shrink-0 ml-2">
                  <button
                    onClick={() => setMenuOpen(menuOpen === course.id ? null : course.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <MoreVertical className="w-5 h-5" />
                  </button>
                  <AnimatePresence>
                    {menuOpen === course.id && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -5 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="absolute right-0 top-8 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden z-10 min-w-[140px]"
                      >
                        <button
                          onClick={() => openEditModal(course)}
                          className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                        >
                          <Edit2 className="w-4 h-4" /> Edit
                        </button>
                        <button
                          onClick={() => handleDelete(course)}
                          className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" /> Delete
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              <div className="mt-2 space-y-2 flex-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Department</span>
                  <span className="font-medium text-slate-700 dark:text-slate-300">{course.department}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Credits</span>
                  <span className="font-medium text-slate-700 dark:text-slate-300">{course.credits}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Type</span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${course.isElective ? "bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400" : "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"}`}>
                    {course.isElective ? "Elective" : "Core"}
                  </span>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-sm">
                <span className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                  <GraduationCap className="w-4 h-4 text-indigo-400" />
                  {course.offerings.length} offering{course.offerings.length !== 1 ? "s" : ""}
                </span>
                <span className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                  <Users className="w-4 h-4 text-emerald-400" />
                  {course.offerings.reduce((s, o) => s + o.enrolledStudents, 0)} enrolled
                </span>
              </div>
            </motion.div>
          ))}

          {filteredCourses.length === 0 && (
            <div className="col-span-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center text-slate-500 dark:text-slate-400">
              <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="font-medium">No courses found</p>
              <p className="text-sm">Try adjusting your search or add a new course.</p>
            </div>
          )}
        </div>
      </div>

      {/* Add / Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowModal(false)} />
            <motion.form
              onSubmit={handleSave}
              className="relative z-10 w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden"
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
            >
              <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  {editingCourse ? "Edit Course" : "Add New Course"}
                </h2>
                <button type="button" onClick={() => setShowModal(false)} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800">
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Course Code *</label>
                    <input
                      type="text"
                      value={form.courseCode}
                      onChange={(e) => setForm({ ...form, courseCode: e.target.value })}
                      placeholder="CS301"
                      required
                      disabled={!!editingCourse}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-60"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Credits *</label>
                    <input
                      type="number"
                      min={1} max={6}
                      value={form.credits}
                      onChange={(e) => setForm({ ...form, credits: parseInt(e.target.value) })}
                      required
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Course Name *</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Data Structures and Algorithms"
                    required
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Department *</label>
                  <select
                    value={form.departmentId}
                    onChange={(e) => setForm({ ...form, departmentId: e.target.value })}
                    required
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Select department</option>
                    {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </div>

                <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800">
                  <input
                    type="checkbox"
                    checked={form.isElective}
                    onChange={(e) => setForm({ ...form, isElective: e.target.checked })}
                    className="w-4 h-4 rounded accent-indigo-600"
                  />
                  <div>
                    <div className="text-sm font-medium text-slate-900 dark:text-white">Elective Course</div>
                    <div className="text-xs text-slate-500">Students choose this optionally</div>
                  </div>
                </label>
              </div>

              <div className="p-6 pt-0 flex gap-3">
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={saving}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-semibold text-sm shadow-lg shadow-indigo-500/20 disabled:opacity-60">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {editingCourse ? "Save Changes" : "Create Course"}
                </button>
              </div>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>
    </AdminLayout>
  );
}

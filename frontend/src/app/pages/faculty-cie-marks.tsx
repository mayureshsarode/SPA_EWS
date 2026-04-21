import { useState } from "react";
import { motion } from "motion/react";
import {
  Save,
  Upload,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { api } from "../lib/api";
import { FacultyLayout } from "../components/faculty-layout";
import { useEffect } from "react";

export function FacultyCieMarks() {
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");
  const [divisionStudents, setDivisionStudents] = useState<any[]>([]);
  const [selectedCie, setSelectedCie] = useState<1 | 2 | 3>(1);
  const [marksMap, setMarksMap] = useState<Record<string, number>>({});
  const [saved, setSaved] = useState(false);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [loadingStudents, setLoadingStudents] = useState(false);

  // 1. Fetch faculty courses
  useEffect(() => {
    api('/faculty/me/dashboard')
      .then(res => {
        const facCourses = res.data.courses || [];
        setCourses(facCourses);
        if (facCourses.length > 0) {
          setSelectedCourseId(facCourses[0].id);
        }
      })
      .catch(console.error)
      .finally(() => setLoadingCourses(false));
  }, []);

  // 2. Fetch students and existing marks when course or cie changes
  useEffect(() => {
    if (!selectedCourseId) return;
    setLoadingStudents(true);
    api(`/marks/${selectedCourseId}/cie/${selectedCie}`)
      .then(res => {
        const students = res.data.students || [];
        setDivisionStudents(students);
        
        // Initialize marks map from fetched data
        const initialMarks: Record<string, number> = {};
        students.forEach((s: any) => {
           initialMarks[s.enrollmentId] = s.marks || 0;
        });
        setMarksMap(initialMarks);
      })
      .catch(console.error)
      .finally(() => setLoadingStudents(false));
  }, [selectedCourseId, selectedCie]);

  const currentCourse = courses.find((c) => c.id === selectedCourseId);
  const maxMarks = 100; // Database uses 100 max cumulative marks for CIE

  const getMark = (enrollmentId: string) => {
    return marksMap[enrollmentId] || 0;
  };

  const setMark = (enrollmentId: string, value: number) => {
    setMarksMap((prev) => ({ ...prev, [enrollmentId]: Math.min(Math.max(0, value), maxMarks) }));
    setSaved(false);
  };

  const isInvalid = (enrollmentId: string) => {
    const mark = getMark(enrollmentId);
    return mark > maxMarks || mark < 0;
  };

  const avgMarks = divisionStudents.length
    ? Math.round(divisionStudents.reduce((sum, s) => sum + getMark(s.enrollmentId), 0) / divisionStudents.length)
    : 0;

  const handleSave = async () => {
    if (!selectedCourseId || divisionStudents.length === 0) return;

    // Build payload
    const entries = divisionStudents.map(s => ({
      enrollmentId: s.enrollmentId,
      marks: marksMap[s.enrollmentId] || 0
    }));

    try {
      await api(`/marks/save`, {
        method: "POST",
        body: JSON.stringify({ entries })
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error(err);
      alert("Failed to save marks");
    }
  };

  return (
    <FacultyLayout activeItem="CIE Marks">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">CIE Marks</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Upload or enter CIE marks for your courses</p>
        </div>

        {/* Filters */}
        <motion.div
          className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Course Offering</label>
              <select
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
                disabled={loadingCourses}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {courses.map((c: any) => (
                  <option key={c.id} value={c.id}>{c.courseCode} — {c.courseName} (Div {c.division})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Semester</label>
              <div className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                {currentCourse ? `Semester ${currentCourse.semester}` : "N/A"}
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">CIE Exam</label>
              <div className="grid grid-cols-3 gap-2">
                {([1, 2, 3] as const).map((cie) => (
                  <button
                    key={cie}
                    onClick={() => { setSelectedCie(cie); setMarksMap({}); }}
                    className={`py-3 rounded-xl text-sm font-bold transition-all duration-300 ${
                      selectedCie === cie
                        ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/20"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                    }`}
                  >
                    CIE {cie}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Summary */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-3 gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 flex items-center justify-center">
              <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">{divisionStudents.length}</span>
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400">Students</div>
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-violet-50 dark:bg-violet-950/30 flex items-center justify-center">
              <span className="text-sm font-bold text-violet-600 dark:text-violet-400">{avgMarks}/{maxMarks}</span>
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400">Average Marks</div>
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center">
              <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{maxMarks}</span>
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400">Max Marks</div>
          </div>
        </motion.div>

        {/* Marks Table */}
        <motion.div
          className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Student ID</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Name</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">CIE {selectedCie} Marks</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Percentage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 relative">
                {loadingStudents && (
                  <div className="absolute inset-0 z-10 bg-white/50 dark:bg-slate-900/50 flex items-center justify-center backdrop-blur-sm">
                    <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
                {divisionStudents.map((student, i) => {
                  const mark = getMark(student.enrollmentId);
                  const percentage = Math.round((mark / maxMarks) * 100);
                  return (
                    <motion.tr
                      key={student.enrollmentId}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2, delay: i * 0.03 }}
                    >
                      <td className="px-6 py-4 text-sm font-mono text-slate-600 dark:text-slate-400">{student.studentId}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white text-sm font-bold">
                            {student.name.charAt(0)}
                          </div>
                          <span className="text-sm font-medium text-slate-900 dark:text-white">{student.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min={0}
                            max={maxMarks}
                            value={mark}
                            onChange={(e) => setMark(student.enrollmentId, parseInt(e.target.value) || 0)}
                            className={`w-20 px-3 py-2 rounded-xl border text-center font-bold text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                              isInvalid(student.enrollmentId)
                                ? "border-rose-300 dark:border-rose-700 bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-400"
                                : "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                            }`}
                          />
                          <span className="text-sm text-slate-500 dark:text-slate-400">/ {maxMarks}</span>
                          {isInvalid(student.enrollmentId) && <AlertCircle className="w-4 h-4 text-rose-500" />}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-slate-200 dark:bg-slate-700 rounded-full h-2 max-w-[80px]">
                            <div
                              className={`h-2 rounded-full transition-all duration-300 ${
                                percentage >= 60 ? "bg-emerald-500" : percentage >= 40 ? "bg-amber-500" : "bg-rose-500"
                              }`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium text-slate-900 dark:text-white">{percentage}%</span>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Save */}
        <motion.div
          className="flex justify-end gap-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <button className="px-6 py-3 rounded-xl border-2 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors font-semibold flex items-center gap-2">
            <Upload className="w-4 h-4" />
            Import CSV
          </button>
          <button
            onClick={handleSave}
            className={`px-8 py-3 rounded-xl font-semibold text-white transition-all duration-300 flex items-center gap-2 ${
              saved
                ? "bg-emerald-600 shadow-lg shadow-emerald-500/25"
                : "bg-gradient-to-r from-indigo-600 to-violet-600 hover:shadow-xl shadow-indigo-500/20 hover:-translate-y-0.5"
            }`}
          >
            {saved ? <><CheckCircle className="w-5 h-5" /> Marks Saved!</> : <><Save className="w-5 h-5" /> Save Marks</>}
          </button>
        </motion.div>
      </div>
    </FacultyLayout>
  );
}

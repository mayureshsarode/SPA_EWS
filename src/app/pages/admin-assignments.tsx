import { useState } from "react";
import { motion } from "motion/react";
import { AdminLayout } from "../components/admin-layout";
import { Users, Search, BookOpen, ShieldAlert, CheckCircle, Shield } from "lucide-react";

export function AdminAssignments() {
  const [activeTab, setActiveTab] = useState<"mentors" | "ccs" | "enrollments">("mentors");

  return (
    <AdminLayout activeItem="Assignments">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Assignment Engine</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Dynamically remap Mentors, Class Coordinators (CCs), and Elective Enrollments.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl w-fit">
          <button
            onClick={() => setActiveTab("mentors")}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
              activeTab === "mentors"
                ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
            }`}
          >
            Mentorships
          </button>
          <button
            onClick={() => setActiveTab("ccs")}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
              activeTab === "ccs"
                ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
            }`}
          >
            Class Coordinators
          </button>
          <button
            onClick={() => setActiveTab("enrollments")}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
              activeTab === "enrollments"
                ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
            }`}
          >
            Course Enrollments
          </button>
        </div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6"
        >
          {activeTab === "mentors" && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Batch Mentorship Reassignment</h2>
              <div className="p-4 border border-dashed border-slate-300 dark:border-slate-700 rounded-xl flex items-center justify-center text-slate-500 dark:text-slate-400 h-40">
                <div className="text-center">
                  <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>Select a Mentor to view or reassign their batch.</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "ccs" && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Division CC Allocation</h2>
              <div className="p-4 border border-dashed border-slate-300 dark:border-slate-700 rounded-xl flex items-center justify-center text-slate-500 dark:text-slate-400 h-40">
                <div className="text-center">
                  <Shield className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>Map Class Coordinators to Divisions.</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "enrollments" && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Elective & Minor Enrollments</h2>
              <div className="p-4 border border-dashed border-slate-300 dark:border-slate-700 rounded-xl flex items-center justify-center text-slate-500 dark:text-slate-400 h-40">
                <div className="text-center">
                  <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>Add or drop students from individual elective courses.</p>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AdminLayout>
  );
}

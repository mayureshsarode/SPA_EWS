import { useState } from "react";
import { motion } from "motion/react";
import { Save, User, Bell, Lock, BookOpen } from "lucide-react";
import { FacultyLayout } from "../components/faculty-layout";
import { useAuth } from "../contexts/auth-context";

export function FacultySettings() {
  const { user } = useAuth();
  const [notifyAttendance, setNotifyAttendance] = useState(true);
  const [notifyMarks, setNotifyMarks] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Profile configurations saved successfully.");
  };

  return (
    <FacultyLayout activeItem="Settings">
      <div className="space-y-6 max-w-4xl mx-auto">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Profile Settings</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Manage your profile information and notification preferences</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="md:col-span-1 space-y-1">
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 font-medium text-sm text-left transition-colors">
              <User className="w-5 h-5" />
              Profile
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 font-medium text-sm text-left transition-colors">
              <Bell className="w-5 h-5" />
              Notifications
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 font-medium text-sm text-left transition-colors">
              <Lock className="w-5 h-5" />
              Security
            </button>
          </div>

          <div className="md:col-span-3 space-y-6">
            <motion.form
              onSubmit={handleSave}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-indigo-500/20">
                  {user?.name?.split(" ").map((n) => n[0]).join("").slice(0, 2) || "F"}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Personal Information</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Update your account display details.</p>
                </div>
              </div>
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      defaultValue={user?.name || "Faculty Member"}
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      defaultValue={user?.email || "faculty@university.edu"}
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Department
                    </label>
                    <input
                      type="text"
                      disabled
                      defaultValue={(user as any)?.department || "Computer Science"}
                      className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 cursor-not-allowed"
                    />
                    <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">Department change requires admin approval.</p>
                  </div>
                </div>
              </div>
              <div className="p-6 border-t border-slate-200 dark:border-slate-800">
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">Notification Preferences</h3>
                <div className="space-y-4">
                  <label className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-xl cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-rose-100 dark:bg-rose-900/30 rounded-lg text-rose-600 dark:text-rose-400">
                        <User className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-medium text-slate-900 dark:text-white">Attendance Drops</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">Notify me when a student's attendance drops below 75%</div>
                      </div>
                    </div>
                    <div className="relative inline-block w-12 h-6 rounded-full transition-colors duration-200 ease-in-out">
                      <input type="checkbox" className="peer sr-only" checked={notifyAttendance} onChange={() => setNotifyAttendance(!notifyAttendance)} />
                      <div className={`block w-12 h-6 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${notifyAttendance ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'}`}></div>
                      <div className={`absolute left-0 top-0 w-6 h-6 rounded-full bg-white shadow-sm ring-1 ring-slate-900/5 transition-transform duration-200 ease-in-out ${notifyAttendance ? 'translate-x-6' : 'translate-x-0'}`}></div>
                    </div>
                  </label>
                  
                  <label className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-xl cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg text-amber-600 dark:text-amber-400">
                        <BookOpen className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-medium text-slate-900 dark:text-white">Pending Marks Entry</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">Remind me when CIE marks entry deadline is approaching</div>
                      </div>
                    </div>
                    <div className="relative inline-block w-12 h-6 rounded-full transition-colors duration-200 ease-in-out">
                      <input type="checkbox" className="peer sr-only" checked={notifyMarks} onChange={() => setNotifyMarks(!notifyMarks)} />
                      <div className={`block w-12 h-6 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${notifyMarks ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'}`}></div>
                      <div className={`absolute left-0 top-0 w-6 h-6 rounded-full bg-white shadow-sm ring-1 ring-slate-900/5 transition-transform duration-200 ease-in-out ${notifyMarks ? 'translate-x-6' : 'translate-x-0'}`}></div>
                    </div>
                  </label>
                </div>
              </div>
              <div className="p-6 bg-slate-50 dark:bg-slate-800/50 flex justify-end">
                <button type="submit" className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors shadow-lg shadow-indigo-500/20">
                  <Save className="w-5 h-5" />
                  Save Changes
                </button>
              </div>
            </motion.form>
          </div>
        </div>
      </div>
    </FacultyLayout>
  );
}

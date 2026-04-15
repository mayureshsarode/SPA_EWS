import { useState } from "react";
import { motion } from "motion/react";
import { Save, User, Bell, Lock, Eye, EyeOff, Loader2, CheckCircle } from "lucide-react";
import { FacultyLayout } from "../components/faculty-layout";
import { useAuth } from "../contexts/auth-context";
import { api } from "../lib/api";

type SettingsTab = "profile" | "notifications" | "security";

export function FacultySettings() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");

  // Profile form
  const [name, setName] = useState(user?.name || "");

  // Notification toggles
  const [notifyAttendance, setNotifyAttendance] = useState(true);
  const [notifyMarks, setNotifyMarks] = useState(false);

  // Security form
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);

  const showSuccess = (msg: string) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(""), 3000);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api("/faculty/me/profile", { method: "PUT", body: JSON.stringify({ name }) });
      showSuccess("Profile saved successfully!");
    } catch (err: any) {
      alert(err.message || "Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveNotifications = async () => {
    setSaving(true);
    try {
      // Store notification prefs in localStorage until backend notification system is built
      localStorage.setItem("notif_attendance", String(notifyAttendance));
      localStorage.setItem("notif_marks", String(notifyMarks));
      showSuccess("Notification preferences saved!");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }
    if (newPassword.length < 8) {
      alert("Password must be at least 8 characters.");
      return;
    }
    setSaving(true);
    try {
      await api("/auth/change-password", {
        method: "PUT",
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      showSuccess("Password changed successfully!");
    } catch (err: any) {
      alert(err.message || "Failed to change password");
    } finally {
      setSaving(false);
    }
  };

  const tabs: { id: SettingsTab; label: string; icon: any }[] = [
    { id: "profile", label: "Profile", icon: User },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "security", label: "Security", icon: Lock },
  ];

  return (
    <FacultyLayout activeItem="Settings">
      <div className="space-y-6 max-w-4xl mx-auto">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Profile Settings</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Manage your profile, notifications, and security</p>
        </div>

        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400"
          >
            <CheckCircle className="w-5 h-5" />
            <span className="font-medium">{success}</span>
          </motion.div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="md:col-span-1 space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm text-left transition-colors ${
                    activeTab === tab.id
                      ? "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div className="md:col-span-3">
            {activeTab === "profile" && (
              <motion.form
                onSubmit={handleSaveProfile}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-indigo-500/20">
                    {name?.split(" ").map((n) => n[0]).join("").slice(0, 2) || "F"}
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">Personal Information</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Update your display name and details.</p>
                  </div>
                </div>
                <div className="p-6 space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Full Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Email Address</label>
                    <input
                      type="email"
                      defaultValue={user?.email}
                      disabled
                      className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 cursor-not-allowed"
                    />
                    <p className="mt-1 text-xs text-slate-500">Email cannot be changed.</p>
                  </div>
                </div>
                <div className="p-6 bg-slate-50 dark:bg-slate-800/50 flex justify-end border-t border-slate-200 dark:border-slate-800">
                  <button type="submit" disabled={saving}
                    className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl font-semibold shadow-lg shadow-indigo-500/20 disabled:opacity-60"
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Save Changes
                  </button>
                </div>
              </motion.form>
            )}

            {activeTab === "notifications" && (
              <motion.div
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="p-6 border-b border-slate-200 dark:border-slate-800">
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">Notification Preferences</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Choose what alerts you want to receive.</p>
                </div>
                <div className="p-6 space-y-4">
                  {[
                    { key: "attendance", label: "Attendance Drops", desc: "Alert me when a student drops below 75%", value: notifyAttendance, setter: setNotifyAttendance },
                    { key: "marks", label: "Pending Marks Entry", desc: "Remind me when CIE marks deadline approaches", value: notifyMarks, setter: setNotifyMarks },
                  ].map((item) => (
                    <label key={item.key} className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-xl cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                      <div>
                        <div className="font-semibold text-slate-900 dark:text-white">{item.label}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{item.desc}</div>
                      </div>
                      <div className="relative inline-block w-12 h-6 flex-shrink-0">
                        <input type="checkbox" className="peer sr-only" checked={item.value} onChange={() => item.setter(!item.value)} />
                        <div className={`block w-12 h-6 rounded-full border-2 border-transparent transition-colors duration-200 ${item.value ? "bg-indigo-600" : "bg-slate-300 dark:bg-slate-700"}`} />
                        <div className={`absolute left-0 top-0 w-6 h-6 rounded-full bg-white shadow-sm ring-1 ring-slate-900/5 transition-transform duration-200 ${item.value ? "translate-x-6" : "translate-x-0"}`} />
                      </div>
                    </label>
                  ))}
                </div>
                <div className="p-6 bg-slate-50 dark:bg-slate-800/50 flex justify-end border-t border-slate-200 dark:border-slate-800">
                  <button onClick={handleSaveNotifications} disabled={saving}
                    className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl font-semibold shadow-lg shadow-indigo-500/20 disabled:opacity-60"
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Save Preferences
                  </button>
                </div>
              </motion.div>
            )}

            {activeTab === "security" && (
              <motion.form
                onSubmit={handleChangePassword}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="p-6 border-b border-slate-200 dark:border-slate-800">
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">Change Password</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Use a strong password of at least 8 characters.</p>
                </div>
                <div className="p-6 space-y-5">
                  {[
                    { label: "Current Password", value: currentPassword, setter: setCurrentPassword },
                    { label: "New Password", value: newPassword, setter: setNewPassword },
                    { label: "Confirm New Password", value: confirmPassword, setter: setConfirmPassword },
                  ].map((field, idx) => (
                    <div key={idx}>
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">{field.label}</label>
                      <div className="relative">
                        <input
                          type={showPwd ? "text" : "password"}
                          value={field.value}
                          onChange={(e) => field.setter(e.target.value)}
                          required
                          className="w-full px-4 py-3 pr-12 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        <button type="button" onClick={() => setShowPwd(!showPwd)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                          {showPwd ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-6 bg-slate-50 dark:bg-slate-800/50 flex justify-end border-t border-slate-200 dark:border-slate-800">
                  <button type="submit" disabled={saving}
                    className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl font-semibold shadow-lg shadow-indigo-500/20 disabled:opacity-60"
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                    Update Password
                  </button>
                </div>
              </motion.form>
            )}
          </div>
        </div>
      </div>
    </FacultyLayout>
  );
}

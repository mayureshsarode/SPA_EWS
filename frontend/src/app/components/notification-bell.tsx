import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { Bell, X, AlertTriangle, MessageSquare, CheckCircle, Target } from "lucide-react";
import { useAuth } from "../contexts/auth-context";

interface Notification {
  id: number;
  type: "warning" | "info" | "success" | "critical";
  title: string;
  message: string;
  time: string;
  read: boolean;
  deepLink?: string; // Route to navigate to when clicked
}

// Notifications are role-aware in terms of deep-links
const buildNotifications = (role: string | null): Notification[] => {
  if (role === "student") {
    return [
      { id: 1, type: "warning", title: "Low Attendance Alert", message: "Your attendance in OS has dropped below 60%", time: "10 min ago", read: false, deepLink: "/student/subjects" },
      { id: 2, type: "info", title: "CIE 3 Marks Published", message: "CIE 3 marks for DSA have been uploaded by Prof. Jane Doe", time: "2 hrs ago", read: false, deepLink: "/student/subjects" },
      { id: 3, type: "critical", title: "Performance Warning", message: "Your overall performance has been flagged. Please meet your advisor.", time: "5 hrs ago", read: false, deepLink: "/student/messages" },
      { id: 4, type: "success", title: "Attendance Updated", message: "Your attendance for today has been marked as present in DBMS", time: "1 day ago", read: true, deepLink: "/student/subjects" },
      { id: 5, type: "info", title: "New Message from Mentor", message: "Prof. Jane Doe sent you a message about your performance review", time: "1 day ago", read: true, deepLink: "/student/messages" },
    ];
  }
  if (role === "faculty") {
    return [
      { id: 1, type: "critical", title: "Mentee Defaulter Alert", message: "David Brown's aggregate attendance fell below 65% — action required", time: "10 min ago", read: false, deepLink: "/faculty/student/S004" },
      { id: 2, type: "warning", title: "Mentee At Risk", message: "Emma Taylor's performance flagged. Review her profile.", time: "2 hrs ago", read: false, deepLink: "/faculty/student/S007" },
      { id: 3, type: "info", title: "New Message from Student", message: "Michael Chen sent you a message about CIE 2 marks", time: "5 hrs ago", read: false, deepLink: "/faculty/student/S002" },
      { id: 4, type: "success", title: "Attendance Submitted", message: "Attendance for CS301 Div A on 24 Mar has been saved", time: "1 day ago", read: true, deepLink: "/faculty/attendance" },
      { id: 5, type: "info", title: "CIE Marks Import Ready", message: "CSV for DBMS CIE 3 is ready for review and submission", time: "1 day ago", read: true, deepLink: "/faculty/cie-marks" },
    ];
  }
  // admin
  return [
    { id: 1, type: "critical", title: "System Alert — High Risk Students", message: "3 students across departments reached critical status this week", time: "30 min ago", read: false, deepLink: "/admin/alerts" },
    { id: 2, type: "warning", title: "Unassigned Division", message: "CS Sem 5 Div B has no Class Coordinator assigned", time: "2 hrs ago", read: false, deepLink: "/admin/assignments" },
    { id: 3, type: "info", title: "Weekly Report Ready", message: "Department-wide performance report for Week 11 is available", time: "1 day ago", read: true, deepLink: "/admin/reports" },
    { id: 4, type: "success", title: "User Onboarding Complete", message: "8 new students successfully added to the system", time: "2 days ago", read: true, deepLink: "/admin/users" },
  ];
};

const typeConfig = {
  warning: { icon: AlertTriangle, gradient: "from-amber-500 to-orange-500", bg: "bg-amber-50 dark:bg-amber-950/20" },
  info: { icon: MessageSquare, gradient: "from-blue-500 to-cyan-500", bg: "bg-blue-50 dark:bg-blue-950/20" },
  success: { icon: CheckCircle, gradient: "from-emerald-500 to-teal-500", bg: "bg-emerald-50 dark:bg-emerald-950/20" },
  critical: { icon: Target, gradient: "from-rose-500 to-red-500", bg: "bg-rose-50 dark:bg-rose-950/20" },
};

export function NotificationBell() {
  const { role } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState(() => buildNotifications(role));
  const ref = useRef<HTMLDivElement>(null);

  // Rebuild when role changes
  useEffect(() => {
    setNotifications(buildNotifications(role));
  }, [role]);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const markAllRead = () => setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

  const handleClick = (n: Notification) => {
    // Mark as read
    setNotifications((prev) => prev.map((item) => (item.id === n.id ? { ...item, read: true } : item)));
    setOpen(false);
    // Deep link navigate
    if (n.deepLink && n.deepLink !== location.pathname) {
      navigate(n.deepLink);
    }
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
      >
        <Bell className="w-5 h-5 text-slate-600 dark:text-slate-400" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-gradient-to-r from-rose-500 to-red-500 rounded-full text-white text-[10px] font-bold flex items-center justify-center shadow-lg shadow-rose-500/30">
            {unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="absolute right-0 top-full mt-2 w-96 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden z-50"
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            {/* Header */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 dark:text-white">Notifications</h3>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="text-xs text-indigo-600 dark:text-indigo-400 font-medium hover:underline"
                  >
                    Mark all read
                  </button>
                )}
                <button onClick={() => setOpen(false)} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
                  <X className="w-4 h-4 text-slate-400" />
                </button>
              </div>
            </div>

            {/* Notifications */}
            <div className="max-h-80 overflow-y-auto">
              {notifications.map((notification) => {
                const config = typeConfig[notification.type];
                const Icon = config.icon;
                return (
                  <button
                    key={notification.id}
                    onClick={() => handleClick(notification)}
                    className={`w-full p-4 border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-left ${
                      !notification.read ? config.bg : ""
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${config.gradient} flex items-center justify-center flex-shrink-0`}>
                        <Icon className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm text-slate-900 dark:text-white">{notification.title}</span>
                          {!notification.read && <span className="w-2 h-2 rounded-full bg-indigo-600 flex-shrink-0" />}
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">{notification.message}</p>
                        <span className="text-xs text-slate-400 dark:text-slate-500 mt-1 block">{notification.time}</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-slate-200 dark:border-slate-800">
              <button className="w-full py-2 text-center text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 rounded-xl transition-colors">
                View All Notifications
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

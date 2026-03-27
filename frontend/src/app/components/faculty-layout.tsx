import { useState, type ReactNode } from "react";
import { Link, useLocation } from "react-router";
import {
  LayoutDashboard,
  Users,
  Calendar,
  ClipboardList,
  AlertTriangle,
  FileText,
  Settings,
  LogOut,
  BarChart3,
  Menu,
  X,
  MessageSquare,
  BookOpen,
  Shield,
} from "lucide-react";
import { ThemeToggle } from "./theme-toggle";
import { GlobalSearch } from "./global-search";
import { NotificationBell } from "./notification-bell";
import { useAuth } from "../contexts/auth-context";
import { useNavigate } from "react-router";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/faculty" },
  { icon: BookOpen, label: "My Courses", path: "/faculty/courses" },
  { icon: Calendar, label: "Attendance", path: "/faculty/attendance" },
  { icon: ClipboardList, label: "CIE Marks", path: "/faculty/cie-marks" },
  { icon: Users, label: "Students", path: "/faculty/students" },
  { icon: MessageSquare, label: "Messages", path: "/faculty/messages" },
  { icon: Shield, label: "Class Coordinator", path: "/faculty/cc" },
  { icon: AlertTriangle, label: "Alerts", path: "/faculty/alerts" },
  { icon: FileText, label: "Reports", path: "/faculty/reports" },
  { icon: Settings, label: "Settings", path: "/faculty/settings" },
];

export function FacultyLayout({ children, activeItem }: { children: ReactNode; activeItem: string }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const SidebarContent = ({ mobile = false }: { mobile?: boolean }) => (
    <>
      <div className={`p-6 border-b border-slate-200 dark:border-slate-800 ${mobile ? "flex items-center justify-between" : ""}`}>
        <Link to="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <BarChart3 className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="font-bold text-slate-900 dark:text-white">SPA-EWS</div>
            <div className="text-xs text-slate-500 dark:text-slate-400">Faculty Portal</div>
          </div>
        </Link>
        {mobile && (
          <button onClick={() => setSidebarOpen(false)} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
            <X className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          </button>
        )}
      </div>

      <nav className="flex-1 p-4">
        <div className="space-y-1">
          {navItems.map((item, i) => {
            const Icon = item.icon;
            const isActive = item.label === activeItem;
            return (
              <Link
                key={i}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive
                    ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/20 font-medium"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>

      <div className="p-4 border-t border-slate-200 dark:border-slate-800">
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-500/20">
              {user?.name?.split(" ").map((n) => n[0]).join("").slice(0, 2) || "F"}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-slate-900 dark:text-white text-sm truncate">{user?.name || "Faculty Member"}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 truncate">{(user as any)?.department || "Department"}</div>
            </div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 w-full text-sm transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex transition-colors duration-300">
      <aside className="hidden md:flex md:flex-col w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800">
        <SidebarContent />
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-white dark:bg-slate-900 flex flex-col shadow-2xl">
            <SidebarContent mobile />
          </aside>
        </div>
      )}

      <main className="flex-1 overflow-auto">
        <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 sticky top-0 z-40">
          <div className="px-6 py-4 flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
            >
              <Menu className="w-6 h-6 text-slate-600 dark:text-slate-400" />
            </button>
            <div className="hidden md:block"><GlobalSearch /></div>
            <div className="flex items-center gap-2">
              <NotificationBell />
              <ThemeToggle />
            </div>
          </div>
        </header>
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}

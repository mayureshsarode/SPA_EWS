import { useState, type ReactNode } from "react";
import { Link } from "react-router";
import {
  BarChart3,
  BookOpen,
  Calendar,
  Home,
  LogOut,
  Menu,
  MessageSquare,
  Bell,
  Users,
  X,
} from "lucide-react";
import { ThemeToggle } from "./theme-toggle";
import { NotificationBell } from "./notification-bell";
import { useAuth } from "../contexts/auth-context";
import { useNavigate } from "react-router";

const navItems = [
  { icon: Home, label: "Dashboard", path: "/student" },
  { icon: BookOpen, label: "Subjects", path: "/student/subjects" },
  { icon: Users, label: "Course Faculty", path: "/student/faculty" },
  { icon: MessageSquare, label: "Mentor Chat", path: "/student/messages" },
];

export function StudentLayout({ children, activeItem }: { children: ReactNode; activeItem: string }) {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      {/* Header */}
      <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-bold text-slate-900 dark:text-white">SPA-EWS</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Student Portal</div>
            </div>
          </Link>
          <div className="flex items-center gap-2">
            {/* Tab Nav */}
            <nav className="hidden md:flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
              {navItems.map((item, i) => {
                const Icon = item.icon;
                const isActive = item.label === activeItem;
                return (
                  <Link
                    key={i}
                    to={item.path}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
            <NotificationBell />
            <ThemeToggle />
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 text-sm transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
        {/* Mobile nav */}
        <div className="md:hidden px-6 pb-3">
          <nav className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-xl p-1 overflow-x-auto">
            {navItems.map((item, i) => {
              const Icon = item.icon;
              const isActive = item.label === activeItem;
              return (
                <Link
                  key={i}
                  to={item.path}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 whitespace-nowrap ${
                    isActive
                      ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                      : "text-slate-600 dark:text-slate-400"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {children}
      </main>
    </div>
  );
}

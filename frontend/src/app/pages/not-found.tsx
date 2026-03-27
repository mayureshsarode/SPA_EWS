import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { Home, ArrowLeft, Search, AlertTriangle } from "lucide-react";
import { useAuth } from "../contexts/auth-context";

export function NotFoundPage() {
  const navigate = useNavigate();
  const { role } = useAuth();

  const dashboardMap: Record<string, string> = {
    student: "/student",
    faculty: "/faculty",
    admin: "/admin",
  };
  const home = role ? dashboardMap[role] : "/";

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Ambient blobs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-indigo-600/20 blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-violet-600/20 blur-[120px]" />
      </div>

      <motion.div
        className="relative z-10 text-center max-w-lg"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Icon */}
        <motion.div
          className="w-24 h-24 rounded-3xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-indigo-500/30"
          animate={{ rotate: [0, -5, 5, -3, 3, 0] }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          <AlertTriangle className="w-12 h-12 text-white" />
        </motion.div>

        {/* Error Code */}
        <div className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400 mb-4 leading-none">
          404
        </div>

        <h1 className="text-2xl font-bold text-white mb-3">Page Not Found</h1>
        <p className="text-slate-400 text-sm mb-10 leading-relaxed">
          The page you're looking for doesn't exist or you don't have permission to view it.<br />
          It may have been moved, deleted, or the URL is incorrect.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 font-medium text-sm transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Go Back
          </button>
          <button
            onClick={() => navigate(home)}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-medium text-sm shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-shadow"
          >
            <Home className="w-4 h-4" /> Go to Dashboard
          </button>
        </div>

        {/* Branding */}
        <div className="mt-12 flex items-center justify-center gap-2 text-slate-600 text-xs">
          <Search className="w-3.5 h-3.5" />
          <span>SPA-EWS · Student Performance Analytics</span>
        </div>
      </motion.div>
    </div>
  );
}

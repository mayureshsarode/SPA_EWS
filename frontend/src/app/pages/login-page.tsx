import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Lock, Mail, Users, User, ShieldCheck, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from "../contexts/auth-context";
import { api } from "../lib/api";

type RoleType = "student" | "faculty" | "admin";

function AlertTriangle(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
      <line x1="12" y1="9" x2="12" y2="13"></line>
      <line x1="12" y1="17" x2="12.01" y2="17"></line>
    </svg>
  );
}

export function LoginPage() {
  const [role, setRole] = useState<RoleType>("student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const user = await login(email, password, role);
      if (role === "admin" || user.role === "ADMIN") {
        navigate("/admin");
      } else if (role === "faculty" || user.role === "FACULTY") {
        navigate("/faculty");
      } else {
        navigate("/student");
      }
    } catch (err: any) {
      setError(err.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoFill = () => {
    if (role === "admin") {
      setEmail("admin@spa-ews.edu.in");
      setPassword("admin123");
    } else if (role === "faculty") {
      setEmail("meera.kulkarni@spa-ews.edu.in");
      setPassword("faculty123");
    } else {
      setEmail("ganesh.khare33@spa-ews.edu.in");
      setPassword("student123");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col md:flex-row">
      {/* Visual Section */}
      <div className="hidden md:flex flex-1 bg-indigo-600 relative overflow-hidden items-center justify-center p-12 lg:p-24">
        {/* Abstract Background Shapes */}
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-20 left-20 w-64 h-64 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
          <div className="absolute top-40 right-20 w-64 h-64 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-40 w-64 h-64 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative z-10 text-white max-w-xl">
          <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 mb-8">
            <span className="text-2xl font-black tracking-tighter">SPA</span>
          </div>
          <h1 className="text-4xl lg:text-5xl font-black mb-6 leading-tight">
            Next-Generation <br />
            <span className="text-indigo-200">Student Analytics.</span>
          </h1>
          <p className="text-lg text-indigo-100 font-medium mb-12 max-w-md leading-relaxed">
            Predictive early warning systems and comprehensive mentorship coordination.
          </p>

          <div className="grid grid-cols-2 gap-6 opacity-80">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <span className="font-semibold">3,000+ Students</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
              <span className="font-semibold">AI Predictors</span>
            </div>
          </div>
        </div>
      </div>

      {/* Login Form Section */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-24 bg-white dark:bg-slate-900 z-10">
        <div className="w-full max-w-sm mx-auto">
          {/* Mobile Header */}
          <div className="md:hidden flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-black">SPA</span>
            </div>
            <span className="text-xl font-black dark:text-white">SPA-EWS</span>
          </div>

          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-2">Welcome Back</h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium mb-8">Sign in to your account to continue</p>

          <AnimatePresence mode="popLayout">
            <motion.div key="login-form" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
              {/* Role Tabs */}
              <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl mb-8">
                {(["student", "faculty", "admin"] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => { setRole(r); setError(""); }}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 text-sm font-bold rounded-lg transition-all capitalize
                      ${role === r
                        ? "bg-white dark:bg-slate-700 shadow-sm text-indigo-600 dark:text-white"
                        : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                      }
                    `}
                  >
                    {r === "student" && <User className="w-4 h-4" />}
                    {r === "faculty" && <Users className="w-4 h-4" />}
                    {r === "admin" && <ShieldCheck className="w-4 h-4" />}
                    <span className="hidden sm:inline">{r}</span>
                  </button>
                ))}
              </div>

              <form className="space-y-5" onSubmit={handleLogin}>
                {error && (
                  <div className="p-3 bg-red-50 text-red-600 text-sm font-bold rounded-xl flex gap-2">
                    <AlertTriangle className="w-4 h-4 mt-0.5" /> {error}
                  </div>
                )}
                <div className="space-y-1">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Email Address</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      type="email"
                      required
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-slate-900 dark:text-white dark:placeholder-slate-500"
                      placeholder={`${role}@spa-ews.edu.in`}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Password</label>
                    <button type="button" className="text-sm font-bold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400">
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      type="password"
                      required
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-slate-900 dark:text-white dark:placeholder-slate-500"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-indigo-500/30 transition-all flex justify-center items-center gap-2 mt-4"
                >
                  {loading && <Loader2 className="w-5 h-5 animate-spin" />}
                  Sign In
                </button>
              </form>

              <div className="mt-8 pt-8 border-t border-slate-200 dark:border-slate-800 text-center">
                <button onClick={handleDemoFill} className="text-sm font-semibold text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-lg">
                  Autofill Demo Credentials
                </button>
                <p className="mt-4 text-xs text-slate-500 font-medium">Admin: admin@spa-ews.edu.in (admin123) | Faculty: meera.kulkarni@spa-ews.edu.in (faculty123) | Student: ganesh.khare33@spa-ews.edu.in (student123)</p>
              </div>
            </motion.div>
          </AnimatePresence>

        </div>
      </div>
    </div>
  );
}

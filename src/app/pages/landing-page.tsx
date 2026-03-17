import { Link } from "react-router";
import { motion } from "motion/react";
import {
  AlertTriangle,
  BarChart3,
  Shield,
  Zap,
  Database,
  TrendingUp,
  CheckCircle,
  Users,
  BookOpen,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { ThemeToggle } from "../components/theme-toggle";
import { AnimatedCounter } from "../components/animated-counter";

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: "easeOut" },
};

const stagger = {
  animate: { transition: { staggerChildren: 0.15 } },
};

const features = [
  {
    icon: AlertTriangle,
    title: "Early Risk Detection",
    desc: "Identify struggling students before it's too late with real-time monitoring and alerts.",
    gradient: "from-rose-500 to-orange-500",
    bg: "bg-rose-50 dark:bg-rose-950/30",
  },
  {
    icon: Zap,
    title: "Rule-Based Classification",
    desc: "Automated performance classification based on customizable attendance and marks thresholds.",
    gradient: "from-violet-500 to-indigo-500",
    bg: "bg-violet-50 dark:bg-violet-950/30",
  },
  {
    icon: TrendingUp,
    title: "Faculty Dashboard",
    desc: "Comprehensive view of student performance with actionable insights and detailed analytics.",
    gradient: "from-emerald-500 to-teal-500",
    bg: "bg-emerald-50 dark:bg-emerald-950/30",
  },
  {
    icon: Database,
    title: "ERP-Compatible",
    desc: "Seamlessly integrates with existing educational ERP systems. No data migration needed.",
    gradient: "from-blue-500 to-cyan-500",
    bg: "bg-blue-50 dark:bg-blue-950/30",
  },
];

const stats = [
  { value: 450, suffix: "+", label: "Students Tracked" },
  { value: 32, suffix: "+", label: "Faculty Members" },
  { value: 95, suffix: "%", label: "Early Detection Rate" },
  { value: 12, suffix: "+", label: "Departments" },
];

export function LandingPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 transition-colors duration-300">
      {/* Header */}
      <header className="border-b border-slate-200/60 dark:border-slate-800/60 bg-white/70 dark:bg-slate-950/70 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
              SPA-EWS
            </span>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
              How It Works
            </a>
            <a href="#stats" className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
              Stats
            </a>
            <ThemeToggle />
            <Link
              to="/login"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-sm font-medium hover:shadow-lg hover:shadow-indigo-500/25 hover:-translate-y-0.5 transition-all duration-300"
            >
              Login
            </Link>
          </nav>
          <div className="flex items-center gap-3 md:hidden">
            <ThemeToggle />
            <Link
              to="/login"
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-sm font-medium"
            >
              Login
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 -left-40 w-[500px] h-[500px] rounded-full bg-indigo-200/40 dark:bg-indigo-900/20 blur-3xl animate-pulse" />
          <div className="absolute top-20 -right-40 w-[400px] h-[400px] rounded-full bg-violet-200/40 dark:bg-violet-900/20 blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute -bottom-20 left-1/3 w-[350px] h-[350px] rounded-full bg-cyan-200/30 dark:bg-cyan-900/15 blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 py-24 md:py-36">
          <motion.div
            className="text-center max-w-4xl mx-auto"
            initial="initial"
            animate="animate"
            variants={stagger}
          >
            <motion.div variants={fadeUp}>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200/50 dark:border-indigo-800/30 text-indigo-700 dark:text-indigo-300 text-sm mb-8">
                <Sparkles className="w-4 h-4" />
                <span>Academic Analytics Platform</span>
              </div>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              className="text-5xl md:text-7xl font-extrabold text-slate-900 dark:text-white mb-6 leading-tight tracking-tight"
            >
              Student Performance
              <span className="block bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 bg-clip-text text-transparent">
                Analytics & EWS
              </span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              className="text-xl md:text-2xl text-slate-600 dark:text-slate-400 mb-12 max-w-2xl mx-auto leading-relaxed"
            >
              Use your existing data to{" "}
              <span className="text-indigo-600 dark:text-indigo-400 font-semibold">prevent failure</span>, not just record it.
            </motion.p>

            <motion.div
              variants={fadeUp}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link
                to="/faculty"
                className="group px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white hover:shadow-2xl hover:shadow-indigo-500/25 hover:-translate-y-1 transition-all duration-300 text-lg font-semibold w-full sm:w-auto flex items-center justify-center gap-2"
              >
                View Demo
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/login"
                className="px-8 py-4 rounded-2xl border-2 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all duration-300 text-lg font-semibold w-full sm:w-auto"
              >
                Login
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section id="stats" className="relative py-20 bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiLz48L3N2Zz4=')] opacity-50" />
        <div className="relative max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <motion.div
                key={i}
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <div className="text-4xl md:text-5xl font-extrabold text-white mb-2">
                  <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                </div>
                <div className="text-indigo-200 text-sm font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="max-w-7xl mx-auto px-6 py-24">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white mb-4 tracking-tight">
            Key Features
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Powerful analytics to identify at-risk students early and take action
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                whileHover={{ y: -8, transition: { duration: 0.25 } }}
                className="group relative p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl dark:hover:shadow-2xl dark:hover:shadow-indigo-500/5 transition-all duration-300 cursor-pointer overflow-hidden"
              >
                {/* Gradient overlay on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-[0.03] dark:group-hover:opacity-[0.08] transition-opacity duration-300`} />

                <div className="relative">
                  <div className={`w-14 h-14 rounded-2xl ${feature.bg} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className={`w-7 h-7 bg-gradient-to-br ${feature.gradient} bg-clip-text`} style={{ color: feature.gradient.includes('rose') ? '#f43f5e' : feature.gradient.includes('violet') ? '#8b5cf6' : feature.gradient.includes('emerald') ? '#10b981' : '#3b82f6' }} />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                    {feature.desc}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="bg-slate-50 dark:bg-slate-900/50 py-24 transition-colors">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white mb-4 tracking-tight">
              How It Works
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400">
              Three simple steps to transform your student data into actionable insights
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connecting line */}
            <div className="hidden md:block absolute top-16 left-[20%] right-[20%] h-0.5 bg-gradient-to-r from-indigo-300 via-violet-300 to-purple-300 dark:from-indigo-700 dark:via-violet-700 dark:to-purple-700" />

            {[
              { num: 1, title: "Collect ERP Data", desc: "Connect to your existing educational ERP system and automatically sync student attendance and performance data.", icon: Database },
              { num: 2, title: "Analyze Performance", desc: "Our rule-based engine analyzes data against configurable thresholds to classify student performance levels.", icon: BarChart3 },
              { num: 3, title: "Generate Warnings", desc: "Receive automated alerts for at-risk students, enabling timely intervention and support.", icon: AlertTriangle },
            ].map((step, i) => {
              const StepIcon = step.icon;
              return (
                <motion.div
                  key={i}
                  className="relative text-center"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.2 }}
                >
                  <div className="relative z-10 w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white flex items-center justify-center text-2xl font-bold mx-auto mb-6 shadow-lg shadow-indigo-500/25">
                    {step.num}
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                    {step.title}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed max-w-xs mx-auto">
                    {step.desc}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <motion.div
          className="relative rounded-3xl overflow-hidden"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {/* Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiLz48L3N2Zz4=')]" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-indigo-400/10 rounded-full blur-3xl" />

          <div className="relative p-12 md:p-16 text-center text-white">
            <h2 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight">
              Ready to get started?
            </h2>
            <p className="text-xl mb-10 text-indigo-100 max-w-xl mx-auto">
              Transform your student data into actionable insights today
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/faculty"
                className="group px-8 py-4 rounded-2xl bg-white text-indigo-600 hover:bg-indigo-50 transition-all duration-300 text-lg font-semibold shadow-xl w-full sm:w-auto flex items-center justify-center gap-2"
              >
                View Demo
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/login"
                className="px-8 py-4 rounded-2xl border-2 border-white/30 text-white hover:bg-white/10 transition-all duration-300 text-lg font-semibold w-full sm:w-auto"
              >
                Login
              </Link>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer id="footer" className="border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 transition-colors">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                  <BarChart3 className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-slate-900 dark:text-white">SPA-EWS</span>
              </div>
              <p className="text-slate-600 dark:text-slate-400 text-sm">
                Student Performance Analytics & Early Warning System
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-slate-900 dark:text-white mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#features" className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">Features</a></li>
                <li><a href="#how-it-works" className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">How It Works</a></li>
                <li><Link to="/faculty" className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">Demo</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-slate-900 dark:text-white mb-4">About</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">Support</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-slate-900 dark:text-white mb-4">Documentation</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">Getting Started</a></li>
                <li><a href="#" className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">API Reference</a></li>
                <li><a href="#" className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">Integration Guide</a></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-200 dark:border-slate-800 text-center text-sm text-slate-600 dark:text-slate-400">
            <p>&copy; 2026 SPA-EWS. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

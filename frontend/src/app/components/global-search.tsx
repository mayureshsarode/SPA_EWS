import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import {
  Search,
  X,
  User,
  GraduationCap,
  BookOpen,
  Users,
  AlertTriangle,
  ChevronRight,
} from "lucide-react";
import { students, faculties, departments } from "../data/mock-data";

interface SearchResult {
  id: string;
  label: string;
  sublabel: string;
  route: string;
  category: "student" | "faculty" | "course" | "department";
}

// Build a flat searchable index from mock data
function buildIndex(): SearchResult[] {
  const results: SearchResult[] = [];

  students.forEach((s) =>
    results.push({
      id: s.id,
      label: s.name,
      sublabel: `${s.department} · Sem ${s.semester} · Div ${s.division} · ${s.id}`,
      route: `/faculty/student/${s.id}`,
      category: "student",
    })
  );

  faculties.forEach((f) =>
    results.push({
      id: f.id,
      label: f.name,
      sublabel: `${f.designation} · ${f.department}`,
      route: `/admin/users`,
      category: "faculty",
    })
  );

  // Unique courses from all faculty
  const seenCourses = new Set<string>();
  faculties.forEach((f) =>
    f.courses.forEach((c) => {
      if (!seenCourses.has(c.courseCode)) {
        seenCourses.add(c.courseCode);
        results.push({
          id: c.courseCode,
          label: c.courseName,
          sublabel: `${c.courseCode} · Semester ${c.semester}`,
          route: `/admin/courses`,
          category: "course",
        });
      }
    })
  );

  departments.forEach((d) =>
    results.push({
      id: d.id,
      label: d.name,
      sublabel: `Dept ${d.code} · HOD: ${d.hod}`,
      route: `/admin/departments`,
      category: "department",
    })
  );

  return results;
}

const ALL_RESULTS = buildIndex();

const categoryConfig = {
  student: { icon: GraduationCap, color: "from-violet-500 to-indigo-500", label: "Student" },
  faculty: { icon: Users, color: "from-blue-500 to-cyan-500", label: "Faculty" },
  course: { icon: BookOpen, color: "from-emerald-500 to-teal-500", label: "Course" },
  department: { icon: AlertTriangle, color: "from-amber-500 to-orange-500", label: "Department" },
};

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [highlighted, setHighlighted] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // Keyboard shortcut Ctrl+K / Cmd+K
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
    else {
      setQuery("");
      setResults([]);
      setHighlighted(0);
    }
  }, [open]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const q = query.toLowerCase();
    const filtered = ALL_RESULTS.filter(
      (r) =>
        r.label.toLowerCase().includes(q) ||
        r.sublabel.toLowerCase().includes(q) ||
        r.id.toLowerCase().includes(q)
    ).slice(0, 8);
    setResults(filtered);
    setHighlighted(0);
  }, [query]);

  const handleSelect = (result: SearchResult) => {
    navigate(result.route);
    setOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlighted((h) => Math.min(h + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlighted((h) => Math.max(h - 1, 0));
    } else if (e.key === "Enter" && results[highlighted]) {
      handleSelect(results[highlighted]);
    }
  };

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-sm text-slate-500 dark:text-slate-400 min-w-[180px]"
      >
        <Search className="w-4 h-4 flex-shrink-0" />
        <span className="flex-1 text-left">Search…</span>
        <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-medium bg-slate-200 dark:bg-slate-700 rounded border border-slate-300 dark:border-slate-600">
          ⌘K
        </kbd>
      </button>

      {/* Modal */}
      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-[9999] flex items-start justify-center pt-24 px-4">
            {/* Backdrop */}
            <motion.div
              className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
            />

            {/* Panel */}
            <motion.div
              className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden"
              initial={{ opacity: 0, scale: 0.96, y: -8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -8 }}
              transition={{ duration: 0.15 }}
            >
              {/* Input row */}
              <div className="flex items-center gap-3 px-4 py-4 border-b border-slate-200 dark:border-slate-800">
                <Search className="w-5 h-5 text-slate-400 flex-shrink-0" />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Search students, faculty, courses…"
                  className="flex-1 bg-transparent text-slate-900 dark:text-white placeholder-slate-400 text-base outline-none"
                />
                {query && (
                  <button onClick={() => setQuery("")} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
                    <X className="w-4 h-4 text-slate-400" />
                  </button>
                )}
                <button
                  onClick={() => setOpen(false)}
                  className="text-xs text-slate-400 px-2 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 font-medium"
                >
                  ESC
                </button>
              </div>

              {/* Results */}
              {results.length > 0 ? (
                <ul className="max-h-80 overflow-y-auto py-2">
                  {results.map((r, i) => {
                    const cfg = categoryConfig[r.category];
                    const Icon = cfg.icon;
                    return (
                      <li key={r.id}>
                        <button
                          onClick={() => handleSelect(r)}
                          onMouseEnter={() => setHighlighted(i)}
                          className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                            i === highlighted
                              ? "bg-indigo-50 dark:bg-indigo-950/30"
                              : "hover:bg-slate-50 dark:hover:bg-slate-800/50"
                          }`}
                        >
                          <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${cfg.color} flex items-center justify-center flex-shrink-0`}>
                            <Icon className="w-4 h-4 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-semibold text-slate-900 dark:text-white truncate">{r.label}</div>
                            <div className="text-xs text-slate-500 dark:text-slate-400 truncate">{r.sublabel}</div>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wide">
                              {cfg.label}
                            </span>
                            <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600" />
                          </div>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              ) : query ? (
                <div className="py-12 text-center">
                  <User className="w-8 h-8 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
                  <p className="text-sm text-slate-500 dark:text-slate-400">No results for <span className="font-semibold text-slate-700 dark:text-slate-300">"{query}"</span></p>
                </div>
              ) : (
                <div className="py-8 text-center">
                  <p className="text-sm text-slate-400">Start typing to search students, faculty, courses, or departments.</p>
                  <div className="flex justify-center gap-4 mt-4">
                    {Object.entries(categoryConfig).map(([key, cfg]) => {
                      const Icon = cfg.icon;
                      return (
                        <div key={key} className="flex flex-col items-center gap-1.5">
                          <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${cfg.color} flex items-center justify-center`}>
                            <Icon className="w-4 h-4 text-white" />
                          </div>
                          <span className="text-[10px] text-slate-400 font-medium">{cfg.label}s</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

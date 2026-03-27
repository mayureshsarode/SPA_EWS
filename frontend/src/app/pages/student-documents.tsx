import { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Upload,
  FileText,
  CheckCircle,
  Clock,
  AlertCircle,
  X,
  BarChart3,
  Zap,
  BookOpen,
} from "lucide-react";
import { StudentLayout } from "../components/student-layout";

type UploadStatus = "idle" | "uploading" | "processing" | "success" | "error";

interface Assessment {
  id: string;
  vendor: string;
  date: string;
  status: "processed" | "pending";
  logical: number;
  quantitative: number;
  verbal: number;
  domain: number;
  percentile: number;
  aiInsight: string;
}

const mockAssessments: Assessment[] = [
  {
    id: "A001",
    vendor: "AMCAT",
    date: "Feb 14, 2026",
    status: "processed",
    logical: 780,
    quantitative: 620,
    verbal: 710,
    domain: 580,
    percentile: 72,
    aiInsight: "Strong logical reasoning. Quantitative and Domain (CS) scores suggest gap between conceptual and applied knowledge. Recommend focused coding practice.",
  },
];

const scoreBar = (value: number, max = 900, color: string) => (
  <div className="flex items-center gap-3">
    <div className="flex-1 h-2 rounded-full bg-slate-100 dark:bg-slate-800">
      <div
        className={`h-full rounded-full ${color}`}
        style={{ width: `${(value / max) * 100}%` }}
      />
    </div>
    <span className="text-sm font-bold text-slate-700 dark:text-slate-300 w-10 text-right">{value}</span>
  </div>
);

export function StudentDocuments() {
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>("idle");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const [fileName, setFileName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const simulateUpload = (name: string) => {
    setFileName(name);
    setUploadStatus("uploading");
    setUploadProgress(0);

    const interval = setInterval(() => {
      setUploadProgress((p) => {
        if (p >= 100) {
          clearInterval(interval);
          setUploadStatus("processing");
          setTimeout(() => setUploadStatus("success"), 2500);
          return 100;
        }
        return p + 10;
      });
    }, 120);
  };

  const handleFile = (file: File) => {
    if (file.type !== "application/pdf") {
      setUploadStatus("error");
      return;
    }
    simulateUpload(file.name);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  return (
    <StudentLayout activeItem="Assessments">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">External Assessments</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Upload your AMCAT, CoCubes, or TCS NQT PDF report. Our AI will extract scores and provide insights to your mentor.
          </p>
        </div>

        {/* Upload Zone */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => uploadStatus === "idle" && fileInputRef.current?.click()}
            className={`relative rounded-2xl border-2 border-dashed p-12 text-center transition-all cursor-pointer ${
              dragOver
                ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/20"
                : uploadStatus === "success"
                ? "border-emerald-400 bg-emerald-50 dark:bg-emerald-950/10"
                : uploadStatus === "error"
                ? "border-rose-400 bg-rose-50 dark:bg-rose-950/10"
                : "border-slate-300 dark:border-slate-700 hover:border-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 bg-white dark:bg-slate-900"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            />

            <AnimatePresence mode="wait">
              {uploadStatus === "idle" && (
                <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-500/20">
                    <Upload className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-lg mb-2">Drop your PDF here</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">or <span className="text-indigo-600 dark:text-indigo-400 font-medium">browse to upload</span></p>
                  <p className="text-xs text-slate-400 dark:text-slate-600 mt-2">Supports: AMCAT, CoCubes, TCS NQT, CampusReady PDFs</p>
                </motion.div>
              )}

              {uploadStatus === "uploading" && (
                <motion.div key="uploading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <FileText className="w-12 h-12 mx-auto mb-4 text-indigo-500" />
                  <p className="font-semibold text-slate-900 dark:text-white mb-1">{fileName}</p>
                  <div className="w-64 mx-auto h-2 rounded-full bg-slate-200 dark:bg-slate-700 mt-4">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500"
                      animate={{ width: `${uploadProgress}%` }}
                      transition={{ duration: 0.1 }}
                    />
                  </div>
                  <p className="text-sm text-slate-500 mt-3">{uploadProgress}% uploaded</p>
                </motion.div>
              )}

              {uploadStatus === "processing" && (
                <motion.div key="processing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <motion.div
                    className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center mx-auto mb-4"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  >
                    <Zap className="w-7 h-7 text-white" />
                  </motion.div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-lg mb-2">AI is parsing your PDF…</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Extracting scores and textual guidance. This takes a few seconds.</p>
                </motion.div>
              )}

              {uploadStatus === "success" && (
                <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/20">
                    <CheckCircle className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-lg mb-2">Report Processed!</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Scores extracted and shared with your mentor. See your results below.</p>
                  <button
                    onClick={(e) => { e.stopPropagation(); setUploadStatus("idle"); setUploadProgress(0); setFileName(""); }}
                    className="mt-4 text-xs px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 transition-colors"
                  >
                    Upload another
                  </button>
                </motion.div>
              )}

              {uploadStatus === "error" && (
                <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-rose-500 to-red-500 flex items-center justify-center mx-auto mb-4">
                    <X className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="font-bold text-rose-600 dark:text-rose-400 text-lg mb-2">Invalid File</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Only PDF files are accepted. Please try again.</p>
                  <button
                    onClick={(e) => { e.stopPropagation(); setUploadStatus("idle"); }}
                    className="mt-4 text-xs px-3 py-1.5 rounded-lg bg-rose-100 dark:bg-rose-950/30 text-rose-600 font-medium hover:bg-rose-200 transition-colors"
                  >
                    Try again
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Past Assessments */}
        <div>
          <h2 className="font-bold text-slate-900 dark:text-white mb-4">Past Assessments</h2>
          <div className="space-y-4">
            {mockAssessments.map((a) => (
              <motion.div
                key={a.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="flex flex-wrap items-start justify-between gap-4 mb-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                      <BarChart3 className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white">{a.vendor} Assessment Report</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">Taken: {a.date}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">{a.percentile}<span className="text-base font-semibold">th %ile</span></span>
                    {a.status === "processed" ? (
                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> Processed
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> Pending
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-3 mb-5">
                  <div><div className="text-xs font-medium text-slate-500 mb-1">Logical Reasoning</div>{scoreBar(a.logical, 900, "bg-gradient-to-r from-indigo-500 to-violet-500")}</div>
                  <div><div className="text-xs font-medium text-slate-500 mb-1">Quantitative Aptitude</div>{scoreBar(a.quantitative, 900, "bg-gradient-to-r from-blue-500 to-cyan-500")}</div>
                  <div><div className="text-xs font-medium text-slate-500 mb-1">Verbal Communication</div>{scoreBar(a.verbal, 900, "bg-gradient-to-r from-emerald-500 to-teal-500")}</div>
                  <div><div className="text-xs font-medium text-slate-500 mb-1">Domain Knowledge (CS)</div>{scoreBar(a.domain, 900, "bg-gradient-to-r from-amber-500 to-orange-500")}</div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 flex gap-3">
                  <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-bold text-blue-800 dark:text-blue-300 mb-1">AI Mentor Insight</div>
                    <p className="text-xs text-blue-700 dark:text-blue-400">{a.aiInsight}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </StudentLayout>
  );
}

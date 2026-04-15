import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Upload, FileText, CheckCircle, BrainCircuit, X, Search, ChevronRight, BarChart3, Target, Activity, Loader2 } from "lucide-react";
import { StudentLayout } from "../components/student-layout";
import { api } from "../lib/api";

interface AssessmentInsight {
  strengths?: string[];
  weaknesses?: string[];
  recommendation?: string;
}

interface Assessment {
  id: string;
  vendorName: string;
  dateTaken: string;
  logicalScore: number;
  quantitativeScore: number;
  verbalScore: number;
  domainScore: number;
  overallPercentile: number;
  parsedAnalysisPayload?: AssessmentInsight;
}

export function StudentAssessments() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);

  // Upload state
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploadState, setUploadState] = useState<"idle" | "uploading" | "analyzing" | "success" | "error">("idle");
  const [showInsightsModal, setShowInsightsModal] = useState<string | null>(null);

  useEffect(() => {
    api("/students/me/assessments")
      .then(res => setAssessments(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const selectedAssessment = assessments.find(a => a.id === showInsightsModal);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelection(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelection(e.target.files[0]);
    }
  };

  const handleFileSelection = (selectedFile: File) => {
    if (selectedFile.type !== "application/pdf") {
      alert("Only PDF files are supported.");
      return;
    }
    setFile(selectedFile);
  };

  const handleProcessDocument = async () => {
    if (!file) return;
    setUploadState("uploading");
    
    // Simulate upload progress
    await new Promise(resolve => setTimeout(resolve, 1500));
    setUploadState("analyzing");

    try {
      // POST fake file approach since this is mocked
      const res = await api("/students/me/assessments/upload", { method: "POST" });
      setAssessments([res.data, ...assessments]);
      setUploadState("success");
      setTimeout(() => {
        setUploadState("idle");
        setFile(null);
        setShowInsightsModal(res.data.id);
      }, 1500);
    } catch {
      setUploadState("error");
    }
  };

  const cancelUpload = () => {
    setFile(null);
    setUploadState("idle");
  };

  return (
    <StudentLayout activeItem="Assessments">
      <div className="space-y-6 max-w-5xl mx-auto">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">External Assessments</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Upload and analyzing AMCAT, TCS NQT, or CoCubes scorecards</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Uploader Section */}
          <div className="lg:col-span-1">
            <motion.div 
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden sticky top-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="p-6 border-b border-slate-200 dark:border-slate-800 bg-indigo-50/50 dark:bg-indigo-900/10">
                <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 flex items-center justify-center mb-4">
                  <BrainCircuit className="w-6 h-6" />
                </div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-1">AI Report Parser</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">Upload your PDF scorecard. Our AI will extract scores and identify your strengths.</p>
              </div>

              <div className="p-6">
                {!file ? (
                  <div
                    className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer
                      ${isDragging ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' : 'border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600'}
                    `}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".pdf" className="hidden" />
                    <Upload className="w-8 h-8 text-slate-400 mx-auto mb-3" />
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Click or drag PDF here</p>
                    <p className="text-xs text-slate-500 mt-1">Supports AMCAT, CoCubes, NQT</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                      <div className="w-10 h-10 rounded-lg bg-rose-100 text-rose-600 flex flex-shrink-0 items-center justify-center">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{file.name}</p>
                        <p className="text-xs text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                      {uploadState === "idle" && (
                        <button onClick={cancelUpload} className="p-1.5 text-slate-400 hover:text-rose-500 transition-colors">
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    {uploadState === "idle" && (
                      <button 
                        onClick={handleProcessDocument}
                        className="w-full flex items-center justify-center gap-2 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-colors"
                      >
                        Process Document
                      </button>
                    )}

                    {(uploadState === "uploading" || uploadState === "analyzing") && (
                      <div className="space-y-3">
                        <div className="flex justify-between text-xs font-bold text-indigo-600 dark:text-indigo-400">
                          <span>{uploadState === "uploading" ? "Uploading..." : "AI Analyzing..."}</span>
                          <span>{uploadState === "uploading" ? "45%" : "89%"}</span>
                        </div>
                        <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <motion.div 
                            className="h-full bg-indigo-600 rounded-full"
                            initial={{ width: uploadState === "uploading" ? "10%" : "45%" }}
                            animate={{ width: uploadState === "uploading" ? "45%" : "90%" }}
                            transition={{ duration: 1.5 }}
                          />
                        </div>
                      </div>
                    )}

                    {uploadState === "success" && (
                      <div className="flex items-center justify-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold py-2">
                        <CheckCircle className="w-5 h-5" />
                        Analysis Complete
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* History Section */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Your Assessment History</h2>
            
            {loading ? <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-indigo-500"/></div> : 
             assessments.length === 0 ? (
               <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center text-slate-500 pb-20">
                  <Target className="w-12 h-12 mx-auto mb-4 opacity-50"/>
                  <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">No Assessments Processed</h3>
                  <p className="mt-1">Upload your first scorecard on the left to see AI insights.</p>
               </div>
             ) : (
              <div className="grid grid-cols-1 gap-4">
                 {assessments.map((item, i) => (
                   <motion.div 
                     key={item.id}
                     className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors group cursor-pointer"
                     initial={{ opacity: 0, y: 10 }}
                     animate={{ opacity: 1, y: 0 }}
                     transition={{ delay: i * 0.1 }}
                     onClick={() => setShowInsightsModal(item.id)}
                   >
                     <div className="flex justify-between items-start mb-4">
                        <div>
                           <div className="flex items-center gap-2 mb-1">
                              <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-400 rounded-md text-xs font-bold">{item.vendorName}</span>
                              <span className="text-slate-500 text-xs font-medium">{new Date(item.dateTaken).toLocaleDateString()}</span>
                           </div>
                           <h3 className="font-bold text-slate-900 dark:text-white">Technical Assessment</h3>
                        </div>
                        <div className="w-12 h-12 rounded-full border-4 border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-black text-sm">
                           {item.overallPercentile}
                        </div>
                     </div>
                     <div className="grid grid-cols-4 gap-2 border-t border-slate-100 dark:border-slate-800 pt-4">
                        <div className="text-center">
                           <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">Logical</p>
                           <p className="font-bold text-slate-700 dark:text-slate-300">{item.logicalScore}</p>
                        </div>
                        <div className="text-center">
                           <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">Quant</p>
                           <p className="font-bold text-slate-700 dark:text-slate-300">{item.quantitativeScore}</p>
                        </div>
                        <div className="text-center">
                           <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">Verbal</p>
                           <p className="font-bold text-slate-700 dark:text-slate-300">{item.verbalScore}</p>
                        </div>
                        <div className="text-center">
                           <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">Domain</p>
                           <p className="font-bold text-slate-700 dark:text-slate-300">{item.domainScore}</p>
                        </div>
                     </div>
                   </motion.div>
                 ))}
              </div>
             )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showInsightsModal && selectedAssessment && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4">
             <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowInsightsModal(null)} />
             <motion.div 
               className="relative z-10 w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-2xl"
               initial={{ scale: 0.95, opacity: 0, y: 20 }}
               animate={{ scale: 1, opacity: 1, y: 0 }}
               exit={{ scale: 0.95, opacity: 0, y: 20 }}
             >
               <div className="bg-gradient-to-br from-indigo-600 to-violet-600 p-8 text-white relative">
                  <button onClick={() => setShowInsightsModal(null)} className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 transition-colors">
                     <X className="w-5 h-5" />
                  </button>
                  <div className="flex gap-4 items-center">
                     <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-md">
                        <BarChart3 className="w-8 h-8" />
                     </div>
                     <div>
                        <span className="px-2.5 py-1 rounded-full bg-white/20 text-xs font-bold tracking-wider mb-2 inline-block">
                           {selectedAssessment.vendorName}
                        </span>
                        <h2 className="text-2xl font-black">{selectedAssessment.overallPercentile}th Percentile</h2>
                        <p className="text-indigo-100 text-sm">Processed on {new Date(selectedAssessment.dateTaken).toLocaleDateString()}</p>
                     </div>
                  </div>
               </div>

               <div className="p-8 space-y-6">
                 {selectedAssessment.parsedAnalysisPayload ? (
                    <div className="space-y-6">
                       <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                          <div className="bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-900/30 rounded-2xl p-5">
                             <h4 className="font-bold text-emerald-800 dark:text-emerald-400 mb-3 flex items-center gap-2">
                                <Activity className="w-4 h-4"/> Key Strengths
                             </h4>
                             <ul className="space-y-2">
                                {selectedAssessment.parsedAnalysisPayload.strengths?.map(s => (
                                  <li key={s} className="text-sm font-medium text-emerald-900 dark:text-emerald-300 flex items-center gap-2 before:w-1.5 before:h-1.5 before:rounded-full before:bg-emerald-500">
                                     {s}
                                  </li>
                                ))}
                             </ul>
                          </div>
                          <div className="bg-rose-50 dark:bg-rose-900/10 border border-rose-200 dark:border-rose-900/30 rounded-2xl p-5">
                             <h4 className="font-bold text-rose-800 dark:text-rose-400 mb-3 flex items-center gap-2">
                                <Target className="w-4 h-4"/> Areas for Improvement
                             </h4>
                             <ul className="space-y-2">
                                {selectedAssessment.parsedAnalysisPayload.weaknesses?.map(w => (
                                  <li key={w} className="text-sm font-medium text-rose-900 dark:text-rose-300 flex items-center gap-2 before:w-1.5 before:h-1.5 before:rounded-full before:bg-rose-500">
                                     {w}
                                  </li>
                                ))}
                             </ul>
                          </div>
                       </div>
                       
                       <div className="bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-200 dark:border-indigo-900/30 rounded-2xl p-5">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-500 mb-2">AI Recommendation</h4>
                          <p className="text-indigo-900 dark:text-indigo-200 text-sm font-medium leading-relaxed">
                            "{selectedAssessment.parsedAnalysisPayload.recommendation}"
                          </p>
                       </div>
                    </div>
                 ) : (
                    <p className="text-center text-slate-500 py-8">Analysis not available for this legacy record.</p>
                 )}
               </div>
             </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </StudentLayout>
  );
}

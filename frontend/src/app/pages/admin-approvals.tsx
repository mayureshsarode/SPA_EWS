import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  CheckCircle,
  X,
  Clock,
  FileText,
  Users,
  ChevronDown,
  AlertTriangle,
  Filter,
} from "lucide-react";
import { AdminLayout } from "../components/admin-layout";

type RequestStatus = "pending" | "approved" | "rejected";

interface LeaveRequest {
  id: string;
  requester: string;
  requesterType: string;
  students: string[];
  leaveType: "DL" | "EXEMPTION";
  reason: string;
  dates: string;
  status: RequestStatus;
  submittedAt: string;
  document?: string;
}

const initialRequests: LeaveRequest[] = [
  {
    id: "LR001",
    requester: "Prof. Arjun Mehta",
    requesterType: "NSS Coordinator",
    students: ["Emily Johnson", "Michael Chen", "David Brown", "Sarah Williams"],
    leaveType: "DL",
    reason: "NSS Regional Camp — Annual Community Outreach",
    dates: "Mar 28 – Mar 30, 2026",
    status: "pending",
    submittedAt: "Today, 9:15 AM",
    document: "NSS_Camp_Letter_2026.pdf",
  },
  {
    id: "LR002",
    requester: "Prof. Sneha Iyer",
    requesterType: "Sports Coordinator",
    students: ["Jessica Martinez", "Robert Wilson"],
    leaveType: "DL",
    reason: "Inter-University Basketball Tournament",
    dates: "Apr 5 – Apr 7, 2026",
    status: "pending",
    submittedAt: "Yesterday, 4:30 PM",
    document: "Basketball_Tournament_Letter.pdf",
  },
  {
    id: "LR003",
    requester: "Prof. Rahul Verma",
    requesterType: "Cultural Coordinator",
    students: ["Olivia Garcia", "Daniel Moore", "Sophia Lee"],
    leaveType: "EXEMPTION",
    reason: "National Level Technical Festival Representatives",
    dates: "Mar 20 – Mar 22, 2026",
    status: "approved",
    submittedAt: "Mar 18, 11:00 AM",
    document: "Techfest_Participation_Letter.pdf",
  },
  {
    id: "LR004",
    requester: "Prof. Kavita Sharma",
    requesterType: "IEEE Student Branch",
    students: ["Matthew Harris", "Emma Taylor"],
    leaveType: "DL",
    reason: "IEEE Regional Conference Paper Presentation",
    dates: "Mar 15, 2026",
    status: "rejected",
    submittedAt: "Mar 12, 3:00 PM",
    document: "IEEE_Conference_Letter.pdf",
  },
];

const statusConfig = {
  pending: { label: "Pending", color: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400", icon: Clock },
  approved: { label: "Approved", color: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400", icon: CheckCircle },
  rejected: { label: "Rejected", color: "bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400", icon: X },
};

const leaveTypeConfig = {
  DL: { label: "Duty Leave", color: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400" },
  EXEMPTION: { label: "Exemption", color: "bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400" },
};

export function AdminApprovals() {
  const [requests, setRequests] = useState(initialRequests);
  const [filter, setFilter] = useState<RequestStatus | "all">("all");
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = filter === "all" ? requests : requests.filter((r) => r.status === filter);
  const pendingCount = requests.filter((r) => r.status === "pending").length;

  const updateStatus = (id: string, status: "approved" | "rejected") => {
    setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
    if (expanded === id) setExpanded(null);
  };

  return (
    <AdminLayout activeItem="Approvals">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-3">
              Approvals Inbox
              {pendingCount > 0 && (
                <span className="px-2.5 py-0.5 rounded-full text-sm font-bold bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400">
                  {pendingCount} pending
                </span>
              )}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Duty Leave and Exemption requests requiring HOD approval
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            {(["all", "pending", "approved", "rejected"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                  filter === f
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Requests */}
        <div className="space-y-3">
          <AnimatePresence>
            {filtered.map((req) => {
              const statusCfg = statusConfig[req.status];
              const StatusIcon = statusCfg.icon;
              const leaveCfg = leaveTypeConfig[req.leaveType];
              const isExpanded = expanded === req.id;

              return (
                <motion.div
                  key={req.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
                >
                  {/* Request Row */}
                  <button
                    onClick={() => setExpanded(isExpanded ? null : req.id)}
                    className="w-full text-left p-5 flex flex-wrap items-center gap-4"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        <span className={`px-2 py-0.5 rounded-md text-xs font-bold ${leaveCfg.color}`}>{leaveCfg.label}</span>
                        <span className={`px-2 py-0.5 rounded-md text-xs font-semibold flex items-center gap-1 ${statusCfg.color}`}>
                          <StatusIcon className="w-3 h-3" />{statusCfg.label}
                        </span>
                      </div>
                      <div className="font-semibold text-slate-900 dark:text-white truncate">{req.reason}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {req.requester} ({req.requesterType}) · {req.dates}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <div className="flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-400">
                        <Users className="w-4 h-4" />
                        <span className="font-semibold">{req.students.length}</span>
                        <span className="text-xs">students</span>
                      </div>
                      <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                    </div>
                  </button>

                  {/* Expanded Details */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="px-5 pb-5 border-t border-slate-100 dark:border-slate-800 pt-4 space-y-4">
                          {/* Students */}
                          <div>
                            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">Affected Students</div>
                            <div className="flex flex-wrap gap-2">
                              {req.students.map((s) => (
                                <span key={s} className="px-3 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                                  {s}
                                </span>
                              ))}
                            </div>
                          </div>

                          {/* Document */}
                          {req.document && (
                            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                              <FileText className="w-5 h-5 text-indigo-500 flex-shrink-0" />
                              <span className="text-sm text-slate-700 dark:text-slate-300 font-medium">{req.document}</span>
                              <span className="ml-auto text-xs text-indigo-600 dark:text-indigo-400 font-medium cursor-pointer hover:underline">View</span>
                            </div>
                          )}

                          {/* Info Banner */}
                          <div className="flex items-start gap-2 p-3 rounded-xl bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 text-xs text-blue-700 dark:text-blue-400">
                            <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                            <p>Approving this request will automatically adjust <strong>Duty Leaves Granted</strong> tallies for all {req.students.length} students across their enrolled courses for the specified dates.</p>
                          </div>

                          {/* Action Buttons */}
                          {req.status === "pending" && (
                            <div className="flex gap-3 pt-1">
                              <button
                                onClick={() => updateStatus(req.id, "approved")}
                                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold text-sm shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-shadow"
                              >
                                <CheckCircle className="w-4 h-4" /> Approve Request
                              </button>
                              <button
                                onClick={() => updateStatus(req.id, "rejected")}
                                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-sm hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/20 dark:hover:text-rose-400 transition-colors"
                              >
                                <X className="w-4 h-4" /> Reject
                              </button>
                            </div>
                          )}
                          {req.status !== "pending" && (
                            <p className="text-xs text-slate-400 dark:text-slate-600 text-center">
                              This request has already been {req.status}.
                            </p>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {filtered.length === 0 && (
            <div className="text-center py-16">
              <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
              <p className="font-semibold text-slate-700 dark:text-slate-300">All caught up!</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">No {filter !== "all" ? filter : ""} requests to show.</p>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}

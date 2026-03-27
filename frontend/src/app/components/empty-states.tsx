/**
 * Empty State components for SPA-EWS.
 * Use these when a data fetch returns 0 rows instead of showing a blank table/list.
 *
 * Usage:
 *   {students.length === 0 && <EmptyStudents />}
 *   {alerts.length === 0 && <EmptyAlerts />}
 *   {messages.length === 0 && <EmptyMessages />}
 *   {courses.length === 0 && <EmptyData label="No courses assigned" description="Contact admin." />}
 */

import { Users, Bell, MessageSquare, BookOpen, FileText, Search, CalendarDays, BarChart3 } from "lucide-react";

interface EmptyDataProps {
  icon?: React.ReactNode;
  label: string;
  description?: string;
  action?: { label: string; onClick: () => void };
}

// ─── Generic base ─────────────────────────────────────────────────────────────
export function EmptyData({ icon, label, description, action }: EmptyDataProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center gap-3">
      <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-600 mb-1">
        {icon ?? <FileText className="w-7 h-7" />}
      </div>
      <p className="font-semibold text-slate-700 dark:text-slate-300">{label}</p>
      {description && (
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs">{description}</p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className="mt-2 px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}

// ─── Specific presets ─────────────────────────────────────────────────────────

/** For the /faculty/students and /admin/users table */
export function EmptyStudents({ onUpload }: { onUpload?: () => void }) {
  return (
    <EmptyData
      icon={<Users className="w-7 h-7" />}
      label="No students found"
      description="No students match your current filters, or none have been added to this division yet."
      action={onUpload ? { label: "Upload CSV", onClick: onUpload } : undefined}
    />
  );
}

/** For the /faculty/alerts and /admin/alerts page */
export function EmptyAlerts() {
  return (
    <EmptyData
      icon={<Bell className="w-7 h-7" />}
      label="All clear — no active alerts"
      description="No students are currently flagged. Keep up the great mentoring work!"
    />
  );
}

/** For the messages inbox (no threads) */
export function EmptyMessages() {
  return (
    <EmptyData
      icon={<MessageSquare className="w-7 h-7" />}
      label="No conversations yet"
      description="Once you or your mentees send a message, threads will appear here."
    />
  );
}

/** For /faculty/courses and /admin/courses */
export function EmptyCourses({ onAdd }: { onAdd?: () => void }) {
  return (
    <EmptyData
      icon={<BookOpen className="w-7 h-7" />}
      label="No courses assigned"
      description="You haven't been assigned any courses this semester. Contact the administrator."
      action={onAdd ? { label: "Add Course", onClick: onAdd } : undefined}
    />
  );
}

/** For /faculty/attendance when no session is selected */
export function EmptyAttendance() {
  return (
    <EmptyData
      icon={<CalendarDays className="w-7 h-7" />}
      label="Select a course to mark attendance"
      description="Choose a course and division from the dropdowns above to start a session."
    />
  );
}

/** For /admin/reports when no reports exist */
export function EmptyReports() {
  return (
    <EmptyData
      icon={<BarChart3 className="w-7 h-7" />}
      label="No reports generated yet"
      description="Click 'Generate New Report' to create your first institutional report."
    />
  );
}

/** For global search with no results */
export function EmptySearchResults({ query }: { query: string }) {
  return (
    <EmptyData
      icon={<Search className="w-7 h-7" />}
      label={`No results for "${query}"`}
      description="Try a different search term, or check the spelling."
    />
  );
}

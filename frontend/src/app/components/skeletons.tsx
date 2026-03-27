/**
 * Skeleton Loader components for SPA-EWS.
 * Used as placeholders while data is being fetched from the backend.
 * Drop-in replacements during loading state:
 *   <SkeletonCard />         — replaces a stat KPI card
 *   <SkeletonTable />        — replaces a data table
 *   <SkeletonProfile />      — replaces the student detail profile header
 *   <SkeletonChatThread />   — replaces a conversation thread list
 *   <SkeletonHeatmap />      — replaces the EWS heatmap grid
 */

const shimmer = "animate-pulse bg-slate-200 dark:bg-slate-800 rounded-lg";

// ─── Stat / KPI Card ─────────────────────────────────────────────────────────
export function SkeletonCard() {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 space-y-3">
      <div className={`${shimmer} w-10 h-10 rounded-xl`} />
      <div className={`${shimmer} h-8 w-20`} />
      <div className={`${shimmer} h-4 w-32`} />
    </div>
  );
}

// ─── Data Table ───────────────────────────────────────────────────────────────
export function SkeletonTable({ rows = 6, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
      {/* Header */}
      <div className="flex gap-4 px-6 py-4 border-b border-slate-100 dark:border-slate-800">
        {Array.from({ length: cols }).map((_, i) => (
          <div key={i} className={`${shimmer} h-4 flex-1`} style={{ maxWidth: i === 0 ? 120 : undefined }} />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, ri) => (
        <div key={ri} className="flex gap-4 px-6 py-4 border-b border-slate-100 dark:border-slate-800 last:border-none">
          {Array.from({ length: cols }).map((_, ci) => (
            <div
              key={ci}
              className={`${shimmer} h-4 flex-1`}
              style={{ opacity: 1 - ri * 0.07, maxWidth: ci === 0 ? 120 : undefined }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

// ─── Student Profile Header ───────────────────────────────────────────────────
export function SkeletonProfile() {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
      {/* Coloured top ribbon */}
      <div className="h-2 bg-gradient-to-r from-slate-200 to-slate-300 dark:from-slate-800 dark:to-slate-700 animate-pulse" />
      <div className="p-6 flex flex-wrap items-start gap-5">
        {/* Avatar */}
        <div className={`${shimmer} w-16 h-16 rounded-2xl flex-shrink-0`} />
        {/* Info */}
        <div className="flex-1 min-w-0 space-y-2">
          <div className={`${shimmer} h-6 w-48`} />
          <div className="flex flex-wrap gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className={`${shimmer} h-4 w-28`} />
            ))}
          </div>
        </div>
        {/* Button */}
        <div className={`${shimmer} h-10 w-24 rounded-xl`} />
      </div>
      {/* Stats row */}
      <div className="border-t border-slate-100 dark:border-slate-800 grid grid-cols-3 divide-x divide-slate-100 dark:divide-slate-800">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="px-6 py-4 space-y-2">
            <div className={`${shimmer} h-7 w-16`} />
            <div className={`${shimmer} h-3 w-20`} />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Tab Content (chart area) ─────────────────────────────────────────────────
export function SkeletonChart({ height = 200 }: { height?: number }) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
      <div className={`${shimmer} h-5 w-40`} />
      <div className={`${shimmer} rounded-xl w-full`} style={{ height }} />
    </div>
  );
}

// ─── Chat Thread List ─────────────────────────────────────────────────────────
export function SkeletonChatThread({ count = 4 }: { count?: number }) {
  return (
    <div className="divide-y divide-slate-100 dark:divide-slate-800">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-4">
          <div className={`${shimmer} w-10 h-10 rounded-full flex-shrink-0`} />
          <div className="flex-1 space-y-2">
            <div className={`${shimmer} h-4 w-32`} />
            <div className={`${shimmer} h-3 w-48`} />
          </div>
          <div className={`${shimmer} h-3 w-12`} />
        </div>
      ))}
    </div>
  );
}

// ─── EWS Heatmap Grid ────────────────────────────────────────────────────────
export function SkeletonHeatmap({ rows = 6, cols = 8 }: { rows?: number; cols?: number }) {
  return (
    <div className="space-y-2">
      {/* Header row (semesters) */}
      <div className="flex gap-2 pl-32">
        {Array.from({ length: cols }).map((_, i) => (
          <div key={i} className={`${shimmer} flex-1 h-4`} />
        ))}
      </div>
      {/* Data rows */}
      {Array.from({ length: rows }).map((_, ri) => (
        <div key={ri} className="flex items-center gap-2">
          <div className={`${shimmer} h-4 w-28 flex-shrink-0`} />
          {Array.from({ length: cols }).map((_, ci) => (
            <div key={ci} className={`${shimmer} flex-1 h-10 rounded-lg`} style={{ opacity: 1 - ri * 0.06 }} />
          ))}
        </div>
      ))}
    </div>
  );
}

// ─── Notification List ────────────────────────────────────────────────────────
export function SkeletonNotifications({ count = 4 }: { count?: number }) {
  return (
    <div className="divide-y divide-slate-100 dark:divide-slate-800">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-start gap-3 p-4">
          <div className={`${shimmer} w-8 h-8 rounded-lg flex-shrink-0`} />
          <div className="flex-1 space-y-2">
            <div className={`${shimmer} h-4 w-36`} />
            <div className={`${shimmer} h-3 w-52`} />
            <div className={`${shimmer} h-3 w-20`} />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Convenience: grid of SkeletonCards ──────────────────────────────────────
export function SkeletonKPIGrid({ count = 4 }: { count?: number }) {
  return (
    <div className={`grid grid-cols-2 lg:grid-cols-${count} gap-5`}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

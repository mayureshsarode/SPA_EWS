import { Component, type ReactNode } from "react";
import { WifiOff, RefreshCw, Home, AlertTriangle } from "lucide-react";

interface Props {
  children: ReactNode;
  /** Optional context name for display (e.g. "Dashboard", "Student Profile") */
  context?: string;
  /** Rendered inline inside a card instead of full-page */
  inline?: boolean;
}

interface State {
  hasError: boolean;
  errorMessage: string;
  isNetworkError: boolean;
}

/**
 * <ErrorBoundary>
 * Wraps any subtree. Catches JS runtime errors AND intentional API errors
 * surfaced as thrown Error objects.
 *
 * Usage:
 *   <ErrorBoundary context="Faculty Dashboard">
 *     <FacultyDashboard />
 *   </ErrorBoundary>
 *
 *   // Inline card (for a single data widget)
 *   <ErrorBoundary context="Attendance Chart" inline>
 *     <AttendanceChart />
 *   </ErrorBoundary>
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, errorMessage: "", isNetworkError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    const isNetwork =
      error.message.includes("Failed to fetch") ||
      error.message.includes("NetworkError") ||
      error.message.includes("ECONNREFUSED") ||
      error.message.includes("net::");
    return {
      hasError: true,
      errorMessage: error.message,
      isNetworkError: isNetwork,
    };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // In production, send to error tracking (e.g. Sentry)
    console.error("[ErrorBoundary]", error, info.componentStack);
  }

  handleRetry = () => {
    this.setState({ hasError: false, errorMessage: "", isNetworkError: false });
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    const { context = "This page", inline = false } = this.props;
    const { isNetworkError } = this.state;

    if (inline) {
      return (
        <div className="flex flex-col items-center justify-center gap-3 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-center">
          {isNetworkError ? (
            <WifiOff className="w-8 h-8 text-slate-400 dark:text-slate-600" />
          ) : (
            <AlertTriangle className="w-8 h-8 text-amber-400" />
          )}
          <p className="font-semibold text-slate-700 dark:text-slate-300 text-sm">
            {isNetworkError ? "Server unreachable" : "Something went wrong"}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {isNetworkError
              ? "Check your connection or wait for the server to come back online."
              : `Could not load ${context}.`}
          </p>
          <button
            onClick={this.handleRetry}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 transition-colors font-medium"
          >
            <RefreshCw className="w-3 h-3" /> Retry
          </button>
        </div>
      );
    }

    // Full-page error
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden">
        {/* Ambient */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/3 left-1/3 w-80 h-80 rounded-full bg-rose-600/10 blur-[100px]" />
          <div className="absolute bottom-1/3 right-1/3 w-64 h-64 rounded-full bg-amber-500/10 blur-[100px]" />
        </div>

        <div className="relative z-10 text-center max-w-md">
          <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl ${isNetworkError ? "bg-gradient-to-br from-amber-500 to-orange-500 shadow-amber-500/25" : "bg-gradient-to-br from-rose-500 to-red-500 shadow-rose-500/25"}`}>
            {isNetworkError
              ? <WifiOff className="w-10 h-10 text-white" />
              : <AlertTriangle className="w-10 h-10 text-white" />}
          </div>

          <h1 className="text-2xl font-bold text-white mb-3">
            {isNetworkError ? "Server Unreachable" : "Something went wrong"}
          </h1>

          <p className="text-slate-400 text-sm mb-2 leading-relaxed">
            {isNetworkError
              ? `Could not connect to the SPA-EWS backend. The server may be offline or your connection may be unstable.`
              : `An unexpected error occurred while loading ${context}. If the problem persists, contact your system administrator.`}
          </p>

          {!isNetworkError && this.state.errorMessage && (
            <p className="text-xs text-slate-600 font-mono bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 mt-3 mb-6 text-left break-all">
              {this.state.errorMessage}
            </p>
          )}

          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
            <button
              onClick={this.handleRetry}
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-semibold text-sm shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-shadow"
            >
              <RefreshCw className="w-4 h-4" /> Try Again
            </button>
            <button
              onClick={() => (window.location.href = "/")}
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 font-semibold text-sm transition-colors"
            >
              <Home className="w-4 h-4" /> Go Home
            </button>
          </div>

          <p className="text-slate-700 text-xs mt-8">SPA-EWS · Student Performance Analytics</p>
        </div>
      </div>
    );
  }
}

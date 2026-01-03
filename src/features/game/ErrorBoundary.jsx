// src/features/game/ErrorBoundary.jsx
import React from "react";
import { reportError } from "@/lib/errorReporter.js";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, showDetails: false };
  }

  static getDerivedStateFromError(err) {
    return { hasError: true, error: err };
  }

  componentDidCatch(error, info) {
    // Minimal logging — keep console visible for debugging.
    // You can extend this to send errors to analytics if desired.
    console.error("ErrorBoundary caught:", error, info);

    // If parent provided an error reporting callback, call it safely,
    // otherwise use the default reporter.
    try {
      if (typeof this.props.onError === "function") {
        this.props.onError({ error, info });
      } else {
        reportError({ error, info, component: this.constructor?.name });
      }
    } catch (e) {
      // don't let reporting cause further crashes
      console.warn("ErrorBoundary onError callback threw:", e);
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
    // attempt a soft reload of child UI
    if (typeof this.props.onRetry === "function") {
      this.props.onRetry();
    }
  };

  handleToggleDetails = () => {
    this.setState((s) => ({ showDetails: !s.showDetails }));
  };

  render() {
    if (!this.state.hasError) return this.props.children || null;

    const isDev = process?.env?.NODE_ENV === "development";

    const details = this.state.error ? (
      <pre className="mt-3 max-h-48 overflow-auto text-xs text-red-100 bg-black/20 p-3 rounded">
        {String(
          this.state.error &&
            (this.state.error.stack ||
              this.state.error.message ||
              this.state.error),
        )}
      </pre>
    ) : null;

    const fallback = this.props.fallback || (
      <div
        role="alert"
        aria-live="assertive"
        className="p-4 bg-red-900/10 rounded-md border border-red-700 text-red-200"
      >
        <strong>Something went wrong rendering this panel.</strong>
        <div className="mt-2 text-xs">
          Try retrying or check the console for details.
        </div>
        <div className="mt-3 flex items-center gap-2">
          <button
            onClick={this.handleRetry}
            className="px-3 py-1 rounded bg-amber-600 hover:bg-amber-500 text-black text-sm"
          >
            Retry
          </button>

          <button
            onClick={() => window.location.reload()}
            className="ml-2 px-3 py-1 rounded border border-zinc-700 text-zinc-200 text-sm"
          >
            Hard Reload
          </button>

          {(isDev || this.props.showDetails) && (
            <button
              onClick={this.handleToggleDetails}
              aria-pressed={!!this.state.showDetails}
              className="ml-2 px-3 py-1 rounded border border-zinc-700 text-zinc-200 text-sm"
            >
              {this.state.showDetails ? "Hide details" : "Show details"}
            </button>
          )}
        </div>
        {this.state.showDetails ? details : null}
      </div>
    );

    return fallback;
  }
}

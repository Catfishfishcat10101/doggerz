// src/layout/RouteBoundary.jsx
import React from "react";
import { useLocation } from "react-router-dom";

/** Class error boundary (the real catcher) */
class RouteBoundaryInner extends React.Component {
  constructor(props) {
    super(props);
    this.state = { err: null, info: null, copied: false };
    this.onRetry = this.onRetry.bind(this);
    this.copyDetails = this.copyDetails.bind(this);
  }

  static getDerivedStateFromError(err) {
    return { err };
  }

  componentDidCatch(err, info) {
    // eslint-disable-next-line no-console
    console.error("RouteBoundary:", err, info);
    this.setState({ info });
    try {
      this.props.onReport?.({ error: err, info });
    } catch {}
  }

  componentDidUpdate(prevProps) {
    if (this.props.resetKey !== prevProps.resetKey) {
      this.setState({ err: null, info: null, copied: false });
      this.props.onReset?.();
    }
  }

  onRetry() {
    this.setState({ err: null, info: null, copied: false });
    this.props.onReset?.();
  }

  async copyDetails() {
    try {
      const payload = this.serialize();
      await navigator.clipboard.writeText(payload);
      this.setState({ copied: true });
      setTimeout(() => this.setState({ copied: false }), 1200);
    } catch {}
  }

  serialize() {
    const { err, info } = this.state;
    const { location } = this.props;
    const summary = {
      message: String(err?.message ?? err ?? "Unknown error"),
      stack: String(err?.stack ?? ""),
      componentStack: String(info?.componentStack ?? ""),
      path: location?.pathname ?? "",
      search: location?.search ?? "",
      time: new Date().toISOString(),
      userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "",
    };
    return [
      `Error: ${summary.message}`,
      summary.stack ? `\n${summary.stack}` : "",
      summary.componentStack ? `\nComponentStack:${summary.componentStack}` : "",
      `\nPath: ${summary.path}${summary.search}`,
      `Time: ${summary.time}`,
      `UA: ${summary.userAgent}`,
    ].join("\n");
  }

  render() {
    const { err, info, copied } = this.state;
    if (!err) return this.props.children;

    const message = String(err?.message ?? err ?? "Unknown error");

    return (
      <div className="rounded-2xl border border-rose-400/30 bg-rose-900/15 p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="font-semibold text-rose-100">Something went wrong.</div>
            <div className="mt-1 text-sm text-rose-200/90 break-words">{message}</div>
          </div>

          <div className="flex gap-2 shrink-0">
            <button onClick={this.onRetry} className="btn btn--ghost" aria-label="Retry render">
              Retry
            </button>
            <a href="/" className="btn btn--ghost" aria-label="Go to home page">
              Home
            </a>
            <button onClick={this.copyDetails} className="btn btn--ghost" aria-label="Copy error details" title="Copy details">
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
        </div>

        <details className="mt-3 text-xs text-rose-100/80">
          <summary className="cursor-pointer select-none">Details</summary>
          <pre className="mt-2 max-h-72 overflow-auto whitespace-pre-wrap">
{this.serialize()}
          </pre>
          {info?.componentStack && (
            <>
              <div className="mt-2 opacity-80">Component stack:</div>
              <pre className="mt-1 max-h-60 overflow-auto whitespace-pre-wrap">
{String(info.componentStack).trim()}
              </pre>
            </>
          )}
        </details>
      </div>
    );
  }
}

/** Hook wrapper to inject location without external helper */
export default function RouteBoundary(props) {
  const location = useLocation();
  const resetKey = props.resetKey ?? location.pathname; // default reset on path change
  return <RouteBoundaryInner {...props} location={location} resetKey={resetKey} />;
}

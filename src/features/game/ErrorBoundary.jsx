// src/features/game/ErrorBoundary.jsx
import React from "react";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(err) {
    return { hasError: true, error: err };
  }

  componentDidCatch(error, info) {
    // Minimal logging — keep console visible for debugging.
    // You can extend this to send errors to analytics if desired.
    // eslint-disable-next-line no-console
    console.error("ErrorBoundary caught:", error, info);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
    // attempt a soft reload of child UI
    if (typeof this.props.onRetry === "function") {
      this.props.onRetry();
    }
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children || null;
    }

    const fallback = this.props.fallback || (
      <div className="p-4 bg-red-900/10 rounded-md border border-red-700 text-red-200">
        <strong>Something went wrong rendering this panel.</strong>
        {this.state.error && (
          <div className="mt-2 text-xs text-red-300">
            {typeof this.state.error === "string"
              ? this.state.error
              : this.state.error?.message || String(this.state.error)}
          </div>
        )}
        <div className="mt-2 text-xs">
          Try retrying or check the console for details.
        </div>
        <div className="mt-3">
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
        </div>
      </div>
    );

    return fallback;
  }
}

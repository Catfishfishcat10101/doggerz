import React from "react";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, info) {
    // Optional: send to analytics/logging here
    // console.error("[ErrorBoundary]", error, info);
  }
  handleReset = () => {
    this.setState({ hasError: false, error: null });
    // Best-effort soft reset
    if (typeof window !== "undefined") window.location.assign("/");
  };
  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <div className="min-h-dvh grid place-items-center bg-stone-950 text-white p-6">
        <div className="max-w-lg w-full bg-white/5 rounded-2xl p-6">
          <h1 className="text-2xl font-bold">Something broke</h1>
          <p className="mt-2 text-white/70">
            The UI hit an unexpected error. You can try reloading Doggerz.
          </p>
          {this.state.error && (
            <pre className="mt-4 text-xs bg-black/40 p-3 rounded overflow-auto">
              {String(this.state.error?.stack || this.state.error)}
            </pre>
          )}
          <button
            onClick={this.handleReset}
            className="mt-4 px-4 py-2 rounded bg-white text-black font-semibold"
          >
            Reload
          </button>
        </div>
      </div>
    );
  }
}
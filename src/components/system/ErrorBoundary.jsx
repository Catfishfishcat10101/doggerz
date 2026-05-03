// src/components/system/ErrorBoundary.jsx
import React from "react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // You could plug your reportError(error, errorInfo) here later!
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      const isDev = import.meta.env.DEV; // Vite's way to check for Dev mode
      return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-6 text-center">
          <h1 className="text-2xl font-bold text-slate-900">
            Something went wrong.
          </h1>
          <p className="mt-2 text-slate-600">
            The Doggerz yard is having some technical difficulties.
          </p>

          {isDev && (
            <pre className="mt-4 max-w-full overflow-auto rounded bg-red-50 p-4 text-left text-xs text-red-700">
              {this.state.error?.toString()}
            </pre>
          )}

          <button
            onClick={() => window.location.reload()}
            className="mt-6 rounded-full bg-amber-500 px-6 py-2 font-semibold text-white transition hover:bg-amber-600"
          >
            Refresh Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

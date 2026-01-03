// src/components/ErrorBoundary.jsx

import * as React from 'react';

/**
 * Simple React render error boundary.
 * - Catches render/constructor/lifecycle errors.
 * - Does NOT catch event handler errors.
 */
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, errorInfo) {
    try {
      this.props?.onError?.(error, errorInfo);
    } catch {
      // ignore
    }
  }

  render() {
    const { error } = this.state;

    if (error) {
      const Fallback = this.props.fallback;
      if (Fallback) return <Fallback error={error} reset={() => this.setState({ error: null })} />;

      return (
        <div className="min-h-[60vh] grid place-items-center bg-zinc-950 text-zinc-100 px-6">
          <div className="max-w-lg w-full rounded-2xl border border-zinc-800 bg-zinc-950/60 p-5">
            <div className="text-lg font-semibold">Something went wrong</div>
            <div className="mt-2 text-sm text-zinc-400">Try refreshing the page.</div>
            <button
              type="button"
              className="mt-4 rounded-md bg-emerald-500/20 border border-emerald-500/30 px-3 py-2 text-sm text-emerald-100"
              onClick={() => window.location.reload()}
            >
              Refresh
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

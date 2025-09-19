// src/components/Shell/ErrorBoundary.jsx
import React from "react";
export default class ErrorBoundary extends React.Component {
  state = { error: null };
  static getDerivedStateFromError(error) { return { error }; }
  componentDidCatch(error, info) { console.error("[Boundary]", error, info); }
  render() {
    if (this.state.error) {
      return (
        <main className="p-8 max-w-xl mx-auto text-center">
          <h1 className="text-xl font-bold mb-2">Something went sideways.</h1>
          <p className="text-slate-600 mb-4">Try refreshing, or go back home.</p>
          <button onClick={() => location.reload()} className="rounded-lg border px-3 py-2">Refresh</button>
        </main>
      );
    }
    return this.props.children;
  }
}

// src/layout/ErrorBoundary.jsx
import React from "react";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { err: null };
  }
  static getDerivedStateFromError(err) {
    return { err };
  }
  componentDidCatch(err, info) {
    console.error("UI ErrorBoundary:", err, info);
  }
  render() {
    const { err } = this.state;
    if (err) {
      return (
        <div className="p-6 max-w-xl mx-auto">
          <h1 className="text-xl font-bold mb-2">Something broke.</h1>
          <p className="opacity-80 mb-4">{String(err?.message || err)}</p>
          <button
            className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20"
            onClick={() => location.reload()}
          >
            Reload
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

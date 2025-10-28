import React from "react";
export default class ErrorBoundary extends React.Component {
  constructor(props){ super(props); this.state = { err: null }; }
  static getDerivedStateFromError(err){ return { err }; }
  componentDidCatch(err, info){ /* hook for logging */ }
  render(){
    const { err } = this.state;
    if (err) {
      return (
        <div className="rounded-xl border border-red-800/50 bg-red-950/40 p-4">
          <h2 className="text-red-300 font-semibold mb-1">Something broke.</h2>
          <p className="text-sm text-red-200/80">{err?.message || "Unknown error"}</p>
          <button className="mt-3 rounded-lg bg-amber-400 text-black px-3 py-2 text-sm" onClick={() => location.reload()}>
            Reload
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

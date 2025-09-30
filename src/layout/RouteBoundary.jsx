import React from "react";

export default class RouteBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { err: null };
  }
  static getDerivedStateFromError(err) {
    return { err };
  }
  componentDidCatch(err, info) {
    // eslint-disable-next-line no-console
    console.error("Route error:", err, info);
  }
  render() {
    if (this.state.err) {
      return (
        <div className="rounded-2xl border border-rose-400/30 bg-rose-900/20 p-6">
          <div className="font-semibold">Something went wrong.</div>
          <div className="text-sm opacity-80 mt-1">{String(this.state.err)}</div>
        </div>
      );
    }
    return this.props.children;
  }
}

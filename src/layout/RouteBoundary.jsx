// src/layout/RouteBoundary.jsx
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
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.error("[RouteBoundary]", err, info);
    }
  }
  render() {
    const { err } = this.state;
    if (err) {
      return (
        <div className="rounded-2xl border border-rose-300/40 bg-rose-900/20 text-rose-100 p-6">
          <div className="font-semibold">Something went sideways.</div>
          <div className="text-sm opacity-80 mt-1">
            {import.meta.env.DEV ? String(err?.message || err) : "Please try again or reload."}
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

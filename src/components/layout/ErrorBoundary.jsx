// src/layout/ErrorBoundary.jsx
import React from "react";
import PropTypes from "prop-types";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, info) {
    console.error(
      `[ErrorBoundary:${this.props.name || "unnamed"}]`,
      error,
      info,
    );
  }
  reset = () => this.setState({ hasError: false, error: null });

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 rounded-xl bg-red-600/20 border border-red-500/40 text-sm">
          <div className="font-semibold mb-2">
            Something went wrong
            {this.props.name ? ` in ${this.props.name}` : ""}.
          </div>
          <button
            onClick={this.reset}
            className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20"
          >
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

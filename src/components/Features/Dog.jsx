// src/Features/Dog.jsx
export default function Dog() {
  return <div className="w-full h-full grid place-items-center text-6xl">🐶</div>;
}

// src/components/common/ErrorBoundary.jsx
import React from "react";
export default class ErrorBoundary extends React.Component {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  render() { return this.state.hasError ? <div>Something broke.</div> : this.props.children; }
}

// src/components/common/Skeletons.jsx
export const StatsBarSkeleton = () => <div className="h-6 bg-white/20 rounded mb-2" />;
export const PanelSkeleton = ({ height = "10rem" }) => (
  <div className="bg-white/20 rounded" style={{ height }} />
);
export const DogAreaSkeleton = () => <div className="min-h-[420px] bg-white/10 rounded-3xl" />;

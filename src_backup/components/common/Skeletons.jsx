import React from "react";

export function StatsBarSkeleton() {
  return (
    <div className="w-full h-6 rounded-lg bg-white/20 animate-pulse" />
  );
}

export function PanelSkeleton({ height = "12rem" }) {
  return (
    <div
      className="w-full rounded-2xl bg-white/10 animate-pulse"
      style={{ height }}
    />
  );
}

export function DogAreaSkeleton() {
  return (
    <div className="absolute inset-0 bg-black/10 animate-pulse" />
  );
}

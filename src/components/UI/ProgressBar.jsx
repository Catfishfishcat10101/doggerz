import React from "react";

export default function ProgressBar({ value = 0, className = "" }) {
  const v = Math.max(0, Math.min(100, Number(value) || 0));
  return (
    <div className={`h-2 w-full rounded bg-white/10 ${className}`}>
      <div className="h-full rounded bg-white/70" style={{ width: `${v}%` }} />
    </div>
  );
}

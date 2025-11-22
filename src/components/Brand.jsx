// src/components/Brand.jsx
// @ts-nocheck

import React from "react";

export default function Brand({
  size = "lg", // sm | md | lg | xl
  subtitle = null,
  className = "",
}) {
  const sizes = {
    sm: "text-xl",
    md: "text-2xl",
    lg: "text-3xl",
    xl: "text-4xl",
  };
  return (
    <div className={["flex items-baseline gap-2", className].join(" ")}>
      <span className={[
        sizes[size] || sizes.lg,
        "font-black tracking-tight text-emerald-400 drop-shadow-[0_0_12px_rgba(16,185,129,0.75)]",
      ].join(" ")}>DOGGERZ</span>
      {subtitle && (
        <span className="text-[0.6rem] sm:text-xs text-emerald-300/80 uppercase tracking-[0.25em]">
          {subtitle}
        </span>
      )}
    </div>
  );
}

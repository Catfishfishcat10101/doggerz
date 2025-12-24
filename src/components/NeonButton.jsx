// src/components/NeonButton.jsx
// Reusable glowing green button; can act as a Link or regular button.

import React from "react";
import { Link } from "react-router-dom";

export default function NeonButton({ to, children, className = "", ...props }) {
  const baseClasses =
    "inline-flex items-center justify-center rounded-full px-6 py-3 " +
    "text-base font-semibold tracking-wide " +
    "bg-lime-400 text-black " +
    "shadow-[0_0_30px_rgba(190,242,100,0.9)] " +
    "hover:bg-lime-300 hover:shadow-[0_0_45px_rgba(190,242,100,1)] " +
    "transition-transform transition-shadow duration-200 " +
    "hover:-translate-y-0.5 " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-400 " +
    "focus-visible:ring-offset-2 focus-visible:ring-offset-black";

  if (to) {
    return (
      <Link to={to} className={`${baseClasses} ${className}`} {...props}>
        {children}
      </Link>
    );
  }

  return (
    <button type="button" className={`${baseClasses} ${className}`} {...props}>
      {children}
    </button>
  );
}

import React from "react";

export default function SkipLink({ targetId = "main-content" }) {
  return (
    <a
      href={`#${targetId}`}
      className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] 
                 focus:rounded-lg focus:bg-amber-400 focus:px-3 focus:py-2 focus:text-black"
    >
      Skip to main content
    </a>
  );
}

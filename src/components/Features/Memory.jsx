// src/components/Features/Memory.jsx
import React from "react";

/**
 * Memory book of dog milestones.
 *
 * @param {Array<string|{text:string,date?:string|Date}>} events
 *        – If you pass objects they’ll render “text · MMM DD YYYY”.
 */
export default function Memory({ events }) {
  const milestones = events ?? [
    { text: "Learned Sit",           date: "2025-07-01" },
    { text: "First bath",            date: "2025-07-03" },
    { text: "Fully potty trained",   date: "2025-07-10" },
    { text: "Turned 1 year old",     date: "2025-12-20" },
  ];

  const fmt = (d) =>
    new Date(d).toLocaleDateString(undefined, {
      month: "short",
      day: "2-digit",
      year: "numeric",
    });

  return (
    <div className="p-4 bg-white/10 text-white rounded-lg shadow-md max-w-lg mx-auto mt-6 backdrop-blur">
      <h2 className="text-2xl font-bold mb-3">📘 Memory Book</h2>

      <ul className="list-disc pl-5 text-sm space-y-1 max-h-64 overflow-y-auto pr-2">
        {milestones.map((m, idx) => {
          const el = typeof m === "string" ? { text: m } : m;
          return (
            <li key={idx}>
              {el.text}
              {el.date && (
                <span className="text-xs text-gray-300 ml-2">· {fmt(el.date)}</span>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
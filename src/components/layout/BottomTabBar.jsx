// src/components/layout/BottomTabBar.jsx
import { NavLink } from "react-router-dom";

import { PRIMARY_TABS } from "@/app/routes.js";

function TabIcon({ name, active }) {
  const stroke = active ? "currentColor" : "rgba(244,244,245,0.78)";

  if (name === "yard") {
    return (
      <svg
        viewBox="0 0 24 24"
        className="h-5 w-5"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M4 18h16M6 18V9l6-4 6 4v9"
          stroke={stroke}
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (name === "train") {
    return (
      <svg
        viewBox="0 0 24 24"
        className="h-5 w-5"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M12 4v16M5 11l7-7 7 7M7 20h10"
          stroke={stroke}
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (name === "care") {
    return (
      <svg
        viewBox="0 0 24 24"
        className="h-5 w-5"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M12 20s-7-4.35-7-9.2A4.05 4.05 0 0 1 12 8a4.05 4.05 0 0 1 7 2.8C19 15.65 12 20 12 20Z"
          stroke={stroke}
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (name === "store") {
    return (
      <svg
        viewBox="0 0 24 24"
        className="h-5 w-5"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M5 9h14l-1 10H6L5 9Zm2-4h10l2 4H5l2-4Z"
          stroke={stroke}
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (name === "memories") {
    return (
      <svg
        viewBox="0 0 24 24"
        className="h-5 w-5"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M7 5h10a2 2 0 0 1 2 2v12l-3-2-3 2-3-2-3 2V7a2 2 0 0 1 2-2Z"
          stroke={stroke}
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (name === "settings") {
    return (
      <svg
        viewBox="0 0 24 24"
        className="h-5 w-5"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M12 8.5a3.5 3.5 0 1 1 0 7 3.5 3.5 0 0 1 0-7Zm0-5v2M12 18.5v2M4.65 6.65l1.4 1.4M17.95 17.95l1.4 1.4M2.5 12h2M19.5 12h2M4.65 17.35l1.4-1.4M17.95 6.05l1.4-1.4"
          stroke={stroke}
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
      <path
        d="M5 7h14M5 12h14M5 17h14"
        stroke={stroke}
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function BottomTabBar() {
  return (
    <nav
      aria-label="Primary navigation"
      className="fixed inset-x-0 bottom-0 z-[85] px-3 pb-[calc(env(safe-area-inset-bottom,0px)+0.55rem)]"
    >
      <div className="mx-auto grid max-w-md grid-cols-5 gap-1 rounded-[26px] border border-emerald-300/14 bg-zinc-950/94 p-1.5 shadow-[0_18px_48px_rgba(2,6,23,0.52),0_0_34px_rgba(16,185,129,0.1)] backdrop-blur-xl">
        {PRIMARY_TABS.map((tab) => (
          <NavLink
            key={tab.path}
            to={tab.path}
            end={tab.path === "/"}
            className={({ isActive }) =>
              [
                "relative flex min-h-[58px] flex-col items-center justify-center rounded-[20px] px-1.5 py-2 text-[10px] font-bold uppercase tracking-[0.04em] transition active:scale-[0.98] sm:min-h-[62px] sm:text-[11px]",
                isActive
                  ? "bg-[color:var(--dz-accent-soft)] text-[color:var(--dz-accent)] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
                  : "text-zinc-400 hover:bg-white/5 hover:text-zinc-100",
              ].join(" ")
            }
          >
            {({ isActive }) => (
              <>
                <span
                  className={`mb-1 h-1 w-6 rounded-full transition ${
                    isActive ? "bg-current opacity-100" : "opacity-0"
                  }`}
                  aria-hidden="true"
                />
                <TabIcon name={tab.icon} active={isActive} />
                <span className="mt-1">{tab.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

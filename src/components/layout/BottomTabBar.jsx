import { NavLink, useLocation } from "react-router-dom";

import { PATHS, PRIMARY_TABS } from "@/routes.js";

const HIDDEN_PATHS = new Set([
  PATHS.HOME,
  PATHS.ADOPT,
  PATHS.LOGIN,
  PATHS.SIGNUP,
  PATHS.NOT_FOUND,
]);

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
  const location = useLocation();
  const pathname = location.pathname;

  if (HIDDEN_PATHS.has(pathname)) return null;

  return (
    <nav className="fixed inset-x-0 bottom-0 z-[85] border-t border-[color:var(--dz-accent-strong)] bg-zinc-950/92 backdrop-blur-xl md:hidden">
      <div className="grid grid-cols-5 gap-1 px-2 pb-[calc(env(safe-area-inset-bottom,0px)+0.5rem)] pt-2">
        {PRIMARY_TABS.map((tab) => (
          <NavLink
            key={tab.path}
            to={tab.path}
            className={({ isActive }) =>
              [
                "flex min-h-[60px] flex-col items-center justify-center rounded-2xl px-2 py-2 text-[11px] font-semibold transition",
                isActive
                  ? "bg-[color:var(--dz-accent-soft)] text-[color:var(--dz-accent)]"
                  : "text-zinc-300 hover:bg-white/5 hover:text-white",
              ].join(" ")
            }
          >
            {({ isActive }) => (
              <>
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

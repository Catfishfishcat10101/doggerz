import { NavLink, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

import { getPrimaryTabForPath, PATHS, PRIMARY_TABS } from "@/app/routes.js";
import { resolveHeistRoute } from "@/utils/heistRoutes.js";

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
  const activeSurprise = useSelector(
    (state) => state?.dog?.surprise?.active || null
  );
  const pathname = location.pathname;
  const activeTab = getPrimaryTabForPath(pathname);
  const stolenTabKey =
    String(activeSurprise?.type || "").toUpperCase() === "STOLEN_BUTTON"
      ? String(activeSurprise?.stolenAction || "")
          .trim()
          .toLowerCase()
      : "";
  const stolenRoute = resolveHeistRoute(stolenTabKey);

  if (HIDDEN_PATHS.has(pathname) || !activeTab) return null;

  return (
    <nav className="fixed inset-x-0 bottom-0 z-[85] px-3 pb-[calc(env(safe-area-inset-bottom,0px)+0.6rem)] md:hidden">
      <div className="mx-auto grid max-w-md grid-cols-5 gap-1 rounded-[28px] border border-white/10 bg-zinc-950/92 p-2 shadow-[0_18px_48px_rgba(2,6,23,0.48)] backdrop-blur-xl">
        {PRIMARY_TABS.map((tab) => {
          const stolen = Boolean(stolenRoute && tab.path === stolenRoute);

          return (
            <NavLink
              key={tab.path}
              to={tab.path}
              aria-disabled={stolen ? "true" : undefined}
              onClick={(event) => {
                if (!stolen) return;
                event.preventDefault();
              }}
              className={({ isActive }) =>
                [
                  "relative flex min-h-[62px] flex-col items-center justify-center rounded-2xl px-2 py-2 text-[11px] font-semibold transition active:scale-[0.98]",
                  isActive
                    ? "bg-[color:var(--dz-accent-soft)] text-[color:var(--dz-accent)] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
                    : "text-zinc-400",
                  stolen ? "pointer-events-none opacity-35 grayscale" : "",
                ].join(" ")
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={`mb-1 h-1 w-7 rounded-full transition ${
                      isActive ? "bg-current opacity-100" : "opacity-0"
                    }`}
                    aria-hidden="true"
                  />
                  {stolen ? (
                    <span
                      className="absolute right-2 top-1 text-sm"
                      aria-hidden="true"
                    >
                      🐾
                    </span>
                  ) : null}
                  <TabIcon name={tab.icon} active={isActive} />
                  <span className="mt-1">{tab.label}</span>
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}

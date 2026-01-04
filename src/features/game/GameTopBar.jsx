// src/features/game/GameTopBar.jsx
// Lightweight top HUD bar for the "MainGame" experience.
// (This file previously contained router code by mistake; keep it focused as a UI component.)

import { Link } from "react-router-dom";

import { normalizeBadges } from "@/utils/badges.js";

export default function GameTopBar({
  dogName = "Pup",
  level = 1,
  xpPct = 0,
  xpLabel = "",
  coins = 0,
  tokens = 0,
  badges = [],
  onLogout,
  lifeStageLabel = "Puppy",
  lifeStageDay = 1,
  moodLabel = "Content",
  streakDays = 0,
}) {
  const chip =
    "inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/25 px-3 py-1 text-[11px] font-semibold text-zinc-100";

  const normalizedBadges = normalizeBadges(badges);

  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-black/45 px-4 py-3 text-white backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="truncate text-2xl sm:text-3xl font-extrabold text-emerald-200 leading-tight">
            {dogName}
            <span className="ml-2 text-xs font-semibold text-zinc-300/90">
              Lv {level} · {lifeStageLabel} (Age {lifeStageDay})
            </span>
          </div>

          {/* XP bar (tiny but always visible) */}
          <div className="mt-2">
            <div className="flex items-center justify-between text-[11px] text-zinc-300/90">
              <span className="font-semibold text-emerald-200">XP</span>
              <span className="tabular-nums">
                {xpLabel || `${Math.round(clamp01(xpPct) * 100)}%`}
              </span>
            </div>
            <div className="mt-1 h-2 w-full overflow-hidden rounded-full border border-white/10 bg-black/30">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-emerald-300 to-orange-300"
                style={{ width: `${Math.round(clamp01(xpPct) * 100)}%` }}
              />
            </div>
          </div>

          <div className="mt-1 flex flex-wrap items-center gap-2">
            <span className={chip}>
              <span className="text-emerald-200">Mood</span>
              <span className="text-zinc-100">{moodLabel}</span>
            </span>
            {Number(streakDays) > 0 ? (
              <span className={chip}>
                <span className="text-emerald-200">Streak</span>
                <span className="text-zinc-100">
                  {Math.round(Number(streakDays) || 0)}d
                </span>
              </span>
            ) : null}
            <span className={chip}>
              <span className="text-emerald-200">Coins</span>
              <span className="text-zinc-100">{Number(coins) || 0}</span>
            </span>

            <span className={chip}>
              <span className="text-emerald-200">Tokens</span>
              <span className="text-zinc-100">
                {Math.round(Number(tokens) || 0)}
              </span>
            </span>

            <Link
              to="/badges"
              className={`${chip} hover:bg-black/35 transition`}
              title={
                normalizedBadges.length
                  ? normalizedBadges.map((b) => b.label).join(", ")
                  : "No badges earned yet"
              }
            >
              <span className="text-emerald-200">Badges</span>
              <span className="tabular-nums text-zinc-100">
                {normalizedBadges.length}
              </span>
            </Link>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2">
          <Link
            to="/store"
            className="inline-flex items-center justify-center rounded-2xl px-3 py-2 text-xs font-semibold border border-white/15 bg-black/25 text-zinc-100 hover:bg-black/35 transition"
          >
            Store
          </Link>
          <Link
            to="/potty"
            className="inline-flex items-center justify-center rounded-2xl px-3 py-2 text-xs font-semibold border border-white/15 bg-black/25 text-zinc-100 hover:bg-black/35 transition"
          >
            Potty
          </Link>
          <Link
            to="/settings"
            className="inline-flex items-center justify-center rounded-2xl px-3 py-2 text-xs font-semibold border border-white/15 bg-black/25 text-zinc-100 hover:bg-black/35 transition"
          >
            Settings
          </Link>
          <button
            type="button"
            onClick={onLogout}
            className="inline-flex items-center justify-center rounded-2xl px-3 py-2 text-xs font-semibold border border-amber-400/25 bg-amber-500/10 text-amber-100 hover:bg-amber-500/15 transition"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}

function clamp01(n) {
  const x = Number(n);
  if (!Number.isFinite(x)) return 0;
  return Math.max(0, Math.min(1, x));
}

// Badge helpers live in `src/utils/badges.js`.

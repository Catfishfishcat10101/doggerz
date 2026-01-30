// src/features/game/GameTopBar.jsx
// Lightweight top HUD bar for the "MainGame" experience.
// (This file previously contained router code by mistake; keep it focused as a UI component.)

import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";

import { normalizeBadges } from "@/utils/badges.js";
import {
  selectSettings,
  setTopBarCompact,
  setTopBarShowBadges,
  setTopBarShowQuickLinks,
  setTopBarShowStats,
  setTopBarShowXp,
} from "@/redux/settingsSlice.js";

export default function GameTopBar({
  dogName = "Pup",
  level = 1,
  xpPct = 0,
  xpLabel = "",
  coins = 0,
  badges = [],
  onLogout,
  lifeStageLabel = "Puppy",
  lifeStageDay = 1,
  moodLabel = "Content",
  streakDays = 0,
}) {
  const dispatch = useDispatch();
  const settings = useSelector(selectSettings);
  const [showOptions, setShowOptions] = useState(false);
  const menuRef = useRef(null);

  const compact = Boolean(settings?.topBarCompact);
  const showXp = settings?.topBarShowXp !== false;
  const showStats = settings?.topBarShowStats !== false;
  const showBadges = settings?.topBarShowBadges !== false;
  const showQuickLinks = settings?.topBarShowQuickLinks !== false;

  const chip =
    "inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/25 px-3 py-1 text-[11px] font-semibold text-zinc-100";

  const normalizedBadges = normalizeBadges(badges);
  const streakValue = Math.max(0, Math.round(Number(streakDays) || 0));
  const streakLabel = streakValue === 1 ? "1 day" : `${streakValue} days`;
  const ageLabel = (() => {
    if (typeof lifeStageDay === "string") {
      const str = lifeStageDay.trim();
      return str || "0 days";
    }
    const n = Number(lifeStageDay);
    if (!Number.isFinite(n)) return "0 days";
    const rounded = Math.max(0, Math.round(n));
    return rounded === 1 ? "1 day" : `${rounded} days`;
  })();

  useEffect(() => {
    if (!showOptions) return;
    const onKeyDown = (event) => {
      if (event.key === "Escape") setShowOptions(false);
    };
    const onPointerDown = (event) => {
      const el = menuRef.current;
      if (!el || el.contains(event.target)) return;
      setShowOptions(false);
    };
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("mousedown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("mousedown", onPointerDown);
    };
  }, [showOptions]);

  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-black/45 text-white backdrop-blur-md">
      <div
        className={[
          "mx-auto flex max-w-7xl flex-wrap items-start justify-between gap-3 px-4",
          compact ? "py-2" : "py-3",
        ].join(" ")}
      >
        <div className="min-w-0">
          <div
            className={[
              "truncate font-extrabold text-emerald-200 leading-tight",
              compact ? "text-xl sm:text-2xl" : "text-2xl sm:text-3xl",
            ].join(" ")}
          >
            {dogName}
            <span className="ml-2 text-xs font-semibold text-zinc-300/90">
              Lv {level} · {lifeStageLabel} (Age {ageLabel})
            </span>
          </div>

          {/* XP bar (tiny but always visible) */}
          {showXp ? (
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
          ) : null}

          {showStats ? (
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <span className={chip}>
                <span className="text-emerald-200">Mood</span>
                <span className="text-zinc-100">{moodLabel}</span>
              </span>
              {Number(streakDays) > 0 ? (
                <span className={chip}>
                  <span className="text-emerald-200">Streak</span>
                  <span className="text-zinc-100">{streakLabel}</span>
                </span>
              ) : null}
              <span className={chip}>
                <span className="text-emerald-200">Coins</span>
                <span className="text-zinc-100">{Number(coins) || 0}</span>
              </span>

              {showBadges ? (
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
              ) : null}
            </div>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2">
          {showQuickLinks ? (
            <>
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
            </>
          ) : null}
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

          <div ref={menuRef} className="relative">
            <button
              type="button"
              onClick={() => setShowOptions((v) => !v)}
              className="inline-flex items-center justify-center rounded-2xl px-3 py-2 text-xs font-semibold border border-white/15 bg-black/25 text-zinc-100 hover:bg-black/35 transition"
              aria-expanded={showOptions}
              aria-label="Customize top bar"
            >
              View
            </button>

            {showOptions ? (
              <div className="absolute right-0 mt-2 w-56 space-y-2 rounded-2xl border border-white/10 bg-black/85 p-3 text-xs text-zinc-200 shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
                <ToggleRow
                  label="Compact layout"
                  checked={compact}
                  onChange={(v) => dispatch(setTopBarCompact(v))}
                />
                <ToggleRow
                  label="Show XP bar"
                  checked={showXp}
                  onChange={(v) => dispatch(setTopBarShowXp(v))}
                />
                <ToggleRow
                  label="Show stats row"
                  checked={showStats}
                  onChange={(v) => dispatch(setTopBarShowStats(v))}
                />
                <ToggleRow
                  label="Show badges"
                  checked={showBadges}
                  onChange={(v) => dispatch(setTopBarShowBadges(v))}
                />
                <ToggleRow
                  label="Show shortcuts"
                  checked={showQuickLinks}
                  onChange={(v) => dispatch(setTopBarShowQuickLinks(v))}
                />
              </div>
            ) : null}
          </div>
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

function ToggleRow({ label, checked, onChange }) {
  return (
    <label className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-[11px] text-zinc-200">
      <span>{label}</span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(Boolean(e.target.checked))}
        className="h-4 w-4 accent-emerald-400"
      />
    </label>
  );
}

/** @format */
// src/features/game/MechanicsPanel.jsx

import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  selectSettings,
  setMechanicsCompact,
  setMechanicsShowStats,
  setMechanicsShowTips,
  setMechanicsShowUnlockLine,
} from "@/redux/settingsSlice.js";

function formatTime(ms) {
  if (!Number.isFinite(ms) || ms <= 0) return "Soon";
  const totalSeconds = Math.ceil(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  if (minutes <= 0) return "Moments";
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const rem = minutes % 60;
  return rem ? `${hours}h ${rem}m` : `${hours}h`;
}

function remainingMsForCommand(command, nowMs) {
  if (!command || command.status !== "unlocking") return null;

  if (typeof command.unlocksAt === "number") {
    return Math.max(0, command.unlocksAt - nowMs);
  }

  const startedAt =
    typeof command.unlockStartedAt === "number"
      ? command.unlockStartedAt
      : null;
  const delayMs =
    typeof command.unlockDelayMs === "number" ? command.unlockDelayMs : null;
  if (startedAt != null && delayMs != null) {
    return Math.max(0, startedAt + delayMs - nowMs);
  }

  if (typeof command.remainingMs === "number")
    return Math.max(0, command.remainingMs);
  return null;
}

function pickNextUnlock(commands, nowMs) {
  const list = Array.isArray(commands) ? commands : [];
  const unlocking = list.filter((c) => c?.status === "unlocking");
  if (!unlocking.length) return null;
  const scored = unlocking
    .map((c) => {
      const remaining = remainingMsForCommand(c, nowMs);
      return remaining == null ? null : { command: c, remaining };
    })
    .filter(Boolean)
    .sort((a, b) => a.remaining - b.remaining);
  if (scored.length) return scored[0].command;
  return unlocking[0] || null;
}

export default function MechanicsPanel({
  bondValue = 0,
  streakDays = 0,
  level = 1,
  pottyComplete = false,
  commands = [],
  voiceChance = 0,
  buttonChance = 0,
}) {
  const dispatch = useDispatch();
  const settings = useSelector(selectSettings);
  const [nowMs, setNowMs] = useState(() => Date.now());

  const compact = Boolean(settings?.mechanicsCompact);
  const showTips = settings?.mechanicsShowTips !== false;
  const showStats = settings?.mechanicsShowStats !== false;
  const showUnlockLine = settings?.mechanicsShowUnlockLine !== false;

  const nextUnlocking = useMemo(
    () => pickNextUnlock(commands, nowMs),
    [commands, nowMs]
  );
  const nextLocked = (Array.isArray(commands) ? commands : []).find(
    (c) => c?.status === "locked"
  );

  useEffect(() => {
    if (!nextUnlocking) return;
    const id = window.setInterval(() => setNowMs(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [nextUnlocking]);

  let unlockLine = "All commands unlocked.";
  if (!pottyComplete) {
    unlockLine = "Finish potty training to start unlocking commands.";
  } else if (nextUnlocking) {
    unlockLine = `Next unlock: ${nextUnlocking.label} in ${formatTime(
      remainingMsForCommand(nextUnlocking, nowMs)
    )}.`;
  } else if (nextLocked) {
    unlockLine =
      `Next unlock: ${nextLocked.label}. ${nextLocked.detail || ""}`.trim();
  }

  return (
    <section className="rounded-2xl bg-[#0b0f16]/70 ring-1 ring-white/10 shadow-[0_18px_60px_rgba(0,0,0,0.25)]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
        <div>
          <h3 className="text-xs font-semibold tracking-wide text-white/85">
            Training Intel
          </h3>
          <div className="text-[11px] text-white/45">Hidden mechanics</div>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-[11px] text-white/60">
          <button
            type="button"
            onClick={() => dispatch(setMechanicsCompact(!compact))}
            className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-white/70 hover:bg-white/10"
          >
            {compact ? "Roomy" : "Compact"}
          </button>
          <button
            type="button"
            onClick={() =>
              dispatch(setMechanicsShowUnlockLine(!showUnlockLine))
            }
            className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-white/70 hover:bg-white/10"
          >
            {showUnlockLine ? "Hide unlocks" : "Show unlocks"}
          </button>
          <button
            type="button"
            onClick={() => dispatch(setMechanicsShowStats(!showStats))}
            className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-white/70 hover:bg-white/10"
          >
            {showStats ? "Hide stats" : "Show stats"}
          </button>
          <button
            type="button"
            onClick={() => dispatch(setMechanicsShowTips(!showTips))}
            className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-white/70 hover:bg-white/10"
          >
            {showTips ? "Hide tips" : "Show tips"}
          </button>
        </div>
      </div>

      <div
        className={[
          "space-y-3 text-sm text-white/70",
          compact ? "p-3" : "p-4",
        ].join(" ")}
      >
        {showUnlockLine ? (
          <div className="rounded-xl bg-white/5 px-3 py-2 ring-1 ring-white/10">
            {unlockLine}
          </div>
        ) : null}

        {showStats ? (
          <div className="grid grid-cols-2 gap-2 text-[12px]">
            <StatPill label="Bond" value={`${Math.round(bondValue)}%`} />
            <StatPill
              label="Streak"
              value={`${Math.max(0, streakDays)} days`}
            />
            <StatPill label="Level" value={`Lv ${Math.max(1, level)}`} />
            <StatPill
              label="Voice reliability"
              value={`~${Math.round(voiceChance)}%`}
            />
            <StatPill
              label="Button success"
              value={`~${Math.round(buttonChance)}%`}
            />
          </div>
        ) : null}

        {showTips ? (
          <ul className="space-y-2 text-[12px] text-white/60">
            <li>Bond directly boosts success and voice reliability.</li>
            <li>
              Unlocks are delayed once requirements are met - stay consistent.
            </li>
            <li>Low energy, hunger, or thirst reduces training success.</li>
            <li>Daily training streaks speed up new trick availability.</li>
          </ul>
        ) : null}
      </div>
    </section>
  );
}

function StatPill({ label, value }) {
  return (
    <div className="rounded-xl bg-white/5 px-3 py-2 ring-1 ring-white/10">
      <div className="text-[10px] uppercase tracking-wide text-white/45">
        {label}
      </div>
      <div className="mt-1 text-sm font-semibold text-white">{value}</div>
    </div>
  );
}

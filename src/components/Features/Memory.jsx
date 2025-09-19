// src/components/Features/Memory.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import * as dogSlice from "../../redux/dogSlice"; // probe optional selectors safely

/* ============================================================
   SELECTORS (Robust: prefer slice exports, fall back to shape)
   ============================================================ */
const selectLevel =
  dogSlice.selectDogLevel || ((s) => Number(s.dog?.level ?? 1));
const selectXP =
  dogSlice.selectXP || ((s) => Number(s.dog?.xp ?? 0));
const selectHappiness =
  dogSlice.selectHappiness || ((s) => Number(s.dog?.happiness ?? 0));
const selectCoins =
  dogSlice.selectCoins || ((s) => Number(s.dog?.coins ?? 0));
const selectAccessories =
  dogSlice.selectAccessories || ((s) => s.dog?.accessories ?? { owned: [] });
const selectPosition =
  dogSlice.selectPos || dogSlice.selectPosition || ((s) => s.dog?.pos || s.dog?.position || { x: 0, y: 0 });
const selectName =
  dogSlice.selectName || ((s) => s.dog?.name || "Doggo");

/* ============================================================
   COMPONENT
   - Snapshot of core stats
   - Milestones (progress + badges)
   - Event log (prop + localStorage merge)
   - Null-safe, SSR-safe, and future-proof
   ============================================================ */
export default function Memory({
  className = "",
  compact = false,
  // Events can be injected by parent, we also merge with persisted:
  events,
  storageKey = "doggerz_events",
  maxItems = 10,
  showBadges = true,
  showTimeline = true,
}) {
  // ----------- State reads (Redux) -----------
  const dogName = useSelector(selectName);
  const level = useSelector(selectLevel);
  const xp = useSelector(selectXP);
  const coins = useSelector(selectCoins);
  const happiness = useSelector(selectHappiness);
  const accessories = useSelector(selectAccessories);
  const pos = useSelector(selectPosition);

  const tricksLearned = useSelector((s) =>
    Array.isArray(s.dog?.tricks) ? s.dog.tricks.length : Number(s.dog?.tricksLearned ?? 0)
  );
  const streakDays = useSelector((s) => Number(s.dog?.streakDays ?? 0));
  const steps = useSelector((s) => Number(s.dog?.steps ?? 0));

  const ownedCount = Array.isArray(accessories?.owned)
    ? accessories.owned.length
    : Number(accessories?.ownedCount ?? 0);

  // ----------- Derived metrics -----------
  const xpRange = useMemo(() => {
    const curMin = levelXP(level);
    const nextMin = levelXP(level + 1);
    return {
      curMin,
      nextMin,
      into: Math.max(0, xp - curMin),
      span: Math.max(1, nextMin - curMin),
      pct: clamp(((xp - curMin) / Math.max(1, nextMin - curMin)) * 100, 0, 100),
    };
  }, [level, xp]);

  const careScore = clamp(Math.round(happiness * 0.7 + Math.min(100, xp / 10) * 0.3), 0, 100);

  // ----------- Milestones -----------
  const milestoneSpec = useMemo(() => milestoneSpecs(), []);
  const milestoneState = useMemo(
    () => ({ level, xp, coins, happiness, tricksLearned, streakDays, steps, careScore }),
    [level, xp, coins, happiness, tricksLearned, streakDays, steps, careScore]
  );

  const milestones = useMemo(
    () =>
      milestoneSpec.map((m) => {
        const progress = safeProgress(m.progress, milestoneState);
        const unlocked = safeBool(m.unlockWhen, milestoneState);
        const pct = clamp(((progress.value ?? 0) / Math.max(1, progress.target ?? 1)) * 100, 0, 100);
        return { ...m, progress, unlocked, pct };
      }),
    [milestoneSpec, milestoneState]
  );

  const unlockedCount = milestones.filter((m) => m.unlocked).length;

  // ----------- Events (prop + persisted merge) -----------
  const [persisted, setPersisted] = useState([]);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) setPersisted(JSON.parse(raw));
    } catch {}
  }, [storageKey]);

  const timeline = useMemo(() => {
    const merged = [
      ...(Array.isArray(events) ? events : []),
      ...(Array.isArray(persisted) ? persisted : []),
    ]
      .filter(Boolean)
      .sort((a, b) => (b?.ts ?? 0) - (a?.ts ?? 0))
      .slice(0, maxItems);
    return merged;
  }, [events, persisted, maxItems]);

  // ----------- Render -----------
  return (
    <section
      className={[
        "rounded-2xl border bg-white text-emerald-900",
        compact ? "p-3" : "p-4",
        className,
      ].join(" ")}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xs uppercase tracking-wider text-emerald-900/60">Memory</div>
          <h2 className={["font-bold", compact ? "text-lg" : "text-xl"].join(" ")}>{dogName}</h2>
        </div>
        <div className="text-right">
          <div className="text-xs text-emerald-900/60">Coins</div>
          <div className="font-mono">{coins.toLocaleString()}</div>
        </div>
      </div>

      {/* Snapshot grid */}
      <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <StatCard label="Level" value={`Lv ${level}`} sub={`XP ${xp.toLocaleString()}`}>
          <ProgressBar value={xpRange.pct} label="To next level" />
        </StatCard>

        <StatCard label="Happiness" value={`${Math.round(happiness)}%`} sub={bandLabel(happiness)}>
          <ProgressBar value={happiness} color={bandColor(happiness)} />
        </StatCard>

        <StatCard label="Care Score" value={`${careScore}%`} sub="Composite mood/XP">
          <ProgressBar value={careScore} />
        </StatCard>
      </div>

      {/* Position + inventory */}
      <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="rounded-xl border bg-white p-3 flex items-center justify-between">
          <div className="text-sm text-emerald-900/70">Position</div>
          <div className="font-mono text-sm">
            x:{Math.round(pos.x || 0)} y:{Math.round(pos.y || 0)}
          </div>
        </div>
        <div className="rounded-xl border bg-white p-3 flex items-center justify-between">
          <div className="text-sm text-emerald-900/70">Owned Accessories</div>
          <div className="font-mono text-sm">{ownedCount}</div>
        </div>
      </div>

      {/* Milestones */}
      <div className="mt-4">
        <div className="flex items-center justify-between">
          <div className="font-semibold">Milestones</div>
          <div className="text-xs text-emerald-900/70">
            {unlockedCount}/{milestones.length} unlocked
          </div>
        </div>

        <div className="mt-2 grid gap-2">
          {milestones.map((m) => (
            <MilestoneRow key={m.id} item={m} compact={compact} />
          ))}
        </div>
      </div>

      {/* Badges */}
      {showBadges && (
        <div className="mt-4">
          <div className="font-semibold">Badges</div>
          <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-2">
            {milestones.map((m) => (
              <Badge key={`b-${m.id}`} unlocked={m.unlocked} title={m.short || m.title} icon={m.icon} />
            ))}
          </div>
        </div>
      )}

      {/* Session crumbs */}
      <ul className="mt-4 text-emerald-900/80 text-sm list-disc pl-5 space-y-1">
        <li>Session Buff: {safeSession("buff") || "None"}</li>
        <li>Yard Skin: {safeSession("yardSkin") || "default"}</li>
      </ul>

      {/* Timeline */}
      {showTimeline && (
        <div className="mt-4">
          <div className="font-semibold">Recent Events</div>
          {timeline.length === 0 ? (
            <p className="mt-2 text-sm text-emerald-900/70">Train, feed, or play to create memorable moments.</p>
          ) : (
            <ul className="mt-2 space-y-2">
              {timeline.map((e, i) => (
                <EventRow key={`${e.ts ?? i}-${e.title}`} evt={e} />
              ))}
            </ul>
          )}
        </div>
      )}
    </section>
  );
}

/* =======================
   UI Bits
   ======================= */
function StatCard({ label, value, sub, children }) {
  return (
    <div className="rounded-xl border bg-white p-3">
      <div className="text-xs text-emerald-900/60">{label}</div>
      <div className="text-lg font-semibold">{value}</div>
      {sub && <div className="text-xs text-emerald-900/60">{sub}</div>}
      <div className="mt-2">{children}</div>
    </div>
  );
}

function ProgressBar({ value = 0, color, label }) {
  const pct = clamp(Number(value) || 0, 0, 100);
  const c = color || (pct > 66 ? "bg-emerald-500" : pct > 33 ? "bg-amber-500" : "bg-rose-500");
  return (
    <div className="w-full h-2 rounded bg-emerald-900/10 overflow-hidden" title={label || `${Math.round(pct)}%`}>
      <div className={`h-2 ${c}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

function MilestoneRow({ item, compact }) {
  const { title, desc, icon = "🏅", pct, progress, unlocked } = item;
  return (
    <div className="rounded-xl border bg-white p-3 flex items-center gap-3">
      <div className={`text-2xl ${unlocked ? "" : "opacity-50"}`}>{icon}</div>
      <div className="flex-1">
        <div className="font-medium flex items-center gap-2">
          <span>{title}</span>
          {unlocked ? (
            <span className="text-emerald-700 text-xs bg-emerald-100 px-1.5 py-0.5 rounded">Unlocked</span>
          ) : (
            <span className="text-emerald-900/60 text-xs">{progressLabel(progress)}</span>
          )}
        </div>
        {desc && <div className="text-xs text-emerald-900/70">{desc}</div>}
        <div className="mt-2">
          <ProgressBar value={pct} />
        </div>
      </div>
      {!compact && <div className="w-12 text-right font-mono text-xs">{Math.round(pct)}%</div>}
    </div>
  );
}

function Badge({ unlocked, title, icon = "🏅" }) {
  return (
    <div
      className={[
        "rounded-xl border p-3 text-center",
        unlocked ? "bg-white" : "bg-slate-50 opacity-70",
      ].join(" ")}
      title={title}
    >
      <div className="text-2xl">{unlocked ? icon : "🔒"}</div>
      <div className="mt-1 text-xs text-emerald-900/80 truncate">{title}</div>
    </div>
  );
}

function EventRow({ evt }) {
  const icon = evt.icon ?? "•";
  const when = evt.ts ? new Date(evt.ts).toLocaleString() : "";
  return (
    <li className="flex items-start gap-3">
      <span className="mt-0.5">{icon}</span>
      <div className="flex-1">
        <div className="text-sm">
          <span className="font-medium">{evt.title}</span>
          {evt.detail && <span className="text-emerald-900/70"> — {evt.detail}</span>}
        </div>
        {when && <div className="text-xs text-emerald-900/60">{when}</div>}
      </div>
    </li>
  );
}

/* =======================
   Milestone Logic
   ======================= */
function milestoneSpecs() {
  return [
    {
      id: "xp-100",
      short: "Rookie",
      title: "Rookie Trainer",
      desc: "Reach 100 XP.",
      icon: "🎯",
      progress: (s) => ({ value: s.xp, target: 100 }),
      unlockWhen: (s) => s.xp >= 100,
    },
    {
      id: "xp-500",
      short: "Apprentice",
      title: "Apprentice Trainer",
      desc: "Reach 500 XP.",
      icon: "💪",
      progress: (s) => ({ value: s.xp, target: 500 }),
      unlockWhen: (s) => s.xp >= 500,
    },
    {
      id: "happy-60",
      short: "Happy Pup",
      title: "Happy Pup",
      desc: "Keep happiness above 60%.",
      icon: "😊",
      progress: (s) => ({ value: s.happiness, target: 60 }),
      unlockWhen: (s) => s.happiness >= 60,
    },
    {
      id: "care-80",
      short: "Care Pro",
      title: "Care Pro",
      desc: "Reach 80% care score.",
      icon: "🩺",
      progress: (s) => ({ value: s.careScore, target: 80 }),
      unlockWhen: (s) => s.careScore >= 80,
    },
    {
      id: "coins-200",
      short: "Saver",
      title: "Piggy Bank",
      desc: "Save up 200 coins.",
      icon: "💰",
      progress: (s) => ({ value: s.coins, target: 200 }),
      unlockWhen: (s) => s.coins >= 200,
    },
    {
      id: "tricks-3",
      short: "Trickster",
      title: "Trickster",
      desc: "Learn 3 tricks.",
      icon: "🎓",
      progress: (s) => ({ value: s.tricksLearned, target: 3 }),
      unlockWhen: (s) => s.tricksLearned >= 3,
    },
    {
      id: "streak-3",
      short: "Streaker",
      title: "Daily Streak",
      desc: "Log in 3 days in a row.",
      icon: "📆",
      progress: (s) => ({ value: s.streakDays, target: 3 }),
      unlockWhen: (s) => s.streakDays >= 3,
    },
    {
      id: "steps-1000",
      short: "Walker",
      title: "Walker",
      desc: "Take 1,000 steps.",
      icon: "👣",
      progress: (s) => ({ value: s.steps, target: 1000 }),
      unlockWhen: (s) => s.steps >= 1000,
    },
  ];
}

/* =======================
   Utils
   ======================= */
function levelXP(lv) {
  // quadratic-ish curve; tune to your economy
  if (lv <= 1) return 0;
  return Math.round(50 * (lv - 1) * (lv - 1) + 50 * (lv - 1));
}

function clamp(n, a, b) {
  return Math.max(a, Math.min(b, n));
}

function bandLabel(h) {
  if (h > 66) return "Happy";
  if (h > 33) return "Okay";
  return "Needs Care";
}

function bandColor(h) {
  if (h > 66) return "bg-emerald-500";
  if (h > 33) return "bg-amber-500";
  return "bg-rose-500";
}

function safeProgress(fn, state) {
  try { return fn?.(state) || { value: 0, target: 1 }; } catch { return { value: 0, target: 1 }; }
}
function safeBool(fn, state) {
  try { return !!fn?.(state); } catch { return false; }
}

function safeSession(key) {
  try { return sessionStorage.getItem(key); } catch { return null; }
}

/* ============================================================
   EXPORTED HELPER
   Append events to localStorage so they appear in Memory()
   ============================================================ */
export function addMemoryEvent(evt, storageKey = "doggerz_events") {
  try {
    const payload = { ...evt, ts: evt?.ts ?? Date.now() };
    const raw = localStorage.getItem(storageKey);
    const list = raw ? JSON.parse(raw) : [];
    list.unshift(payload);
    localStorage.setItem(storageKey, JSON.stringify(list.slice(0, 100)));
  } catch {}
}

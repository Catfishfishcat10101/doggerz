// src/components/Features/StatsAndMilestones.jsx
// src/components/Features/StatsAndMilestones.jsx
import React, { useMemo } from "react";
import { useSelector } from "react-redux";
import { selectHappiness } from "../../redux/dogSlice";

/**
 * StatsAndMilestones
 * - Shows core dog stats (level/xp/happiness/position/coins)
 * - Derives milestones from current state (no backend required)
 * - Progress bars + compact badges
 *
 * Props (all optional):
 * - className?: string
 * - compact?: boolean       // smaller paddings/fonts
 * - showTimeline?: boolean  // shows recent events if present in state
 * - showBadges?: boolean    // renders badges grid
 */
export default function StatsAndMilestones({
  className = "",
  compact = false,
  showTimeline = true,
  showBadges = true,
}) {
  // Safe reads with fallbacks so we don't couple to a specific slice shape.
  const dog = useSelector((s) => s.dog ?? {});
  const happiness = useSelector(selectHappiness) ?? (Number(dog.happiness) || 0);

  const level = Number(dog.level) || 1;
  const xp = Number(dog.xp) || 0;
  const name = dog.name || "Doggo";
  const coins = Number(dog.coins) || 0;
  const pos = dog.pos || dog.position || { x: 0, y: 0 };

  // Heuristic: how much XP to next level. If your slice has a real formula, swap it in.
  const xpForLevel = useMemo(() => levelXP(level), [level]);
  const xpNext = useMemo(() => levelXP(level + 1), [level]);
  const xpIntoLevel = Math.max(0, xp - xpForLevel);
  const xpSpan = Math.max(1, xpNext - xpForLevel);
  const xpPct = clamp((xpIntoLevel / xpSpan) * 100, 0, 100);

  // Derived stats
  const careScore = clamp(Math.round((happiness * 0.7) + (Math.min(100, xp / 10) * 0.3)), 0, 100);

  // Spec your milestones here. Each item defines:
  // id, title, desc, progress: (state) => { value, target }, unlockWhen: (state) => boolean
  const spec = useMemo(() => milestoneSpecs(), []);
  const state = useMemo(
    () => ({
      level, xp, happiness, coins,
      steps: Number(dog.steps) || 0, // if you later track steps/moves
      tricksLearned: Array.isArray(dog.tricks) ? dog.tricks.length : Number(dog.tricksLearned) || 0,
      streakDays: Number(dog.streakDays) || 0,
      careScore,
    }),
    [level, xp, happiness, coins, dog.steps, dog.tricks, dog.tricksLearned, dog.streakDays, careScore]
  );

  const milestones = useMemo(() => {
    return spec.map((m) => {
      const p = safeProgress(m.progress, state);
      const unlocked = safeBool(m.unlockWhen, state);
      const pct = clamp(((p.value ?? 0) / (p.target || 1)) * 100, 0, 100);
      return { ...m, progress: p, unlocked, pct };
    });
  }, [spec, state]);

  const unlockedCount = milestones.filter((m) => m.unlocked).length;

  // Optional timeline (if you ever push recent events into state.dog.timeline)
  const timeline = Array.isArray(dog.timeline) ? dog.timeline.slice(0, 8) : [];

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
          <div className="text-xs uppercase tracking-wider text-emerald-900/60">Profile</div>
          <h2 className={["font-bold", compact ? "text-lg" : "text-xl"].join(" ")}>{name}</h2>
        </div>
        <div className="text-right">
          <div className="text-xs text-emerald-900/60">Coins</div>
          <div className="font-mono">{coins.toLocaleString()}</div>
        </div>
      </div>

      {/* Core stats */}
      <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <StatCard label="Level" value={`Lv ${level}`} sub={`XP ${xp.toLocaleString()}`}>
          <ProgressBar value={xpPct} label="To next level" />
        </StatCard>

        <StatCard label="Happiness" value={`${Math.round(happiness)}%`} sub={bandLabel(happiness)}>
          <ProgressBar value={happiness} color={bandColor(happiness)} />
        </StatCard>

        <StatCard label="Care Score" value={`${careScore}%`} sub="Composite mood/XP">
          <ProgressBar value={careScore} />
        </StatCard>
      </div>

      {/* Position row */}
      <div className="mt-3 rounded-xl border bg-white">
        <div className="flex items-center justify-between px-3 py-2">
          <div className="text-sm text-emerald-900/70">Position</div>
          <div className="font-mono text-sm">
            x:{Math.round(pos.x || 0)} y:{Math.round(pos.y || 0)}
          </div>
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

      {/* Badges grid */}
      {showBadges && (
        <div className="mt-4">
          <div className="font-semibold">Badges</div>
          <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-2">
            {milestones.map((m) => (
              <Badge key={`b-${m.id}`} unlocked={m.unlocked} title={m.short || m.title} />
            ))}
          </div>
        </div>
      )}

      {/* Timeline */}
      {showTimeline && (
        <div className="mt-4">
          <div className="font-semibold">Recent</div>
          {timeline.length === 0 ? (
            <p className="mt-2 text-sm text-emerald-900/70">Train, feed, or play to generate activity.</p>
          ) : (
            <ul className="mt-2 space-y-1">
              {timeline.map((evt, i) => (
                <li key={i} className="text-sm text-emerald-900/80 flex items-center gap-2">
                  <span className="text-emerald-600">•</span>
                  <span className="font-medium">{evt.title || "Event"}</span>
                  <span className="text-emerald-900/60">— {evt.desc || evt.message || ""}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </section>
  );
}

/* ---------------- UI Bits ---------------- */

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
      {!compact && (
        <div className="w-12 text-right font-mono text-xs">{Math.round(pct)}%</div>
      )}
    </div>
  );
}

function Badge({ unlocked, title }) {
  return (
    <div
      className={[
        "rounded-xl border p-3 text-center",
        unlocked ? "bg-white" : "bg-slate-50 opacity-70",
      ].join(" ")}
      title={title}
    >
      <div className="text-2xl">{unlocked ? "🏅" : "🔒"}</div>
      <div className="mt-1 text-xs text-emerald-900/80 truncate">{title}</div>
    </div>
  );
}

/* ---------------- Milestone Logic ---------------- */

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
  ];
}

/* ---------------- Utils ---------------- */

function levelXP(lv) {
  // quadratic-ish curve: tune for your economy
  // Lv1 starts at 0, Lv2 at 100, Lv3 at 250, Lv4 at 450, ...
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

// src/components/Stats/Status.jsx
import React, { useMemo, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import {
  HeartCrack,
  BatteryLow,
  Bone,
  ShowerHead,
  Bug,
  ShieldAlert,
  Activity,
  PawPrint,
  Sparkles,
} from "lucide-react";
// ACTIONS: keep this path aligned with your project (you used ../../redux/dogSlice elsewhere)
import { feedDog, playWithDog, batheDog } from "../../redux/dogSlice";

/**
 * Status Panel
 * - Prioritizes issues (critical → high → medium)
 * - Animated alerts with accessible live region
 * - Quick Actions: Feed / Play / Bathe (dispatches to Redux)
 * - Compact mode when too many alerts; togglable "Show all"
 */

const SEVERITY = {
  CRITICAL: "critical",
  HIGH: "high",
  MEDIUM: "medium",
};

const paletteBySeverity = {
  [SEVERITY.CRITICAL]:
    "bg-gradient-to-r from-red-700 to-red-600 text-white ring-1 ring-red-400/40",
  [SEVERITY.HIGH]:
    "bg-gradient-to-r from-orange-600 to-amber-600 text-white ring-1 ring-amber-400/40",
  [SEVERITY.MEDIUM]:
    "bg-gradient-to-r from-blue-700 to-indigo-700 text-white ring-1 ring-blue-400/30",
};

const iconByType = {
  hunger: Bone,
  energy: BatteryLow,
  happiness: HeartCrack,
  dirty: ShowerHead,
  fleas: Bug,
  mange: ShieldAlert,
};

function AlertCard({ item, onFeed, onPlay, onBathe }) {
  const Icon = iconByType[item.type] ?? Activity;
  const classes = paletteBySeverity[item.severity] ?? "bg-slate-700 text-white";

  // quick actions per alert type
  const actions = [];
  if (item.type === "hunger") {
    actions.push(
      <button
        key="feed"
        onClick={onFeed}
        className="px-2 py-1 rounded-md bg-white/20 hover:bg-white/30 text-xs"
      >
        Feed
      </button>
    );
  }
  if (item.type === "happiness" || item.type === "energy") {
    actions.push(
      <button
        key="play"
        onClick={onPlay}
        className="px-2 py-1 rounded-md bg-white/20 hover:bg-white/30 text-xs"
      >
        Play
      </button>
    );
  }
  if (item.type === "dirty" || item.type === "fleas") {
    actions.push(
      <button
        key="bathe"
        onClick={onBathe}
        className="px-2 py-1 rounded-md bg-white/20 hover:bg-white/30 text-xs"
      >
        Bathe
      </button>
    );
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -6, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -6, scale: 0.98 }}
      className={`text-sm font-semibold px-3 py-2 rounded-xl shadow ${classes}`}
      role={item.severity === SEVERITY.CRITICAL ? "alert" : undefined}
    >
      <div className="flex items-center gap-2">
        <Icon size={16} className="shrink-0 opacity-90" />
        <div className="flex-1 leading-tight">{item.message}</div>
        {actions.length > 0 && <div className="flex items-center gap-1">{actions}</div>}
      </div>
    </motion.div>
  );
}

export default function Status({ maxItems = 3 }) {
  const dispatch = useDispatch();
  const { happiness = 100, energy = 100, hunger = 100, isDirty, hasFleas, hasMange } =
    useSelector((s) => s.dog || {});

  // Derive alerts with priority
  const alerts = useMemo(() => {
    const list = [];

    // Lower hunger value means hungrier? (Your code treats <30 as hungry)
    if (hunger < 15)
      list.push({
        id: "hunger-critical",
        type: "hunger",
        severity: SEVERITY.CRITICAL,
        message: "🍖 Critically hungry! Feed your dog now.",
      });
    else if (hunger < 30)
      list.push({
        id: "hunger-high",
        type: "hunger",
        severity: SEVERITY.HIGH,
        message: "🐶 Your dog is getting hungry!",
      });

    if (energy < 10)
      list.push({
        id: "energy-critical",
        type: "energy",
        severity: SEVERITY.CRITICAL,
        message: "⚡ Exhausted! Let your dog rest ASAP.",
      });
    else if (energy < 25)
      list.push({
        id: "energy-high",
        type: "energy",
        severity: SEVERITY.HIGH,
        message: "⚡ Low energy — try resting or feeding!",
      });

    if (happiness < 15)
      list.push({
        id: "happiness-high",
        type: "happiness",
        severity: SEVERITY.HIGH,
        message: "😢 Very unhappy — spend time playing!",
      });
    else if (happiness < 30)
      list.push({
        id: "happiness-med",
        type: "happiness",
        severity: SEVERITY.MEDIUM,
        message: "😕 Your dog feels neglected.",
      });

    if (hasMange)
      list.push({
        id: "mange",
        type: "mange",
        severity: SEVERITY.CRITICAL,
        message: "⚠️ Mange detected. Seek urgent vet care.",
      });

    if (hasFleas)
      list.push({
        id: "fleas",
        type: "fleas",
        severity: SEVERITY.HIGH,
        message: "🐜 Fleas present — bathe and groom soon.",
      });

    if (isDirty)
      list.push({
        id: "dirty",
        type: "dirty",
        severity: SEVERITY.MEDIUM,
        message: "🧼 Needs a bath.",
      });

    // sort by severity priority
    const order = { [SEVERITY.CRITICAL]: 0, [SEVERITY.HIGH]: 1, [SEVERITY.MEDIUM]: 2 };
    list.sort((a, b) => order[a.severity] - order[b.severity]);

    return list;
  }, [hunger, energy, happiness, isDirty, hasFleas, hasMange]);

  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? alerts : alerts.slice(0, maxItems);
  const hiddenCount = Math.max(0, alerts.length - visible.length);

  // Quick actions
  const handleFeed = () => dispatch(feedDog(20)); // adjust payloads to match your reducer
  const handlePlay = () => dispatch(playWithDog(15));
  const handleBathe = () => dispatch(batheDog(25));

  return (
    <section
      aria-label="Dog Status"
      className="w-72 bg-white/10 backdrop-blur-sm text-white p-3 rounded-2xl shadow ring-1 ring-white/15"
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <PawPrint size={18} className="opacity-90" />
          Status
        </h3>

        {/* “All good” chip when no alerts */}
        {alerts.length === 0 && (
          <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-lg bg-emerald-500/30 ring-1 ring-emerald-300/40">
            <Sparkles size={14} />
            All good
          </span>
        )}
      </div>

      {/* Live region for assistive tech */}
      <div className="sr-only" aria-live="polite">
        {alerts.length === 0 ? "All good." : `${alerts.length} alert${alerts.length > 1 ? "s" : ""} active.`}
      </div>

      {alerts.length === 0 ? (
        <p className="text-sm text-white/80">
          Your dog is doing great. Keep up the love and play! 🐾
        </p>
      ) : (
        <>
          <div className="space-y-2">
            <AnimatePresence initial={false}>
              {visible.map((item) => (
                <AlertCard
                  key={item.id}
                  item={item}
                  onFeed={handleFeed}
                  onPlay={handlePlay}
                  onBathe={handleBathe}
                />
              ))}
            </AnimatePresence>
          </div>

          {hiddenCount > 0 && (
            <button
              className="mt-2 w-full text-xs text-white/90 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 ring-1 ring-white/15"
              onClick={() => setShowAll((s) => !s)}
            >
              {showAll ? "Show less" : `Show ${hiddenCount} more`}
            </button>
          )}
        </>
      )}
    </section>
  );
}
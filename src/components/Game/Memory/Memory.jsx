// src/components/Features/Memory.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";
import {
  selectDogLevel,
  selectCoins,
  selectAccessories,
} from "@/../redux/dogSlice";

/* ----------------------------- tiny hooks ------------------------------ */
function useIsBrowser() {
  return typeof window !== "undefined";
}

/** SSR-safe sessionStorage hook (read on mount, update reactively) */
function useSessionStorage(key, initialValue) {
  const isBrowser = useIsBrowser();
  const read = () => {
    if (!isBrowser) return initialValue;
    try {
      const v = window.sessionStorage.getItem(key);
      return v != null ? JSON.parse(v) : initialValue;
    } catch {
      return initialValue;
    }
  };
  const [value, setValue] = useState(read);
  useEffect(() => {
    if (!isBrowser) return;
    try {
      window.sessionStorage.setItem(key, JSON.stringify(value));
    } catch {}
  }, [isBrowser, key, value]);
  useEffect(() => {
    if (!isBrowser) return;
    const onStorage = (e) => {
      if (e.key === key) {
        try {
          setValue(e.newValue != null ? JSON.parse(e.newValue) : initialValue);
        } catch {}
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [isBrowser, key, initialValue]);
  return [value, setValue];
}

/** SSR-safe localStorage hook for event log */
function useLocalStorage(key, initialValue) {
  const isBrowser = useIsBrowser();
  const read = () => {
    if (!isBrowser) return initialValue;
    try {
      const v = window.localStorage.getItem(key);
      return v != null ? JSON.parse(v) : initialValue;
    } catch {
      return initialValue;
    }
  };
  const [value, setValue] = useState(read);
  useEffect(() => {
    if (!isBrowser) return;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {}
  }, [isBrowser, key, value]);
  return [value, setValue];
}

/* --------------------------- component --------------------------------- */

export default function Memory() {
  const level = useSelector(selectDogLevel);
  const coins = useSelector(selectCoins);
  const accessories = useSelector(selectAccessories);
  const ownedCount = accessories?.owned?.length ?? 0;

  const [yardSkin] = useSessionStorage("yardSkin", "default");
  const [buff] = useSessionStorage("buff", "None");

  // Persisted event log
  const [events, setEvents] = useLocalStorage("doggerz:memoryLog", []);
  const [filter, setFilter] = useState("all"); // all | level | coins | accessories | system

  // prev refs to detect changes
  const prev = useRef({ level, coins, ownedCount });

  // append helper
  const pushEvent = (e) =>
    setEvents((list) =>
      [
        {
          id: crypto.randomUUID?.() || String(Date.now()),
          ts: Date.now(),
          ...e,
        },
        ...list,
      ].slice(0, 300),
    );

  // auto-log key milestones
  useEffect(() => {
    if (prev.current.level !== level) {
      const delta = level - prev.current.level;
      if (!Number.isNaN(delta) && prev.current.level !== undefined) {
        pushEvent({
          type: "level",
          title: delta > 0 ? `Level Up → ${level}` : `Level Changed → ${level}`,
          meta: { from: prev.current.level, to: level },
        });
      }
    }
    if (prev.current.coins !== coins) {
      const d = coins - (prev.current.coins ?? 0);
      if (prev.current.coins !== undefined && d !== 0) {
        pushEvent({
          type: "coins",
          title: d > 0 ? `Coins +${d}` : `Coins ${d}`,
          meta: { from: prev.current.coins, to: coins },
        });
      }
    }
    if (prev.current.ownedCount !== ownedCount) {
      const d = ownedCount - (prev.current.ownedCount ?? 0);
      if (prev.current.ownedCount !== undefined && d !== 0) {
        pushEvent({
          type: "accessories",
          title:
            d > 0 ? `Accessory acquired (+${d})` : `Accessory removed (${d})`,
          meta: { from: prev.current.ownedCount, to: ownedCount },
        });
      }
    }
    prev.current = { level, coins, ownedCount };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [level, coins, ownedCount]);

  // derived + filters
  const filtered = useMemo(() => {
    if (filter === "all") return events;
    return events.filter((e) => e.type === filter);
  }, [events, filter]);

  const clearLog = () => setEvents([]);
  const exportLog = () => {
    try {
      const blob = new Blob([JSON.stringify(events, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `doggerz-memory-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {}
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow p-6 border border-black/5 dark:border-white/10">
      <header className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-rose-900 dark:text-rose-200">
            Doggerz Memory
          </h3>
          <p className="text-sm text-rose-900/70 dark:text-rose-300/70">
            Lightweight event feed. Auto-logs key milestones; persists locally.
          </p>
        </div>
        <div className="flex gap-2">
          <select
            className="select w-36"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            title="Filter events"
          >
            <option value="all">All events</option>
            <option value="level">Level</option>
            <option value="coins">Coins</option>
            <option value="accessories">Accessories</option>
            <option value="system">System</option>
          </select>
          <button className="btn" onClick={exportLog} title="Export JSON">
            Export
          </button>
          <button className="btn" onClick={clearLog} title="Clear log">
            Clear
          </button>
        </div>
      </header>

      {/* Snapshot state */}
      <ul className="mt-3 text-rose-900/80 dark:text-rose-100/80 text-sm list-disc pl-5 space-y-1">
        <li>Current Level: {level}</li>
        <li>Coins: {coins}</li>
        <li>Owned Accessories: {ownedCount}</li>
        <li>Session Buff: {buff || "None"}</li>
        <li>Yard Skin: {yardSkin || "default"}</li>
      </ul>

      {/* Event list */}
      <div className="mt-5">
        {filtered.length === 0 ? (
          <div className="text-sm opacity-70">
            No events yet. Play a bit and come back!
          </div>
        ) : (
          <ol className="space-y-2">
            {filtered.map((e) => (
              <li key={e.id} className="flex items-start gap-3">
                <span
                  className="mt-1 inline-block h-2.5 w-2.5 rounded-full"
                  style={{ background: dotColor(e.type) }}
                  aria-hidden
                />
                <div className="flex-1">
                  <div className="text-sm">
                    <b>{e.title}</b>
                  </div>
                  <div className="text-xs opacity-70">
                    {formatTs(e.ts)}
                    {e.meta ? ` · ${metaText(e.meta)}` : ""}
                  </div>
                </div>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}

/* ----------------------------- helpers --------------------------------- */

function dotColor(type) {
  switch (type) {
    case "level":
      return "#f97316"; // orange-500
    case "coins":
      return "#10b981"; // emerald-500
    case "accessories":
      return "#6366f1"; // indigo-500
    default:
      return "#94a3b8"; // slate-400
  }
}

function formatTs(ts) {
  try {
    const d = new Date(ts);
    return d.toLocaleString();
  } catch {
    return String(ts);
  }
}

function metaText(meta) {
  const pairs = Object.entries(meta);
  return pairs.map(([k, v]) => `${k}: ${v}`).join(", ");
}
/* ----------------------------------------------------------------------- */

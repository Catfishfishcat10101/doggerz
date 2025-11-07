// src/components/UI/Status.jsx
import React, { memo, useEffect, useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { selectDog, selectDogLevel, selectCoins } from "@/redux/dogSlice.js";

/**
 * Status
 * - Shows dog name (inline editable), level, and coin balance with delta animation
 * - Persists name to localStorage under "doggerz_name"
 * - No new dependencies; purely presentational
 */
function Status({ className = "", onRename }) {
  // ---------- Safe state reads ----------
  const dog = useSelector(selectDog) || {};
  const coins = useSelector(selectCoins);
  const level = useSelector(selectDogLevel);

  const lsName = (() => {
    try {
      return localStorage.getItem("doggerz_name");
    } catch {
      return null;
    }
  })();

  const derivedName = dog?.name || lsName || "Your Pup";
  const [name, setName] = useState(derivedName);
  const [editing, setEditing] = useState(false);

  // Keep local state in sync if Redux/LS provide a new name later
  useEffect(() => {
    setName(derivedName);
  }, [derivedName]);

  // ---------- Coin delta animation ----------
  const prevCoinsRef = useRef(typeof coins === "number" ? coins : 0);
  const [coinDelta, setCoinDelta] = useState(0);
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    const curr = Number(coins ?? 0);
    const prev = Number(prevCoinsRef.current ?? 0);
    const diff = curr - prev;
    if (diff !== 0) {
      setCoinDelta(diff);
      setFlash(true);
      const t = setTimeout(() => setFlash(false), 800);
      return () => clearTimeout(t);
    }
  }, [coins]);

  useEffect(() => {
    prevCoinsRef.current = Number(coins ?? 0);
  }, [coins]);

  // ---------- Save name ----------
  const commitName = (next) => {
    const trimmed = next.trim() || "Your Pup";
    setName(trimmed);
    try {
      localStorage.setItem("doggerz_name", trimmed);
    } catch {}
    onRename?.(trimmed);
  };

  // ---------- Derived safe values ----------
  const safeCoins = useMemo(() => Number(coins ?? 0), [coins]);
  const safeLevel = useMemo(() => Number(level ?? 1), [level]);

  return (
    <div
      className={[
        "rounded-2xl shadow p-4 border border-black/5 dark:border-white/10",
        "bg-white dark:bg-slate-900 flex items-center justify-between gap-3",
        className,
      ].join(" ")}
    >
      {/* Left: avatar + name + level */}
      <div className="flex items-center gap-3 min-w-0">
        <div
          className="h-10 w-10 rounded-xl bg-gradient-to-br from-rose-200 to-rose-100 dark:from-rose-900/50 dark:to-rose-800/40 grid place-items-center text-lg"
          aria-hidden
        >
          🐶
        </div>

        <div className="min-w-0">
          {editing ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                commitName(name);
                setEditing(false);
              }}
              className="flex items-center gap-2"
            >
              <input
                className="px-2 py-1 rounded-lg border border-black/10 dark:border-white/10 bg-white dark:bg-slate-800 text-sm w-40"
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={() => {
                  commitName(name);
                  setEditing(false);
                }}
                maxLength={32}
                aria-label="Dog name"
              />
              <button
                type="submit"
                className="text-xs px-2 py-1 rounded-lg bg-rose-600 text-white"
              >
                Save
              </button>
            </form>
          ) : (
            <div className="flex items-center gap-2">
              <div className="font-semibold text-rose-900 dark:text-rose-200 truncate">
                {name}
              </div>
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="text-xs px-2 py-0.5 rounded-md bg-rose-100 text-rose-900 dark:bg-rose-800/40 dark:text-rose-100 hover:shadow"
                aria-label="Rename dog"
                title="Rename"
              >
                Edit
              </button>
            </div>
          )}
          <div className="text-xs text-rose-900/60 dark:text-rose-200/60">
            Level {safeLevel}
          </div>
        </div>
      </div>

      {/* Right: coins with delta */}
      <div className="relative">
        <div
          className={[
            "px-3 py-1 rounded-lg text-sm font-semibold",
            "bg-rose-100 text-rose-900 dark:bg-rose-800/40 dark:text-rose-100",
            "border border-black/5 dark:border-white/10",
          ].join(" ")}
          aria-live="polite"
          aria-label={`Coins: ${safeCoins}`}
        >
          💰 {safeCoins}
        </div>

        {/* floating +Δ */}
        {flash && coinDelta !== 0 && (
          <span
            className={[
              "absolute -top-4 right-0 text-xs font-bold",
              coinDelta > 0 ? "text-emerald-500" : "text-rose-500",
              "animate-[rise_800ms_ease-out_forwards]",
            ].join(" ")}
            aria-hidden
          >
            {coinDelta > 0 ? `+${coinDelta}` : coinDelta}
          </span>
        )}
      </div>

      {/* tiny keyframes */}
      <style>
        {`
          @keyframes rise {
            0%   { transform: translateY(4px); opacity: 0; }
            30%  { transform: translateY(0px); opacity: 1; }
            100% { transform: translateY(-10px); opacity: 0; }
          }
        `}
      </style>
    </div>
  );
}

export default memo(Status);

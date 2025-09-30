import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useLocation, Navigate } from "react-router-dom";

// Optional Redux wire-up:
// import { useDispatch } from "react-redux";
// import { setDogName } from "@/redux/dogSlice";

const LS_KEY = "dogName";

function safeGetName() {
  try {
    const v = localStorage.getItem(LS_KEY);
    return typeof v === "string" ? v : "";
  } catch {
    return "";
  }
}

function safeSetName(n) {
  try {
    localStorage.setItem(LS_KEY, n);
    return true;
  } catch {
    return false;
  }
}

export default function NewPup() {
  // Read once to avoid a redirect “flash”
  const existingName = useMemo(() => safeGetName().trim(), []);
  if (existingName && existingName.length >= 2) {
    // Hard redirect before paint if the user already named a pup
    return <Navigate to="/game" replace />;
  }

  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const nav = useNavigate();
  const loc = useLocation();
  const inputRef = useRef(null);
  // const dispatch = useDispatch();

  useEffect(() => {
    // Focus on mount for fast UX; safe for SR users too because label+id are wired
    inputRef.current?.focus();
  }, []);

  const validate = (n) => {
    const s = n.trim();
    if (s.length < 2) return "Name must be at least 2 characters.";
    if (s.length > 24) return "Keep it under 24 characters.";
    // restrict to printable unicode letters, digits, space, basic punctuation
    if (!/^[\p{L}\p{N} _.'-]+$/u.test(s)) return "Only letters, numbers, space, . ' - _ allowed.";
    return "";
  };

  function onChange(e) {
    const v = e.target.value;
    setName(v);
    if (error) {
      // live-validate but don’t nag on every keystroke unless there *was* an error
      const msg = validate(v);
      if (!msg) setError("");
    }
  }

  async function onSubmit(e) {
    e.preventDefault();
    if (saving) return;

    const trimmed = name.trim();
    const msg = validate(trimmed);
    if (msg) return setError(msg);

    setSaving(true);
    const ok = safeSetName(trimmed);
    // if (ok) dispatch(setDogName(trimmed));
    const next =
      loc.state && loc.state.from && typeof loc.state.from.pathname === "string"
        ? loc.state.from.pathname
        : "/game";
    if (!ok) {
      setSaving(false);
      return setError("Could not save locally. Check browser storage settings.");
    }
    nav(next, { replace: true });
  }

  function randomize() {
    const pool = ["Odin", "Pixel", "Fireball", "Scout", "Ziggy", "Rogue", "Mocha", "Turbo"];
    const pick = pool[(Math.random() * pool.length) | 0];
    setName(pick);
    setError("");
    inputRef.current?.focus();
  }

  return (
    <div className="min-h-dvh grid place-items-center bg-gradient-to-b from-zinc-900 to-zinc-800 text-zinc-50 p-6">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-md rounded-2xl bg-zinc-900/60 shadow-xl ring-1 ring-zinc-700 p-6 space-y-4"
        aria-labelledby="newpup-title"
        noValidate
      >
        <h1 id="newpup-title" className="text-2xl font-bold tracking-tight">
          Name your pup
        </h1>

        <label className="block text-sm font-medium text-zinc-300" htmlFor="pupname">
          Pup name
        </label>
        <input
          id="pupname"
          ref={inputRef}
          value={name}
          onChange={onChange}
          placeholder="e.g., Fireball"
          inputMode="text"
          maxLength={32}
          className="w-full rounded-xl bg-zinc-800 px-4 py-2 outline-none ring-1 ring-zinc-700 focus:ring-2 focus:ring-emerald-400"
          aria-invalid={!!error}
          aria-describedby={error ? "name-err" : undefined}
        />

        {error ? (
          <p id="name-err" className="text-sm text-red-400">
            {error}
          </p>
        ) : null}

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 rounded-xl bg-emerald-500 px-4 py-2 font-semibold text-zinc-900 hover:bg-emerald-400 enabled:active:translate-y-px disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {saving ? "Saving…" : "Continue"}
          </button>
          <button
            type="button"
            onClick={randomize}
            className="rounded-xl px-4 py-2 ring-1 ring-zinc-700 hover:bg-zinc-800"
            title="Surprise me"
            aria-label="Randomize name"
          >
            🎲
          </button>
        </div>

        <p className="text-xs text-zinc-400">
          Pro tip: you can change this later in Settings.
        </p>
      </form>
    </div>
  );
}

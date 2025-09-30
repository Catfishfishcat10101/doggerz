// src/components/UI/NewPup.jsx
import React, { useMemo, useRef, useState, useEffect } from "react";
import { useNavigate, useLocation, Navigate } from "react-router-dom";

const LS_KEY = "dogName";

function safeGet() {
  try { return localStorage.getItem(LS_KEY) || ""; } catch { return ""; }
}
function safeSet(v) {
  try { localStorage.setItem(LS_KEY, v); return true; } catch { return false; }
}

export default function NewPup() {
  const existing = useMemo(() => safeGet().trim(), []);
  if (existing.length >= 2) return <Navigate to="/game" replace />;

  const [name, setName] = useState("");
  const [err, setErr] = useState("");
  const [saving, setSaving] = useState(false);
  const nav = useNavigate();
  const loc = useLocation();
  const ref = useRef(null);

  useEffect(() => { ref.current?.focus(); }, []);

  const validate = (n) => {
    const s = n.trim();
    if (s.length < 2) return "Name must be at least 2 characters.";
    if (s.length > 24) return "Keep it under 24 characters.";
    if (!/^[\p{L}\p{N} _.'-]+$/u.test(s)) return "Only letters, numbers, space, . ' - _ allowed.";
    return "";
  };

  function submit(e) {
    e.preventDefault();
    if (saving) return;
    const s = name.trim();
    const msg = validate(s);
    if (msg) return setErr(msg);
    setSaving(true);
    if (!safeSet(s)) { setSaving(false); return setErr("Could not save locally."); }
    const next = loc.state?.from?.pathname ?? "/game";
    nav(next, { replace: true });
  }

  return (
    <div className="min-h-dvh grid place-items-center bg-zinc-950 text-zinc-100 p-6">
      <form onSubmit={submit} className="w-full max-w-md space-y-4 rounded-2xl border border-zinc-800 bg-zinc-900/70 p-6">
        <h1 className="text-2xl font-bold">Name your pup</h1>
        <label htmlFor="pupname" className="text-sm text-zinc-300">Pup name</label>
        <input
          id="pupname"
          ref={ref}
          value={name}
          onChange={(e) => { setName(e.target.value); if (err) setErr(""); }}
          className="w-full rounded-xl bg-zinc-800 px-4 py-2 ring-1 ring-zinc-700 focus:ring-2 focus:ring-emerald-400 outline-none"
          placeholder="e.g., Fireball"
          maxLength={32}
          aria-invalid={!!err}
        />
        {err && <p className="text-sm text-red-400">{err}</p>}
        <div className="flex gap-3">
          <button disabled={saving} className="flex-1 rounded-xl bg-emerald-500 px-4 py-2 font-semibold text-zinc-900 hover:bg-emerald-400 disabled:opacity-60">
            {saving ? "Saving…" : "Continue"}
          </button>
          <button
            type="button"
            onClick={() => setName(["Odin","Pixel","Fireball","Scout","Ziggy","Rogue","Mocha","Turbo"][(Math.random()*8)|0])}
            className="rounded-xl px-4 py-2 ring-1 ring-zinc-700 hover:bg-zinc-800"
            title="Surprise me"
            aria-label="Randomize name"
          >🎲</button>
        </div>
        <p className="text-xs text-zinc-400">Pro tip: you can change this later in Settings.</p>
      </form>
    </div>
  );
}
// src/utils/nextRouteAfterAuth.js
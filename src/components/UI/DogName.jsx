// src/components/UI/DogName.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

// ESM-safe: import the whole slice and probe for optional exports
import * as dogSlice from "../../redux/dogSlice";

// Prefer real selectors/actions if present; otherwise use safe fallbacks
const selectName =
  dogSlice.selectName ||
  ((s) => s.dog?.name ?? ""); // fallback to state shape

const setNameAction = dogSlice.setName || null;

const MAX_LEN = 24;
const SUGGESTIONS = [
  "Pixel", "Nova", "Mocha", "Comet", "Kona", "Ranger",
  "Ziggy", "Ember", "Scout", "Pippin", "Echo", "Biscuit",
];

export default function DogName({ onSubmit, autoFocus = true, className = "" }) {
  const dispatch = useDispatch();
  const reduxName = useSelector(selectName);
  const [name, setName] = useState(reduxName || "");
  const [touched, setTouched] = useState(false);

  // keep local input in sync if redux changes elsewhere
  useEffect(() => {
    setName(reduxName || "");
  }, [reduxName]);

  const { valid, reason } = useMemo(() => validate(name), [name]);

  function handleSubmit(e) {
    e?.preventDefault?.();
    setTouched(true);
    if (!valid) return;
    const finalName = name.trim();
    if (setNameAction) {
      // real action creator found
      dispatch(setNameAction(finalName));
    }
    onSubmit?.(finalName);
  }

  function randomize() {
    const pick = SUGGESTIONS[(Math.random() * SUGGESTIONS.length) | 0];
    setName(pick);
    setTouched(true);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={`w-full max-w-md mx-auto p-4 bg-white rounded-2xl shadow ${className}`}
      noValidate
    >
      <label htmlFor="dog-name" className="block text-sm font-medium text-emerald-900 mb-2">
        Name your dog
      </label>

      <div className="flex gap-2">
        <input
          id="dog-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={() => setTouched(true)}
          placeholder="Fireball"
          maxLength={64} // hard cap to prevent silliness; we still validate to 24
          autoFocus={autoFocus}
          aria-invalid={touched && !valid}
          aria-describedby="dog-name-hint dog-name-error"
          className={[
            "w-full px-3 py-2 rounded-xl border focus:outline-none",
            touched && !valid
              ? "border-rose-300 focus:ring-2 focus:ring-rose-300"
              : "border-emerald-900/10 focus:ring-2 focus:ring-emerald-400",
          ].join(" ")}
        />
        <button
          type="button"
          onClick={randomize}
          className="px-3 py-2 rounded-xl border bg-white hover:bg-slate-50 active:scale-95"
          title="Surprise me"
        >
          🎲
        </button>
        <button
          type="submit"
          className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-semibold hover:shadow active:scale-95"
          disabled={!valid}
        >
          Save
        </button>
      </div>

      <div id="dog-name-hint" className="mt-2 text-xs text-emerald-900/60">
        Keep it snappy. Max {MAX_LEN} characters. Letters, numbers, spaces, hyphens, and apostrophes.
      </div>

      {touched && !valid && (
        <div
          id="dog-name-error"
          className="mt-1 text-xs text-rose-600"
          role="alert"
        >
          {reason}
        </div>
      )}
    </form>
  );
}

/* ---------------- helpers ---------------- */

function validate(raw) {
  const s = (raw || "").trim();

  if (s.length === 0) return { valid: false, reason: "Name cannot be empty." };
  if (s.length > MAX_LEN) return { valid: false, reason: `Name must be ≤ ${MAX_LEN} characters.` };

  // Allow letters (any case), digits, spaces, hyphen, apostrophe
  // You can widen this to Unicode letters if you want later.
  const ok = /^[A-Za-z0-9][A-Za-z0-9 '\-]*$/.test(s);
  if (!ok) return { valid: false, reason: "Use letters, numbers, spaces, hyphens, or apostrophes." };

  // Don’t allow repeated separators junk like “----” or “  ”
  if (/ {2,}|'{2,}|\-{2,}/.test(s)) {
    return { valid: false, reason: "Too many repeated separators." };
  }

  return { valid: true, reason: "" };
}

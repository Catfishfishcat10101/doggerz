// src/components/UI/DogName.jsx
import React, { memo, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

// If you have action creators, prefer importing them:
// import { setName as setDogName } from "@/redux/dogSlice";

export default memo(function DogName({
  maxLen = 20,
  className = "",
  persistKey = "doggerz_name",
}) {
  const dispatch = useDispatch();

  // Source of truth from store (safe fallback)
  const storeName = useSelector((s) => s?.dog?.name) ?? readLS(persistKey) ?? "Pupper";

  // Local edit state
  const [value, setValue] = useState(storeName);
  const [error, setError] = useState("");
  const [status, setStatus] = useState(""); // SR-friendly status line
  const composingRef = useRef(false); // IME in progress?
  const debTimer = useRef(null);

  // Keep local input in sync if Redux changes externally
  useEffect(() => { setValue(storeName); }, [storeName]);

  // Validate + normalize before dispatch/persist
  const normalize = (v) => {
    const trimmed = v.replace(/\s+/g, " ").trim();
    return trimmed.length ? trimmed : "Pupper";
  };
  const validate = (v) => {
    if (v.length > maxLen) return `Name must be ≤ ${maxLen} characters.`;
    return "";
  };

  // Persist + dispatch (debounced calls collapse to one)
  const commit = (raw) => {
    const next = normalize(raw);
    const err = validate(next);
    if (err) { setError(err); return; }
    setError("");
    // Persist
    try { localStorage.setItem(persistKey, next); } catch {}

    // Dispatch (prefer action creator if you have one)
    try {
      // dispatch(setDogName(next))  // if you import an action creator
      dispatch({ type: "dog/setName", payload: { name: next } });
    } catch {}
    setStatus(`Saved name: ${next}`);
  };

  const scheduleCommit = (raw) => {
    if (debTimer.current) clearTimeout(debTimer.current);
    debTimer.current = setTimeout(() => commit(raw), 400);
  };

  // Handlers
  const onChange = (e) => {
    const raw = e.target.value;
    setValue(raw);
    if (!composingRef.current) scheduleCommit(raw);
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      commit(value);
      e.currentTarget.blur();
    } else if (e.key === "Escape") {
      e.preventDefault();
      setValue(storeName); // revert
      setError("");
      setStatus("Reverted changes");
      e.currentTarget.blur();
    }
  };

  return (
    <div className={["flex items-center gap-2", className].join(" ")}>
      <label htmlFor="dog-name" className="text-xs opacity-70">
        Name:
      </label>
      <input
        id="dog-name"
        className={[
          "bg-slate-900/40 border border-slate-700 rounded-xl px-3 py-1 text-sm min-w-[12ch] max-w-[22ch]",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400",
          error ? "border-rose-500" : ""
        ].join(" ")}
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown}
        onBlur={() => commit(value)}
        onCompositionStart={() => { composingRef.current = true; }}
        onCompositionEnd={(e) => { composingRef.current = false; scheduleCommit(e.currentTarget.value); }}
        maxLength={Math.max(1, maxLen + 10)} // allow typing before normalize/trim
        placeholder="Your dog's name"
        aria-describedby="dog-name-hint dog-name-status"
        aria-invalid={error ? "true" : "false"}
        inputMode="text"
        autoComplete="off"
        spellCheck="false"
      />
      {/* Inline hint / errors */}
      <span id="dog-name-hint" className="sr-only">
        Press Enter to save, Escape to cancel. Maximum {maxLen} characters.
      </span>
      {error && (
        <span className="ml-1 text-[11px] text-rose-400">{error}</span>
      )}
      {/* SR/live status */}
      <span id="dog-name-status" className="sr-only" aria-live="polite">
        {status}
      </span>
    </div>
  );
});

/* ---------- utils ---------- */
function readLS(key) {
  try { return localStorage.getItem(key) || null; } catch { return null; }
}

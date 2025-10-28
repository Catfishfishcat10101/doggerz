// src/components/UI/DogName.jsx
import React, { memo, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setName as setDogName } from "@/redux/dogSlice";

export default memo(function DogName({
  maxLen = 20,
  className = "",
  persistKey = "doggerz_name",
}) {
  const dispatch = useDispatch();

  // Pull raw name from store; do NOT use selector that injects defaults.
  const reduxName = useSelector((s) => s?.dog?.name);

  // Local editable value mirrors Redux and can be ahead of it during typing.
  const [value, setValue] = useState(reduxName ?? "");
  const [error, setError] = useState("");
  const [status, setStatus] = useState(""); // human-visible + SR feedback

  const composingRef = useRef(false); // IME composition in progress?
  const debTimer = useRef(null);
  const statusTimer = useRef(null);

  /* ------------------------------ utilities ------------------------------ */
  const readLS = (key) => {
    try {
      return localStorage.getItem(key) || null;
    } catch {
      return null;
    }
  };
  const writeLS = (key, v) => {
    try {
      localStorage.setItem(key, v);
    } catch {}
  };
  const normalize = (v) => {
    const trimmed = (v ?? "").replace(/\s+/g, " ").trim();
    return trimmed.length ? trimmed : "Pupper";
  };
  const validate = (v) => {
    if (v.length > maxLen) return `Name must be ≤ ${maxLen} characters.`;
    return "";
  };
  const setTransientStatus = (msg) => {
    setStatus(msg);
    if (statusTimer.current) clearTimeout(statusTimer.current);
    statusTimer.current = setTimeout(() => setStatus(""), 1200);
  };

  /* ------------------------------- hydrate ------------------------------- */
  // On first mount: if Redux has no name, hydrate from localStorage.
  useEffect(() => {
    if (!reduxName) {
      const cached = readLS(persistKey);
      if (cached) {
        dispatch(setDogName(cached));
        setValue(cached);
        setTransientStatus(`Loaded saved name: ${cached}`);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run once

  /* ------------------------- keep local in sync -------------------------- */
  useEffect(() => {
    // When Redux changes (elsewhere), mirror it—unless in IME composition.
    if (!composingRef.current && typeof reduxName === "string") {
      setValue(reduxName);
    }
  }, [reduxName]);

  /* ---------------------------- commit logic ----------------------------- */
  const commit = (raw) => {
    const next = normalize(raw);
    const err = validate(next);
    if (err) {
      setError(err);
      return;
    }
    setError("");

    writeLS(persistKey, next);
    dispatch(setDogName(next));
    setTransientStatus(`Saved name: ${next}`);
  };

  const scheduleCommit = (raw) => {
    if (debTimer.current) clearTimeout(debTimer.current);
    debTimer.current = setTimeout(() => commit(raw), 400);
  };

  /* ------------------------------ handlers ------------------------------- */
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
      // Revert to last Redux value
      const revertTo = typeof reduxName === "string" ? reduxName : "";
      setValue(revertTo);
      setError("");
      setTransientStatus("Reverted changes");
      e.currentTarget.blur();
    }
  };

  /* ------------------------------ cleanup -------------------------------- */
  useEffect(() => {
    return () => {
      if (debTimer.current) clearTimeout(debTimer.current);
      if (statusTimer.current) clearTimeout(statusTimer.current);
    };
  }, []);

  /* -------------------------------- view --------------------------------- */
  return (
    <div className={["flex items-center gap-2", className].join(" ")}>
      <label htmlFor="dog-name" className="text-xs opacity-70">
        Name:
      </label>

      <input
        id="dog-name"
        className={[
          "bg-slate-900/40 border border-slate-700 rounded-xl px-3 py-1 text-sm",
          "min-w-[12ch] max-w-[24ch]",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400",
          error ? "border-rose-500" : "",
        ].join(" ")}
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown}
        onBlur={() => commit(value)}
        onCompositionStart={() => {
          composingRef.current = true;
        }}
        onCompositionEnd={(e) => {
          composingRef.current = false;
          scheduleCommit(e.currentTarget.value);
        }}
        maxLength={Math.max(1, maxLen + 10)} // allow typing before normalize/trim caps it
        placeholder="Your dog's name"
        aria-describedby="dog-name-hint dog-name-status"
        aria-invalid={!!error}
        inputMode="text"
        autoComplete="off"
        spellCheck="false"
      />

      {/* Inline error */}
      {error && <span className="ml-1 text-[11px] text-rose-400">{error}</span>}

      {/* Optional visual confirmation */}
      {!error && status && (
        <span className="ml-2 text-[11px] text-emerald-300 italic">
          {status}
        </span>
      )}

      {/* SR-only helpers */}
      <span id="dog-name-hint" className="sr-only">
        Press Enter to save, Escape to cancel. Maximum {maxLen} characters.
      </span>
      <span id="dog-name-status" className="sr-only" aria-live="polite">
        {status}
      </span>
    </div>
  );
});

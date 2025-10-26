import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { selectUser } from "@/redux/userSlice.js";
import { saveDogName } from "@/services/dogService";

export default function NamePupModal({ open, onClose }) {
  const user = useSelector(selectUser);
  const [val, setVal] = useState("");
  const [err, setErr] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 0);
      setVal("");
      setErr("");
    }
  }, [open]);

  if (!open) return null;

  async function onSubmit(e) {
    e.preventDefault();
    try {
      if (!user?.uid) throw new Error("Not signed in");
      const trimmed = val.trim();
      if (!trimmed) throw new Error("Name required");
      await nameDog(user.uid, trimmed);
      onClose?.();
    } catch (e2) {
      setErr(e2.message || "Failed to set name");
    }
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4">
      <div className="w-full max-w-md rounded-2xl border border-white/15 bg-slate-900 p-5 shadow-xl">
        <h2 className="text-xl font-bold">Name your pup</h2>
        <p className="mt-1 text-sm text-white/70">Max 24 characters.</p>

        <form className="mt-4 space-y-3" onSubmit={onSubmit}>
          <input
            ref={inputRef}
            type="text"
            value={val}
            onChange={(e) => setVal(e.target.value)}
            className="w-full rounded-xl border border-white/15 bg-slate-800 px-3 py-2 text-white placeholder-white/40 outline-none focus:ring-2 focus:ring-white/30"
            placeholder="e.g., Fireball"
            maxLength={24}
          />
          {err && <div className="text-sm text-amber-300">{err}</div>}
          <div className="flex gap-2">
            <button
              type="submit"
              className="px-4 py-2 rounded-xl font-semibold bg-white text-slate-900 hover:bg-white/90"
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => onClose?.()}
              className="px-4 py-2 rounded-xl border border-white/15 text-white/80 hover:bg-white/5"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

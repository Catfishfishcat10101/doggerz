// src/components/UI/NamePupModal.jsx
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { dogPatched, selectDogName } from "@/redux/dogSlice.js";

/**
 * Lightweight modal for first-run naming or renaming.
 * Expects parent to show/hide via `open` prop; calls `onClose()` after submit.
 */
export default function NamePupModal({ open = false, onClose = () => {} }) {
  const dispatch = useDispatch();
  const current = useSelector(selectDogName);
  const [name, setName] = useState(current);
  const [err, setErr] = useState(null);

  if (!open) return null;

  function submit(e) {
    e.preventDefault();
    const trimmed = String(name ?? "").trim();
    if (!trimmed) {
      setErr("Name cannot be empty.");
      return;
    }
    if (trimmed.length > 24) {
      setErr("Keep it under 24 characters.");
      return;
    }
    dispatch(dogPatched({ name: trimmed }));
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="w-[92vw] max-w-md rounded-2xl bg-neutral-900 p-5 shadow-xl ring-1 ring-white/10">
        <h2 className="text-xl font-semibold mb-2 text-white">Name your pup</h2>
        <p className="text-sm mb-4 text-neutral-300">
          This will be visible across saves and leaderboards.
        </p>

        <form onSubmit={submit} className="space-y-3">
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Fireball"
            className="w-full rounded-lg bg-neutral-800 px-3 py-2 outline-none ring-1 ring-white/10 focus:ring-2"
            maxLength={32}
            aria-label="Pup name"
          />
          {err && <div className="text-sm text-red-400">{err}</div>}
          <div className="flex gap-2 justify-end pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-3 py-2 bg-neutral-800 hover:bg-neutral-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg px-3 py-2 bg-white text-black hover:bg-neutral-200"
            >
              Save name
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
// src/redux/dogSlice.js
import React, { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { setName } from "@/redux/dogSlice";

/**
 * NamePupModal
 * - Lightweight, portal-less modal for naming the dog.
 * - Calls onDone(name) after redux update (optional).
 */
export default function NamePupModal({ open, onClose, onDone }) {
  const [name, setLocal] = useState("");
  const ref = useRef(null);
  const dispatch = useDispatch();

  useEffect(() => {
    if (open) {
      setLocal("");
      setTimeout(() => ref.current?.focus(), 0);
    }
  }, [open]);

  if (!open) return null;

  function submit(e) {
    e?.preventDefault?.();
    const n = name.trim();
    if (!n) return;
    dispatch(setName(n));
    onDone?.(n);
    onClose?.();
  }

  return (
    <div className="modal">
      <div className="modal__panel">
        <h2 className="text-xl font-semibold">Name your pup</h2>
        <form onSubmit={submit} className="mt-4 space-y-3">
          <input
            ref={ref}
            value={name}
            onChange={(e) => setLocal(e.target.value.slice(0, 24))}
            placeholder="e.g., Fireball"
            className="w-full rounded-xl border border-white/15 bg-white/10 px-4 py-2 outline-none"
            maxLength={24}
            autoComplete="off"
          />
          <div className="flex gap-2 justify-end">
            <button type="button" className="btn btn--ghost" onClick={onClose}>
              Cancel
            </button>
            <button className="btn" type="submit">
              Adopt
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
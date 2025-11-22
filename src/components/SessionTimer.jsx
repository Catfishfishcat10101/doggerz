// src/components/SessionTimer.jsx
// @ts-nocheck

import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { registerSessionStart, registerSessionEnd } from "@/redux/dogSlice.js";

function fmt(ms) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const s = total % 60;
  const m = Math.floor(total / 60) % 60;
  const h = Math.floor(total / 3600);
  const pad = (n) => String(n).padStart(2, "0");
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
}

export default function SessionTimer() {
  const dispatch = useDispatch();
  const [start, setStart] = useState(() => Date.now());
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const now = Date.now();
    setStart(now);
    dispatch(registerSessionStart({ startMs: now }));
    const id = setInterval(() => setElapsed(Date.now() - now), 1000);
    return () => {
      clearInterval(id);
      dispatch(registerSessionEnd({ endMs: Date.now() }));
    };
  }, [dispatch]);

  return (
    <div className="rounded-full border border-emerald-500/30 bg-emerald-900/20 text-emerald-200 text-[11px] px-2 py-0.5 font-mono">
      Session {fmt(elapsed)}
    </div>
  );
}

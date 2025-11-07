import React from "react";
import { useNavigate } from "react-router-dom";

export default function NotFound() {
  const nav = useNavigate();
  return (
    <div className="min-h-[calc(100dvh-3.5rem-3rem)] grid place-items-center bg-[#0b1020] text-white">
      <div className="text-center">
        <h1 className="text-6xl font-extrabold">404</h1>
        <p className="mt-2 text-white/70">This route doesn’t exist.</p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <button className="btn text-black" onClick={() => nav("/")}>Splash</button>
          <button className="btn btn--ghost" onClick={() => nav(-1)}>Back</button>
        </div>
      </div>
    </div>
  );
}
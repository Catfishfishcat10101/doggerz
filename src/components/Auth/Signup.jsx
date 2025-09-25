import React from "react";
import { useNavigate } from "react-router-dom";

export default function Splash() {
  const nav = useNavigate();
  return (
    <div className="min-h-dvh bg-slate-900 text-white">
      {/* your hero/marketing copy… */}
      <div className="flex gap-3">
        <button onClick={()=>nav("/signup")} className="px-5 py-3 rounded-xl bg-sky-500 hover:bg-sky-400">
          Create account
        </button>
        <button onClick={()=>nav("/login")} className="px-5 py-3 rounded-xl bg-slate-700 hover:bg-slate-600">
          I already have one
        </button>
      </div>
      {/* rest of your splash… */}
    </div>
  );
}
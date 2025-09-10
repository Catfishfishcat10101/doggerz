import React, { useRef } from "react";
import { useNavigate } from "react-router-dom";

export default function Splash() {
  const nav = useNavigate();
  const audioRef = useRef(null);

  const bark = () => {
    const a = audioRef.current;
    if (!a) return;
    a.currentTime = 0;
    a.play().catch(() => {}); // ignore autoplay errors
  };

  return (
    <main className="min-h-screen grid place-items-center relative overflow-hidden">
      {/* Background sparkle */}
      <div className="absolute inset-0 bg-gradient-to-b from-indigo-900 via-slate-900 to-black" />
      {/* Dog + Title */}
      <section className="relative z-10 w-full max-w-xl mx-auto text-center card p-8">
        <div
          className="mx-auto w-40 h-40 rounded-full bg-white/20 grid place-items-center select-none"
          onClick={bark}
        >
          {/* Emoji dog = no asset required; animated */}
          <div
            className="text-6xl"
            style={{ animation: "dog-bounce 1.8s ease-in-out infinite" }}
          >
            🐶
          </div>
        </div>

        <h1 className="mt-6 text-4xl font-extrabold tracking-tight">Doggerz</h1>
        <p className="mt-2 text-slate-300">
          The most realistic virtual dog: potty training, tricks, aging, stats & milestones.
        </p>

        <div className="mt-8 flex items-center justify-center gap-3">
          <button className="btn btn-primary" onClick={() => nav("/auth?tab=signup")}>
            Sign Up
          </button>
          <button className="btn btn-secondary" onClick={() => nav("/auth?tab=signin")}>
            Sign In
          </button>
        </div>
      </section>

      {/* Bark audio from /public/bark.mp3 */}
      <audio ref={audioRef} src="/bark.mp3" preload="auto" />
    </main>
  );
}
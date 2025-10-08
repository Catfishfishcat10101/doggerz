import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import AuthButtons from "@/components/Auth/AuthButtons.jsx";

export default function Splash() {
  const nav = useNavigate();
  const loc = useLocation();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (u) {
        const to = loc.state?.from && loc.state.from !== "/" ? loc.state.from : "/game";
        nav(to, { replace: true });
      }
    });
    return unsub;
  }, [nav, loc.state]);

  return (
    <section className="mx-auto max-w-6xl px-4 py-12 grid gap-6 md:grid-cols-[1.2fr_.8fr] items-start">
      <div>
        <h1 className="text-3xl md:text-4xl font-extrabold leading-tight">
          Doggerz
        </h1>
        <p className="mt-3 text-neutral-300">
          Adopt your PixelPup. Train. Bond. <span className="font-semibold">No grind. Just vibes.</span>
        </p>

        <div className="mt-6 flex gap-3">
          <a href="#auth-panel" className="rounded-xl px-5 py-3 bg-neutral-200 text-neutral-900 hover:bg-white">
            Create account
          </a>
          <button
            onClick={() => nav("/game")}
            className="rounded-xl px-5 py-3 bg-neutral-800 hover:bg-neutral-700"
          >
            Log in
          </button>
        </div>

        <ul className="mt-6 space-y-2 text-sm text-neutral-300">
          <li>• Works offline (PWA)</li>
          <li>• Keyboard controls supported</li>
          <li>• High-contrast UI with non-color cues</li>
        </ul>
      </div>

      <aside className="rounded-2xl border border-neutral-800 bg-neutral-900 p-4">
        <h2 className="font-semibold mb-2">Get started</h2>
        <AuthButtons />
        <p className="mt-4 text-xs opacity-70">Your data lives in your Firebase account.</p>
      </aside>
    </section>
  );
}
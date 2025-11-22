// src/pages/Landing.jsx
// @ts-nocheck

import React from "react";
import { useNavigate } from "react-router-dom";

export default function Landing() {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate("/adopt");
  };

  const handleLogin = () => {
    navigate("/login");
  };

  const handleSignUp = () => {
    navigate("/signup"); // ✅ go to signup, not adopt
  };

  const handleReadGuide = () => {
    navigate("/about");
  };

  return (
    // AppShell already renders a header and footer.
    // This is just the main hero section in between.
    <div className="min-h-[calc(100vh-7rem)] bg-[#050816] text-slate-100 flex flex-col">
      <main className="flex-1">
        <div className="container mx-auto px-4 py-10 lg:py-16 grid gap-10 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,0.9fr)] items-start">
          {/* Left: copy + CTA */}
          <section>
            <p className="text-xs uppercase tracking-[0.28em] text-emerald-400 mb-3">
              Adopt. Train. Bond.
            </p>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white mb-4">
              Your <span className="text-emerald-400">virtual pup</span>,<br />
              always one tap away.
            </h1>

            <p className="text-sm sm:text-base text-slate-300 max-w-xl mb-6">
              Adopt your pup and take care of them over real time. Keep them fed,
              entertained, rested, and clean. How you treat your dog determines
              how long they live — no click-spamming, no idle mining.
            </p>

            <div className="flex flex-wrap items-center gap-4 mb-4">
              <button
                type="button"
                onClick={handleGetStarted}
                className="rounded-full bg-emerald-500 hover:bg-emerald-400 text-black text-sm font-semibold px-6 py-2.5 transition shadow-card"
              >
                Get started
              </button>

              <button
                type="button"
                onClick={handleLogin}
                className="text-xs text-slate-300 hover:text-white underline-offset-4 hover:underline"
              >
                Already have an account?{" "}
                <span className="font-semibold">Log in.</span>
              </button>
            </div>
          </section>

          {/* Right: "How Doggerz works" card */}
          <aside className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-sm p-6 text-sm shadow-card">
            <h2 className="text-xs uppercase tracking-[0.28em] text-emerald-400 font-semibold mb-3">
              How Doggerz works
            </h2>

            <ul className="space-y-3 text-slate-100 text-xs sm:text-sm">
              <li>• Your dog slowly ages even while you&apos;re logged out.</li>
              <li>
                • Hunger, boredom, and dirtiness creep up over real hours, not
                button mashing.
              </li>
              <li>
                • As cleanliness drops, your pup can go from dirty → fleas → mange.
              </li>
              <li>• Taking good care of your pup extends their life.</li>
            </ul>

            <button
              type="button"
              onClick={handleReadGuide}
              className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-emerald-400 hover:text-emerald-300 transition"
            >
              Read the full guide
              <span aria-hidden="true">→</span>
            </button>
          </aside>
        </div>
      </main>
    </div>
  );
}

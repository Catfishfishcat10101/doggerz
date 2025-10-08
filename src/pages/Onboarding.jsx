// src/pages/Onboarding.jsx
import React, { useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { setName as setDogName, setStage as setDogStage } from "@/redux/dogSlice";

const STAGES = [
  { id: "puppy",  label: "Puppy",  blurb: "Quick, playful, burns energy fast" },
  { id: "adult",  label: "Adult",  blurb: "Balanced stats and decay rates" },
  { id: "senior", label: "Senior", blurb: "Chill, slower, needs gentler play" },
];

export default function Onboarding() {
  const dispatch = useDispatch();
  const nav = useNavigate();
  const loc = useLocation();

  const [step, setStep] = useState(1);
  const [name, setLocalName] = useState("");
  const [stage, setLocalStage] = useState("adult");

  const canContinue = useMemo(() => {
    if (step === 1) return name.trim().length >= 2 && name.trim().length <= 20;
    if (step === 2) return Boolean(stage);
    return true;
  }, [step, name, stage]);

  function next() { setStep((s) => Math.min(3, s + 1)); }
  function back() { setStep((s) => Math.max(1, s - 1)); }

  function finish() {
    const clean = name.trim();
    if (!clean) return;
    dispatch(setDogName(clean));
    dispatch(setDogStage(stage));
    const to = loc.state?.from?.pathname || "/game";
    nav(to, { replace: true });
  }

  return (
    <section className="mx-auto max-w-xl px-4 sm:px-6 py-10 text-white">
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 shadow-xl">
        <div className="text-xs uppercase tracking-widest text-white/60 mb-2">Onboarding</div>
        <h1 className="text-2xl font-bold mb-6">Let’s get your pup set up</h1>

        {/* Step 1: Name */}
        {step === 1 && (
          <div>
            <label htmlFor="pup-name" className="block text-sm mb-2">Pup Name</label>
            <input
              id="pup-name"
              type="text"
              value={name}
              onChange={(e) => setLocalName(e.target.value)}
              placeholder="Name your pup"
              maxLength={24}
              className="w-full px-3 py-2 rounded-lg bg-slate-800/70 border border-white/10 focus:border-white/30 outline-none"
            />
            <p className="text-xs text-white/60 mt-2">2–20 characters. You can change this later in Settings.</p>
          </div>
        )}

        {/* Step 2: Stage */}
        {step === 2 && (
          <div>
            <label className="block text-sm mb-2">Select stage of life</label>
            <div className="grid gap-3">
              {STAGES.map((s) => {
                const active = stage === s.id;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setLocalStage(s.id)}
                    className={[
                      "w-full text-left rounded-xl border px-4 py-3 transition-colors",
                      active
                        ? "border-amber-400 bg-amber-400/10"
                        : "border-white/10 bg-white/5 hover:bg-white/10",
                    ].join(" ")}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold">{s.label}</div>
                        <div className="text-xs opacity-80">{s.blurb}</div>
                      </div>
                      <div className={active ? "text-amber-300" : "text-white/40"}>
                        {active ? "✓" : "○"}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 3: Tips */}
        {step === 3 && (
          <div>
            <h2 className="text-xl font-semibold mb-3">Quick tips</h2>
            <ul className="list-disc pl-6 space-y-1 opacity-90 text-sm">
              <li>Keep hunger, energy, fun, and hygiene in the green band.</li>
              <li>Rest restores energy; play boosts fun; feeding counters hunger decay.</li>
              <li>Scoop poop to avoid hygiene penalties and mood drops.</li>
            </ul>
            <p className="mt-4 opacity-80 text-sm">
              You can revisit this in <span className="font-medium">Settings → Help</span>.
            </p>
          </div>
        )}

        {/* Controls */}
        <div className="mt-8 flex items-center justify-between">
          <button
            type="button"
            onClick={back}
            disabled={step === 1}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-40"
          >
            Back
          </button>

          {step < 3 ? (
            <button
              type="button"
              onClick={next}
              disabled={!canContinue}
              className="px-4 py-2 rounded-xl bg-amber-400/90 hover:bg-amber-300 text-slate-900 disabled:opacity-50"
            >
              Continue
            </button>
          ) : (
            <button
              type="button"
              onClick={finish}
              className="px-4 py-2 rounded-xl bg-emerald-400/90 hover:bg-emerald-300 text-slate-900"
            >
              Start playing
            </button>
          )}
        </div>

        <div className="mt-6 text-xs text-white/50">
          Changed your mind? <Link to="/" className="underline hover:text-white/80">Back to Home</Link>
        </div>
      </div>
    </section>
  );
}

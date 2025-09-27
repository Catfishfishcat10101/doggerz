// src/pages/Onboarding.jsx
import React, { useState, useMemo } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { setName, setStage } from "@/redux/dogSlice";

const STAGES = [
  { id: "puppy", label: "Puppy (quick, playful)" },
  { id: "adult", label: "Adult (balanced)" },
  { id: "senior", label: "Senior (wise, chill)" },
];

export default function Onboarding() {
  const dispatch = useDispatch();
  const nav = useNavigate();
  const loc = useLocation();
  const [step, setStep] = useState(1);
  const [name, setLocalName] = useState("");
  const [stage, setLocalStage] = useState("adult");

  const canContinue = useMemo(() => {
    if (step === 1) return name.trim().length >= 2;
    if (step === 2) return Boolean(stage);
    return true;
  }, [step, name, stage]);

  function next() {
    if (step < 3) setStep((s) => s + 1);
    else finish();
  }
  function back() {
    if (step > 1) setStep((s) => s - 1);
  }

  function finish() {
    dispatch(setName(name.trim()));
    dispatch(setStage(stage));
    const to = (loc.state && loc.state.from && loc.state.from.pathname) || "/game";
    nav(to, { replace: true });
  }

  return (
    <section className="mx-auto max-w-xl px-4 sm:px-6 py-10">
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <div className="text-sm uppercase tracking-widest text-white/60 mb-2">
          Onboarding
        </div>
        <h1 className="text-2xl font-bold mb-6">Let’s set up your Pixel Pup</h1>

        {step === 1 && (
          <div>
            <label className="block text-sm mb-2">Pup name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setLocalName(e.target.value)}
              placeholder="e.g., Fireball"
              className="w-full px-3 py-2 rounded-lg bg-slate-800/70 border border-white/10 focus:border-white/30 outline-none"
            />
            <p className="text-xs text-white/60 mt-2">
              2–20 characters. You can change this later in Settings.
            </p>
          </div>
        )}

        {step === 2 && (
          <div>
            <div className="text-sm mb-2">Choose a life stage</div>
            <div className="grid grid-cols-1 gap-2">
              {STAGES.map((s) => (
                <label
                  key={s.id}
                  className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer
                    ${stage === s.id ? "border-amber-300 bg-amber-300/10" : "border-white/10 hover:border-white/20"}`}
                >
                  <input
                    type="radio"
                    name="stage"
                    value={s.id}
                    checked={stage === s.id}
                    onChange={() => setLocalStage(s.id)}
                  />
                  <span>{s.label}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <h2 className="text-xl font-semibold mb-3">Quick tips</h2>
            <ul className="list-disc pl-6 space-y-1 opacity-90">
              <li>Tap your pup to bark. WASD/Arrow keys move.</li>
              <li>Keep hunger, energy, and cleanliness balanced.</li>
              <li>Complete daily tasks to earn bones for the Shop.</li>
            </ul>
            <p className="mt-4 opacity-80">
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
      </div>
    </section>
  );
}

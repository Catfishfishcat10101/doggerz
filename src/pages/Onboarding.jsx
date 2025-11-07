import React, { useState } from "react";
import { auth } from "../utils/firebase";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setName } from "../redux/dogSlice";

/** 3-step lightweight wizard: username → optional bio → dog name */
export default function Onboarding() {
  const nav = useNavigate();
  const dispatch = useDispatch();
  const [step, setStep] = useState(0);
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [dogName, setDogName] = useState("");

  const authed = !!auth.currentUser;

  function next() { setStep((s) => Math.min(2, s + 1)); }
  function prev() { setStep((s) => Math.max(0, s - 1)); }

  async function finish(e) {
    e?.preventDefault?.();
    if (dogName.trim()) dispatch(setName(dogName.trim()));
    nav("/game", { replace: true });
  }

  if (!authed) {
    return (
      <div className="min-h-[calc(100dvh-3.5rem-3rem)] grid place-items-center bg-[#0b1020] text-white">
        <div className="card max-w-md w-full text-center">
          <h1 className="text-2xl font-bold">You’re not signed in</h1>
          <p className="mt-2 text-white/70">Sign in to continue onboarding.</p>
          <div className="mt-4">
            <button className="btn" onClick={() => nav("/login")}>Sign in</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100dvh-3.5rem-3rem)] grid place-items-center bg-[#0b1020] text-white">
      <form onSubmit={finish} className="card max-w-md w-full">
        <div className="text-sm opacity-70">Step {step + 1} / 3</div>

        {step === 0 && (
          <>
            <h2 className="mt-1 text-xl font-semibold">Pick a username</h2>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value.slice(0, 24))}
              className="mt-4 w-full rounded-xl border border-white/15 bg-white/10 px-4 py-2"
              placeholder="e.g., pixelPupDad"
            />
          </>
        )}

        {step === 1 && (
          <>
            <h2 className="mt-1 text-xl font-semibold">Tell us about you (optional)</h2>
            <textarea
              rows={4}
              value={bio}
              onChange={(e) => setBio(e.target.value.slice(0, 280))}
              className="mt-4 w-full rounded-xl border border-white/15 bg-white/10 px-4 py-2"
              placeholder="Trainer, treat dealer, chaos enjoyer…"
            />
          </>
        )}

        {step === 2 && (
          <>
            <h2 className="mt-1 text-xl font-semibold">Name your pup</h2>
            <input
              value={dogName}
              onChange={(e) => setDogName(e.target.value.slice(0, 24))}
              className="mt-4 w-full rounded-xl border border-white/15 bg-white/10 px-4 py-2"
              placeholder="Fireball"
              required
            />
          </>
        )}

        <div className="mt-6 flex justify-between">
          <button type="button" className="btn btn--ghost" onClick={prev} disabled={step === 0}>
            Back
          </button>
          {step < 2 ? (
            <button type="button" className="btn" onClick={next}>Next</button>
          ) : (
            <button type="submit" className="btn">Finish</button>
          )}
        </div>
      </form>
    </div>
  );
}
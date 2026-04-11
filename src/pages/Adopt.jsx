// src/pages/Adopt.jsx

import { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import PageShell from "@/components/layout/PageShell.jsx";
import SpriteSheetDog from "@/components/dog/renderers/SpriteSheetDog.jsx";
import { PATHS } from "@/app/routes.js";
import { adoptPup } from "@/store/dogThunks.js";
import {
  cancelWorkflow,
  goToStep,
  nextStep,
  prevStep,
  resetWorkflow,
  selectWorkflowById,
  setWorkflowData,
  startWorkflow,
} from "@/store/workflowSlice.js";
import { useDog } from "@/hooks/useDogState.js";

const WORKFLOW_ID = "adopt";
const ADOPT_STEPS = ["Box", "Name", "Play"];

function StepDot({ active = false, done = false }) {
  return (
    <span
      className={[
        "h-2.5 w-2.5 rounded-full transition-all",
        active
          ? "bg-[var(--accent-gold)] shadow-[0_0_18px_rgba(251,191,36,0.55)]"
          : done
            ? "bg-emerald-300/90"
            : "bg-white/18",
      ].join(" ")}
      aria-hidden="true"
    />
  );
}

export default function AdoptPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const dog = useDog();
  const lifecycleStatus = String(dog?.lifecycleStatus || "NONE").toUpperCase();
  const alreadyAdopted =
    Boolean(dog?.adoptedAt) &&
    lifecycleStatus !== "FAREWELL" &&
    lifecycleStatus !== "RESCUED" &&
    lifecycleStatus !== "NONE";
  const workflow = useSelector(selectWorkflowById(WORKFLOW_ID));
  const stepIndex = workflow?.stepIndex ?? 0;
  const name = String(workflow?.data?.name ?? "");
  const trimmedName = useMemo(() => name.trim(), [name]);
  const [error, setError] = useState(null);
  const [adopting, setAdopting] = useState(false);
  const nameInputRef = useRef(null);

  useEffect(() => {
    if (alreadyAdopted) {
      if (workflow) dispatch(resetWorkflow({ id: WORKFLOW_ID }));
      return;
    }

    if (
      !workflow ||
      workflow.status === "idle" ||
      workflow.status === "cancelled"
    ) {
      dispatch(
        startWorkflow({
          id: WORKFLOW_ID,
          stepIndex: 0,
          initialData: { name: dog?.name || "Fireball" },
        })
      );
    }
  }, [alreadyAdopted, dispatch, dog?.name, workflow]);

  useEffect(() => {
    if (!error) return;
    setError(null);
  }, [error, name, stepIndex]);

  useEffect(() => {
    if (stepIndex !== 1) return;
    const timer = window.setTimeout(() => {
      nameInputRef.current?.focus?.();
      nameInputRef.current?.select?.();
    }, 140);
    return () => window.clearTimeout(timer);
  }, [stepIndex]);

  const onCancel = () => {
    dispatch(cancelWorkflow({ id: WORKFLOW_ID }));
    dispatch(resetWorkflow({ id: WORKFLOW_ID }));
    navigate(PATHS.HOME);
  };

  const onBack = () => {
    if (stepIndex <= 0) return;
    dispatch(prevStep({ id: WORKFLOW_ID }));
  };

  const onPrimary = async () => {
    if (adopting) return;
    setError(null);

    if (stepIndex === 0) {
      dispatch(nextStep({ id: WORKFLOW_ID, maxSteps: ADOPT_STEPS.length }));
      return;
    }

    if (stepIndex === 1) {
      if (!trimmedName) {
        setError("Your pup needs a name, even if it is something weird.");
        return;
      }

      dispatch(
        setWorkflowData({ id: WORKFLOW_ID, patch: { name: trimmedName } })
      );
      dispatch(nextStep({ id: WORKFLOW_ID, maxSteps: ADOPT_STEPS.length }));
      return;
    }

    if (!trimmedName) {
      setError("Name is required.");
      dispatch(goToStep({ id: WORKFLOW_ID, stepIndex: 1 }));
      return;
    }

    try {
      setAdopting(true);
      await dispatch(
        adoptPup({
          name: trimmedName,
          now: Date.now(),
        })
      ).unwrap();
      dispatch(resetWorkflow({ id: WORKFLOW_ID }));
      navigate(PATHS.GAME, { replace: true });
    } catch (err) {
      setError(err?.message || "Adoption hit a problem. Try again.");
    } finally {
      setAdopting(false);
    }
  };

  const primaryLabel =
    stepIndex === 2
      ? "Adopt & play"
      : stepIndex === 1
        ? "Next"
        : "Open the box";

  const slideTitle =
    stepIndex === 2
      ? "It is official"
      : stepIndex === 1
        ? "Name your pup"
        : "A box arrived";

  const slideEyebrow =
    stepIndex === 2
      ? "Ready for the yard"
      : stepIndex === 1
        ? "Adoption step 2"
        : "Adoption step 1";

  if (alreadyAdopted) {
    return (
      <PageShell useSurface={false} mainClassName="px-4 py-8">
        <div className="mx-auto flex min-h-[70vh] w-full max-w-md items-center">
          <div className="w-full rounded-[28px] border border-white/10 bg-black/45 p-6 text-white shadow-[0_28px_90px_rgba(0,0,0,0.45)] backdrop-blur">
            <div className="text-[11px] uppercase tracking-[0.24em] text-emerald-200/80">
              Adoption locked
            </div>
            <h1 className="mt-2 text-2xl font-black text-emerald-200">
              You already have a pup
            </h1>
            <p className="mt-3 text-sm text-zinc-300">
              Your current dog is{" "}
              <span className="font-semibold text-zinc-100">
                {dog?.name || "your pup"}
              </span>
              . Doggerz is still a one-dog app right now.
            </p>
            <button
              type="button"
              onClick={() => navigate(PATHS.GAME)}
              className="btn-squish mt-5 w-full rounded-2xl bg-emerald-400 px-4 py-3 text-sm font-extrabold text-black"
            >
              Back to the yard
            </button>
          </div>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell
      useSurface={false}
      mainClassName="px-0 py-0"
      containerClassName="w-full max-w-none"
    >
      <div className="relative mx-auto flex min-h-[100dvh] w-full max-w-md flex-col overflow-hidden border-x border-white/10 bg-[#07111f] text-white shadow-2xl">
        <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-emerald-400/18 blur-[110px]" />
        <div className="pointer-events-none absolute right-[-90px] top-[28%] h-64 w-64 rounded-full bg-sky-400/18 blur-[110px]" />
        <div className="pointer-events-none absolute -bottom-24 left-10 h-72 w-72 rounded-full bg-amber-300/14 blur-[120px]" />

        <div className="relative z-10 flex flex-1 flex-col px-5 pb-6 pt-8">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={onCancel}
              className="btn-squish rounded-full border border-white/12 bg-white/8 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-200"
            >
              Skip
            </button>
            <div className="flex items-center gap-2">
              {ADOPT_STEPS.map((_, idx) => (
                <StepDot
                  key={idx}
                  active={idx === stepIndex}
                  done={idx < stepIndex}
                />
              ))}
            </div>
            <div className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-zinc-300">
              {stepIndex + 1}/{ADOPT_STEPS.length}
            </div>
          </div>

          <div className="mt-5 flex-1 rounded-[34px] border border-white/10 bg-[linear-gradient(180deg,rgba(5,10,20,0.9),rgba(7,14,27,0.92))] p-5 shadow-[0_28px_100px_rgba(0,0,0,0.45)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-[11px] font-bold uppercase tracking-[0.28em] text-emerald-200/80">
                  {slideEyebrow}
                </div>
                <h1 className="mt-2 text-3xl font-black leading-tight text-white">
                  {slideTitle}
                </h1>
              </div>
              <div className="rounded-full border border-white/10 bg-white/6 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-300">
                Jack Russell
              </div>
            </div>

            <div className="mt-6 overflow-hidden rounded-[28px] border border-white/8 bg-black/20 p-5">
              <div
                className={`onboard-slide ${stepIndex === 0 ? "active-slide" : ""}`}
              >
                <div className="text-6xl">📦</div>
                <h2 className="mt-5 text-2xl font-black text-amber-100">
                  A Jack Russell just showed up.
                </h2>
                <p className="mt-4 text-sm leading-7 text-zinc-300">
                  High-energy, stubborn, fast, and absolutely capable of messing
                  with your UI when bored. This is not a calm dog.
                </p>
                <div className="mt-5 rounded-2xl border border-amber-300/20 bg-amber-400/10 p-4 text-left text-sm text-amber-50/90">
                  Good care keeps the chaos charming. Neglect makes it loud.
                </div>
              </div>

              <div
                className={`onboard-slide ${stepIndex === 1 ? "active-slide" : ""}`}
              >
                <div className="text-6xl">🐶</div>
                <h2 className="mt-5 text-2xl font-black text-emerald-100">
                  What are you calling this troublemaker?
                </h2>
                <p className="mt-4 text-sm leading-7 text-zinc-300">
                  Pick a name you will not regret seeing during accidents and 2
                  a.m. zoomies.
                </p>
                <div className="mt-6 w-full max-w-sm">
                  <input
                    ref={nameInputRef}
                    id="dog-name"
                    type="text"
                    value={name}
                    onChange={(e) => {
                      const value = e.target.value.slice(0, 24);
                      dispatch(
                        setWorkflowData({
                          id: WORKFLOW_ID,
                          patch: { name: value },
                        })
                      );
                    }}
                    className="w-full rounded-2xl border border-white/10 bg-white px-4 py-4 text-center text-xl font-black text-slate-900 outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-400/20"
                    placeholder="Fireball"
                    maxLength={24}
                    autoComplete="off"
                    title="Choose your pup's name."
                  />
                  <div className="mt-2 flex items-center justify-between text-xs text-zinc-400">
                    <span>{name.length}/24</span>
                    <span>Default idea: Fireball</span>
                  </div>
                  {error ? (
                    <p className="mt-3 text-sm text-red-300">{error}</p>
                  ) : null}
                </div>
              </div>

              <div
                className={`onboard-slide ${stepIndex === 2 ? "active-slide" : ""}`}
              >
                <div className="text-6xl">🏠</div>
                <h2 className="mt-5 text-2xl font-black text-emerald-100">
                  {trimmedName || "Fireball"} is ready.
                </h2>
                <p className="mt-4 text-sm leading-7 text-zinc-300">
                  Keep energy up, watch health, and do not assume this dog will
                  behave just because you asked nicely.
                </p>
                <div className="mt-6 grid w-full gap-3 text-left text-sm text-zinc-200">
                  <div className="rounded-2xl border border-white/10 bg-white/6 p-4">
                    <div className="text-[11px] uppercase tracking-[0.18em] text-zinc-400">
                      Pup name
                    </div>
                    <div className="mt-1 text-xl font-black text-amber-100">
                      {trimmedName || "Fireball"}
                    </div>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/6 p-4">
                    <div className="font-bold text-white">What to expect</div>
                    <ul className="mt-2 space-y-2 text-sm text-zinc-300">
                      <li>Real-time weather and day/night cycles.</li>
                      <li>Potty training comes first, tricks later.</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-center">
              <SpriteSheetDog
                stage="PUPPY"
                anim="idle"
                facing={1}
                size={160}
                className="select-none drop-shadow-[0_18px_30px_rgba(0,0,0,0.45)]"
              />
            </div>
          </div>

          <div className="mt-4 flex items-center gap-3">
            <button
              type="button"
              onClick={stepIndex === 0 ? onCancel : onBack}
              disabled={adopting}
              className="btn-squish flex-1 rounded-2xl border border-white/12 bg-white/6 px-4 py-4 text-sm font-bold uppercase tracking-[0.14em] text-zinc-100"
            >
              {stepIndex === 0 ? "Maybe later" : "Back"}
            </button>
            <button
              type="button"
              onClick={onPrimary}
              disabled={adopting || (stepIndex === 1 && !trimmedName)}
              className={`btn-squish flex-[1.35] rounded-2xl px-4 py-4 text-sm font-black uppercase tracking-[0.16em] text-black shadow-[0_12px_30px_rgba(0,0,0,0.28)] transition ${
                stepIndex === 2
                  ? "bg-[var(--accent-green)]"
                  : "bg-[var(--accent-gold)]"
              } disabled:cursor-not-allowed disabled:opacity-50`}
            >
              {adopting ? "Adopting..." : primaryLabel}
            </button>
          </div>

          <div className="mt-3 text-center text-xs text-zinc-400">
            Your pup lives in the yard, not on a server. Adoption is just the
            start.
          </div>
        </div>
      </div>
    </PageShell>
  );
}

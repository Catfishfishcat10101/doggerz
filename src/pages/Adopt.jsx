// src/pages/Adopt.jsx

import { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import { PATHS } from "@/app/routes.js";
import HeroDog3D from "@/components/brand/HeroDog3D.jsx";
import PageShell from "@/components/layout/PageShell.jsx";
import { useDog } from "@/hooks/useDogState.js";
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

const WORKFLOW_ID = "adopt";
const ADOPT_STEPS = ["Arrival", "Name", "Yard"];

function StepDot({ active = false, done = false }) {
  return (
    <span
      className={[
        "h-2.5 rounded-full transition-all",
        active
          ? "w-8 bg-emerald-300 shadow-[0_0_18px_rgba(52,211,153,0.45)]"
          : done
            ? "w-2.5 bg-emerald-300/80"
            : "w-2.5 bg-white/18",
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
        setError("Give your pup a name before entering the yard.");
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
      setError(err?.message || "Adoption could not finish. Try again.");
    } finally {
      setAdopting(false);
    }
  };

  const primaryLabel =
    stepIndex === 2
      ? "Enter yard"
      : stepIndex === 1
        ? "Continue"
        : "Meet your pup";

  const slideTitle =
    stepIndex === 2
      ? "Ready for the first yard check"
      : stepIndex === 1
        ? "Name your pup"
        : "A Jack Russell is ready to come home";

  const slideEyebrow =
    stepIndex === 2
      ? "Step 3 of 3"
      : stepIndex === 1
        ? "Step 2 of 3"
        : "Step 1 of 3";

  if (alreadyAdopted) {
    return (
      <PageShell useSurface={false} mainClassName="px-4 py-8">
        <div className="mx-auto flex min-h-[70vh] w-full max-w-md items-center">
          <div className="w-full rounded-[28px] border border-white/10 bg-black/45 p-6 text-white shadow-[0_28px_90px_rgba(0,0,0,0.45)] backdrop-blur">
            <div className="text-[11px] font-bold uppercase tracking-[0.24em] text-emerald-200/80">
              Adoption complete
            </div>
            <h1 className="mt-2 text-2xl font-black text-emerald-200">
              {dog?.name || "Your dog"} is already home
            </h1>
            <p className="mt-3 text-sm leading-6 text-zinc-300">
              Doggerz currently supports one dog per user. Continue from the
              yard to check care, training, and daily progress.
            </p>
            <button
              type="button"
              onClick={() => navigate(PATHS.GAME)}
              className="btn-squish mt-5 min-h-12 w-full rounded-2xl bg-emerald-400 px-4 py-3 text-sm font-extrabold text-black"
            >
              Back to yard
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
        <div className="pointer-events-none absolute right-[-90px] top-[28%] h-64 w-64 rounded-full bg-sky-400/14 blur-[110px]" />

        <div className="relative z-10 flex flex-1 flex-col px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-[max(1.5rem,env(safe-area-inset-top))]">
          <div className="flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={onCancel}
              className="btn-squish min-h-10 rounded-full border border-white/12 bg-white/8 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.16em] text-zinc-200"
            >
              Later
            </button>
            <div className="flex items-center gap-2">
              {ADOPT_STEPS.map((step, idx) => (
                <StepDot
                  key={step}
                  active={idx === stepIndex}
                  done={idx < stepIndex}
                />
              ))}
            </div>
            <div className="rounded-full border border-white/10 bg-black/20 px-3 py-2 text-[11px] font-bold uppercase tracking-[0.16em] text-zinc-300">
              {stepIndex + 1}/{ADOPT_STEPS.length}
            </div>
          </div>

          <div className="mt-5 flex flex-1 flex-col rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(5,10,20,0.9),rgba(7,14,27,0.92))] p-5 shadow-[0_28px_100px_rgba(0,0,0,0.45)]">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="text-[11px] font-bold uppercase tracking-[0.24em] text-emerald-200/80">
                  {slideEyebrow}
                </div>
                <h1 className="mt-2 text-3xl font-black leading-tight text-white">
                  {slideTitle}
                </h1>
              </div>
              <div className="shrink-0 rounded-full border border-white/10 bg-white/6 px-3 py-2 text-[11px] font-bold uppercase tracking-[0.14em] text-zinc-300">
                Terrier
              </div>
            </div>

            <div className="mt-5 rounded-[26px] border border-white/8 bg-black/24 p-5">
              {stepIndex === 0 ? (
                <div className="space-y-4">
                  <h2 className="text-xl font-black text-amber-100">
                    Small frame. Huge drive.
                  </h2>
                  <p className="text-sm leading-7 text-zinc-300">
                    Your dog will need steady food, water, rest, potty breaks,
                    training, and attention. Care choices affect mood, needs,
                    and progression over time.
                  </p>
                  <div className="grid grid-cols-3 gap-2 text-center text-[11px] font-bold uppercase tracking-[0.12em] text-zinc-300">
                    <div className="rounded-2xl border border-white/10 bg-white/6 px-2 py-3">
                      Needs
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/6 px-2 py-3">
                      Training
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/6 px-2 py-3">
                      Routine
                    </div>
                  </div>
                </div>
              ) : null}

              {stepIndex === 1 ? (
                <div className="space-y-4">
                  <h2 className="text-xl font-black text-emerald-100">
                    Pick the name you want to see every day.
                  </h2>
                  <p className="text-sm leading-7 text-zinc-300">
                    This name appears across the yard, care prompts, and
                    training progress.
                  </p>
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
                    className="min-h-14 w-full rounded-2xl border border-white/10 bg-white px-4 py-4 text-center text-xl font-black text-slate-950 outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-400/20"
                    placeholder="Fireball"
                    maxLength={24}
                    autoComplete="off"
                  />
                  <div className="flex items-center justify-between text-xs text-zinc-400">
                    <span>{name.length}/24</span>
                    <span>Default: Fireball</span>
                  </div>
                  {error ? (
                    <p className="text-sm font-semibold text-red-300">
                      {error}
                    </p>
                  ) : null}
                </div>
              ) : null}

              {stepIndex === 2 ? (
                <div className="space-y-4">
                  <h2 className="text-xl font-black text-emerald-100">
                    {trimmedName || "Fireball"} is ready.
                  </h2>
                  <p className="text-sm leading-7 text-zinc-300">
                    Start with the basics: check needs, take the first potty
                    trip, and build a clean routine before pushing training.
                  </p>
                  <div className="grid gap-3 text-sm text-zinc-200">
                    <div className="rounded-2xl border border-white/10 bg-white/6 p-4">
                      <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-zinc-400">
                        Dog name
                      </div>
                      <div className="mt-1 text-xl font-black text-amber-100">
                        {trimmedName || "Fireball"}
                      </div>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/6 p-4">
                      <div className="font-bold text-white">
                        First three moves
                      </div>
                      <ul className="mt-2 space-y-2 text-zinc-300">
                        <li>Check food and water.</li>
                        <li>Take the first potty trip.</li>
                        <li>Use play or affection to start bonding.</li>
                      </ul>
                    </div>
                  </div>
                  {error ? (
                    <p className="text-sm font-semibold text-red-300">
                      {error}
                    </p>
                  ) : null}
                </div>
              ) : null}
            </div>

            <div className="mt-5 flex min-h-[170px] items-center justify-center">
              <HeroDog3D
                stage="PUPPY"
                mood={stepIndex === 2 ? "happy" : "neutral"}
                isSleeping={stepIndex === 0}
                className="drop-shadow-[0_18px_30px_rgba(0,0,0,0.45)]"
              />
            </div>
          </div>

          <div className="mt-4 flex items-center gap-3">
            <button
              type="button"
              onClick={stepIndex === 0 ? onCancel : onBack}
              disabled={adopting}
              className="btn-squish min-h-14 flex-1 rounded-2xl border border-white/12 bg-white/6 px-4 py-4 text-sm font-bold uppercase tracking-[0.12em] text-zinc-100 disabled:opacity-60"
            >
              {stepIndex === 0 ? "Not now" : "Back"}
            </button>
            <button
              type="button"
              onClick={onPrimary}
              disabled={adopting || (stepIndex === 1 && !trimmedName)}
              className="btn-squish min-h-14 flex-[1.35] rounded-2xl bg-emerald-400 px-4 py-4 text-sm font-black uppercase tracking-[0.14em] text-black shadow-[0_12px_30px_rgba(52,211,153,0.22)] transition disabled:border disabled:border-white/18 disabled:bg-white/12 disabled:text-zinc-200 disabled:shadow-none"
            >
              {adopting ? "Adopting..." : primaryLabel}
            </button>
          </div>
        </div>
      </div>
    </PageShell>
  );
}

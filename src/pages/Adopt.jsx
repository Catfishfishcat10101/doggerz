// src/pages/Adopt.jsx

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  Check,
  Heart,
  Home,
  PawPrint,
  Shield,
  Sparkles,
} from "lucide-react";
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

/*
  LEARNING MODE

  This page is the adoption flow.

  Product goal:
  Make adoption feel emotional and important, not like filling out a form.

  Technical goal:
  Keep the existing Redux workflow system, but improve layout, copy,
  visual hierarchy, and mobile readability.

  Flow:
  Step 1: Welcome the pup
  Step 2: Name the pup
  Step 3: Confirm and enter yard
*/

const WORKFLOW_ID = "adopt";

const ADOPT_STEPS = Object.freeze([
  {
    id: "arrival",
    label: "Meet",
    title: "A Jack Russell is waiting for you.",
    eyebrow: "Step 1 of 3",
  },
  {
    id: "name",
    label: "Name",
    title: "Give your dog a name.",
    eyebrow: "Step 2 of 3",
  },
  {
    id: "yard",
    label: "Home",
    title: "Bring your dog home.",
    eyebrow: "Step 3 of 3",
  },
]);

const FIRST_ROUTINE = Object.freeze([
  "Check food and water",
  "Take the first potty trip",
  "Build bond with play or affection",
]);

function StepDot({ active = false, done = false, label = "" }) {
  return (
    <div className="flex items-center gap-2">
      <span
        className={[
          "grid h-7 w-7 place-items-center rounded-full border text-[10px] font-black transition-all",
          active
            ? "border-emerald-200 bg-emerald-300 text-slate-950 shadow-[0_0_22px_rgba(52,211,153,0.35)]"
            : done
              ? "border-emerald-300/40 bg-emerald-300/20 text-emerald-100"
              : "border-white/12 bg-white/[0.05] text-zinc-400",
        ].join(" ")}
        aria-hidden="true"
      >
        {done ? <Check size={13} strokeWidth={3} /> : null}
      </span>

      <span
        className={[
          "hidden text-[10px] font-black uppercase tracking-[0.18em] sm:inline",
          active
            ? "text-emerald-100"
            : done
              ? "text-emerald-200/70"
              : "text-zinc-500",
        ].join(" ")}
      >
        {label}
      </span>
    </div>
  );
}

function AdoptionBenefit({ icon: Icon, title, body }) {
  return (
    <article className="rounded-2xl border border-white/10 bg-white/[0.045] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
      <div className="flex items-start gap-3">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl border border-emerald-300/20 bg-emerald-300/10 text-emerald-100">
          <Icon size={18} />
        </div>
        <div>
          <h2 className="text-sm font-black text-white">{title}</h2>
          <p className="mt-1 text-xs leading-5 text-zinc-400">{body}</p>
        </div>
      </div>
    </article>
  );
}

export default function AdoptPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const dog = useDog();
  const workflow = useSelector(selectWorkflowById(WORKFLOW_ID));
  const settings = useSelector((state) => state.settings || {});
  const reduceMotion = Boolean(settings.reduceMotion || settings.batterySaver);

  const lifecycleStatus = String(dog?.lifecycleStatus || "NONE").toUpperCase();
  const alreadyAdopted =
    Boolean(dog?.adoptedAt) &&
    lifecycleStatus !== "FAREWELL" &&
    lifecycleStatus !== "RESCUED" &&
    lifecycleStatus !== "NONE";

  const stepIndex = Math.min(
    Math.max(Number(workflow?.stepIndex ?? 0), 0),
    ADOPT_STEPS.length - 1
  );

  const currentStep = ADOPT_STEPS[stepIndex];
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
    if (stepIndex <= 0) {
      onCancel();
      return;
    }

    setError(null);
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
      ? "Enter the yard"
      : stepIndex === 1
        ? "Continue"
        : "Meet your pup";

  if (alreadyAdopted) {
    return (
      <PageShell useSurface={false} mainClassName="px-4 py-8">
        <div className="mx-auto flex min-h-[70vh] w-full max-w-md items-center">
          <div className="doggerz-card w-full p-6 text-white">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-emerald-100">
              <Home size={14} />
              Adoption complete
            </div>

            <h1 className="mt-4 text-3xl font-black leading-tight text-emerald-100">
              {dog?.name || "Your dog"} is already home.
            </h1>

            <p className="mt-3 text-sm leading-7 text-zinc-300">
              Doggerz currently supports one dog per user. Continue from the
              yard to check care, training, and daily progress.
            </p>

            <button
              type="button"
              onClick={() => navigate(PATHS.GAME)}
              className="doggerz-button doggerz-button-primary mt-6 w-full text-sm uppercase tracking-[0.14em]"
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
      <main className="relative min-h-[100dvh] overflow-hidden bg-[#040a14] text-white">
        <div className="relative mx-auto flex min-h-[100dvh] w-full max-w-6xl flex-col px-5 py-[calc(env(safe-area-inset-top,0px)+22px)] sm:px-8 lg:px-10">
          <nav className="flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={onBack}
              disabled={adopting}
              className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/12 bg-white/[0.06] px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-zinc-100 backdrop-blur transition hover:bg-white/10 disabled:opacity-60"
            >
              <ArrowLeft size={15} />
              {stepIndex === 0 ? "Later" : "Back"}
            </button>

            <div className="flex items-center gap-3">
              {ADOPT_STEPS.map((step, index) => (
                <StepDot
                  key={step.id}
                  label={step.label}
                  active={index === stepIndex}
                  done={index < stepIndex}
                />
              ))}
            </div>
          </nav>

          <section className="grid flex-1 items-center gap-8 py-8 md:grid-cols-[0.92fr_1.08fr] lg:gap-12">
            <div className="order-2 md:order-1">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-2 text-[10px] font-black uppercase tracking-[0.22em] text-emerald-100">
                <Sparkles size={14} />
                {currentStep.eyebrow}
              </div>

              <h1 className="mt-5 max-w-[12ch] text-[clamp(2.75rem,7vw,5.4rem)] font-black leading-[0.94] text-white">
                {currentStep.title}
              </h1>

              {stepIndex === 0 ? (
                <div className="mt-5 max-w-xl space-y-5">
                  <p className="text-[1.05rem] leading-8 text-zinc-300 sm:text-lg">
                    This is not a pet collection. Doggerz gives you one dog, one
                    bond, and one long companion journey shaped by how you care
                    for it.
                  </p>

                  <div className="grid gap-3 sm:grid-cols-3">
                    <AdoptionBenefit
                      icon={Heart}
                      title="Bond"
                      body="Care choices shape trust, mood, and behavior."
                    />
                    <AdoptionBenefit
                      icon={PawPrint}
                      title="Routine"
                      body="Food, water, potty, rest, play, and training."
                    />
                    <AdoptionBenefit
                      icon={Shield}
                      title="Memory"
                      body="Your pup keeps growing between sessions."
                    />
                  </div>
                </div>
              ) : null}

              {stepIndex === 1 ? (
                <div className="mt-6 max-w-xl">
                  <p className="text-[1.05rem] leading-8 text-zinc-300 sm:text-lg">
                    Pick the name you want to see every day in the yard,
                    memories, and training progress.
                  </p>

                  <label
                    htmlFor="dog-name"
                    className="mt-6 block text-[11px] font-black uppercase tracking-[0.2em] text-emerald-100"
                  >
                    Dog name
                  </label>

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
                    className="mt-3 min-h-16 w-full rounded-3xl border border-white/10 bg-white px-5 py-4 text-center text-2xl font-black text-slate-950 outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-400/20"
                    placeholder="Fireball"
                    maxLength={24}
                    autoComplete="off"
                  />

                  <div className="mt-2 flex items-center justify-between text-xs text-zinc-400">
                    <span>{name.length}/24</span>
                    <span>Default: Fireball</span>
                  </div>

                  {error ? (
                    <p className="mt-4 rounded-2xl border border-rose-300/20 bg-rose-400/10 px-4 py-3 text-sm font-semibold text-rose-100">
                      {error}
                    </p>
                  ) : null}
                </div>
              ) : null}

              {stepIndex === 2 ? (
                <div className="mt-6 max-w-xl">
                  <p className="text-[1.05rem] leading-8 text-zinc-300 sm:text-lg">
                    Start with the basics. Your first few minutes should build
                    routine before you push training.
                  </p>

                  <div className="mt-6 rounded-[1.5rem] border border-white/10 bg-white/[0.045] p-5">
                    <div className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-400">
                      Bringing home
                    </div>
                    <div className="mt-2 text-3xl font-black text-amber-100">
                      {trimmedName || "Fireball"}
                    </div>

                    <div className="mt-5 border-t border-white/10 pt-5">
                      <div className="text-sm font-black text-white">
                        First three moves
                      </div>
                      <ul className="mt-3 space-y-2 text-sm leading-6 text-zinc-300">
                        {FIRST_ROUTINE.map((item) => (
                          <li key={item} className="flex gap-2">
                            <span className="mt-2 h-1.5 w-1.5 rounded-full bg-emerald-300" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {error ? (
                    <p className="mt-4 rounded-2xl border border-rose-300/20 bg-rose-400/10 px-4 py-3 text-sm font-semibold text-rose-100">
                      {error}
                    </p>
                  ) : null}
                </div>
              ) : null}

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={onPrimary}
                  disabled={adopting || (stepIndex === 1 && !trimmedName)}
                  className="doggerz-button doggerz-hero-button min-w-[13rem] px-6 py-4 text-sm uppercase tracking-[0.15em] disabled:border disabled:border-white/18 disabled:bg-white/12 disabled:text-zinc-300 disabled:shadow-none"
                >
                  {adopting ? "Adopting..." : primaryLabel}
                </button>

                <button
                  type="button"
                  onClick={onBack}
                  disabled={adopting}
                  className="doggerz-button doggerz-button-ghost px-6 py-4 text-sm uppercase tracking-[0.15em]"
                >
                  {stepIndex === 0 ? "Not now" : "Back"}
                </button>
              </div>
            </div>

            <div className="order-1 flex min-h-[23rem] items-center justify-center md:order-2">
              <div className="relative w-full max-w-[31rem]">
                <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.94),rgba(2,6,23,0.96))] shadow-[0_30px_110px_rgba(0,0,0,0.58)]">
                  <div className="relative h-[23rem] overflow-hidden sm:h-[27rem]">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_28%,rgba(134,239,172,0.2),transparent_34%),linear-gradient(180deg,rgba(56,189,248,0.08),transparent_48%,rgba(34,197,94,0.12))]" />

                    <HeroDog3D
                      className="absolute inset-0"
                      stage="PUPPY"
                      mood={
                        stepIndex === 2 && !reduceMotion ? "happy" : "neutral"
                      }
                      isSleeping={stepIndex === 0 && reduceMotion}
                      actionOverride={
                        reduceMotion ? "Idle" : stepIndex === 2 ? "Wag" : "Idle"
                      }
                      timeOfDay="sunset"
                      weather="sunny"
                    />

                    <div className="pointer-events-none absolute inset-x-8 bottom-16 h-10 rounded-full bg-black/30 blur-xl" />
                  </div>

                  <div className="border-t border-white/10 bg-black/38 p-5 backdrop-blur-xl">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="text-[10px] font-black uppercase tracking-[0.24em] text-amber-100">
                          {stepIndex === 2
                            ? "Ready for the yard"
                            : stepIndex === 1
                              ? "Name preview"
                              : "Adoption preview"}
                        </div>
                        <p className="mt-1 text-base font-black leading-6 text-white">
                          {stepIndex === 2
                            ? `${trimmedName || "Fireball"} is ready to come home.`
                            : "Lively, stubborn, and waiting for a routine."}
                        </p>
                      </div>

                      <div className="rounded-full border border-emerald-300/25 bg-emerald-300/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.16em] text-emerald-100">
                        Puppy stage
                      </div>
                    </div>
                  </div>
                </section>
              </div>
            </div>
          </section>
        </div>
      </main>
    </PageShell>
  );
}

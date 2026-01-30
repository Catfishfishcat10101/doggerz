// src/pages/Adopt.jsx

import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import { PATHS } from "@/routes.js";
import { selectDog, setAdoptedAt, setDogName } from "@/redux/dogSlice.js";
import {
  cancelWorkflow,
  goToStep,
  nextStep,
  prevStep,
  resetWorkflow,
  selectWorkflowById,
  setWorkflowData,
  startWorkflow,
} from "@/redux/workflowSlice.js";
import WorkflowShell from "@/features/workflow/WorkflowShell.jsx";

const WORKFLOW_ID = "adopt";
const ADOPT_STEPS = ["Welcome", "Name", "Confirm"];

export default function AdoptPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const dog = useSelector(selectDog);
  const alreadyAdopted = Boolean(dog?.adoptedAt);

  const workflow = useSelector(selectWorkflowById(WORKFLOW_ID));
  const stepIndex = workflow?.stepIndex ?? 0;
  const name = String(workflow?.data?.name ?? "");

  const [error, setError] = useState(null);

  const trimmedName = useMemo(() => name.trim(), [name]);

  // Ensure wizard state exists (and is resumable via WorkflowEngine localStorage hydration).
  useEffect(() => {
    if (alreadyAdopted) {
      // If a workflow exists but the user already has a dog, clear the wizard.
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
          initialData: { name: dog?.name || "" },
        })
      );
    }
  }, [alreadyAdopted, dispatch, dog?.name, workflow]);

  // Clear error if user edits.
  useEffect(() => {
    if (error) setError(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name]);

  const onCancel = () => {
    dispatch(cancelWorkflow({ id: WORKFLOW_ID }));
    dispatch(resetWorkflow({ id: WORKFLOW_ID }));
    navigate(PATHS.HOME);
  };

  const onBack = () => {
    if (stepIndex <= 0) return;
    dispatch(prevStep({ id: WORKFLOW_ID }));
  };

  const onPrimary = () => {
    setError(null);

    // Step 0: Welcome -> Name
    if (stepIndex === 0) {
      dispatch(nextStep({ id: WORKFLOW_ID, maxSteps: ADOPT_STEPS.length }));
      return;
    }

    // Step 1: Name -> Confirm (validate)
    if (stepIndex === 1) {
      if (!trimmedName) {
        setError("Your pup needs a name, even if it’s something weird.");
        return;
      }

      // Normalize/trim once before confirm.
      dispatch(
        setWorkflowData({ id: WORKFLOW_ID, patch: { name: trimmedName } })
      );
      dispatch(nextStep({ id: WORKFLOW_ID, maxSteps: ADOPT_STEPS.length }));
      return;
    }

    // Step 2: Confirm -> Adopt
    if (!trimmedName) {
      setError("Name is required.");
      dispatch(goToStep({ id: WORKFLOW_ID, stepIndex: 1 }));
      return;
    }

    dispatch(setDogName(trimmedName));
    dispatch(setAdoptedAt(Date.now()));

    // Clear wizard state so revisiting /adopt doesn't re-open the flow.
    dispatch(resetWorkflow({ id: WORKFLOW_ID }));
    navigate(PATHS.GAME);
  };

  const onNameChange = (value) => {
    dispatch(setWorkflowData({ id: WORKFLOW_ID, patch: { name: value } }));
  };

  // If we already have a dog, don’t let the user adopt another silently.
  if (alreadyAdopted) {
    return (
      <div className="flex flex-col items-center w-full h-full pt-6 pb-10 bg-gradient-to-b from-zinc-950 to-zinc-900 text-white">
        <div className="flex flex-col items-center mb-6">
          <h1 className="text-4xl font-bold tracking-wide text-emerald-400 drop-shadow-lg">
            DOGGERZ
          </h1>
          <p className="text-sm text-zinc-300 mt-1">Adopt. Train. Bond.</p>
        </div>

        <div className="w-full max-w-md bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 shadow-xl">
          <h2 className="text-xl font-semibold mb-2 text-emerald-300">
            You already adopted a pup
          </h2>
          <p className="text-sm text-zinc-300 mb-4">
            Your current dog is{" "}
            <span className="font-semibold">{dog?.name || "your pup"}</span>.
            Doggerz is a one-dog show right now; future versions may support
            multiple pups and kennels.
          </p>

          <button
            type="button"
            onClick={() => navigate(PATHS.GAME)}
            className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-sm font-semibold shadow-lg"
          >
            Go back to your yard
          </button>
        </div>
      </div>
    );
  }

  // First-time adoption wizard
  return (
    <WorkflowShell
      title="Adopt a pup"
      subtitle="Adopt. Train. Bond."
      steps={ADOPT_STEPS}
      stepIndex={stepIndex}
      canGoBack={stepIndex > 0}
      onBack={onBack}
      onCancel={onCancel}
      primaryLabel={
        stepIndex === 2 ? "Adopt now" : stepIndex === 1 ? "Continue" : "Start"
      }
      primaryDisabled={stepIndex === 1 && !name.trim()}
      onPrimary={onPrimary}
      secondaryLabel={stepIndex === 0 ? "Maybe later" : null}
      onSecondary={stepIndex === 0 ? onCancel : null}
      headerSlot={
        stepIndex === 2 ? (
          <div className="rounded-full border border-white/10 bg-black/30 px-4 py-1 text-[10px] uppercase tracking-[0.3em] text-white/70">
            Final check
          </div>
        ) : null
      }
      footerNote="Your pup lives locally and can sync to the cloud if you log in."
    >
      {stepIndex === 0 ? (
        <div className="space-y-3">
          <p className="text-sm text-zinc-300">
            This is your forever dog in Doggerz. You’ll feed, play, train, and
            keep them alive through your questionable life choices.
          </p>
          <div className="rounded-2xl border border-white/10 bg-black/30 p-3 text-xs text-zinc-400">
            You can close the app and come back — this wizard will resume.
          </div>
        </div>
      ) : null}

      {stepIndex === 1 ? (
        <div className="space-y-4">
          <div>
            <label
              htmlFor="dog-name"
              className="block text-sm font-medium text-zinc-200 mb-1"
            >
              What will you name it?
            </label>
            <input
              id="dog-name"
              type="text"
              value={name}
              onChange={(e) => onNameChange(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
              placeholder="Enter your pup's name"
              maxLength={24}
              autoComplete="on"
            />
            <div className="mt-2 flex items-center justify-between text-[11px] text-zinc-500">
              <span>{name.length}/24</span>
              <span>Pro tip: keep it short.</span>
            </div>
            {error ? (
              <p className="text-xs text-red-400 mt-2">{error}</p>
            ) : null}
          </div>
        </div>
      ) : null}

      {stepIndex === 2 ? (
        <div className="space-y-3">
          <div className="text-sm text-zinc-300">Meet your new pup:</div>
          <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
            <div className="text-xs text-zinc-400">Name</div>
            <div className="text-lg font-extrabold text-emerald-200">
              {trimmedName || "(unnamed)"}
            </div>
            <div className="mt-2 text-[11px] text-zinc-500">
              You can rename your pup later in Settings.
            </div>
          </div>
          {error ? <p className="text-xs text-red-400">{error}</p> : null}
          <div className="text-xs text-zinc-500">
            This creates your dog and starts the long-term progression.
          </div>
        </div>
      ) : null}
    </WorkflowShell>
  );
}

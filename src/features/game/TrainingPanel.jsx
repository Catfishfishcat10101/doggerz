/** @format */
// src/features/game/TrainingPanel.jsx

import { useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";

import { trainObedience } from "@/redux/dogSlice.js";
import VoiceCommandButton from "@/components/VoiceCommandButton.jsx";
import { PATHS } from "@/routes.js";

function formatTime(ms) {
  if (!Number.isFinite(ms) || ms <= 0) return "Soon";
  const totalSeconds = Math.ceil(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  if (minutes <= 0) return "Moments";
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const rem = minutes % 60;
  return rem ? `${hours}h ${rem}m` : `${hours}h`;
}

const STATUS_LABELS = {
  unlocked: "Ready",
  unlocking: "Unlocking",
  locked: "Locked",
};

const STATUS_ORDER = {
  unlocked: 0,
  unlocking: 1,
  locked: 2,
};

function remainingMsForCommand(command, nowMs) {
  if (!command || command.status !== "unlocking") return null;

  if (typeof command.unlocksAt === "number") {
    return Math.max(0, command.unlocksAt - nowMs);
  }

  const startedAt =
    typeof command.unlockStartedAt === "number"
      ? command.unlockStartedAt
      : null;
  const delayMs =
    typeof command.unlockDelayMs === "number" ? command.unlockDelayMs : null;
  if (startedAt != null && delayMs != null) {
    return Math.max(0, startedAt + delayMs - nowMs);
  }

  if (typeof command.remainingMs === "number")
    return Math.max(0, command.remainingMs);
  return null;
}

function pickNextUnlock(commands, nowMs) {
  const list = Array.isArray(commands) ? commands : [];
  const unlocking = list.filter((c) => c?.status === "unlocking");
  if (!unlocking.length) return null;

  const scored = unlocking
    .map((c) => {
      const remaining = remainingMsForCommand(c, nowMs);
      return remaining == null ? null : { command: c, remaining };
    })
    .filter(Boolean)
    .sort((a, b) => a.remaining - b.remaining);

  if (scored.length) return scored[0].command;
  return unlocking[0] || null;
}

export default function TrainingPanel({
  pottyComplete,
  allowButtonTraining = true,
  allowVoiceTraining = true,
  commands = [],
  selectedCommandId,
  onSelectCommand,
  buttonChance = 0,
  voiceChance = 0,
}) {
  const dispatch = useDispatch();
  const [nowMs, setNowMs] = useState(() => Date.now());

  const hasUnlocking = useMemo(
    () =>
      (Array.isArray(commands) ? commands : []).some(
        (c) => c?.status === "unlocking"
      ),
    [commands]
  );

  useEffect(() => {
    if (!hasUnlocking) return;
    const id = window.setInterval(() => setNowMs(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [hasUnlocking]);

  const selectedCommand =
    commands.find((c) => c?.id === selectedCommandId) || commands[0] || null;

  const canPractice =
    !!selectedCommand &&
    selectedCommand.status === "unlocked" &&
    pottyComplete &&
    allowButtonTraining;

  const canUseVoice = Boolean(pottyComplete && allowVoiceTraining);

  const sortedCommands = useMemo(() => {
    const list = Array.isArray(commands) ? [...commands] : [];
    list.sort((a, b) => {
      const ao = STATUS_ORDER[String(a?.status || "locked")] ?? 99;
      const bo = STATUS_ORDER[String(b?.status || "locked")] ?? 99;
      if (ao !== bo) return ao - bo;

      // Within Unlocking: soonest first.
      if (a?.status === "unlocking" || b?.status === "unlocking") {
        const ar = remainingMsForCommand(a, nowMs);
        const br = remainingMsForCommand(b, nowMs);
        if (ar != null && br != null && ar !== br) return ar - br;
      }

      // Within Ready: most recently unlocked first (if available).
      const aUnlockedAt = typeof a?.unlockedAt === "number" ? a.unlockedAt : 0;
      const bUnlockedAt = typeof b?.unlockedAt === "number" ? b.unlockedAt : 0;
      if (aUnlockedAt !== bUnlockedAt) return bUnlockedAt - aUnlockedAt;

      return String(a?.label || "").localeCompare(String(b?.label || ""));
    });
    return list;
  }, [commands, nowMs]);

  const groups = useMemo(() => {
    const ready = [];
    const unlocking = [];
    const locked = [];
    for (const c of sortedCommands) {
      if (!c) continue;
      if (c.status === "unlocked") ready.push(c);
      else if (c.status === "unlocking") unlocking.push(c);
      else locked.push(c);
    }

    const bringSelectedFirst = (list) => {
      const out = [...list];
      out.sort((a, b) => {
        const aSel = a?.id === selectedCommandId;
        const bSel = b?.id === selectedCommandId;
        if (aSel !== bSel) return aSel ? -1 : 1;
        return 0;
      });
      return out;
    };

    return {
      ready: bringSelectedFirst(ready),
      unlocking: bringSelectedFirst(unlocking),
      locked: bringSelectedFirst(locked),
    };
  }, [selectedCommandId, sortedCommands]);

  const nextUnlock = useMemo(
    () => pickNextUnlock(commands, nowMs),
    [commands, nowMs]
  );
  const nextUnlockRemaining = nextUnlock
    ? remainingMsForCommand(nextUnlock, nowMs)
    : null;

  const statusCopy = useMemo(() => {
    if (!selectedCommand) return "Pick a command to see details.";
    if (selectedCommand.status === "unlocking") {
      const remaining = remainingMsForCommand(selectedCommand, nowMs);
      return remaining != null
        ? `Unlocks in ${formatTime(remaining)}`
        : "Unlocking now.";
    }
    if (selectedCommand.status === "locked") {
      return (
        selectedCommand.detail || "Locked. Meet the requirements to unlock."
      );
    }
    return selectedCommand.detail || "Ready to practice.";
  }, [nowMs, selectedCommand]);

  const coach = useMemo(() => {
    if (!pottyComplete) {
      return {
        title: "Do this first",
        body: "Finish potty training. It unlocks obedience training for every command.",
        cta: { type: "link", label: "Go to potty training", to: PATHS.POTTY },
      };
    }

    const ready = groups.ready;
    const selectedIsReady = selectedCommand?.status === "unlocked";
    const pick = selectedIsReady ? selectedCommand : ready[0] || null;

    if (pick) {
      const modeHint =
        allowButtonTraining && allowVoiceTraining
          ? buttonChance >= voiceChance
            ? "Buttons are more reliable right now."
            : "Voice is surprisingly strong right now."
          : allowButtonTraining
            ? "Buttons-only mode is active."
            : "Voice-only mode is active.";

      return {
        title: "Do this first",
        body: `Practice "${pick.label}" once right now to keep momentum.`,
        sub: modeHint,
        cta:
          pick.id && pick.id !== selectedCommandId
            ? {
                type: "button",
                label: `Select ${pick.label}`,
                onClick: () => onSelectCommand?.(pick.id),
              }
            : null,
      };
    }

    if (nextUnlock) {
      const t =
        nextUnlockRemaining != null ? formatTime(nextUnlockRemaining) : "Soon";
      return {
        title: "Do this first",
        body: `Your next unlock is "${nextUnlock.label}" in ${t}. Keep playing to advance time.`,
        cta: null,
      };
    }

    return {
      title: "Do this first",
      body:
        selectedCommand?.detail ||
        "Increase your level, bond, and streak to unlock new commands.",
      cta: null,
    };
  }, [
    allowButtonTraining,
    allowVoiceTraining,
    buttonChance,
    groups.ready,
    nextUnlock,
    nextUnlockRemaining,
    onSelectCommand,
    pottyComplete,
    selectedCommand,
    selectedCommandId,
    voiceChance,
  ]);

  const handlePractice = () => {
    if (!selectedCommand?.id || !canPractice) return;
    dispatch(
      trainObedience({
        commandId: selectedCommand.id,
        input: "button",
        xp: 6,
        now: Date.now(),
      })
    );
  };

  return (
    <section className="rounded-3xl border border-white/15 bg-gradient-to-b from-[#10131a] to-[#030305] p-5 shadow-[0_40px_90px_rgba(0,0,0,0.45)]">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.5em] text-white/50">
            Training deck
          </p>
          <h2 className="text-2xl font-extrabold text-white">Obedience</h2>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-white/15 px-3 py-1 text-[10px] uppercase tracking-[0.35em] text-white/60">
            {STATUS_LABELS[selectedCommand?.status] || "Locked"}
          </span>
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] uppercase tracking-[0.35em] text-white/50">
            {allowButtonTraining ? "buttons" : "voice-only"}
          </span>
          {allowVoiceTraining ? (
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] uppercase tracking-[0.35em] text-white/50">
              voice
            </span>
          ) : null}
        </div>
      </header>

      {nextUnlock ? (
        <div className="mt-4 rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white/70">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <span className="text-[11px] uppercase tracking-[0.35em] text-white/50">
                Next unlock
              </span>{" "}
              <span className="font-semibold text-white">
                {nextUnlock.label}
              </span>
            </div>
            <div className="rounded-full border border-amber-400/25 bg-amber-500/10 px-3 py-1 text-[11px] font-semibold text-amber-200">
              {nextUnlockRemaining != null
                ? `in ${formatTime(nextUnlockRemaining)}`
                : "Soon"}
            </div>
          </div>
        </div>
      ) : null}

      {!pottyComplete ? (
        <div className="mt-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-xs text-amber-100">
          Finish potty training to unlock button-based commands.
        </div>
      ) : null}

      <div className="mt-5 rounded-3xl border border-white/10 bg-black/25 p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] uppercase tracking-[0.4em] text-white/50">
              {coach.title}
            </p>
            <p className="mt-1 text-sm text-white/80">{coach.body}</p>
            {coach.sub ? (
              <p className="mt-2 text-[11px] text-white/60">{coach.sub}</p>
            ) : null}
          </div>

          {coach.cta?.type === "link" ? (
            <Link
              to={coach.cta.to}
              className="shrink-0 rounded-full border border-emerald-400/35 bg-emerald-500/10 px-4 py-2 text-xs font-semibold text-emerald-200 transition hover:bg-emerald-500/20"
            >
              {coach.cta.label}
            </Link>
          ) : coach.cta?.type === "button" ? (
            <button
              type="button"
              onClick={coach.cta.onClick}
              className="shrink-0 rounded-full border border-emerald-400/35 bg-emerald-500/10 px-4 py-2 text-xs font-semibold text-emerald-200 transition hover:bg-emerald-500/20"
            >
              {coach.cta.label}
            </button>
          ) : null}
        </div>
      </div>

      <div className="mt-5 max-h-[380px] overflow-y-auto pr-1">
        {groups.ready.length ? (
          <CommandGroup title={`Ready (${groups.ready.length})`} tone="ready">
            {groups.ready.map((command) => (
              <CommandCard
                key={command.id}
                command={command}
                active={command.id === selectedCommand?.id}
                nowMs={nowMs}
                onSelect={() => onSelectCommand?.(command.id)}
              />
            ))}
          </CommandGroup>
        ) : null}

        {groups.unlocking.length ? (
          <CommandGroup
            title={`Unlocking (${groups.unlocking.length})`}
            tone="unlocking"
          >
            {groups.unlocking.map((command) => (
              <CommandCard
                key={command.id}
                command={command}
                active={command.id === selectedCommand?.id}
                nowMs={nowMs}
                onSelect={() => onSelectCommand?.(command.id)}
              />
            ))}
          </CommandGroup>
        ) : null}

        {groups.locked.length ? (
          <CommandGroup
            title={`Locked (${groups.locked.length})`}
            tone="locked"
          >
            {groups.locked.map((command) => (
              <CommandCard
                key={command.id}
                command={command}
                active={command.id === selectedCommand?.id}
                nowMs={nowMs}
                onSelect={() => onSelectCommand?.(command.id)}
              />
            ))}
          </CommandGroup>
        ) : null}
      </div>

      <div className="mt-5 rounded-3xl border border-white/10 bg-white/5 p-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.4em] text-white/50">
              Selected trick
            </p>
            <p className="mt-1 text-lg font-semibold text-white">
              {selectedCommand?.label || "Waiting on a command"}
            </p>
          </div>
          <span className="text-[10px] uppercase tracking-[0.25em] text-white/60">
            {STATUS_LABELS[selectedCommand?.status] || "Locked"}
          </span>
        </div>

        <p className="mt-3 text-sm text-white/70">{statusCopy}</p>

        <div className="mt-4 grid grid-cols-2 gap-3 text-[11px] text-white/70">
          <TrainingStat label="Button victory" value={`${buttonChance}%`} />
          <TrainingStat label="Voice reliability" value={`${voiceChance}%`} />
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {allowButtonTraining ? (
            <button
              type="button"
              disabled={!canPractice}
              onClick={handlePractice}
              className="rounded-2xl border border-emerald-400/50 bg-emerald-500/15 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500/20 disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/60"
            >
              Practice command
            </button>
          ) : (
            <div className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-xs text-white/70">
              Button training is disabled in Settings (voice-only mode).
            </div>
          )}

          {canUseVoice ? (
            <VoiceCommandButton />
          ) : (
            <div className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-xs text-white/70">
              {pottyComplete
                ? "Voice training is disabled in Settings (buttons-only mode)."
                : "Voice training unlocks after potty training."}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function TrainingStat({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/30 px-3 py-2 text-[10px] uppercase tracking-[0.3em] text-white/50">
      <div>{label}</div>
      <div className="mt-1 text-base font-bold text-white">{value}</div>
    </div>
  );
}

function CommandGroup({ title, tone, children }) {
  const toneCls =
    tone === "ready"
      ? "text-emerald-200"
      : tone === "unlocking"
        ? "text-amber-200"
        : "text-white/60";

  return (
    <div className="mb-4">
      <div
        className={`mb-2 text-[11px] font-semibold uppercase tracking-[0.35em] ${toneCls}`}
      >
        {title}
      </div>
      <div className="grid gap-3 sm:grid-cols-2">{children}</div>
    </div>
  );
}

function CommandCard({ command, active, onSelect, nowMs }) {
  const locked = command.status === "locked";
  const unlocking = command.status === "unlocking";
  const unlocked = command.status === "unlocked";

  const remaining = remainingMsForCommand(command, nowMs);

  const badge = unlocking
    ? remaining != null
      ? `Unlocks in ${formatTime(remaining)}`
      : "Unlocking"
    : STATUS_LABELS[command.status] || "Locked";

  const badgeTone = unlocked
    ? "text-emerald-200 border-emerald-400/30 bg-emerald-500/10"
    : unlocking
      ? "text-amber-200 border-amber-400/25 bg-amber-500/10"
      : "text-white/60 border-white/15 bg-white/5";

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={active}
      className={[
        "flex flex-col gap-2 rounded-2xl border px-3 py-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50",
        active
          ? "border-emerald-400/65 bg-emerald-500/10"
          : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10",
        locked ? "opacity-80" : "",
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-semibold text-white">{command.label}</p>
        <span
          className={[
            "shrink-0 rounded-full border px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.25em]",
            badgeTone,
          ].join(" ")}
        >
          {badge}
        </span>
      </div>
      <p className="text-[11px] text-white/60">{command.detail}</p>
    </button>
  );
}

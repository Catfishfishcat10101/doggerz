// src/features/game/MainGame.jsx

import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";

import DogStage from "./DogStage.jsx";
import NeedsHUD from "./NeedsHUD.jsx";
import TrainingPanel from "./TrainingPanel.jsx";
import MechanicsPanel from "./MechanicsPanel.jsx";
import GameTopBar from "./GameTopBar.jsx";
import DogActions from "./DogActions.jsx";

import {
  selectDog,
  selectDogTraining,
  LEVEL_XP_STEP,
} from "@/redux/dogSlice.js";
import {
  OBEDIENCE_COMMANDS,
  commandRequirementsMet,
} from "@/constants/obedienceCommands.js";
import {
  computeTrainingSuccessChance,
  formatChancePercent,
} from "@/utils/trainingMath.js";
import { selectSettings } from "@/redux/settingsSlice.js";
import { collectEarnedBadgeIds } from "@/utils/badges.js";

function clamp01(n) {
  const x = Number(n);
  if (Number.isNaN(x)) return 0;
  return Math.max(0, Math.min(1, x));
}

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

function formatAgeLabel(ageInGameDays) {
  const baseDays = 56; // start at 8 weeks old
  const safeDays = Math.max(0, Math.round(Number(ageInGameDays) || 0));
  const ageDays = baseDays + safeDays;

  const weeks = Math.max(8, Math.round(ageDays / 7));
  if (ageDays < 112) {
    return `${weeks} weeks`;
  }

  const months = Math.max(2, Math.round(ageDays / 30.4));
  if (ageDays < 730) {
    return `${months} months`;
  }

  const years = ageDays / 365;
  const rounded = Math.round(years * 10) / 10;
  const label =
    rounded % 1 === 0 ? String(Math.round(rounded)) : rounded.toFixed(1);
  return `${label} years`;
}

export default function MainGame(props = {}) {
  const storeDog = useSelector(selectDog);
  const storeTraining = useSelector(selectDogTraining);
  const settings = useSelector(selectSettings);

  const dog = useMemo(
    () =>
      props.dog || storeDog || { name: "Pup", stage: "Puppy", mood: "Calm" },
    [props.dog, storeDog]
  );
  const training = props.training || storeTraining || {};
  const scene = props.scene || {
    label: "Backyard",
    timeOfDay: "Night",
    weather: "Clear",
  };

  const stats = dog.stats || {};
  const bondValue = Number(dog?.bond?.value || 0);
  const streakDays = Number(dog?.streak?.currentStreakDays || 0);
  const level = Number(dog?.level || 1);
  const pottyComplete = Boolean(training?.potty?.completedAt);
  const moodLabel =
    typeof dog?.mood === "string" && dog.mood.trim()
      ? dog.mood
      : typeof dog?.emotionCue === "string" && dog.emotionCue.trim()
        ? dog.emotionCue
        : "Content";
  const ageLabel = formatAgeLabel(dog?.lifeStage?.days);
  const earnedBadges = useMemo(() => collectEarnedBadgeIds(dog), [dog]);

  const safeNeeds = useMemo(() => {
    if (props.needs) {
      const n = props.needs || {};
      return {
        food: clamp01(n.food),
        water: clamp01(n.water),
        energy: clamp01(n.energy),
        happiness: clamp01(n.happiness),
        potty: clamp01(n.potty),
        cleanliness: clamp01(n.cleanliness),
        bond: clamp01(n.bond),
      };
    }

    return {
      food: clamp01(1 - Number(stats.hunger || 0) / 100),
      water: clamp01(1 - Number(stats.thirst || 0) / 100),
      energy: clamp01(Number(stats.energy || 0) / 100),
      happiness: clamp01(Number(stats.happiness || 0) / 100),
      potty: clamp01(1 - Number(dog?.pottyLevel || 0) / 100),
      cleanliness: clamp01(Number(stats.cleanliness || 0) / 100),
      bond: clamp01(bondValue / 100),
    };
  }, [
    bondValue,
    dog?.pottyLevel,
    props.needs,
    stats.cleanliness,
    stats.energy,
    stats.happiness,
    stats.hunger,
    stats.thirst,
  ]);

  const temperament = dog?.temperament || {};
  const isSpicy =
    String(temperament.primary || "").toUpperCase() === "SPICY" ||
    String(temperament.secondary || "").toUpperCase() === "SPICY";
  const traits = Array.isArray(temperament.traits) ? temperament.traits : [];
  const foodMotivated =
    traits.find((t) => t?.id === "foodMotivated")?.intensity || 0;
  const lastFedAt = dog?.memory?.lastFedAt;
  const fedRecently =
    typeof lastFedAt === "number" &&
    Date.now() - lastFedAt < 2 * 60 * 60 * 1000;

  const baseChance = computeTrainingSuccessChance({
    input: "button",
    bond: bondValue,
    energy: stats.energy,
    hunger: stats.hunger,
    thirst: stats.thirst,
    happiness: stats.happiness,
    isSpicy,
    foodMotivated,
    fedRecently,
  });

  const voiceChance = computeTrainingSuccessChance({
    input: "voice",
    bond: bondValue,
    energy: stats.energy,
    hunger: stats.hunger,
    thirst: stats.thirst,
    happiness: stats.happiness,
    isSpicy,
    foodMotivated,
    fedRecently,
  });

  const commands = useMemo(() => {
    const unlockState = training?.obedience || {};
    const unlockedIds = new Set(unlockState.unlockedIds || []);
    const unlockableAtById = unlockState.unlockableAtById || {};
    const unlockedAtById = unlockState.unlockedAtById || {};
    const now = Date.now();

    return OBEDIENCE_COMMANDS.map((command) => {
      const unlocked = unlockedIds.has(command.id);
      const requirementsMet = commandRequirementsMet(
        {
          level,
          bond: bondValue,
          streak: streakDays,
          pottyComplete,
        },
        command
      );

      let status = "locked";
      if (unlocked) status = "unlocked";
      else if (requirementsMet) status = "unlocking";

      const delayMs = Math.max(
        0,
        Math.round((command.unlockDelayMinutes || 0) * 60 * 1000)
      );
      const startedAt = Number(unlockableAtById?.[command.id] || 0);
      const unlocksAt =
        status === "unlocking" ? (startedAt || now) + delayMs : null;
      const remainingMs =
        status === "unlocking" && typeof unlocksAt === "number"
          ? Math.max(0, unlocksAt - now)
          : null;
      const unlockedAt = Number(unlockedAtById?.[command.id] || 0) || null;

      const missing = [];
      if (!pottyComplete) missing.push("Potty training");
      if (level < command.minLevel) missing.push(`Level ${command.minLevel}`);
      if (bondValue < command.minBond) missing.push(`Bond ${command.minBond}%`);
      if (streakDays < command.minStreak)
        missing.push(`Streak ${command.minStreak}d`);

      let detail = command.tip || "Ready";
      if (status === "locked" && missing.length) {
        detail = `Requires ${missing.join(" / ")}`;
      } else if (status === "unlocking") {
        detail =
          delayMs > 0
            ? `Unlocks in ${formatTime(remainingMs)}`
            : "Unlocking now";
      }

      return {
        ...command,
        status,
        detail,
        remainingMs,
        unlocksAt,
        unlockStartedAt: startedAt || null,
        unlockDelayMs: delayMs,
        unlockedAt,
        requirementsMet,
        missing,
      };
    });
  }, [bondValue, level, pottyComplete, streakDays, training?.obedience]);

  const [tab, setTab] = useState("game");
  const [selectedCommandId, setSelectedCommandId] = useState(
    commands.find((c) => c.status === "unlocked")?.id || commands[0]?.id
  );

  useEffect(() => {
    if (!commands.length) return;
    if (selectedCommandId && commands.some((c) => c.id === selectedCommandId)) {
      return;
    }
    const next = commands.find((c) => c.status === "unlocked") || commands[0];
    if (next?.id) setSelectedCommandId(next.id);
  }, [commands, selectedCommandId]);

  const selectedCommand =
    commands.find((c) => c.id === selectedCommandId) || commands[0] || null;

  const tabIsTraining = tab === "training";
  const tabIsGame = tab === "game";
  const trainingInputMode = String(settings?.trainingInputMode || "both");
  const allowButtonTraining = trainingInputMode !== "voice";
  const allowVoiceTraining = trainingInputMode !== "buttons";

  return (
    <div className="min-h-dvh w-full text-white">
      <div
        className="mx-auto max-w-7xl px-4"
        style={{
          paddingTop: "calc(env(safe-area-inset-top) + 1rem)",
          paddingBottom: "calc(env(safe-area-inset-bottom) + 2.5rem)",
          paddingLeft: "calc(env(safe-area-inset-left) + 1rem)",
          paddingRight: "calc(env(safe-area-inset-right) + 1rem)",
        }}
      >
        <div className="mb-3">
          <GameTopBar
            dogName={dog?.name || "Pup"}
            level={level}
            xpPct={
              LEVEL_XP_STEP
                ? (Number(dog?.xp || 0) % LEVEL_XP_STEP) / LEVEL_XP_STEP
                : 0
            }
            xpLabel={`${Number(dog?.xp || 0)} XP`}
            coins={Number(dog?.coins || 0)}
            lifeStageLabel={dog?.lifeStage?.label || "Puppy"}
            // @ts-ignore
            lifeStageDay={ageLabel}
            moodLabel={moodLabel}
            streakDays={streakDays}
            badges={earnedBadges}
          />
        </div>

        <div className="mb-6 flex flex-wrap items-center justify-end gap-2 text-xs text-white/60">
          <TabButton
            label="Game"
            active={tabIsGame}
            onClick={() => setTab("game")}
          />
          <TabButton
            label="Training"
            active={tabIsTraining}
            onClick={() => setTab("training")}
          />
        </div>

        <main className="grid grid-cols-1 gap-4 lg:grid-cols-12">
          <section className="lg:col-span-7">
            <DogStage dog={dog} scene={scene} />
          </section>

          <section className="lg:col-span-5">
            <NeedsHUD needs={safeNeeds} scene={scene} />
          </section>

          {/* Row 2 (zigzag): small left, big right */}
          <section className="lg:col-span-5">
            {tabIsTraining ? (
              <TrainingFocusCard
                selectedCommand={selectedCommand}
                buttonChance={formatChancePercent(baseChance)}
                voiceChance={formatChancePercent(voiceChance)}
                pottyComplete={pottyComplete}
              />
            ) : (
              <TrainingSummaryCard
                selectedCommand={selectedCommand}
                pottyComplete={pottyComplete}
                buttonChance={formatChancePercent(baseChance)}
                voiceChance={formatChancePercent(voiceChance)}
                onExplore={() => setTab("training")}
              />
            )}
          </section>

          <section className="space-y-4 lg:col-span-7 lg:col-start-6">
            {tabIsTraining ? (
              <>
                <TrainingPanel
                  pottyComplete={pottyComplete}
                  allowButtonTraining={allowButtonTraining}
                  allowVoiceTraining={allowVoiceTraining}
                  commands={commands}
                  selectedCommandId={selectedCommandId}
                  onSelectCommand={(id) => {
                    setSelectedCommandId(id);
                    props.onSelectTraining?.(id);
                  }}
                  voiceChance={formatChancePercent(voiceChance)}
                  buttonChance={formatChancePercent(baseChance)}
                />
                <MechanicsPanel
                  bondValue={bondValue}
                  streakDays={streakDays}
                  level={level}
                  pottyComplete={pottyComplete}
                  commands={commands}
                  voiceChance={formatChancePercent(voiceChance)}
                  buttonChance={formatChancePercent(baseChance)}
                />
              </>
            ) : (
              <DogActions />
            )}
          </section>
        </main>
      </div>
    </div>
  );
}

function TabButton({ label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "rounded-full px-4 py-1 text-xs font-semibold transition",
        active
          ? "bg-emerald-500/20 text-emerald-200 ring-1 ring-emerald-400/40"
          : "bg-white/5 text-white/70 ring-1 ring-white/15 hover:text-white hover:ring-white/30",
      ].join(" ")}
    >
      {label}
    </button>
  );
}

function TrainingSummaryCard({
  selectedCommand,
  pottyComplete,
  buttonChance,
  voiceChance,
  onExplore,
}) {
  const statusLabel = selectedCommand?.status || "locked";
  const statusColor =
    statusLabel === "unlocked"
      ? "text-emerald-300"
      : statusLabel === "unlocking"
        ? "text-amber-300"
        : "text-white/50";

  return (
    <section className="rounded-3xl border border-white/10 bg-[#0b0f16]/80 p-5 shadow-[0_30px_90px_rgba(0,0,0,0.45)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.4em] text-white/40">
            Training brief
          </p>
          <h3 className="text-2xl font-extrabold text-white">
            {selectedCommand?.label || "Command locked"}
          </h3>
        </div>
        <span
          className={`rounded-full border border-white/15 px-3 py-1 text-[10px] uppercase tracking-[0.3em] ${statusColor}`}
        >
          {statusLabel}
        </span>
      </div>

      <p className="mt-3 text-sm text-white/70">
        {selectedCommand?.detail ||
          "Keep playing to unlock new tricks and keep the Yard buzzing."}
      </p>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <StatChip label="Button success" value={`${buttonChance}%`} />
        <StatChip label="Voice success" value={`${voiceChance}%`} />
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-[11px] text-white/60">
          {pottyComplete
            ? "Tap the training tab to practice this command."
            : "Complete potty training to unlock button-based commands."}
        </p>
        <button
          type="button"
          onClick={onExplore}
          className="rounded-full border border-emerald-400/40 bg-emerald-500/10 px-4 py-2 text-xs font-semibold text-emerald-200 transition hover:bg-emerald-500/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50"
        >
          Open training
        </button>
      </div>
    </section>
  );
}

function TrainingFocusCard({
  selectedCommand,
  buttonChance,
  voiceChance,
  pottyComplete,
}) {
  return (
    <section className="rounded-2xl border border-white/15 bg-gradient-to-b from-black/70 to-black/40 p-5 shadow-[0_35px_80px_rgba(0,0,0,0.38)]">
      <div className="flex items-center justify-between">
        <p className="text-[11px] uppercase tracking-[0.4em] text-white/40">
          Focus
        </p>
        <span className="text-[11px] text-white/60">Live training</span>
      </div>
      <p className="mt-2 text-sm text-white/70">
        {selectedCommand
          ? `Currently tuned to ${selectedCommand.label}.`
          : "Select a command to practice and keep momentum."}
      </p>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <StatChip label="Button chance" value={`${buttonChance}%`} />
        <StatChip label="Voice chance" value={`${voiceChance}%`} />
      </div>

      <p className="mt-4 text-[11px] text-white/60">
        {pottyComplete
          ? "Potty training unlocked. Try every command to keep streaks alive."
          : "Potty training still in progress. Finish it to unlock more buttons."}
      </p>
    </section>
  );
}

function StatChip({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-[11px] text-white/70">
      <div className="text-[10px] uppercase tracking-[0.3em] text-white/40">
        {label}
      </div>
      <div className="mt-1 text-sm font-semibold text-white">{value}</div>
    </div>
  );
}

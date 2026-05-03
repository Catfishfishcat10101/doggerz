import { useEffect, useState } from "react";
import Tooltip from "@/components/ui/Tooltip.jsx";
import useCountdown from "@/hooks/useCountdown.js";

function clamp(value, min, max) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return min;
  return Math.max(min, Math.min(max, numeric));
}

function getDockUrgencyLevel(item = null) {
  const explicitLevel = String(item?.urgencyLevel || "")
    .trim()
    .toLowerCase();
  if (explicitLevel) return explicitLevel;
  if (item?.disabled) return "muted";

  const progress = clamp(Number(item?.progress || 0), 0, 100);
  if (progress >= 84) return "critical";
  if (progress >= 66) return "high";
  if (progress >= 46) return "elevated";
  return "normal";
}

function getDockUrgencyBadge(level = "normal") {
  if (level === "critical") return "Now";
  if (level === "high") return "Soon";
  if (level === "elevated") return "Watch";
  return "";
}

function getDockUrgencyCardClasses(level = "normal") {
  if (level === "critical") {
    return "border-amber-300/32 bg-[linear-gradient(180deg,rgba(251,191,36,0.18),rgba(255,255,255,0.04))] shadow-[0_16px_34px_rgba(251,191,36,0.12)]";
  }
  if (level === "high") {
    return "border-sky-300/24 bg-[linear-gradient(180deg,rgba(56,189,248,0.15),rgba(255,255,255,0.04))] shadow-[0_14px_28px_rgba(56,189,248,0.08)]";
  }
  if (level === "elevated") {
    return "border-emerald-300/20 bg-[linear-gradient(180deg,rgba(52,211,153,0.12),rgba(255,255,255,0.04))]";
  }
  return "border-white/12 bg-[linear-gradient(180deg,rgba(255,255,255,0.1),rgba(255,255,255,0.04))] hover:bg-white/10";
}

function getDockUrgencyTabClasses(level = "normal") {
  if (level === "critical") {
    return "border-amber-200/26 bg-[linear-gradient(180deg,rgba(251,191,36,0.18),rgba(255,255,255,0.04))] text-doggerz-bone shadow-[0_12px_24px_rgba(251,191,36,0.12)]";
  }
  if (level === "high") {
    return "border-sky-300/20 bg-[linear-gradient(180deg,rgba(56,189,248,0.14),rgba(255,255,255,0.03))] text-doggerz-bone/90 shadow-[0_12px_24px_rgba(56,189,248,0.08)]";
  }
  if (level === "elevated") {
    return "border-emerald-300/18 bg-[linear-gradient(180deg,rgba(52,211,153,0.1),rgba(255,255,255,0.03))] text-doggerz-bone/88";
  }
  return "border-white/12 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] text-doggerz-bone/82 hover:bg-white/10";
}

function getDockUrgencyBadgeClasses(level = "normal") {
  if (level === "critical") {
    return "border-amber-200/30 bg-amber-300/18 text-amber-50 animate-pulse";
  }
  if (level === "high") {
    return "border-sky-300/30 bg-sky-300/14 text-sky-50";
  }
  if (level === "elevated") {
    return "border-emerald-300/24 bg-emerald-300/12 text-emerald-50";
  }
  return "border-white/12 bg-white/8 text-doggerz-bone/70";
}

function getSectionUrgencyLevel(section = null) {
  const items = Array.isArray(section?.items) ? section.items : [];
  if (!items.length) return "normal";
  const levels = items.map((item) => getDockUrgencyLevel(item));
  if (levels.includes("critical")) return "critical";
  if (levels.includes("high")) return "high";
  if (levels.includes("elevated")) return "elevated";
  return "normal";
}

export function RunawayLetterPanel({
  dogName = "your pup",
  endTimestamp = 0,
  onWelcome,
}) {
  const countdown = useCountdown(endTimestamp);

  return (
    <div className="overflow-hidden rounded-[24px] border border-amber-300/25 bg-[radial-gradient(circle_at_top,rgba(251,191,36,0.16),transparent_45%),linear-gradient(180deg,rgba(24,16,10,0.96),rgba(9,8,7,0.98))] p-5 text-amber-50 shadow-[0_18px_46px_rgba(15,10,3,0.45)]">
      <div className="text-[11px] font-black uppercase tracking-[0.22em] text-amber-200/80">
        Dear Hooman
      </div>
      <h3 className="mt-2 text-2xl font-black tracking-tight text-amber-100">
        {dogName} is on strike.
      </h3>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-amber-50/88">
        You were gone too long, so your dog packed a dramatic little bag and
        left you a letter instead of waiting in the yard. No coins, no XP, and
        no playtime until the cooldown burns off.
      </p>
      <div className="mt-5 inline-flex rounded-2xl border border-amber-300/30 bg-black/30 px-4 py-3 text-left shadow-[0_10px_24px_rgba(0,0,0,0.22)]">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-200/70">
            I&apos;ll be back in
          </div>
          <div className="countdown-clock mt-1 text-3xl font-black tracking-tight text-amber-100">
            {countdown.formatted}
          </div>
          <div className="mt-1 text-xs text-amber-100/70">
            ...if I feel like it.
          </div>
        </div>
      </div>
      {countdown.isComplete ? (
        <div className="mt-5">
          <button
            type="button"
            onClick={onWelcome}
            className="rounded-2xl border border-emerald-300/35 bg-emerald-400/15 px-4 py-2 text-sm font-bold text-emerald-50 shadow-[0_10px_24px_rgba(16,185,129,0.18)] hover:bg-emerald-400/20"
          >
            Welcome your dog back
          </button>
        </div>
      ) : null}
    </div>
  );
}

export function TemperamentRevealCard({ copy, onLater, onReveal }) {
  return (
    <div className="fixed inset-0 z-[72] flex items-center justify-center bg-black/55 p-4">
      <div className="w-full max-w-lg rounded-3xl border border-doggerz-leaf/35 bg-black/90 p-5 text-doggerz-bone shadow-[0_20px_50px_rgba(2,6,23,0.7)]">
        <div className="text-xs uppercase tracking-[0.2em] text-doggerz-paw/90">
          Temperament Milestone
        </div>
        <h3 className="mt-2 text-xl font-black tracking-tight">
          {copy?.title}
        </h3>
        <p className="mt-3 text-sm text-doggerz-bone/85">{copy?.summary}</p>
        <p className="mt-2 text-xs text-doggerz-bone/70">{copy?.detail}</p>
        <div className="mt-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs">
          Primary: {copy?.primary || "Unknown"} • Secondary:{" "}
          {copy?.secondary || "Unknown"}
        </div>
        <div className="mt-4 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onLater}
            className="rounded-xl border border-white/20 bg-white/5 px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-doggerz-bone/80 hover:bg-white/10"
          >
            Later
          </button>
          <button
            type="button"
            onClick={onReveal}
            className="rounded-xl border border-doggerz-leaf/45 bg-doggerz-neon/20 px-3 py-2 text-xs font-bold uppercase tracking-[0.14em] text-doggerz-bone hover:bg-doggerz-neon/30"
          >
            Open Card
          </button>
        </div>
      </div>
    </div>
  );
}

export function BottomMenuDock({
  tabs = [],
  activeCategory = "",
  sections = {},
  onSelectCategory,
  onSelectItem,
  onPointerEnter,
}) {
  const activeSection = sections?.[activeCategory] || null;
  const tabUrgencyById = tabs.reduce((accumulator, tab) => {
    accumulator[tab.id] = getSectionUrgencyLevel(sections?.[tab.id] || null);
    return accumulator;
  }, {});

  return (
    <div className="relative overflow-hidden rounded-[24px] border border-emerald-200/16 bg-[linear-gradient(180deg,rgba(8,12,24,0.88),rgba(2,6,23,0.96))] p-1.5 shadow-[0_16px_36px_rgba(2,6,23,0.54),0_18px_54px_rgba(2,6,23,0.3),inset_0_1px_0_rgba(255,255,255,0.12)] backdrop-blur-3xl sm:rounded-[30px] sm:p-2.5">
      <div className="pointer-events-none absolute inset-x-[10%] -top-3 h-10 rounded-full bg-[radial-gradient(circle_at_center,rgba(251,191,36,0.22),rgba(251,191,36,0)_74%)] blur-2xl" />
      <div className="pointer-events-none absolute inset-x-[8%] top-0 h-14 rounded-full bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.2),rgba(255,255,255,0)_72%)] blur-2xl" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-[linear-gradient(180deg,rgba(251,191,36,0),rgba(251,191,36,0.07))]" />
      <div className="pointer-events-none absolute inset-0 rounded-[30px] border border-white/8 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.03)]" />
      {activeSection ? (
        <div className="relative rounded-[24px] border border-amber-200/14 bg-[linear-gradient(180deg,rgba(8,13,28,0.97),rgba(2,6,23,0.94))] px-3 pt-3 pb-2.5 shadow-[0_18px_36px_rgba(2,6,23,0.3),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-3xl">
          <div className="pointer-events-none absolute left-1/2 top-2 h-1.5 w-12 -translate-x-1/2 rounded-full bg-white/14 sm:hidden" />
          <div className="flex items-start justify-between gap-3 pt-2 sm:pt-0">
            <div>
              <div className="text-[11px] font-black uppercase tracking-[0.18em] text-amber-100/90">
                {activeSection.title}
              </div>
              <div className="mt-1 text-xs text-doggerz-bone/70">
                {activeSection.subtitle}
              </div>
            </div>
            <button
              type="button"
              onClick={() => onSelectCategory?.(activeCategory)}
              className="dock-glass-button dock-pressable rounded-full border border-white/14 bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-doggerz-bone/80"
            >
              Close
            </button>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2.5">
            {activeSection.items.map((item) => (
              <BottomMenuCardButton
                key={item.key}
                item={item}
                label={item.label}
                detail={item.detail}
                icon={item.icon}
                onClick={onSelectItem}
                onPointerEnter={onPointerEnter}
                disabled={item.disabled}
                active={item.active}
              />
            ))}
          </div>
        </div>
      ) : null}

      <div
        className={`${activeSection ? "mt-2.5" : ""} grid grid-cols-4 gap-1 sm:gap-2`}
      >
        {tabs.map((tab) => {
          const active = tab.id === activeCategory;
          const urgencyLevel = tabUrgencyById?.[tab.id] || "normal";
          const urgencyBadge = getDockUrgencyBadge(urgencyLevel);
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onSelectCategory?.(tab.id)}
              onPointerEnter={onPointerEnter}
              className={`dock-glass-button dock-pressable dz-touch-button dz-touch-hover relative min-h-[54px] rounded-[18px] border px-2 py-2 text-center transition sm:min-h-[62px] sm:rounded-[22px] sm:px-3 sm:py-3 ${
                active
                  ? "border-amber-200/35 bg-[linear-gradient(180deg,rgba(251,191,36,0.22),rgba(251,191,36,0.08))] text-doggerz-bone shadow-[0_16px_32px_rgba(251,191,36,0.16)]"
                  : getDockUrgencyTabClasses(urgencyLevel)
              }`}
            >
              <span className="dz-touch-glow pointer-events-none absolute inset-0 rounded-[18px] bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.18),rgba(255,255,255,0)_64%)] sm:rounded-[22px]" />
              {urgencyBadge && !active ? (
                <span
                  className={`absolute right-2 top-2 rounded-full border px-1.5 py-0.5 text-[8px] font-black uppercase tracking-[0.16em] ${getDockUrgencyBadgeClasses(
                    urgencyLevel
                  )}`}
                >
                  {urgencyBadge}
                </span>
              ) : null}
              <span className="block text-base sm:text-lg">{tab.icon}</span>
              <span className="mt-0.5 block text-[9px] font-black uppercase tracking-[0.12em] sm:mt-1 sm:text-[11px] sm:tracking-[0.14em]">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function BottomMenuCardButton({
  item = null,
  label,
  detail,
  icon,
  onClick,
  onPointerEnter,
  disabled = false,
  active = false,
}) {
  const progress = clamp(Number(item?.progress || 0), 0, 100);
  const urgencyLevel = getDockUrgencyLevel(item);
  const urgencyBadge = getDockUrgencyBadge(urgencyLevel);
  const ringTone = String(item?.progressTone || "gold")
    .trim()
    .toLowerCase();
  const ringColor =
    ringTone === "amber"
      ? "rgba(251,191,36,0.95)"
      : ringTone === "sky"
        ? "rgba(56,189,248,0.95)"
        : ringTone === "emerald"
          ? "rgba(52,211,153,0.95)"
          : ringTone === "rose"
            ? "rgba(251,113,133,0.95)"
            : ringTone === "violet"
              ? "rgba(167,139,250,0.95)"
              : ringTone === "lime"
                ? "rgba(163,230,53,0.95)"
                : "rgba(250,204,21,0.95)";
  const ringTrack = "rgba(255,255,255,0.08)";
  const ringBackground = `conic-gradient(${ringColor} 0 ${progress}%, ${ringTrack} ${progress}% 100%)`;

  return (
    <Tooltip content={detail || label} className="w-full">
      <button
        type="button"
        onClick={() => onClick?.(item)}
        onPointerEnter={onPointerEnter}
        disabled={disabled}
        className={`dock-glass-button dock-pressable dz-touch-button dz-touch-hover group relative w-full min-h-[72px] overflow-hidden rounded-[20px] border px-3 py-2.5 text-left transition disabled:cursor-not-allowed disabled:opacity-45 sm:min-h-[76px] ${
          active
            ? "btn-feedback-pop border-doggerz-neon/45 bg-[linear-gradient(180deg,rgba(45,212,191,0.18),rgba(45,212,191,0.08))]"
            : getDockUrgencyCardClasses(urgencyLevel)
        }`}
      >
        <span className="dz-touch-glow pointer-events-none absolute inset-0 rounded-[22px] bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.16),rgba(255,255,255,0)_62%)]" />
        {urgencyBadge && !active && !disabled ? (
          <span
            className={`absolute right-2.5 top-2.5 rounded-full border px-1.5 py-0.5 text-[8px] font-black uppercase tracking-[0.16em] ${getDockUrgencyBadgeClasses(
              urgencyLevel
            )}`}
          >
            {urgencyBadge}
          </span>
        ) : null}
        <div className="flex items-start gap-3">
          <span
            className="relative grid h-11 w-11 shrink-0 place-items-center rounded-[18px] text-lg"
            style={{
              background: ringBackground,
              boxShadow:
                "0 14px 24px rgba(2,6,23,0.18), inset 0 1px 0 rgba(255,255,255,0.06)",
            }}
          >
            <span className="absolute inset-[2px] rounded-[16px] bg-[linear-gradient(180deg,rgba(15,23,42,0.95),rgba(2,6,23,0.9))]" />
            <span className="absolute inset-[6px] rounded-[14px] bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.12),rgba(255,255,255,0)_60%),linear-gradient(180deg,rgba(12,18,32,0.92),rgba(2,6,23,0.86))]" />
            <span className="relative z-[1]">{icon}</span>
          </span>
          <span className="min-w-0">
            <span className="block text-[13px] font-bold leading-4 text-doggerz-bone sm:text-sm">
              {label}
            </span>
            <span className="mt-1 block text-[10px] leading-4 text-doggerz-paw/75 sm:text-[11px]">
              {detail}
            </span>
          </span>
        </div>
      </button>
    </Tooltip>
  );
}

export function InteractionSheet({
  onClose,
  onQuickFeed,
  onDropBowl,
  onFeedRegular,
  onFeedHuman,
  onFeedPremium,
  premiumKibbleCount = 0,
  onGiveWater,
  onPlay,
  onPet,
  onBath,
  onPotty,
  onOpenTricks,
  showTricksButton = false,
  pottyTooltip = "",
}) {
  return (
    <div
      className="fixed inset-0 z-[72] flex items-end justify-center bg-black/45 px-2 pt-8 pb-[calc(env(safe-area-inset-bottom,0px)+8px)] sm:p-6"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose?.();
      }}
    >
      <div className="w-full max-w-lg overflow-hidden rounded-t-[28px] rounded-b-[22px] border border-doggerz-leaf/24 bg-[linear-gradient(180deg,rgba(6,10,20,0.98),rgba(2,6,23,0.94))] text-doggerz-bone shadow-[0_18px_48px_rgba(2,6,23,0.65)] backdrop-blur-md sm:rounded-[28px]">
        <div className="pointer-events-none flex justify-center pt-2.5 sm:hidden">
          <span className="h-1.5 w-12 rounded-full bg-white/16" />
        </div>
        <div className="flex items-start justify-between gap-3 px-4 pt-3 pb-2 sm:px-5 sm:pt-4">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-doggerz-paw">
              Interactions
            </div>
            <div className="mt-1 text-sm text-doggerz-bone/72">
              Care, comfort, and routine sized for touch.
            </div>
          </div>
          <div className="rounded-full border border-white/15 bg-black/40 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-100">
            Premium bowls: {premiumKibbleCount}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="dz-touch-button rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-doggerz-bone"
          >
            Close
          </button>
        </div>
        <div className="max-h-[72dvh] overflow-y-auto px-4 pb-[calc(env(safe-area-inset-bottom,0px)+14px)] sm:px-5 sm:pb-5">
          <div className="grid grid-cols-2 gap-2.5">
            <SheetButton
              label="Quick Feed"
              icon="🍖"
              onClick={onQuickFeed}
              tooltip="A quick meal when hunger is actually building."
            />
            <SheetButton
              label="Water"
              icon="💧"
              onClick={onGiveWater}
              tooltip="Fresh water supports mood, health, and potty rhythm."
            />
            <SheetButton
              label="Play"
              icon="🎾"
              onClick={onPlay}
              tooltip="Play works best after basic needs are handled."
            />
            <SheetButton
              label="Pet"
              icon="🖐️"
              onClick={onPet}
              tooltip="Quiet affection builds bond and trust."
            />
            <SheetButton
              label="Bath"
              icon="🧼"
              onClick={onBath}
              tooltip="Clean up when grime starts affecting comfort."
            />
            <SheetButton
              label="Potty"
              icon="🌿"
              onClick={onPotty}
              tooltip={pottyTooltip || "Potty timing builds house training."}
            />
          </div>
          <div className="mt-4">
            <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-doggerz-bone/55">
              More Care
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
              <SheetButton
                label="Regular Bowl"
                icon="🦴"
                onClick={onFeedRegular}
                tooltip="Standard meal. Reliable hunger recovery."
              />
              <SheetButton
                label="Human Food"
                icon="🍟"
                onClick={onFeedHuman}
                tooltip="Fast happiness spike, but not ideal as a routine diet."
              />
              <SheetButton
                label="Premium Bowl"
                icon="🥩"
                onClick={onFeedPremium}
                disabled={premiumKibbleCount <= 0}
                tooltip="Best meal quality. Uses one premium bowl."
              />
              <SheetButton
                label="Place Bowl"
                icon="🥣"
                onClick={onDropBowl}
                tooltip="Place a bowl in the scene so your pup can eat from it."
              />
              {showTricksButton ? (
                <SheetButton
                  label="Tricks"
                  icon="🎯"
                  onClick={onOpenTricks}
                  tooltip="Open the trick list and choose a command to practice."
                />
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SheetButton({ label, icon, onClick, disabled = false, tooltip = "" }) {
  const tooltipText = tooltip || label;

  return (
    <Tooltip content={tooltipText} className="w-full" side="top">
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        className="dz-touch-button dz-touch-hover group flex w-full items-center gap-2 rounded-2xl border border-doggerz-leaf/30 bg-black/40 px-3 py-3 text-left text-sm font-semibold text-doggerz-bone transition disabled:cursor-not-allowed disabled:opacity-60"
      >
        <span className="grid h-9 w-9 place-items-center rounded-xl border border-white/20 bg-black/25 text-base">
          {icon}
        </span>
        <span className="leading-tight">{label}</span>
      </button>
    </Tooltip>
  );
}

export function PottyTrainingCard({
  successCount = 0,
  goal = 1,
  progressPct = 0,
  copy = "",
}) {
  return (
    <div className="mt-2 rounded-xl border border-amber-300/35 bg-amber-400/10 px-3 py-3 text-amber-50">
      <div className="flex items-center justify-between gap-2 text-[11px] font-bold uppercase tracking-[0.16em]">
        <span>Potty Training</span>
        <span>
          {successCount}/{goal}
        </span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-black/45">
        <div
          className="h-full rounded-full bg-gradient-to-r from-amber-300 via-lime-300 to-emerald-300 transition-[width] duration-300"
          style={{ width: `${clamp(progressPct, 0, 100)}%` }}
        />
      </div>
      <div className="mt-2 text-[11px] font-semibold text-amber-100/90">
        {copy}
      </div>
    </div>
  );
}

export function ProgressionMilestoneCard({ model = null }) {
  const current = model?.current || null;
  const phases = Array.isArray(model?.phases) ? model.phases.slice(0, 7) : [];
  if (!current || !phases.length) return null;

  const toneClass =
    current.tone === "emerald"
      ? "border-emerald-300/30 bg-emerald-400/10 text-emerald-50"
      : current.tone === "sky"
        ? "border-sky-300/30 bg-sky-400/10 text-sky-50"
        : current.tone === "amber"
          ? "border-amber-300/30 bg-amber-400/10 text-amber-50"
          : "border-white/14 bg-white/5 text-doggerz-bone";

  return (
    <div className={`game-card rounded-2xl border px-4 py-4 ${toneClass}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[10px] font-bold uppercase tracking-[0.18em] opacity-80">
            Progression Milestone
          </div>
          <div className="mt-1 text-base font-black">{current.title}</div>
          <div className="mt-2 text-[11px] leading-5 opacity-90">
            {current.summary}
          </div>
        </div>
        <div className="rounded-full border border-white/15 bg-black/20 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-white/85">
          {current.statusLabel}
        </div>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-black/35">
        <div
          className="h-full rounded-full bg-white/80 transition-[width] duration-300"
          style={{ width: `${clamp(current.progressPct, 0, 100)}%` }}
        />
      </div>
      <div className="mt-3 flex gap-1.5 overflow-x-auto pb-1">
        {phases.map((phase) => (
          <div
            key={phase.id}
            className={`h-2 min-w-8 flex-1 rounded-full ${
              phase.status === "complete"
                ? "bg-emerald-300/80"
                : phase.status === "active"
                  ? "bg-sky-300/80"
                  : phase.status === "upcoming"
                    ? "bg-amber-300/55"
                    : "bg-white/18"
            }`}
            title={phase.title}
          />
        ))}
      </div>
      {model?.next?.title ? (
        <div className="mt-2 text-[10px] font-semibold uppercase tracking-[0.14em] opacity-75">
          Next: {model.next.title}
        </div>
      ) : null}
    </div>
  );
}

export function TricksOverlay({
  commands = [],
  unlockedCount = 0,
  activeCount = 0,
  activeLimit = 1,
  pendingCount = 0,
  onClose,
  onOpenLog,
  onTrainCommand,
}) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const rafId = window.requestAnimationFrame(() => {
      setIsVisible(true);
    });
    return () => {
      window.cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-40 flex items-end justify-center bg-[linear-gradient(180deg,rgba(2,6,23,0.12),rgba(2,6,23,0.72))] px-3 pb-[calc(env(safe-area-inset-bottom,0px)+16px)] pt-6"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        className={`w-full max-w-xl rounded-[28px] border border-doggerz-leaf/30 bg-[linear-gradient(180deg,rgba(2,6,23,0.97),rgba(15,23,42,0.95))] p-4 text-doggerz-bone shadow-[0_24px_64px_rgba(2,6,23,0.7)] backdrop-blur-3xl transition duration-300 ease-out ${
          isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-doggerz-paw/90">
              Tricks
            </div>
            <div className="mt-1 text-sm font-extrabold text-doggerz-bone">
              Ready: {unlockedCount}. Active lessons: {activeCount}/
              {activeLimit}
            </div>
            <div className="mt-1 text-[11px] text-doggerz-bone/65">
              {pendingCount > 0
                ? `${pendingCount} more trick${pendingCount === 1 ? "" : "s"} warming up in the queue.`
                : "Pick a ready command to practice."}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {activeCount >= activeLimit ? (
              <span className="rounded-full border border-doggerz-neon/35 bg-doggerz-neon/10 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-doggerz-neon">
                Focus Set Full
              </span>
            ) : null}
            <button
              type="button"
              onClick={onOpenLog}
              className="dz-touch-button rounded-full border border-doggerz-leaf/35 bg-doggerz-neon/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-doggerz-bone"
            >
              Training Log
            </button>
            <button
              type="button"
              onClick={onClose}
              className="dz-touch-button rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-doggerz-bone"
            >
              Close
            </button>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {commands.map((command) => (
            <button
              key={command.id}
              type="button"
              disabled={!command.unlocked}
              onClick={() => onTrainCommand(command.id)}
              className={`rounded-2xl border px-3 py-3 text-left transition ${
                command.unlocked
                  ? "border-doggerz-leaf/35 bg-doggerz-neon/10 hover:bg-doggerz-neon/15"
                  : "cursor-not-allowed border-white/10 bg-white/5 opacity-60"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-bold text-doggerz-bone">
                  {command.label}
                </span>
                <span className="rounded-full border border-white/10 bg-black/35 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-doggerz-paw/85">
                  {command.requirementLabel}
                </span>
              </div>
              <div className="mt-1 text-[11px] text-doggerz-bone/70">
                {command.helperText}
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
                <div
                  className={`h-full rounded-full transition-[width] duration-300 ${
                    command.unlocked
                      ? "bg-gradient-to-r from-doggerz-neon via-doggerz-leaf to-doggerz-sky"
                      : "bg-white/25"
                  }`}
                  style={{ width: `${clamp(command.masteryPct, 0, 100)}%` }}
                />
              </div>
              <div className="mt-2 flex items-center justify-between gap-2 text-[10px] uppercase tracking-[0.14em] text-doggerz-paw/75">
                <span>{command.group || "Trick"}</span>
                <span>{command.difficultyStars}</span>
                <span className="tabular-nums">
                  {clamp(command.masteryPct, 0, 100)}%
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export function TrainingLogOverlay({
  commands = [],
  unlockedCount = 0,
  masteredCount = 0,
  onClose,
}) {
  const masteredCommands = commands.filter((command) => command.mastered);

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/55 p-4 backdrop-blur-sm"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-2xl rounded-[28px] border border-doggerz-leaf/30 bg-[linear-gradient(180deg,rgba(2,6,23,0.97),rgba(15,23,42,0.96))] p-4 text-doggerz-bone shadow-[0_20px_50px_rgba(2,6,23,0.75)]">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.22em] text-doggerz-paw/85">
              Training Logs
            </div>
            <h3 className="mt-1 text-xl font-black tracking-tight text-doggerz-bone">
              Command Registry
            </h3>
            <div className="mt-2 flex flex-wrap gap-2 text-[10px] uppercase tracking-[0.14em]">
              <span className="rounded-full border border-doggerz-leaf/30 bg-doggerz-neon/10 px-2 py-1 text-doggerz-bone/85">
                Ready {unlockedCount}
              </span>
              <span className="rounded-full border border-amber-300/30 bg-amber-400/10 px-2 py-1 text-amber-100/90">
                Mastered {masteredCount}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="dz-touch-button rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-doggerz-bone"
          >
            Back
          </button>
        </div>
        <div className="mt-4 rounded-2xl border border-amber-300/20 bg-amber-400/10 p-3">
          <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-amber-100/80">
            Hall of Fame
          </div>
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
            {masteredCommands.length ? (
              masteredCommands.map((command) => (
                <div
                  key={`badge-${command.id}`}
                  className={`badge-icon pulse-gold badge-${command.id}`}
                  title={`Master of ${command.label}`}
                  aria-label={`Master of ${command.label}`}
                >
                  <span>
                    {String(command.label || "")
                      .slice(0, 2)
                      .toUpperCase()}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-[11px] text-amber-50/75">
                No mastered badges yet. Finish a trick to start the wall.
              </div>
            )}
          </div>
        </div>
        <div className="mt-4 max-h-[72vh] space-y-2 overflow-y-auto pr-1">
          {commands.map((command) => (
            <div
              key={command.id}
              className={`rounded-2xl border px-3 py-3 ${
                command.mastered
                  ? "border-amber-300/35 bg-amber-400/10"
                  : command.unlocked
                    ? "border-doggerz-leaf/30 bg-white/5"
                    : "border-white/10 bg-black/35"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-bold text-doggerz-bone">
                    {command.label}
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-[0.14em] text-doggerz-paw/75">
                    <span>{command.group || "Trick"}</span>
                    <span>{command.difficultyStars}</span>
                    <span>{command.requirementLabel}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-black text-doggerz-bone">
                    {command.masteryPct}%
                  </div>
                  <div className="text-[10px] uppercase tracking-[0.14em] text-doggerz-paw/70">
                    Mastery
                  </div>
                </div>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                {command.mastered ? (
                  <div className="flex h-full items-center justify-center bg-gradient-to-r from-amber-300 via-yellow-300 to-emerald-300 text-[9px] font-black uppercase tracking-[0.16em] text-slate-950">
                    Star Mastered
                  </div>
                ) : (
                  <div
                    className={`h-full rounded-full transition-[width] duration-300 ${
                      command.unlocked
                        ? "bg-gradient-to-r from-doggerz-neon via-doggerz-leaf to-doggerz-sky"
                        : "bg-white/25"
                    }`}
                    style={{ width: `${clamp(command.masteryPct, 0, 100)}%` }}
                  />
                )}
              </div>
              <div className="mt-3 text-[12px] leading-5 text-doggerz-bone/82">
                {command.summary || command.helperText}
              </div>
              <div className="mt-2 text-[11px] font-semibold text-doggerz-neonSoft">
                {command.masteryRank?.label}: {command.masteryRank?.perk}
              </div>
              <div className="mt-2 text-[11px] text-doggerz-bone/65">
                {command.helperText}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function DogStatusBubble({
  name = "Your pup",
  stageLabel = "Puppy",
  ageValue = "0w",
  moodLabel = "Calm",
  energyPct = 100,
}) {
  return (
    <Tooltip
      content={`${name} • ${stageLabel} • ${ageValue} • ${moodLabel} • ${Math.round(
        Number(energyPct || 0)
      )}% energy`}
      className="w-full"
    >
      <div className="inline-flex min-w-0 max-w-full items-center gap-3 rounded-[24px] border border-white/16 bg-[linear-gradient(180deg,rgba(15,23,42,0.74),rgba(2,6,23,0.62))] px-3 py-2 text-doggerz-bone shadow-[0_16px_40px_rgba(2,6,23,0.32)] backdrop-blur-2xl sm:px-4 sm:py-3">
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-[18px] border border-emerald-300/20 bg-[radial-gradient(circle_at_30%_30%,rgba(45,212,191,0.22),rgba(45,212,191,0.04)_64%)] text-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
          🐶
        </div>
        <div className="min-w-0">
          <div className="truncate text-sm font-black tracking-tight text-white sm:text-[15px]">
            {name}
          </div>
          <div className="mt-0.5 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-doggerz-paw/80">
            <span>{stageLabel}</span>
            <span className="text-white/25">•</span>
            <span>{ageValue}</span>
            <span className="text-white/25">•</span>
            <span>{moodLabel}</span>
          </div>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-[linear-gradient(90deg,rgba(45,212,191,0.88),rgba(110,231,183,0.98))]"
              style={{ width: `${clamp(Number(energyPct || 0), 0, 100)}%` }}
            />
          </div>
        </div>
      </div>
    </Tooltip>
  );
}

export function ModernStatusPill({
  label,
  value,
  detail = "",
  tone = "muted",
}) {
  const toneClass =
    tone === "ok"
      ? "border-emerald-300/28 bg-[linear-gradient(180deg,rgba(16,185,129,0.22),rgba(16,185,129,0.08))] text-emerald-50"
      : tone === "error"
        ? "border-rose-300/28 bg-[linear-gradient(180deg,rgba(244,63,94,0.22),rgba(244,63,94,0.08))] text-rose-50"
        : tone === "pending"
          ? "border-amber-300/28 bg-[linear-gradient(180deg,rgba(251,191,36,0.22),rgba(251,191,36,0.08))] text-amber-50"
          : tone === "sky"
            ? "border-sky-300/28 bg-[linear-gradient(180deg,rgba(56,189,248,0.22),rgba(56,189,248,0.08))] text-sky-50"
            : "border-white/14 bg-[linear-gradient(180deg,rgba(255,255,255,0.1),rgba(255,255,255,0.04))] text-white/85";

  return (
    <Tooltip
      content={detail ? `${label}: ${value} • ${detail}` : `${label}: ${value}`}
      className="w-full"
    >
      <div
        className={`inline-flex min-w-0 max-w-full items-center gap-2 rounded-full border px-3 py-2 text-right shadow-[0_16px_34px_rgba(2,6,23,0.28)] backdrop-blur-2xl ${toneClass}`}
      >
        <span className="shrink-0 text-[10px] font-black uppercase tracking-[0.16em] opacity-80">
          {label}
        </span>
        <span className="min-w-0 truncate text-[11px] font-bold sm:text-xs">
          {value}
        </span>
      </div>
    </Tooltip>
  );
}

export function StatBarCard({
  label,
  value,
  color,
  critical = false,
  popped = false,
}) {
  const pct = clamp(Number(value || 0), 0, 100);

  return (
    <div
      className={`game-card stat-bar-card ${critical ? "critical-warning" : ""} ${
        popped ? "stat-pop" : ""
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="env-label !mb-0">{label}</span>
        <span className="env-label !mb-0 !text-[var(--text-main)]">{pct}%</span>
      </div>
      <div className="stat-bar-container">
        <div
          className="stat-bar-fill"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

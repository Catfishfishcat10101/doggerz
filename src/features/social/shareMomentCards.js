import { Capacitor } from "@capacitor/core";

const DEFAULT_SHARE_URL = "https://doggerz.app";

function titleize(value, fallback = "Doggerz moment") {
  const input = String(value || "").trim();
  if (!input) return fallback;
  return input
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function normalizeStageLabel(value, fallback = "Puppy") {
  const raw = String(value || "").trim();
  return raw || fallback;
}

export function isShareableMemoryMoment(moment) {
  const type = String(moment?.type || "")
    .trim()
    .toLowerCase();
  return [
    "first_level_up",
    "treasure_found",
    "midnight_zoomies",
    "trick_mastered",
  ].includes(type);
}

export function buildShareMomentCard(momentLike, context = {}) {
  const dogName = String(context?.dogName || "My pup").trim() || "My pup";
  const stageLabel = normalizeStageLabel(context?.stageLabel, "Puppy");
  const level = Math.max(1, Math.floor(Number(context?.level || 1)));
  const bondPct = Math.max(0, Math.round(Number(context?.bondPct || 0)));
  const energyPct = Math.max(0, Math.round(Number(context?.energyPct || 0)));
  const type = String(momentLike?.type || momentLike?.kind || "pup")
    .trim()
    .toLowerCase();
  const id = String(momentLike?.id || `${type}:${Date.now()}`).trim();

  const base = {
    id,
    kind: type,
    eyebrow: "Doggerz Moment",
    title: `${dogName} in Doggerz`,
    body: `${dogName} is growing into a great companion.`,
    accent: "emerald",
    stats: [
      { label: "Level", value: `Lv ${level}` },
      { label: "Stage", value: stageLabel },
      { label: "Bond", value: `${bondPct}%` },
    ],
    shareTitle: "My Doggerz moment",
    shareText: `Checking in with ${dogName} in Doggerz. Lv ${level}, ${bondPct}% bond, ${energyPct}% energy.`,
  };

  if (type === "first_level_up") {
    const nextLevel = Math.max(
      2,
      Math.floor(Number(momentLike?.payload?.level || level || 2))
    );
    return {
      ...base,
      eyebrow: "Level Up",
      title: `${dogName} reached Level ${nextLevel}`,
      body: "The routine is paying off. Small daily care turned into real progress.",
      accent: "amber",
      stats: [
        { label: "Level", value: `Lv ${nextLevel}` },
        { label: "Stage", value: stageLabel },
        { label: "Energy", value: `${energyPct}%` },
      ],
      shareTitle: `${dogName} leveled up in Doggerz`,
      shareText: `${dogName} just reached Level ${nextLevel} in Doggerz. Calm care, steady progress, one very good dog.`,
    };
  }

  if (type === "trick_mastered") {
    const commandLabel = titleize(momentLike?.payload?.commandLabel, "A trick");
    return {
      ...base,
      eyebrow: "Mastery",
      title: `${dogName} mastered ${commandLabel}`,
      body: "A little patience and repetition turned into a clean, confident trick.",
      accent: "sky",
      stats: [
        { label: "Trick", value: commandLabel },
        { label: "Level", value: `Lv ${level}` },
        { label: "Bond", value: `${bondPct}%` },
      ],
      shareTitle: `${dogName} mastered ${commandLabel}`,
      shareText: `${dogName} just mastered ${commandLabel} in Doggerz. Tiny training sessions, real payoff.`,
    };
  }

  if (type === "treasure_found") {
    const rewardName = titleize(
      momentLike?.payload?.rewardName || momentLike?.payload?.rewardId,
      "A tiny treasure"
    );
    return {
      ...base,
      eyebrow: "Funny Moment",
      title: `${dogName} dug up ${rewardName}`,
      body: "One of those weird little yard moments that only makes sense once you love this dog.",
      accent: "amber",
      stats: [
        { label: "Find", value: rewardName },
        { label: "Stage", value: stageLabel },
        { label: "Bond", value: `${bondPct}%` },
      ],
      shareTitle: `${dogName} found ${rewardName}`,
      shareText: `${dogName} followed a scent trail and found ${rewardName} in Doggerz. Terrier logic wins again.`,
    };
  }

  if (type === "midnight_zoomies") {
    return {
      ...base,
      eyebrow: "Funny Moment",
      title: `${dogName} got midnight zoomies`,
      body: "A perfect small chaos moment. Brief, dramatic, and very on-brand.",
      accent: "rose",
      stats: [
        { label: "Mood", value: "Zoomies" },
        { label: "Level", value: `Lv ${level}` },
        { label: "Energy", value: `${energyPct}%` },
      ],
      shareTitle: `${dogName} got the midnight zoomies`,
      shareText: `${dogName} just hit a midnight zoomies burst in Doggerz. Calm game, occasional chaos.`,
    };
  }

  if (type === "growth_milestone") {
    const toStage = normalizeStageLabel(momentLike?.toStage, stageLabel);
    const fromStage = normalizeStageLabel(momentLike?.fromStage, "Puppy");
    return {
      ...base,
      eyebrow: "Milestone",
      title: `${dogName} grew from ${fromStage} to ${toStage}`,
      body: "This is the kind of progress that makes the dog feel like a real long-term companion.",
      accent: "emerald",
      stats: [
        { label: "From", value: fromStage },
        { label: "To", value: toStage },
        { label: "Level", value: `Lv ${level}` },
      ],
      shareTitle: `${dogName} hit a Doggerz milestone`,
      shareText: `${dogName} just hit a new life-stage milestone in Doggerz: ${fromStage} to ${toStage}.`,
    };
  }

  return base;
}

export function buildGenericPupShareCard(context = {}) {
  return {
    ...buildShareMomentCard({ id: "share_pup", type: "pup" }, context),
    rewardEligible: true,
  };
}

export async function shareDoggerzMoment(card, { shareUrl, onCopied } = {}) {
  const url = String(shareUrl || DEFAULT_SHARE_URL).trim() || DEFAULT_SHARE_URL;
  const title = String(card?.shareTitle || card?.title || "Doggerz");
  const text = String(
    card?.shareText || card?.body || "Sharing a Doggerz moment."
  );

  if (Capacitor.getPlatform?.() !== "web") {
    try {
      const { Share } = await import("@capacitor/share");
      await Share.share({
        title,
        text,
        url,
        dialogTitle: "Share your Doggerz moment",
      });
      return true;
    } catch {
      // Fall through to web-style sharing/copy.
    }
  }

  if (typeof navigator !== "undefined" && navigator.share) {
    await navigator.share({
      title,
      text: `${text} ${url}`.trim(),
    });
    return true;
  }

  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(`${text} ${url}`.trim());
    if (typeof onCopied === "function") onCopied();
    return true;
  }

  throw new Error("sharing_unavailable");
}

/** @format */

// src/redux/settingsSlice.js

import { createSlice } from "@reduxjs/toolkit";

const SETTINGS_STORAGE_KEY = "doggerz:settingsState";

const loadFromStorage = () => {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    console.warn("[settingsSlice] Failed to parse settings from storage:", e);
    return null;
  }
};

const saveToStorage = (state) => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn("[settingsSlice] Failed to save settings to storage:", e);
  }
};

const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));

function normalizeTrainingInputMode(value, fallback = "both") {
  const v = String(value || "").toLowerCase();
  if (v === "buttons" || v === "voice" || v === "both") return v;
  return fallback;
}

function normalizeLoadedSettings(raw) {
  if (!raw || typeof raw !== "object") return null;

  const next = { ...raw };

  // New setting with backward-compatible default derived from legacy toggle.
  if (!next.trainingInputMode) {
    next.trainingInputMode = next.voiceCommandsEnabled ? "both" : "buttons";
  }
  next.trainingInputMode = normalizeTrainingInputMode(next.trainingInputMode);
  next.voiceCommandsEnabled =
    next.trainingInputMode === "voice" || next.trainingInputMode === "both";

  // Game UI
  next.showGameMicroHud = next.showGameMicroHud !== false;
  next.showCritters = next.showCritters !== false;
  next.roamIntensity = clamp(Number(next.roamIntensity ?? 1), 0, 1);
  next.showWeatherFx = next.showWeatherFx !== false;
  next.showBackgroundPhotos = next.showBackgroundPhotos !== false;
  next.showSceneVignette = next.showSceneVignette !== false;
  next.showSceneGrain = next.showSceneGrain !== false;

  // Store UI
  next.storeHoverPreview = next.storeHoverPreview !== false;
  next.storeShowEquippedFirst = next.storeShowEquippedFirst !== false;
  next.storeCompactCards = Boolean(next.storeCompactCards);
  const storeSortKey = String(next.storeSortKey || "recommended").toLowerCase();
  next.storeSortKey = ["recommended", "price", "threshold", "alpha"].includes(
    storeSortKey
  )
    ? storeSortKey
    : "recommended";

  // Potty UI
  next.pottyAutoReturn = Boolean(next.pottyAutoReturn);
  next.pottyConfirmAccidents = next.pottyConfirmAccidents !== false;
  next.pottyShowXpTools = Boolean(next.pottyShowXpTools);
  next.pottyTipsExpanded = next.pottyTipsExpanded !== false;

  // Dreams UI
  const dreamKind = String(next.dreamJournalKind || "all").toLowerCase();
  next.dreamJournalKind = ["all", "lucid", "nightmare", "dream"].includes(
    dreamKind
  )
    ? dreamKind
    : "all";
  const dreamSort = String(next.dreamJournalSort || "newest").toLowerCase();
  next.dreamJournalSort = ["newest", "oldest"].includes(dreamSort)
    ? dreamSort
    : "newest";
  next.dreamJournalShowMotifs = next.dreamJournalShowMotifs !== false;
  next.dreamJournalShowSummary = next.dreamJournalShowSummary !== false;
  next.dreamJournalShowTimestamp = next.dreamJournalShowTimestamp !== false;
  next.dreamJournalCompactCards = Boolean(next.dreamJournalCompactCards);
  next.dreamSequenceShowMotifs = next.dreamSequenceShowMotifs !== false;
  next.dreamSequenceShowTip = next.dreamSequenceShowTip !== false;
  next.dreamSequenceAutoDismiss = Boolean(next.dreamSequenceAutoDismiss);
  next.dreamSequenceBackdropFx = next.dreamSequenceBackdropFx !== false;

  // FAQ UI
  next.faqCompactView = Boolean(next.faqCompactView);

  // Badges UI
  const badgeGroup = String(next.badgesGroupFilter || "all").toLowerCase();
  next.badgesGroupFilter = ["all", "tricks", "cosmetics", "other"].includes(
    badgeGroup
  )
    ? badgeGroup
    : "all";
  next.badgesCompactChips = Boolean(next.badgesCompactChips);
  next.badgesShowIds = Boolean(next.badgesShowIds);

  // Skill tree UI
  const treeBranch = String(next.skillTreeBranch || "all").toLowerCase();
  next.skillTreeBranch = ["all", "companion", "guardian", "athlete"].includes(
    treeBranch
  )
    ? treeBranch
    : "all";
  next.skillTreeShowUnlockedOnly = Boolean(next.skillTreeShowUnlockedOnly);
  next.skillTreeCompactCards = Boolean(next.skillTreeCompactCards);

  // Game top bar UI
  next.topBarCompact = Boolean(next.topBarCompact);
  next.topBarShowXp = next.topBarShowXp !== false;
  next.topBarShowStats = next.topBarShowStats !== false;
  next.topBarShowBadges = next.topBarShowBadges !== false;
  next.topBarShowQuickLinks = next.topBarShowQuickLinks !== false;

  // Mechanics panel UI
  next.mechanicsCompact = Boolean(next.mechanicsCompact);
  next.mechanicsShowTips = next.mechanicsShowTips !== false;
  next.mechanicsShowStats = next.mechanicsShowStats !== false;
  next.mechanicsShowUnlockLine = next.mechanicsShowUnlockLine !== false;

  // Trait impact UI
  next.traitImpactCompact = Boolean(next.traitImpactCompact);
  next.traitImpactShowMeter = next.traitImpactShowMeter !== false;
  next.traitImpactShowTips = next.traitImpactShowTips !== false;
  next.traitImpactShowHighlights = next.traitImpactShowHighlights !== false;

  // Dog canvas UI
  next.dogCanvasMotion = next.dogCanvasMotion !== false;
  next.dogCanvasShadow = next.dogCanvasShadow !== false;
  const dogCanvasScale = String(next.dogCanvasScale || "normal").toLowerCase();
  next.dogCanvasScale = ["small", "normal", "large"].includes(dogCanvasScale)
    ? dogCanvasScale
    : "normal";

  // Dog Pixi UI
  next.dogPixiMotion = next.dogPixiMotion !== false;
  const dogPixiScale = String(next.dogPixiScale || "normal").toLowerCase();
  next.dogPixiScale = ["small", "normal", "large"].includes(dogPixiScale)
    ? dogPixiScale
    : "normal";
  const dogPixiQuality = String(next.dogPixiQuality || "auto").toLowerCase();
  next.dogPixiQuality = ["auto", "low", "high"].includes(dogPixiQuality)
    ? dogPixiQuality
    : "auto";

  // Sprite sheet UI
  next.spriteSheetMotion = next.spriteSheetMotion !== false;
  next.spriteSheetUsePixelated = Boolean(next.spriteSheetUsePixelated);
  const spriteSheetSize = String(
    next.spriteSheetSize || "normal"
  ).toLowerCase();
  next.spriteSheetSize = ["small", "normal", "large"].includes(spriteSheetSize)
    ? spriteSheetSize
    : "normal";

  // PixiDog UI
  next.pixiDogMotion = next.pixiDogMotion !== false;
  next.pixiDogShowHearts = next.pixiDogShowHearts !== false;
  next.pixiDogShowShadow = next.pixiDogShowShadow !== false;
  const pixiDogQuality = String(next.pixiDogQuality || "auto").toLowerCase();
  next.pixiDogQuality = ["auto", "low", "high"].includes(pixiDogQuality)
    ? pixiDogQuality
    : "auto";

  // Game effects UI
  next.gameFxSkillPulse = next.gameFxSkillPulse !== false;
  next.gameFxStoryGlow = next.gameFxStoryGlow !== false;
  next.gameFxBranchAccent = next.gameFxBranchAccent !== false;

  // Cosmetics overlay UI
  next.cosmeticsOverlayShowLabels = next.cosmeticsOverlayShowLabels !== false;
  next.cosmeticsOverlayShowPreviewTags =
    next.cosmeticsOverlayShowPreviewTags !== false;
  const cosmeticsOverlayPosition = String(
    next.cosmeticsOverlayPosition || "top-left"
  ).toLowerCase();
  next.cosmeticsOverlayPosition = [
    "top-left",
    "top-right",
    "bottom-left",
    "bottom-right",
  ].includes(cosmeticsOverlayPosition)
    ? cosmeticsOverlayPosition
    : "top-left";

  // Training UI
  next.trainingShowLocked = next.trainingShowLocked !== false;
  next.trainingCompactCards = Boolean(next.trainingCompactCards);
  next.trainingShowDetails = next.trainingShowDetails !== false;
  const trainingSortKey = String(
    next.trainingSortKey || "status"
  ).toLowerCase();
  next.trainingSortKey = ["status", "alpha"].includes(trainingSortKey)
    ? trainingSortKey
    : "status";

  // Haptics (mobile vibration)
  next.hapticsEnabled = next.hapticsEnabled !== false;
  next.dailyRemindersEnabled = next.dailyRemindersEnabled !== false;

  // Ensure nested audio exists
  next.audio = {
    enabled: true,
    masterVolume: 0.8,
    musicVolume: 0.5,
    sfxVolume: 0.7,
    sleepEnabled: true,
    sleepVolume: 0.25,
    ...(next.audio || {}),
  };
  next.audio.enabled = Boolean(next.audio.enabled);
  next.audio.masterVolume = clamp(Number(next.audio.masterVolume ?? 0.8), 0, 1);
  next.audio.musicVolume = clamp(Number(next.audio.musicVolume ?? 0.5), 0, 1);
  next.audio.sfxVolume = clamp(Number(next.audio.sfxVolume ?? 0.7), 0, 1);
  next.audio.sleepEnabled = Boolean(next.audio.sleepEnabled);
  next.audio.sleepVolume = clamp(Number(next.audio.sleepVolume ?? 0.25), 0, 1);

  // Performance
  const perfMode = String(next.perfMode || "auto").toLowerCase();
  next.perfMode = ["auto", "on", "off"].includes(perfMode) ? perfMode : "auto";

  return next;
}

const initialState = normalizeLoadedSettings(loadFromStorage()) || {
  // Theme: system | dark | light
  theme: "system",

  // Accessibility
  reduceMotion: "system", // system | on | off
  highContrast: false,
  reduceTransparency: false,
  focusRings: "auto", // auto | always
  hitTargets: "auto", // auto | large
  fontScale: 1, // 0.9–1.15

  // UI preferences
  showHints: true,
  dailyRemindersEnabled: true,

  // Haptics
  hapticsEnabled: true,

  // Game UI
  showGameMicroHud: true,
  showCritters: true,
  roamIntensity: 1,
  showWeatherFx: true,
  showBackgroundPhotos: true,
  showSceneVignette: true,
  showSceneGrain: true,

  // Store UI
  storeHoverPreview: true,
  storeShowEquippedFirst: true,
  storeCompactCards: false,
  storeSortKey: "recommended",

  // Potty UI
  pottyAutoReturn: false,
  pottyConfirmAccidents: true,
  pottyShowXpTools: false,
  pottyTipsExpanded: true,

  // Dreams UI
  dreamJournalKind: "all",
  dreamJournalSort: "newest",
  dreamJournalShowMotifs: true,
  dreamJournalShowSummary: true,
  dreamJournalShowTimestamp: true,
  dreamJournalCompactCards: false,
  dreamSequenceShowMotifs: true,
  dreamSequenceShowTip: true,
  dreamSequenceAutoDismiss: false,
  dreamSequenceBackdropFx: true,

  // FAQ UI
  faqCompactView: false,

  // Badges UI
  badgesGroupFilter: "all",
  badgesCompactChips: false,
  badgesShowIds: false,

  // Skill tree UI
  skillTreeBranch: "all",
  skillTreeShowUnlockedOnly: false,
  skillTreeCompactCards: false,

  // Game top bar UI
  topBarCompact: false,
  topBarShowXp: true,
  topBarShowStats: true,
  topBarShowBadges: true,
  topBarShowQuickLinks: true,

  // Mechanics panel UI
  mechanicsCompact: false,
  mechanicsShowTips: true,
  mechanicsShowStats: true,
  mechanicsShowUnlockLine: true,

  // Trait impact UI
  traitImpactCompact: false,
  traitImpactShowMeter: true,
  traitImpactShowTips: true,
  traitImpactShowHighlights: true,

  // Dog canvas UI
  dogCanvasMotion: true,
  dogCanvasShadow: true,
  dogCanvasScale: "normal",

  // Dog Pixi UI
  dogPixiMotion: true,
  dogPixiScale: "normal",
  dogPixiQuality: "auto",

  // Sprite sheet UI
  spriteSheetMotion: true,
  spriteSheetUsePixelated: false,
  spriteSheetSize: "normal",

  // PixiDog UI
  pixiDogMotion: true,
  pixiDogShowHearts: true,
  pixiDogShowShadow: true,
  pixiDogQuality: "auto",

  // Game effects UI
  gameFxSkillPulse: true,
  gameFxStoryGlow: true,
  gameFxBranchAccent: true,

  // Cosmetics overlay UI
  cosmeticsOverlayShowLabels: true,
  cosmeticsOverlayShowPreviewTags: true,
  cosmeticsOverlayPosition: "top-left",

  // Training UI
  trainingShowLocked: true,
  trainingCompactCards: false,
  trainingShowDetails: true,
  trainingSortKey: "status",

  // Performance
  // Battery-friendly mode: reduce heavy visual effects (canvas particles, ambient animations, etc.)
  batterySaver: false,

  // Extra perf mode (separate from accessibility reduce-motion)
  // - auto: reduce effects on low-power devices/hints
  // - on: always reduce effects
  // - off: never auto-reduce (batterySaver can still be used manually)
  perfMode: "auto",

  // Input / features
  voiceCommandsEnabled: false,
  trainingInputMode: "both",

  // Audio (not all screens use this yet, but we persist it for future wiring)
  audio: {
    enabled: true,
    masterVolume: 0.8,
    musicVolume: 0.5,
    sfxVolume: 0.7,
    sleepEnabled: true,
    sleepVolume: 0.25,
  },

  // Safety
  confirmDangerousActions: true,
};

const settingsSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {
    setPerfMode(state, action) {
      const mode = String(action.payload || "").toLowerCase();
      if (!["auto", "on", "off"].includes(mode)) return;
      state.perfMode = mode;
      saveToStorage(state);
    },
    setTheme(state, action) {
      const mode = String(action.payload || "").toLowerCase();
      if (!["system", "dark", "light"].includes(mode)) return;
      state.theme = mode;
      saveToStorage(state);
    },

    setReduceMotion(state, action) {
      const mode = String(action.payload || "").toLowerCase();
      if (!["system", "on", "off"].includes(mode)) return;
      state.reduceMotion = mode;
      saveToStorage(state);
    },

    setHighContrast(state, action) {
      state.highContrast = Boolean(action.payload);
      saveToStorage(state);
    },

    setReduceTransparency(state, action) {
      state.reduceTransparency = Boolean(action.payload);
      saveToStorage(state);
    },

    setFocusRings(state, action) {
      const mode = String(action.payload || "").toLowerCase();
      if (!["auto", "always"].includes(mode)) return;
      state.focusRings = mode;
      saveToStorage(state);
    },

    setHitTargets(state, action) {
      const mode = String(action.payload || "").toLowerCase();
      if (!["auto", "large"].includes(mode)) return;
      state.hitTargets = mode;
      saveToStorage(state);
    },

    setFontScale(state, action) {
      const raw = Number(action.payload);
      if (!Number.isFinite(raw)) return;
      state.fontScale = clamp(raw, 0.9, 1.15);
      saveToStorage(state);
    },

    setShowHints(state, action) {
      state.showHints = Boolean(action.payload);
      saveToStorage(state);
    },

    setDailyRemindersEnabled(state, action) {
      state.dailyRemindersEnabled = Boolean(action.payload);
      saveToStorage(state);
    },

    setHapticsEnabled(state, action) {
      state.hapticsEnabled = Boolean(action.payload);
      saveToStorage(state);
    },

    setBatterySaver(state, action) {
      state.batterySaver = Boolean(action.payload);
      saveToStorage(state);
    },

    setVoiceCommandsEnabled(state, action) {
      const enabled = Boolean(action.payload);
      state.voiceCommandsEnabled = enabled;
      // Keep new setting in sync.
      const currentMode = normalizeTrainingInputMode(
        state.trainingInputMode,
        enabled ? "both" : "buttons"
      );
      if (!enabled && (currentMode === "voice" || currentMode === "both")) {
        state.trainingInputMode = "buttons";
      }
      if (enabled && currentMode === "buttons") {
        state.trainingInputMode = "both";
      }
      saveToStorage(state);
    },

    setTrainingInputMode(state, action) {
      const mode = normalizeTrainingInputMode(
        action.payload,
        state.trainingInputMode
      );
      state.trainingInputMode = mode;
      state.voiceCommandsEnabled = mode === "voice" || mode === "both";
      saveToStorage(state);
    },

    setShowGameMicroHud(state, action) {
      state.showGameMicroHud = Boolean(action.payload);
      saveToStorage(state);
    },

    setShowCritters(state, action) {
      state.showCritters = Boolean(action.payload);
      saveToStorage(state);
    },

    setRoamIntensity(state, action) {
      const raw = Number(action.payload);
      if (!Number.isFinite(raw)) return;
      state.roamIntensity = clamp(raw, 0, 1);
      saveToStorage(state);
    },
    setStoreHoverPreview(state, action) {
      state.storeHoverPreview = Boolean(action.payload);
      saveToStorage(state);
    },
    setStoreShowEquippedFirst(state, action) {
      state.storeShowEquippedFirst = Boolean(action.payload);
      saveToStorage(state);
    },
    setStoreCompactCards(state, action) {
      state.storeCompactCards = Boolean(action.payload);
      saveToStorage(state);
    },
    setStoreSortKey(state, action) {
      const mode = String(action.payload || "").toLowerCase();
      if (!["recommended", "price", "threshold", "alpha"].includes(mode))
        return;
      state.storeSortKey = mode;
      saveToStorage(state);
    },
    setPottyAutoReturn(state, action) {
      state.pottyAutoReturn = Boolean(action.payload);
      saveToStorage(state);
    },
    setPottyConfirmAccidents(state, action) {
      state.pottyConfirmAccidents = Boolean(action.payload);
      saveToStorage(state);
    },
    setPottyShowXpTools(state, action) {
      state.pottyShowXpTools = Boolean(action.payload);
      saveToStorage(state);
    },
    setPottyTipsExpanded(state, action) {
      state.pottyTipsExpanded = Boolean(action.payload);
      saveToStorage(state);
    },
    setDreamJournalKind(state, action) {
      const value = String(action.payload || "").toLowerCase();
      if (!["all", "lucid", "nightmare", "dream"].includes(value)) return;
      state.dreamJournalKind = value;
      saveToStorage(state);
    },
    setDreamJournalSort(state, action) {
      const value = String(action.payload || "").toLowerCase();
      if (!["newest", "oldest"].includes(value)) return;
      state.dreamJournalSort = value;
      saveToStorage(state);
    },
    setDreamJournalShowMotifs(state, action) {
      state.dreamJournalShowMotifs = Boolean(action.payload);
      saveToStorage(state);
    },
    setDreamJournalShowSummary(state, action) {
      state.dreamJournalShowSummary = Boolean(action.payload);
      saveToStorage(state);
    },
    setDreamJournalShowTimestamp(state, action) {
      state.dreamJournalShowTimestamp = Boolean(action.payload);
      saveToStorage(state);
    },
    setDreamSequenceShowMotifs(state, action) {
      state.dreamSequenceShowMotifs = Boolean(action.payload);
      saveToStorage(state);
    },
    setDreamSequenceShowTip(state, action) {
      state.dreamSequenceShowTip = Boolean(action.payload);
      saveToStorage(state);
    },
    setDreamSequenceAutoDismiss(state, action) {
      state.dreamSequenceAutoDismiss = Boolean(action.payload);
      saveToStorage(state);
    },
    setDreamSequenceBackdropFx(state, action) {
      state.dreamSequenceBackdropFx = Boolean(action.payload);
      saveToStorage(state);
    },
    setDreamJournalCompactCards(state, action) {
      state.dreamJournalCompactCards = Boolean(action.payload);
      saveToStorage(state);
    },
    setFaqCompactView(state, action) {
      state.faqCompactView = Boolean(action.payload);
      saveToStorage(state);
    },
    setBadgesGroupFilter(state, action) {
      const value = String(action.payload || "").toLowerCase();
      if (!["all", "tricks", "cosmetics", "other"].includes(value)) return;
      state.badgesGroupFilter = value;
      saveToStorage(state);
    },
    setBadgesCompactChips(state, action) {
      state.badgesCompactChips = Boolean(action.payload);
      saveToStorage(state);
    },
    setBadgesShowIds(state, action) {
      state.badgesShowIds = Boolean(action.payload);
      saveToStorage(state);
    },
    setSkillTreeBranch(state, action) {
      const value = String(action.payload || "").toLowerCase();
      if (!["all", "companion", "guardian", "athlete"].includes(value)) return;
      state.skillTreeBranch = value;
      saveToStorage(state);
    },
    setSkillTreeShowUnlockedOnly(state, action) {
      state.skillTreeShowUnlockedOnly = Boolean(action.payload);
      saveToStorage(state);
    },
    setSkillTreeCompactCards(state, action) {
      state.skillTreeCompactCards = Boolean(action.payload);
      saveToStorage(state);
    },
    setTopBarCompact(state, action) {
      state.topBarCompact = Boolean(action.payload);
      saveToStorage(state);
    },
    setTopBarShowXp(state, action) {
      state.topBarShowXp = Boolean(action.payload);
      saveToStorage(state);
    },
    setTopBarShowStats(state, action) {
      state.topBarShowStats = Boolean(action.payload);
      saveToStorage(state);
    },
    setTopBarShowBadges(state, action) {
      state.topBarShowBadges = Boolean(action.payload);
      saveToStorage(state);
    },
    setTopBarShowQuickLinks(state, action) {
      state.topBarShowQuickLinks = Boolean(action.payload);
      saveToStorage(state);
    },
    setMechanicsCompact(state, action) {
      state.mechanicsCompact = Boolean(action.payload);
      saveToStorage(state);
    },
    setMechanicsShowTips(state, action) {
      state.mechanicsShowTips = Boolean(action.payload);
      saveToStorage(state);
    },
    setMechanicsShowStats(state, action) {
      state.mechanicsShowStats = Boolean(action.payload);
      saveToStorage(state);
    },
    setMechanicsShowUnlockLine(state, action) {
      state.mechanicsShowUnlockLine = Boolean(action.payload);
      saveToStorage(state);
    },
    setTraitImpactCompact(state, action) {
      state.traitImpactCompact = Boolean(action.payload);
      saveToStorage(state);
    },
    setTraitImpactShowMeter(state, action) {
      state.traitImpactShowMeter = Boolean(action.payload);
      saveToStorage(state);
    },
    setTraitImpactShowTips(state, action) {
      state.traitImpactShowTips = Boolean(action.payload);
      saveToStorage(state);
    },
    setTraitImpactShowHighlights(state, action) {
      state.traitImpactShowHighlights = Boolean(action.payload);
      saveToStorage(state);
    },
    setDogCanvasMotion(state, action) {
      state.dogCanvasMotion = Boolean(action.payload);
      saveToStorage(state);
    },
    setDogCanvasShadow(state, action) {
      state.dogCanvasShadow = Boolean(action.payload);
      saveToStorage(state);
    },
    setDogCanvasScale(state, action) {
      const value = String(action.payload || "").toLowerCase();
      if (!["small", "normal", "large"].includes(value)) return;
      state.dogCanvasScale = value;
      saveToStorage(state);
    },
    setDogPixiMotion(state, action) {
      state.dogPixiMotion = Boolean(action.payload);
      saveToStorage(state);
    },
    setDogPixiScale(state, action) {
      const value = String(action.payload || "").toLowerCase();
      if (!["small", "normal", "large"].includes(value)) return;
      state.dogPixiScale = value;
      saveToStorage(state);
    },
    setDogPixiQuality(state, action) {
      const value = String(action.payload || "").toLowerCase();
      if (!["auto", "low", "high"].includes(value)) return;
      state.dogPixiQuality = value;
      saveToStorage(state);
    },
    setSpriteSheetMotion(state, action) {
      state.spriteSheetMotion = Boolean(action.payload);
      saveToStorage(state);
    },
    setSpriteSheetUsePixelated(state, action) {
      state.spriteSheetUsePixelated = Boolean(action.payload);
      saveToStorage(state);
    },
    setSpriteSheetSize(state, action) {
      const value = String(action.payload || "").toLowerCase();
      if (!["small", "normal", "large"].includes(value)) return;
      state.spriteSheetSize = value;
      saveToStorage(state);
    },
    setPixiDogMotion(state, action) {
      state.pixiDogMotion = Boolean(action.payload);
      saveToStorage(state);
    },
    setPixiDogShowHearts(state, action) {
      state.pixiDogShowHearts = Boolean(action.payload);
      saveToStorage(state);
    },
    setPixiDogShowShadow(state, action) {
      state.pixiDogShowShadow = Boolean(action.payload);
      saveToStorage(state);
    },
    setPixiDogQuality(state, action) {
      const value = String(action.payload || "").toLowerCase();
      if (!["auto", "low", "high"].includes(value)) return;
      state.pixiDogQuality = value;
      saveToStorage(state);
    },
    setGameFxSkillPulse(state, action) {
      state.gameFxSkillPulse = Boolean(action.payload);
      saveToStorage(state);
    },
    setGameFxStoryGlow(state, action) {
      state.gameFxStoryGlow = Boolean(action.payload);
      saveToStorage(state);
    },
    setGameFxBranchAccent(state, action) {
      state.gameFxBranchAccent = Boolean(action.payload);
      saveToStorage(state);
    },
    setCosmeticsOverlayShowLabels(state, action) {
      state.cosmeticsOverlayShowLabels = Boolean(action.payload);
      saveToStorage(state);
    },
    setCosmeticsOverlayShowPreviewTags(state, action) {
      state.cosmeticsOverlayShowPreviewTags = Boolean(action.payload);
      saveToStorage(state);
    },
    setCosmeticsOverlayPosition(state, action) {
      const value = String(action.payload || "").toLowerCase();
      if (
        !["top-left", "top-right", "bottom-left", "bottom-right"].includes(
          value
        )
      )
        return;
      state.cosmeticsOverlayPosition = value;
      saveToStorage(state);
    },
    setTrainingShowLocked(state, action) {
      state.trainingShowLocked = Boolean(action.payload);
      saveToStorage(state);
    },
    setTrainingCompactCards(state, action) {
      state.trainingCompactCards = Boolean(action.payload);
      saveToStorage(state);
    },
    setTrainingShowDetails(state, action) {
      state.trainingShowDetails = Boolean(action.payload);
      saveToStorage(state);
    },
    setTrainingSortKey(state, action) {
      const value = String(action.payload || "").toLowerCase();
      if (!["status", "alpha"].includes(value)) return;
      state.trainingSortKey = value;
      saveToStorage(state);
    },
    setShowWeatherFx(state, action) {
      state.showWeatherFx = Boolean(action.payload);
      saveToStorage(state);
    },
    setShowBackgroundPhotos(state, action) {
      state.showBackgroundPhotos = Boolean(action.payload);
      saveToStorage(state);
    },
    setShowSceneVignette(state, action) {
      state.showSceneVignette = Boolean(action.payload);
      saveToStorage(state);
    },
    setShowSceneGrain(state, action) {
      state.showSceneGrain = Boolean(action.payload);
      saveToStorage(state);
    },

    setAudioEnabled(state, action) {
      state.audio.enabled = Boolean(action.payload);
      saveToStorage(state);
    },

    setMasterVolume(state, action) {
      const raw = Number(action.payload);
      if (!Number.isFinite(raw)) return;
      state.audio.masterVolume = clamp(raw, 0, 1);
      saveToStorage(state);
    },

    setMusicVolume(state, action) {
      const raw = Number(action.payload);
      if (!Number.isFinite(raw)) return;
      state.audio.musicVolume = clamp(raw, 0, 1);
      saveToStorage(state);
    },

    setSfxVolume(state, action) {
      const raw = Number(action.payload);
      if (!Number.isFinite(raw)) return;
      state.audio.sfxVolume = clamp(raw, 0, 1);
      saveToStorage(state);
    },

    setSleepAudioEnabled(state, action) {
      state.audio.sleepEnabled = Boolean(action.payload);
      saveToStorage(state);
    },

    setSleepVolume(state, action) {
      const raw = Number(action.payload);
      if (!Number.isFinite(raw)) return;
      state.audio.sleepVolume = clamp(raw, 0, 1);
      saveToStorage(state);
    },

    setConfirmDangerousActions(state, action) {
      state.confirmDangerousActions = Boolean(action.payload);
      saveToStorage(state);
    },

    hydrateSettings(state, action) {
      if (!action.payload || typeof action.payload !== "object") return;
      // Shallow merge + nested audio merge.
      const merged = { ...state, ...action.payload };
      merged.audio = { ...state.audio, ...(action.payload.audio || {}) };
      const next = normalizeLoadedSettings(merged) || merged;

      state.theme = next.theme;
      state.reduceMotion = next.reduceMotion;
      state.highContrast = Boolean(next.highContrast);
      state.reduceTransparency = Boolean(next.reduceTransparency);
      state.focusRings = next.focusRings;
      state.hitTargets = next.hitTargets;
      state.fontScale = clamp(Number(next.fontScale ?? 1), 0.9, 1.15);

      state.perfMode = next.perfMode || state.perfMode || "auto";
      state.showHints = Boolean(next.showHints);
      state.dailyRemindersEnabled = next.dailyRemindersEnabled !== false;

      state.showGameMicroHud = next.showGameMicroHud !== false;
      state.showCritters = next.showCritters !== false;
      state.roamIntensity = clamp(Number(next.roamIntensity ?? 1), 0, 1);
      state.batterySaver = Boolean(next.batterySaver);
      state.showWeatherFx = next.showWeatherFx !== false;
      state.showBackgroundPhotos = next.showBackgroundPhotos !== false;
      state.showSceneVignette = next.showSceneVignette !== false;
      state.showSceneGrain = next.showSceneGrain !== false;
      state.storeHoverPreview = next.storeHoverPreview !== false;
      state.storeShowEquippedFirst = next.storeShowEquippedFirst !== false;
      state.storeCompactCards = Boolean(next.storeCompactCards);
      state.storeSortKey = next.storeSortKey || "recommended";
      state.pottyAutoReturn = Boolean(next.pottyAutoReturn);
      state.pottyConfirmAccidents = next.pottyConfirmAccidents !== false;
      state.pottyShowXpTools = Boolean(next.pottyShowXpTools);
      state.pottyTipsExpanded = next.pottyTipsExpanded !== false;
      state.dreamJournalKind = next.dreamJournalKind || "all";
      state.dreamJournalSort = next.dreamJournalSort || "newest";
      state.dreamJournalShowMotifs = next.dreamJournalShowMotifs !== false;
      state.dreamJournalShowSummary = next.dreamJournalShowSummary !== false;
      state.dreamJournalShowTimestamp =
        next.dreamJournalShowTimestamp !== false;
      state.dreamJournalCompactCards = Boolean(next.dreamJournalCompactCards);
      state.dreamSequenceShowMotifs = next.dreamSequenceShowMotifs !== false;
      state.dreamSequenceShowTip = next.dreamSequenceShowTip !== false;
      state.dreamSequenceAutoDismiss = Boolean(next.dreamSequenceAutoDismiss);
      state.dreamSequenceBackdropFx = next.dreamSequenceBackdropFx !== false;
      state.faqCompactView = Boolean(next.faqCompactView);
      state.badgesGroupFilter = next.badgesGroupFilter || "all";
      state.badgesCompactChips = Boolean(next.badgesCompactChips);
      state.badgesShowIds = Boolean(next.badgesShowIds);
      state.skillTreeBranch = next.skillTreeBranch || "all";
      state.skillTreeShowUnlockedOnly = Boolean(next.skillTreeShowUnlockedOnly);
      state.skillTreeCompactCards = Boolean(next.skillTreeCompactCards);
      state.topBarCompact = Boolean(next.topBarCompact);
      state.topBarShowXp = next.topBarShowXp !== false;
      state.topBarShowStats = next.topBarShowStats !== false;
      state.topBarShowBadges = next.topBarShowBadges !== false;
      state.topBarShowQuickLinks = next.topBarShowQuickLinks !== false;
      state.mechanicsCompact = Boolean(next.mechanicsCompact);
      state.mechanicsShowTips = next.mechanicsShowTips !== false;
      state.mechanicsShowStats = next.mechanicsShowStats !== false;
      state.mechanicsShowUnlockLine = next.mechanicsShowUnlockLine !== false;
      state.traitImpactCompact = Boolean(next.traitImpactCompact);
      state.traitImpactShowMeter = next.traitImpactShowMeter !== false;
      state.traitImpactShowTips = next.traitImpactShowTips !== false;
      state.traitImpactShowHighlights =
        next.traitImpactShowHighlights !== false;
      state.dogCanvasMotion = next.dogCanvasMotion !== false;
      state.dogCanvasShadow = next.dogCanvasShadow !== false;
      state.dogCanvasScale = next.dogCanvasScale || "normal";
      state.dogPixiMotion = next.dogPixiMotion !== false;
      state.dogPixiScale = next.dogPixiScale || "normal";
      state.dogPixiQuality = next.dogPixiQuality || "auto";
      state.spriteSheetMotion = next.spriteSheetMotion !== false;
      state.spriteSheetUsePixelated = Boolean(next.spriteSheetUsePixelated);
      state.spriteSheetSize = next.spriteSheetSize || "normal";
      state.pixiDogMotion = next.pixiDogMotion !== false;
      state.pixiDogShowHearts = next.pixiDogShowHearts !== false;
      state.pixiDogShowShadow = next.pixiDogShowShadow !== false;
      state.pixiDogQuality = next.pixiDogQuality || "auto";
      state.gameFxSkillPulse = next.gameFxSkillPulse !== false;
      state.gameFxStoryGlow = next.gameFxStoryGlow !== false;
      state.gameFxBranchAccent = next.gameFxBranchAccent !== false;
      state.cosmeticsOverlayShowLabels =
        next.cosmeticsOverlayShowLabels !== false;
      state.cosmeticsOverlayShowPreviewTags =
        next.cosmeticsOverlayShowPreviewTags !== false;
      state.cosmeticsOverlayPosition =
        next.cosmeticsOverlayPosition || "top-left";
      state.trainingShowLocked = next.trainingShowLocked !== false;
      state.trainingCompactCards = Boolean(next.trainingCompactCards);
      state.trainingShowDetails = next.trainingShowDetails !== false;
      state.trainingSortKey = next.trainingSortKey || "status";
      state.trainingInputMode = normalizeTrainingInputMode(
        next.trainingInputMode,
        next.voiceCommandsEnabled ? "both" : "buttons"
      );
      state.voiceCommandsEnabled = Boolean(next.voiceCommandsEnabled);
      state.audio.enabled = Boolean(next.audio?.enabled);
      state.audio.masterVolume = clamp(
        Number(next.audio?.masterVolume ?? 0.8),
        0,
        1
      );
      state.audio.musicVolume = clamp(
        Number(next.audio?.musicVolume ?? 0.5),
        0,
        1
      );
      state.audio.sfxVolume = clamp(Number(next.audio?.sfxVolume ?? 0.7), 0, 1);
      state.audio.sleepEnabled = Boolean(next.audio?.sleepEnabled);
      state.audio.sleepVolume = clamp(
        Number(next.audio?.sleepVolume ?? 0.25),
        0,
        1
      );
      state.confirmDangerousActions = Boolean(next.confirmDangerousActions);

      saveToStorage(state);
    },

    resetSettings() {
      const fresh = {
        theme: "system",
        reduceMotion: "system",
        highContrast: false,
        reduceTransparency: false,
        focusRings: "auto",
        hitTargets: "auto",
        fontScale: 1,
        showHints: true,
        dailyRemindersEnabled: true,
        showGameMicroHud: true,
        showCritters: true,
        roamIntensity: 1,
        showWeatherFx: true,
        showBackgroundPhotos: true,
        showSceneVignette: true,
        showSceneGrain: true,
        storeHoverPreview: true,
        storeShowEquippedFirst: true,
        storeCompactCards: false,
        storeSortKey: "recommended",
        pottyAutoReturn: false,
        pottyConfirmAccidents: true,
        pottyShowXpTools: false,
        pottyTipsExpanded: true,
        dreamJournalKind: "all",
        dreamJournalSort: "newest",
        dreamJournalShowMotifs: true,
        dreamJournalShowSummary: true,
        dreamJournalShowTimestamp: true,
        dreamJournalCompactCards: false,
        dreamSequenceShowMotifs: true,
        dreamSequenceShowTip: true,
        dreamSequenceAutoDismiss: false,
        dreamSequenceBackdropFx: true,
        faqCompactView: false,
        badgesGroupFilter: "all",
        badgesCompactChips: false,
        badgesShowIds: false,
        skillTreeBranch: "all",
        skillTreeShowUnlockedOnly: false,
        skillTreeCompactCards: false,
        topBarCompact: false,
        topBarShowXp: true,
        topBarShowStats: true,
        topBarShowBadges: true,
        topBarShowQuickLinks: true,
        mechanicsCompact: false,
        mechanicsShowTips: true,
        mechanicsShowStats: true,
        mechanicsShowUnlockLine: true,
        traitImpactCompact: false,
        traitImpactShowMeter: true,
        traitImpactShowTips: true,
        traitImpactShowHighlights: true,
        dogCanvasMotion: true,
        dogCanvasShadow: true,
        dogCanvasScale: "normal",
        dogPixiMotion: true,
        dogPixiScale: "normal",
        dogPixiQuality: "auto",
        spriteSheetMotion: true,
        spriteSheetUsePixelated: false,
        spriteSheetSize: "normal",
        pixiDogMotion: true,
        pixiDogShowHearts: true,
        pixiDogShowShadow: true,
        pixiDogQuality: "auto",
        gameFxSkillPulse: true,
        gameFxStoryGlow: true,
        gameFxBranchAccent: true,
        cosmeticsOverlayShowLabels: true,
        cosmeticsOverlayShowPreviewTags: true,
        cosmeticsOverlayPosition: "top-left",
        trainingShowLocked: true,
        trainingCompactCards: false,
        trainingShowDetails: true,
        trainingSortKey: "status",
        batterySaver: false,
        perfMode: "auto",
        voiceCommandsEnabled: true,
        trainingInputMode: "both",
        audio: {
          enabled: true,
          masterVolume: 0.8,
          musicVolume: 0.5,
          sfxVolume: 0.7,
          sleepEnabled: true,
          sleepVolume: 0.25,
        },
        confirmDangerousActions: true,
      };

      if (typeof window !== "undefined") {
        try {
          window.localStorage.setItem(
            SETTINGS_STORAGE_KEY,
            JSON.stringify(fresh)
          );
        } catch {
          // ignore
        }
      }

      return fresh;
    },
  },
});

export const {
  setPerfMode,
  setTheme,
  setReduceMotion,
  setHighContrast,
  setReduceTransparency,
  setFocusRings,
  setHitTargets,
  setFontScale,
  setShowHints,
  setDailyRemindersEnabled,
  setHapticsEnabled,
  setBatterySaver,
  setVoiceCommandsEnabled,
  setTrainingInputMode,
  setShowGameMicroHud,
  setShowCritters,
  setRoamIntensity,
  setShowWeatherFx,
  setShowBackgroundPhotos,
  setShowSceneVignette,
  setShowSceneGrain,
  setStoreHoverPreview,
  setStoreShowEquippedFirst,
  setStoreCompactCards,
  setStoreSortKey,
  setPottyAutoReturn,
  setPottyConfirmAccidents,
  setPottyShowXpTools,
  setPottyTipsExpanded,
  setDreamJournalKind,
  setDreamJournalSort,
  setDreamJournalShowMotifs,
  setDreamJournalShowSummary,
  setDreamJournalShowTimestamp,
  setDreamSequenceShowMotifs,
  setDreamSequenceShowTip,
  setDreamSequenceAutoDismiss,
  setDreamSequenceBackdropFx,
  setDreamJournalCompactCards,
  setFaqCompactView,
  setBadgesGroupFilter,
  setBadgesCompactChips,
  setBadgesShowIds,
  setSkillTreeBranch,
  setSkillTreeShowUnlockedOnly,
  setSkillTreeCompactCards,
  setTopBarCompact,
  setTopBarShowXp,
  setTopBarShowStats,
  setTopBarShowBadges,
  setTopBarShowQuickLinks,
  setMechanicsCompact,
  setMechanicsShowTips,
  setMechanicsShowStats,
  setMechanicsShowUnlockLine,
  setTraitImpactCompact,
  setTraitImpactShowMeter,
  setTraitImpactShowTips,
  setTraitImpactShowHighlights,
  setDogCanvasMotion,
  setDogCanvasShadow,
  setDogCanvasScale,
  setDogPixiMotion,
  setDogPixiScale,
  setDogPixiQuality,
  setSpriteSheetMotion,
  setSpriteSheetUsePixelated,
  setSpriteSheetSize,
  setPixiDogMotion,
  setPixiDogShowHearts,
  setPixiDogShowShadow,
  setPixiDogQuality,
  setGameFxSkillPulse,
  setGameFxStoryGlow,
  setGameFxBranchAccent,
  setCosmeticsOverlayShowLabels,
  setCosmeticsOverlayShowPreviewTags,
  setCosmeticsOverlayPosition,
  setTrainingShowLocked,
  setTrainingCompactCards,
  setTrainingShowDetails,
  setTrainingSortKey,
  setAudioEnabled,
  setMasterVolume,
  setMusicVolume,
  setSfxVolume,
  setSleepAudioEnabled,
  setSleepVolume,
  setConfirmDangerousActions,
  hydrateSettings,
  resetSettings,
} = settingsSlice.actions;

export const selectSettings = (state) => state.settings;
export const selectThemeMode = (state) => state.settings?.theme || "system";

export { SETTINGS_STORAGE_KEY };
export default settingsSlice.reducer;

// src/store/dogSlice.js
import { createSlice, nanoid } from "@reduxjs/toolkit";

const initialState = {
  /* identity */
  name: "",
  gender: "",
  /* progression */
  xp: 0,
  level: 1,
  /* needs & stats */
  happiness: 100,
  energy: 100,
  hunger: 100,
  /* potty */
  pottyLevel: 0,
  isPottyTrained: false,
  /* tricks & inventory */
  tricksLearned: [],
  toylist: [],
  modalOpen: false,
  /* position & facing */
  x: 96,
  y: 96,
  direction: "down",
  /* cleanliness timers */
  isDirty: false,
  hasFleas: false,
  hasMange: false,
  lastBathed: Date.now(),
  /* AI flags */
  isWalking: false,
  isRunning: false,
  isBarking: false,
  isPooping: false,
  /* world interactions */
  poops: [], // each { id, x, y }
  soundEnabled: true,
};

const dogSlice = createSlice({
  name: "dog",
  initialState,
  reducers: {
    /* ── identity ─────────────────────────── */
    setDogName:   (s, a) => void (s.name = a.payload),
    setDogGender: (s, a) => void (s.gender = a.payload),

    /* ── movement ─────────────────────────── */
    move: (s, a) => {
      const { x, y, direction } = a.payload;
      s.x = x;
      s.y = y;
      s.direction = direction ?? s.direction;
    },

    /* ── XP / level-up ────────────────────── */
    gainXP: (s, a) => {
      s.xp += a.payload ?? 5;
      const max = s.level * 100;
      if (s.xp >= max) {
        s.xp -= max;
        s.level += 1;
      }
    },
    scoopPoopReward: (s) => dogSlice.caseReducers.gainXP(s, { payload: 5 }),

    /* ── tricks ───────────────────────────── */
    teachTrick: (s, a) => {
      if (!s.tricksLearned.includes(a.payload)) {
        s.tricksLearned.push(a.payload);
        dogSlice.caseReducers.gainXP(s, { payload: 10 });
      }
    },

    /* ── hunger / play ────────────────────── */
    feedDog: (s) => {
      s.hunger    = Math.min(100, s.hunger + 20);
      s.energy    = Math.min(100, s.energy + 10);
    },
    playWithDog: (s) => {
      s.happiness = Math.min(100, s.happiness + 15);
      s.energy    = Math.max(0,   s.energy - 10);
    },

    /* ── potty ────────────────────────────── */
    increasePottyLevel: (s, a) => {
      s.pottyLevel = Math.min(100, s.pottyLevel + (a.payload ?? 5));
      if (s.pottyLevel >= 100) s.isPottyTrained = true;
    },
    resetPottyLevel:   (s) => { s.pottyLevel = 0; s.isPottyTrained = false; },

    /* ── toys ─────────────────────────────── */
    addToy:    (s, a) => { if (!s.toylist.includes(a.payload)) s.toylist.push(a.payload); },
    removeToy: (s, a) => { s.toylist = s.toylist.filter(t => t.id !== a.payload.id); },
    toggleToyModal: (s, a) => void (s.modalOpen = a.payload),

    /* ── cleanliness progression ──────────── */
    batheDog:   (s) => { s.isDirty = s.hasFleas = s.hasMange = false; s.lastBathed = Date.now(); },
    groomDog:   (s) => void (s.isDirty = false),
    treatFleas: (s) => void (s.hasFleas = false),
    updateCleanliness: (s) => {
      const days = (Date.now() - s.lastBathed) / 86_400_000; // ms per day
      if (days >= 3  && !s.isDirty)   s.isDirty  = true;
      if (days >= 7  && !s.hasFleas)  s.hasFleas = true;
      if (days >= 14 && !s.hasMange)  s.hasMange = true;
    },

    /* ── AI flags ─────────────────────────── */
    startWalking:  (s) => void (s.isWalking = true),
    stopWalking:   (s) => void (s.isWalking = false),
    startRunning:  (s) => void (s.isRunning = true),
    stopRunning:   (s) => void (s.isRunning = false),
    startBarking:  (s) => void (s.isBarking = true),
    stopBarking:   (s) => void (s.isBarking = false),
    startPooping:  (s) => void (s.isPooping = true),
    stopPooping:   (s) => void (s.isPooping = false),

    /* ── world interaction ────────────────── */
    dropPoop: (s, a) => {
      const { x, y } = a.payload;
      s.poops.push({ id: nanoid(), x, y });
    },
    playBark: () => {},  // thunk/UI side-effect only

    /* ── convenience resets & loads ───────── */
    resetDogState: () => initialState,
    loadState:     (s, a) => ({ ...s, ...a.payload }),
  },
});

export const {
  setDogName, setDogGender,
  move,
  gainXP, scoopPoopReward,
  teachTrick,
  feedDog, playWithDog,
  increasePottyLevel, resetPottyLevel,
  addToy, removeToy, toggleToyModal,
  batheDog, groomDog, treatFleas, updateCleanliness,
  startWalking, stopWalking,
  startRunning, stopRunning,
  startBarking, stopBarking,
  startPooping, stopPooping,
  dropPoop, playBark,
  resetDogState, loadState,
} = dogSlice.actions;

export default dogSlice.reducer;
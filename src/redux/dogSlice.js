import { createSlice } from "@reduxjs/toolkit";

/* utils */
const clamp = (v, min = 0, max = 100) => Math.max(min, Math.min(max, v));
const SEC_PER_DAY = 86400;

/* state */
const initialState = {
  name: null,

  // Movement / pose
  pos: { x: 0, y: 0 },
  direction: "down",
  moving: false,

  // Needs (0..100; higher=better except hunger where 0 = full)
  happiness: 60,
  energy: 80,
  cleanliness: 80,
  hunger: 20,

  // Progression
  xp: 0,
  level: 1,

  // Economy
  coins: 0,

  // Cosmetics / unlocks
  accessories: { owned: [], equipped: null },
  unlocks: { accessories: [], skins: [] },
  backyardSkin: "default",

  // Real-time progression
  ageDays: 0,
  stage: "Pup",
  lastRealTick: null,

  // MainGame expectations
  mood: "idle",
  poopCount: 0,
  isPottyTrained: false,
  toys: ["Ball", "Rope", "Bone"],
  learnedTricks: [],
};

function applyXP(state, amount = 0) {
  state.xp = Math.max(0, state.xp + Number(amount || 0));
  while (state.xp >= 100) {
    state.xp -= 100;
    state.level += 1;
  }
}

function applyNeeds(state, dt) {
  state.energy       = clamp(state.energy - 0.5 * dt);
  state.cleanliness  = clamp(state.cleanliness - 0.2 * dt);
  state.hunger       = clamp(state.hunger + 0.6 * dt); // higher = hungrier
  const happyDelta = ((100 - state.hunger) * 0.003 + state.cleanliness * 0.002) - 0.15;
  state.happiness = clamp(state.happiness + happyDelta * dt);
}

function deriveStage(ageDays) {
  if (ageDays < 5) return "Pup";
  if (ageDays < 15) return "Teen";
  return "Adult";
}

const dogSlice = createSlice({
  name: "dog",
  initialState,
  reducers: {
    // Identity
    setName(state, { payload }) {
      const name = typeof payload === "string" ? payload : payload?.name;
      state.name = (name || "").trim() || null;
    },

    // Movement
    setPosition(state, { payload }) {
      const { x = state.pos.x, y = state.pos.y } = payload || {};
      state.pos.x = Math.round(Number(x));
      state.pos.y = Math.round(Number(y));
    },
    setDirection(state, { payload }) {
      const dir = String(payload || "").toLowerCase();
      if (["up", "down", "left", "right"].includes(dir)) state.direction = dir;
    },
    setMoving(state, { payload }) { state.moving = Boolean(payload); },

    // Needs (frame dt)
    setHappiness(state, { payload }) { state.happiness = clamp(Number(payload)); },
    changeHappiness(state, { payload }) { state.happiness = clamp(state.happiness + Number(payload || 0)); },
    setEnergy(state, { payload }) { state.energy = clamp(Number(payload)); },
    setCleanliness(state, { payload }) { state.cleanliness = clamp(Number(payload)); },
    setHunger(state, { payload }) { state.hunger = clamp(Number(payload)); },

    tickNeeds(state, { payload }) {
      const dt = Math.max(0, Number(payload?.dt ?? 1));
      applyNeeds(state, dt);
    },

    // Real-time tick (wall clock)
    tickRealTime(state, { payload }) {
      const t = typeof payload === "number" ? payload : Date.now();
      if (state.lastRealTick == null) { state.lastRealTick = t; return; }
      let dtSec = (t - state.lastRealTick) / 1000;
      dtSec = Math.max(0, Math.min(dtSec, 10 * 60)); // clamp runaway
      state.lastRealTick = t;

      applyNeeds(state, dtSec);
      state.ageDays = Math.max(0, state.ageDays + dtSec / SEC_PER_DAY);
      state.stage = deriveStage(state.ageDays);
    },

    // XP / Level
    addXP(state, { payload }) { applyXP(state, Number(payload || 0)); },

    // Economy
    earnCoins(state, { payload }) { state.coins = Math.max(0, state.coins + Math.max(0, Number(payload || 0))); },
    spendCoins(state, { payload }) {
      const amt = Math.max(0, Number(payload || 0));
      if (state.coins >= amt) state.coins -= amt;
    },

    // Accessories / skins
    unlockAccessory(state, { payload }) {
      const id = String(payload || "").trim();
      if (!id) return;
      if (!state.accessories.owned.includes(id)) state.accessories.owned.push(id);
      if (!state.unlocks.accessories.includes(id)) state.unlocks.accessories.push(id);
    },
    equipAccessory(state, { payload }) {
      const id = payload == null ? null : String(payload || "").trim();
      if (id === null) { state.accessories.equipped = null; return; }
      if (state.accessories.owned.includes(id)) state.accessories.equipped = id;
    },
    unlockSkin(state, { payload }) {
      const id = String(payload || "").trim();
      if (!id) return;
      if (!state.unlocks.skins.includes(id)) state.unlocks.skins.push(id);
    },
    setBackyardSkin(state, { payload }) {
      const skin = String(payload || "").trim() || "default";
      state.backyardSkin = skin;
    },

    // MainGame direct reducers
    feed(state)       { state.hunger = clamp(state.hunger - 30, 0, 100); state.happiness = clamp(state.happiness + 5, 0, 100); state.mood = "happy"; },
    play(state)       { state.happiness = clamp(state.happiness + 10, 0, 100); state.energy = clamp(state.energy - 10, 0, 100); state.mood = "playful"; },
    train(state)      { applyXP(state, 20); state.energy = clamp(state.energy - 8, 0, 100); state.mood = "focused"; },
    rest(state)       { state.energy = clamp(state.energy + 25, 0, 100); state.hunger = clamp(state.hunger + 5, 0, 100); state.mood = "idle"; },
    useToy(state, { payload }) {
      const toy = payload?.toy;
      if (!toy) return;
      if (state.toys.includes(toy)) {
        state.happiness = clamp(state.happiness + 6, 0, 100);
        state.energy = clamp(state.energy - 4, 0, 100);
        state.mood = "playful";
      }
    },
    scoopPoop(state)  { state.poopCount = 0; state.cleanliness = clamp(state.cleanliness + 10, 0, 100); },
    pottyTrain(state) { state.isPottyTrained = true; state.happiness = clamp(state.happiness + 4, 0, 100); },
    learnTrick(state, { payload }) {
      const trick = String(payload?.trick || "").trim();
      if (!trick) return;
      if (!state.learnedTricks.includes(trick)) {
        state.learnedTricks.push(trick);
        applyXP(state, 30);
        state.happiness = clamp(state.happiness + 5, 0, 100);
      }
    },
  },
  extraReducers: (builder) => {
    // compatibility for generic string actions
    builder.addCase("dog/feed",        (s)=>dogSlice.caseReducers.feed(s));
    builder.addCase("dog/play",        (s)=>dogSlice.caseReducers.play(s));
    builder.addCase("dog/train",       (s)=>dogSlice.caseReducers.train(s));
    builder.addCase("dog/rest",        (s)=>dogSlice.caseReducers.rest(s));
    builder.addCase("dog/useToy",      (s,a)=>dogSlice.caseReducers.useToy(s,a));
    builder.addCase("dog/scoopPoop",   (s)=>dogSlice.caseReducers.scoopPoop(s));
    builder.addCase("dog/pottyTrain",  (s)=>dogSlice.caseReducers.pottyTrain(s));
    builder.addCase("dog/learnTrick",  (s,a)=>dogSlice.caseReducers.learnTrick(s,a));
    builder.addCase("dog/resetAll",    () => structuredClone(initialState));
  },
});

export const {
  setName, setPosition, setDirection, setMoving,
  setHappiness, changeHappiness, setEnergy, setCleanliness, setHunger,
  tickNeeds, tickRealTime,
  addXP, earnCoins, spendCoins,
  unlockAccessory, equipAccessory, unlockSkin, setBackyardSkin,
  feed, play, train, rest, useToy, scoopPoop, pottyTrain, learnTrick,
} = dogSlice.actions;

export default dogSlice.reducer;

/* selectors */
export const selectDog           = (s) => s.dog;
export const selectName          = (s) => s.dog?.name ?? "Your Pup";
export const selectPos           = (s) => s.dog?.pos ?? { x: 0, y: 0 };
export const selectDirection     = (s) => s.dog?.direction ?? "down";
export const selectMoving        = (s) => !!s.dog?.moving;
export const selectHappiness     = (s) => s.dog?.happiness ?? 50;
export const selectEnergy        = (s) => s.dog?.energy ?? 50;
export const selectCleanliness   = (s) => s.dog?.cleanliness ?? 50;
export const selectHunger        = (s) => s.dog?.hunger ?? 50;
export const selectXP            = (s) => s.dog?.xp ?? 0;
export const selectDogLevel      = (s) => s.dog?.level ?? 1;
export const selectCoins         = (s) => s.dog?.coins ?? 0;
export const selectAccessories   = (s) => s.dog?.accessories ?? { owned: [], equipped: null };
export const selectUnlocks       = (s) => s.dog?.unlocks ?? { accessories: [], skins: [] };
export const selectBackyardSkin  = (s) => s.dog?.backyardSkin ?? "default";
export const selectAgeDays       = (s) => s.dog?.ageDays ?? 0;
export const selectStage         = (s) => s.dog?.stage ?? "Pup";

// _backup/old-src-conflicts/mobile-yard/main.js
import { Capacitor } from "@capacitor/core";
import { Haptics, ImpactStyle } from "@capacitor/haptics";
import { LocalNotifications } from "@capacitor/local-notifications";
import { Motion } from "@capacitor/motion";
import { initializeApp, getApps } from "firebase/app";
import {
  doc,
  getDoc,
  getFirestore,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import { getAuth, onAuthStateChanged, signInAnonymously } from "firebase/auth";

const SCALE_STORAGE_KEY = "doggerz_mobile_scale";
const WORLD_WIDTH = 390;
const WORLD_HEIGHT = 844;
const DOG_SPEED = 140;
const ZOOMIES_SPEED = 360;
const FOOTPRINT_INTERVAL_MS = 110;
const IDLE_AI_DELAY_MS = 6500;
const HESITATION_MIN_DISTANCE = 42;
const HESITATION_DURATION_MS = 650;
const HESITATION_CHECK_INTERVAL_MS = 420;
const SHAKE_THRESHOLD = 15;
const SHAKE_COOLDOWN_MS = 2500;
const DIRT_HOLES_STORAGE_KEY = "doggerz_mobile_dirt_holes";
const MAX_DIRT_HOLES = 16;
const BACKYARD_BOUNDS = Object.freeze({
  minX: 5,
  maxX: 85,
  minY: 40,
  maxY: 90,
});
const DOG_CONFIG = Object.freeze({
  states: Object.freeze(["IDLE", "WANDER", "SNIFF", "BARK", "ZOOMIES", "DIG"]),
  minActionInterval: 3000,
  maxActionInterval: 8000,
});
const REFERENCE_STYLE_DOG_SHEET =
  "/assets/sprites/jr/variants/pup-reference-style.png";
const ACTIONS = Object.freeze({
  IDLE: Object.freeze({
    file: REFERENCE_STYLE_DOG_SHEET,
    columns: 4,
    rows: 4,
    duration: "3.2s",
  }),
  WANDER: Object.freeze({
    file: REFERENCE_STYLE_DOG_SHEET,
    columns: 4,
    rows: 4,
    duration: "2.2s",
  }),
  SNIFF: Object.freeze({
    file: REFERENCE_STYLE_DOG_SHEET,
    columns: 4,
    rows: 4,
    duration: "2.8s",
  }),
  BARK: Object.freeze({
    file: REFERENCE_STYLE_DOG_SHEET,
    columns: 4,
    rows: 4,
    duration: "1.76s",
  }),
  ZOOMIES: Object.freeze({
    file: REFERENCE_STYLE_DOG_SHEET,
    columns: 4,
    rows: 4,
    duration: "1.12s",
  }),
  DIG: Object.freeze({
    file: REFERENCE_STYLE_DOG_SHEET,
    columns: 4,
    rows: 4,
    duration: "1.8s",
  }),
  FETCH: Object.freeze({
    file: REFERENCE_STYLE_DOG_SHEET,
    columns: 4,
    rows: 4,
    duration: "1.12s",
  }),
});

const dom = {
  yard: document.getElementById("yard"),
  dog: document.getElementById("dog"),
  dogShadow: document.getElementById("dog-shadow"),
  effectLayer: document.getElementById("effect-layer"),
  ballLayer: document.getElementById("ball-layer"),
  fireflyLayer: document.getElementById("firefly-layer"),
  footprintLayer: document.getElementById("footprint-layer"),
  wheelContainer: document.getElementById("hud-wheel-container"),
  wheelItems: document.getElementById("wheel-items"),
  wheelToggle: document.getElementById("wheel-toggle"),
  feedButton: document.getElementById("feed-btn"),
  cleanupButton: document.getElementById("cleanup-btn"),
  wheelBallButton: document.getElementById("wheel-ball-btn"),
  wheelSettingsButton: document.getElementById("wheel-settings-btn"),
  settingsPanel: document.getElementById("settings-menu"),
  closeMenuButton: document.getElementById("close-menu"),
  scaleInput: document.getElementById("scale-input"),
  scaleValue: document.getElementById("scale-value"),
  alarmMinutes: document.getElementById("alarm-minutes"),
  alarmButton: document.getElementById("alarm-button"),
  alarmNote: document.getElementById("alarm-note"),
  status: document.getElementById("status"),
};

if (
  !dom.yard ||
  !dom.dog ||
  !dom.dogShadow ||
  !dom.effectLayer ||
  !dom.ballLayer ||
  !dom.fireflyLayer ||
  !dom.footprintLayer
) {
  throw new Error("Mobile yard DOM failed to initialize.");
}
if (
  !dom.wheelContainer ||
  !dom.wheelItems ||
  !dom.wheelToggle ||
  !dom.feedButton ||
  !dom.cleanupButton ||
  !dom.wheelBallButton ||
  !dom.wheelSettingsButton ||
  !dom.settingsPanel ||
  !dom.closeMenuButton ||
  !dom.scaleInput ||
  !dom.scaleValue ||
  !dom.alarmMinutes ||
  !dom.alarmButton ||
  !dom.alarmNote ||
  !dom.status
) {
  throw new Error("Mobile yard settings DOM failed to initialize.");
}

const barkAudio = new Audio("/audio/bark.m4a");
barkAudio.preload = "auto";

const state = {
  dogX: WORLD_WIDTH * 0.5,
  dogY: WORLD_HEIGHT * 0.78,
  targetX: WORLD_WIDTH * 0.5,
  targetY: WORLD_HEIGHT * 0.78,
  isMoving: false,
  isFacingLeft: false,
  currentState: "IDLE",
  currentAction: "IDLE",
  moveSpeed: DOG_SPEED,
  depthScale: 1,
  lastTick: performance.now(),
  lastFootprintTime: 0,
  nextHesitationCheckTime: 0,
  hesitatingUntil: 0,
  lastShakeAt: 0,
  careReminderDueAt: 0,
  careReminderMet: true,
  careAccidentTimer: null,
  dirtHoles: [],
  fetchMode: false,
  activeBall: null,
  pendingDig: false,
  dirtPuffTimer: null,
  scale: 1,
  viewportScale: 1,
  idleTimer: null,
  aiTimer: null,
  actionTimer: null,
  firebaseCtx: {
    db: null,
    uid: null,
  },
};

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function getFirebaseConfig() {
  return {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
  };
}

function isFirebaseConfigured(config) {
  return Boolean(
    config.apiKey &&
    config.authDomain &&
    config.projectId &&
    config.storageBucket &&
    config.messagingSenderId &&
    config.appId
  );
}

async function initFirebaseScaleSync() {
  const config = getFirebaseConfig();
  if (!isFirebaseConfigured(config)) return;

  const app = getApps().length ? getApps()[0] : initializeApp(config);
  const db = getFirestore(app);
  const auth = getAuth(app);

  try {
    if (!auth.currentUser) {
      await signInAnonymously(auth);
    }
  } catch {
    return;
  }

  onAuthStateChanged(auth, async (user) => {
    if (!user?.uid) return;
    state.firebaseCtx.uid = user.uid;
    state.firebaseCtx.db = db;
    const remoteScale = await loadScaleFromFirebase();
    if (Number.isFinite(remoteScale)) {
      applyScale(remoteScale, { persistLocal: true, persistRemote: false });
    }
    const remoteHoles = await loadDirtHolesFromFirebase();
    if (remoteHoles.length > 0) {
      state.dirtHoles = remoteHoles;
      saveDirtHolesToLocal(remoteHoles);
      renderDirtHoles();
    }
  });
}

async function loadScaleFromFirebase() {
  const { db, uid } = state.firebaseCtx;
  if (!db || !uid) return null;

  try {
    const ref = doc(db, "users", uid, "dog", "main");
    const snap = await getDoc(ref);
    const scale = Number(snap.data()?.mobileScale);
    return Number.isFinite(scale) ? clamp(scale, 0.8, 1.7) : null;
  } catch {
    return null;
  }
}

async function persistScaleToFirebase(scale) {
  const { db, uid } = state.firebaseCtx;
  if (!db || !uid) return;

  try {
    const ref = doc(db, "users", uid, "dog", "main");
    await setDoc(
      ref,
      {
        mobileScale: scale,
        mobileScaleUpdatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  } catch {
    // Keep runtime silent for lightweight local testing.
  }
}

function normalizeDirtHoles(value) {
  return (Array.isArray(value) ? value : [])
    .map((hole) => ({
      x: clamp(Number(hole?.x), 0, WORLD_WIDTH),
      y: clamp(Number(hole?.y), WORLD_HEIGHT * 0.35, WORLD_HEIGHT * 0.94),
      createdAt: Number(hole?.createdAt) || Date.now(),
    }))
    .filter((hole) => Number.isFinite(hole.x) && Number.isFinite(hole.y))
    .slice(-MAX_DIRT_HOLES);
}

function saveDirtHolesToLocal(holes = state.dirtHoles) {
  localStorage.setItem(DIRT_HOLES_STORAGE_KEY, JSON.stringify(holes));
}

function loadDirtHolesFromLocal() {
  try {
    return normalizeDirtHoles(
      JSON.parse(localStorage.getItem(DIRT_HOLES_STORAGE_KEY))
    );
  } catch {
    return [];
  }
}

async function loadDirtHolesFromFirebase() {
  const { db, uid } = state.firebaseCtx;
  if (!db || !uid) return [];

  try {
    const ref = doc(db, "users", uid, "dog", "main");
    const snap = await getDoc(ref);
    return normalizeDirtHoles(snap.data()?.mobileYardDirtHoles);
  } catch {
    return [];
  }
}

async function persistDirtHolesToFirebase() {
  const { db, uid } = state.firebaseCtx;
  if (!db || !uid) return;

  try {
    const ref = doc(db, "users", uid, "dog", "main");
    await setDoc(
      ref,
      {
        mobileYardDirtHoles: state.dirtHoles,
        mobileYardDirtHolesUpdatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  } catch {
    // Local persistence keeps the yard state intact when Firebase is unavailable.
  }
}

function saveScaleToLocal(scale) {
  localStorage.setItem(SCALE_STORAGE_KEY, String(scale));
}

function loadScaleFromLocal() {
  const raw = localStorage.getItem(SCALE_STORAGE_KEY);
  const value = Number(raw);
  if (!Number.isFinite(value)) return 1;
  return clamp(value, 0.8, 1.7);
}

function applyScale(scale, { persistLocal = true, persistRemote = true } = {}) {
  state.scale = clamp(scale, 0.8, 1.7);
  dom.scaleInput.value = String(state.scale);
  dom.scaleValue.textContent = `Scale: ${state.scale.toFixed(2)}x`;
  syncWorldScale();

  if (persistLocal) {
    saveScaleToLocal(state.scale);
  }

  if (persistRemote) {
    void persistScaleToFirebase(state.scale);
  }
}

function syncWorldScale() {
  const shortest = Math.min(window.innerWidth, window.innerHeight);
  state.viewportScale = clamp(shortest / 390, 0.85, 1.2);
  const scaled = state.scale * state.viewportScale;
  document.documentElement.style.setProperty(
    "--dog-scale",
    String(state.scale)
  );
  document.documentElement.style.setProperty(
    "--yard-base-scale",
    String(state.viewportScale)
  );
  document.documentElement.style.setProperty(
    "--world-scale",
    scaled.toFixed(3)
  );
}

function clampToBackyard(point) {
  return {
    x: clamp(
      point.x,
      (BACKYARD_BOUNDS.minX / 100) * WORLD_WIDTH,
      (BACKYARD_BOUNDS.maxX / 100) * WORLD_WIDTH
    ),
    y: clamp(
      point.y,
      (BACKYARD_BOUNDS.minY / 100) * WORLD_HEIGHT,
      (BACKYARD_BOUNDS.maxY / 100) * WORLD_HEIGHT
    ),
  };
}

function worldPointFromClient(clientX, clientY) {
  const rect = dom.yard.getBoundingClientRect();
  const xRatio = clamp((clientX - rect.left) / rect.width, 0, 1);
  const yRatio = clamp((clientY - rect.top) / rect.height, 0, 1);

  return clampToBackyard({
    x: xRatio * WORLD_WIDTH,
    y: yRatio * WORLD_HEIGHT,
  });
}

function placeFootprint(x, y, facingLeft) {
  const foot = document.createElement("div");
  foot.className = "footprint";
  foot.style.left = `${(x / WORLD_WIDTH) * 100}%`;
  foot.style.top = `${(y / WORLD_HEIGHT) * 100}%`;
  foot.style.setProperty("--footprint-rot", `${facingLeft ? -20 : 20}deg`);
  dom.footprintLayer.appendChild(foot);
  foot.addEventListener("animationend", () => foot.remove(), { once: true });
}

function setDogAction(actionName) {
  const nextAction = ACTIONS[actionName] || ACTIONS.IDLE;
  state.currentAction = ACTIONS[actionName] ? actionName : "IDLE";
  dom.dog.style.backgroundImage = `url("${nextAction.file}")`;
  dom.dog.style.setProperty("--sprite-columns", String(nextAction.columns));
  dom.dog.style.setProperty("--sprite-rows", String(nextAction.rows));
  dom.dog.style.setProperty("--sprite-duration", nextAction.duration);
  dom.dog.style.setProperty(
    "--sprite-total-steps",
    String(nextAction.columns * nextAction.rows)
  );
}

function setDogMotionState(moving) {
  state.isMoving = moving;
  setDogAction(moving ? "WANDER" : "IDLE");
}

function setDogSniffing(sniffing) {
  setDogAction(sniffing ? "SNIFF" : state.isMoving ? "WANDER" : "IDLE");
}

function setDogBarking(barking) {
  setDogAction(barking ? "BARK" : state.isMoving ? "WANDER" : "IDLE");
}

function updateDogFacing(targetX) {
  state.isFacingLeft = targetX < state.dogX;
  dom.dog.classList.toggle("facing-left", state.isFacingLeft);
  dom.dog.classList.toggle("facing-right", !state.isFacingLeft);
}

function renderDogPosition() {
  dom.dog.style.left = `${(state.dogX / WORLD_WIDTH) * 100}%`;
  dom.dog.style.top = `${(state.dogY / WORLD_HEIGHT) * 100}%`;
  dom.dogShadow.style.left = `${(state.dogX / WORLD_WIDTH) * 100}%`;
  dom.dogShadow.style.top = `${((state.dogY + 20) / WORLD_HEIGHT) * 100}%`;
  dom.dogShadow.style.transform = `translate(-50%, -50%) scale(${clamp(
    state.depthScale,
    0.65,
    3.2
  )})`;
}

function setDogDepthScale(depthScale) {
  state.depthScale = clamp(depthScale, 1, 3.2);
  dom.dog.style.setProperty("--dog-depth-scale", String(state.depthScale));
  renderDogPosition();
}

function moveDogTo(
  worldX,
  worldY,
  { aiMove = false, speed = DOG_SPEED, zoomies = false, fetch = false } = {}
) {
  const target = clampToBackyard({ x: worldX, y: worldY });
  state.targetX = target.x;
  state.targetY = target.y;
  state.moveSpeed = speed;
  setDogDepthScale(1);
  state.hesitatingUntil = 0;
  state.nextHesitationCheckTime =
    performance.now() + HESITATION_CHECK_INTERVAL_MS;
  updateDogFacing(state.targetX);
  setDogMotionState(true);
  if (zoomies) {
    setDogAction("ZOOMIES");
  }
  if (fetch) {
    setDogAction("FETCH");
  }

  if (!aiMove) {
    resetIdleAI();
  }
}

function barkOnce() {
  barkAudio.currentTime = 0;
  void barkAudio.play().catch(() => {});
  dom.status.textContent = "Woof! Your pup barked.";
}

function placeEffect(className, x, y) {
  const effect = document.createElement("div");
  effect.className = className;
  effect.style.left = `${(x / WORLD_WIDTH) * 100}%`;
  effect.style.top = `${(y / WORLD_HEIGHT) * 100}%`;
  const targetLayer =
    className === "pee-decal" ? dom.footprintLayer : dom.effectLayer;
  targetLayer.appendChild(effect);
  effect.addEventListener("animationend", () => effect.remove(), {
    once: true,
  });
}

function renderDirtHole(hole) {
  const dirtHole = document.createElement("div");
  dirtHole.className = "dirt-hole";
  dirtHole.style.left = `${(hole.x / WORLD_WIDTH) * 100}%`;
  dirtHole.style.top = `${(hole.y / WORLD_HEIGHT) * 100}%`;
  dom.footprintLayer.appendChild(dirtHole);
}

function renderDirtHoles() {
  dom.footprintLayer
    .querySelectorAll(".dirt-hole")
    .forEach((hole) => hole.remove());
  state.dirtHoles.forEach(renderDirtHole);
  toggleCleanupButton();
}

function createDirtHole() {
  const hole = clampToBackyard({
    x: clamp(
      state.dogX + (state.isFacingLeft ? -14 : 14),
      24,
      WORLD_WIDTH - 24
    ),
    y: clamp(state.dogY + 28, WORLD_HEIGHT * 0.38, WORLD_HEIGHT * 0.92),
  });

  const nextHole = {
    ...hole,
    createdAt: Date.now(),
  };

  state.dirtHoles = normalizeDirtHoles([...state.dirtHoles, nextHole]);
  saveDirtHolesToLocal();
  renderDirtHoles();
  void persistDirtHolesToFirebase();
}

function spawnDirtPuff() {
  const puff = document.createElement("div");
  puff.className = "dirt-puff";
  const x = clamp(
    state.dogX + (state.isFacingLeft ? -16 : 16) + Math.random() * 22 - 11,
    0,
    WORLD_WIDTH
  );
  const y = clamp(state.dogY + 26 + Math.random() * 10, 0, WORLD_HEIGHT);
  puff.style.left = `${(x / WORLD_WIDTH) * 100}%`;
  puff.style.top = `${(y / WORLD_HEIGHT) * 100}%`;
  puff.style.setProperty("--puff-x", `${(Math.random() - 0.5) * 34}px`);
  dom.footprintLayer.appendChild(puff);
  puff.addEventListener("animationend", () => puff.remove(), { once: true });
}

function startDigging() {
  clearActionTimer();
  clearDirtPuffs();
  state.currentState = "DIG";
  setDogAction("DIG");
  dom.status.textContent = "Your pup is digging...";
  state.dirtPuffTimer = window.setInterval(spawnDirtPuff, 130);

  state.actionTimer = window.setTimeout(() => {
    clearDirtPuffs();
    createDirtHole();
    state.currentState = "IDLE";
    setDogMotionState(false);
  }, 3000);
}

function clearDirtPuffs() {
  if (state.dirtPuffTimer) {
    window.clearInterval(state.dirtPuffTimer);
    state.dirtPuffTimer = null;
  }
}

async function clearDirtHolesInFirebase() {
  const { db, uid } = state.firebaseCtx;
  if (!db || !uid) return;

  try {
    const ref = doc(db, "users", uid, "dog", "main");
    await setDoc(
      ref,
      {
        mobileYardDirtHoles: [],
        mobileYardDirtHolesUpdatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  } catch {
    // Local cleanup still completes when Firebase is offline.
  }
}

async function tapHaptic() {
  try {
    if (Capacitor.isNativePlatform()) {
      await Haptics.impact({ style: ImpactStyle.Light });
    }
  } catch {
    // Haptics are optional in web/live-reload.
  }
}

function toggleCleanupButton() {
  dom.cleanupButton.classList.toggle("has-mess", state.dirtHoles.length > 0);
}

async function cleanYard() {
  const holes = [...dom.footprintLayer.querySelectorAll(".dirt-hole")];
  if (holes.length === 0) return;

  await tapHaptic();
  holes.forEach((hole) => {
    hole.classList.add("hole-clearing");
  });

  window.setTimeout(() => {
    holes.forEach((hole) => hole.remove());
    state.dirtHoles = [];
    saveDirtHolesToLocal();
    toggleCleanupButton();
    void clearDirtHolesInFirebase();
    dom.status.textContent = "Yard is clean.";
    if (!state.isMoving) {
      const watchPoint = getRandomBackyardPos();
      moveDogTo(watchPoint.x, watchPoint.y, { aiMove: true, speed: DOG_SPEED });
      window.setTimeout(() => executeState("BARK"), 1200);
    }
  }, 520);
}

function setFetchMode(enabled) {
  state.fetchMode = enabled;
  dom.wheelBallButton.setAttribute("aria-pressed", enabled ? "true" : "false");
  dom.yard.classList.toggle("fetch-armed", enabled);
}

function removeActiveBall() {
  if (state.activeBall) {
    state.activeBall.remove();
    state.activeBall = null;
  }
}

function throwBall(x, y) {
  const target = clampToBackyard({ x, y });
  removeActiveBall();

  const ball = document.createElement("div");
  ball.className = "ball-sprite";
  ball.style.left = `${(target.x / WORLD_WIDTH) * 100}%`;
  ball.style.top = `${(target.y / WORLD_HEIGHT) * 100}%`;
  dom.ballLayer.appendChild(ball);
  state.activeBall = ball;

  executeState("FETCH", target);
  window.setTimeout(removeActiveBall, 2800);
}

function triggerScreenLick() {
  if (state.isMoving) return;

  clearActionTimer();
  state.currentState = "SNIFF";
  state.dogX = WORLD_WIDTH * 0.5;
  state.dogY = WORLD_HEIGHT * 0.68;
  setDogDepthScale(3.2);
  setDogAction("SNIFF");
  window.setTimeout(() => {
    placeEffect("screen-smudge", WORLD_WIDTH * 0.5, WORLD_HEIGHT * 0.42);
  }, 360);
  restoreIdleAfter(1400);
}

function triggerIgnoredReminderAccident() {
  if (state.isMoving || state.careReminderMet) return;

  const cornerX = Math.random() < 0.5 ? WORLD_WIDTH * 0.12 : WORLD_WIDTH * 0.88;
  const cornerY = WORLD_HEIGHT * 0.84;
  moveDogTo(cornerX, cornerY, { aiMove: true, speed: DOG_SPEED });

  window.setTimeout(() => {
    if (Math.hypot(state.dogX - cornerX, state.dogY - cornerY) < 32) {
      placeEffect("pee-decal", cornerX, cornerY + 20);
      state.careReminderMet = true;
      dom.status.textContent = "Your pup had an accident.";
    }
  }, 1900);
}

function getRandomBackyardPos({ zoomies = false } = {}) {
  const inset = zoomies ? 2 : 0;
  const minX = BACKYARD_BOUNDS.minX + inset;
  const maxX = BACKYARD_BOUNDS.maxX - inset;
  const minY = BACKYARD_BOUNDS.minY + (zoomies ? 2 : 0);
  const maxY = BACKYARD_BOUNDS.maxY;

  return {
    x: ((Math.random() * (maxX - minX) + minX) / 100) * WORLD_WIDTH,
    y: ((Math.random() * (maxY - minY) + minY) / 100) * WORLD_HEIGHT,
  };
}

function getRandomYardPoint({ zoomies = false } = {}) {
  return getRandomBackyardPos({ zoomies });
}

function clearActionTimer() {
  if (state.actionTimer) {
    window.clearTimeout(state.actionTimer);
    state.actionTimer = null;
  }
}

function restoreIdleAfter(ms) {
  clearActionTimer();
  state.actionTimer = window.setTimeout(() => {
    if (!state.isMoving) {
      state.currentState = "IDLE";
      setDogDepthScale(1);
      setDogMotionState(false);
    }
  }, ms);
}

function executeState(nextState, payload = null) {
  if (state.isMoving && nextState !== "ZOOMIES" && nextState !== "FETCH")
    return;

  clearActionTimer();
  state.currentState = nextState;

  switch (nextState) {
    case "WANDER": {
      const point = getRandomYardPoint();
      moveDogTo(point.x, point.y, { aiMove: true, speed: DOG_SPEED });
      dom.status.textContent = "Your pup is wandering on its own...";
      break;
    }

    case "SNIFF":
      setDogSniffing(true);
      dom.status.textContent = "Your pup is sniffing the ground...";
      restoreIdleAfter(1200);
      break;

    case "BARK":
      setDogBarking(true);
      barkOnce();
      restoreIdleAfter(900);
      break;

    case "ZOOMIES": {
      const point = getRandomYardPoint({ zoomies: true });
      moveDogTo(point.x, point.y, {
        aiMove: true,
        speed: ZOOMIES_SPEED,
        zoomies: true,
      });
      dom.status.textContent = "Zoomies!";
      break;
    }

    case "FETCH": {
      const point = clampToBackyard(
        payload || getRandomBackyardPos({ zoomies: true })
      );
      moveDogTo(point.x, point.y, {
        aiMove: true,
        speed: ZOOMIES_SPEED,
        zoomies: true,
        fetch: true,
      });
      dom.status.textContent = "Fetch!";
      break;
    }

    case "DIG":
      if (payload?.digNow) {
        startDigging();
        break;
      }

      state.pendingDig = true;
      {
        const point = getRandomBackyardPos();
        moveDogTo(point.x, point.y, {
          aiMove: true,
          speed: DOG_SPEED * 1.15,
        });
      }
      dom.status.textContent = "Your pup found a digging spot...";
      break;

    default:
      setDogMotionState(false);
      dom.status.textContent = "";
  }
}

function triggerRandomAIAction() {
  if (!state.isMoving && Math.random() < 0.12) {
    triggerScreenLick();
    return;
  }

  if (!state.careReminderMet && Date.now() >= state.careReminderDueAt) {
    triggerIgnoredReminderAccident();
    return;
  }

  const index = Math.floor(Math.random() * DOG_CONFIG.states.length);
  executeState(DOG_CONFIG.states[index]);
}

function getNextAIInterval() {
  return (
    Math.random() *
      (DOG_CONFIG.maxActionInterval - DOG_CONFIG.minActionInterval) +
    DOG_CONFIG.minActionInterval
  );
}

function stopIdleAI() {
  if (state.idleTimer) {
    window.clearTimeout(state.idleTimer);
    state.idleTimer = null;
  }

  if (state.aiTimer) {
    window.clearTimeout(state.aiTimer);
    state.aiTimer = null;
  }

  clearDirtPuffs();
  clearActionTimer();
}

function startIdleAI() {
  stopIdleAI();

  state.idleTimer = window.setTimeout(() => {
    const brainLoop = () => {
      triggerRandomAIAction();
      state.aiTimer = window.setTimeout(brainLoop, getNextAIInterval());
    };

    brainLoop();
  }, IDLE_AI_DELAY_MS);
}

function resetIdleAI() {
  stopIdleAI();
  startIdleAI();
}

function loop(now) {
  const dt = clamp((now - state.lastTick) / 1000, 0, 0.033);
  state.lastTick = now;

  if (state.isMoving) {
    const dx = state.targetX - state.dogX;
    const dy = state.targetY - state.dogY;
    const distance = Math.hypot(dx, dy);
    const travel = state.moveSpeed * dt;

    if (state.hesitatingUntil > now) {
      setDogSniffing(true);
      renderDogPosition();
      window.requestAnimationFrame(loop);
      return;
    }

    if (state.currentAction === "SNIFF") {
      setDogSniffing(false);
    }

    if (distance <= travel || distance < 1.2) {
      state.dogX = state.targetX;
      state.dogY = state.targetY;
      if (state.pendingDig) {
        state.pendingDig = false;
        state.isMoving = false;
        renderDogPosition();
        startDigging();
        window.requestAnimationFrame(loop);
        return;
      }
      state.currentState = "IDLE";
      state.moveSpeed = DOG_SPEED;
      setDogDepthScale(1);
      if (state.activeBall) {
        removeActiveBall();
      }
      setDogMotionState(false);
    } else {
      if (
        distance > HESITATION_MIN_DISTANCE &&
        now >= state.nextHesitationCheckTime &&
        Math.random() < 0.16
      ) {
        state.hesitatingUntil = now + HESITATION_DURATION_MS;
        state.nextHesitationCheckTime = now + HESITATION_DURATION_MS + 1200;
        setDogSniffing(true);
        window.requestAnimationFrame(loop);
        return;
      }

      state.nextHesitationCheckTime = now + HESITATION_CHECK_INTERVAL_MS;
      state.dogX += (dx / distance) * travel;
      state.dogY += (dy / distance) * travel;

      if (now - state.lastFootprintTime > FOOTPRINT_INTERVAL_MS) {
        placeFootprint(state.dogX, state.dogY + 26, state.isFacingLeft);
        state.lastFootprintTime = now;
      }
    }

    renderDogPosition();
  }

  window.requestAnimationFrame(loop);
}

async function schedulePetReminder(minutes, note) {
  const title = "Doggerz Care Reminder";
  const body = note || "Your Jack Russell needs a quick check-in.";
  const at = new Date(Date.now() + minutes * 60_000);

  if (Capacitor.isNativePlatform()) {
    const permission = await LocalNotifications.requestPermissions();
    if (permission.display !== "granted") {
      throw new Error("Notification permission denied.");
    }

    if (
      Capacitor.getPlatform() === "android" &&
      LocalNotifications.createChannel
    ) {
      await LocalNotifications.createChannel({
        id: "doggerz-care",
        name: "Doggerz Care",
        description: "Pet care reminders",
        importance: 5,
      });
    }

    await LocalNotifications.schedule({
      notifications: [
        {
          id: Math.max(1, Math.floor(Date.now() % 2_147_480_000)),
          title,
          body,
          schedule: { at, allowWhileIdle: true },
          channelId: "doggerz-care",
        },
      ],
    });
    return;
  }

  if ("Notification" in window) {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      throw new Error("Browser notification permission denied.");
    }

    window.setTimeout(() => {
      new Notification(title, { body });
    }, minutes * 60_000);
    return;
  }

  throw new Error("Notifications are not available on this platform.");
}

function setStatus(message) {
  dom.status.textContent = message;
}

function preloadActionSprites() {
  const urls = [
    ...new Set(Object.values(ACTIONS).map((action) => action.file)),
  ];
  urls.forEach((url) => {
    const img = new Image();
    img.decoding = "async";
    img.src = url;
  });
}

function applyTimeOfDayLighting() {
  const hour = new Date().getHours();
  dom.yard.classList.remove("time-night", "time-golden", "time-day");

  if (hour >= 18 || hour <= 6) {
    dom.yard.classList.add("time-night");
    return;
  }

  if (hour >= 16 && hour < 18) {
    dom.yard.classList.add("time-golden");
    return;
  }

  dom.yard.classList.add("time-day");
}

function isNightTime() {
  const hour = new Date().getHours();
  return hour < 6 || hour > 20;
}

function spawnFireflies() {
  if (!isNightTime()) return;

  for (let i = 0; i < 5; i += 1) {
    const firefly = document.createElement("div");
    firefly.className = "firefly";
    firefly.style.left = `${Math.random() * 100}%`;
    firefly.style.top = `${20 + Math.random() * 58}%`;
    firefly.style.setProperty("--drift-x", `${-18 + Math.random() * 36}px`);
    firefly.style.setProperty("--drift-y", `${-22 + Math.random() * 18}px`);
    firefly.style.animationDelay = `${Math.random() * 700}ms`;
    dom.fireflyLayer.appendChild(firefly);
    window.setTimeout(() => firefly.remove(), 4200);
  }
}

async function initShakeForZoomies() {
  if (!Motion?.addListener) return;

  try {
    if (Capacitor.isNativePlatform() && Motion.requestPermissions) {
      await Motion.requestPermissions();
    }

    await Motion.addListener("accel", (event) => {
      const acceleration =
        event.accelerationIncludingGravity || event.acceleration || {};
      const force = Math.max(
        Math.abs(Number(acceleration.x) || 0),
        Math.abs(Number(acceleration.y) || 0),
        Math.abs(Number(acceleration.z) || 0)
      );
      const now = Date.now();

      if (
        force > SHAKE_THRESHOLD &&
        now - state.lastShakeAt > SHAKE_COOLDOWN_MS
      ) {
        state.lastShakeAt = now;
        executeState("ZOOMIES");
      }
    });
  } catch {
    // Motion is native-first; browser dev can run without it.
  }
}

function armIgnoredReminderAccident(minutes) {
  if (state.careAccidentTimer) {
    window.clearTimeout(state.careAccidentTimer);
  }

  state.careReminderDueAt = Date.now() + minutes * 60_000;
  state.careReminderMet = false;
  state.careAccidentTimer = window.setTimeout(
    () => {
      triggerIgnoredReminderAccident();
    },
    minutes * 60_000 + 90_000
  );
}

function setWheelOpen(open) {
  dom.wheelContainer.classList.toggle("active", open);
  dom.wheelToggle.setAttribute("aria-expanded", open ? "true" : "false");

  if (open) {
    dom.wheelItems.classList.remove("hidden");
    return;
  }

  window.setTimeout(() => {
    if (!dom.wheelContainer.classList.contains("active")) {
      dom.wheelItems.classList.add("hidden");
    }
  }, 500);
}

function openSettings() {
  dom.settingsPanel.hidden = false;
  setWheelOpen(false);
}

function closeSettings() {
  dom.settingsPanel.hidden = true;
}

function throwBallAtRandom() {
  const target = getRandomBackyardPos({ zoomies: true });
  stopIdleAI();
  throwBall(target.x, target.y);
  startIdleAI();
  setWheelOpen(false);
}

function feedDog() {
  void tapHaptic();
  dom.status.textContent = "Treat tossed.";
  executeState("BARK");
  setWheelOpen(false);
}

function bindEvents() {
  dom.yard.addEventListener("pointerdown", (event) => {
    if (
      event.target instanceof Element &&
      event.target.closest("#settings-menu, #hud-wheel-container")
    ) {
      return;
    }

    state.careReminderMet = true;
    const worldPoint = worldPointFromClient(event.clientX, event.clientY);
    if (state.fetchMode) {
      setFetchMode(false);
      stopIdleAI();
      throwBall(worldPoint.x, worldPoint.y);
      startIdleAI();
      return;
    }

    moveDogTo(worldPoint.x, worldPoint.y);
  });

  dom.wheelToggle.addEventListener("click", () => {
    setWheelOpen(!dom.wheelContainer.classList.contains("active"));
  });

  dom.feedButton.addEventListener("click", feedDog);

  dom.cleanupButton.addEventListener("click", () => {
    void cleanYard();
    setWheelOpen(false);
  });

  dom.wheelBallButton.addEventListener("click", () => {
    setFetchMode(false);
    throwBallAtRandom();
  });

  dom.wheelSettingsButton.addEventListener("click", openSettings);

  dom.closeMenuButton.addEventListener("click", closeSettings);

  dom.settingsPanel.addEventListener("click", (event) => {
    event.stopPropagation();
  });

  dom.scaleInput.addEventListener("input", () => {
    const next = Number(dom.scaleInput.value);
    applyScale(next);
  });

  dom.alarmButton.addEventListener("click", async () => {
    const minutes = clamp(Number(dom.alarmMinutes.value) || 0, 1, 720);
    const note = String(dom.alarmNote.value || "").trim();

    try {
      await schedulePetReminder(minutes, note);
      armIgnoredReminderAccident(minutes);
      setStatus(`Reminder set for ${minutes} min from now.`);
      window.setTimeout(closeSettings, 450);
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Reminder failed.";
      setStatus(msg);
    }
  });

  window.addEventListener("resize", syncWorldScale);
  ["pointerdown", "keydown", "touchstart"].forEach((eventName) => {
    window.addEventListener(eventName, resetIdleAI, { passive: true });
  });
}

function init() {
  applyScale(loadScaleFromLocal(), { persistRemote: false });
  syncWorldScale();
  applyTimeOfDayLighting();
  window.setInterval(applyTimeOfDayLighting, 15 * 60_000);
  window.setInterval(spawnFireflies, 5000);
  spawnFireflies();
  preloadActionSprites();
  state.dirtHoles = loadDirtHolesFromLocal();
  renderDirtHoles();
  setDogAction("IDLE");
  setDogMotionState(false);
  renderDogPosition();
  bindEvents();
  startIdleAI();
  void initShakeForZoomies();
  void initFirebaseScaleSync();
  window.requestAnimationFrame(loop);
}

init();

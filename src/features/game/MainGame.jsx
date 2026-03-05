// src/features/game/MainGame.jsx
import { onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import {
  Suspense,
  lazy,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useDispatch, useSelector } from "react-redux";
import DogToy from "@/components/dog/DogToy.jsx";
import EnvironmentScene from "@/features/game/EnvironmentScene.jsx";
import { selectSettings } from "@/redux/settingsSlice.js";
import { setZip, selectUserZip } from "@/redux/userSlice.js";
import {
  bathe,
  dropFoodBowl,
  feed,
  giveWater,
  goPotty,
  ackTemperamentReveal,
  petDog,
  play,
  selectDog,
  trainObedience,
  tryConsumeFoodBowl,
} from "@/redux/dogSlice.js";
import { selectDogRenderModel } from "@/features/game/dogSelectors.js";
import { PATHS } from "@/routes.js";
import {
  selectWeatherDetails,
  selectWeatherError,
  selectWeatherLastFetchedAt,
  selectWeatherStatus,
  setWeatherError,
  setWeatherLoading,
  setWeatherSnapshot,
} from "@/redux/weatherSlice.js";
import { fetchWeatherSnapshot } from "@/features/weather/weatherApi.js";
import {
  auth as firebaseAuth,
  firebaseError,
  initFirebase,
} from "@/firebase.js";

const DogPixiView = lazy(() => import("@/components/dog/DogPixiView.jsx"));

const ACTION_META = Object.freeze({
  Feed: {
    icon: "🍖",
    hint: "Refill hunger",
    card: "from-doggerz-leaf/35 to-doggerz-treat/20",
    edge: "border-doggerz-leaf/45",
  },
  Play: {
    icon: "🎾",
    hint: "Boost happiness",
    card: "from-doggerz-leaf/30 to-doggerz-sky/20",
    edge: "border-doggerz-sky/45",
  },
  Pet: {
    icon: "🖐️",
    hint: "Build affection",
    card: "from-doggerz-leaf/30 to-doggerz-neonSoft/20",
    edge: "border-doggerz-leaf/45",
  },
  Bath: {
    icon: "🧼",
    hint: "Clean up dirt",
    card: "from-doggerz-paw/30 to-doggerz-sky/20",
    edge: "border-doggerz-paw/45",
  },
  Potty: {
    icon: "🌿",
    hint: "Prevent accidents",
    card: "from-doggerz-leaf/35 to-doggerz-neon/20",
    edge: "border-doggerz-leaf/45",
  },
  Train: {
    icon: "🎯",
    hint: "Level skills",
    card: "from-doggerz-neonSoft/30 to-doggerz-leaf/25",
    edge: "border-doggerz-leaf/45",
  },
  Interact: {
    icon: "✨",
    hint: "Open interaction sheet",
    card: "from-doggerz-bone/20 to-doggerz-neon/15",
    edge: "border-doggerz-neon/40",
  },
});

const PAW_PRINT_TTL_MS = 8000;
const PAW_PRINT_COLORS = Object.freeze({
  DIRTY: "rgba(92, 64, 42, 0.5)",
  FLEAS: "rgba(82, 56, 38, 0.6)",
  MANGE: "rgba(70, 46, 30, 0.7)",
});

function toNightBucket(timeOfDay) {
  const key = String(timeOfDay || "").toLowerCase();
  return key === "night" || key === "evening" ? "night" : "day";
}

function formatLiveClock(ts) {
  return new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
  }).format(new Date(ts));
}

function toPct(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(100, Math.round(n)));
}

function toTitle(input, fallback = "Calm") {
  const raw = String(input || "")
    .trim()
    .replace(/[_-]+/g, " ")
    .toLowerCase();
  if (!raw) return fallback;
  return raw.replace(/\b\w/g, (c) => c.toUpperCase());
}

function PawPrintSvg({ className = "" }) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <g fill="currentColor">
        <circle cx="20" cy="16" r="6" />
        <circle cx="44" cy="16" r="6" />
        <circle cx="12" cy="34" r="6" />
        <circle cx="52" cy="34" r="6" />
        <path d="M32 36c-9 0-16 7-16 16 0 7 6 12 16 12s16-5 16-12c0-9-7-16-16-16z" />
      </g>
    </svg>
  );
}

export default function MainGame({ scene, dogInteractive = true }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const dog = useSelector(selectDog);
  const settings = useSelector(selectSettings);
  const renderModel = useSelector(selectDogRenderModel);
  const userZip = useSelector(selectUserZip);
  const weatherStatus = useSelector(selectWeatherStatus);
  const weatherDetails = useSelector(selectWeatherDetails);
  const weatherError = useSelector(selectWeatherError);
  const weatherLastFetchedAt = useSelector(selectWeatherLastFetchedAt);
  const lastToySqueakAtRef = useRef(0);
  const pawPrintIdRef = useRef(0);
  const lastPawPrintRef = useRef({ x: 0, y: 0, at: 0 });
  const dogViewportRef = useRef(null);
  const [attentionTarget, setAttentionTarget] = useState(null);
  const [interactionOpen, setInteractionOpen] = useState(false);
  const [placingBowl, setPlacingBowl] = useState(false);
  const [liveNow, setLiveNow] = useState(Date.now());
  const [zipDraft, setZipDraft] = useState(userZip || "");
  const [zipTouched, setZipTouched] = useState(false);
  const [weatherBusy, setWeatherBusy] = useState(false);
  const [temperamentCardDismissed, setTemperamentCardDismissed] =
    useState(false);
  const [pawPrints, setPawPrints] = useState([]);

  const seasonMode = settings?.seasonMode || "auto";
  const reduceMotion = settings?.reduceMotion === "on";
  const reduceTransparency = settings?.reduceTransparency === true;
  const cleanlinessTier = String(dog?.cleanlinessTier || "").toUpperCase();
  const pawPrintsEnabled = ["DIRTY", "FLEAS", "MANGE"].includes(
    cleanlinessTier
  );

  const activeAnim = renderModel?.anim || "idle";
  const sceneTime = String(scene?.timeOfDay || "").toLowerCase();
  const sceneWeather = String(
    scene?.weatherKey || scene?.weather || ""
  ).toLowerCase();
  const isNightScene =
    sceneTime.includes("night") || sceneTime.includes("evening");
  const isRainScene =
    sceneWeather.includes("rain") || sceneWeather.includes("storm");
  const forceSleepForScene = isNightScene && isRainScene;
  const effectiveAnim = forceSleepForScene ? "deep_rem_sleep" : activeAnim;
  const effectiveDogSleeping =
    Boolean(renderModel?.isSleeping) || forceSleepForScene;
  const animationSpeedMultiplier = Number(
    renderModel?.animationSpeedMultiplier || 1
  );
  const toysIgnored = Boolean(renderModel?.ignoreToys);
  const holes = Array.isArray(dog?.yard?.holes) ? dog.yard.holes : [];
  const foodBowl = dog?.yard?.foodBowl || null;
  const premiumKibbleCount = Math.max(
    0,
    Math.floor(Number(dog?.inventory?.premiumKibble || 0))
  );
  const overallLevel = Math.max(1, Math.floor(Number(dog?.level || 1)));
  const stageLabel = String(
    dog?.lifeStage?.label || renderModel?.stageLabel || "Puppy"
  );
  const ageDays = Math.max(0, Math.floor(Number(dog?.lifeStage?.days || 0)));
  const moodLabel = toTitle(
    dog?.emotionCue || dog?.animation?.mood || dog?.mood || "ok"
  );
  const hungerPct = toPct(dog?.stats?.hunger);
  const energyPct = toPct(dog?.stats?.energy);
  const healthPct = toPct(dog?.stats?.health);
  const zipIsValid = /^\d{5}$/.test(String(zipDraft || "").trim());
  const effectiveZip = userZip || zipDraft || "10001";
  const controlsDisabled = !dogInteractive;
  const temperamentReady = Boolean(
    dog?.temperament?.revealReady && !dog?.temperament?.revealedAt
  );
  const temperamentCardCopy = useMemo(() => {
    const primary = String(dog?.temperament?.primary || "SWEET").toUpperCase();
    const secondary = String(
      dog?.temperament?.secondary || "CHILL"
    ).toUpperCase();
    const byPrimary = {
      SWEET:
        "Your care pattern built a trusting, people-first pup that seeks connection.",
      CHILL:
        "Your steady routine shaped a calm, balanced temperament with dependable habits.",
      SPICY:
        "Your pup developed a bold, independent streak and tests boundaries more often.",
    };
    const bySecondary = {
      SWEET: "Warm social responses and fast emotional recovery.",
      CHILL: "Stable mood and good self-regulation.",
      SPICY: "Higher reactivity, stronger autonomy, and selective obedience.",
    };
    return {
      title: "2-Week Temperament Card Ready",
      summary: byPrimary[primary] || byPrimary.CHILL,
      detail: bySecondary[secondary] || bySecondary.CHILL,
      primary,
      secondary,
    };
  }, [dog?.temperament?.primary, dog?.temperament?.secondary]);

  useEffect(() => {
    if (pawPrintsEnabled) return;
    setPawPrints([]);
    lastPawPrintRef.current = { x: 0, y: 0, at: 0 };
  }, [pawPrintsEnabled]);

  const handleDogPositionChange = useCallback(
    (pos) => {
      if (!pawPrintsEnabled) return;
      if (!pos?.moving) return;
      const now = Date.now();
      const last = lastPawPrintRef.current;
      const dx = Number(pos.x || 0) - Number(last.x || 0);
      const dy = Number(pos.y || 0) - Number(last.y || 0);
      const dist = Math.hypot(dx, dy);
      const minDist = cleanlinessTier === "DIRTY" ? 22 : 18;
      const minMs =
        cleanlinessTier === "DIRTY"
          ? 420
          : cleanlinessTier === "FLEAS"
            ? 320
            : 260;
      if (now - last.at < minMs && dist < minDist) return;

      lastPawPrintRef.current = { x: pos.x, y: pos.y, at: now };
      const size = cleanlinessTier === "MANGE" ? 22 : 18;
      const rot = (pos.facing < 0 ? 180 : 0) + (Math.random() * 50 - 25);
      const fill =
        PAW_PRINT_COLORS[cleanlinessTier] ||
        PAW_PRINT_COLORS.DIRTY ||
        "rgba(92, 64, 42, 0.5)";

      setPawPrints((prev) => {
        const fresh = prev.filter(
          (p) => now - Number(p.createdAt || 0) < PAW_PRINT_TTL_MS
        );
        const next = {
          id: ++pawPrintIdRef.current,
          x: pos.x,
          y: pos.y,
          rot,
          size,
          fill,
          createdAt: now,
        };
        return [...fresh, next];
      });
    },
    [cleanlinessTier, pawPrintsEnabled]
  );

  const handleToySqueak = useCallback(
    (point) => {
      if (controlsDisabled) return;
      if (toysIgnored) return;
      const now = Date.now();
      if (now - lastToySqueakAtRef.current < 600) return;
      lastToySqueakAtRef.current = now;

      const rect = dogViewportRef.current?.getBoundingClientRect?.();
      const rawX = Number(point?.x);
      const rawY = Number(point?.y);
      if (rect && Number.isFinite(rawX) && Number.isFinite(rawY)) {
        const xNorm = Math.max(0, Math.min(1, (rawX - rect.left) / rect.width));
        const yNorm = Math.max(0, Math.min(1, (rawY - rect.top) / rect.height));
        setAttentionTarget({ xNorm, yNorm, at: now });
      }

      dispatch(play({ now, source: "toy" }));
    },
    [controlsDisabled, dispatch, toysIgnored]
  );

  const handleViewportPointerDown = useCallback(
    (event) => {
      if (controlsDisabled) return;
      if (!placingBowl) return;
      const rect = dogViewportRef.current?.getBoundingClientRect?.();
      if (!rect) return;

      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const xNorm = Math.max(0, Math.min(1, x / rect.width));
      const yNorm = Math.max(0, Math.min(1, y / rect.height));
      const now = Date.now();

      dispatch(
        dropFoodBowl({
          now,
          xNorm,
          yNorm,
          readyDelayMs: 800,
        })
      );

      setPlacingBowl(false);
      setInteractionOpen(false);

      // Nudge the FSM to consume soon without waiting for the next tick.
      setTimeout(() => {
        dispatch(tryConsumeFoodBowl({ now: Date.now() }));
      }, 1000);
    },
    [controlsDisabled, dispatch, placingBowl]
  );

  useEffect(() => {
    const timer = window.setInterval(() => setLiveNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    console.log("MainGame mounted!");

    const { auth: initializedAuth } = initFirebase();
    const auth = initializedAuth || firebaseAuth;
    if (!auth) {
      console.warn(
        "[Doggerz] MainGame auth listener skipped: Firebase unavailable.",
        firebaseError?.message || ""
      );
      return undefined;
    }

    console.log("Auth currentUser immediately:", auth.currentUser);

    const unsub = onAuthStateChanged(auth, (user) => {
      console.log(
        "AUTH STATE CHANGED:",
        user ? { uid: user.uid, isAnonymous: user.isAnonymous } : null
      );
    });

    return () => unsub();
  }, []);

  useEffect(() => {
    if (zipTouched) return;
    setZipDraft(userZip || "");
  }, [userZip, zipTouched]);

  useEffect(() => {
    if (!temperamentReady) {
      setTemperamentCardDismissed(false);
    }
  }, [temperamentReady]);

  const refreshWeatherNow = useCallback(
    async (zipValue) => {
      const nextZip = String(zipValue || "").trim();
      if (!/^\d{5}$/.test(nextZip)) return;

      setWeatherBusy(true);
      dispatch(setWeatherLoading({ zip: nextZip }));
      try {
        const snapshot = await fetchWeatherSnapshot({ zip: nextZip });
        dispatch(setWeatherSnapshot(snapshot));
      } catch (err) {
        dispatch(setWeatherError(err?.message || "Weather refresh failed"));
      } finally {
        setWeatherBusy(false);
      }
    },
    [dispatch]
  );

  return (
    <div className="relative min-h-dvh">
      <EnvironmentScene
        season={seasonMode}
        timeOfDay={toNightBucket(scene?.timeOfDay)}
        weather={scene?.weatherKey || "clear"}
        reduceMotion={reduceMotion}
        reduceTransparency={reduceTransparency}
        holes={holes}
      />

      <div className="relative z-20 mx-auto w-full max-w-6xl px-4 py-6 sm:py-8">
        <div className="rounded-[28px] border border-doggerz-leaf/35 bg-black/45 p-4 shadow-[0_18px_48px_rgba(2,6,23,0.65)] backdrop-blur-md sm:p-6">
          <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-doggerz-paw">
            <span className="rounded-full border border-doggerz-leaf/40 bg-doggerz-neon/15 px-3 py-1">
              {scene?.label || "Backyard"}
            </span>
            <span className="rounded-full border border-doggerz-leaf/40 bg-doggerz-neon/15 px-3 py-1">
              {scene?.timeOfDay || "Day"}
            </span>
            <span className="rounded-full border border-doggerz-leaf/40 bg-doggerz-neon/15 px-3 py-1">
              {scene?.weather || "Clear"}
            </span>
          </div>

          <div className="mt-3 grid gap-2 rounded-2xl border border-doggerz-leaf/30 bg-black/40 p-3 sm:grid-cols-[1fr_auto] sm:items-center">
            <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-doggerz-paw">
              <span className="rounded-full border border-doggerz-leaf/40 bg-doggerz-neon/15 px-2.5 py-1">
                Local Time: {formatLiveClock(liveNow)}
              </span>
              <span className="rounded-full border border-doggerz-leaf/40 bg-doggerz-neon/15 px-2.5 py-1">
                ZIP: {effectiveZip}
              </span>
              {weatherDetails?.name ? (
                <span className="rounded-full border border-doggerz-leaf/40 bg-doggerz-neon/15 px-2.5 py-1 normal-case tracking-normal">
                  {weatherDetails.name}
                </span>
              ) : null}
              {weatherLastFetchedAt ? (
                <span className="rounded-full border border-doggerz-leaf/25 bg-black/30 px-2.5 py-1 normal-case tracking-normal text-doggerz-paw/70">
                  Updated{" "}
                  {new Intl.DateTimeFormat(undefined, {
                    hour: "numeric",
                    minute: "2-digit",
                  }).format(new Date(weatherLastFetchedAt))}
                </span>
              ) : null}
            </div>
            <form
              className="flex items-center gap-2"
              onSubmit={(event) => {
                event.preventDefault();
                const nextZip = String(zipDraft || "").trim();
                if (!/^\d{5}$/.test(nextZip)) return;
                dispatch(setZip(nextZip));
                setZipTouched(false);
                refreshWeatherNow(nextZip);
              }}
            >
              <input
                type="text"
                inputMode="numeric"
                maxLength={5}
                value={zipDraft}
                onChange={(event) => {
                  const onlyDigits = event.target.value.replace(/\D/g, "");
                  setZipDraft(onlyDigits.slice(0, 5));
                  setZipTouched(true);
                }}
                placeholder="ZIP"
                className="w-24 rounded-xl border border-doggerz-leaf/35 bg-black/55 px-3 py-2 text-sm font-semibold text-doggerz-bone outline-none transition focus:border-doggerz-neon"
                aria-label="Zip code"
              />
              <button
                type="submit"
                disabled={!zipIsValid || weatherBusy}
                className="rounded-xl border border-doggerz-leaf/40 bg-doggerz-neon/20 px-3 py-2 text-xs font-bold uppercase tracking-[0.14em] text-doggerz-bone transition hover:bg-doggerz-neon/30 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {weatherBusy ? "Updating" : "Update"}
              </button>
            </form>
          </div>

          {weatherStatus === "error" && weatherError ? (
            <div className="mt-2 rounded-xl border border-rose-400/30 bg-rose-950/35 px-3 py-2 text-xs text-rose-100">
              Weather update failed: {weatherError}
            </div>
          ) : null}

          <div className="mt-3 text-2xl font-black tracking-tight text-doggerz-bone sm:text-3xl">
            {dog?.name || "Your pup"}
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
            <HudChip label="Level" value={`Lv ${overallLevel}`} />
            <HudChip label="Age" value={`${ageDays}d`} />
            <HudChip label="Stage" value={stageLabel} />
            <HudChip label="Mood" value={moodLabel} />
            <HudChip label="Energy" value={`${energyPct}%`} />
            <HudChip label="Health" value={`${healthPct}%`} />
          </div>
          <div className="mt-2 text-xs text-doggerz-paw/80">
            Hunger: {hungerPct}%
          </div>

          <div className="mt-4 rounded-3xl border border-doggerz-leaf/35 bg-black/30 px-2 py-4 sm:px-4">
            <div
              ref={dogViewportRef}
              className="relative flex items-center justify-center overflow-hidden rounded-[24px] border border-doggerz-leaf/25 bg-black/20"
              onPointerDown={handleViewportPointerDown}
            >
              <div className="pointer-events-none absolute inset-0 z-0">
                <div
                  className="absolute inset-0"
                  style={{
                    background: isNightScene
                      ? "linear-gradient(180deg, rgba(13,24,46,0.88) 0%, rgba(9,15,30,0.86) 45%, rgba(5,8,18,0.92) 100%)"
                      : "linear-gradient(180deg, rgba(127,212,255,0.75) 0%, rgba(86,156,228,0.72) 46%, rgba(39,70,120,0.78) 100%)",
                  }}
                />
                <div
                  className="absolute inset-x-0 top-[38%] h-[20%]"
                  style={{
                    background:
                      "repeating-linear-gradient(90deg, rgba(202,160,102,0.78) 0 10px, rgba(181,141,88,0.74) 10px 20px)",
                    borderTop: "2px solid rgba(116,83,48,0.8)",
                    borderBottom: "2px solid rgba(104,74,43,0.75)",
                  }}
                />
                <div
                  className="absolute inset-x-0 bottom-0 h-[42%]"
                  style={{
                    background: isNightScene
                      ? "linear-gradient(180deg, rgba(33,78,42,0.9) 0%, rgba(20,51,28,0.94) 100%)"
                      : "linear-gradient(180deg, rgba(64,151,72,0.9) 0%, rgba(34,102,42,0.94) 100%)",
                  }}
                />
                <div
                  className="absolute inset-x-0 bottom-0 h-[42%]"
                  style={{
                    backgroundImage:
                      "radial-gradient(circle at 5px 5px, rgba(255,255,255,0.14) 1px, transparent 1.2px)",
                    backgroundSize: "12px 12px",
                    opacity: 0.25,
                  }}
                />
                <div className="absolute right-6 bottom-[26%] h-28 w-24">
                  <div className="absolute bottom-0 left-[44%] h-16 w-4 -translate-x-1/2 rounded-t bg-[#5f4228]/90" />
                  <div className="absolute bottom-10 left-1/2 h-16 w-20 -translate-x-1/2 rounded-[50%] bg-[#2f6f3b]/90 blur-[0.3px]" />
                  <div className="absolute bottom-16 left-1/2 h-14 w-16 -translate-x-1/2 rounded-[50%] bg-[#2a5e32]/88" />
                </div>
                <div className="absolute left-4 bottom-[22%] h-40 w-28 opacity-95">
                  <div className="absolute bottom-0 left-1/2 h-24 w-5 -translate-x-1/2 rounded-t bg-[#5b3f27]/95" />
                  <div className="absolute bottom-14 left-1/2 h-20 w-24 -translate-x-1/2 rounded-[50%] bg-[#366f3f]/95" />
                  <div className="absolute bottom-24 left-1/2 h-16 w-20 -translate-x-1/2 rounded-[50%] bg-[#2d5f35]/92" />
                </div>
              </div>
              {isRainScene ? (
                <div
                  className="pointer-events-none absolute inset-0 z-10 overflow-hidden"
                  style={{ opacity: 0.78 }}
                >
                  <div
                    className="absolute -inset-[18%]"
                    style={{
                      backgroundImage:
                        "repeating-linear-gradient(106deg, rgba(191,219,254,0) 0px, rgba(191,219,254,0) 10px, rgba(191,219,254,0.82) 11px, rgba(191,219,254,0.82) 12px)",
                      animation: reduceMotion
                        ? "none"
                        : "dgViewportRain 0.62s linear infinite",
                    }}
                  />
                </div>
              ) : null}
              {pawPrints.length > 0 ? (
                <div className="pointer-events-none absolute inset-0 z-20">
                  {pawPrints.map((print) => (
                    <span
                      key={print.id}
                      className="mud-paw-print"
                      style={{
                        left: `${Number(print.x || 0)}px`,
                        top: `${Number(print.y || 0)}px`,
                        width: `${Number(print.size || 18)}px`,
                        height: `${Number(print.size || 18)}px`,
                        transform: `translate(-50%, -50%) rotate(${Number(
                          print.rot || 0
                        )}deg)`,
                        color: print.fill,
                      }}
                    >
                      <PawPrintSvg className="h-full w-full" />
                    </span>
                  ))}
                </div>
              ) : null}
              <Suspense
                fallback={
                  <div className="flex h-[340px] w-full max-w-[540px] items-center justify-center rounded-3xl border border-doggerz-leaf/30 bg-black/30 text-xs uppercase tracking-[0.2em] text-doggerz-paw/80">
                    Loading Pup
                  </div>
                }
              >
                <div className="relative z-30 w-full max-w-[540px]">
                  <DogPixiView
                    stage={renderModel?.stage}
                    condition={renderModel?.condition}
                    anim={effectiveAnim}
                    width="100%"
                    height={340}
                    scale={1.6}
                    animSpeedMultiplier={animationSpeedMultiplier}
                    attentionTarget={attentionTarget}
                    bondValue={Number(dog?.bond?.value ?? 0)}
                    dogIsSleeping={effectiveDogSleeping}
                    onPositionChange={handleDogPositionChange}
                  />
                </div>
              </Suspense>
              {foodBowl ? (
                <div
                  className="dog-bowl pointer-events-none absolute z-20 grid h-10 w-12 place-items-center rounded-full border border-doggerz-bone/60 bg-doggerz-bone/25 text-lg shadow-[0_8px_20px_rgba(2,6,23,0.35)]"
                  style={{
                    left: `${foodBowl.xNorm * 100}%`,
                    top: `${foodBowl.yNorm * 100}%`,
                    transform: "translate(-50%, -50%)",
                  }}
                  aria-hidden="true"
                >
                  🥣
                </div>
              ) : null}
              {placingBowl ? (
                <div className="pointer-events-none absolute bottom-3 left-1/2 z-30 -translate-x-1/2 rounded-full border border-white/15 bg-black/70 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-doggerz-bone">
                  Tap to place bowl
                </div>
              ) : null}
              {!effectiveDogSleeping ? (
                <DogToy
                  onSqueak={handleToySqueak}
                  className="bottom-3 right-3 left-auto top-auto z-30 h-11 w-11"
                />
              ) : null}
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
            <ActionButton
              label="Interact"
              disabled={controlsDisabled}
              onClick={() => setInteractionOpen(true)}
            />
            <ActionButton
              label="Play"
              disabled={controlsDisabled || toysIgnored}
              onClick={() => {
                if (toysIgnored) return;
                dispatch(play({ now: Date.now(), source: "toy" }));
              }}
            />
            <ActionButton
              label="Pet"
              disabled={controlsDisabled}
              onClick={() => dispatch(petDog({ now: Date.now() }))}
            />
            <ActionButton
              label="Bath"
              disabled={controlsDisabled}
              onClick={() => dispatch(bathe({ now: Date.now() }))}
            />
            <ActionButton
              label="Potty"
              disabled={controlsDisabled}
              onClick={() => dispatch(goPotty({ now: Date.now() }))}
            />
            <ActionButton
              label="Train"
              disabled={controlsDisabled}
              onClick={() =>
                dispatch(
                  trainObedience({
                    now: Date.now(),
                    commandId: "sit",
                    input: "button",
                  })
                )
              }
            />
          </div>
        </div>
      </div>
      {temperamentReady && !temperamentCardDismissed ? (
        <TemperamentRevealCard
          copy={temperamentCardCopy}
          onLater={() => setTemperamentCardDismissed(true)}
          onReveal={() => {
            dispatch(ackTemperamentReveal({ now: Date.now() }));
            navigate(PATHS.TEMPERAMENT_REVEAL);
          }}
        />
      ) : null}
      {interactionOpen ? (
        <InteractionSheet
          onClose={() => setInteractionOpen(false)}
          onDropBowl={() => {
            setPlacingBowl(true);
            setInteractionOpen(false);
          }}
          onGiveWater={() => {
            dispatch(giveWater({ now: Date.now() }));
            setInteractionOpen(false);
          }}
          onPlay={() => {
            if (toysIgnored) {
              setInteractionOpen(false);
              return;
            }
            dispatch(play({ now: Date.now() }));
            setInteractionOpen(false);
          }}
          onFeedRegular={() => {
            dispatch(feed({ now: Date.now(), foodType: "regular_kibble" }));
            setInteractionOpen(false);
          }}
          onFeedHuman={() => {
            dispatch(feed({ now: Date.now(), foodType: "human_food" }));
            setInteractionOpen(false);
          }}
          onFeedPremium={() => {
            dispatch(feed({ now: Date.now(), foodType: "premium_kibble" }));
            setInteractionOpen(false);
          }}
          premiumKibbleCount={premiumKibbleCount}
          onPet={() => {
            dispatch(petDog({ now: Date.now() }));
            setInteractionOpen(false);
          }}
          onBath={() => {
            dispatch(bathe({ now: Date.now() }));
            setInteractionOpen(false);
          }}
          onPotty={() => {
            dispatch(goPotty({ now: Date.now() }));
            setInteractionOpen(false);
          }}
          onTrain={() => {
            dispatch(
              trainObedience({
                now: Date.now(),
                commandId: "sit",
                input: "button",
              })
            );
            setInteractionOpen(false);
          }}
        />
      ) : null}
      <style>
        {`@keyframes dgViewportRain {
  0% { transform: translate3d(0, 0, 0); }
  100% { transform: translate3d(-30px, 120px, 0); }
}`}
      </style>
    </div>
  );
}

function TemperamentRevealCard({ copy, onLater, onReveal }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4">
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

function ActionButton({ label, onClick, disabled = false }) {
  const meta = ACTION_META[label] || ACTION_META.Play;

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`group relative overflow-hidden rounded-2xl border px-3 py-3 text-left transition active:translate-y-[1px] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-45 ${meta.edge} bg-gradient-to-b ${meta.card} shadow-[0_10px_22px_rgba(2,6,23,0.25)] hover:brightness-110`}
    >
      <div className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.3),transparent_55%)]" />
      <div className="relative flex items-center gap-2">
        <span className="grid h-8 w-8 place-items-center rounded-xl border border-white/20 bg-black/25 text-base">
          {meta.icon}
        </span>
        <span>
          <span className="block text-sm font-bold text-doggerz-bone">
            {label}
          </span>
          <span className="block text-[10px] uppercase tracking-[0.14em] text-doggerz-paw/75">
            {meta.hint}
          </span>
        </span>
      </div>
    </button>
  );
}

function InteractionSheet({
  onClose,
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
  onTrain,
}) {
  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/45 p-4 sm:p-6">
      <div className="w-full max-w-xl rounded-[28px] border border-doggerz-leaf/30 bg-black/85 p-4 text-doggerz-bone shadow-[0_18px_48px_rgba(2,6,23,0.65)] backdrop-blur-md">
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold uppercase tracking-[0.2em] text-doggerz-paw">
            Interactions
          </div>
          <div className="rounded-full border border-white/15 bg-black/40 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-100">
            Premium bowls: {premiumKibbleCount}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-doggerz-bone hover:bg-white/10"
          >
            Close
          </button>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
          <SheetButton
            label="Feed Regular Kibble"
            icon="🦴"
            onClick={onFeedRegular}
          />
          <SheetButton
            label="Feed Human Food"
            icon="🍟"
            onClick={onFeedHuman}
          />
          <SheetButton
            label="Feed Premium Kibble"
            icon="🥩"
            onClick={onFeedPremium}
            disabled={premiumKibbleCount <= 0}
          />
          <SheetButton label="Drop Food Bowl" icon="🥣" onClick={onDropBowl} />
          <SheetButton label="Give Water" icon="💧" onClick={onGiveWater} />
          <SheetButton label="Play" icon="🎾" onClick={onPlay} />
          <SheetButton label="Pet" icon="🖐️" onClick={onPet} />
          <SheetButton label="Bath" icon="🧼" onClick={onBath} />
          <SheetButton label="Potty" icon="🌿" onClick={onPotty} />
          <SheetButton label="Train" icon="🎯" onClick={onTrain} />
        </div>
      </div>
    </div>
  );
}

function SheetButton({ label, icon, onClick, disabled = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="group flex items-center gap-2 rounded-2xl border border-doggerz-leaf/30 bg-black/40 px-3 py-3 text-left text-sm font-semibold text-doggerz-bone transition hover:border-doggerz-neon/60 hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-60"
    >
      <span className="grid h-9 w-9 place-items-center rounded-xl border border-white/20 bg-black/25 text-base">
        {icon}
      </span>
      <span className="leading-tight">{label}</span>
    </button>
  );
}

function HudChip({ label, value }) {
  return (
    <div className="rounded-xl border border-doggerz-leaf/35 bg-black/35 px-3 py-2">
      <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-doggerz-paw/85">
        {label}
      </div>
      <div className="mt-0.5 text-sm font-bold text-doggerz-bone">{value}</div>
    </div>
  );
}

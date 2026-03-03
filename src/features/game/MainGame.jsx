// src/features/game/MainGame.jsx
import { onAuthStateChanged } from "firebase/auth";
import {
  Suspense,
  lazy,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { useDispatch, useSelector } from "react-redux";
import DogToy from "@/components/ui/DogToy.jsx";
import EnvironmentScene from "@/features/game/EnvironmentScene.jsx";
import { selectSettings } from "@/redux/settingsSlice.js";
import { setZip, selectUserZip } from "@/redux/userSlice.js";
import {
  bathe,
  dropFoodBowl,
  giveWater,
  goPotty,
  petDog,
  play,
  selectDog,
  trainObedience,
  tryConsumeFoodBowl,
} from "@/redux/dogSlice.js";
import { selectDogRenderModel } from "@/features/game/dogSelectors.js";
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

export default function MainGame({ scene }) {
  const dispatch = useDispatch();
  const dog = useSelector(selectDog);
  const settings = useSelector(selectSettings);
  const renderModel = useSelector(selectDogRenderModel);
  const userZip = useSelector(selectUserZip);
  const weatherStatus = useSelector(selectWeatherStatus);
  const weatherDetails = useSelector(selectWeatherDetails);
  const weatherError = useSelector(selectWeatherError);
  const weatherLastFetchedAt = useSelector(selectWeatherLastFetchedAt);
  const lastToySqueakAtRef = useRef(0);
  const dogViewportRef = useRef(null);
  const [attentionTarget, setAttentionTarget] = useState(null);
  const [interactionOpen, setInteractionOpen] = useState(false);
  const [placingBowl, setPlacingBowl] = useState(false);
  const [liveNow, setLiveNow] = useState(Date.now());
  const [zipDraft, setZipDraft] = useState(userZip || "");
  const [zipTouched, setZipTouched] = useState(false);
  const [weatherBusy, setWeatherBusy] = useState(false);

  const seasonMode = settings?.seasonMode || "auto";
  const reduceMotion = settings?.reduceMotion === "on";
  const reduceTransparency = settings?.reduceTransparency === true;

  const activeAnim = renderModel?.anim || "idle";
  const holes = Array.isArray(dog?.yard?.holes) ? dog.yard.holes : [];
  const foodBowl = dog?.yard?.foodBowl || null;
  const zipIsValid = /^\d{5}$/.test(String(zipDraft || "").trim());
  const effectiveZip = userZip || zipDraft || "10001";

  const handleToySqueak = useCallback(
    (point) => {
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
    [dispatch]
  );

  const handleViewportPointerDown = useCallback(
    (event) => {
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
    [dispatch, placingBowl]
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
        <div className="rounded-[28px] border border-doggerz-leaf/30 bg-black/55 p-4 shadow-[0_18px_48px_rgba(2,6,23,0.65)] backdrop-blur-md sm:p-6">
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

          <div className="mt-4 rounded-3xl border border-doggerz-leaf/30 bg-black/45 px-2 py-4 sm:px-4">
            <div
              ref={dogViewportRef}
              className="relative flex items-center justify-center"
              onPointerDown={handleViewportPointerDown}
            >
              <Suspense
                fallback={
                  <div className="flex h-[320px] w-[420px] items-center justify-center rounded-3xl border border-doggerz-leaf/30 bg-black/40 text-xs uppercase tracking-[0.2em] text-doggerz-paw/80">
                    Loading Pup
                  </div>
                }
              >
                <DogPixiView
                  stage={renderModel?.stage}
                  condition={renderModel?.condition}
                  anim={activeAnim}
                  width={420}
                  height={320}
                  scale={2.25}
                  attentionTarget={attentionTarget}
                  bondValue={Number(dog?.bond?.value ?? 0)}
                  dogIsSleeping={Boolean(renderModel?.isSleeping)}
                />
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
              <DogToy
                onSqueak={handleToySqueak}
                className="left-4 top-4 z-30 h-14 w-14"
              />
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
            <ActionButton
              label="Interact"
              onClick={() => setInteractionOpen(true)}
            />
            <ActionButton
              label="Play"
              onClick={() => dispatch(play({ now: Date.now() }))}
            />
            <ActionButton
              label="Pet"
              onClick={() => dispatch(petDog({ now: Date.now() }))}
            />
            <ActionButton
              label="Bath"
              onClick={() => dispatch(bathe({ now: Date.now() }))}
            />
            <ActionButton
              label="Potty"
              onClick={() => dispatch(goPotty({ now: Date.now() }))}
            />
            <ActionButton
              label="Train"
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
            dispatch(play({ now: Date.now() }));
            setInteractionOpen(false);
          }}
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
    </div>
  );
}

function ActionButton({ label, onClick }) {
  const meta = ACTION_META[label] || ACTION_META.Play;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`group relative overflow-hidden rounded-2xl border px-3 py-3 text-left transition active:translate-y-[1px] active:scale-[0.99] ${meta.edge} bg-gradient-to-b ${meta.card} shadow-[0_10px_22px_rgba(2,6,23,0.25)] hover:brightness-110`}
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
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-doggerz-bone hover:bg-white/10"
          >
            Close
          </button>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
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

function SheetButton({ label, icon, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex items-center gap-2 rounded-2xl border border-doggerz-leaf/30 bg-black/40 px-3 py-3 text-left text-sm font-semibold text-doggerz-bone transition hover:border-doggerz-neon/60 hover:bg-white/5"
    >
      <span className="grid h-9 w-9 place-items-center rounded-xl border border-white/20 bg-black/25 text-base">
        {icon}
      </span>
      <span className="leading-tight">{label}</span>
    </button>
  );
}

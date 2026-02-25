// src/features/game/MainGame.jsx

import { useCallback, useEffect, useMemo, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import DogPixiView from "@/components/DogPixiView.jsx";
import EnvironmentScene from "@/features/game/EnvironmentScene.jsx";
import { selectSettings } from "@/redux/settingsSlice.js";
import { selectUserZip } from "@/redux/userSlice.js";
import {
  feed,
  play,
  petDog,
  bathe,
  goPotty,
  trainObedience,
  triggerManualAction,
} from "@/redux/dogSlice.js";
import { selectDog } from "@/redux/dogSlice.js";
import { selectDogRenderModel } from "@/features/game/dogSelectors.js";
import { useLivingIdle } from "@/hooks/useLivingIdle.js";
import { useContinuousAging } from "@/hooks/useContinuousAging.js";
import { useRealWeather } from "@/hooks/useRealWeather.js";
import { useWalkToTarget } from "@/hooks/useWalkToTarget.js";
import "./Yard.css";

const DOG_MIN_X = 8;
const DOG_MAX_X = 92;
const DOG_MIN_Y = 0;
const DOG_MAX_Y = 100;
const WALKABLE_TOP_PCT = 47;
const WALKABLE_HEIGHT_PCT = 45;

function clamp(value, min, max) {
  return Math.min(
    max,
    Math.max(min, Number.isFinite(Number(value)) ? Number(value) : min)
  );
}

function toNightBucket(timeOfDay) {
  const key = String(timeOfDay || "").toLowerCase();
  return key === "night" || key === "evening" ? "night" : "day";
}

function normalizeWeatherForEnvironment(raw) {
  const key = String(raw || "clear").toLowerCase();
  if (key.includes("snow")) return "snow";
  if (key.includes("rain") || key.includes("storm")) return "rain";
  if (key.includes("cloud")) return "cloudy";
  return "clear";
}

function getAmbientCadence({ isSleeping, energy, isNight }) {
  if (isSleeping || energy <= 24) return "chill";
  if (isNight) return "chill";
  if (energy >= 75) return "active";
  return "balanced";
}

function getDepthMultiplier(yPct) {
  const y = clamp(yPct, 0, 100);
  return 0.52 + (y / 100) * 0.56;
}

function mapYToScreenTop(yPct) {
  const y = clamp(yPct, 0, 100);
  return WALKABLE_TOP_PCT + (y / 100) * WALKABLE_HEIGHT_PCT;
}

function mapScreenTopToWorldY(screenTopPct) {
  const normalized = (screenTopPct - WALKABLE_TOP_PCT) / WALKABLE_HEIGHT_PCT;
  return clamp(normalized * 100, DOG_MIN_Y, DOG_MAX_Y);
}

function resolveIdleAnim(activeAnim, idleAction, isSleeping, isWalking) {
  if (isSleeping) return "sleep";
  if (isWalking) return "walk";
  if (activeAnim !== "idle" && activeAnim !== "wag") return activeAnim;
  if (idleAction === "tail_wag") return "wag";
  if (idleAction === "sniff" || idleAction === "ear_twitch") return "bark";
  return activeAnim;
}

function getWeatherLabel(weatherKey) {
  if (weatherKey === "rain") return "Rain";
  if (weatherKey === "snow") return "Snow";
  if (weatherKey === "cloudy") return "Cloudy";
  return "Clear";
}

export default function MainGame({ scene }) {
  const dispatch = useDispatch();
  const dog = useSelector(selectDog);
  const settings = useSelector(selectSettings);
  const userZip = useSelector(selectUserZip);
  const renderModel = useSelector(selectDogRenderModel);

  const seasonMode = settings?.seasonMode || "auto";
  const reduceMotion = settings?.reduceMotion === "on";
  const reduceTransparency = settings?.reduceTransparency === true;
  const ambientWildlifeEnabled = settings?.showCritters !== false;

  const isNight = toNightBucket(scene?.timeOfDay) === "night";
  const energy = clamp(dog?.stats?.energy ?? 100, 0, 100);
  const cleanliness = clamp(dog?.stats?.cleanliness ?? 100, 0, 100);
  const isSleeping = Boolean(dog?.isAsleep);
  const activeAnim = renderModel?.anim || "idle";

  const yardRef = useRef(null);

  const { dogPos, walkTo, walkDuration, isWalking, cancelWalk } =
    useWalkToTarget({
      initialPos: { x: 50, y: 78 },
      speed: 30,
      coalesceMs: 140,
    });

  const { weather: realWeather } = useRealWeather(userZip, {
    pollIntervalMs: 30 * 60 * 1000,
  });

  const envWeather = normalizeWeatherForEnvironment(
    realWeather || scene?.weatherKey || "clear"
  );
  const ambientCadence = getAmbientCadence({ isSleeping, energy, isNight });

  const { gameAgeInDays, growthScale } = useContinuousAging(dog?.adoptedAt);
  const { isBlinking, idleAction, breathingScaleX, breathingScaleY } =
    useLivingIdle({
      isSleeping,
      isMoving: isWalking || activeAnim === "walk",
      energy,
    });

  const liveAnim = useMemo(
    () => resolveIdleAnim(activeAnim, idleAction, isSleeping, isWalking),
    [activeAnim, idleAction, isSleeping, isWalking]
  );

  useEffect(() => {
    if (isSleeping) {
      cancelWalk();
    }
  }, [cancelWalk, isSleeping]);

  const depthMultiplier = useMemo(
    () => getDepthMultiplier(dogPos.y),
    [dogPos.y]
  );
  const screenTopPosition = useMemo(
    () => mapYToScreenTop(dogPos.y),
    [dogPos.y]
  );

  const ageAndBreathScaleX = clamp(
    growthScale * breathingScaleX * (isBlinking ? 1.03 : 1),
    0.34,
    1.4
  );
  const ageAndBreathScaleY = clamp(
    growthScale * breathingScaleY * (isBlinking ? 0.9 : 1),
    0.3,
    1.4
  );

  const finalScaleX = clamp(ageAndBreathScaleX * depthMultiplier, 0.2, 1.8);
  const finalScaleY = clamp(ageAndBreathScaleY * depthMultiplier, 0.2, 1.8);

  const grimeBase = clamp((100 - cleanliness) / 100, 0, 1);
  const grimeTierBoost =
    renderModel?.condition === "mange"
      ? 0.2
      : renderModel?.condition === "fleas"
        ? 0.12
        : renderModel?.condition === "dirty"
          ? 0.07
          : 0;
  const grimeOpacity = clamp(grimeBase + grimeTierBoost, 0, 0.85);

  const handleGroundPointerDown = useCallback(
    (event) => {
      if (isSleeping) return;
      if (event.pointerType === "mouse" && event.button !== 0) return;

      const yard = yardRef.current;
      if (!yard) return;
      const rect = yard.getBoundingClientRect();
      if (!rect.width || !rect.height) return;

      const xPct = ((event.clientX - rect.left) / rect.width) * 100;
      const screenYPct = ((event.clientY - rect.top) / rect.height) * 100;

      const targetX = clamp(xPct, DOG_MIN_X, DOG_MAX_X);
      const targetY = mapScreenTopToWorldY(screenYPct);
      walkTo(targetX, targetY);
    },
    [isSleeping, walkTo]
  );

  const handleButterflySpotted = useCallback(() => {
    dispatch(
      triggerManualAction({
        now: Date.now(),
        action: "wag",
        stats: { happiness: 2, energy: -1 },
      })
    );
  }, [dispatch]);

  const runAction = useCallback(
    (type) => {
      const now = Date.now();
      if (type === "feed") dispatch(feed({ now }));
      if (type === "play") dispatch(play({ now }));
      if (type === "pet") dispatch(petDog({ now }));
      if (type === "bath") dispatch(bathe({ now }));
      if (type === "potty") dispatch(goPotty({ now }));
      if (type === "train") {
        dispatch(
          trainObedience({
            now,
            commandId: "sit",
            input: "button",
          })
        );
      }
    },
    [dispatch]
  );

  const walkTransitionSec = reduceMotion ? 0 : clamp(walkDuration, 0, 8);

  return (
    <div className="yard-container" ref={yardRef}>
      <EnvironmentScene
        season={seasonMode}
        timeOfDay={toNightBucket(scene?.timeOfDay)}
        weather={envWeather}
        reduceMotion={reduceMotion}
        reduceTransparency={reduceTransparency}
        ambientWildlifeEnabled={ambientWildlifeEnabled}
        ambientCadence={ambientCadence}
        dogEnergy={energy}
        dogSleeping={isSleeping}
        onButterflySpotted={handleButterflySpotted}
      />

      <div className="yard-tap-layer" onPointerDown={handleGroundPointerDown} />

      <div className="yard-hud">
        <div className="yard-chip-row">
          <div className="yard-chip">{scene?.label || "Backyard"}</div>
          <div className="yard-chip">{scene?.timeOfDay || "Day"}</div>
          <div className="yard-chip">{getWeatherLabel(envWeather)}</div>
        </div>
        <div className="yard-name">{dog?.name || "Pup"}</div>
        <div className="yard-sub">
          Age {gameAgeInDays.toFixed(2)}d · Energy {Math.round(energy)} · Depth{" "}
          {Math.round(dogPos.y)}
        </div>
        <div className="yard-sub">Tap anywhere on the yard to move</div>
      </div>

      <div className="yard-walk-zone">
        <div
          className="dog-wrapper"
          style={{
            left: `${dogPos.x}%`,
            top: `${screenTopPosition}%`,
            transform: "translate(-50%, -100%)",
            zIndex: 28 + Math.floor(clamp(dogPos.y, 0, 100)),
            transition: `left ${walkTransitionSec}s linear, top ${walkTransitionSec}s linear`,
          }}
        >
          <div
            style={{
              transform: `scale(${finalScaleX}, ${finalScaleY})`,
              transformOrigin: "50% 86%",
              transition: "transform 80ms linear",
            }}
          >
            <div className="dog-render-surface">
              <DogPixiView
                stage={renderModel?.stage}
                condition={renderModel?.condition}
                anim={liveAnim}
                width={460}
                height={340}
                scale={2.24}
              />
              <div
                className="dog-grime-layer"
                style={{ opacity: grimeOpacity }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="yard-bottom-ui">
        <div className="yard-action-dock">
          <ActionButton label="Feed" onClick={() => runAction("feed")} />
          <ActionButton label="Play" onClick={() => runAction("play")} />
          <ActionButton label="Pet" onClick={() => runAction("pet")} />
          <ActionButton label="Bath" onClick={() => runAction("bath")} />
          <ActionButton label="Potty" onClick={() => runAction("potty")} />
          <ActionButton label="Train" onClick={() => runAction("train")} />
        </div>
      </div>
    </div>
  );
}

function ActionButton({ label, onClick }) {
  return (
    <button type="button" onClick={onClick} className="yard-action-btn">
      {label}
    </button>
  );
}

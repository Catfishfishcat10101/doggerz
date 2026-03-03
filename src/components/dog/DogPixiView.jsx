/** @format */

import { useEffect, useRef } from "react";
import * as PIXI from "pixi.js";
import { useDispatch, useSelector } from "react-redux";

import DogAnimationController from "@/pixi/DogAnimationController";
import { selectDogAnimation, oneShotFinished } from "@/redux/dogSlice";
import { mapPoseToDogAction } from "@/utils/mapPoseToDogAction";

const DogPixiView = () => {
  const containerRef = useRef(null);
  const pixiAppRef = useRef(null);
  const dogRef = useRef(null);

  // guards
  const isReadyRef = useRef(false);
  const lastOneShotRef = useRef(null); // prevents replay spam

  const dispatch = useDispatch();
  const animationState = useSelector(selectDogAnimation);

  // --------------------------
  // INIT PIXI + DOG
  // --------------------------
  useEffect(() => {
    if (!containerRef.current) return;

    const resolution = Math.min(window.devicePixelRatio || 1, 2);
    const app = new PIXI.Application({
      resizeTo: containerRef.current,
      backgroundAlpha: 0,
      antialias: true,
      autoDensity: true,
      resolution,
      powerPreference: "high-performance",
    });

    containerRef.current.appendChild(app.view);
    pixiAppRef.current = app;

    const dog = new DogAnimationController({
      atlasJsonUrl: "/sprites/puppy/puppy_v1.json",
      scale: 1,
      oneshotActions: ["bark", "jump"],
    });

    dogRef.current = dog;

    const updateDogPosition = () => {
      const currentDog = dogRef.current;
      const currentApp = pixiAppRef.current;
      if (!currentDog || !currentDog.view || !currentApp) return;

      currentDog.view.position.set(
        currentApp.renderer.width / 2,
        currentApp.renderer.height / 2
      );
    };

    (async () => {
      await dog.load();
      dog.mount(app.stage);

      updateDogPosition();

      isReadyRef.current = true;
    })();

    let resizeObserver;
    if (typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(() => {
        updateDogPosition();
      });
      resizeObserver.observe(containerRef.current);
    }

    const handleWindowResize = () => updateDogPosition();
    window.addEventListener("resize", handleWindowResize);

    return () => {
      window.removeEventListener("resize", handleWindowResize);
      if (resizeObserver) resizeObserver.disconnect();

      isReadyRef.current = false;
      lastOneShotRef.current = null;

      try {
        dog.destroy();
      } catch {
        // noop
      }
      try {
        app.destroy(true, true);
      } catch {
        // noop
      }
    };
  }, []);

  // --------------------------
  // REDUX → ANIMATION SYNC
  // --------------------------
  useEffect(() => {
    const dog = dogRef.current;
    if (!dog) return;
    if (!isReadyRef.current) return;

    const availableActions = dog.availableActions || [];

    // Apply facing every time (cheap + safe)
    if (animationState?.facing) {
      dog.setFacing(animationState.facing);
    }

    const desiredLoopRaw = animationState?.desiredAction || "idle";
    const desiredLoop = mapPoseToDogAction(desiredLoopRaw, {
      availableActions,
      allowUnknown: false,
      fallback: "idle",
    });

    // ONE-SHOT override takes priority
    const overrideRaw = animationState?.overrideAction || null;
    const overrideKey = overrideRaw ? String(overrideRaw).trim() : "";

    if (overrideKey) {
      // Prevent replay spam while overrideAction remains set during the one-shot.
      if (lastOneShotRef.current === overrideKey) return;
      lastOneShotRef.current = overrideKey;

      const oneshot = mapPoseToDogAction(overrideKey, {
        availableActions,
        allowUnknown: false,
        fallback: "idle",
      });

      dog.playOneShot(oneshot, {
        returnAction: desiredLoop,
        onComplete: () => {
          // Clear local guard first so future one-shots can run
          lastOneShotRef.current = null;
          dispatch(oneShotFinished());
        },
      });

      return;
    }

    // If no override is active, ensure our guard resets
    lastOneShotRef.current = null;

    // Otherwise apply looping mood-based animation
    dog.setAction(desiredLoop);
  }, [
    animationState?.desiredAction,
    animationState?.overrideAction,
    animationState?.facing,
    dispatch,
  ]);

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        height: "100%",
      }}
    />
  );
};

export default DogPixiView;

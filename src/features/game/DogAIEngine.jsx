// src/features/game/DogAIEngine.jsx
import React, { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  move,
  setAnimation,
  setLastAction,
  tickStats,
  selectDog,
} from "@/redux/dogSlice.js";

/**
 * DogAIEngine
 *
 * Behavioral engine that simulates:
 * - wandering left/right
 * - boredom → idle variants
 * - attention-seeking
 * - sleep conditions
 * - automatic state decay (tickStats)
 *
 * Runs internally at 60Hz movement loop
 * and a slower 2Hz behavior loop.
 */
export default function DogAIEngine() {
  const dog = useSelector(selectDog);
  const dispatch = useDispatch();

  // Movement state (local component refs, NOT Redux)
  const velocityRef = useRef(0);      // current movement speed (px/frame)
  const targetXRef = useRef(null);    // target position AI wants to move to
  const idleTimerRef = useRef(0);     // counts how long dog is idle
  const attentionCooldownRef = useRef(0);

  /* ---------------------------------------------------------
   * UTILS
   * --------------------------------------------------------- */

  const randomRange = (min, max) => Math.random() * (max - min) + min;

  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

  const sceneWidth = 320; // your GameScene width in pixels; adjust as needed
  const walkSpeed = 1.1;  // pixels per frame

  /* ---------------------------------------------------------
   * BEHAVIOR LOOP (2Hz)
   * Drives decisions: wander, sleep, attention, mood.
   * --------------------------------------------------------- */
  useEffect(() => {
    const behaviorLoop = setInterval(() => {
      if (!dog) return;

      // Tick stats slowly over time.
      dispatch(tickStats({ dt: 1 }));

      // Sleep handling
      if (dog.isAsleep) {
        dispatch(setAnimation("sleep_breath"));
        velocityRef.current = 0;
        return;
      }

      /* ----------------------- Wandering logic ----------------------- */
      idleTimerRef.current += 1;

      // If long idle → random bark or scratch handled by DogSpriteView
      if (idleTimerRef.current > 10 && Math.random() < 0.05) {
        dispatch(setAnimation("idle")); // DogSpriteView decides idle variant
      }

      // Trigger attention-seeking gesture
      if (attentionCooldownRef.current <= 0 && dog.stats.happiness < 30) {
        dispatch(setAnimation("attention"));
        dispatch(setLastAction("attention"));
        attentionCooldownRef.current = 12; // 6 seconds cooldown
      } else {
        attentionCooldownRef.current -= 1;
      }

      // Decide new wander target occasionally
      if (Math.random() < 0.15) {
        targetXRef.current = randomRange(20, sceneWidth - 20);
      }
    }, 500);

    return () => clearInterval(behaviorLoop);
  }, [dog, dispatch]);

  /* ---------------------------------------------------------
   * MOVEMENT LOOP (60Hz)
   * Moves dog toward targetXRef.
   * --------------------------------------------------------- */
  useEffect(() => {
    const movementLoop = setInterval(() => {
      if (!dog) return;

      // If asleep → no movement
      if (dog.isAsleep || targetXRef.current == null) return;

      const { x } = dog.pos;
      const targetX = targetXRef.current;

      const diff = targetX - x;

      if (Math.abs(diff) < 2) {
        // Reached target
        velocityRef.current = 0;
        dispatch(setAnimation("idle"));
        targetXRef.current = null;
        return;
      }

      // Move left or right
      const direction = diff > 0 ? 1 : -1;

      velocityRef.current = direction * walkSpeed;

      const newX = clamp(x + velocityRef.current, 0, sceneWidth - 20);

      dispatch(
        move({
          x: newX,
          y: dog.pos.y,
        })
      );

      // Set walk animation
      dispatch(setAnimation(direction > 0 ? "walk_right" : "walk_left"));

    }, 1000 / 60); // 60 FPS internal engine

    return () => clearInterval(movementLoop);
  }, [dog, dispatch]);

  return null;
}

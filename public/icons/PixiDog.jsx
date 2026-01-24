//public/icons/PixiDog.jsx
import { useEffect, useRef } from "react";
import * as PIXI from "pixi.js";
import { withBaseUrl } from "@/utils/assetUrl.js";

export default function PixiDog({
  width = 190,
  height = 190,
  mood = "neutral",
  mode = "idle",
  direction = "right",
  onPet,
}) {
  const containerRef = useRef(null);

  useEffect(() => {
    const app = new PIXI.Application({
      width,
      height,
      backgroundAlpha: 0,
      antialias: true,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true,
    });

    const host = containerRef.current;
    if (!host) return;
    host.appendChild(app.view);

    const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
    const lerp = (a, b, t) => a + (b - a) * t;

    const moodParams = (m) => {
      switch (m) {
        case "happy":
          return {
            breathSpeed: 1.15,
            breathAmp: 1.0,
            tiltAmp: 1.0,
            bright: 1.02,
            sat: 1.05,
          };
        case "playful":
          return {
            breathSpeed: 1.25,
            breathAmp: 1.15,
            tiltAmp: 1.2,
            bright: 1.02,
            sat: 1.08,
          };
        case "sad":
          return {
            breathSpeed: 0.85,
            breathAmp: 0.9,
            tiltAmp: 0.8,
            bright: 0.98,
            sat: 0.92,
          };
        case "tired":
          return {
            breathSpeed: 0.75,
            breathAmp: 0.75,
            tiltAmp: 0.7,
            bright: 0.98,
            sat: 0.95,
          };
        case "sick":
          return {
            breathSpeed: 0.7,
            breathAmp: 0.65,
            tiltAmp: 0.65,
            bright: 0.97,
            sat: 0.88,
          };
        case "neutral":
        default:
          return {
            breathSpeed: 1.0,
            breathAmp: 1.0,
            tiltAmp: 1.0,
            bright: 1.0,
            sat: 1.0,
          };
      }
    };

    const root = new PIXI.Container();
    app.stage.addChild(root);

    const bgDepth = new PIXI.Graphics();
    bgDepth.beginFill(0x000000, 0.08);
    bgDepth.drawEllipse(
      width * 0.5,
      height * 0.72,
      width * 0.42,
      height * 0.28
    );
    bgDepth.endFill();
    root.addChild(bgDepth);

    const shadow = new PIXI.Graphics();
    shadow.beginFill(0x000000, 0.33);
    shadow.drawEllipse(0, 0, width * 0.28, height * 0.06);
    shadow.endFill();
    shadow.x = width / 2;
    shadow.y = height * 0.9;
    root.addChild(shadow);

    // Sprite assets were removed; use the app icon as a stable fallback.
    const texture = PIXI.Texture.from(withBaseUrl("/icons/doggerz-192.png"));
    const dog = new PIXI.Sprite(texture);
    dog.anchor.set(0.5, 1.0);
    dog.x = width / 2;
    dog.y = height * 0.9;
    dog.scale.set(0.55);
    dog.eventMode = "static";
    dog.cursor = "pointer";
    root.addChild(dog);

    // PixiJS v7+ no longer exposes filters under `PIXI.filters` in typings.
    // `ColorMatrixFilter` is available as a top-level export.
    const cm = new PIXI.ColorMatrixFilter();
    dog.filters = [cm];

    const fx = new PIXI.Container();
    root.addChild(fx);

    const hearts = [];
    const spawnHeart = (x, y) => {
      const g = new PIXI.Graphics();
      g.beginFill(0xff4d6d, 0.95);
      g.drawCircle(-6, 0, 6);
      g.drawCircle(6, 0, 6);
      g.moveTo(-12, 2);
      g.lineTo(0, 18);
      g.lineTo(12, 2);
      g.lineTo(-12, 2);
      g.endFill();

      g.x = x;
      g.y = y;
      g.scale.set(0.9 + Math.random() * 0.3);
      g.alpha = 0.9;

      fx.addChild(g);

      hearts.push({
        node: g,
        vx: (Math.random() - 0.5) * 0.8,
        vy: -1.6 - Math.random() * 1.2,
        life: 60 + Math.floor(Math.random() * 25),
        age: 0,
      });
    };

    let petPulse = 0;
    let dir = direction === "left" ? -1 : 1;

    const doPet = () => {
      petPulse = 1;
      const hx = dog.x + (dir >= 0 ? 10 : -10);
      const hy = dog.y - height * 0.35;
      spawnHeart(hx, hy);
      spawnHeart(hx + (Math.random() * 24 - 12), hy + (Math.random() * 18 - 8));
      spawnHeart(hx + (Math.random() * 24 - 12), hy + (Math.random() * 18 - 8));
      if (typeof onPet === "function") onPet();
    };

    dog.on("pointerdown", doPet);

    let laneX = width / 2;
    const leftBound = width * 0.33;
    const rightBound = width * 0.67;

    let t = 0;
    app.ticker.add(() => {
      t += 0.02;

      const mp = moodParams(mood);

      cm.reset();
      cm.brightness(mp.bright, false);
      cm.saturate(mp.sat, false);

      const baseScale = 0.55;
      const sign = dir >= 0 ? 1 : -1;

      const breath = Math.sin(t * 1.6 * mp.breathSpeed);
      const breathY = breath * 1.5 * mp.breathAmp;
      const tilt = Math.sin(t * 0.9 * mp.breathSpeed) * 0.015 * mp.tiltAmp;

      petPulse = clamp(petPulse - 0.06, 0, 1);
      const petEase = petPulse * petPulse;
      const petBounce = petEase * 7;
      const petSquash = 1 + petEase * 0.02;

      let walkBob = 0;
      let walkSway = 0;
      if (mode === "walk") {
        const step = Math.sin(t * 6.0);
        walkBob = Math.abs(step) * 2.4;
        walkSway = Math.sin(t * 3.0) * 1.4;

        laneX += dir * 0.9;
        if (laneX < leftBound) {
          laneX = leftBound;
          dir = 1;
        } else if (laneX > rightBound) {
          laneX = rightBound;
          dir = -1;
        }
      } else {
        laneX = lerp(laneX, width / 2, 0.08);
      }

      dog.x = laneX + walkSway;
      dog.y = height * 0.9 + breathY - walkBob - petBounce;
      dog.rotation =
        tilt * 0.6 + (mode === "walk" ? Math.sin(t * 3.0) * 0.01 : 0);

      dog.scale.y =
        (baseScale + breath * 0.003 * mp.breathAmp) * (1 + petEase * 0.01);
      dog.scale.x =
        sign * ((baseScale + breath * 0.0015 * mp.breathAmp) * petSquash);

      shadow.x = dog.x;
      shadow.y = height * 0.9;

      const shadowPulse = 1 + breath * 0.03 * mp.breathAmp;
      const walkShadow =
        mode === "walk" ? 1 - Math.abs(Math.sin(t * 6.0)) * 0.08 : 1;
      const petShadow = 1 - petEase * 0.08;

      shadow.scale.x = shadowPulse * walkShadow * petShadow;
      shadow.scale.y = 1 * walkShadow * (1 - petEase * 0.05);
      shadow.alpha =
        0.3 + breath * 0.02 - (mode === "walk" ? 0.02 : 0) - petEase * 0.03;

      for (let i = hearts.length - 1; i >= 0; i--) {
        const p = hearts[i];
        p.age += 1;
        p.node.x += p.vx;
        p.node.y += p.vy;
        p.node.rotation += 0.03 * (p.vx >= 0 ? 1 : -1);
        p.node.alpha = Math.max(0, 1 - p.age / p.life);
        p.node.scale.set(p.node.scale.x * 0.999, p.node.scale.y * 0.999);

        if (p.age >= p.life) {
          fx.removeChild(p.node);
          p.node.destroy(true);
          hearts.splice(i, 1);
        }
      }
    });

    return () => {
      dog.removeAllListeners();
      app.destroy(true, { children: true });
    };
  }, [width, height, mood, mode, direction, onPet]);

  return <div ref={containerRef} style={{ width, height }} />;
}

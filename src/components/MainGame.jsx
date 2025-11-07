import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import DogSprite from "./DogSprite";
import ToyBox from "./ToyBox";
import ProgressBar from "./ProgressBar";
import {
  move,
  markAccident,
  increasePottyLevel,
  selectDog,
} from "@/redux/dogSlice";

/**
 * MainGame
 * - Self-contained “yard” with keyboard controls.
 * - Uses CSS custom props from styles.css for stage/sprite sizes.
 * - Right rail shows live bars tied to redux state.
 */
export default function MainGame() {
  const dispatch = useDispatch();
  const dog = useSelector(selectDog);
  const { hunger, happiness, energy, cleanliness } = dog.stats;
  const [flip, setFlip] = useState(false);
  const stageRef = useRef(null);

  // Focus the stage on mount so WASD works on mobile BT keyboards, too.
  useEffect(() => stageRef.current?.focus(), []);

  const SIZE =  Number(getComputedStyle(document.documentElement).getPropertyValue("--sprite-size").replace("px","")) || 96;

  function onKeyDown(e) {
    const key = e.key.toLowerCase();
    const rect = stageRef.current?.getBoundingClientRect();
    const maxX = Math.max(0, (rect?.width || 0) - SIZE);
    const maxY = Math.max(0, (rect?.height || 0) - SIZE);

    let { x, y } = dog.pos;
    if (["a", "arrowleft"].includes(key)) { x = Math.max(0, x - 14); setFlip(true); }
    if (["d", "arrowright"].includes(key)) { x = Math.min(maxX, x + 14); setFlip(false); }
    if (["w", "arrowup"].includes(key))    y = Math.max(0, y - 14);
    if (["s", "arrowdown"].includes(key))  y = Math.min(maxY, y + 14);

    if (key === " ") {
      e.preventDefault();
      dispatch(markAccident());  // 💩 for giggles
      dispatch(increasePottyLevel(-5));
      return;
    }
    if (x !== dog.pos.x || y !== dog.pos.y) dispatch(move({ x, y }));
  }

  return (
    <div className="container py-6">
      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        {/* PLAYFIELD */}
        <section className="card">
          <div
            ref={stageRef}
            tabIndex={0}
            onKeyDown={onKeyDown}
            className="stage-box outline-none relative bg-gradient-to-b from-bgd-900 to-bgd-800"
          >
            <div
              className="absolute"
              style={{
                transform: `translate(${dog.pos.x}px, ${dog.pos.y}px)`,
                width: SIZE,
                height: SIZE,
              }}
            >
              <DogSprite flip={flip} playing size={SIZE} />
            </div>

            {/* Optional right stripe for a non-color cue area */}
            <div className="yard-zone">
              <span className="yard-zone__label">Yard Zone</span>
            </div>
          </div>

          {/* Actions */}
          <ToyBox className="mt-4" />

          <p className="mt-2 text-xs opacity-70">
            Controls: <span className="kbd">WASD</span>/<span className="kbd">↑↓←→</span> to move,
            <span className="kbd ml-1">Space</span> to… well… 💩
          </p>
        </section>

        {/* HUD */}
        <aside className="space-y-4">
          <div className="card">
            <h3 className="text-lg font-semibold">Needs</h3>
            <div className="mt-3 space-y-3">
              <ProgressBar value={hunger} label="Hunger" className="" />
              <ProgressBar value={happiness} label="Happiness" fillClass="bg-pink-500" />
              <ProgressBar value={energy} label="Energy" fillClass="bg-sky-500" />
              <ProgressBar value={cleanliness} label="Cleanliness" fillClass="bg-yellow-300" />
              <ProgressBar value={dog.pottyLevel} label={`Potty ${dog.isPottyTrained ? "(Trained!)" : "Training"}`} fillClass="bg-lime-400" />
            </div>
          </div>

          <div className="card">
            <div className="text-sm opacity-80">
              Lv {dog.level} • {dog.coins} coins • Pos {dog.pos.x},{dog.pos.y}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
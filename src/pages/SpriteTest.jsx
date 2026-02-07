// src/pages/SpriteTest.jsx
// Placeholder sprite sheet test page.

import * as React from "react";

import SpriteSheetDog from "@/components/SpriteSheetDog.jsx";
import { withBaseUrl } from "@/utils/assetUrl.js";
import {
  DOG_STAGE_IDS,
  DOG_CONDITION_IDS,
  getDogAtlasUrls,
  getDogPixiSheetUrl,
  getDogStaticSpriteUrl,
} from "@/utils/dogSpritePaths.js";

const STAGES = DOG_STAGE_IDS;
const CONDITIONS = DOG_CONDITION_IDS;
const ANIMS = ["idle", "walk", "run", "sleep", "bark", "scratch"];
const SIZES = [220, 260, 300, 360];

export default function SpriteTest() {
  const [stage, setStage] = React.useState("PUPPY");
  const [anim, setAnim] = React.useState("idle");
  const [reduceMotion, setReduceMotion] = React.useState(false);
  const [size, setSize] = React.useState(320);
  const [condition, setCondition] = React.useState("clean");
  const [debug, setDebug] = React.useState(null);

  const fallbackSrc = React.useMemo(
    () => withBaseUrl("/assets/icons/doggerz-192.png"),
    []
  );
  const atlasUrls = React.useMemo(() => getDogAtlasUrls(stage), [stage]);
  const pixiUrl = React.useMemo(
    () => getDogPixiSheetUrl(stage, condition),
    [stage, condition]
  );
  const staticUrl = React.useMemo(() => getDogStaticSpriteUrl(stage), [stage]);

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Sprite Test</h1>
          <p className="text-white/70 mt-2 max-w-xl">
            Exercise static sprites, Pixi sheets, and atlases. Fallback uses the
            app icon if loading fails.
          </p>
        </div>
        <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] uppercase tracking-[0.28em] text-white/70">
          Preview Lab
        </div>
      </header>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="text-sm text-white/70 mb-3">Controls</div>

          <div className="flex flex-wrap gap-2">
            {STAGES.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setStage(s)}
                className={
                  "px-3 py-1.5 rounded-full text-sm border " +
                  (stage === s
                    ? "bg-white text-black border-white"
                    : "bg-transparent text-white border-white/20 hover:border-white/40")
                }
              >
                {s}
              </button>
            ))}
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {ANIMS.map((a) => (
              <button
                key={a}
                type="button"
                onClick={() => setAnim(a)}
                className={
                  "px-3 py-1.5 rounded-full text-sm border " +
                  (anim === a
                    ? "bg-white text-black border-white"
                    : "bg-transparent text-white border-white/20 hover:border-white/40")
                }
              >
                {a}
              </button>
            ))}
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {CONDITIONS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCondition(c)}
                className={
                  "px-3 py-1.5 rounded-full text-xs border uppercase tracking-wide " +
                  (condition === c
                    ? "bg-emerald-300 text-black border-emerald-200"
                    : "bg-transparent text-white border-white/20 hover:border-white/40")
                }
              >
                {c}
              </button>
            ))}
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {SIZES.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSize(s)}
                className={
                  "px-3 py-1.5 rounded-full text-xs border " +
                  (size === s
                    ? "bg-white text-black border-white"
                    : "bg-transparent text-white border-white/20 hover:border-white/40")
                }
              >
                {s}px
              </button>
            ))}
          </div>

          <label className="mt-4 flex items-center gap-2 text-sm text-white/80 select-none">
            <input
              type="checkbox"
              checked={reduceMotion}
              onChange={(e) => setReduceMotion(Boolean(e.target.checked))}
            />
            Reduce motion
          </label>

          <div className="mt-4 text-xs text-white/60">
            Fallback: <code>{fallbackSrc}</code>
          </div>
          <div className="mt-2 text-[11px] text-white/60 space-y-1">
            <div>
              Atlas JSON: <code>{atlasUrls.jsonUrl}</code>
            </div>
            <div>
              Atlas PNG: <code>{atlasUrls.imageUrl}</code>
            </div>
            <div>
              Pixi Sheet: <code>{pixiUrl}</code>
            </div>
            <div>
              Static: <code>{staticUrl}</code>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="text-sm text-white/70 mb-3">
            Preview ({stage.toLowerCase()} / {anim} / {condition})
          </div>

          <div className="w-[360px] max-w-full">
            <SpriteSheetDog
              stage={stage}
              anim={anim}
              size={size}
              reduceMotion={reduceMotion}
              fallbackSrc={fallbackSrc}
              onDebug={setDebug}
              className="block"
            />
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="text-sm text-white/70 mb-3">Debug</div>
        <pre className="text-xs whitespace-pre-wrap break-words text-white/80">
          {JSON.stringify(debug, null, 2)}
        </pre>
      </div>
    </div>
  );
}

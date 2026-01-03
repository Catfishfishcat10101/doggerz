// src/pages/SpriteTest.jsx
// Visual QA for the generated JRT sprite pack under /public/sprites/anim/jrt/...

import * as React from "react";

import SpriteSheetDog from "@/features/game/components/SpriteSheetDog.jsx";
import { withBaseUrl } from "@/utils/assetUrl.js";

const STAGES = ["PUPPY", "ADULT", "SENIOR"];
const ANIMS = ["idle", "walk", "run", "sleep"];

export default function SpriteTest() {
  const [stage, setStage] = React.useState("PUPPY");
  const [anim, setAnim] = React.useState("idle");
  const [reduceMotion, setReduceMotion] = React.useState(false);
  const [debug, setDebug] = React.useState(null);

  const fallbackSrc = React.useMemo(() => {
    const s = String(stage || "PUPPY").toLowerCase();
    return withBaseUrl(`/sprites/jrt_${s}.webp`);
  }, [stage]);

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <h1 className="text-2xl font-semibold">Sprite Test</h1>
      <p className="text-white/70 mt-2">
        This page loads <code>/sprites/anim/jrt/manifest.json</code> and the
        generated strips in <code>/sprites/anim/jrt/&lt;stage&gt;/&lt;anim&gt;.webp</code>.
      </p>

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
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="text-sm text-white/70 mb-3">
            Preview ({stage.toLowerCase()} / {anim})
          </div>

          <div className="w-[360px] max-w-full">
            <SpriteSheetDog
              stage={stage}
              anim={anim}
              size={320}
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

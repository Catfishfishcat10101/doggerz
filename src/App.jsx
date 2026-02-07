// src/App.jsx
import { useEffect, useMemo } from "react";
import AppRouter from "./AppRouter.jsx";
import { usePreloadAssets } from "@/hooks/usePreloadAssets.js";
import {
  DOG_CONDITION_IDS,
  DOG_STAGE_SHORT,
  getDogPixiSheetUrl,
} from "@/utils/dogSpritePaths.js";
import { withBaseUrl } from "@/utils/assetUrl.js";

export default function App() {
  const spriteSheetUrls = useMemo(
    () =>
      [
        ...DOG_STAGE_SHORT.flatMap((stage) =>
          DOG_CONDITION_IDS.map((condition) =>
            getDogPixiSheetUrl(stage, condition)
          )
        ),
        ...Array.from({ length: 16 }, (_, index) =>
          withBaseUrl(
            `/assets/imports/jr/idle/frame_${String(index).padStart(3, "0")}.png`
          )
        ),
        ...Array.from({ length: 16 }, (_, index) =>
          withBaseUrl(
            `/assets/imports/jr/walk_right/frame_${String(index).padStart(
              3,
              "0"
            )}.png`
          )
        ),
        withBaseUrl("/sprites/walk-left.png"),
        withBaseUrl("/sprites/walk-left-2.png"),
        ...Array.from({ length: 25 }, (_, index) =>
          withBaseUrl(
            `/assets/imports/jr/walk_128/frame_${String(index).padStart(3, "0")}.png`
          )
        ),
      ],
    []
  );

  usePreloadAssets(spriteSheetUrls);

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.appMounted = "1";
    return () => {
      delete root.dataset.appMounted;
    };
  }, []);

  return (
    <div className="min-h-dvh bg-zinc-950 text-zinc-100">
      <AppRouter />
    </div>
  );
}

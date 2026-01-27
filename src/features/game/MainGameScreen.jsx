/** @format */
// src/features/game/MainGameScreen.jsx

import { useSelector } from "react-redux";
import MainGame from "./MainGame.jsx";

// This wrapper lets MainGame work even if it was written for props.
// We pull from the store using multiple fallbacks to avoid crashes.
export default function MainGameScreen() {
  const state = useSelector((s) => s || {});

  // Try common locations; adjust later once we confirm exact slice keys.
  const dog =
    state.dog ||
    state.dogState ||
    state.game?.dog ||
    state.game?.pet ||
    state.pet ||
    null;

  const needs =
    state.needs ||
    state.game?.needs ||
    state.dog?.needs ||
    state.dogState?.needs ||
    null;

  const training =
    state.training ||
    state.game?.training ||
    state.dog?.training ||
    state.dogState?.training ||
    null;

  const scene =
    state.scene ||
    state.world ||
    state.game?.scene ||
    state.game?.world ||
    null;

  return <MainGame dog={dog} needs={needs} training={training} scene={scene} />;
}

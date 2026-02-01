/** @format */
// src/features/game/MainGameScreen.jsx

import { useMemo } from "react";
import { useSelector } from "react-redux";
import MainGame from "./MainGame.jsx";

// This wrapper lets MainGame work even if it was written for props.
// We pull from the store using multiple fallbacks to avoid crashes.
export default function MainGameScreen() {
  const state = useSelector((s) => s || {});

  // Try common locations; adjust later once we confirm exact slice keys.
  const { dog, needs, training, scene } = useMemo(() => {
    const nextDog =
      state.dog ||
      state.dogState ||
      state.game?.dog ||
      state.game?.pet ||
      state.pet ||
      null;

    const nextNeeds =
      state.needs ||
      state.game?.needs ||
      state.dog?.needs ||
      state.dogState?.needs ||
      null;

    const nextTraining =
      state.training ||
      state.game?.training ||
      state.dog?.training ||
      state.dogState?.training ||
      null;

    const nextScene =
      state.scene ||
      state.world ||
      state.game?.scene ||
      state.game?.world ||
      null;

    return {
      dog: nextDog,
      needs: nextNeeds,
      training: nextTraining,
      scene: nextScene,
    };
  }, [
    state.dog,
    state.dogState,
    state.game?.dog,
    state.game?.pet,
    state.pet,
    state.needs,
    state.game?.needs,
    state.training,
    state.game?.training,
    state.scene,
    state.world,
    state.game?.scene,
    state.game?.world,
  ]);

  return <MainGame dog={dog} needs={needs} training={training} scene={scene} />;
}

//src/features/game/scene/GameScreen.jsx
import React from "react";
import Dog from "../entities/Dog.jsx";
import StatsBar from "../hud/StatsBar.jsx";
import Status from "../hud/Status.jsx";
// Optional systems you can enable later:
// import PottyTraining from "../systems/PottyTraining.jsx";
// import NamePupModal from "../modals/NamePupModal.jsx";

export default function GameScreen() {
  return (
    <main className="min-h-screen bg-bgd-900 text-white flex flex-col items-center gap-6 p-6">
      <header className="w-full max-w-3xl">
        <StatsBar />
      </header>

      <section className="w-full max-w-3xl grid place-items-center">
        <Dog />
      </section>

      <aside className="w-full max-w-3xl">
        <Status />
      </aside>
    </main>
  );
}

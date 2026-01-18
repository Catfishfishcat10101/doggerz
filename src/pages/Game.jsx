// src/pages/Game.jsx
/** @format */

import MainGame from "@/features/game/MainGame.jsx";
import PageShell from "@/components/PageShell.jsx";
import YardBackground from "../components/YardBackground.jsx";

export default function Game() {
  return (
    <PageShell
      showHeader={false}
      showFooter={false}
      fullBleed
      disableBackground
      mainClassName="p-0"
      containerClassName="w-full"
    >
      <div className="relative min-h-dvh overflow-hidden bg-zinc-950">
        <YardBackground />
        <MainGame />
      </div>
    </PageShell>
  );
}

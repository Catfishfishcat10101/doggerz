import { Scene } from './scene';
import { Dog } from './entities';
import { StatsBar, Status, CleanlinessBar, PoopScoop } from './hud';
import { NamePupModal } from './modals';

export default function GameScreen() {
  return (
    <main className="min-h-screen grid place-items-center p-4">
      <div className="w-full max-w-3xl">
        <StatsBar />
        <div className="mt-4 grid gap-4 md:grid-cols-[1fr_280px]">
          <div className="rounded-xl border border-zinc-800 p-3">
            <Scene>
              <Dog />
              {/* add toys/poop/entities here */}
            </Scene>
          </div>
          <aside className="rounded-xl border border-zinc-800 p-3">
            <Status />
            <CleanlinessBar />
            <PoopScoop />
          </aside>
        </div>
      </div>
      <NamePupModal />
    </main>
  );
}

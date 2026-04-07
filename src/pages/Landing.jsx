// src/pages/Landing.jsx

import { Link, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

import PageShell from "@/components/layout/PageShell.jsx";
import { PATHS } from "@/app/routes.js";
import { withBaseUrl } from "@/utils/assetUtils.js";
import { selectIsLoggedIn } from "@/store/userSlice.js";

export default function Landing() {
  const isLoggedIn = useSelector(selectIsLoggedIn);
  const { reduceMotion, batterySaver } = useSelector(
    (state) => state.settings || {}
  );
  if (isLoggedIn) return <Navigate to={PATHS.GAME} replace />;

  const showBlurDecor = !reduceMotion && !batterySaver;

  return (
    <PageShell useSurface={false}>
      <div className="relative mx-auto flex min-h-[100dvh] w-full max-w-md flex-col overflow-hidden border-x border-white/10 bg-black shadow-2xl">
        {showBlurDecor && (
          <>
            <div className="pointer-events-none absolute -left-20 -top-20 h-72 w-72 rounded-full bg-doggerz-leaf/25 blur-[100px]" />
            <div className="pointer-events-none absolute -bottom-20 -right-20 h-72 w-72 rounded-full bg-doggerz-sky/20 blur-[100px]" />
          </>
        )}

        <div className="z-10 mt-10 flex flex-1 flex-col items-center justify-center p-8 text-center">
          <div className="mb-8 h-48 w-48 overflow-hidden rounded-full border border-doggerz-leaf/35 bg-black/35 p-1 shadow-[0_0_60px_rgba(34,197,94,0.2)]">
            <img
              src={withBaseUrl("/assets/sprites/jr/pup_idle.png")}
              alt="Doggerz hero dog"
              className="h-full w-full rounded-full object-cover object-[74%_38%]"
            />
          </div>

          <h1 className="text-5xl font-extrabold tracking-tight">
            <span className="bg-gradient-to-r from-doggerz-leaf to-doggerz-sky bg-clip-text text-transparent">
              DOGGERZ
            </span>
          </h1>

          <h2 className="mt-2 text-xl font-bold tracking-widest text-white/90">
            ADOPT. TRAIN. BOND.
          </h2>

          <p className="mt-4 max-w-xs text-sm leading-relaxed text-doggerz-paw/75">
            Your highly unpredictable AI companion.
          </p>
        </div>

        <div className="z-10 flex w-full flex-col gap-4 p-6 pb-12">
          <Link
            to={PATHS.ADOPT}
            className="w-full rounded-2xl bg-doggerz-leaf py-4 text-center text-lg font-extrabold text-black shadow-lg transition-all hover:scale-[1.01] hover:bg-doggerz-neonSoft hover:shadow-[0_0_40px_rgba(34,197,94,0.5)]"
          >
            Adopt Your Pup
          </Link>

          <Link
            to={PATHS.LOGIN}
            className="w-full rounded-2xl border border-doggerz-mange/50 bg-black/30 py-3 text-center text-sm font-semibold text-doggerz-paw transition hover:bg-white/10"
          >
            Login
          </Link>
        </div>
      </div>
    </PageShell>
  );
}

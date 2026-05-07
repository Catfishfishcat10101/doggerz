// src/pages/Landing.jsx

import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

import { SocialButton } from "@/components/base/buttons/social-button.jsx";
import HeroDog from "@/components/dog/renderers/HeroDog.jsx";
import PageShell from "@/components/layout/PageShell.jsx";
import { PATHS } from "@/app/routes.js";
import { selectIsLoggedIn } from "@/store/userSlice.js";
import {
  getStoredValue,
  removeStoredValues,
  setStoredValue,
} from "@/utils/nativeStorage.js";

const STORAGE_REMEMBER = "doggerz:loginRememberEmail";
const STORAGE_EMAIL = "doggerz:loginEmail";

function SocialButtonGroupBrandDemo() {
  return (
    <div className="flex w-full flex-col gap-3">
      <SocialButton social="google" theme="brand">
        Sign in with Google
      </SocialButton>
      <SocialButton social="facebook" theme="brand">
        Sign in with Facebook
      </SocialButton>
      <SocialButton social="apple" theme="brand">
        Sign in with Apple
      </SocialButton>
    </div>
  );
}

export default function Landing() {
  const isLoggedIn = useSelector(selectIsLoggedIn);
  const { reduceMotion, batterySaver } = useSelector(
    (state) => state.settings || {}
  );
  const [rememberMe, setRememberMe] = useState(false);

  const showBlurDecor = !reduceMotion && !batterySaver;

  useEffect(() => {
    let cancelled = false;

    getStoredValue(STORAGE_REMEMBER).then((value) => {
      if (cancelled) return;
      setRememberMe(value === "1");
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const handleRememberMeChange = async (checked) => {
    setRememberMe(Boolean(checked));
    if (checked) {
      await setStoredValue(STORAGE_REMEMBER, "1");
      return;
    }
    await removeStoredValues([STORAGE_REMEMBER, STORAGE_EMAIL]);
  };

  if (isLoggedIn) return <Navigate to={PATHS.GAME} replace />;

  return (
    <PageShell useSurface={false}>
      <div className="relative isolate mx-auto flex min-h-[100dvh] w-full max-w-md flex-col overflow-hidden border-x border-white/10 bg-black shadow-2xl">
        {showBlurDecor && (
          <>
            <div className="pointer-events-none absolute -left-20 -top-20 h-72 w-72 rounded-full bg-doggerz-leaf/25 blur-[100px]" />
            <div className="pointer-events-none absolute -bottom-20 -right-20 h-72 w-72 rounded-full bg-doggerz-sky/20 blur-[100px]" />
          </>
        )}

        <div className="z-10 mt-10 flex flex-1 flex-col items-center justify-center p-8 text-center">
          <div className="pointer-events-none relative mb-8 aspect-square w-48 shrink-0 overflow-hidden rounded-full border border-doggerz-leaf/35 bg-black/35 p-1 shadow-[0_0_60px_rgba(34,197,94,0.2)]">
            <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_35%_30%,rgba(74,222,128,0.12),rgba(0,0,0,0)_60%)]" />
            <div className="absolute inset-0 grid place-items-center">
              <HeroDog
                stage="PUPPY"
                variant="landing"
                anim="idle"
                animationPreset="idle-wag"
                className="select-none"
              />
            </div>
          </div>

          <div className="flex justify-center">
            <div className="relative inline-flex items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-doggerz-leaf/25 blur-2xl" />

              <div className="relative rounded-full border border-doggerz-leaf/60 bg-black/70 px-8 py-3 shadow-[0_0_42px_rgba(34,197,94,0.35)] sm:px-10 sm:py-4">
                <span className="block text-4xl font-black uppercase tracking-[0.22em] text-doggerz-bone drop-shadow-[0_0_16px_rgba(134,239,172,0.85)] sm:text-5xl">
                  DOGGERZ
                </span>
              </div>
            </div>
          </div>

          <h2 className="mt-2 text-xl font-bold tracking-widest text-white/90">
            ADOPT. TRAIN. BOND.
          </h2>

          <p className="mt-4 max-w-xs text-sm leading-relaxed text-doggerz-paw/75">
            Your highly unpredictable AI companion.
          </p>
        </div>

        <div className="relative z-20 flex w-full flex-col gap-4 p-6 pb-12">
          <Link
            to={PATHS.ADOPT}
            className="dz-touch-button touch-manipulation w-full rounded-2xl bg-doggerz-leaf py-4 text-center text-lg font-extrabold text-black shadow-lg transition-all hover:scale-[1.01] hover:bg-doggerz-neonSoft hover:shadow-[0_0_40px_rgba(34,197,94,0.5)]"
          >
            Adopt Your Pup
          </Link>

          <Link
            to={PATHS.LOGIN}
            className="dz-touch-button touch-manipulation w-full rounded-2xl border border-doggerz-mange/50 bg-black/30 py-3 text-center text-sm font-semibold text-doggerz-paw transition hover:bg-white/10"
          >
            Login
          </Link>

          <div className="flex items-center gap-3 pt-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-doggerz-paw/40">
            <span className="h-px flex-1 bg-white/10" />
            <span>or</span>
            <span className="h-px flex-1 bg-white/10" />
          </div>

          <SocialButtonGroupBrandDemo />

          <label className="mt-1 flex items-start gap-3 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-left transition hover:bg-black/25">
            <span className="relative mt-0.5 inline-flex h-6 w-10 shrink-0 items-center">
              <input
                type="checkbox"
                className="peer sr-only"
                checked={rememberMe}
                onChange={(event) => {
                  handleRememberMeChange(event.target.checked);
                }}
                aria-label="Remember me"
              />
              <span className="absolute inset-0 rounded-full border border-white/10 bg-white/10 transition peer-checked:border-emerald-300/40 peer-checked:bg-emerald-400/25" />
              <span className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow-[0_2px_8px_rgba(0,0,0,0.3)] transition peer-checked:translate-x-4 peer-checked:bg-emerald-200" />
            </span>

            <span className="flex min-w-0 flex-col">
              <span className="text-sm font-semibold text-zinc-100">
                Remember me
              </span>
              <span className="text-xs leading-relaxed text-doggerz-paw/70">
                Save my login details for next time.
              </span>
            </span>
          </label>
        </div>
      </div>
    </PageShell>
  );
}

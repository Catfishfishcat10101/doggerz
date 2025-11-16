// src/pages/Splash.jsx
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

/**
 * @param {{ mode?: "login" | "signup" }} props
 */
export default function SplashPage(props) {
  // Mode is now explicitly optional, so TS/JSX stops whining
  const { mode } = props ?? {};
  const navigate = useNavigate();

  const currentUser = useSelector((state) => {
    const anyState = /** @type {any} */ (state);
    return anyState.user?.user ?? null;
  });

  const hasDog = useSelector((state) => {
    const anyState = /** @type {any} */ (state);
    return !!anyState.dog?.createdAt;
  });

  const primaryCta = () => {
    if (mode === "signup") {
      // If we're already on the signup intro, go to the actual signup form
      navigate("/signup/new");
      return;
    }

    if (currentUser && hasDog) {
      navigate("/game");
    } else if (currentUser && !hasDog) {
      navigate("/adopt");
    } else {
      navigate("/signup");
    }
  };

  const titleMode =
    mode === "login"
      ? "Log in to your Doggerz account"
      : mode === "signup"
      ? "Create your Doggerz account"
      : "Your virtual pup, always one tap away.";

  return (
    <div className="flex-1 flex items-center justify-center px-6 py-10">
      <div className="max-w-5xl w-full flex flex-col lg:flex-row items-start gap-12">
        {/* Left side: hero copy */}
        <section className="flex-1">
          <p className="text-[0.75rem] font-semibold tracking-[0.3em] text-emerald-400 uppercase mb-4">
            Adopt. Care. Level up.
          </p>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight mb-6">
            {mode ? (
              <span>{titleMode}</span>
            ) : (
              <>
                Your <span className="text-emerald-400">virtual pup</span>,
                always one tap away.
              </>
            )}
          </h1>

          {!mode && (
            <p className="text-sm sm:text-base text-zinc-300 max-w-xl mb-6">
              Adopt your pup and take care of them over real time. Keep them
              fed, entertained, rested, and clean. How you treat your dog
              determines how long they live — no click-spamming, no idle mining.
            </p>
          )}

          {mode && (
            <p className="text-sm text-zinc-300 max-w-xl mb-6">
              Use the navigation above to sign in or sign up. Once you’re in,
              you can adopt your first pup and jump into the yard.
            </p>
          )}

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={primaryCta}
              className="rounded-full bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-sm font-semibold px-6 py-3 transition"
            >
              {currentUser && hasDog
                ? "Resume your pup"
                : currentUser
                ? "Adopt your pup"
                : "Get started"}
            </button>

            {!mode && currentUser && (
              <p className="text-xs text-zinc-400">
                Logged in as{" "}
                <span className="font-semibold">
                  {currentUser.displayName || currentUser.email}
                </span>
                .{" "}
                <button
                  type="button"
                  className="text-emerald-400 hover:underline"
                  onClick={() => navigate("/game")}
                >
                  Jump back into the yard.
                </button>
              </p>
            )}

            {!mode && !currentUser && (
              <p className="text-xs text-zinc-400">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="text-emerald-400 hover:underline"
                >
                  Log in
                </Link>
                .
              </p>
            )}
          </div>
        </section>

        {/* Right side: compact explainer with CTA to About */}
        <aside className="w-full lg:w-80">
          <div className="rounded-3xl border border-zinc-800 bg-zinc-900/70 p-5">
            <p className="text-xs uppercase tracking-[0.25em] text-zinc-400 mb-3">
              How Doggerz works
            </p>
            <ul className="space-y-2 text-xs text-zinc-300">
              <li>• Your dog slowly ages even while you&apos;re logged out.</li>
              <li>
                • Hunger, boredom, and dirtiness creep up over real hours, not
                button mashing.
              </li>
              <li>
                • As cleanliness drops, your pup can go from dirty → fleas →
                mange.
              </li>
              <li>• Taking good care of your pup extends their life.</li>
            </ul>

            <button
              type="button"
              onClick={() => navigate("/about")}
              className="mt-4 text-xs font-semibold text-emerald-300 hover:text-emerald-200 hover:underline underline-offset-2"
            >
              Read the full guide →
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}

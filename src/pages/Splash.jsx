import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

const LIFE_STAGES = [
  { label: "Puppy", subtitle: "0-6 months", copy: "High energy, fast growth, soaking up every cuddle." },
  { label: "Adult", subtitle: "6 months - 7 years", copy: "Balanced needs, learns routines, pushes for adventures." },
  { label: "Senior", subtitle: "7+ years", copy: "Slower pace, higher care requirements, legacy memories." },
];

const CLEANLINESS_STATES = [
  { label: "Fresh", description: "Regular baths keep the coat shiny and stats boosted." },
  { label: "Dirty", description: "Skip a wash and dirt accrues, lowering happiness." },
  { label: "Fleas", description: "Neglect longer and fleas appear, sapping energy." },
  { label: "Mange", description: "At rock bottom, the pup needs urgent care to recover." },
];

export default function SplashPage() {
  const navigate = useNavigate();

  const currentUser = useSelector((state) => {
    const anyState = /** @type {any} */ (state);
    return anyState.user?.user ?? null;
  });

  const hasDog = useSelector((state) => {
    const anyState = /** @type {any} */ (state);
    return !!anyState.dog?.createdAt;
  });

  const heroCtaLabel = currentUser
    ? hasDog
      ? "Resume your pup"
      : "Adopt your first pup"
    : "Start caring";

  const handlePrimary = () => {
    if (currentUser && hasDog) {
      navigate("/game");
      return;
    }
    if (currentUser) {
      navigate("/adopt");
      return;
    }
    navigate("/signup");
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-[#050816] via-[#0b1020] to-[#010104] text-slate-100">
      <div className="flex-1 overflow-y-auto">
        <div className="container mx-auto px-4 py-10 lg:py-16 space-y-10">
          <section className="text-center space-y-6">
            <p className="text-[0.7rem] uppercase tracking-[0.3em] text-emerald-300">
              Real-time virtual companion
            </p>
            <h1 className="text-[clamp(3rem,10vw,6rem)] font-black tracking-tight leading-none">
              <span className="text-emerald-400 drop-shadow-[0_0_25px_rgba(16,185,129,0.35)]">Doggerz</span>
            </h1>
            <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-300">
              Adopt a pup, care for it over real hours, and watch its personality evolve from playful puppy to wise senior.
              How you treat your dog literally determines its lifespan.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={handlePrimary}
                className="rounded-full bg-emerald-500 hover:bg-emerald-400 text-black font-semibold px-8 py-3 text-sm tracking-wide"
              >
                {heroCtaLabel}
              </button>
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="rounded-full border border-white/20 px-8 py-3 text-sm font-semibold hover:border-white/50 transition"
              >
                Log in
              </button>
              <button
                type="button"
                onClick={() => navigate("/signup")}
                className="rounded-full border border-emerald-400/30 px-8 py-3 text-sm font-semibold text-emerald-200 hover:border-emerald-400"
              >
                Sign up
              </button>
            </div>
            {!currentUser && (
              <p className="text-xs text-slate-400">
                Already created an account?{" "}
                <Link to="/login" className="text-emerald-300 hover:text-emerald-200 font-semibold">
                  Jump back in
                </Link>
                .
              </p>
            )}
          </section>

          <section className="grid gap-6 lg:grid-cols-2">
            <article className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-sm p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Life doesn’t pause</h2>
                <span className="text-xs uppercase tracking-[0.25em] text-emerald-300">Lifecycle</span>
              </div>
              <ol className="space-y-4">
                {LIFE_STAGES.map((stage, idx) => (
                  <li key={stage.label} className="flex gap-4">
                    <div className="text-emerald-300 font-semibold">{idx + 1}</div>
                    <div>
                      <p className="text-sm text-slate-200 font-semibold">
                        {stage.label} • <span className="text-slate-400">{stage.subtitle}</span>
                      </p>
                      <p className="text-xs text-slate-400">{stage.copy}</p>
                    </div>
                  </li>
                ))}
                <li className="flex gap-4">
                  <div className="text-rose-300 font-semibold">∞</div>
                  <div>
                    <p className="text-sm text-rose-200 font-semibold">Legacy</p>
                    <p className="text-xs text-slate-400">
                      Care well and extend their days. Neglect them and the story ends sooner.
                    </p>
                  </div>
                </li>
              </ol>
            </article>

            <article className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-sm p-6 space-y-5">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Dog polls & cleanliness</h2>
                <span className="text-xs uppercase tracking-[0.25em] text-emerald-300">Care loops</span>
              </div>
              <p className="text-sm text-slate-300">
                Timed “dog polls” nudge you with quick decisions. Ignore them and the pup tells everyone how it feels.
                Bathing is critical—the longer you wait, the worse the consequences.
              </p>
              <div className="grid gap-3 md:grid-cols-2">
                {CLEANLINESS_STATES.map((state) => (
                  <div key={state.label} className="rounded-2xl bg-black/20 border border-white/10 p-3">
                    <p className="text-sm font-semibold text-slate-100">{state.label}</p>
                    <p className="text-xs text-slate-400">{state.description}</p>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() => navigate("/about")}
                className="text-xs font-semibold text-emerald-300 hover:text-emerald-200"
              >
                Read the full care guide →
              </button>
            </article>
          </section>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="border-t border-white/10 bg-[#010104]">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
            <p>© {new Date().getFullYear()} Doggerz. All rights reserved.</p>
            <nav className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => navigate("/about")}
                className="hover:text-slate-200 transition"
              >
                About
              </button>
              <button
                type="button"
                onClick={() => navigate("/contact")}
                className="hover:text-slate-200 transition"
              >
                Contact
              </button>
              <button
                type="button"
                onClick={() => navigate("/legal")}
                className="hover:text-slate-200 transition"
              >
                Terms & Privacy
              </button>
            </nav>
          </div>
        </div>
      </footer>
    </div>
  );
}

import React, { useState } from "react";
<<<<<<< Updated upstream
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { auth, googleProvider } from "@/lib/firebase.js";
import {
  signInWithPopup,
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import {
  userLoading,
  userAuthed,
  userError,
} from "@/redux/userSlice.js";
import DogSprite from "./DogSprite.jsx";
import InstallPrompt from "./InstallPrompt.jsx";

export default function Splash() {
  const nav = useNavigate();
  const dispatch = useDispatch();

  const user = useSelector((s) => s.user.user);
  const dog = useSelector((s) => s.dog);

  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [msg, setMsg] = useState(null);

  async function handleGoogle() {
    try {
      dispatch(userLoading());
      const res = await signInWithPopup(auth, googleProvider);
      const u = res.user;
      dispatch(userAuthed({ uid: u.uid, email: u.email, displayName: u.displayName }));
    } catch (err) {
      console.error(err);
      dispatch(userError(err.message));
      setMsg(err.message);
    }
  }

  async function handleSignup(e) {
    e.preventDefault();
    setMsg(null);
    try {
      dispatch(userLoading());
      const { user } = await createUserWithEmailAndPassword(auth, email.trim(), pw);
      await updateProfile(user, { displayName: email.split("@")[0] });
      const fresh = auth.currentUser;
      dispatch(userAuthed({ uid: fresh.uid, email: fresh.email, displayName: fresh.displayName }));
    } catch (err) {
      dispatch(userError(err.message));
      setMsg(err.message);
    }
  }

  return (
    <main className="flex-1 grid place-items-center px-4">
      <section className="grid gap-10 lg:grid-cols-2 max-w-6xl w-full">
        {/* LEFT: tagline + actions */}
        <div className="space-y-6 text-center lg:text-left">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
            Adopt your <span className="text-emerald-400">pixel pup</span>.
          </h1>
          <p className="opacity-80">
            One dog per user, offline-ready, and your choices shape behavior. Installable as a PWA. No pay-to-win nonsense.
          </p>

          <div className="flex flex-wrap justify-center lg:justify-start gap-3">
            <button
              className="btn-primary"
              onClick={() => nav("/game")}
            >
              {user ? "Continue Game" : "Play Now"}
            </button>
            <button className="btn-ghost" onClick={handleGoogle}>
              Sign in with Google
            </button>
            <button className="btn-ghost" onClick={() => nav("/shop")}>
              Shop
            </button>
          </div>

          <form onSubmit={handleSignup} className="flex flex-wrap gap-2 justify-center lg:justify-start">
            <input
              type="email"
              placeholder="Email address"
              className="flex-1 h-10 rounded-lg bg-black/30 border border-white/10 px-3"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="password"
              placeholder="Password"
              className="flex-1 h-10 rounded-lg bg-black/30 border border-white/10 px-3"
              value={pw}
              onChange={(e) => setPw(e.target.value)}
            />
            <button type="submit" className="btn-primary">
              Create Account
            </button>
          </form>

          {msg && <div className="text-red-400 text-sm">{msg}</div>}
        </div>

        {/* RIGHT: dog preview */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center">
          <div className="flex flex-col items-center space-y-4">
            <DogSprite />
            <h2 className="text-lg font-semibold">Your Dog is Waiting…</h2>
            <p className="text-sm opacity-80">
              {dog.mood} • {dog.isPottyTrained ? "Trained" : "Ready to Train"}
            </p>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-3">
            <button onClick={() => nav("/game")} className="btn-ghost">Needs System</button>
            <button onClick={() => nav("/game")} className="btn-ghost">Tricks & Training</button>
            <button onClick={() => nav("/shop")} className="btn-ghost">Accessories</button>
            <button onClick={() => nav("/game")} className="btn-ghost">Installable PWA</button>
=======
import { useNavigate, Link } from "react-router-dom";
import "./Splash.css"; // background grid + sparkles

export default function Splash() {
  const nav = useNavigate();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);

  function handlePlayNow() {
    nav("/game");
  }

  async function handleGoogleLogin() {
    setBusy(true);
    setMsg(null);
    try {
      // TODO: wire real Firebase auth:
      // const provider = new GoogleAuthProvider();
      // await signInWithPopup(auth, provider);
      // nav("/game");
      setMsg("Google Sign-In not wired yet. Configure Firebase and uncomment the code.");
    } catch (e) {
      setMsg(e.message || "Login failed.");
    } finally {
      setBusy(false);
    }
  }

  function handleEmailSignup(e) {
    e.preventDefault();
    setMsg("Email/password flow not wired yet. Implement in /components/Auth.");
  }

  return (
    <main className="relative z-40 min-h-[calc(100dvh-3.5rem)] overflow-hidden">
      {/* Decorative layers behind everything and click-through only */}
      <div className="splash-grid pointer-events-none" aria-hidden="true" />
      <div className="splash-sparkles pointer-events-none" aria-hidden="true" />

      <section className="relative z-50 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          {/* Left column */}
          <div className="space-y-6">
            <h1 className="text-4xl md:text-6xl font-black leading-tight tracking-tight text-white">
              Adopt your pixel pup.
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-br from-sky-400 to-blue-500">
                Raise. Train. Bond.
              </span>
            </h1>

            <p className="text-white/80 max-w-prose">
              One dog per user, offline-ready, and your choices shape behavior.
              Installable as a PWA when available. No pay-to-win nonsense.
            </p>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handlePlayNow}
                disabled={busy}
                className="rounded-xl px-5 py-3 font-semibold shadow bg-gradient-to-br from-fuchsia-500 to-blue-500 text-white hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-offset-2"
              >
                Play Now
              </button>

              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={busy}
                aria-busy={busy}
                className="rounded-xl px-5 py-3 font-semibold bg-white/10 text-white hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-offset-2"
              >
                Sign in with Google
              </button>

              <Link
                to="/shop"
                className="rounded-xl px-5 py-3 font-semibold bg-white text-zinc-900 hover:bg-zinc-100 focus:outline-none focus:ring-2 focus:ring-offset-2"
              >
                Shop
              </Link>
            </div>

            {msg && (
              <div className="rounded-lg border border-white/20 bg-white/5 p-3 text-white/90">
                {msg}
              </div>
            )}

            <form
              onSubmit={handleEmailSignup}
              className="mt-2 grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-2"
            >
              <input
                type="email"
                name="email"
                required
                placeholder="Email address"
                className="rounded-lg bg-zinc-900/60 border border-white/10 px-4 py-3 text-white placeholder:text-white/40"
              />
              <button
                type="submit"
                className="rounded-lg bg-white/10 text-white px-4 py-3 hover:bg-white/15"
              >
                Create Account
              </button>
            </form>

            <ul className="mt-4 grid grid-cols-2 gap-2 text-xs text-white/70">
              <li>React 18</li>
              <li>Redux Toolkit</li>
              <li>Vite + Tailwind</li>
              <li>Firebase Auth + Firestore</li>
              <li>Offline PWA</li>
              <li>Responsive</li>
            </ul>
          </div>

          {/* Right column */}
          <div className="relative rounded-2xl p-1 bg-gradient-to-br from-amber-400/40 to-rose-500/40">
            <div className="rounded-xl bg-zinc-900/70 border border-white/10 p-6">
              <div className="aspect-[4/3] rounded-lg border border-white/10 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,.08),rgba(0,0,0,.0))] flex items-center justify-center">
                <div className="text-white/90 text-center">
                  <div className="text-6xl select-none">🐶</div>
                  <div className="font-semibold mt-2">Your Dog is Waiting…</div>
                  <div className="text-sm text-white/60">Idle • Curious • Ready to Train</div>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <Badge>Needs System</Badge>
                <Badge>Tricks & Training</Badge>
                <Badge>Accessories</Badge>
                <Badge>Installable PWA</Badge>
              </div>
            </div>
>>>>>>> Stashed changes
          </div>
        </div>
      </section>

      {/* Floating install button if supported */}
      <InstallPrompt />
    </main>
  );
<<<<<<< Updated upstream
}
=======
}

function Badge({ children }) {
  return (
    <div className="text-xs rounded-lg px-3 py-2 bg-white/5 border border-white/10 text-white/80">
      {children}
    </div>
  );
}
>>>>>>> Stashed changes

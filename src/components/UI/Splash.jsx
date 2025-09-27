import React, { useState } from "react";
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
          </div>
        </div>
      </section>

      {/* Floating install button if supported */}
      <InstallPrompt />
    </main>
  );
}
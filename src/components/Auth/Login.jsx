import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { auth } from "@/lib/firebase";
import { userLoading, userAuthed, userError } from "@/redux/userSlice";

function shapeUser(u) {
  if (!u) return null;
  const { uid, email, displayName, photoURL } = u;
  return { uid, email, displayName, photoURL };
}

export default function Login() {
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [msg, setMsg] = useState(null);
  const dispatch = useDispatch();
  const nav = useNavigate();
  const loc = useLocation();
  const from = loc.state?.from?.pathname || "/game";

  async function onEmailLogin(e) {
    e.preventDefault();
    setMsg(null);
    dispatch(userLoading());
    try {
      // Load only when used → trims initial bundle
      const { signInWithEmailAndPassword } = await import("firebase/auth");
      const { user } = await signInWithEmailAndPassword(auth, email.trim(), pw);
      dispatch(userAuthed(shapeUser(user)));
      nav(from, { replace: true });
    } catch (err) {
      console.error(err);
      dispatch(userError(err.message));
      setMsg(err.message);
    }
  }

  async function onGoogle() {
    setMsg(null);
    dispatch(userLoading());
    try {
      const { GoogleAuthProvider, signInWithPopup } = await import("firebase/auth");
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });
      const { user } = await signInWithPopup(auth, provider);
      dispatch(userAuthed(shapeUser(user)));
      nav(from, { replace: true });
    } catch (err) {
      console.error(err);
      dispatch(userError(err.message));
      setMsg(err.message);
    }
  }

  return (
    <main className="mx-auto max-w-md px-4 py-10">
      <h1 className="text-3xl font-extrabold">Welcome back</h1>
      <p className="mt-2 text-slate-300">Log in to see your pup.</p>

      <form onSubmit={onEmailLogin} className="mt-6 space-y-3">
        <label className="block">
          <span className="text-sm text-slate-300">Email</span>
          <input
            type="email"
            className="mt-1 w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 outline-none focus:ring-2 focus:ring-amber-300"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
        </label>

        <label className="block">
          <span className="text-sm text-slate-300">Password</span>
          <input
            type="password"
            className="mt-1 w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 outline-none focus:ring-2 focus:ring-amber-300"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            autoComplete="current-password"
            required
          />
        </label>

        {msg && <div className="text-sm text-rose-300">{msg}</div>}

        <button
          type="submit"
          className="w-full mt-2 rounded-2xl bg-amber-400 text-slate-900 font-semibold px-4 py-2 hover:bg-amber-300"
        >
          Log in
        </button>

        <button
          type="button"
          onClick={onGoogle}
          className="w-full rounded-2xl bg-white/10 px-4 py-2 hover:bg-white/20"
        >
          Continue with Google
        </button>

        <p className="text-sm text-slate-400">
          New here? <Link to="/signup" className="text-amber-300 hover:underline">Create an account</Link>
        </p>
      </form>
    </main>
  );
}

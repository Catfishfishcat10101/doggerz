import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { auth } from "@/lib/firebase";
import { userLoading, userAuthed, userError } from "@/redux/userSlice";

function shapeUser(u) {
  if (!u) return null;
  const { uid, email, displayName, photoURL } = u;
  return { uid, email, displayName, photoURL };
}

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [msg, setMsg] = useState(null);
  const dispatch = useDispatch();
  const nav = useNavigate();

  async function onEmailSignup(e) {
    e.preventDefault();
    setMsg(null);
    dispatch(userLoading());
    try {
      const { createUserWithEmailAndPassword, updateProfile } = await import("firebase/auth");
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), pw);
      if (name.trim()) {
        await updateProfile(cred.user, { displayName: name.trim() });
      }
      const current = auth.currentUser; // reflects displayName
      dispatch(userAuthed(shapeUser(current)));
      nav("/game", { replace: true });
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
      nav("/game", { replace: true });
    } catch (err) {
      console.error(err);
      dispatch(userError(err.message));
      setMsg(err.message);
    }
  }

  return (
    <main className="mx-auto max-w-md px-4 py-10">
      <h1 className="text-3xl font-extrabold">Create your account</h1>
      <p className="mt-2 text-slate-300">Name your trainer and adopt your first pup.</p>

      <form onSubmit={onEmailSignup} className="mt-6 space-y-3">
        <label className="block">
          <span className="text-sm text-slate-300">Display name</span>
          <input
            type="text"
            className="mt-1 w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 outline-none focus:ring-2 focus:ring-amber-300"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="nickname"
            placeholder="PupMaster3000"
          />
        </label>

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
            autoComplete="new-password"
            required
            minLength={6}
          />
        </label>

        {msg && <div className="text-sm text-rose-300">{msg}</div>}

        <button
          type="submit"
          className="w-full mt-2 rounded-2xl bg-amber-400 text-slate-900 font-semibold px-4 py-2 hover:bg-amber-300"
        >
          Sign up
        </button>

        <button
          type="button"
          onClick={onGoogle}
          className="w-full rounded-2xl bg-white/10 px-4 py-2 hover:bg-white/20"
        >
          Continue with Google
        </button>

        <p className="text-sm text-slate-400">
          Already have an account? <Link to="/login" className="text-amber-300 hover:underline">Log in</Link>
        </p>
      </form>
    </main>
  );
}

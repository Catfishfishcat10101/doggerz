// src/components/Auth/Login.jsx
import React, { useState } from "react";
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import { useDispatch } from "react-redux";
import { userLoading, userAuthed, userError } from "@/redux/userSlice";
import { Link, useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [msg, setMsg] = useState(null);
  const dispatch = useDispatch();
  const nav = useNavigate();

  async function handleEmailLogin(e) {
    e.preventDefault();
    dispatch(userLoading());
    setMsg(null);
    try {
      const { user } = await signInWithEmailAndPassword(auth, email.trim(), pw);
      dispatch(userAuthed({ uid: user.uid, email: user.email, displayName: user.displayName }));
      nav("/game");
    } catch (err) {
      console.error(err);
      dispatch(userError(err.message));
      setMsg(err.message);
    }
  }

  async function handleGoogle() {
    dispatch(userLoading());
    setMsg(null);
    try {
      const { user } = await signInWithPopup(auth, googleProvider);
      dispatch(userAuthed({ uid: user.uid, email: user.email, displayName: user.displayName }));
      nav("/game");
    } catch (err) {
      console.error(err);
      dispatch(userError(err.message));
      setMsg(err.message);
    }
  }

  return (
    <div className="mx-auto max-w-sm p-6">
      <h1 className="text-2xl font-bold mb-4">Welcome back</h1>

      {msg && <div className="mb-3 rounded bg-red-500/10 p-2 text-sm text-red-600">{msg}</div>}

      <form onSubmit={handleEmailLogin} className="space-y-3">
        <input
          className="w-full rounded border px-3 py-2"
          placeholder="Email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="w-full rounded border px-3 py-2"
          placeholder="Password"
          type="password"
          autoComplete="current-password"
          value={pw}
          onChange={(e) => setPw(e.target.value)}
        />
        <button className="w-full rounded bg-black text-white py-2">Log in</button>
      </form>

      <button onClick={handleGoogle} className="mt-3 w-full rounded border py-2">
        Continue with Google
      </button>

      <p className="mt-4 text-sm">
        New here? <Link to="/signup" className="underline">Create an account</Link>
      </p>
    </div>
  );
}

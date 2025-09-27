// src/components/Auth/Signup.jsx
import React, { useState } from "react";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useDispatch } from "react-redux";
import { userLoading, userAuthed, userError } from "@/redux/userSlice";
import { Link, useNavigate } from "react-router-dom";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [name, setName] = useState("");
  const [msg, setMsg] = useState(null);
  const dispatch = useDispatch();
  const nav = useNavigate();

  async function onSubmit(e) {
    e.preventDefault();
    dispatch(userLoading());
    setMsg(null);
    try {
      const { user } = await createUserWithEmailAndPassword(auth, email.trim(), pw);
      if (name.trim()) await updateProfile(user, { displayName: name.trim() });

      const fresh = auth.currentUser ?? user;
      dispatch(userAuthed({ uid: fresh.uid, email: fresh.email, displayName: fresh.displayName }));
      nav("/game");
    } catch (err) {
      console.error(err);
      dispatch(userError(err.message));
      setMsg(err.message);
    }
  }

  return (
    <div className="mx-auto max-w-sm p-6">
      <h1 className="text-2xl font-bold mb-4">Create your Doggerz account</h1>

      {msg && <div className="mb-3 rounded bg-red-500/10 p-2 text-sm text-red-600">{msg}</div>}

      <form onSubmit={onSubmit} className="space-y-3">
        <input
          className="w-full rounded border px-3 py-2"
          placeholder="Display name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
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
          autoComplete="new-password"
          value={pw}
          onChange={(e) => setPw(e.target.value)}
        />
        <button className="w-full rounded bg-black text-white py-2">Sign up</button>
      </form>

      <p className="mt-4 text-sm">
        Already have an account? <Link to="/login" className="underline">Log in</Link>
      </p>
    </div>
  );
}

import React, { useState } from "react";
import { auth } from "@/lib/firebase";
import {
  GoogleAuthProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";

export default function AuthButtons() {
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [name, setName] = useState("");
  const [msg, setMsg] = useState(null);

  async function google() {
    setMsg(null);
    try {
      const cred = await signInWithPopup(auth, new GoogleAuthProvider());
      setMsg(`Welcome ${cred.user.displayName || "back"}!`);
    } catch (e) { setMsg(e.message); }
  }

  async function emailSignup(e) {
    e.preventDefault(); setMsg(null);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), pw);
      if (name.trim()) await updateProfile(cred.user, { displayName: name.trim() });
      setMsg("Account created. You’re in.");
    } catch (e) { setMsg(e.message); }
  }

  async function emailLogin(e) {
    e.preventDefault(); setMsg(null);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), pw);
      setMsg("Signed in.");
    } catch (e) { setMsg(e.message); }
  }

  return (
    <div className="space-y-3" id="auth-panel" aria-live="polite">
      <button onClick={google} className="w-full rounded-xl px-4 py-2 bg-neutral-200 text-neutral-900 hover:bg-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white">
        Continue with Google
      </button>

      <form className="grid gap-2" onSubmit={emailLogin}>
        <input className="rounded-lg bg-neutral-900 border border-neutral-700 px-3 py-2"
               placeholder="Display name (optional)" value={name} onChange={(e)=>setName(e.target.value)} />
        <input className="rounded-lg bg-neutral-900 border border-neutral-700 px-3 py-2" type="email"
               placeholder="Email" value={email} onChange={(e)=>setEmail(e.target.value)} required />
        <input className="rounded-lg bg-neutral-900 border border-neutral-700 px-3 py-2" type="password"
               placeholder="Password" value={pw} onChange={(e)=>setPw(e.target.value)} required />
        <div className="flex gap-2">
          <button onClick={emailSignup}
                  className="flex-1 rounded-xl px-4 py-2 bg-neutral-800 hover:bg-neutral-700">Create account</button>
          <button type="submit"
                  className="flex-1 rounded-xl px-4 py-2 bg-neutral-800 hover:bg-neutral-700">Sign in</button>
        </div>
      </form>

      {msg && <p className="text-sm opacity-80">{msg}</p>}
    </div>
  );
}
import React, { useState } from "react";
import { auth, googleProvider } from "@/utils/firebase/firebase";
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { Link, useNavigate, useLocation } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const nav = useNavigate();
  const loc = useLocation();
  const to = loc.state?.from?.pathname || "/game";

  const emailLogin = async (e) => {
    e.preventDefault();
    setErr("");
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      nav(to, { replace: true });
    } catch (e) {
      setErr(e.message);
    }
  };

  const googleLogin = async () => {
    setErr("");
    try {
      await signInWithPopup(auth, googleProvider);
      nav(to, { replace: true });
    } catch (e) {
      setErr(e.message);
    }
  };

  return (
    <main className="min-h-screen grid place-items-center p-6">
      <form onSubmit={emailLogin} className="w-full max-w-sm bg-white/5 p-6 rounded-2xl space-y-3">
        <h1 className="text-2xl font-bold">Sign in</h1>
        {err && <div className="text-red-300 text-sm">{err}</div>}
        <input className="w-full px-3 py-2 rounded bg-black/30 outline-none" placeholder="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} />
        <input className="w-full px-3 py-2 rounded bg-black/30 outline-none" placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
        <button className="w-full px-3 py-2 rounded bg-amber-400 text-black font-bold hover:bg-amber-500" type="submit">Sign in</button>
        <button type="button" onClick={googleLogin} className="w-full px-3 py-2 rounded bg-white/10 hover:bg-white/20">Continue with Google</button>
        <div className="text-xs text-white/60">
          No account? <Link to="/signup" className="underline">Sign up</Link>
        </div>
      </form>
    </main>
  );
}

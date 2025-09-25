import React, { useState } from "react";
import { createUserWithEmailAndPassword, updateProfile, signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "@/firebase";
import { useNavigate, Link } from "react-router-dom";

export default function Signup() {
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const nav = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const em = String(email || "").trim().toLowerCase();
      const pass = String(pw || "");
      if (!em || !pass) throw new Error("auth/argument-error");
      const cred = await createUserWithEmailAndPassword(auth, em, pass);
      if (displayName) await updateProfile(cred.user, { displayName });
      nav("/game", { replace: true });
    } catch (err) {
      setError(err?.code || err?.message || String(err));
    } finally {
      setBusy(false);
    }
  };

  const onGoogle = async () => {
    setError("");
    setBusy(true);
    try {
      await signInWithPopup(auth, googleProvider); // ✅ provider passed
      nav("/game", { replace: true });
    } catch (err) {
      setError(err?.code || err?.message || String(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen grid place-items-center bg-slate-100 px-4">
      <form onSubmit={onSubmit} className="bg-white rounded-2xl shadow p-6 w-full max-w-sm space-y-3">
        <h2 className="text-xl font-bold">Create account</h2>
        <input className="border px-3 py-2 rounded" placeholder="Display name (optional)" value={displayName} onChange={(e)=>setDisplayName(e.target.value)} disabled={busy}/>
        <input className="border px-3 py-2 rounded" type="email" placeholder="you@example.com" value={email} onChange={(e)=>setEmail(e.target.value)} required disabled={busy}/>
        <input className="border px-3 py-2 rounded" type="password" placeholder="Password" value={pw} onChange={(e)=>setPw(e.target.value)} required disabled={busy}/>
        <button className="bg-blue-600 text-white rounded px-4 py-2 font-semibold disabled:opacity-60" disabled={busy}>
          {busy ? "Creating…" : "Create account"}
        </button>
        <button type="button" onClick={onGoogle} className="w-full rounded px-4 py-2 border font-semibold disabled:opacity-60" disabled={busy}>
          Continue with Google
        </button>
        {error && <div className="text-red-600 text-sm break-all">{error}</div>}
        <div className="text-sm">Already have an account? <Link className="text-blue-600 underline" to="/login">Log in</Link></div>
      </form>
    </div>
  );
}
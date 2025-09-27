import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Login() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);

  async function onSubmit(e) {
    e.preventDefault();
    setMsg(null);
    setLoading(true);
    try {
      // TODO: real Firebase sign-in
      await new Promise(r => setTimeout(r, 300));
      nav("/game", { replace: true });
    } catch (e2) {
      setMsg(e2?.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-md px-4 py-10">
      <h1 className="text-3xl font-bold">Sign in</h1>
      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <input type="email" className="w-full rounded-xl bg-black/40 border border-white/10 px-4 py-3"
               placeholder="Email" value={email} onChange={(e)=>setEmail(e.target.value)} required />
        <input type="password" className="w-full rounded-xl bg-black/40 border border-white/10 px-4 py-3"
               placeholder="Password" value={pw} onChange={(e)=>setPw(e.target.value)} required />
        <button type="submit" disabled={loading}
          className="w-full rounded-xl px-4 py-3 bg-white text-black font-semibold hover:bg-neutral-200 disabled:opacity-60 transition">
          {loading ? "Signing in…" : "Continue"}
        </button>
        {msg && <p className="text-sm text-neutral-300">{msg}</p>}
      </form>
      <p className="mt-4 text-sm text-neutral-400">
        New here? <Link to="/signup" className="underline">Create an account</Link>
      </p>
    </main>
  );
}
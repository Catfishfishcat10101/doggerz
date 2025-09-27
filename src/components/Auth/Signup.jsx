import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function Signup() {
  const nav = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [msg, setMsg] = useState(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setMsg(null);
    setLoading(true);
    try {
      // TODO: plug real Firebase here
      await new Promise(r => setTimeout(r, 300));
      setMsg("Account created. Redirecting…");
      nav("/game", { replace: true });
    } catch (err) {
      setMsg(err?.message || "Signup failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-md px-4 py-10">
      <h1 className="text-3xl font-bold">Create account</h1>
      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <input className="w-full rounded-xl bg-black/40 border border-white/10 px-4 py-3"
               placeholder="Display name" value={name} onChange={(e)=>setName(e.target.value)} />
        <input type="email" className="w-full rounded-xl bg-black/40 border border-white/10 px-4 py-3"
               placeholder="Email" value={email} onChange={(e)=>setEmail(e.target.value)} required />
        <input type="password" className="w-full rounded-xl bg-black/40 border border-white/10 px-4 py-3"
               placeholder="Password" value={pw} onChange={(e)=>setPw(e.target.value)} minLength={6} required />
        <button type="submit" disabled={loading}
          className="w-full rounded-xl px-4 py-3 bg-fuchsia-500 text-white font-semibold hover:bg-fuchsia-400 disabled:opacity-60 transition">
          {loading ? "Creating…" : "Create account"}
        </button>
        {msg && <p className="text-sm text-neutral-300">{msg}</p>}
      </form>
      <p className="mt-4 text-sm text-neutral-400">
        Already have an account? <Link to="/login" className="underline">Sign in</Link>
      </p>
    </main>
  );
}
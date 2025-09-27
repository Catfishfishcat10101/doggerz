// src/components/Auth/Login.jsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
// If auth is ready, import your auth methods and wire onSubmit later.

export default function Login() {
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [msg, setMsg] = useState(null);

  async function onSubmit(e) {
    e.preventDefault();
    setMsg("Auth not wired yet — UI is working.");
    // TODO: plug in Firebase createUserWithEmailAndPassword / signInWithEmailAndPassword
  }

  return (
    <main className="mx-auto max-w-md px-4 py-10">
      <h1 className="text-3xl font-bold">Sign in</h1>
      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <input
          type="email"
          placeholder="Email"
          className="w-full rounded-xl bg-black/40 border border-white/10 px-4 py-3"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full rounded-xl bg-black/40 border border-white/10 px-4 py-3"
          value={pw}
          onChange={(e) => setPw(e.target.value)}
        />
        <button
          type="submit"
          className="w-full rounded-xl px-4 py-3 bg-white text-black font-semibold hover:bg-neutral-200 transition"
        >
          Continue
        </button>
        {msg && <p className="text-sm text-neutral-300">{msg}</p>}
      </form>

      <p className="mt-4 text-sm text-neutral-400">
        New here? <Link to="/signup" className="underline">Create an account</Link>
      </p>
    </main>
  );
}
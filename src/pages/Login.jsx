import React, { useState } from "react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");

  const onSubmit = (e) => {
    e.preventDefault();
    // Placeholder only; real auth would go here
    console.log("Login attempt", { email, pwd });
  };

  return (
    <section className="max-w-md mx-auto py-10">
      <h1 className="text-2xl font-bold mb-2">Log in</h1>
      <p className="text-zinc-400 text-sm mb-6">
        Account system is not wired yet. This screen is a visual placeholder
        while the core game loop is being built.
      </p>

      <form
        onSubmit={onSubmit}
        className="space-y-4 rounded-2xl border border-zinc-800 bg-black/60 p-6 text-sm"
      >
        <div>
          <label className="block mb-1 text-zinc-200">Email</label>
          <input
            type="email"
            className="w-full rounded-xl bg-zinc-950 border border-zinc-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
        </div>
        <div>
          <label className="block mb-1 text-zinc-200">Password</label>
          <input
            type="password"
            className="w-full rounded-xl bg-zinc-950 border border-zinc-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            value={pwd}
            onChange={(e) => setPwd(e.target.value)}
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          className="w-full mt-2 inline-flex items-center justify-center px-4 py-2.5 rounded-full bg-emerald-500 text-black font-semibold hover:bg-emerald-400 transition"
        >
          Log in (stub)
        </button>

        <p className="text-xs text-zinc-500 text-center mt-2">
          In the real app, this would unlock your existing pup save and cloud
          sync.
        </p>
      </form>
    </section>
  );
}

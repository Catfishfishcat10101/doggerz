// src/pages/Signup.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Signup() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    // TODO: wire into Firebase auth
    console.log("signup attempt", { email, displayName, password });

    // After signup, send them to adopt
    navigate("/adopt");
  };

  return (
    <div className="min-h-[calc(100vh-7rem)] bg-zinc-950 text-zinc-50 flex items-center">
      <div className="container mx-auto px-4 max-w-md">
        <h1 className="text-3xl font-bold mb-2">Create your account</h1>
        <p className="text-zinc-300 mb-6">
          Save your pup, your streaks, and your Doggerz coins across devices.
        </p>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-xl bg-zinc-900/70 p-6 border border-zinc-800"
        >
          <div className="space-y-2">
            <label
              htmlFor="displayName"
              className="block text-sm font-medium text-zinc-200"
            >
              Display name
            </label>
            <input
              id="displayName"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              maxLength={32}
              className="w-full rounded-md bg-zinc-950 border border-zinc-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="William"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-zinc-200"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md bg-zinc-950 border border-zinc-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="you@example.com"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-zinc-200"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md bg-zinc-950 border border-zinc-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-full bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-sm py-2.5 transition"
          >
            Sign up
          </button>

          <p className="text-xs text-zinc-400 text-center">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-emerald-400 hover:text-emerald-300"
            >
              Log in
            </Link>
            .
          </p>
        </form>
      </div>
    </div>
  );
}

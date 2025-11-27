// src/pages/Login.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import PageContainer from "@/features/game/components/PageContainer.jsx";
// Login: Authentication page for Doggerz
// - Form for email and password
// - ARIA roles, error handling, and meta tags for accessibility
// - Defensive: Handles missing fields and errors
export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }
    setError("");
    // TODO: Replace with actual auth logic
    // Simulate login error for demo
    if (email !== "demo@doggerz.com" || password !== "demo") {
      setError("Invalid credentials. Try again or sign up.");
      return;
    }
    navigate("/game");
  };

  return (
    <PageContainer
      title="Welcome back"
      subtitle="Log in to continue caring, protect streaks & sync your pup."
      metaDescription="Doggerz login: access your virtual pup, continue care streaks, sync progress across devices."
      padding="px-4 py-10"
    >
      <form
        onSubmit={handleSubmit}
        className="space-y-4 max-w-md"
        aria-label="Login form"
        aria-describedby="login-error"
      >
        <div className="space-y-2">
          <label
            htmlFor="email"
            className="block text-sm font-medium text-zinc-200"
          >
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-md bg-zinc-950 border border-zinc-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="you@example.com"
            aria-required="true"
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
            name="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-md bg-zinc-950 border border-zinc-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            aria-required="true"
          />
        </div>
        {error && (
          <div
            id="login-error"
            className="text-xs text-red-400 text-center"
            role="alert"
            aria-live="assertive"
          >
            {error}
          </div>
        )}
        <button
          type="submit"
          className="w-full rounded-full bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-sm py-2.5 transition"
          aria-label="Log in"
        >
          Log in
        </button>
        <p className="text-xs text-zinc-400 text-center">
          No account yet?{" "}
          <Link
            to="/signup"
            className="text-emerald-400 hover:text-emerald-300"
          >
            Create one
          </Link>
          .
        </p>
      </form>
    </PageContainer>
  );
}

// src/pages/Signup.jsx
// Doggerz: Signup page. Usage: <Signup /> is the registration route.
// Accessibility: ARIA roles, error handling, and meta tags are documented for SEO and screen readers.
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import PageContainer from "@/features/game/components/PageContainer.jsx";

/**
 * Signup: Registration page for Doggerz.
 * - Form for display name, email, and password
 * - ARIA roles, error handling, and meta tags for accessibility
 * - Defensive: Handles missing fields and errors
 */
export default function Signup() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !displayName || !password) {
      setError("Please fill out all fields.");
      return;
    }
    setError("");
    // TODO: Replace with actual signup logic
    // Simulate signup error for demo
    if (email === "taken@doggerz.com") {
      setError("Email already in use. Try logging in.");
      return;
    }
    navigate("/adopt");
  };

  return (
    <PageContainer
      title="Create your account"
      subtitle="Sync your pup, streaks & coins across devices."
      metaDescription="Doggerz signup: create account to sync your virtual dog, care streaks, and progress."
      padding="px-4 py-10"
    >
      <form
        onSubmit={handleSubmit}
        className="space-y-4 max-w-md"
        aria-label="Signup form"
        aria-describedby="signup-error"
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
            aria-required="true"
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
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-md bg-zinc-950 border border-zinc-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            aria-required="true"
          />
        </div>
        {error && (
          <div
            id="signup-error"
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
          aria-label="Sign up"
        >
          Sign up
        </button>
        <p className="text-xs text-zinc-200 text-center">
          Already have an account?{" "}
          <Link to="/login" className="text-emerald-400 hover:text-emerald-300">
            Log in
          </Link>
          .
        </p>
      </form>
    </PageContainer>
  );
}

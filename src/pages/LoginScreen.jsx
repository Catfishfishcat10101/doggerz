// src/pages/LoginScreen.jsx
// @ts-nocheck

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth, firebaseReady } from "@/firebase.js";

const provider = new GoogleAuthProvider();

export default function LoginScreen() {
  const [error, setError] = useState(null); // can be string or JSX
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleGoogleSignIn = async () => {
    if (!firebaseReady || !auth) {
      setError(
        "Firebase is not configured. Check your .env.local and firebase.js."
      );
      return;
    }

    try {
      setError(null);
      setIsLoading(true);

      const result = await signInWithPopup(auth, provider);

      console.log("[Doggerz] Signed in with Google:", result.user);

      // After login, send them into the game
      navigate("/game");
    } catch (err) {
      console.error("[Doggerz] Google sign-in error:", err);

      if (
        err.code === "auth/unauthorized-domain" ||
        err.message?.includes("redirect_uri_mismatch")
      ) {
        setError(
          <div className="text-left space-y-2">
            <div className="font-semibold">OAuth configuration error</div>
            <p className="text-sm text-zinc-300">
              Your Firebase project needs to allow this domain.
            </p>
            <p className="font-mono text-xs bg-zinc-900/80 p-2 rounded">
              Current domain: {window.location.origin}
            </p>
            <ol className="list-decimal list-inside text-xs text-zinc-400 space-y-1">
              <li>
                Open{" "}
                <a
                  href="https://console.firebase.google.com"
                  target="_blank"
                  rel="noreferrer"
                  className="text-emerald-400 hover:underline"
                >
                  Firebase Console
                </a>
              </li>
              <li>Project → Authentication → Settings</li>
              <li>Scroll to "Authorized domains"</li>
              <li>
                Add <code>localhost</code> for local dev
              </li>
              <li>Add your production domain once deployed</li>
            </ol>
          </div>
        );
      } else {
        setError(
          `Failed to sign in with Google: ${err.message || "Unknown error"}`
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-zinc-950 text-zinc-50 px-4">
      <div className="w-full max-w-sm rounded-2xl border border-zinc-800 bg-zinc-900/80 p-6 shadow-xl shadow-black/40">
        <div className="mb-4 text-center">
          <p className="text-[0.7rem] uppercase tracking-[0.3em] text-emerald-400/80 mb-1">
            Doggerz
          </p>
          <h1 className="text-xl font-semibold tracking-tight">
            Log in to your kennel
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Use your Google account to sync your pup across devices.
          </p>
        </div>

        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={isLoading}
          className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-60 disabled:cursor-not-allowed px-4 py-2.5 text-sm font-semibold text-black transition"
        >
          {isLoading ? "Signing in…" : "Sign in with Google"}
        </button>

        {error && (
          <div className="mt-4 text-xs text-red-300 bg-red-950/40 border border-red-500/40 rounded-xl p-3">
            {error}
          </div>
        )}

        {!error && !isLoading && (
          <p className="mt-3 text-[0.7rem] text-zinc-500 text-center">
            We never see your password. Authentication is handled by Google &
            Firebase.
          </p>
        )}
      </div>
    </main>
  );
}

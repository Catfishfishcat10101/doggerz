// src/components/Auth/Login.jsx
import React, { useEffect, useState } from "react";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
} from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { auth, googleProvider } from "../../firebase";

function mapAuthError(code) {
  switch (code) {
    case "auth/invalid-email":
      return "That email address looks invalid.";
    case "auth/user-disabled":
      return "This account has been disabled.";
    case "auth/user-not-found":
    case "auth/wrong-password":
      return "Email or password is incorrect.";
    case "auth/popup-closed-by-user":
      return "Google sign-in popup was closed.";
    default:
      return "Sign-in failed. Please try again.";
  }
}

function isMobileWeb() {
  return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}

export default function Login() {
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  // If a redirect sign-in completed (mobile), handle it.
  useEffect(() => {
    getRedirectResult(auth).then((res) => {
      if (res?.user) navigate("/game", { replace: true });
    }).catch(() => {});
  }, [navigate]);

  const loginWithEmail = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      // normalize email input
      const normalized = email.trim().toLowerCase();
      await signInWithEmailAndPassword(auth, normalized, pw);
      navigate("/game", { replace: true });
    } catch (err) {
      setError(mapAuthError(err.code || err.message));
    } finally {
      setBusy(false);
    }
  };

  const loginWithGoogle = async () => {
    setError("");
    setBusy(true);
    try {
      // Mobile browsers often block popups: use redirect on mobile
      if (isMobileWeb()) {
        await signInWithRedirect(auth, googleProvider);
        return; // navigation will occur after getRedirectResult
      }
      await signInWithPopup(auth, googleProvider);
      navigate("/game", { replace: true });
    } catch (err) {
      setError(mapAuthError(err.code || err.message));
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-gray-200 to-blue-100 px-4">
      <form
        onSubmit={loginWithEmail}
        className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-sm flex flex-col gap-4"
        noValidate
      >
        <h2 className="text-2xl font-bold text-blue-900 mb-2">Login</h2>

        <label className="flex flex-col gap-1">
          <span className="text-sm text-gray-700">Email</span>
          <input
            type="email"
            inputMode="email"
            autoComplete="email"
            className="border px-3 py-2 rounded outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={busy}
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm text-gray-700">Password</span>
          <div className="flex">
            <input
              type={showPw ? "text" : "password"}
              autoComplete="current-password"
              className="border px-3 py-2 rounded-l w-full outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="••••••••"
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              required
              disabled={busy}
            />
            <button
              type="button"
              onClick={() => setShowPw((s) => !s)}
              className="border border-l-0 px-3 rounded-r text-sm text-blue-600 hover:bg-blue-50"
              aria-label={showPw ? "Hide password
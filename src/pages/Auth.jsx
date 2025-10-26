// src/pages/Auth.jsx
import React, { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import SignInForm from "@components/Auth/SignInForm";
import SignUpForm from "@components/Auth/SignUpForm";

function useTab() {
  const { search } = useLocation();
  const params = useMemo(() => new URLSearchParams(search), [search]);
  const t = params.get("tab");
  return t === "signin" ? "signin" : "signup"; // default tab is signup
}

export default function AuthPage() {
  const tab = useTab();
  const nav = useNavigate();

  return (
    <main className="min-h-screen grid place-items-center">
      <div className="card w-full max-w-xl p-8">
        <div className="flex gap-2 mb-6">
          <button
            className={`btn flex-1 ${
              tab === "signup"
                ? "bg-emerald-400 text-slate-900"
                : "bg-white/10 text-white"
            }`}
            onClick={() => nav("/auth?tab=signup", { replace: true })}
          >
            Create account
          </button>
          <button
            className={`btn flex-1 ${
              tab === "signin"
                ? "bg-emerald-400 text-slate-900"
                : "bg-white/10 text-white"
            }`}
            onClick={() => nav("/auth?tab=signin", { replace: true })}
          >
            Sign in
          </button>
        </div>
        {tab === "signin" ? <SignInForm /> : <SignUpForm />}
      </div>
    </main>
  );
}

// src/pages/Auth.jsx
import React, { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import SignInForm from "@components/Auth/SignInForm";
import SignUpForm from "@components/Auth/SignUpForm";

function useTab() {
  const { search } = useLocation();
  const params = useMemo(() => new URLSearchParams(search), [search]);
  const t = params.get("tab");
  return t === "signin" ? "signin" : "signup";
}

export default function AuthPage() {
  const tab = useTab();
  const nav = useNavigate();

  return (
    <main className="min-h-screen grid place-items-center">
      <div className="card w-full max-w-xl p-8">
        <div className="flex gap-2 mb-6">
          <button
            className={`btn flex-1 ${tab === "signup" ? "btn-primary" : "bg-white/10"}`}
            onClick={() => nav("/auth?tab=signup")}
          >
            Create account
          </button>
          <button
            className={`btn flex-1 ${tab === "signin" ? "btn-secondary" : "bg-white/10"}`}
            onClick={() => nav("/auth?tab=signin")}
          >
            Sign in
          </button>
        </div>
        {tab === "signin" ? <SignInForm /> : <SignUpForm />}
      </div>
    </main>
  );
}
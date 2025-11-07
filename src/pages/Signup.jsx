import React from "react";
import { useNavigate } from "react-router-dom";

export default function Signup() {
  const nav = useNavigate();
  return (
    <div className="min-h-[calc(100dvh-3.5rem-3rem)] grid place-items-center bg-[#0b1020] text-white">
      <div className="card max-w-md w-full text-center">
        <h1 className="text-2xl font-bold">Create account</h1>
        <p className="mt-2 text-white/70">We use Google sign-in. It’s one tap.</p>
        <div className="mt-4">
          <button className="btn" onClick={() => nav("/login")}>Continue with Google</button>
        </div>
      </div>
    </div>
  );
}
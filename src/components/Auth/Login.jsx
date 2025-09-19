// src/components/Auth/Login.jsx
import React, { useState } from "react";
import { useSelector } from "react-redux";
import { Navigate, Link } from "react-router-dom";
import { auth, googleProvider } from "../../firebase";
import { signInWithPopup, signInWithEmailAndPassword } from "firebase/auth";
import { selectUid } from "../../redux/userSlice";

export default function Login() {
  const uid = useSelector(selectUid);
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [err, setErr] = useState("");

  if (uid) return <Navigate to="/game" replace />;

  const onGoogle = async () => {
    setErr("");
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (e) {
      setErr(e?.message || "Google sign-in failed");
    }
  };

  const onEmail = async (e) => {
    e.preventDefault();
    setErr("");
    try {
      await signInWithEmailAndPassword(auth, email.trim(), pwd);
    } catch (e2) {
      setErr(e2?.message || "Login failed");
    }
  };

  return (
    <main className="p-6 space-y-4 max-w-sm mx-auto">
      <h1 className="text-xl font-bold">Sign in</h1>

      {err && <p className="text-sm text-red-600">{err}</p>}

      <button
        onClick={onGoogle}
        className="w-full rounded-lg bg-sky-600 text-white px-3 py-2 hover:bg-sky-700"
      >
        Continue with Google
      </button>

      <div className="h-px bg-slate-200" />

      <form className="space-y-3" onSubmit={onEmail}>
        <input
          className="w-full rounded-lg border px-3 py-2"
          placeholder="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
        />
        <input
          className="w-full rounded-lg border px-3 py-2"
          placeholder="Password"
          type="password"
          value={pwd}
          onChange={(e) => setPwd(e.target.value)}
          autoComplete="current-password"
        />
        <button className="w-full rounded-lg border px-3 py-2 hover:bg-slate-50">
          Sign in
        </button>
      </form>

      <p className="text-sm text-slate-600">
        New here?{" "}
        <Link className="text-sky-700 hover:underline" to="/signup">
          Create an account
        </Link>
      </p>
    </main>
  );
}
// src/router.jsx
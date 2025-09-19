import React, { useState } from "react";
import { useSelector } from "react-redux";
import { Navigate, Link } from "react-router-dom";
import { auth } from "../../firebase";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { selectUid } from "../../redux/userSlice";

export default function Signup() {
  const uid = useSelector(selectUid);
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [name, setName] = useState("");
  const [err, setErr] = useState("");

  if (uid) return <Navigate to="/game" replace />;

  const onSignup = async (e) => {
    e.preventDefault();
    setErr("");
    try {
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), pwd);
      if (name.trim()) {
        await updateProfile(cred.user, { displayName: name.trim() });
      }
    } catch (e2) {
      setErr(e2?.message || "Signup failed");
    }
  };

  return (
    <main className="p-6 space-y-4 max-w-sm mx-auto">
      <h1 className="text-xl font-bold">Create account</h1>
      {err && <p className="text-sm text-red-600">{err}</p>}
      <form className="space-y-3" onSubmit={onSignup}>
        <input
          className="w-full rounded-lg border px-3 py-2"
          placeholder="Display name (optional)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoComplete="nickname"
        />
        <input
          className="w-full rounded-lg border px-3 py-2"
          placeholder="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          required
        />
        <input
          className="w-full rounded-lg border px-3 py-2"
          placeholder="Password"
          type="password"
          value={pwd}
          onChange={(e) => setPwd(e.target.value)}
          autoComplete="new-password"
          required
        />
        <button className="w-full rounded-lg bg-emerald-600 text-white px-3 py-2 hover:bg-emerald-700">
          Sign up
        </button>
      </form>
      <p className="text-sm text-slate-600">
        Already have an account?{" "}
        <Link className="text-sky-700 hover:underline" to="/login">
          Log in
        </Link>
      </p>
    </main>
  );
}

// src/components/Auth/Signup.jsx
import React, { useState } from "react";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { auth } from "../../firebase";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const normalized = email.trim().toLowerCase();
      const cred = await createUserWithEmailAndPassword(auth, normalized, pw);
      if (name) await updateProfile(cred.user, { displayName: name });
      navigate("/game", { replace: true });
    } catch (err) {
      setError(err.code || err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-200 to-blue-100 px-4">
      <form onSubmit={onSubmit} className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-sm flex flex-col gap-4">
        <h2 className="text-2xl font-bold text-blue-900 mb-2">Create account</h2>

        <input
          className="border px-3 py-2 rounded"
          placeholder="Display name (optional)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={busy}
        />
        <input
          type="email"
          className="border px-3 py-2 rounded"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={busy}
        />
        <input
          type="password"
          className="border px-3 py-2 rounded"
          placeholder="Password"
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          required
          disabled={busy}
        />

        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded font-semibold disabled:opacity-60"
          disabled={busy}
        >
          {busy ? "Creating..." : "Sign up"}
        </button>

        <button
          type="button"
          onClick={() => navigate("/login")}
          className="text-blue-600 underline underline-offset-2"
          disabled={busy}
        >
          Already have an account? Log in
        </button>

        {error && <div className="text-red-600 text-sm">{error}</div>}
      </form>
    </div>
  );
}
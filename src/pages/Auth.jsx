import { useState } from "react";
import { useAuth } from "../context/AuthProvider.jsx";
import { useLocation, useNavigate } from "react-router-dom";

export default function Auth() {
  const { signIn, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const nav = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

  const onSubmit = async (e) => {
    e.preventDefault();
    await signIn(email, password);
    nav(from, { replace: true });
  };

  return (
    <main className="min-h-dvh grid place-items-center p-6">
      <form onSubmit={onSubmit} className="w-full max-w-sm space-y-4 border rounded-xl p-6">
        <h1 className="text-xl font-semibold">Sign in</h1>
        <label className="block">
          <span className="text-sm">Email</span>
          <input
            className="mt-1 w-full border rounded p-2"
            type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
          />
        </label>
        <label className="block">
          <span className="text-sm">Password</span>
          <input
            className="mt-1 w-full border rounded p-2"
            type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
          />
        </label>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg px-4 py-2 border"
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </main>
  );
}

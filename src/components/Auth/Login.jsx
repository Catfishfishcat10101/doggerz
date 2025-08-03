// src/components/Auth/Login.jsx
import React, { useState } from "react";
import { auth, googleProvider } from "../../firebase";
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const loginWithEmail = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await signInWithEmailAndPassword(auth, email, pw);
      navigate("/game");
    } catch (err) {
      setError(err.message);
    }
  };

  const loginWithGoogle = async () => {
    setError("");
    try {
      await signInWithPopup(auth, googleProvider);
      navigate("/game");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-gray-200 to-blue-100">
      <form
        onSubmit={loginWithEmail}
        className="bg-white rounded-2xl shadow-lg p-8 max-w-sm w-full flex flex-col gap-4"
      >
        <h2 className="text-2xl font-bold text-blue-900 mb-2">Login</h2>
        <input
          type="email"
          className="border px-3 py-2 rounded"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          className="border px-3 py-2 rounded"
          placeholder="Password"
          value={pw}
          onChange={e => setPw(e.target.value)}
          required
        />
        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded font-semibold"
        >
          Login
        </button>
        <button
          type="button"
          onClick={loginWithGoogle}
          className="bg-white border border-blue-400 text-blue-700 px-4 py-2 rounded hover:bg-blue-50 font-semibold flex items-center gap-2 justify-center"
        >
          <span>Sign in with Google</span> <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
        </button>
        <div className="text-sm text-gray-600 mt-2">
          Don&apos;t have an account?{" "}
          <button
            className="text-blue-500 underline"
            onClick={() => navigate("/signup")}
            type="button"
          >
            Sign up
          </button>
        </div>
        {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
      </form>
    </div>
  );
}

import React, { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebase";
import { loginSuccess } from "../../redux/userSlice.js";

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const loggedIn = useSelector((s) => s.user.loggedIn);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  /* already logged in? → /game */
  if (loggedIn) return <Navigate to="/game" replace />;

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const { user } = await signInWithEmailAndPassword(auth, email, password);
      dispatch(loginSuccess({ uid: user.uid, email: user.email }));
      navigate("/game");
    } catch (err) {
      console.error("Login error", err);
      setError("Login failed. Check your email and password.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-purple-600 to-blue-600 text-white px-4">
      <h2 className="text-4xl font-bold mb-4 drop-shadow">🐾 Doggerz Login</h2>

      <form
        onSubmit={handleLogin}
        className="bg-white text-black p-6 rounded shadow-md w-full max-w-sm"
      >
        {error && <p className="text-red-500 mb-2">{error}</p>}

        <label className="font-semibold">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border p-2 w-full mb-4 rounded"
          required
        />

        <label className="font-semibold">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border p-2 w-full mb-4 rounded"
          required
        />

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded w-full hover:bg-blue-700"
        >
          Log&nbsp;In
        </button>

        <p className="text-sm text-center mt-4">
          Don’t have an account?{" "}
          <Link to="/signup" className="text-blue-600 hover:underline">
            Sign up here
          </Link>
        </p>
      </form>
    </div>
  );
}

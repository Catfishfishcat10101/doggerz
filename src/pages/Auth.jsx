import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

// If you have Firebase set up (src/firebase.js from earlier), these will work.
// If not, the page still renders; the buttons just won’t do anything when clicked.
import { auth, googleProvider } from "../firebase";
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";

export default function AuthPage() {
  const [mode, setMode] = useState("signin"); // "signin" | "signup"
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const navigate = useNavigate();

  const onGoogle = async () => {
    try {
      setLoading(true);
      setErr("");
      await signInWithPopup(auth, googleProvider);
      navigate("/game");
    } catch (e) {
      setErr(e.message || "Google sign-in failed");
    } finally {
      setLoading(false);
    }
  };

  const onSubmitEmail = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setErr("");
      if (mode === "signin") {
        await signInWithEmailAndPassword(auth, email, pw);
      } else {
        await createUserWithEmailAndPassword(auth, email, pw);
      }
      navigate("/game");
    } catch (e) {
      setErr(e.message || "Auth failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100dvh", display: "grid", placeItems: "center", background: "#0ea5e922" }}>
      <div style={{ width: 360, padding: 20, borderRadius: 12, background: "#fff", boxShadow: "0 10px 30px rgba(0,0,0,.12)" }}>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, textAlign: "center" }}>Doggerz</h1>
        <p style={{ marginTop: 6, textAlign: "center", color: "#555" }}>
          {mode === "signin" ? "Sign in to continue" : "Create your account"}
        </p>

        <div style={{ display: "flex", gap: 6, margin: "14px 0" }}>
          <button
            onClick={() => setMode("signin")}
            style={{
              flex: 1,
              padding: "8px 0",
              borderRadius: 8,
              border: "1px solid #e5e7eb",
              background: mode === "signin" ? "#eef2ff" : "#fff",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Sign In
          </button>
          <button
            onClick={() => setMode("signup")}
            style={{
              flex: 1,
              padding: "8px 0",
              borderRadius: 8,
              border: "1px solid #e5e7eb",
              background: mode === "signup" ? "#dcfce7" : "#fff",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Sign Up
          </button>
        </div>

        <form onSubmit={onSubmitEmail} style={{ display: "grid", gap: 10 }}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ padding: 10, borderRadius: 8, border: "1px solid #e5e7eb" }}
          />
          <input
            type="password"
            placeholder="Password"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            required
            style={{ padding: 10, borderRadius: 8, border: "1px solid #e5e7eb" }}
          />
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: "10px 14px",
              borderRadius: 8,
              border: "none",
              background: "#10b981",
              color: "#fff",
              fontWeight: 800,
              cursor: "pointer",
            }}
          >
            {loading ? "Working…" : mode === "signin" ? "Sign In" : "Create Account"}
          </button>
        </form>

        <div style={{ height: 10 }} />

        <button
          onClick={onGoogle}
          disabled={loading}
          style={{
            width: "100%",
            padding: "10px 14px",
            borderRadius: 8,
            border: "1px solid #e5e7eb",
            background: "#fff",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Continue with Google
        </button>

        {!!err && (
          <p style={{ color: "#ef4444", marginTop: 10, fontSize: 14 }}>
            {err}
          </p>
        )}
      </div>
    </div>
  );
}

// src/components/Auth/LogoutButton.jsx
import React, { useState } from "react";
import { signOut } from "firebase/auth";
import { auth } from "../../firebase";
import { useDispatch } from "react-redux";
import { clearUser } from "../../redux/userSlice";
import { useNavigate } from "react-router-dom";

export default function LogoutButton({ className = "", children, onLogout }) {
  const [pending, setPending] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    if (pending) return;
    setPending(true);
    try {
      await signOut(auth);
      dispatch(clearUser());
      onLogout?.();
      navigate("/auth"); // <- match your routes (or "/")
    } catch (err) {
      alert("Logout failed: " + err.message);
    } finally {
      setPending(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={pending}
      aria-busy={pending}
      className={
        "inline-flex items-center gap-2 px-4 py-2 rounded font-bold transition " +
        "bg-red-500 hover:bg-red-600 disabled:opacity-60 disabled:cursor-not-allowed " +
        className
      }
    >
      {children ?? "Log Out"}
    </button>
  );
}

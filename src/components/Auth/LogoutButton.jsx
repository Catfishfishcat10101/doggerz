import React from "react";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function LogoutButton({ className = "" }) {
  const nav = useNavigate();

  async function onLogout() {
    try {
      await signOut(auth);
    } catch (e) {
      console.error("Logout error:", e);
    } finally {
      nav("/"); // back to splash
    }
  }

  return (
    <button onClick={onLogout} className={`btn btn-ghost ${className}`}>
      Log out
    </button>
  );
}

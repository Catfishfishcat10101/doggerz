import React, { useState } from "react";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "@/firebase";
import { useNavigate } from "react-router-dom";

export default function Signup() {
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const nav = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const em = String(email || "").trim().toLowerCase();
      const pass = String(pw || "");
      if (!em || !pass) throw new Error("auth/argument-error");
      const cred = await createUserWithEmailAndPassword(auth, em, pass);
      if (displayName) await updateProfile(cred.user, { displayName });
      nav("/game", { replace: true });
    } catch (err) {
      setError(err?.code || err?.message || String(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h
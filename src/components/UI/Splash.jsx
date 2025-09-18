import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import "./Splash.css";
import SoundManager from "../Features/SoundManager";

export default function Splash() {
  useEffect(() => {
    const id = setInterval(() => SoundManager.play("bark"), 1800);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="splash-wrap grid place-items-center">
      <div className="dog-jumper" />
      <div className="max-w-md w-full mx-auto p-6 bg-white/80 rounded-2xl shadow text-center space-y-4">
        <h1 className="text-3xl font-bold text-rose-900">Doggerz</h1>
        <p className="text-rose-900/70">
          Adopt a pixel pup. Train, potty, and collect accessories.
        </p>
        <div className="flex gap-3 justify-center">
          <Link to="/login" className="px-4 py-2 rounded-xl bg-rose-600 text-white active:scale-95">Sign In</Link>
          <Link to="/signup" className="px-4 py-2 rounded-xl bg-rose-100 text-rose-900 active:scale-95">Sign Up</Link>
        </div>
      </div>
    </div>
  );
}
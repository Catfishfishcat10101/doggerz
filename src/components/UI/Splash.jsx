// src/components/UI/Splash.jsx
import React, { useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import barkSfx from "../../assets/audio/bark1.mp3";
import logoPaw from "../../assets/ui/logo-paw.svg"; // optional; replace or remove

export default function Splash() {
  const audioRef = useRef(null);

  const bark = useCallback(async () => {
    try {
      await audioRef.current?.play();
    } catch {}
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-sky-50 to-emerald-100">
      <audio ref={audioRef} src={barkSfx} preload="auto" />
      <div className="text-center px-6">
        <div className="mx-auto w-24 h-24 mb-4 animate-bounce" onClick={bark} role="button" title="Woof!">
          {logoPaw ? (
            <img src={logoPaw} alt="Doggerz Paw" className="w-full h-full drop-shadow" />
          ) : (
            <div className="w-full h-full bg-emerald-500 rounded-full shadow-inner" />
          )}
        </div>
        <h1 className="text-4xl font-black text-emerald-900 tracking-tight">Doggerz</h1>
        <p className="mt-2 text-emerald-800/80">
          The most realistic virtual dog: age, train, potty, and grow together.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/signup"
            className="px-5 py-3 rounded-2xl bg-emerald-600 text-white font-semibold shadow hover:shadow-md active:scale-95"
          >
            Sign Up
          </Link>
          <Link
            to="/login"
            className="px-5 py-3 rounded-2xl bg-white text-emerald-700 font-semibold shadow hover:shadow-md active:scale-95"
          >
            Sign In
          </Link>
        </div>

        <button
          onClick={bark}
          className="mt-6 text-sm text-emerald-700/80 underline underline-offset-4"
        >
          Make the dog bark 🐶
        </button>
      </div>
    </div>
  );
}

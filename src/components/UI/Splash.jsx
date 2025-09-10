// src/components/UI/Splash.jsx
import React, { useRef, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Splash.css";

export default function Splash() {
  const navigate = useNavigate();
  const audioRef = useRef(null);
  const [canPlay, setCanPlay] = useState(false);

  // Mobile browsers need a user gesture for audio — enable after first tap
  useEffect(() => {
    const enableAudio = () => setCanPlay(true);
    window.addEventListener("pointerdown", enableAudio, { once: true });
    return () => window.removeEventListener("pointerdown", enableAudio);
  }, []);

  const bark = () => {
    if (!canPlay) return;
    audioRef.current?.currentTime && (audioRef.current.currentTime = 0);
    audioRef.current?.play().catch(() => {});
  };

  return (
    <div className="splash bg-gradient-to-b from-sky-200 to-indigo-200 text-center">
      {/* Bark SFX (place file at /public/audio/bark.mp3) */}
      <audio ref={audioRef} src="/audio/bark.mp3" preload="auto" />

      {/* Title + Tagline */}
      <header className="splash-header">
        <h1 className="splash-title">Doggerz</h1>
        <p className="splash-tag">The most realistic virtual dog simulator.</p>
      </header>

      {/* Dog running track (click/tap to bark) */}
      <div className="puppy-stage" onPointerDown={bark} onClick={bark}>
        <div className="puppy-track">
          {/* You can swap this emoji for an <img> sprite if you prefer */}
          <div className="puppy" aria-label="excited dog" title="Tap to bark!">🐶</div>
        </div>
        <div className="tap-note">Tap anywhere to bark 🐾</div>
      </div>

      {/* CTA buttons */}
      <div className="cta">
        <button className="btn btn-primary" onClick={() => navigate("/signup")}>
          Sign up
        </button>
        <button className="btn btn-ghost" onClick={() => navigate("/login")}>
          Sign in
        </button>
      </div>

      {/* Footer bits */}
      <footer className="splash-foot">
        <ul className="pillrow">
          <li>Potty training</li>
          <li>Tricks</li>
          <li>Aging</li>
          <li>Stats & Levels</li>
          <li>Milestones</li>
        </ul>
      </footer>
    </div>
  );
}
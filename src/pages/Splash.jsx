// src/components/UI/Splash.jsx
import React, { useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import "./Splash.css";

// Use Vite-managed asset import so bundling/hashing works
import dogSheet from "../../assets/sprites/dog.png"; // 8x96px frames horizontally (768x96)

export default function Splash() {
  const barkRef = useRef(null);

  // Soft-fail audio: loads if present, otherwise noop
  useEffect(() => {
    try {
      barkRef.current = new Audio("/assets/audio/bark1.mp3");
      barkRef.current.preload = "auto";
      // keep volume chill on landing
      barkRef.current.volume = 0.35;
    } catch {}
  }, []);

  const playBark = async () => {
    try {
      await barkRef.current?.play();
    } catch {}
  };

  return (
    <div className="splash-wrap">
      {/* Decorative confetti layers */}
      <div className="confetti confetti--back" aria-hidden="true" />
      <div className="confetti confetti--front" aria-hidden="true" />

      <header className="splash-header">
        <div className="brand">
          <span className="brand-mark">🐾</span>
          <span className="brand-name">Doggerz</span>
        </div>
        <nav className="top-actions">
          <Link to="/stats" className="link subtle">Stats</Link>
          <Link to="/shop" className="link subtle">Shop</Link>
          <Link to="/login" className="btn ghost">Log in</Link>
          <Link to="/signup" className="btn primary">Sign up</Link>
        </nav>
      </header>

      <main className="splash-main">
        <section className="hero">
          <h1 className="hero-title">
            Raise, train, and <span className="underline">brag</span> about your pixel pup.
          </h1>
          <p className="hero-sub">
            Lightweight. Offline-ready. Weirdly wholesome.
          </p>

          <div className="cta-row">
            <Link to="/game" className="btn xl primary" onClick={playBark}>
              ▶ Start Game
            </Link>
            <Link to="/train/tricks" className="btn xl white">
              🎓 Try Tricks
            </Link>
            <button className="btn xl ghost" onClick={playBark} title="Bark! (B)">
              🗣️ Bark
            </button>
          </div>

          {/* Hero feature bullets */}
          <ul className="pills">
            <li>WASD / Arrows • B to Bark</li>
            <li>PWA install-ready</li>
            <li>Autosave to Firebase</li>
          </ul>
        </section>

        {/* Sprite hero */}
        <div className="sprite-stage" aria-hidden="true">
          <div
            className="dog-jumper dog-frames"
            style={{
              // feed the CSS var so background-image resolves via Vite import
              "--sheet-url": `url('${dogSheet}')`,
            }}
          />
          <div className="dog-shadow" />
        </div>
      </main>

      <footer className="splash-footer">
        <span>Protip: Install on your phone for instant-launch.</span>
        <span className="sep">•</span>
        <Link to="/accessories" className="link subtle">🧢 Accessories</Link>
        <span className="sep">•</span>
        <Link to="/breed" className="link subtle">🐶 Breeding</Link>
      </footer>
    </div>
  );
}
// src/components/UI/DogAIEngine.jsx
// src/components/UI/Splash.jsx
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Splash.css";

// Use the single good copies in Features:
import DogSprite from "./DogSprite";


// Local asset (put the image at: src/assets/backgrounds/yard_day.jpg)
import bg from "../../assets/backgrounds/yard_day.jpg";

export default function Splash() {
  const navigate = useNavigate();

  useEffect(() => {
    const t1 = setTimeout(() => Sound.bark(), 700);
    const t2 = setTimeout(() => Sound.bark(), 2200);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  return (
    <div className="splash-root">
      <div className="splash-backdrop" style={{ backgroundImage: `url(${bg})` }} />
      <div className="splash-overlay" />

      <div className="splash-card">
        <h1 className="logo">🐾 Doggerz</h1>
        <p className="tag">The most realistic virtual dog sim—raise, train, love, and play!</p>

        <div className="dog-bounce" title="Woof!">
          <DogSprite x={0} y={0} direction="down" isWalking={false} size={96} />
        </div>

        <div className="cta-row">
          <button className="btn primary" onClick={() => navigate("/auth?m=signup")}>Sign up</button>
          <button className="btn" onClick={() => navigate("/auth")}>Sign in</button>
          <button
            className="btn ghost"
            onClick={() => { Sound.bark(); navigate("/game"); }}
          >
            Continue
          </button>
        </div>

        <p className="rights">© {new Date().getFullYear()} Doggerz. All rights reserved.</p>
      </div>
    </div>
  );
}

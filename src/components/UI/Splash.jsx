import React from "react";
import { Link } from "react-router-dom";

const Bullet = ({ title, body }) => (
  <div className="card p-4">
    <div className="font-semibold">{title}</div>
    <div className="text-white/70 text-sm mt-1">{body}</div>
  </div>
);

export default function Splash() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-10 grid gap-8 lg:grid-cols-2">
      <section className="flex flex-col justify-center gap-6">
        <h1 className="text-4xl md:text-5xl font-black leading-tight">
          Adopt your pixel pup. <span className="text-sky">Raise. Train. Bond.</span>
        </h1>
        <p className="text-white/70">
          One dog per user, offline-ready, choices that shape behavior. Install it like an app and keep playing without signal.
        </p>
        <div className="flex gap-3">
          <Link to="/game" className="btn btn-primary animate-pop">Play Now</Link>
          <a href="#learn" className="btn">Learn More</a>
        </div>
        <div className="flex items-center gap-2">
          <span className="badge">React 18</span>
          <span className="badge">Redux</span>
          <span className="badge">Firebase</span>
          <span className="badge">Offline</span>
        </div>
      </section>

      <section className="grid gap-3" id="learn">
        <Bullet title="Needs & Mood"
          body="Feed, play, rest. Mood drives animations and behaviors." />
        <Bullet title="Installable PWA"
          body="One tap install. Auto-updates with a toast, no app store delay." />
        <Bullet title="Responsive Controls"
          body="Keyboard, touch D-pad, or click-to-move. Accessible and smooth." />
        <Bullet title="Shop & Cosmetics"
          body="Earn coins, unlock skins, keep it tasteful. No pay-to-win nonsense." />
      </section>
    </main>
  );
}
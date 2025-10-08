<<<<<<< HEAD
export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen text-center bg-gradient-to-b from-[#0b1220] to-black">
      <h1 className="text-4xl font-extrabold tracking-wide text-teal-400 drop-shadow-lg">
        Welcome to <span className="text-indigo-400">Doggerz</span>
      </h1>
      <p className="mt-3 text-lg text-gray-300">Adopt. Train. Bond. Vibe.</p>
      <a
        href="/game"
        className="mt-8 px-6 py-3 text-lg bg-indigo-500 hover:bg-indigo-600 rounded-2xl text-white transition-all duration-200"
      >
        Start Game
      </a>
=======
import React from "react";
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <main className="min-h-dvh bg-gradient-to-b from-[#0b1220] to-black text-center">
      <section className="mx-auto flex min-h-dvh max-w-3xl flex-col items-center justify-center px-6 py-16">
        <h1 className="text-4xl font-extrabold tracking-wide text-teal-400 drop-shadow-lg md:text-5xl">
          Welcome to <span className="text-indigo-400">Doggerz</span>
        </h1>

        <p className="mt-3 text-lg text-gray-300 md:text-xl">
          Adopt. Train. Bond.
        </p>

        <Link
          to="/game"
          className="mt-8 rounded-2xl bg-indigo-500 px-6 py-3 text-lg text-white transition-colors duration-200 hover:bg-indigo-600"
          aria-label="Start the Doggerz game"
        >
          Start Game
        </Link>

        {/* Optional subtext for SEO/UX */}
        <p className="mt-6 text-sm text-gray-400">
          Offline-ready PWA • High-contrast UI • Keyboard-friendly
        </p>
      </section>
>>>>>>> 84e3e758 (k)
    </main>
  );
}
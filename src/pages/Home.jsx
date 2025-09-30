// src/pages/Home.jsx
import React from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectUser } from "@/redux/userSlice.js";

export default function Home() {
  const user = useSelector(selectUser);
  return (
    <section className="max-w-2xl">
      <h1 className="text-4xl sm:text-5xl font-extrabold">
        Welcome{user?.displayName ? `, ${user.displayName}` : ""}!
      </h1>
      <p className="mt-3 text-white/80">
        Head to the game to care for your pup. Potty training is live — guide your pup to the yard before accidents happen.
      </p>
      <div className="mt-6 flex gap-3">
        <Link to="/game" className="px-5 py-3 rounded-2xl bg-amber-400 text-slate-900 font-semibold hover:bg-amber-300">
          Go to Game
        </Link>
        <Link to="/profile" className="px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/20">
          Profile
        </Link>
      </div>
    </section>
  );
}

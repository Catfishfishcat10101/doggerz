// src/pages/About.jsx
<<<<<<< HEAD
// @ts-nocheck
import React from "react";

export default function About() {
  return (
    <main className="min-h-screen w-full bg-black text-white">
      <div className="max-w-4xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-extrabold text-emerald-300 tracking-wide">
          About Doggerz
        </h1>

        <p className="mt-3 text-zinc-300 leading-relaxed">
          Doggerz is a virtual pup simulator focused on bonding and training —
          not an idle clicker. You adopt one dog, care for it, potty-train it,
          and unlock trick training as you progress.
        </p>

        <section className="mt-8 rounded-2xl border border-emerald-500/15 bg-white/5 p-5">
          <h2 className="text-lg font-bold text-emerald-200">
            Core principles
          </h2>
          <ul className="mt-3 space-y-2 text-zinc-300 list-disc pl-5">
            <li>Action-based gameplay (your choices drive outcomes).</li>
            <li>Potty training gates trick training.</li>
            <li>Clear, readable UI with a dark + neon accent style.</li>
          </ul>
        </section>
      </div>
    </main>
=======
import Header from "@/components/Header.jsx";
import Footer from "@/components/Footer.jsx";

export default function AboutPage() {
  return (
    <>
      <Header />
      <div className="flex-1 px-6 py-10 flex justify-center">
        <div className="max-w-4xl w-full space-y-6">
          <h1 className="text-5xl font-emerald tracking-tight mb-1">
            ~ How~Doggerz~Works ~

          </h1>
          <br></br>
          <br></br>
          <p className="text-md text-zinc-400">
            Doggerz is your realistic virtual dog.<br></br>
            <br></br>Their stats, temperament, and behavior are based
            on the choices you make.<br></br>
            Even while you are gone!
          </p>

          <section className="space-y-2 text-md text-zinc-400">
            <h2 className="font-semibold text-zinc-100">Core loop</h2>
            <ul className="list-disc list-inside space-y-1">
              <li>Play together, Learn together.</li>
              <li>Bathe regularly to avoid fleas, mange, and disease!</li>
              <li>Your dog <b>will</b> auto-sleep when tired; let them sleep..</li>
              <li>
                Be sure to let them outside regularly to get them potty trained to avoid messy  “accidents”.
              </li>
            </ul>
          </section>

          <section className="space-y-2 text-md text-zinc-400">
            <h2 className="font-semibold text-zinc-100">Aging &amp; life</h2>
            <p>
              Time in Doggerz is <b>accelerated:</b> Your dog ages <b>faster</b> than real time.
              With good care they can live a long, happy life!<br></br> But Ignoring them for
              days has consequences — hunger, poor cleanliness, and low health can
              eventually lead to death.
            </p>
          </section>

          <section className="space-y-2 text-md text-zinc-400">
            <h2 className="font-semibold text-zinc-100">Potty training</h2>
            <p>
              Every successful potty trip outside raises their potty-training
              meter. Once it hits 100%, they earn a potty-trained badge and indoor
              accidents become rare.
            </p>
          </section>
        </div>
      </div>

      <Footer />
    </>
>>>>>>> master
  );
}

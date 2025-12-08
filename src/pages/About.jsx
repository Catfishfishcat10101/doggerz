// src/pages/About.jsx
import React from "react";

export default function AboutPage() {
  return (
    <div className="flex-1 px-6 py-10 flex justify-center">
      <div className="max-w-3xl w-full space-y-6">
        <h1 className="text-3xl font-black tracking-tight mb-2">
          How Doggerz works
        </h1>
        <p className="text-sm text-zinc-300">
          Doggerz is a real-time virtual pup simulator. Their stats drift based
          on actual time, even while you are gone.
        </p>

        <section className="space-y-2 text-sm text-zinc-300">
          <h2 className="font-semibold text-zinc-100">Core loop</h2>
          <ul className="list-disc list-inside space-y-1">
            <li>Play to keep happiness up (but watch energy).</li>
            <li>Bathe regularly to avoid fleas and mange.</li>
            <li>They auto-sleep when exhausted; let them recharge.</li>
            <li>
              Take them potty outside to train them and avoid “indoor
              accidents”.
            </li>
          </ul>
        </section>

        <section className="space-y-2 text-sm text-zinc-300">
          <h2 className="font-semibold text-zinc-100">Aging &amp; life</h2>
          <p>
            Time in Doggerz is accelerated: your dog ages faster than real time.
            With good care they can live a long, happy life. Ignoring them for
            days has consequences — hunger, poor cleanliness, and low health can
            eventually lead to death. The simulator aims for a realistic lifespan
            (roughly 17 dog years by default) while letting care and choices
            influence outcomes.
          </p>
        </section>

        <section className="space-y-2 text-sm text-zinc-300">
          <h2 className="font-semibold text-zinc-100">Potty training</h2>
          <p>
            Every successful potty trip outside raises their potty-training
            meter. Once it hits 100%, they earn a potty-trained badge and indoor
            accidents become rare.
          </p>
        </section>
      </div>
    </div>
  );
}

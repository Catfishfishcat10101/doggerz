// src/pages/About.jsx

import PageShell from "@/components/PageShell.jsx";

export default function AboutPage() {
  return (
    <PageShell>
      <div className="max-w-4xl space-y-8">
        <header className="space-y-3">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-emerald-200">
            About Doggerz
          </h1>
          <p className="text-zinc-300 leading-relaxed">
            Doggerz is a virtual pup simulator focused on bonding and training —
            not an idle clicker. You adopt one dog, care for it, potty-train it,
            and unlock trick training as you progress.
          </p>
          <p className="text-zinc-400">
            Your dog&apos;s stats, temperament, and behavior respond to the
            choices you make — even while you&apos;re away.
          </p>
        </header>

        <section className="rounded-2xl border border-emerald-500/15 bg-white/5 p-5">
          <h2 className="text-lg font-bold text-emerald-200">
            Core principles
          </h2>
          <ul className="mt-3 space-y-2 text-zinc-300 list-disc pl-5">
            <li>Action-based gameplay (your choices drive outcomes).</li>
            <li>Potty training gates trick training.</li>
            <li>Clear, readable UI with a dark + neon accent style.</li>
          </ul>
        </section>

        <section className="rounded-2xl border border-white/10 bg-black/20 p-5">
          <h2 className="text-lg font-bold text-zinc-100">Core loop</h2>
          <ul className="mt-3 list-disc list-inside space-y-2 text-zinc-300">
            <li>Play together, learn together.</li>
            <li>Bathe regularly to avoid fleas, mange, and disease.</li>
            <li>Your dog will auto-sleep when tired — let them rest.</li>
            <li>
              Take them outside regularly to build potty training and avoid
              messy accidents.
            </li>
          </ul>
        </section>

        <section className="rounded-2xl border border-white/10 bg-black/20 p-5 space-y-2">
          <h2 className="text-lg font-bold text-zinc-100">Aging &amp; life</h2>
          <p className="text-zinc-300">
            Time in Doggerz is <b>accelerated</b>: your dog ages faster than
            real time. With good care they can live a long, happy life — but
            ignoring them for days has consequences.
          </p>
          <p className="text-zinc-400">
            Hunger, poor cleanliness, and low health can eventually lead to
            sickness… and yes, the sad ending.
          </p>
        </section>

        <section className="rounded-2xl border border-white/10 bg-black/20 p-5 space-y-2">
          <h2 className="text-lg font-bold text-zinc-100">Potty training</h2>
          <p className="text-zinc-300">
            Every successful potty trip outside raises their potty-training
            meter. Once it hits 100%, they earn a potty-trained badge and indoor
            accidents become rare.
          </p>
        </section>
      </div>
    </PageShell>
  );
}

// src/pages/Landing.jsx
import * as React from "react";

export default function Landing() {
  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-50">
      <section className="max-w-5xl mx-auto py-12 px-4">
        <div className="grid grid-cols-1 gap-8">
          {/* Landing hero / content */}
          <div className="rounded-lg p-6 bg-zinc-800">
            <h1 className="text-4xl font-bold">Welcome to Doggerz</h1>
            <p className="mt-2 text-zinc-400">
              Your virtual Jack Russell awaits — feed, play, train, and watch them grow.
            </p>
          </div>

          {/* Features / CTA */}
          <div className="grid md:grid-cols-3 gap-4">
            {/* ...existing code... */}
          </div>
        </div>
      </section>

      {/* Header + footer are already handled somewhere else in your app. */}
    </main>
  );
}

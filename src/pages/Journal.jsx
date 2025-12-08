// src/pages/Journal.jsx
// @ts-nocheck
import React from "react";
import { useSelector } from "react-redux";
import { selectDogJournal, selectDog } from "@/redux/dogSlice.js";

export default function Journal() {
  const journal = useSelector(selectDogJournal) || { entries: [] };
  const dog = useSelector(selectDog);

  const entries = journal.entries || [];

  return (
    <div className="min-h-[calc(100vh-7rem)] bg-zinc-950 text-zinc-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl space-y-6">
        <header>
          <h1 className="text-2xl font-bold">Journal</h1>
          <p className="text-sm text-zinc-300">
            A timeline of recent events for {dog?.name || "your pup"}.
          </p>
        </header>

        <section className="space-y-4">
          {entries.length === 0 && (
            <div className="text-sm text-zinc-400">No journal entries yet.</div>
          )}

          {entries.map((e) => (
            <article
              key={e.id || e.timestamp}
              className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-emerald-300">
                    {e.summary}
                  </h3>
                  <p className="text-xs text-zinc-400">
                    {new Date(e.timestamp).toLocaleString()}
                  </p>
                </div>
                <div className="text-xs text-zinc-400">{e.type}</div>
              </div>

              {e.body && (
                <p className="text-sm text-zinc-200 mt-2 whitespace-pre-line">
                  {e.body}
                </p>
              )}
            </article>
          ))}
        </section>
      </div>
    </div>
  );
}

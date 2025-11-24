// src/pages/Memory.jsx
// @ts-nocheck

import React, { useMemo } from "react";
import { useSelector } from "react-redux";
import { selectDog } from "@/redux/dogSlice.js";
import { calculateDogAge } from "@/utils/lifecycle.js";

function formatDateShort(ms) {
  if (!ms) return "Unknown date";
  const d = new Date(ms);
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function Memory() {
  const dog = useSelector(selectDog);

  const dogName = dog?.name || "Your Pup";
  const adoptedAt = dog?.adoptedAt || null;
  const age = useMemo(() => calculateDogAge(adoptedAt), [adoptedAt]);

  // Try to pull some kind of memory array from state if it exists.
  const rawMemories =
    dog?.memories || dog?.journal?.entries || dog?.events || [];

  // Normalize to a safe shape
  const memories = useMemo(() => {
    if (!Array.isArray(rawMemories)) return [];

    return rawMemories
      .map((m, idx) => {
        const createdAt = m.createdAt || m.timestamp || m.time || null;
        const title = m.title || m.label || m.type || `Event #${idx + 1}`;

        const mood = m.mood?.label || m.moodLabel || null;

        const level = m.level ?? m.dogLevel ?? dog?.level ?? null;

        const summary = m.summary || m.description || m.note || "";

        return {
          id: m.id || `${createdAt || "na"}-${idx}`,
          createdAt,
          title,
          mood,
          level,
          summary,
          raw: m,
        };
      })
      .sort((a, b) => {
        if (!a.createdAt && !b.createdAt) return 0;
        if (!a.createdAt) return 1;
        if (!b.createdAt) return -1;
        return b.createdAt - a.createdAt; // newest first
      });
  }, [rawMemories, dog?.level]);

  const hasMemories = memories.length > 0;

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-50 px-6 py-10">
      <div className="max-w-3xl mx-auto space-y-6">
        <header className="space-y-2">
          <p className="text-[0.65rem] uppercase tracking-[0.3em] text-emerald-400/80">
            Doggerz Memory Log
          </p>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Memories
          </h1>
          <p className="text-sm text-zinc-400">
            Milestones, level-ups, funny moments, big days, and “you had to be
            there” stories for your dog.
          </p>
        </header>

        {/* Dog header card */}
        <section className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-4 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs text-zinc-400">Current pup</p>
            <p className="text-lg font-semibold">{dogName}</p>
            <p className="text-xs text-zinc-500 mt-1">
              {age?.label || "Puppy"} • Day {age?.days ?? 0}
            </p>
          </div>
          <div className="text-right text-xs text-zinc-400">
            <p>Adopted</p>
            <p className="font-medium text-zinc-100">
              {adoptedAt ? formatDateShort(adoptedAt) : "Not adopted yet"}
            </p>
          </div>
        </section>

        {/* Memories list */}
        {!hasMemories && (
          <section className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-6 text-zinc-300">
            <p className="font-medium mb-2">
              No memories yet — but that just means the story hasn’t started.
            </p>
            <p className="text-sm text-zinc-400 mb-3">
              As you feed, play, train, and hit milestones, Doggerz will log key
              moments here, turning your pup&apos;s life into a scrapbook.
            </p>
            <ul className="text-xs text-zinc-500 list-disc list-inside space-y-1">
              <li>First adoption day</li>
              <li>Major level-ups</li>
              <li>Training breakthroughs</li>
              <li>Special moods or streaks</li>
            </ul>
          </section>
        )}

        {hasMemories && (
          <section className="space-y-4">
            <h2 className="text-sm font-semibold text-zinc-200 tracking-wide">
              Timeline
            </h2>

            <div className="relative border-l border-zinc-800 ml-2">
              {memories.map((mem, index) => (
                <article
                  key={mem.id || index}
                  className="relative pl-6 pb-6 last:pb-0"
                >
                  {/* Timeline dot */}
                  <span className="absolute left-[-0.4rem] top-1 h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.8)]" />

                  <div className="rounded-xl border border-zinc-800 bg-zinc-900/80 p-3 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-sm font-semibold text-zinc-50">
                        {mem.title}
                      </h3>
                      <span className="text-[0.65rem] text-zinc-500">
                        {mem.createdAt
                          ? formatDateShort(mem.createdAt)
                          : "Unknown date"}
                      </span>
                    </div>

                    {(mem.level || mem.mood) && (
                      <p className="text-[0.7rem] text-zinc-400">
                        {mem.level && (
                          <span className="mr-3">
                            Level{" "}
                            <span className="font-semibold text-zinc-100">
                              {mem.level}
                            </span>
                          </span>
                        )}
                        {mem.mood && (
                          <span>
                            Mood:{" "}
                            <span className="font-medium text-emerald-300">
                              {mem.mood}
                            </span>
                          </span>
                        )}
                      </p>
                    )}

                    {mem.summary && (
                      <p className="text-xs text-zinc-300">{mem.summary}</p>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

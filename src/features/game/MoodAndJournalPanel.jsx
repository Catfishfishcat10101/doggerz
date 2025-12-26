// src/features/game/MoodAndJournalPanel.jsx
import React from "react";
import { useSelector } from "react-redux";
import { selectDogMood, selectDogJournal } from "@/redux/dogSlice.js";

const MOOD_EMOJI = {
  HAPPY: "🦴",
  HUNGRY: "🍗",
  SLEEPY: "😴",
  DIRTY: "🛁",
  LONELY: "💔",
  NEUTRAL: "🙂",
};

function moodEmoji(tag) {
  return MOOD_EMOJI[tag] || "🐶";
}

function MoodTimeline({ mood }) {
  const history = mood?.history ?? [];
  const recent = history.slice(0, 20); // last 20 points max

  if (!recent.length) {
    return (
      <p className="text-xs text-zinc-500">
        Mood history will appear here after you spend some time with your pup.
      </p>
    );
  }

  const maxHappiness = Math.max(1, ...recent.map((m) => m.happiness || 0));

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs text-zinc-400">
        <span>Mood timeline</span>
        <span className="text-[10px] uppercase tracking-wide text-zinc-500">
          Last {recent.length} samples
        </span>
      </div>
      <div className="relative h-16 rounded-xl bg-zinc-900/80 overflow-hidden px-1">
        <div className="absolute inset-0 flex items-end gap-[2px] px-1 pb-1">
          {recent.map((m, idx) => {
            const hRatio = (m.happiness || 0) / maxHappiness;
            const height = Math.max(6, hRatio * 56);
            const tag = m.tag || "NEUTRAL";
            return (
              <div
                key={idx}
                className="flex-1 flex flex-col items-center justify-end"
              >
                <div
                  className="w-full rounded-full bg-emerald-500/80"
                  style={{ height: `${height}px` }}
                  title={`${tag} • ${m.happiness}%`}
                />
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex gap-2 flex-wrap text-[10px] text-zinc-400">
        {recent.slice(0, 5).map((m, idx) => (
          <span
            key={idx}
            className="inline-flex items-center gap-1 rounded-full bg-zinc-900/90 px-2 py-0.5"
          >
            <span>{moodEmoji(m.tag)}</span>
            <span>{m.tag}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

function JournalList({ journal }) {
  const entries = journal?.entries ?? [];
  const recent = entries.slice(0, 5);

  if (!recent.length) {
    return (
      <p className="text-xs text-zinc-500">
        When you feed, play, or stay away for a while, your pup will start
        writing little notes here.
      </p>
    );
  }

  return (
    <ul className="space-y-2 max-h-40 overflow-y-auto pr-1">
      {recent.map((entry) => {
        const date = new Date(entry.timestamp);
        const timeString = date.toLocaleString(undefined, {
          month: "short",
          day: "numeric",
          hour: "numeric",
          minute: "2-digit",
        });

        return (
          <li key={entry.id} className="rounded-xl bg-zinc-900/90 px-3 py-2">
            <div className="flex items-center justify-between gap-2 text-[11px] text-zinc-400">
              <span className="uppercase tracking-wide text-zinc-500">
                {entry.type}
              </span>
              <span>{timeString}</span>
            </div>
            <p className="mt-1 text-xs font-medium text-zinc-100">
              {entry.summary}
            </p>
            {entry.body && (
              <p className="mt-1 text-[11px] text-zinc-300 whitespace-pre-line">
                {entry.body}
              </p>
            )}
          </li>
        );
      })}
    </ul>
  );
}

export default function MoodAndJournalPanel() {
  const mood = useSelector(selectDogMood);
  const journal = useSelector(selectDogJournal);

  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-950/90 p-4 space-y-4">
      <MoodTimeline mood={mood} />
      <div className="h-px bg-zinc-800" />
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-zinc-400">
          <span>Dog journal</span>
          <span className="text-[10px] text-zinc-500">
            Auto-written by your pup
          </span>
        </div>
        <JournalList journal={journal} />
      </div>
    </section>
  );
}

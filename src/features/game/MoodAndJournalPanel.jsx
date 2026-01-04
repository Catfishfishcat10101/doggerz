// src/features/game/MoodAndJournalPanel.jsx
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectDogJournal } from "@/redux/dogSlice.js";
import { PATHS } from "@/routes.js";

// Mood timeline intentionally removed from the UI.
// We still record mood in Redux (used for temperament + future features),
// but the panel focuses on the journal.

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
    <ul className="space-y-2 max-h-44 overflow-y-auto pr-1">
      {recent.map((entry) => {
        const date = new Date(entry.timestamp);
        const timeString = date.toLocaleString(undefined, {
          month: "short",
          day: "numeric",
          hour: "numeric",
          minute: "2-digit",
        });

        return (
          <li
            key={entry.id}
            className="rounded-2xl border border-white/10 bg-black/30 px-3 py-2"
          >
            <div className="flex items-center justify-between gap-2 text-[11px] text-zinc-400">
              <div className="flex items-center gap-2">
                <span className="uppercase tracking-[0.18em] text-zinc-500">
                  {entry.type}
                </span>
                {entry.moodTag && (
                  <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-zinc-300">
                    {entry.moodTag}
                  </span>
                )}
              </div>
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
  const journal = useSelector(selectDogJournal);

  return (
    <section className="rounded-3xl border border-white/15 bg-black/35 backdrop-blur-md p-4 shadow-[0_0_60px_rgba(0,0,0,0.18)]">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs uppercase tracking-[0.22em] text-zinc-400">
            Dog journal
          </div>
          <div className="mt-0.5 text-sm font-extrabold text-emerald-200">
            Notes
          </div>
        </div>
        <div className="text-right">
          <div className="text-[10px] uppercase tracking-[0.18em] text-zinc-500">
            Auto
          </div>
          <div className="text-xs font-semibold text-zinc-200">by your pup</div>
        </div>
      </div>

      <div className="mt-3">
        <JournalList journal={journal} />
      </div>

      <div className="mt-4">
        <div className="flex flex-wrap gap-2">
          <Link
            to={PATHS.MEMORIES}
            className="inline-flex items-center justify-center rounded-2xl border border-white/15 bg-black/25 px-3 py-2 text-xs font-semibold text-zinc-100 hover:bg-black/35 transition"
          >
            Open Memory Reel
          </Link>
          <Link
            to={PATHS.DREAMS}
            className="inline-flex items-center justify-center rounded-2xl border border-sky-400/25 bg-sky-500/10 px-3 py-2 text-xs font-semibold text-sky-100 hover:bg-sky-500/15 transition"
          >
            Dream Journal
          </Link>
        </div>
      </div>
    </section>
  );
}

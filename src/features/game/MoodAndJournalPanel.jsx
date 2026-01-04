// src/features/game/MoodAndJournalPanel.jsx
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectDogJournal } from "@/redux/dogSlice.js";
import JournalTimeline from "@/components/journal/JournalTimeline.jsx";

// Mood timeline intentionally removed from the UI.
// We still record mood in Redux (used for temperament + future features),
// but the panel focuses on the journal with beautiful "Dear Hooman..." letters.

export default function MoodAndJournalPanel() {
  const journal = useSelector(selectDogJournal);

  return (
    <section className="rounded-3xl border border-white/15 bg-black/35 backdrop-blur-md p-4 shadow-[0_0_60px_rgba(0,0,0,0.18)]">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-xs uppercase tracking-[0.22em] text-zinc-400">Dog Journal</div>
          <div className="mt-0.5 text-sm font-extrabold text-amber-200">Dear Hooman...</div>
        </div>
        <div className="text-right">
          <div className="text-[10px] uppercase tracking-[0.18em] text-zinc-500">Written by</div>
          <div className="text-xs font-semibold text-zinc-200">Your Pup 🐾</div>
        </div>
      </div>

      <div className="max-h-[400px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-amber-500/20 scrollbar-track-transparent">
        <JournalTimeline journal={journal} maxVisible={5} />
      </div>

      <div className="mt-4 pt-4 border-t border-white/10">
        <Link
          to="/memories"
          className="w-full inline-flex items-center justify-center gap-2 rounded-2xl border border-amber-400/25 bg-gradient-to-r from-amber-500/10 to-orange-500/10 px-4 py-2.5 text-sm font-semibold text-amber-100 hover:from-amber-500/15 hover:to-orange-500/15 transition-all duration-300 shadow-[0_0_20px_rgba(251,191,36,0.1)] hover:shadow-[0_0_30px_rgba(251,191,36,0.15)]"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          Open Full Memory Reel
        </Link>
      </div>
    </section>
  );
}

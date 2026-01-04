// src/components/journal/JournalTimeline.jsx
// Timeline/flipbook style journal display with "Dear Hooman..." letters

import * as React from 'react';
import DearHoomanLetter from './DearHoomanLetter.jsx';

/**
 * JournalTimeline - Displays journal entries in an elegant timeline/flipbook format
 * 
 * @param {Object} props
 * @param {Object} props.journal - Journal data with entries array
 * @param {number} props.maxVisible - Maximum number of visible entries (default: 5)
 */
export default function JournalTimeline({ journal, maxVisible = 5 }) {
  const [expandedId, setExpandedId] = React.useState(null);
  
  const entries = journal?.entries ?? [];
  const visibleEntries = entries.slice(0, maxVisible);

  const toggleExpand = React.useCallback((entryId) => {
    setExpandedId(current => current === entryId ? null : entryId);
  }, []);

  if (!visibleEntries.length) {
    return (
      <div className="text-center py-8 px-4">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full border border-amber-400/20 bg-amber-500/5 mb-4">
          <svg className="w-8 h-8 text-amber-400/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 className="text-base font-semibold text-zinc-200 mb-2">
          No letters yet
        </h3>
        <p className="text-sm text-zinc-400 max-w-sm mx-auto leading-relaxed">
          Your pup hasn&apos;t written any letters yet. Spend time together—feed, play, and care for them—and they&apos;ll start sharing their thoughts with you!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Timeline header */}
      <div className="flex items-center gap-2 pb-2">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-amber-400/20 to-transparent" />
        <div className="text-xs uppercase tracking-[0.2em] text-amber-400/60 font-semibold">
          Letters from Your Pup
        </div>
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-amber-400/20 to-transparent" />
      </div>

      {/* Letter stack */}
      <div className="space-y-3 relative">
        {visibleEntries.map((entry, index) => (
          <div
            key={entry.id}
            className="relative animate-[slideInUp_0.4s_ease-out]"
            style={{
              animationDelay: `${index * 0.05}s`,
              animationFillMode: 'backwards'
            }}
          >
            {/* Timeline connector dot */}
            <div className="absolute -left-2 top-6 w-2 h-2 rounded-full border-2 border-amber-400/40 bg-amber-500/20 shadow-[0_0_8px_rgba(251,191,36,0.3)]" />
            
            <DearHoomanLetter
              entry={entry}
              isExpanded={expandedId === entry.id}
              onToggle={() => toggleExpand(entry.id)}
            />
          </div>
        ))}
      </div>

      {/* Entry count indicator */}
      {entries.length > maxVisible && (
        <div className="pt-2 text-center">
          <p className="text-xs text-zinc-500">
            Showing {maxVisible} of {entries.length} letters
            <span className="mx-2">•</span>
            <span className="text-amber-400/70">Visit Memory Reel to see all</span>
          </p>
        </div>
      )}
    </div>
  );
}

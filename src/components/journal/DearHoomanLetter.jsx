// src/components/journal/DearHoomanLetter.jsx
// Individual letter component with handwritten-style presentation

import * as React from 'react';

/**
 * DearHoomanLetter - Displays a journal entry as a heartfelt letter from the dog
 * 
 * @param {Object} props
 * @param {Object} props.entry - Journal entry data
 * @param {boolean} props.isExpanded - Whether the letter is expanded
 * @param {Function} props.onToggle - Toggle expansion callback
 */
export default function DearHoomanLetter({ entry, isExpanded, onToggle }) {
  const date = new Date(entry.timestamp);
  const timeString = date.toLocaleString(undefined, {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });

  const moodEmoji = React.useMemo(() => {
    const mood = String(entry.moodTag || '').toLowerCase();
    if (mood.includes('happy') || mood.includes('joy')) return '🌟';
    if (mood.includes('excited') || mood.includes('playful')) return '✨';
    if (mood.includes('sad') || mood.includes('lonely')) return '💙';
    if (mood.includes('anxious') || mood.includes('worried')) return '🌙';
    if (mood.includes('content') || mood.includes('peaceful')) return '☀️';
    if (mood.includes('tired') || mood.includes('sleepy')) return '😴';
    return '🐾';
  }, [entry.moodTag]);

  const typeLabel = React.useMemo(() => {
    const type = String(entry.type || '').toLowerCase();
    if (type.includes('care')) return 'Care Moment';
    if (type.includes('play')) return 'Playtime Memory';
    if (type.includes('train')) return 'Training Session';
    if (type.includes('neglect')) return 'Feeling Forgotten';
    if (type.includes('milestone')) return 'Special Milestone';
    return 'Daily Note';
  }, [entry.type]);

  return (
    <div
      className={`
        group relative overflow-hidden rounded-2xl border transition-all duration-500
        ${isExpanded 
          ? 'border-amber-400/30 bg-gradient-to-br from-amber-50/10 via-orange-50/10 to-amber-50/5 shadow-[0_8px_32px_rgba(251,191,36,0.12)]' 
          : 'border-white/10 bg-black/30 hover:border-amber-400/20 hover:bg-black/25'
        }
      `}
    >
      {/* Decorative paper texture overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      <button
        type="button"
        onClick={onToggle}
        className="w-full text-left px-4 py-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/50 rounded-2xl"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0 flex-1">
            {/* Mood emoji badge */}
            <div className="shrink-0 mt-0.5">
              <div className="w-8 h-8 rounded-full border border-amber-400/20 bg-amber-500/10 grid place-items-center text-lg">
                {moodEmoji}
              </div>
            </div>

            <div className="min-w-0 flex-1">
              {/* Dear Hooman... salutation */}
              <div className="text-sm font-serif italic text-amber-200/90">
                Dear Hooman...
              </div>

              {/* Summary text */}
              <p className={`mt-1 text-sm font-medium leading-relaxed transition-all duration-300 ${
                isExpanded ? 'text-zinc-100' : 'text-zinc-200 line-clamp-2'
              }`}>
                {entry.summary}
              </p>

              {/* Expanded body */}
              {isExpanded && entry.body && (
                <div className="mt-3 space-y-2 animate-[fadeIn_0.4s_ease-out]">
                  <p className="text-sm text-zinc-200/90 leading-relaxed whitespace-pre-line font-serif">
                    {entry.body}
                  </p>
                  
                  <div className="pt-2 text-right">
                    <div className="inline-block">
                      <div className="text-xs italic text-amber-300/70 font-serif">
                        With tail wags & puppy kisses,
                      </div>
                      <div className="text-sm font-semibold text-amber-200/90 font-serif mt-0.5">
                        Your Pup 🐾
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Expand/collapse indicator */}
          <div className="shrink-0 flex flex-col items-end gap-1">
            <div 
              className={`
                w-6 h-6 rounded-full border border-white/15 bg-black/30 
                grid place-items-center text-white/70 transition-transform duration-300
                ${isExpanded ? 'rotate-180' : 'rotate-0'}
              `}
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Metadata footer */}
        <div className="mt-2 flex items-center justify-between gap-2 text-[10px] text-zinc-400/80">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full border border-white/10 bg-white/5 uppercase tracking-wider">
              {typeLabel}
            </span>
            {entry.moodTag && (
              <span className="px-2 py-0.5 rounded-full border border-amber-400/20 bg-amber-500/10 text-amber-300/90">
                {entry.moodTag}
              </span>
            )}
          </div>
          <time className="font-mono">{timeString}</time>
        </div>
      </button>

      {/* Decorative corner fold (bottom-right) */}
      {isExpanded && (
        <div className="absolute bottom-0 right-0 w-6 h-6 overflow-hidden pointer-events-none">
          <div className="absolute bottom-0 right-0 w-8 h-8 bg-gradient-to-br from-amber-900/20 to-transparent transform rotate-45 translate-x-3 translate-y-3" />
        </div>
      )}
    </div>
  );
}

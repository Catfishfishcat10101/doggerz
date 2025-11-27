import React, { useEffect, useState } from "react";

const DEFAULTS = [
  "3,421 pups adopted",
  "Today's top trainer: @ginger",
  "Potty training streak: 12 days",
  "New trick unlocked: Sit",
];

export default function AchievementTicker({ messages = DEFAULTS }) {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const id = setInterval(
      () => setIdx((i) => (i + 1) % messages.length),
      3500,
    );
    return () => clearInterval(id);
  }, [messages.length]);

  const renderMessage = (msg) => {
    // Wrap @handles with a slightly emphasized style for readability
    const parts = msg.split(/(@[^\s]+)/g);
    return parts.map((p, i) =>
      p.startsWith("@") ? (
        <span key={i} className="font-medium text-emerald-300">
          {p}
        </span>
      ) : (
        <span key={i}>{p}</span>
      ),
    );
  };

  return (
    <div className="w-full overflow-hidden">
      <div className="text-sm text-zinc-300 text-center py-2 leading-5">
        {renderMessage(messages[idx])}
      </div>
    </div>
  );
}

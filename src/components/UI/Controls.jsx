// src/components/UI/Controls.jsx
import React from "react";
import "../styles/Controls.css"; // Make sure you have this for button styling!

export default function Controls({
  onFeed,
  onPlay,
  onBathe,
  onWalkUp,
  onWalkDown,
  onWalkLeft,
  onWalkRight,
}) {
  return (
    <div className="controls">
      <button onClick={onFeed} title="Feed your dog">
        🍖 Feed
      </button>
      <button onClick={onPlay} title="Play with your dog">
        🦴 Play
      </button>
      <button onClick={onBathe} title="Give your dog a bath">
        🛁 Bathe
      </button>
      <button onClick={onWalkUp} title="Walk up (N)">
        ⬆️ Walk Up
      </button>
      <button onClick={onWalkDown} title="Walk down (S)">
        ⬇️ Walk Down
      </button>
      <button onClick={onWalkLeft} title="Walk left (W)">
        ⬅️ Walk Left
      </button>
      <button onClick={onWalkRight} title="Walk right (E)">
        ➡️ Walk Right
      </button>
    </div>
  );
}

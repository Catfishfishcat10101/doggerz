import React, { useState, useEffect } from "react";

export default function GameplaySettings({
  autoPause = true,
  advancedAnimation = false,
  onAutoPauseChange,
  tickWhileAway = false,
  onTickWhileAwayChange,
  onAdvancedAnimationChange,
}) {
  const [auto, setAuto] = useState(autoPause);
  const [advanced, setAdvanced] = useState(advancedAnimation);
  const [tickAway, setTickAway] = useState(tickWhileAway);

  useEffect(() => setAuto(autoPause), [autoPause]);
  useEffect(() => setAdvanced(advancedAnimation), [advancedAnimation]);
  useEffect(() => setTickAway(tickWhileAway), [tickWhileAway]);

  const toggleAuto = (v) => {
    setAuto(v);
    if (onAutoPauseChange) onAutoPauseChange(v);
  };

  const toggleAdvanced = (v) => {
    setAdvanced(v);
    if (onAdvancedAnimationChange) onAdvancedAnimationChange(v);
  };

  const toggleTickAway = (v) => {
    setTickAway(v);
    if (onTickWhileAwayChange) onTickWhileAwayChange(v);
  };

  return (
    <div className="p-4 rounded-md bg-zinc-900 border border-zinc-800">
      <h3 className="text-sm font-semibold">Gameplay</h3>
      <div className="mt-2 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm">Auto-pause</div>
            <div className="text-xs text-zinc-400">
              Pause engine when the tab is not focused
            </div>
          </div>
          <label className="inline-flex items-center">
            <input
              type="checkbox"
              checked={auto}
              onChange={(e) => toggleAuto(e.target.checked)}
            />
          </label>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm">Advanced animations</div>
            <div className="text-xs text-zinc-400">
              Enable smoother run/idle frames (may affect performance)
            </div>
          </div>
          <label className="inline-flex items-center">
            <input
              type="checkbox"
              checked={advanced}
              onChange={(e) => toggleAdvanced(e.target.checked)}
            />
          </label>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm">Tick while you're away</div>
            <div className="text-xs text-zinc-400">
              Continue simulation when tab is not focused (may increase battery
              use)
            </div>
          </div>
          <label className="inline-flex items-center">
            <input
              type="checkbox"
              checked={tickAway}
              onChange={(e) => toggleTickAway(e.target.checked)}
            />
          </label>
        </div>

        <div className="text-xs text-zinc-500">
          Difficulty, bladder model and run animation timing are fixed for
          consistent gameplay.
        </div>
      </div>
    </div>
  );
}

// src/components/UI/Controls.jsx
import React, { memo, useMemo } from "react";
import PropTypes from "prop-types";
import "../styles/Controls.css";
import useHotkeys from "./hooks/useHotkeys";
import useHoldRepeat from "./hooks/useHoldRepeat";

function Controls({
  onFeed,
  onPlay,
  onBathe,
  onWalkUp,
  onWalkDown,
  onWalkLeft,
  onWalkRight,
}) {
  // Bind keyboard shortcuts (works app-wide while window is focused)
  useHotkeys({
    ArrowUp: onWalkUp,
    w: onWalkUp,
    ArrowDown: onWalkDown,
    s: onWalkDown,
    ArrowLeft: onWalkLeft,
    a: onWalkLeft,
    ArrowRight: onWalkRight,
    d: onWalkRight,
    f: onFeed,
    p: onPlay,
    b: onBathe,
  });

  // Hold-to-repeat helpers for the 4 directional buttons
  const holdUp = useHoldRepeat(onWalkUp, { delay: 275, interval: 85 });
  const holdDown = useHoldRepeat(onWalkDown, { delay: 275, interval: 85 });
  const holdLeft = useHoldRepeat(onWalkLeft, { delay: 275, interval: 85 });
  const holdRight = useHoldRepeat(onWalkRight, { delay: 275, interval: 85 });

  const actions = useMemo(
    () => [
      {
        id: "feed",
        label: "Feed",
        emoji: "🍖",
        title: "Feed your dog (F)",
        onClick: onFeed,
        hotkey: "F",
      },
      {
        id: "play",
        label: "Play",
        emoji: "🦴",
        title: "Play with your dog (P)",
        onClick: onPlay,
        hotkey: "P",
      },
      {
        id: "bathe",
        label: "Bathe",
        emoji: "🛁",
        title: "Give your dog a bath (B)",
        onClick: onBathe,
        hotkey: "B",
      },
    ],
    [onFeed, onPlay, onBathe]
  );

  return (
    <div className="controls-wrapper" role="toolbar" aria-label="Dog controls">
      <div className="controls-grid">
        {/* Primary actions */}
        {actions.map((a) => (
          <button
            key={a.id}
            type="button"
            className="ctrl btn-action"
            onClick={a.onClick}
            title={a.title}
            aria-label={a.title}
            data-hotkey={a.hotkey}
          >
            <span className="emoji" aria-hidden="true">
              {a.emoji}
            </span>
            <span className="label">{a.label}</span>
            <span className="kbd" aria-hidden="true">
              {a.hotkey}
            </span>
          </button>
        ))}

        {/* Direction pad */}
        <div className="dpad" role="group" aria-label="Movement controls">
          <button
            type="button"
            className="ctrl btn-dpad up"
            title="Walk up (W or ↑)"
            aria-label="Walk up"
            data-hotkey="W / ↑"
            onClick={onWalkUp}
            onPointerDown={holdUp.onPointerDown}
            onPointerUp={holdUp.onPointerUp}
            onPointerLeave={holdUp.onPointerLeave}
            onTouchStart={holdUp.onTouchStart}
            onTouchEnd={holdUp.onTouchEnd}
          >
            ⬆️
          </button>

          <div className="dpad-middle">
            <button
              type="button"
              className="ctrl btn-dpad left"
              title="Walk left (A or ←)"
              aria-label="Walk left"
              data-hotkey="A / ←"
              onClick={onWalkLeft}
              onPointerDown={holdLeft.onPointerDown}
              onPointerUp={holdLeft.onPointerUp}
              onPointerLeave={holdLeft.onPointerLeave}
              onTouchStart={holdLeft.onTouchStart}
              onTouchEnd={holdLeft.onTouchEnd}
            >
              ⬅️
            </button>

            <div className="dpad-dot" aria-hidden="true" />

            <button
              type="button"
              className="ctrl btn-dpad right"
              title="Walk right (D or →)"
              aria-label="Walk right"
              data-hotkey="D / →"
              onClick={onWalkRight}
              onPointerDown={holdRight.onPointerDown}
              onPointerUp={holdRight.onPointerUp}
              onPointerLeave={holdRight.onPointerLeave}
              onTouchStart={holdRight.onTouchStart}
              onTouchEnd={holdRight.onTouchEnd}
            >
              ➡️
            </button>
          </div>

          <button
            type="button"
            className="ctrl btn-dpad down"
            title="Walk down (S or ↓)"
            aria-label="Walk down"
            data-hotkey="S / ↓"
            onClick={onWalkDown}
            onPointerDown={holdDown.onPointerDown}
            onPointerUp={holdDown.onPointerUp}
            onPointerLeave={holdDown.onPointerLeave}
            onTouchStart={holdDown.onTouchStart}
            onTouchEnd={holdDown.onTouchEnd}
          >
            ⬇️
          </button>
        </div>
      </div>

      {/* Hint row */}
      <div className="hint-row" aria-hidden="true">
        Tip: Use <kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> or arrow keys to walk.
        Quick keys: <kbd>F</kbd>=Feed, <kbd>P</kbd>=Play, <kbd>B</kbd>=Bathe.
      </div>
    </div>
  );
}

Controls.propTypes = {
  onFeed: PropTypes.func.isRequired,
  onPlay: PropTypes.func.isRequired,
  onBathe: PropTypes.func.isRequired,
  onWalkUp: PropTypes.func.isRequired,
  onWalkDown: PropTypes.func.isRequired,
  onWalkLeft: PropTypes.func.isRequired,
  onWalkRight: PropTypes.func.isRequired,
};

export default memo(Controls);
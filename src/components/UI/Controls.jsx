import React, { memo, useMemo } from "react";
import PropTypes from "prop-types";
import { motion } from "framer-motion";
import "../../styles/Controls.css";
import useHotkeys from "./hooks/useHotkeys";
import useHoldRepeat from "./hooks/useHoldRepeat";

function Controls({
  onFeed,
  onPlay,
  onBathe,
  onBark,
  onRest,
  onWalkUp,
  onWalkDown,
  onWalkLeft,
  onWalkRight,
}) {
  // --- Hotkeys (global) ---
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
    r: onRest,
    " ": onBark, // spacebar
  });

  // --- Hold-to-repeat (dpad) ---
  const opts = { delay: 275, interval: 85 };
  const hold = {
    up: useHoldRepeat(onWalkUp, opts),
    down: useHoldRepeat(onWalkDown, opts),
    left: useHoldRepeat(onWalkLeft, opts),
    right: useHoldRepeat(onWalkRight, opts),
  };

  // --- Primary action buttons ---
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
      {
        id: "rest",
        label: "Rest",
        emoji: "🛌",
        title: "Let your dog rest (R)",
        onClick: onRest,
        hotkey: "R",
      },
      {
        id: "bark",
        label: "Bark",
        emoji: "🐕",
        title: "Make your dog bark (Space)",
        onClick: onBark,
        hotkey: "Space",
      },
    ],
    [onFeed, onPlay, onBathe, onRest, onBark]
  );

  return (
    <div className="controls-wrapper" role="toolbar" aria-label="Dog controls">
      <div className="controls-grid">
        {/* Primary actions */}
        {actions.map((a) => (
          <motion.button
            key={a.id}
            type="button"
            className="ctrl btn-action"
            onClick={a.onClick}
            title={a.title}
            aria-label={a.title}
            data-hotkey={a.hotkey}
            whileTap={{ scale: 0.9 }}
            whileHover={{ scale: 1.05 }}
          >
            <span className="emoji" aria-hidden="true">
              {a.emoji}
            </span>
            <span className="label">{a.label}</span>
            <span className="kbd" aria-hidden="true">
              {a.hotkey}
            </span>
          </motion.button>
        ))}

        {/* Direction pad */}
        <div className="dpad" role="group" aria-label="Movement controls">
          <motion.button
            type="button"
            className="ctrl btn-dpad up"
            title="Walk up (W or ↑)"
            aria-label="Walk up"
            data-hotkey="W / ↑"
            onClick={onWalkUp}
            {...hold.up}
            whileTap={{ scale: 0.9 }}
            whileHover={{ scale: 1.1 }}
          >
            ⬆️
          </motion.button>

          <div className="dpad-middle">
            <motion.button
              type="button"
              className="ctrl btn-dpad left"
              title="Walk left (A or ←)"
              aria-label="Walk left"
              data-hotkey="A / ←"
              onClick={onWalkLeft}
              {...hold.left}
              whileTap={{ scale: 0.9 }}
              whileHover={{ scale: 1.1 }}
            >
              ⬅️
            </motion.button>

            <div className="dpad-dot" aria-hidden="true" />

            <motion.button
              type="button"
              className="ctrl btn-dpad right"
              title="Walk right (D or →)"
              aria-label="Walk right"
              data-hotkey="D / →"
              onClick={onWalkRight}
              {...hold.right}
              whileTap={{ scale: 0.9 }}
              whileHover={{ scale: 1.1 }}
            >
              ➡️
            </motion.button>
          </div>

          <motion.button
            type="button"
            className="ctrl btn-dpad down"
            title="Walk down (S or ↓)"
            aria-label="Walk down"
            data-hotkey="S / ↓"
            onClick={onWalkDown}
            {...hold.down}
            whileTap={{ scale: 0.9 }}
            whileHover={{ scale: 1.1 }}
          >
            ⬇️
          </motion.button>
        </div>
      </div>

      {/* Hint row */}
      <div className="hint-row" aria-hidden="true">
        Tip: Use <kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> or arrow keys to walk. &nbsp;
        Quick keys: <kbd>F</kbd>=Feed, <kbd>P</kbd>=Play, <kbd>B</kbd>=Bathe,{" "}
        <kbd>R</kbd>=Rest, <kbd>Space</kbd>=Bark.
      </div>
    </div>
  );
}

Controls.propTypes = {
  onFeed: PropTypes.func.isRequired,
  onPlay: PropTypes.func.isRequired,
  onBathe: PropTypes.func.isRequired,
  onBark: PropTypes.func.isRequired,
  onRest: PropTypes.func.isRequired,
  onWalkUp: PropTypes.func.isRequired,
  onWalkDown: PropTypes.func.isRequired,
  onWalkLeft: PropTypes.func.isRequired,
  onWalkRight: PropTypes.func.isRequired,
};

export default memo(Controls);
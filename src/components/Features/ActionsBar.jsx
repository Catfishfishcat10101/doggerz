// src/components/Features/ActionsBar.jsx
import React, { useCallback } from "react";
import PropTypes from "prop-types";

/**
 * ActionsBar
 * A compact command surface for dog interactions.
 * Expects callbacks (feed, play, wash, rest) from the parent.
 */
export default function ActionsBar({
  feed,
  play,
  wash,
  rest,
  disabled = false,
}) {
  // Factory: wrap an action with a semantic label for analytics/logging if you want
  const action = useCallback(
    (fn, label) => () => {
      if (disabled) return;
      try {
        // Optional: console.debug(`[ActionsBar] ${label} clicked`);
        fn?.();
      } catch (err) {
        console.error(`[ActionsBar] ${label} failed:`, err);
      }
    },
    [disabled],
  );

  return (
    <div className="w-full flex flex-wrap gap-2 items-center justify-center">
      <Btn label="Feed" onClick={action(feed, "feed")} disabled={disabled} />
      <Btn label="Play" onClick={action(play, "play")} disabled={disabled} />
      <Btn
        label="Wash/Scoop"
        onClick={action(wash, "wash")}
        disabled={disabled}
      />
      <Btn label="Rest" onClick={action(rest, "rest")} disabled={disabled} />
    </div>
  );
}

ActionsBar.propTypes = {
  feed: PropTypes.func,
  play: PropTypes.func,
  wash: PropTypes.func,
  rest: PropTypes.func,
  disabled: PropTypes.bool,
};

/** Local button with sensible focus/disabled styles */
function Btn({ label, onClick, disabled }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={[
        "px-4 py-2 rounded-2xl text-sm font-semibold",
        "shadow-sm border border-white/10",
        "bg-white/10 hover:bg-white/20 active:translate-y-px",
        "backdrop-blur transition",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50",
      ].join(" ")}
      aria-label={label}
    >
      {label}
    </button>
  );
}

Btn.propTypes = {
  label: PropTypes.string.isRequired,
  onClick: PropTypes.func,
  disabled: PropTypes.bool,
};

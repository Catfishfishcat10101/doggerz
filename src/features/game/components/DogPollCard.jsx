// src/components/DogPollCard.jsx
// DogPollCard - displays active dog poll and handles responses.

import React from "react";
import PropTypes from "prop-types";

/**
 * DogPollCard - displays active dog poll and handles responses.
 * @param {object} props
 * @param {{ prompt: string }} [props.activePoll] - Poll object with prompt string
 * @param {number} [props.pollCountdown] - Seconds left to respond
 * @param {function} props.onPollResponse - Callback for poll response (true/false)
 */
export default function DogPollCard({
  activePoll,
  pollCountdown,
  onPollResponse,
}) {
  const countdownSafe = Number.isFinite(pollCountdown)
    ? Math.max(0, Math.round(pollCountdown))
    : null;

  const hasActivePoll = Boolean(activePoll);

  return (
    <div
      className="bg-indigo-950/80 border border-indigo-400/50 rounded-2xl p-3 lg:p-4 shadow-lg shadow-indigo-900/50 space-y-3"
      role="region"
      aria-label={hasActivePoll ? "Active dog poll" : "Dog poll status"}
      aria-live={hasActivePoll ? "polite" : "off"}
    >
      {hasActivePoll ? (
        <>
          <div className="flex items-center justify-between text-sm font-semibold text-indigo-50">
            <span>Dog poll in progress</span>
            {countdownSafe !== null && (
              <span className="text-xs text-indigo-100 font-mono">
                {countdownSafe}s left
              </span>
            )}
          </div>

          <p className="text-sm text-indigo-50">{activePoll.prompt}</p>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              aria-label="Respond yes to poll"
              onClick={() => onPollResponse(true)}
              className="rounded-lg bg-emerald-400 text-black font-semibold py-2 hover:bg-emerald-300 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 focus-visible:ring-offset-2 focus-visible:ring-offset-indigo-950"
            >
              Yes, do it
            </button>
            <button
              type="button"
              aria-label="Respond no to poll"
              onClick={() => onPollResponse(false)}
              className="rounded-lg bg-indigo-200 text-black font-semibold py-2 hover:bg-indigo-100 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-200 focus-visible:ring-offset-2 focus-visible:ring-offset-indigo-950"
            >
              Pass for now
            </button>
          </div>

          <p className="text-[0.65rem] text-indigo-100/90">
            Answering keeps happiness high. Ignoring polls makes the pup a
            little salty.
          </p>
        </>
      ) : (
        <div className="space-y-1">
          <p className="text-sm font-semibold text-indigo-50">Dog polls idle</p>
          <p className="text-xs text-indigo-100/90">
            No active prompt. Another check-in will appear every few minutes to
            keep you honest.
          </p>
        </div>
      )}
    </div>
  );
}

DogPollCard.propTypes = {
  activePoll: PropTypes.shape({
    prompt: PropTypes.string,
  }),
  pollCountdown: PropTypes.number,
  onPollResponse: PropTypes.func.isRequired,
};

import React from "react";
import PropTypes from "prop-types";

/**
 * SubscriptionNudgeModal - modal for premium feature upsell.
 * @param {object} props
 * @param {boolean} props.open - Whether modal is visible
 * @param {function} props.onClose - Close handler
 * @param {"cloud"|"cosmetic"} props.reason - Reason for nudge
 */
export default function SubscriptionNudgeModal({ open, onClose, reason }) {
  if (!open) return null;
  let message = "Upgrade to Premium for a smoother experience!";
  if (reason === "cloud") {
    message =
      "Cloud sync is a Premium feature. Upgrade to back up your pup and play across devices.";
  } else if (reason === "cosmetic") {
    message =
      "This cosmetic is exclusive to Premium members. Upgrade to access rare items and events.";
  }
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      role="dialog"
      aria-modal="true"
      aria-labelledby="premium-modal-title"
      aria-describedby="premium-modal-desc"
      tabIndex={-1}
    >
      <div className="bg-zinc-950 rounded-2xl p-6 shadow-2xl border border-emerald-500 max-w-sm w-full">
        <h2
          id="premium-modal-title"
          className="text-lg font-bold text-emerald-400 mb-2"
        >
          Premium Feature
        </h2>
        <p id="premium-modal-desc" className="text-zinc-100 mb-4">
          {message}
        </p>
        <button
          className="rounded-full bg-emerald-500 hover:bg-emerald-400 text-black font-semibold px-4 py-2"
          onClick={() => onClose()}
          aria-label="Close premium feature modal"
          tabIndex={0}
        >
          Close
        </button>
      </div>
    </div>
  );
}

SubscriptionNudgeModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  reason: PropTypes.oneOf(["cloud", "cosmetic"]),
};

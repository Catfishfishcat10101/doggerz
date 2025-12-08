import React from "react";
import PropTypes from "prop-types";
import classNames from "classnames";

/**
 * BadgeIcon renders a badge with optional rarity and premium highlight.
 * Props:
 * - type: string ("potty", "training", etc.)
 * - label: string
 * - rare: boolean
 * - premium: boolean
 * - icon: React node (optional)
 */
export default function BadgeIcon({ type, label, rare, premium, icon }) {
  return (
    <span
      className={classNames(
        "dz-badge flex items-center gap-1 px-2 py-1 text-xs font-semibold",
        {
          "dz-badge--good": !rare && !premium,
          "dz-badge--warn": rare,
          "dz-badge--bad": premium,
          "ring-2 ring-amber-400 animate-pulse": rare,
          "ring-2 ring-pink-500 animate-pulse": premium,
        },
      )}
      title={label}
      aria-label={
        label + (rare ? " (rare)" : "") + (premium ? " (premium)" : "")
      }
    >
      {icon && <span className="mr-1">{icon}</span>}
      <span>{label}</span>
      {rare && <span className="ml-1 text-amber-300">★</span>}
      {premium && <span className="ml-1 text-pink-400">◆</span>}
    </span>
  );
}

BadgeIcon.propTypes = {
  type: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  rare: PropTypes.bool,
  premium: PropTypes.bool,
  icon: PropTypes.node,
};

import React, { useState } from "react";
import PropTypes from "prop-types";

/**
 * GiftSubscriptionFunnel - allows users to gift Premium to friends (email-based)
 * @param {object} props
 * @param {function} props.onGift - Callback when gift is sent
 */
export default function GiftSubscriptionFunnel({ onGift }) {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const handleGift = (e) => {
    e.preventDefault();
    if (!email || !email.includes("@")) return;
    // TODO: Integrate with backend gifting logic
    setSent(true);
    if (onGift) onGift(email);
  };

  return (
    <div
      className="rounded-2xl bg-zinc-900/80 border border-emerald-500 p-6 shadow-lg max-w-md mx-auto my-6"
      role="form"
      aria-label="Gift Premium Subscription"
    >
      <h2 className="text-lg font-bold text-emerald-400 mb-2">Gift Premium</h2>
      <p className="text-zinc-100 mb-4">
        Share the joy! Gift a Premium subscription to a friend or family member.
      </p>
      {sent ? (
        <p className="text-emerald-400 font-semibold">Gift sent to {email}!</p>
      ) : (
        <form onSubmit={handleGift} className="flex flex-col gap-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Recipient's email"
            className="rounded-lg border border-zinc-700 px-3 py-2 bg-zinc-950 text-zinc-50"
            required
            aria-label="Recipient's email address"
          />
          <button
            type="submit"
            className="rounded-full bg-emerald-500 hover:bg-emerald-400 text-black font-semibold px-4 py-2"
            aria-label="Send Premium Gift"
          >
            Send Gift
          </button>
        </form>
      )}
    </div>
  );
}

GiftSubscriptionFunnel.propTypes = {
  onGift: PropTypes.func,
};

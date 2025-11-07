// Web “IAP”: usually Stripe or Play Billing via TWA. Keep SKUs here anyway.
// These are client-visible IDs — enforce pricing/entitlement server-side.
export const ENABLED = String(import.meta.env.VITE_IAP_ENABLED || "") === "1";

export const SKUS = Object.freeze({
  coins_small: { id: "coins_small", priceUSD: 1.99, amount: 500 },
  coins_medium: { id: "coins_medium", priceUSD: 4.99, amount: 1500, bonus: 10 },
  coins_large: { id: "coins_large", priceUSD: 9.99, amount: 3500, bonus: 20 },
  founder_pack: {
    id: "founder_pack",
    priceUSD: 14.99,
    items: ["collar_gold", "hat_top"],
    coins: 2500,
  },
});

export function sku(id) {
  return SKUS[id] || null;
}

export function isEnabled() {
  return ENABLED;
}

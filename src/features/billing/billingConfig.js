/** @format */
// src/features/billing/billingConfig.js

function parsePositiveInt(raw, fallback) {
  const n = Number(raw);
  if (!Number.isFinite(n) || n <= 0) return fallback;
  return Math.round(n);
}

export const PRE_REG_PRODUCT_ID = String(
  import.meta.env.VITE_PRE_REG_PRODUCT_ID || "pre_reg_bonus_kit"
).trim();

export const PRE_REG_GIFT_COINS = parsePositiveInt(
  import.meta.env.VITE_PRE_REG_GIFT_COINS,
  500
);

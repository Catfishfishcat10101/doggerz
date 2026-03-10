/** @format */

function normalizeCurrencyKey(currency) {
  const key = String(currency || "")
    .trim()
    .toLowerCase();
  if (key === "coin" || key === "coins" || key === "dog_coins") return "coins";
  if (key === "treat" || key === "treats") return "treats";
  return "";
}

function toAmount(value, fallback = 0) {
  const n = Number(value);
  if (!Number.isFinite(n)) return Math.max(0, Math.floor(fallback));
  return Math.max(0, Math.floor(n));
}

export function createCurrencyWallet(seed = {}) {
  return {
    coins: toAmount(seed?.coins, 0),
    treats: toAmount(seed?.treats, 0),
  };
}

export function canAfford(wallet, currency, cost) {
  const key = normalizeCurrencyKey(currency);
  if (!key) return false;
  const amount = toAmount(cost, 0);
  const current = toAmount(wallet?.[key], 0);
  return current >= amount;
}

export function addCurrency(wallet, currency, amount) {
  const key = normalizeCurrencyKey(currency);
  if (!key) return createCurrencyWallet(wallet);
  const delta = toAmount(amount, 0);
  const next = createCurrencyWallet(wallet);
  next[key] = toAmount(next[key], 0) + delta;
  return next;
}

export function spendCurrency(wallet, currency, amount) {
  const key = normalizeCurrencyKey(currency);
  if (!key) {
    return {
      wallet: createCurrencyWallet(wallet),
      success: false,
      reason: "invalid_currency",
    };
  }

  const cost = toAmount(amount, 0);
  const next = createCurrencyWallet(wallet);
  const current = toAmount(next[key], 0);
  if (current < cost) {
    return {
      wallet: next,
      success: false,
      reason: "insufficient_funds",
      balance: current,
      cost,
    };
  }

  next[key] = current - cost;
  return { wallet: next, success: true, balance: next[key], cost };
}

export function applyCurrencyReward(wallet, reward = {}) {
  let next = createCurrencyWallet(wallet);
  if (reward?.coins) next = addCurrency(next, "coins", reward.coins);
  if (reward?.treats) next = addCurrency(next, "treats", reward.treats);
  return next;
}

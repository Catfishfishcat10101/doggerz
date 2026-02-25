/** @format */

import { Capacitor } from "@capacitor/core";
import { Purchases } from "@revenuecat/purchases-capacitor";

export const PRE_REG_PRODUCT_ID = "pre_reg_bonus_kit";
export const PRE_REG_GIFT_COINS = 500;

function extractProductId(purchase) {
  if (!purchase || typeof purchase !== "object") return "";
  return String(
    purchase.productId ||
      purchase.productIdentifier ||
      purchase.identifier ||
      ""
  ).trim();
}

async function hasPurchaseFromBillingPlugin(productId) {
  const billing = Capacitor?.Plugins?.Billing;
  if (!billing || typeof billing.getAvailablePurchases !== "function") {
    return false;
  }

  const res = await billing.getAvailablePurchases();
  const purchases = Array.isArray(res)
    ? res
    : res?.purchases || res?.availablePurchases || [];

  return purchases.some((p) => extractProductId(p) === productId);
}

async function hasPurchaseFromRevenueCat(productId) {
  const configuredRes = await Purchases.isConfigured().catch(() => ({
    isConfigured: false,
  }));
  if (!configuredRes?.isConfigured) return false;

  const infoRes = await Purchases.getCustomerInfo();
  const info = infoRes?.customerInfo;
  if (!info) return false;

  const directIds = Array.isArray(info.allPurchasedProductIdentifiers)
    ? info.allPurchasedProductIdentifiers
    : [];
  if (directIds.includes(productId)) return true;

  const transactions = Array.isArray(info.nonSubscriptionTransactions)
    ? info.nonSubscriptionTransactions
    : [];
  return transactions.some(
    (tx) => String(tx?.productIdentifier || "").trim() === productId
  );
}

export async function hasPreRegistrationRewardPurchase(
  productId = PRE_REG_PRODUCT_ID
) {
  if (!Capacitor?.isNativePlatform?.()) return false;

  try {
    if (await hasPurchaseFromBillingPlugin(productId)) return true;
  } catch {
    // ignore and fall back
  }

  try {
    if (await hasPurchaseFromRevenueCat(productId)) return true;
  } catch {
    // ignore and fall back
  }

  return false;
}

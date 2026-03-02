/** @format */
// src/features/billing/preRegistrationReward.js

import { Capacitor } from "@capacitor/core";
import { Purchases } from "@revenuecat/purchases-capacitor";
import {
  PRE_REG_GIFT_COINS,
  PRE_REG_PRODUCT_ID,
} from "@/features/billing/billingConfig.js";
import { reportError } from "@/lib/errorReporter.js";
export { PRE_REG_PRODUCT_ID, PRE_REG_GIFT_COINS };

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
  const billing = Capacitor?.Billing;
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
  const normalizedProductId = String(productId || "").trim();
  if (!normalizedProductId) return false;

  try {
    if (await hasPurchaseFromBillingPlugin(normalizedProductId)) return true;
  } catch (err) {
    reportError({
      source: "billing.preRegistrationReward",
      provider: "capacitor-billing",
      message: "Pre-registration billing check failed",
      error: String(err?.message || err || "unknown"),
    });
  }

  try {
    if (await hasPurchaseFromRevenueCat(normalizedProductId)) return true;
  } catch (err) {
    reportError({
      source: "billing.preRegistrationReward",
      provider: "revenuecat",
      message: "Pre-registration RevenueCat check failed",
      error: String(err?.message || err || "unknown"),
    });
  }

  return false;
}

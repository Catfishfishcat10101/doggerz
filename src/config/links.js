// src/config/links.js

export const SUPPORT_EMAIL = "support@doggerz.app";
export const SUPPORT_EMAIL_FEEDBACK_URL =
  "mailto:support@doggerz.app?subject=Doggerz%20Feedback";
export const SUPPORT_EMAIL_PRIVACY_URL =
  "mailto:support@doggerz.app?subject=Doggerz%20Privacy";
export const SUPPORT_EMAIL_ACCOUNT_DELETION_URL =
  "mailto:support@doggerz.app?subject=Doggerz%20Account%20Deletion";

export const SUPPORT_CONTACT_URL = SUPPORT_EMAIL_FEEDBACK_URL;

export const SOCIAL_LINKS = Object.freeze({
  website: "https://doggerz.app",
  twitter: "https://twitter.com/doggerz",
  tiktok: "https://tiktok.com/@doggerz",
  instagram: "https://instagram.com/doggerz",
  discord: "https://discord.gg/doggerz",
});

export default {
  SUPPORT_EMAIL,
  SUPPORT_EMAIL_FEEDBACK_URL,
  SUPPORT_EMAIL_PRIVACY_URL,
  SUPPORT_EMAIL_ACCOUNT_DELETION_URL,
  SUPPORT_CONTACT_URL,
  SOCIAL_LINKS,
};

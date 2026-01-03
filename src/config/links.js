/** @format */

// src/config/links.js
// Central place for external URLs so we don't ship dead "#" links.

function toAbsoluteUrl(pathname) {
  const site = import.meta.env.VITE_SITE_URL;
  if (!site) return pathname;
  try {
    return new URL(pathname, site).toString();
  } catch {
    return pathname;
  }
}

function makeMailto(email, subject) {
  const s = typeof subject === 'string' ? subject.trim() : '';
  const query = s ? `?subject=${encodeURIComponent(s)}` : '';
  return `mailto:${email}${query}`;
}

export const SOCIAL_LINKS = Object.freeze({
  github: 'https://github.com/Catfishfishcat10101/doggerz',
  twitter: null,
  discord: null,
});

// Public policy/support links (safe to reference anywhere in the app)
export const APP_LINKS = Object.freeze({
  // This should be your deployed Vercel route once /privacy is live.
  // Example: "https://doggerz.vercel.app/privacy"
  privacyPolicy: '/privacy',

  // In-app support / contact page.
  supportContact: '/contact',

  // Optional, but strongly recommended for Play Console consistency.
  // If you have no website, keep mailto.
  supportEmail:
    'mailto:catfishfishcat10101@gmail.com?subject=Doggerz%20Support',
});

// Convenience named exports (so call-sites can import a single constant)
export const PRIVACY_POLICY_URL = APP_LINKS.privacyPolicy;
export const SUPPORT_CONTACT_URL = APP_LINKS.supportContact;

// Absolute URLs (recommended for Play Console fields)
export const PRIVACY_POLICY_ABSOLUTE_URL = toAbsoluteUrl(PRIVACY_POLICY_URL);
export const SUPPORT_CONTACT_ABSOLUTE_URL = toAbsoluteUrl(SUPPORT_CONTACT_URL);

// Support contact methods
export const SUPPORT_EMAIL = 'catfishfishcat10101@gmail.com';
export const SUPPORT_EMAIL_URL = makeMailto(SUPPORT_EMAIL, 'Doggerz Support');
export const SUPPORT_EMAIL_FEEDBACK_URL = makeMailto(
  SUPPORT_EMAIL,
  'Doggerz Feedback'
);
export const SUPPORT_EMAIL_PRIVACY_URL = makeMailto(
  SUPPORT_EMAIL,
  'Doggerz Privacy'
);
export const SUPPORT_EMAIL_ACCOUNT_DELETION_URL = makeMailto(
  SUPPORT_EMAIL,
  'Doggerz Account Deletion'
);

export { toAbsoluteUrl, makeMailto };

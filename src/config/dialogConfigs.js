// Centralize dialog copy/variants to keep tone consistent & colorblind-safe.
export const DIALOGS = Object.freeze({
  confirmSignOut: {
    title: "Sign out?",
    body: "You can sign back in anytime. Your pup’s progress is saved.",
    confirmLabel: "Sign out",
    cancelLabel: "Stay",
    variant: "danger",
  },
  deleteDog: {
    title: "Release your pup?",
    body: "This permanently deletes your pup and its progress. This cannot be undone.",
    confirmLabel: "Release",
    cancelLabel: "Cancel",
    variant: "danger",
  },
  pwaUpdate: {
    title: "Update available",
    body: "A new version is ready. Reload to apply?",
    confirmLabel: "Reload",
    cancelLabel: "Later",
    variant: "primary",
  },
  purchaseConfirm: {
    title: "Confirm purchase",
    body: "This will add items to your account immediately.",
    confirmLabel: "Buy",
    cancelLabel: "Cancel",
    variant: "primary",
  },
});

export function getDialog(key) {
  return DIALOGS[key] || null;
}
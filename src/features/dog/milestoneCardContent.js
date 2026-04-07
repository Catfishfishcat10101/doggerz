export const IDENTITY_MILESTONE_CARD_CONTENT = Object.freeze({
  first_mastered_trick: Object.freeze({
    id: "first_mastered_trick",
    title: "First Trick Mastered",
    body: "Your dog is starting to trust the routine and show real confidence.",
    tone: "proud",
  }),
  first_week_together: Object.freeze({
    id: "first_week_together",
    title: "First Week Together",
    body: "You are no longer just meeting each other. You are building a life together.",
    tone: "warm",
  }),
  first_favorite_item: Object.freeze({
    id: "first_favorite_item",
    title: "A Favorite Emerges",
    body: "Your dog has started showing a clear preference. That is identity taking shape.",
    tone: "bright",
  }),
  first_big_recovery: Object.freeze({
    id: "first_big_recovery",
    title: "Big Recovery",
    body: "You helped your dog come back from a rough patch. That kind of care builds trust.",
    tone: "steady",
  }),
});

export function getIdentityMilestoneCardContent(cardId) {
  const key = String(cardId || "")
    .trim()
    .toLowerCase();
  return IDENTITY_MILESTONE_CARD_CONTENT[key] || null;
}

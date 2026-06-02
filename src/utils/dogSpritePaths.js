export function normalizeDogStageShort(stageLike = "puppy") {
  const value = String(stageLike || "")
    .trim()
    .toLowerCase();

  if (value.includes("senior") || value === "old") return "senior";
  if (value.includes("adult") || value === "grown") return "adult";
  if (value.includes("teen") || value.includes("adolescent")) return "adult";
  return "puppy";
}

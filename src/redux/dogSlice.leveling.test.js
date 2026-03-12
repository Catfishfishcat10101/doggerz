import { describe, expect, it } from "vitest";

import dogReducer, { addXp } from "@/redux/dogSlice.js";

describe("dogSlice leveling curve", () => {
  it("does not level up too quickly on small XP gains", () => {
    const base = dogReducer(undefined, { type: "@@INIT" });

    const after100 = dogReducer(base, addXp({ amount: 100 }));
    const after140 = dogReducer(base, addXp({ amount: 140 }));
    const after315 = dogReducer(base, addXp({ amount: 315 }));

    expect(after100.level).toBe(1);
    expect(after140.level).toBe(2);
    expect(after315.level).toBe(3);
  });
});

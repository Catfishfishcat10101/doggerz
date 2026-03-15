import { describe, expect, it } from "vitest";

import {
  buildHeistMessage,
  getHeistRouteLabel,
  normalizeHeistActionKey,
  resolveHeistRoute,
} from "@/utils/heistRoutes.js";
import { PATHS } from "@/app/routes.js";

describe("heist route helpers", () => {
  it("maps supported heist actions to real app routes", () => {
    expect(normalizeHeistActionKey(" Store ")).toBe("store");
    expect(resolveHeistRoute("store")).toBe(PATHS.STORE);
    expect(resolveHeistRoute("train")).toBe(PATHS.SKILL_TREE);
    expect(resolveHeistRoute("memories")).toBe(PATHS.MEMORIES);
    expect(resolveHeistRoute("menu")).toBe(PATHS.MENU);
    expect(resolveHeistRoute("unknown")).toBeNull();
  });

  it("builds readable player-facing heist messages", () => {
    expect(getHeistRouteLabel("train")).toBe("Train");
    expect(getHeistRouteLabel("menu")).toBe("Menu");
    expect(buildHeistMessage("store", "Fireball")).toBe(
      "Fireball ran off with the store key. Play fetch to get it back."
    );
  });
});

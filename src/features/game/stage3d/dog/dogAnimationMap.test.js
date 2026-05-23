import { describe, expect, it } from "vitest";

import {
  FEED_LOOP_CLIP,
  FEED_START_CLIP,
  isFeedingDogAction,
  resolveClipName,
  resolveDogModelClipRequest,
  resolveFeedingClipName,
} from "./dogAnimationMap.js";

const GLB_ACTIONS = Object.freeze({
  Bark: {},
  Crouch_F_IP: {},
  EatDrink_start: {},
  Eat_loop: {},
  Idle_1: {},
  JumpAir_high: {},
  Jump_Place_IP: {},
  Lie_belly_loop_1: {},
  Lie_belly_sleep: {},
  Sitting_loop_1: {},
  Sitting_loop_2: {},
  Trot_R_IP: {},
  Turn_R_IP: {},
});

describe("dog 3D animation map", () => {
  it.each([
    ["sit", "Sit", "Sitting_loop_1"],
    ["speak", "Speak", "Bark"],
    ["shake", "Shake", "Sitting_loop_2"],
    ["sit_pretty", "Sit_Pretty", "Sitting_loop_2"],
    ["roll_over", "Roll_Over", "Lie_belly_loop_1"],
    ["spin", "Spin", "Turn_R_IP"],
    ["crawl", "Crawl", "Crouch_F_IP"],
    ["play_dead", "Play_Dead", "Lie_belly_sleep"],
    ["backflip", "Backflip", "JumpAir_high"],
    ["high_five", "High_Five", "Sitting_loop_1"],
  ])("resolves trainable command %s", (request, clipRequest, expectedClip) => {
    expect(resolveDogModelClipRequest(request)).toBe(clipRequest);
    expect(resolveClipName(request, GLB_ACTIONS)).toBe(expectedClip);
  });

  it.each(["feed", "feeding", "eat", "eating", "food", "treat", "feed_quick"])(
    "resolves feeding action %s without wag fallback",
    (request) => {
      expect(isFeedingDogAction(request)).toBe(true);
      expect(["Feed", "Eat"]).toContain(resolveDogModelClipRequest(request));
      expect(resolveClipName(request, GLB_ACTIONS)).toBe(FEED_LOOP_CLIP);
    }
  );

  it("uses EatDrink_start for the feed start phase and Eat_loop afterward", () => {
    expect(resolveFeedingClipName("start", GLB_ACTIONS)).toBe(FEED_START_CLIP);
    expect(resolveFeedingClipName("loop", GLB_ACTIONS)).toBe(FEED_LOOP_CLIP);
  });

  it("falls back to neutral idle for feeding when eating clips are missing", () => {
    expect(resolveFeedingClipName("start", { Idle_1: {}, Wag: {} })).toBe(
      "Idle_1"
    );
    expect(resolveClipName("feed", { Idle_1: {}, Wag: {} })).toBe("Idle_1");
  });
});

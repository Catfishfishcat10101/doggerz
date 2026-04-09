import { describe, expect, it } from "vitest";

import {
  getDogAnimationCatalog,
  resolveDogAnimationContract,
} from "./dogAnimationMap.js";
import { resolveDogAnimationSelection } from "./animationResolver.js";

describe("dog animation contract", () => {
  it("keeps explicit puppy loop clips available to the renderer", () => {
    const catalog = getDogAnimationCatalog("PUPPY");

    expect(catalog.puppy_idle_pack).toBeTruthy();
    expect(catalog.puppy_idle_pack.loop).toBe(true);
    expect(catalog.puppy_idle_pack.oneShot).toBe(false);
    expect(catalog.idle.sheetName).toBe("idle_resting");
  });

  it("maps legacy state aliases into expressive clips", () => {
    expect(resolveDogAnimationContract("guilty_paws").action).toBe("paw");
    expect(resolveDogAnimationContract("pet_zoomies").action).toBe("walk");
    expect(resolveDogAnimationContract("golden_years_sleeping").action).toBe(
      "golden_years_sleeping"
    );
  });
});

describe("resolveDogAnimationSelection", () => {
  it("honors explicit looping clip requests", () => {
    const selection = resolveDogAnimationSelection({
      dog: {},
      brainState: {},
      renderModel: {},
      requestedAction: "puppy_idle_pack",
    });

    expect(selection.requestedLoopAction).toBe("puppy_idle_pack");
    expect(selection.baseAction).toBe("puppy_idle_pack");
    expect(selection.finalAction).toBe("puppy_idle_pack");
    expect(selection.oneShot).toBe(false);
  });

  it("treats custom trick clips as one-shots", () => {
    const selection = resolveDogAnimationSelection({
      dog: {},
      brainState: {},
      renderModel: {},
      requestedAction: "handstand",
    });

    expect(selection.interruptAction).toBe("handstand");
    expect(selection.finalAction).toBe("handstand");
    expect(selection.oneShot).toBe(true);
    expect(selection.priorityBucket).toBe("one_shot");
    expect(selection.decisionSource).toBe("requested_interrupt");
  });

  it("preserves richer state-driven reaction aliases", () => {
    const selection = resolveDogAnimationSelection({
      dog: { lastAction: "guilty_paws" },
      brainState: {},
      renderModel: {},
    });

    expect(selection.interruptAction).toBe("paw");
    expect(selection.finalAction).toBe("paw");
    expect(selection.oneShot).toBe(true);
    expect(selection.priorityBucket).toBe("one_shot");
    expect(selection.decisionSource).toBe("state_interrupt");
  });

  it("keeps requested one-shot priority over movement", () => {
    const selection = resolveDogAnimationSelection({
      dog: {
        moving: true,
        position: { x: 0, y: 0 },
        targetPosition: { x: 120, y: 0 },
      },
      brainState: {},
      renderModel: {},
      requestedAction: "bark",
    });

    expect(selection.moving).toBe(true);
    expect(selection.baseAction).toBe("walk");
    expect(selection.interruptAction).toBe("bark");
    expect(selection.finalAction).toBe("bark");
    expect(selection.priorityBucket).toBe("one_shot");
  });

  it("lets requested interrupt preempt state interrupt", () => {
    const selection = resolveDogAnimationSelection({
      dog: { lastAction: "guilty_paws" },
      brainState: {},
      renderModel: {},
      requestedAction: "bark",
    });

    expect(selection.interruptAction).toBe("bark");
    expect(selection.interruptSource).toBe("requested_interrupt");
    expect(selection.finalAction).toBe("bark");
  });

  it("uses explicit requestedFacing without reading facing from action text", () => {
    const selection = resolveDogAnimationSelection({
      dog: {},
      brainState: {},
      renderModel: {},
      requestedAction: "sit",
      requestedFacing: "left",
    });

    expect(selection.preferredFacing).toBe("left");
    expect(selection.finalAction).toBe("sit");
    expect(selection.oneShot).toBe(false);
  });

  it("does not derive facing from action names after split", () => {
    const selection = resolveDogAnimationSelection({
      dog: {},
      brainState: {},
      renderModel: {},
      requestedAction: "walk_left",
      requestedFacing: "",
    });

    expect(selection.preferredFacing).toBe(null);
    expect(selection.finalAction).toBe("walk_left");
  });

  it("keeps critical-need loops above locomotion and ambient intent", () => {
    const selection = resolveDogAnimationSelection({
      dog: { sleeping: true },
      brainState: { isMoving: true, desiredAction: "sniff" },
      renderModel: {},
      requestedAction: "",
    });

    expect(selection.baseAction).toBe("sleep");
    expect(selection.criticalNeedActive).toBe(true);
    expect(selection.priorityBucket).toBe("critical_need");
    expect(selection.decisionSource).toBe("critical_need");
  });
});

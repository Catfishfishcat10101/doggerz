/** @format */
// src/pixi/DogAnimationController.js

import * as PIXI from "pixi.js";
import { DEFAULT_DOG_ACTION } from "@/utils/mapPoseToDogAction";

/**
 * @typedef {Object} DogAnimationControllerOptions
 * @property {string} atlasJsonUrl - URL to atlas JSON (e.g. "/sprites/puppy/puppy_v1.json")
 * @property {string} [initialAction="idle"]
 * @property {number} [scale=1]
 * @property {{x:number,y:number}} [position]
 * @property {boolean} [autoPlay=true]
 * @property {boolean} [pixelPerfect=false] - If true, uses NEAREST scaling
 * @property {Record<string, number>} [actionSpeed] - Per-action animationSpeed overrides
 * @property {Record<string, boolean>} [actionLoop] - Per-action loop overrides
 * @property {string[]} [oneshotActions] - Actions that should play once then return to idle
 * @property {string[]} [uninterruptibleActions] - Actions that cannot be interrupted until finished
 * @property {number} [idleVarianceMs=0] - Optional random idle micro-variation timer (0 disables)
 * @property {string[]} [idleVariants] - Optional idle variants (e.g. ["idle", "idle_breathe", "idle_ear_twitch"])
 */

/**
 * Production-safe Pixi animation controller for Doggerz.
 *
 * Usage:
 *   const dog = new DogAnimationController({ atlasJsonUrl: "/sprites/puppy/puppy_v1.json", scale: 1 });
 *   await dog.load();
 *   dog.mount(stage); // or any PIXI.Container
 *   dog.setFacing("right");
 *   dog.play("walk");
 *
 *   // in ticker:
 *   app.ticker.add((delta) => dog.update(delta));
 */
export class DogAnimationController {
  /** @type {DogAnimationControllerOptions} */
  #opts;

  /** @type {PIXI.Container|null} */
  #root = null;

  /** @type {PIXI.AnimatedSprite|null} */
  #sprite = null;

  /** @type {Record<string, PIXI.Texture[]>} */
  #animations = {};

  /** @type {Set<string>} */
  #availableActions = new Set();

  /** @type {string} */
  #currentAction = DEFAULT_DOG_ACTION;

  /** @type {string} */
  #facing = "right"; // "left" | "right"

  /** @type {Array<{ action: string, loop?: boolean, speed?: number, onComplete?: () => void }>} */
  #queue = [];

  /** @type {number} */
  #idleTimerMs = 0;

  /** @type {number} */
  #idleNextSwitchMs = 0;

  /** @type {boolean} */
  #loaded = false;

  constructor(options) {
    if (!options || typeof options !== "object") {
      throw new Error("DogAnimationController requires an options object.");
    }
    if (!options.atlasJsonUrl) {
      throw new Error("DogAnimationController requires atlasJsonUrl.");
    }

    this.#opts = {
      initialAction: DEFAULT_DOG_ACTION,
      scale: 1,
      autoPlay: true,
      pixelPerfect: false,
      idleVarianceMs: 0,
      idleVariants: [],
      actionSpeed: {},
      actionLoop: {},
      oneshotActions: ["bark", "jump"],
      uninterruptibleActions: ["bark", "jump", "roll", "shake"],
      ...options,
    };

    this.#root = new PIXI.Container();

    const { position } = this.#opts;
    if (
      position &&
      typeof position.x === "number" &&
      typeof position.y === "number"
    ) {
      this.#root.position.set(position.x, position.y);
    }

    this.#root.scale.set(this.#opts.scale, this.#opts.scale);
  }

  /** Readonly set of animation keys available in the atlas. */
  get availableActions() {
    return Array.from(this.#availableActions);
  }

  /** Current action name. */
  get currentAction() {
    return this.#currentAction;
  }

  /** Container you can add to the stage if you want manual mounting. */
  get view() {
    return this.#root;
  }

  /**
   * Load atlas JSON and build PIXI textures per animation.
   * This must be called before mount/play.
   */
  async load() {
    if (this.#loaded) return;

    // Load the JSON. Pixi will also load the referenced image via meta.image
    const sheet = await PIXI.Assets.load(this.#opts.atlasJsonUrl);

    // Pixi returns different shapes depending on plugin; handle the common cases safely.
    // If it's a SpriteSheet instance:
    if (sheet && sheet.animations && sheet.textures) {
      this.#animations = sheet.animations;
    } else if (sheet && sheet.data && sheet.textures && sheet.animations) {
      this.#animations = sheet.animations;
    } else if (sheet && sheet.animations) {
      this.#animations = sheet.animations;
    } else {
      // In case Assets.load returns raw JSON (rare in Pixi v7 with spritesheet loader),
      // we can build a SpriteSheet manually.
      const raw = sheet;
      if (!raw?.meta?.image || !raw?.frames || !raw?.animations) {
        throw new Error(
          "Atlas JSON does not look like a Pixi spritesheet. Expected {meta, frames, animations}."
        );
      }

      const baseTexture = await PIXI.Assets.load(
        this.#resolveRelativeImageUrl(this.#opts.atlasJsonUrl, raw.meta.image)
      );

      const spritesheet = new PIXI.Spritesheet(baseTexture, raw);
      await spritesheet.parse();
      this.#animations = spritesheet.animations;
    }

    this.#availableActions = new Set(Object.keys(this.#animations || {}));

    // Build sprite
    const initial = this.#pickFirstAvailableAction(this.#opts.initialAction);
    const textures = this.#animations[initial];

    if (!textures || textures.length === 0) {
      throw new Error(
        "No textures found for initial action. Atlas may be empty."
      );
    }

    const sprite = new PIXI.AnimatedSprite(textures);
    sprite.anchor.set(0.5, 0.5);

    // Pixel scaling
    if (this.#opts.pixelPerfect) {
      // These settings are safe for Pixi and help avoid blur.
      PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;
      sprite.texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
    }

    // Default speed/loop
    sprite.animationSpeed = this.#getSpeedForAction(initial);
    sprite.loop = this.#getLoopForAction(initial);

    // Auto-return behavior for oneshots
    sprite.onComplete = () => this.#handleSpriteComplete();

    this.#sprite = sprite;
    this.#root.addChild(sprite);

    this.#loaded = true;

    if (this.#opts.autoPlay) {
      this.play(initial, { force: true });
    } else {
      this.#currentAction = initial;
      this.#applyFacing();
    }

    // Setup idle variation timer if enabled
    this.#resetIdleVariance();
  }

  /**
   * Add the dog container to a parent container (stage, layer, etc.)
   * @param {PIXI.Container} parent
   */
  mount(parent) {
    if (!parent || typeof parent.addChild !== "function") {
      throw new Error("mount(parent) requires a PIXI.Container parent.");
    }
    parent.addChild(this.#root);
  }

  /** Remove from its parent (if any) without destroying. */
  unmount() {
    if (this.#root?.parent) this.#root.parent.removeChild(this.#root);
  }

  /**
   * Update should be called from app.ticker:
   * app.ticker.add((delta) => dog.update(delta));
   *
   * @param {number} delta - Pixi ticker delta (frames)
   */
  update(delta) {
    if (!this.#loaded || !this.#sprite) return;

    // Optional idle micro-variation switching
    const varianceMs = this.#opts.idleVarianceMs || 0;
    if (varianceMs > 0) {
      // delta is "frames", convert to ms at ~60fps
      const ms = (delta / 60) * 1000;
      this.#idleTimerMs += ms;

      if (this.#idleTimerMs >= this.#idleNextSwitchMs) {
        this.#idleTimerMs = 0;
        this.#resetIdleVariance();

        // Only do idle variants if we are currently idle and not playing a queue item
        if (this.#currentAction === "idle" && this.#queue.length === 0) {
          const v = this.#pickIdleVariant();
          if (v && v !== "idle") this.play(v, { force: true });
          else this.play("idle", { force: true });
        }
      }
    }
  }

  /**
   * Set which direction the dog faces.
   * @param {"left"|"right"} facing
   */
  setFacing(facing) {
    const f = facing === "left" ? "left" : "right";
    this.#facing = f;
    this.#applyFacing();
  }

  /**
   * Flip automatically based on velocity sign.
   * @param {number} vx
   */
  setFacingFromVelocity(vx) {
    if (typeof vx !== "number") return;
    if (vx < -0.01) this.setFacing("left");
    else if (vx > 0.01) this.setFacing("right");
  }

  /**
   * Play an action.
   *
   * @param {string} action
   * @param {{
   *   loop?: boolean,
   *   speed?: number,
   *   force?: boolean,
   *   queue?: boolean,
   *   onComplete?: () => void
   * }} [opts]
   */
  play(action, opts = {}) {
    if (!this.#loaded || !this.#sprite) return;

    const { force = false, queue = false, onComplete } = opts;

    const safeAction = this.#pickFirstAvailableAction(action);

    // Queue behavior
    if (queue) {
      this.#queue.push({
        action: safeAction,
        loop: opts.loop,
        speed: opts.speed,
        onComplete,
      });
      // If nothing is playing or we are in a loop that can be interrupted, kick queue
      if (!this.#isUninterruptible(this.#currentAction)) {
        this.#playNextFromQueue();
      }
      return;
    }

    // If current action is uninterruptible, queue the new action unless forced.
    if (!force && this.#isUninterruptible(this.#currentAction)) {
      this.#queue.push({
        action: safeAction,
        loop: opts.loop,
        speed: opts.speed,
        onComplete,
      });
      return;
    }

    // If already playing same action, do nothing (unless forced)
    if (!force && safeAction === this.#currentAction) return;

    this.#applyAction(safeAction, opts);

    // Assign onComplete handler for this specific play request
    // We store it on the instance and execute when appropriate.
    this.#pendingOnComplete =
      typeof onComplete === "function" ? onComplete : null;
  }

  /**
   * Convenience: setAction semantics like state-driven animation.
   * This will pick a safe action and apply it if needed.
   */
  setAction(action, opts = {}) {
    this.play(action, { ...opts, queue: false });
  }

  /**
   * Stop on current frame (keeps the sprite visible).
   */
  stop() {
    if (!this.#sprite) return;
    this.#sprite.stop();
  }

  /**
   * Destroy everything (call when leaving the game screen).
   */
  destroy() {
    this.unmount();

    if (this.#sprite) {
      this.#sprite.onComplete = null;
      this.#sprite.destroy({
        children: false,
        texture: false,
        baseTexture: false,
      });
      this.#sprite = null;
    }

    if (this.#root) {
      this.#root.destroy({ children: true });
      this.#root = null;
    }

    this.#animations = {};
    this.#availableActions = new Set();
    this.#queue = [];
    this.#loaded = false;
  }

  // -------------------------
  // Internals
  // -------------------------

  /** @type {null | (() => void)} */
  #pendingOnComplete = null;

  #applyFacing() {
    if (!this.#sprite) return;
    // Mirror by flipping X scale. Keep root scale intact.
    const sign = this.#facing === "left" ? -1 : 1;
    this.#sprite.scale.x = Math.abs(this.#sprite.scale.x) * sign;
  }

  #applyAction(action, opts = {}) {
    if (!this.#sprite) return;

    const textures = this.#animations[action];
    if (!textures || textures.length === 0) {
      // Absolute last-resort fallback
      action = this.#pickFirstAvailableAction(DEFAULT_DOG_ACTION);
      this.#sprite.textures = this.#animations[action] || this.#sprite.textures;
    } else {
      this.#sprite.textures = textures;
    }

    this.#currentAction = action;

    // Use overrides if provided, otherwise per-action defaults, otherwise sheet defaults
    this.#sprite.animationSpeed =
      typeof opts.speed === "number"
        ? opts.speed
        : this.#getSpeedForAction(action);

    this.#sprite.loop =
      typeof opts.loop === "boolean"
        ? opts.loop
        : this.#getLoopForAction(action);

    this.#sprite.gotoAndPlay(0);
    this.#applyFacing();
  }

  #handleSpriteComplete() {
    // If a one-shot ends, run callback, then go next queued or idle
    if (this.#pendingOnComplete) {
      try {
        this.#pendingOnComplete();
      } catch (e) {
        // eslint-disable-next-line no-console
        console.warn("[DogAnimationController] onComplete error:", e);
      }
      this.#pendingOnComplete = null;
    }

    // If something queued, play it next
    if (this.#queue.length > 0) {
      this.#playNextFromQueue();
      return;
    }

    // Auto return to idle after oneshots / uninterruptibles
    const oneshots = new Set(this.#opts.oneshotActions || []);
    if (oneshots.has(this.#currentAction)) {
      this.play(DEFAULT_DOG_ACTION, { force: true });
    }
  }

  #playNextFromQueue() {
    if (!this.#sprite || this.#queue.length === 0) return;
    const next = this.#queue.shift();
    if (!next) return;

    this.#pendingOnComplete =
      typeof next.onComplete === "function" ? next.onComplete : null;
    this.#applyAction(next.action, { loop: next.loop, speed: next.speed });
  }

  #isUninterruptible(action) {
    const set = new Set(this.#opts.uninterruptibleActions || []);
    return set.has(action);
  }

  #getSpeedForAction(action) {
    const map = this.#opts.actionSpeed || {};
    if (typeof map[action] === "number") return map[action];

    // Reasonable defaults tuned for 10-frame actions
    switch (action) {
      case "idle":
        return 0.12;
      case "walk":
        return 0.18;
      case "run":
        return 0.25;
      case "sleep":
        return 0.07;
      case "eat":
        return 0.16;
      case "scratch":
        return 0.2;
      case "bark":
      case "jump":
        return 0.22;
      default:
        return 0.16;
    }
  }

  #getLoopForAction(action) {
    const map = this.#opts.actionLoop || {};
    if (typeof map[action] === "boolean") return map[action];

    const oneshots = new Set(this.#opts.oneshotActions || []);
    if (oneshots.has(action)) return false;

    // Most actions loop in a pet sim
    switch (action) {
      case "jump":
      case "bark":
        return false;
      default:
        return true;
    }
  }

  #pickFirstAvailableAction(preferred) {
    const p = String(preferred || "").trim();
    if (p && this.#availableActions.has(p)) return p;

    // Fallback to idle if possible
    if (this.#availableActions.has(DEFAULT_DOG_ACTION))
      return DEFAULT_DOG_ACTION;

    // Otherwise pick first available key
    const first = this.availableActions[0];
    return first || DEFAULT_DOG_ACTION;
  }

  #pickIdleVariant() {
    const variants = Array.isArray(this.#opts.idleVariants)
      ? this.#opts.idleVariants
      : [];
    if (variants.length === 0) return "idle";

    // Filter only available
    const viable = variants.filter((v) => this.#availableActions.has(v));
    if (viable.length === 0) return "idle";

    const idx = Math.floor(Math.random() * viable.length);
    return viable[idx] || "idle";
  }

  #resetIdleVariance() {
    const varianceMs = this.#opts.idleVarianceMs || 0;
    if (varianceMs <= 0) {
      this.#idleNextSwitchMs = 0;
      return;
    }
    // Switch anywhere between 50% and 100% of varianceMs
    const min = Math.max(250, Math.floor(varianceMs * 0.5));
    const max = Math.max(min + 1, varianceMs);
    this.#idleNextSwitchMs = min + Math.floor(Math.random() * (max - min));
  }

  #resolveRelativeImageUrl(jsonUrl, imageName) {
    // "/sprites/puppy/puppy_v1.json" + "puppy_v1.webp" -> "/sprites/puppy/puppy_v1.webp"
    try {
      const base = new URL(jsonUrl, window.location.href);
      const img = new URL(imageName, base);
      return img.toString();
    } catch {
      // If URL fails (SSR or weird paths), fall back to manual join
      const slash = jsonUrl.lastIndexOf("/");
      if (slash === -1) return imageName;
      return jsonUrl.slice(0, slash + 1) + imageName;
    }
  }
}

export default DogAnimationController;

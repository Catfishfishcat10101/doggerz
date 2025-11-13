// src/features/game/DogAnimator.js

export const SPRITE_COLS = 3;
export const SPRITE_ROWS = 3;

/** FRAME SEQUENCES **/
export const Animations = {
  idle: { row: 2, frames: [0, 0, 0, 1], fps: 2 }, // subtle wag + blink
  walkRight: { row: 0, frames: [0, 1, 2, 1], fps: 6 },
  walkLeft: { row: 1, frames: [0, 1, 2, 1], fps: 6 },
  sleep: { row: 2, frames: [1], fps: 1 }, // back-facing frame
  happy: { row: 2, frames: [0, 0, 1, 0], fps: 4 },
  sad: { row: 2, frames: [1], fps: 1 },
  eating: { row: 2, frames: [0, 1, 0, 1], fps: 8 },
  playing: { row: 0, frames: [1, 2, 1, 0], fps: 8 },
};

export function nextFrame(animationName, frameIndex) {
  const anim = Animations[animationName] ?? Animations.idle;
  const frames = anim.frames;
  const next = (frameIndex + 1) % frames.length;
  return next;
}

export function getAnimationMeta(animationName, frameIndex) {
  const anim = Animations[animationName] ?? Animations.idle;
  const frame = anim.frames[frameIndex];
  const row = anim.row;
  return { frame, row, fps: anim.fps };
}

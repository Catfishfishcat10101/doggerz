/** @format */

// src/features/game/sprites/jrtSpritePack.js
// Metadata for the generated sprite strips in /public/sprites/anim/jrt/...
// These are procedurally generated from a single realistic image per stage.

export const JRT_SPRITE_PACK = {
  PUPPY: {
    base: '/sprites/anim/jrt/puppy',
    frameSize: 1024,
    anims: {
      idle: { file: 'idle.webp', frames: 12, fps: 6 },
      walk: { file: 'walk.webp', frames: 12, fps: 12 },
      run: { file: 'run.webp', frames: 12, fps: 16 },
      sit: { file: 'sit.webp', frames: 8, fps: 6 },
      lay: { file: 'lay.webp', frames: 8, fps: 5 },
      sleep: { file: 'sleep.webp', frames: 8, fps: 4 },
      eat: { file: 'eat.webp', frames: 8, fps: 10 },
      drink: { file: 'drink.webp', frames: 8, fps: 8 },
      bark: { file: 'bark.webp', frames: 6, fps: 12 },
      howl: { file: 'howl.webp', frames: 8, fps: 10 },
      poop: { file: 'poop.webp', frames: 8, fps: 8 },
      pee: { file: 'pee.webp', frames: 8, fps: 8 },
      wag: { file: 'wag.webp', frames: 8, fps: 10 },
      sniff: { file: 'sniff.webp', frames: 8, fps: 10 },
      shake: { file: 'shake.webp', frames: 10, fps: 12 },
      scratch: { file: 'scratch.webp', frames: 10, fps: 10 },
      roll: { file: 'roll.webp', frames: 10, fps: 10 },
      stay: { file: 'stay.webp', frames: 6, fps: 6 },
    },
  },
  ADULT: {
    base: '/sprites/anim/jrt/adult',
    frameSize: 1024,
    anims: {
      idle: { file: 'idle.webp', frames: 12, fps: 6 },
      walk: { file: 'walk.webp', frames: 12, fps: 12 },
      run: { file: 'run.webp', frames: 12, fps: 16 },
      sit: { file: 'sit.webp', frames: 8, fps: 6 },
      lay: { file: 'lay.webp', frames: 8, fps: 5 },
      sleep: { file: 'sleep.webp', frames: 8, fps: 4 },
      eat: { file: 'eat.webp', frames: 8, fps: 10 },
      drink: { file: 'drink.webp', frames: 8, fps: 8 },
      bark: { file: 'bark.webp', frames: 6, fps: 12 },
      howl: { file: 'howl.webp', frames: 8, fps: 10 },
      poop: { file: 'poop.webp', frames: 8, fps: 8 },
      pee: { file: 'pee.webp', frames: 8, fps: 8 },
      wag: { file: 'wag.webp', frames: 8, fps: 10 },
      sniff: { file: 'sniff.webp', frames: 8, fps: 10 },
      shake: { file: 'shake.webp', frames: 10, fps: 12 },
      scratch: { file: 'scratch.webp', frames: 10, fps: 10 },
      roll: { file: 'roll.webp', frames: 10, fps: 10 },
      stay: { file: 'stay.webp', frames: 6, fps: 6 },
    },
  },
  SENIOR: {
    base: '/sprites/anim/jrt/senior',
    frameSize: 1024,
    anims: {
      idle: { file: 'idle.webp', frames: 12, fps: 6 },
      walk: { file: 'walk.webp', frames: 12, fps: 12 },
      run: { file: 'run.webp', frames: 12, fps: 16 },
      sit: { file: 'sit.webp', frames: 8, fps: 6 },
      lay: { file: 'lay.webp', frames: 8, fps: 5 },
      sleep: { file: 'sleep.webp', frames: 8, fps: 4 },
      eat: { file: 'eat.webp', frames: 8, fps: 10 },
      drink: { file: 'drink.webp', frames: 8, fps: 8 },
      bark: { file: 'bark.webp', frames: 6, fps: 12 },
      howl: { file: 'howl.webp', frames: 8, fps: 10 },
      poop: { file: 'poop.webp', frames: 8, fps: 8 },
      pee: { file: 'pee.webp', frames: 8, fps: 8 },
      wag: { file: 'wag.webp', frames: 8, fps: 10 },
      sniff: { file: 'sniff.webp', frames: 8, fps: 10 },
      shake: { file: 'shake.webp', frames: 10, fps: 12 },
      scratch: { file: 'scratch.webp', frames: 10, fps: 10 },
      roll: { file: 'roll.webp', frames: 10, fps: 10 },
      stay: { file: 'stay.webp', frames: 6, fps: 6 },
    },
  },
};

export function getJrtPackForStage(stageKey) {
  const key = String(stageKey || 'PUPPY').toUpperCase();
  return JRT_SPRITE_PACK[key] || JRT_SPRITE_PACK.PUPPY;
}

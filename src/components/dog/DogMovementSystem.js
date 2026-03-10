/** @format */

import {
  DOG_WORLD_HEIGHT,
  DOG_WORLD_WIDTH,
} from "@/components/dog/DogWanderBehavior.js";

function clamp(n, lo, hi) {
  const value = Number(n);
  if (!Number.isFinite(value)) return lo;
  return Math.max(lo, Math.min(hi, value));
}

export function updateDogMovement(dog, delta) {
  if (!dog?.targetPosition || !dog?.position) return null;

  const dx = Number(dog.targetPosition.x || 0) - Number(dog.position.x || 0);
  const dy = Number(dog.targetPosition.y || 0) - Number(dog.position.y || 0);
  const distance = Math.hypot(dx, dy);

  if (distance < 5) {
    return {
      position: {
        x: clamp(Number(dog.targetPosition.x || 0), 0, DOG_WORLD_WIDTH),
        y: clamp(Number(dog.targetPosition.y || 0), 0, DOG_WORLD_HEIGHT),
      },
      targetPosition: null,
      aiState: "idle",
    };
  }

  const directionX = dx / distance;
  const directionY = dy / distance;
  const speed = clamp(Number(dog.speed || 40), 8, 140);

  return {
    position: {
      x: clamp(
        Number(dog.position.x || 0) + directionX * speed * delta,
        0,
        DOG_WORLD_WIDTH
      ),
      y: clamp(
        Number(dog.position.y || 0) + directionY * speed * delta,
        0,
        DOG_WORLD_HEIGHT
      ),
    },
    facing: directionX < 0 ? "left" : "right",
    aiState: "walk",
  };
}

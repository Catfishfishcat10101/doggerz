// src/components/Features/Dog.jsx
import React, { useCallback } from "react";
import PropTypes from "prop-types";
import DogSprite from "./DogSprite";
import Sound from "./SoundManager";
import { useDog } from "./DogContext";

// Reusable "Dog" entity wrapper.
// - Renders the sprite based on DogContext state
// - Click = bark (XP + small feedback)
// - Double-click = pet (boost happiness)
// - Keeps code in MainGame.jsx cleaner
export default function Dog({
  size = 64,
  frameCount = 4,
  frameRate = 8,
  idleFrame = 0,
  onBark,
  onPet,
}) {
  const { dog, setDog, addXP } = useDog();

  const clamp = (v, min = 0, max = 100) => Math.max(min, Math.min(max, v));

  const bark = useCallback(() => {
    // sound + quick bark flag
    Sound.bark();
    setDog((d) => ({ ...d, isBarking: true }));
    setTimeout(() => setDog((d) => ({ ...d, isBarking: false })), 220);
    addXP(3);
    onBark && onBark();
  }, [setDog, addXP, onBark]);

  const pet = useCallback(() => {
    // simple pet interaction: boost happiness a bit
    setDog((d) => ({ ...d, happiness: clamp((d.happiness ?? 100) + 8) }));
    addXP(2);
    onPet && onPet();
  }, [setDog, addXP, onPet]);

  // We render the sprite and overlay a transparent hitbox so clicks are easy
  return (
    <>
      <DogSprite
        x={dog.x}
        y={dog.y}
        direction={dog.direction}
        isWalking={dog.isWalking}
        size={size}
        frameCount={frameCount}
        frameRate={frameRate}
        idleFrame={idleFrame}
      />

      {/* Transparent click/gesture hitbox */}
      <div
        role="button"
        aria-label="Dog"
        title="Click to bark, double-click to pet"
        onClick={bark}
        onDoubleClick={pet}
        onContextMenu={(e) => e.preventDefault()}
        style={{
          position: "absolute",
          left: dog.x,
          top: dog.y,
          width: size,
          height: size,
          cursor: "pointer",
          // no background; keep interactions smooth
          background: "transparent",
        }}
      />
    </>
  );
}

Dog.propTypes = {
  size: PropTypes.number,
  frameCount: PropTypes.number,
  frameRate: PropTypes.number,
  idleFrame: PropTypes.number,
  onBark: PropTypes.func,
  onPet: PropTypes.func,
};


import React from "react";
import { useSelector } from "react-redux";
import DogSprite from "@/components/UI/DogSprite.jsx";
import { selectDirection, selectMoving, selectPos } from "@/redux/dogSlice";

export default function Dog({ worldW = 640, worldH = 360 }) {
  const dir = useSelector(selectDirection);
  const moving = useSelector(selectMoving);
  const pos = useSelector(selectPos);

  return (
    <div
      className="relative"
      style={{
        width: worldW, height: worldH,
        overflow: "hidden",
        position: "relative",
      }}
    >
      <div
        style={{
          position: "absolute",
          transform: `translate(${pos.x || 0}px, ${pos.y || 0}px)`,
          transition: moving ? "transform 50ms linear" : "transform 120ms ease-out",
          willChange: "transform",
        }}
      >
        <DogSprite
          direction={dir}
          isWalking={moving}
          size={96}
          frameWidth={64}
          frameHeight={64}
          frameCount={4}
          frameRate={8}
        />
      </div>
    </div>
  );
}
    if (!dt) return;
    const k = keysRef.current;
    const speed = movementSpeed;
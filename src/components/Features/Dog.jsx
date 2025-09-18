// src/components/Features/Dog.jsx
import React from "react";
import { useSelector } from "react-redux";
import { selectAccessories } from "../../redux/dogSlice";
import DogSprite from "../UI/DogSprite.jsx"; // assumes you already have this

/** Shows the dog sprite and overlays equipped accessories (simple emoji badges).
 * Replace with real sprites when assets are ready.
 */
export default function Dog() {
  const accessories = useSelector(selectAccessories);
  const eq = accessories?.equipped ?? { collar: null, hat: null };

  return (
    <div className="relative">
      <DogSprite />
      {/* simple overlay badges so we get visual feedback */}
      {eq.collar && (
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-lg select-none">🔗</div>
      )}
      {eq.hat && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-xl select-none">🎩</div>
      )}
    </div>
  );
}
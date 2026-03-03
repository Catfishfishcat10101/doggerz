/** @format */
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

export default function DogToy({ onSqueak, className = "", style }) {
  const [isSqueaking, setIsSqueaking] = useState(false);
  const squeakResetRef = useRef(null);

  useEffect(() => {
    return () => {
      if (squeakResetRef.current) {
        clearTimeout(squeakResetRef.current);
      }
    };
  }, []);

  // Triggered when the user taps or drops the toy
  const handleInteraction = (event) => {
    setIsSqueaking(true);
    if (onSqueak) {
      onSqueak({
        x: Number(event?.clientX || 0),
        y: Number(event?.clientY || 0),
        source: "tap",
      });
    }

    // Reset the squeak visual after a tiny delay
    if (squeakResetRef.current) clearTimeout(squeakResetRef.current);
    squeakResetRef.current = setTimeout(() => setIsSqueaking(false), 200);
  };

  return (
    <motion.div
      // 1. Instantly makes the element draggable on mobile and desktop!
      drag
      // 2. Adds bouncy physics when they pull it out of bounds
      dragElastic={0.2}
      // 3. Shrinks slightly when pressed, grows slightly when dragged
      whileTap={{ scale: 0.85 }}
      whileDrag={{ scale: 1.1, cursor: "grabbing" }}
      onPointerDown={handleInteraction}
      onDragEnd={(_event, info) => {
        if (!onSqueak) return;
        onSqueak({
          x: Number(info?.point?.x || 0),
          y: Number(info?.point?.y || 0),
          source: "drop",
        });
      }}
      className={`absolute bottom-4 left-4 z-50 flex h-16 w-16 cursor-grab items-center justify-center rounded-full border-b-4 border-yellow-600 shadow-lg transition-colors ${
        isSqueaking ? "bg-yellow-300" : "bg-yellow-400"
      } ${className}`}
      style={{ touchAction: "none", ...style }} // Prevents mobile scrolling while dragging
    >
      {/* A simple emoji placeholder until you add your pixel art sprite! */}
      <span className="select-none text-2xl">{isSqueaking ? "💢" : "🎾"}</span>
    </motion.div>
  );
}

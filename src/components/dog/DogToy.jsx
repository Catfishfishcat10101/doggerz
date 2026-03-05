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
      className={`absolute bottom-4 left-4 z-50 flex h-12 w-12 cursor-grab items-center justify-center rounded-full border border-lime-100/80 shadow-lg transition-colors ${
        isSqueaking
          ? "bg-[radial-gradient(circle_at_35%_35%,#fef9c3_0%,#eab308_62%,#ca8a04_100%)]"
          : "bg-[radial-gradient(circle_at_35%_35%,#fef08a_0%,#84cc16_62%,#4d7c0f_100%)]"
      } ${className}`}
      style={{ touchAction: "none", ...style }} // Prevents mobile scrolling while dragging
      title="Toy: drag and drop to play"
    >
      <span
        className="pointer-events-none absolute h-6 w-6 rounded-full border-2 border-white/70"
        style={{ transform: "translateX(-35%)" }}
      />
      <span
        className="pointer-events-none absolute h-6 w-6 rounded-full border-2 border-white/70"
        style={{ transform: "translateX(35%)" }}
      />
    </motion.div>
  );
}

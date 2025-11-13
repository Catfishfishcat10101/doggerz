//src/components/Features/Dog.jsx
import React, { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { move, markAccident } from "@/redux/dogSlice";

const STEP = 14;
const SIZE = 72; // sprite size in px

export default function Dog() {
  const dispatch = useDispatch();
  const { x, y } = useSelector((s) => s.dog.pos);
  const stageRef = useRef(null);

  useEffect(() => {
    stageRef.current?.focus();
  }, []);

  function onKeyDown(e) {
    const rect = stageRef.current?.getBoundingClientRect();
    const maxX = Math.max(0, (rect?.width || 0) - SIZE);
    const maxY = Math.max(0, (rect?.height || 0) - SIZE);

    let nx = x, ny = y;
    const key = e.key.toLowerCase();

    if (["w", "arrowup"].includes(key)) ny = Math.max(0, y - STEP);
    if (["s", "arrowdown"].includes(key)) ny = Math.min(maxY, y + STEP);
    if (["a", "arrowleft"].includes(key)) nx = Math.max(0, x - STEP);
    if (["d", "arrowright"].includes(key)) nx = Math.min(maxX, x + STEP);

    if (key === " ") {
      e.preventDefault();
      dispatch(markAccident());
      return;
    }
    if (nx !== x || ny !== y) dispatch(move({ x: nx, y: ny }));
  }

  return (
    <div
      ref={stageRef}
      tabIndex={0}
      onKeyDown={onKeyDown}
      className="absolute inset-0 outline-none"
    >
      <div
        className="absolute"
        style={{
          width: SIZE,
          height: SIZE,
          transform: `translate(${x}px, ${y}px)`,
        }}
      >
        {/* placeholder sprite */}
        <img
          src="/sprites/jackrussell/idle.svg"
          alt="Dog"
          className="w-full h-full object-contain drop-shadow"
          draggable={false}
          onError={(e) => {
            e.currentTarget.src =
              "data:image/svg+xml;utf8," +
              encodeURIComponent(
                `<svg xmlns='http://www.w3.org/2000/svg' width='${SIZE}' height='${SIZE}'><rect width='100%' height='100%' fill='#0b1020'/><circle cx='36' cy='36' r='30' fill='#fde68a'/></svg>`
              );
          }}
        />
      </div>
    </div>
  );
}
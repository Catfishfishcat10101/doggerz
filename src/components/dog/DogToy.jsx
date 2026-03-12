/** @format */
import { useEffect, useRef, useState } from "react";

export default function DogToy({
  onSqueak,
  className = "",
  style,
  itemType = "toy",
  title = "",
}) {
  const [isSqueaking, setIsSqueaking] = useState(false);
  const [dragState, setDragState] = useState({
    x: 0,
    y: 0,
    dragging: false,
  });
  const toyRef = useRef(null);
  const squeakResetRef = useRef(null);
  const pointerRef = useRef({
    id: null,
    startClientX: 0,
    startClientY: 0,
    startX: 0,
    startY: 0,
  });

  useEffect(() => {
    return () => {
      if (squeakResetRef.current) {
        clearTimeout(squeakResetRef.current);
      }
    };
  }, []);

  const triggerSqueak = (payload) => {
    setIsSqueaking(true);
    if (onSqueak) {
      onSqueak({ ...payload, itemType });
    }
    if (squeakResetRef.current) clearTimeout(squeakResetRef.current);
    squeakResetRef.current = setTimeout(() => setIsSqueaking(false), 200);
  };

  const finishDrag = (event, source = "drop") => {
    const pointerId = Number(event?.pointerId);
    if (
      pointerRef.current.id !== null &&
      Number.isFinite(pointerId) &&
      pointerId !== pointerRef.current.id
    ) {
      return;
    }
    try {
      toyRef.current?.releasePointerCapture?.(pointerRef.current.id);
    } catch {
      // Ignore pointer capture release issues.
    }
    pointerRef.current.id = null;
    setDragState((prev) => ({ ...prev, dragging: false }));
    if (!onSqueak) return;
    onSqueak({
      x: Number(event?.clientX || 0),
      y: Number(event?.clientY || 0),
      source,
      itemType,
    });
  };

  const handlePointerDown = (event) => {
    const pointerId = Number(event?.pointerId);
    pointerRef.current = {
      id: Number.isFinite(pointerId) ? pointerId : null,
      startClientX: Number(event?.clientX || 0),
      startClientY: Number(event?.clientY || 0),
      startX: dragState.x,
      startY: dragState.y,
    };
    try {
      if (pointerRef.current.id !== null) {
        toyRef.current?.setPointerCapture?.(pointerRef.current.id);
      }
    } catch {
      // Ignore pointer capture issues.
    }
    setDragState((prev) => ({ ...prev, dragging: true }));
    triggerSqueak({
      x: Number(event?.clientX || 0),
      y: Number(event?.clientY || 0),
      source: "tap",
    });
  };

  const handlePointerMove = (event) => {
    const pointerId = Number(event?.pointerId);
    if (
      pointerRef.current.id === null ||
      !Number.isFinite(pointerId) ||
      pointerId !== pointerRef.current.id
    ) {
      return;
    }
    setDragState((prev) => ({
      ...prev,
      x:
        pointerRef.current.startX +
        (Number(event?.clientX || 0) - pointerRef.current.startClientX),
      y:
        pointerRef.current.startY +
        (Number(event?.clientY || 0) - pointerRef.current.startClientY),
    }));
  };

  const normalizedType = String(itemType || "toy").toLowerCase();
  const isFoodItem = normalizedType === "food";
  const defaultTitle = isFoodItem
    ? "Food: drag and drop on pup to feed"
    : "Toy: drag and drop to play";
  const dragTitle = String(title || "").trim() || defaultTitle;

  return (
    <div
      ref={toyRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={(event) => finishDrag(event, "drop")}
      onPointerCancel={(event) => finishDrag(event, "cancel")}
      data-doggerz-ignore-swipe="true"
      data-doggerz-drag-item={normalizedType}
      className={`dz-dog-orb ${isFoodItem ? "dz-dog-orb--food" : "dz-dog-orb--toy"} ${
        isSqueaking ? "brightness-110" : ""
      } ${className}`}
      style={{
        touchAction: "none",
        transform: `translate3d(${dragState.x}px, ${dragState.y}px, 0) scale(${
          dragState.dragging ? 1.08 : isSqueaking ? 0.92 : 1
        })`,
        transition: dragState.dragging ? "none" : "transform 120ms ease-out",
        ...style,
      }}
      title={dragTitle}
    >
      {isFoodItem ? (
        <span className="pointer-events-none text-xl leading-none">🍖</span>
      ) : (
        <>
          <span
            className="pointer-events-none absolute h-6 w-6 rounded-full border-2 border-white/80"
            style={{ transform: "translateX(-35%)" }}
          />
          <span
            className="pointer-events-none absolute h-6 w-6 rounded-full border-2 border-white/80"
            style={{ transform: "translateX(35%)" }}
          />
        </>
      )}
    </div>
  );
}

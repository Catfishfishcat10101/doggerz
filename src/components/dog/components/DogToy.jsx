// src/components/dog/components/DogToy.jsx
import { useEffect, useRef, useState } from "react";

const DRAG_START_THRESHOLD_PX = 10;

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
    moved: false,
  });

  useEffect(() => {
    return () => {
      if (squeakResetRef.current) {
        window.clearTimeout(squeakResetRef.current);
      }
    };
  }, []);

  const pulseSqueak = () => {
    setIsSqueaking(true);
    if (squeakResetRef.current) {
      window.clearTimeout(squeakResetRef.current);
    }
    squeakResetRef.current = window.setTimeout(() => {
      setIsSqueaking(false);
      squeakResetRef.current = null;
    }, 180);
  };

  const emitInteraction = (payload) => {
    if (typeof onSqueak !== "function") return false;
    return onSqueak({ ...payload, itemType });
  };

  const resetDrag = () => {
    setDragState({ x: 0, y: 0, dragging: false });
    pointerRef.current = {
      id: null,
      startClientX: 0,
      startClientY: 0,
      startX: 0,
      startY: 0,
      moved: false,
    };
  };

  const finishPointer = (event, source = "drop") => {
    const pointerId = Number(event?.pointerId);
    if (
      pointerRef.current.id !== null &&
      Number.isFinite(pointerId) &&
      pointerId !== pointerRef.current.id
    ) {
      return;
    }

    try {
      if (pointerRef.current.id !== null) {
        toyRef.current?.releasePointerCapture?.(pointerRef.current.id);
      }
    } catch {
      // Ignore pointer capture release issues.
    }

    const wasDragging = pointerRef.current.moved;
    const clientX = Number(event?.clientX || 0);
    const clientY = Number(event?.clientY || 0);

    resetDrag();

    if (source === "cancel") {
      return;
    }

    if (wasDragging) {
      emitInteraction({
        x: clientX,
        y: clientY,
        source,
      });
      return;
    }

    emitInteraction({
      x: clientX,
      y: clientY,
      source: "tap",
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
      moved: false,
    };

    try {
      if (pointerRef.current.id !== null) {
        toyRef.current?.setPointerCapture?.(pointerRef.current.id);
      }
    } catch {
      // Ignore pointer capture issues.
    }

    pulseSqueak();
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

    const dx = Number(event?.clientX || 0) - pointerRef.current.startClientX;
    const dy = Number(event?.clientY || 0) - pointerRef.current.startClientY;
    const distance = Math.hypot(dx, dy);
    const moved = distance >= DRAG_START_THRESHOLD_PX;

    pointerRef.current.moved = pointerRef.current.moved || moved;

    setDragState({
      x: pointerRef.current.startX + dx,
      y: pointerRef.current.startY + dy,
      dragging: pointerRef.current.moved,
    });
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
      onPointerUp={(event) => finishPointer(event, "drop")}
      onPointerCancel={(event) => finishPointer(event, "cancel")}
      data-doggerz-ignore-swipe="true"
      data-doggerz-drag-item={normalizedType}
      className={`dz-dog-orb ${isFoodItem ? "dz-dog-orb--food" : "dz-dog-orb--toy"} ${
        isSqueaking ? "brightness-110" : ""
      } ${className}`}
      style={{
        touchAction: "none",
        transform: `translate3d(${dragState.x}px, ${dragState.y}px, 0) scale(${dragState.dragging ? 1.08 : isSqueaking ? 0.92 : 1})`,
        transition: dragState.dragging ? "none" : "transform 140ms ease-out",
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

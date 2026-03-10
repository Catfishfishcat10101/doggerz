import { useEffect, useRef, useState } from "react";

export default function Tooltip({
  content,
  children,
  side = "top",
  className = "",
  disabled = false,
  touchHoldMs = 360,
  touchVisibleMs = 1400,
}) {
  const message = String(content || "").trim();
  const [touchOpen, setTouchOpen] = useState(false);
  const holdTimeoutRef = useRef(null);
  const hideTimeoutRef = useRef(null);

  const clearTimers = () => {
    if (holdTimeoutRef.current) {
      clearTimeout(holdTimeoutRef.current);
      holdTimeoutRef.current = null;
    }
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
  };

  useEffect(() => () => clearTimers(), []);

  if (!message || disabled) {
    return children;
  }

  const openOnTouch = () => {
    clearTimers();
    setTouchOpen(true);
    hideTimeoutRef.current = setTimeout(() => {
      setTouchOpen(false);
      hideTimeoutRef.current = null;
    }, touchVisibleMs);
  };

  const handlePointerDown = (event) => {
    if (event?.pointerType !== "touch") return;
    clearTimers();
    holdTimeoutRef.current = setTimeout(() => {
      openOnTouch();
      holdTimeoutRef.current = null;
    }, touchHoldMs);
  };

  const handlePointerRelease = (event) => {
    if (event?.pointerType !== "touch") return;
    if (holdTimeoutRef.current) {
      clearTimeout(holdTimeoutRef.current);
      holdTimeoutRef.current = null;
    }
  };

  const bubblePosClass =
    side === "bottom" ? "top-full mt-2" : "bottom-full mb-2";

  return (
    <span
      className={`group/tooltip relative inline-flex ${className}`}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerRelease}
      onPointerCancel={handlePointerRelease}
      onPointerLeave={handlePointerRelease}
      title={message}
    >
      {children}
      <span
        role="tooltip"
        className={`pointer-events-none absolute left-1/2 z-[90] max-w-[220px] -translate-x-1/2 whitespace-normal rounded-lg border border-white/20 bg-zinc-950/95 px-2.5 py-1.5 text-[11px] font-semibold leading-snug text-zinc-100 shadow-[0_10px_26px_rgba(0,0,0,0.5)] ${bubblePosClass} ${
          touchOpen
            ? "block"
            : "hidden group-hover/tooltip:block group-focus-within/tooltip:block"
        }`}
      >
        {message}
      </span>
    </span>
  );
}

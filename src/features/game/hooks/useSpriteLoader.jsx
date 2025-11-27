import { useEffect, useMemo, useState } from "react";
import { useToast } from "@/components/ToastProvider.jsx";

export default function useSpriteLoader(spriteSrc, cleanlinessTier) {
  const toast = useToast();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);

  const inferredStage = useMemo(() => {
    try {
      const src = spriteSrc || "";
      if (src.includes("puppy")) return "puppy";
      if (src.includes("adult")) return "adult";
      if (src.includes("senior")) return "senior";
      return "puppy";
    } catch (e) {
      return "puppy";
    }
  }, [spriteSrc]);

  const lqipDataUrl = useMemo(() => {
    const baseColor =
      inferredStage === "puppy"
        ? "#F1D2B0"
        : inferredStage === "adult"
          ? "#E3B97D"
          : "#DCC3A0";
    const grime =
      cleanlinessTier === "DIRTY"
        ? "rgba(67,20,7,0.18)"
        : cleanlinessTier === "FLEAS"
          ? "rgba(0,0,0,0.12)"
          : cleanlinessTier === "MANGE"
            ? "rgba(255,255,255,0.14)"
            : "rgba(0,0,0,0)";
    const svg = `<?xml version="1.0" encoding="UTF-8"?><svg xmlns='http://www.w3.org/2000/svg' width='64' height='64' viewBox='0 0 64 64'><rect width='64' height='64' fill='${baseColor}'/><circle cx='20' cy='28' r='10' fill='#4B3420' opacity='0.14'/><circle cx='44' cy='28' r='6' fill='#111'/><rect x='18' y='42' width='28' height='6' rx='3' fill='${grime}'/></svg>`;
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  }, [inferredStage, cleanlinessTier]);

  useEffect(() => {
    setImageLoaded(false);
    setImageFailed(false);
    if (!spriteSrc) return;
    const img = new Image();
    img.onload = () => setImageLoaded(true);
    img.onerror = () => {
      setImageFailed(true);
      try {
        toast.add("Failed to load dog sprite");
      } catch (e) {
        // ignore
      }
    };
    img.src = spriteSrc;
    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [spriteSrc]);

  return {
    imageLoaded,
    imageFailed,
    inferredStage,
    lqipDataUrl,
  };
}

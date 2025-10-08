// src/components/ads/AdSlot.jsx
import React, { useEffect, useRef } from "react";
import { ENABLED, PROVIDER } from "@/config/ads.js";
import { DEV, PROD, v } from "@/config/env.js";
import { loadAdSense, fillAd, resolveUnit } from "@/lib/ads/adsense.js";

/**
 * <AdSlot type="banner" className="my-6" />
 * Safe by default:
 *  - Dev: shows a wireframe placeholder
 *  - Prod + ENABLED=1 + PROVIDER=adsense: renders adsbygoogle
 *  - Otherwise: renders null
 */
export default function AdSlot({ type = "banner", className = "", test = false }) {
  const ref = useRef(null);

  // Dev UX: show a visible placeholder unless explicitly hidden
  const devPlaceholder = DEV && !test ? (
    <div
      className={`grid place-items-center rounded-xl border border-white/15 bg-white/[0.03] text-white/60 text-xs ${className}`}
      style={{ minHeight: 60 }}
      aria-label="Ad placeholder (dev)"
      role="img"
    >
      AD SLOT: {type}
    </div>
  ) : null;

  // Short-circuit when ads are off
  if (!ENABLED && !DEV) return null;

  // Only provider we wire by default is AdSense (others plug here later)
  if (PROVIDER !== "adsense") {
    return DEV ? devPlaceholder : null;
  }

  const client = v("ADSENSE_CLIENT", ""); // e.g., ca-pub-XXXXXXXXXXXXXXXX
  const slot = resolveUnit(type);

  useEffect(() => {
    if (!ref.current) return;
    if (!PROD || !ENABLED || !client || !slot) return;

    let alive = true;
    loadAdSense(client)
      .then(() => alive && fillAd(ref.current))
      .catch(() => { /* swallow */ });

    return () => { alive = false; };
  }, [client, slot]);

  // Dev fallback
  if (DEV) return devPlaceholder;

  // Hard fail-safes in prod: if misconfigured, render nothing
  if (!client || !slot) return null;

  // Render Google slot markup
  return (
    <ins
      ref={ref}
      className={`adsbygoogle block ${className}`}
      style={{ display: "block", minHeight: 60 }}
      data-ad-client={client}
      data-ad-slot={slot}
      data-ad-format="auto"
      data-full-width-responsive="true"
    />
  );
}
// src/config/constants.js
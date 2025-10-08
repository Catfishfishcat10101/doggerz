import React, { useEffect, useRef } from "react";
import { ENABLED, PROVIDER } from "@/config/ads.js";
import { DEV, PROD, v } from "@/config/env.js";
import { loadAdSense, fillAd, resolveUnit } from "@/lib/ads/adsense.js";

export default function AdSlot({ type = "banner", className = "", test = false }) {
  const ref = useRef(null);
  const devPlaceholder = DEV && !test ? (
    <div className={`grid place-items-center rounded-xl border border-white/15 bg-white/[0.03] text-white/60 text-xs ${className}`} style={{ minHeight: 60 }}>
      AD SLOT: {type}
    </div>
  ) : null;

  if (!ENABLED && !DEV) return null;
  if (PROVIDER !== "adsense") return DEV ? devPlaceholder : null;

  const client = v("ADSENSE_CLIENT", "");
  const slot = resolveUnit(type);

  useEffect(() => {
    if (!ref.current) return;
    if (!PROD || !ENABLED || !client || !slot) return;
    let alive = true;
    loadAdSense(client).then(() => alive && fillAd(ref.current)).catch(()=>{});
    return () => { alive = false; };
  }, [client, slot]);

  if (DEV) return devPlaceholder;
  if (!client || !slot) return null;

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

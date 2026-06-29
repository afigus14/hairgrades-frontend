// src/lib/useAdTracking.js
import { useEffect, useRef } from "react";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "";

console.log("API_BASE =", API_BASE);

export function useAdImpression({
  enabled = true,
  payload, // { placement, advertiserId, campaignId, creativeId, page, route, stylistId, ref }
}) {
  const sentRef = useRef(false);
  const elRef = useRef(null);

  useEffect(() => {
    if (!enabled) return;
    if (!payload?.placement || !payload?.advertiserId || !payload?.campaignId) return;
    if (sentRef.current) return;
    const el = elRef.current;
    if (!el) return;

    const obs = new IntersectionObserver(
      async (entries) => {
        const isVisible = entries.some((e) => e.isIntersecting);
        if (!isVisible) return;
        if (sentRef.current) return;

        sentRef.current = true;

        try {
          await fetch(`${API_BASE}/api/ads/track`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ event: "impression", ...payload }),
          });
        } catch {
          // silent: analytics should never break UX
        }
        obs.disconnect();
      },
      { threshold: 0.4 }
    );

    obs.observe(el);

    return () => obs.disconnect();
  }, [enabled, payload]);

  return elRef;
}

export async function trackAdClick(payload) {
  if (!payload?.placement || !payload?.advertiserId || !payload?.campaignId) return;
  try {
    await fetch(`${API_BASE}/api/ads/track`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event: "click", ...payload }),
    });
  } catch {
    // silent
  }
}

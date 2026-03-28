// src/components/AdRailLeft.jsx
import React, { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAdImpression, trackAdClick } from "../lib/useAdTracking";

export default function AdRailLeft({
  page = "search",
  stylistId = "",
  enabled = true,
  compact = false, // ✅ NEW
  variant = "A",   // ✅ NEW (lets you vary content per slot)
}) {
  const loc = useLocation();
  const navigate = useNavigate();

  // Replace later with real advertiser inventory from backend
  const ad = useMemo(() => {
    // You can vary creative by slot so A/B/C aren’t identical
    const common = {
      advertiserId: "salon_001",
      campaignId: "launch_feb",
      creativeId: `left_${String(variant).toLowerCase()}`,
      headline: "Salon Partners Wanted",
      body:
        "Advertise next to top stylists in your area and reach clients who are ready to book.",
      cta: "Learn more",
      sponsorUrl: "", // Step 3 destination later
      imageUrl:
        "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=900&q=60",
      disclaimer: "Sponsored placement",
      badge: "Local partners",
    };

    if (variant === "B") {
      return {
        ...common,
        headline: "Be the go-to salon in your city",
        body:
          "Claim a premium placement beside searches in your metro area. Simple monthly sponsorships.",
        badge: "City sponsor",
      };
    }

    if (variant === "C") {
      return {
        ...common,
        headline: "Promote a seasonal offer",
        body:
          "Highlight specials, events, or new services while clients are actively choosing who to contact.",
        badge: "Limited spots",
      };
    }

    return common;
  }, [variant]);

  const payload = {
    placement: "rail_left",
    advertiserId: ad.advertiserId,
    campaignId: ad.campaignId,
    creativeId: ad.creativeId,
    page,
    route: loc.pathname,
    stylistId,
    ref: `left_rail_${variant}`,
  };

  const refEl = useAdImpression({ enabled, payload });

  function handleCtaClick(e) {
    e.preventDefault();
    trackAdClick(payload);

    // Step 1: route to Advertise page with context
    const params = new URLSearchParams({
      src: "rail_left",
      slot: String(variant),
      ad: ad.advertiserId || ad.creativeId || "unknown",
    });

    if (ad.sponsorUrl) params.set("to", ad.sponsorUrl);

    navigate(`/advertise?${params.toString()}`);
  }

  return (
    <aside
      ref={refEl}
      aria-label="Sponsored content"
      className={[
        "w-full",
        "rounded-3xl border border-[#D9E2EC] bg-white shadow-sm overflow-hidden",
      ].join(" ")}
    >
      {/* Top bar */}
      <div
        className={[
          "flex items-center justify-between border-b border-[#EDF2F7] bg-[#F8FAFC]",
          compact ? "px-4 py-3" : "px-5 py-4",
        ].join(" ")}
      >
        <div className="text-[11px] uppercase tracking-wide text-[#52606D]">
          Sponsored
        </div>
        <div className="text-[11px] text-[#7B8794]">{page}</div>
      </div>

      {/* Creative */}
      {ad.imageUrl ? (
        <div className="relative aspect-[16/9] bg-[#F0F4F8]">
          <img
            src={ad.imageUrl}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-black/0 to-black/0" />

          {ad.badge ? (
            <div className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-[11px] font-semibold text-[#102A43] shadow">
              {ad.badge}
            </div>
          ) : null}
        </div>
      ) : null}

      {/* Copy */}
      <div className={compact ? "p-4" : "p-5"}>
        <div
          className={[
            "font-semibold text-[#102A43] leading-snug",
            compact ? "text-base" : "text-lg",
          ].join(" ")}
        >
          {ad.headline}
        </div>

        <p
          className={[
            "mt-2 text-sm text-[#52606D] leading-relaxed",
            "line-clamp-2", // ✅ keeps it short
          ].join(" ")}
        >
          {ad.body}
        </p>

        <a
          href="/advertise"
          onClick={handleCtaClick}
          className={[
            "inline-flex w-full items-center justify-center font-semibold",
            compact ? "mt-4 rounded-2xl px-4 py-2.5 text-sm" : "mt-5 rounded-2xl px-4 py-3 text-sm",
            "bg-black text-white hover:opacity-90",
          ].join(" ")}
        >
          {ad.cta}
        </a>

        <div className="mt-3 text-[11px] text-[#7B8794]">
          {ad.disclaimer || "Sponsored"}
        </div>
      </div>

      {/* Bottom “extra” block (removed in compact mode) */}
      {!compact ? (
        <div className="px-5 pb-5">
          <div className="rounded-2xl border border-[#EDF2F7] bg-[#F8FAFC] p-4">
            <div className="text-xs font-semibold text-[#102A43]">
              Want visibility in your city?
            </div>
            <div className="mt-1 text-xs text-[#52606D]">
              Featured placements + category sponsorships available.
            </div>
          </div>
        </div>
      ) : null}
    </aside>
  );
}

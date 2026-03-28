// src/components/AdRailRight.jsx
import React, { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAdImpression, trackAdClick } from "../lib/useAdTracking";

export default function AdRailRight({
  page = "search",
  stylistId = "",
  enabled = true,
  compact = false, // ✅ NEW
  variant = "A",   // ✅ NEW
}) {
  const loc = useLocation();
  const navigate = useNavigate();

  const ad = useMemo(() => {
    const common = {
      advertiserId: "brand_001",
      campaignId: "premium_products",
      creativeId: `right_${String(variant).toLowerCase()}`,
      headline: "Pro Haircare for Pros",
      body: "Premium products + partner-ready offers designed for working stylists.",
      cta: "See offers",
      sponsorUrl: "",
      imageUrl:
        "https://images.unsplash.com/photo-1527799820374-dcf8d9d4a389?auto=format&fit=crop&w=900&q=60",
      disclaimer: "Sponsored placement",
      badge: "Partner offer",
      tag: "For professionals",
    };

    if (variant === "B") {
      return {
        ...common,
        headline: "Education + tools that pay off",
        body:
          "Sponsor a category and reach clients looking for specific services—right at decision time.",
        badge: "Category sponsor",
      };
    }

    if (variant === "C") {
      return {
        ...common,
        headline: "Launch your next product",
        body:
          "High-visibility placements beside search results. Track clicks and performance over time.",
        badge: "Limited run",
      };
    }

    return common;
  }, [variant]);

  const payload = {
    placement: "rail_right",
    advertiserId: ad.advertiserId,
    campaignId: ad.campaignId,
    creativeId: ad.creativeId,
    page,
    route: loc.pathname,
    stylistId,
    ref: `right_rail_${variant}`,
  };

  const refEl = useAdImpression({ enabled, payload });

  function handleCtaClick(e) {
    e.preventDefault();
    trackAdClick(payload);

    const params = new URLSearchParams({
      src: "rail_right",
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
      <div
        className={[
          "flex items-center justify-between border-b border-[#EDF2F7] bg-[#F8FAFC]",
          compact ? "px-4 py-3" : "px-5 py-4",
        ].join(" ")}
      >
        <div className="text-[11px] uppercase tracking-wide text-[#52606D]">
          Sponsored
        </div>
        <div className="text-[11px] text-[#52606D]">
          {ad.tag ? ad.tag : page}
        </div>
      </div>

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

      <div className={compact ? "p-4" : "p-5"}>
        <div
          className={[
            "font-semibold text-[#102A43] leading-snug",
            compact ? "text-base" : "text-lg",
          ].join(" ")}
        >
          {ad.headline}
        </div>

        <p className="mt-2 text-sm text-[#52606D] leading-relaxed line-clamp-2">
          {ad.body}
        </p>

        <a
          href="/advertise"
          onClick={handleCtaClick}
          className={[
            "inline-flex w-full items-center justify-center font-semibold",
            compact
              ? "mt-4 rounded-2xl px-4 py-2.5 text-sm"
              : "mt-5 rounded-2xl px-4 py-3 text-sm",
            "border border-[#D9E2EC] bg-white text-[#102A43] hover:bg-[#F0F4F8]",
          ].join(" ")}
        >
          {ad.cta}
        </a>

        <div className="mt-3 text-[11px] text-[#7B8794]">
          {ad.disclaimer || "Sponsored"}
        </div>
      </div>

      {!compact ? (
        <div className="px-5 pb-5">
          <div className="rounded-2xl border border-[#EDF2F7] bg-[#F8FAFC] p-4">
            <div className="text-xs font-semibold text-[#102A43]">
              Sponsor a category
            </div>
            <div className="mt-1 text-xs text-[#52606D]">
              e.g. “Balayage” or “Curly Hair” — claim exclusive placement.
            </div>
          </div>
        </div>
      ) : null}
    </aside>
  );
}

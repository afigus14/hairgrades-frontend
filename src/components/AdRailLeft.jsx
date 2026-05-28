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
      advertiserId: "manearbor_001",
      campaignId: "beauty_partner",
      creativeId: `left_${String(variant).toLowerCase()}`,
      headline: "Luxury Hair Extensions + Salon Services",
      body:
        "The Mane Arbor blends elevated color, extensions, and modern salon artistry into a luxury beauty experience.",
      cta: "View on Instagram",
      sponsorUrl: "https://www.instagram.com/themanearbor/",
      imageUrl: "/assets/sponsors/mane-arbor.jpg",
      disclaimer: "Sponsored placement",
      badge: "Beauty Partner",
      brand: "The Mane Arbor"
    };
    
    if (variant === "B") {
      return {
        ...common,
        advertiserId: "onu_001",
        headline: "Design Spaces That Shape Human Experience",
        body:
          "Explore Olivet Nazarene University's Interior Design program where creativity, functionality, and human-centered environments come together.",
        cta: "Explore the Program",
        sponsorUrl:
          "https://www.olivet.edu/area-study/interior-design-major-minor/",
        imageUrl: "/assets/sponsors/onu-design.jpg",
        badge: "Creative Partner",
        brand: "ONU Interior & Architectural Design"
      };
    }

    if (variant === "D") {
      return {
        advertiserId: "open_slot_001",
        campaignId: "open_inventory",
        creativeId: "placeholder_d",
        label: "Featured Opportunity",
        brand: "Your Brand Here",
        sponsorUrl: "mailto:advertise@stylegrades.com?subject=Stylegrades Sponsorship Inquiry",
        headline: "Reach clients actively searching for stylists",
        body:
          "Promote your salon, beauty brand, education program, or local business directly beside stylist search results.",
        cta: "Advertise with Stylegrades",
        imageUrl: "/assets/sponsors/advertise-placeholder.jpg",
        disclaimer: "Premium sponsor placement available",
      };
    }

    if (variant === "GENERIC2") {
      return {
        advertiserId: "generic_002",
        campaignId: "open_inventory",
        creativeId: "placeholder_generic2",
        label: "Available",
        brand: "Feature Your Business",
        sponsorUrl:
          "mailto:advertise@stylegrades.com?subject=Stylegrades Sponsorship Inquiry",
        headline: "Promote your business on Stylegrades",
        body:
          "Reach clients actively searching for stylists, salons, beauty products, education, and local services.",
        cta: "Advertise with Stylegrades",
        imageUrl: "/assets/sponsors/advertise-placeholder.jpg",
        disclaimer: "Premium sponsor placement available",
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

    if (
      ad.sponsorUrl.startsWith("http") ||
      ad.sponsorUrl.startsWith("mailto:")
    ) {
      window.open(ad.sponsorUrl, "_blank");
    } else {
      navigate(ad.sponsorUrl);
    }
  }  

  return (
    <aside
      ref={refEl}
      aria-label="Sponsored content"
      className={[
        "w-full min-h-[365px]",
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
        <div className="relative aspect-[16/7] bg-[#F0F4F8]">
          <img
            src={ad.imageUrl}
            alt=""
            className="absolute inset-0 h-full w-full object-cover object-center"
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

        <div className="text-lg font-bold text-[#102A43] leading-tight">
          {ad.brand}
        </div>

        <div
          className={[
            "mt-1 text-sm text-[#52606D] leading-snug",
            compact ? "text-base" : "text-lg",
          ].join(" ")}
        >
          {ad.headline}
        </div>

        <p
          className={[
            "mt-2 text-sm text-[#52606D] leading-relaxed",
            "line-clamp-2",
          ].join(" ")}
        >
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
            "bg-black text-white hover:opacity-90",
          ].join(" ")}
        >
          {ad.cta}
        </a>

        <div className="mt-3 text-[11px] text-[#7B8794]">
          {ad.disclaimer || "Sponsored"}
        </div>

      </div>

    </aside>
  );
}

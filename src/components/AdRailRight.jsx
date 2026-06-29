// src/components/AdRailRight.jsx
import React, { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAdImpression, trackAdClick } from "../lib/useAdTracking";

export default function AdRailRight({
  page = "search",
  stylistId = "",
  enabled = true,
  compact = false,
  variant = "A",
  advertiser = null,
}) {
  const loc = useLocation();
  const navigate = useNavigate();

  const ad = useMemo(() => {
    const slot = advertiser;

    if (slot?.type === "advertiser") {

      const advertiserData = slot.item;

      return {
        advertiserId: advertiserData.id,
        campaignId: "database_ad",
        creativeId: advertiserData.id,

        brand:
          advertiserData.brand_name ||
          advertiserData.company_name,

        headline:
          advertiserData.headline ||
          advertiserData.company_name,

        body:
          advertiserData.body ||
          "Sponsored advertiser",

        cta:
          advertiserData.cta ||
          "Learn More",

        sponsorUrl:
          advertiserData.website,

        imageUrl:
          advertiserData.image_url,

        disclaimer:
          "Sponsored placement",

        badge:
          advertiserData.is_founding_partner
            ? "Founding Advertiser"
            : "Sponsor",
      };
    }

    if (slot?.type === "promo") {

      const promo = slot.item;

      return {
        advertiserId: promo.id,
        campaignId: "promo",
        creativeId: promo.id,

        brand: promo.brand,

        headline: promo.headline,

        body: promo.body,

        cta: promo.cta,

        sponsorUrl: promo.sponsorUrl,

        imageUrl: promo.imageUrl,

        disclaimer: "Sponsored placement",

        badge: promo.label,

        tag: "Advertise",
      };
    }
    const common = {
      advertiserId: "brand_001",
      campaignId: "premium_inventory",
      creativeId: `right_${String(variant).toLowerCase()}`,
      headline: "Premium Sponsor Placement",
      brand: "Reserved Sponsor Placement",
      body:
        "Reach beauty professionals and clients actively searching for stylists on Stylegrades.",
      cta: "",
      sponsorUrl: "",
      imageUrl: "/assets/sponsors/advertise-placeholder.jpg",
      disclaimer: "Sponsored placement",
      badge: "",
      tag: "Advertise",
    };

    if (variant === "A") {
      return {
        ...common,
        brand: "Featured Advertiser",
        headline:
          "Premium placement throughout Stylegrades",
        body:
          "Put your salon, beauty brand, education program, or local business in front of clients actively searching for stylists.",
        badge: "Premium Placement",
      };
    }

    if (variant === "ELEMENTS") {
      return {
        ...common,
        advertiserId: "elements_001",
        headline: "Luxury Salon & Spa Suites",
        body:
          "Upscale salon suites designed for beauty professionals who want independence, flexibility, and a premium client experience.",
        cta: "Explore Suites",
        sponsorUrl: "https://www.elementsssr.com/",
        badge: "Industry Partner",
        brand: "Elements Salon & Spa Suites",
        imageUrl: "/assets/sponsors/elements.jpg",
      };
    }

    if (variant === "B") {
      return {
        ...common,
        brand: "Local Market Sponsor",
        headline:
          "Own visibility in your local market",
        body:
          "Reach clients searching for stylists in your city and surrounding communities.",
        badge: "Local Targeting",
      };
    }

    if (variant === "C") {
      return {
        ...common,
        brand: "Category Sponsor",
        headline:
          "Sponsor a beauty specialty category",
        body:
          "Extensions, color, bridal, barbers, curly hair, skincare, education, and more.",
        badge: "Category Sponsor",
      };
    }

    return common;
  }, [variant, advertiser]);

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

    if (ad.sponsorUrl) {
      window.open(ad.sponsorUrl, "_blank");
    } else {
      navigate(`/advertise?${params.toString()}`);
    }
  }

  return (
    <aside
      ref={refEl}
      aria-label="Sponsored content"
      className={[
        "w-full min-h-[360px]",
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
        <div className="relative aspect-[16/7] bg-[#F0F4F8]">
          <img
            src={ad.imageUrl}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-black/0 to-black/0" />

        </div>
      ) : null}

      <div className={compact ? "p-4" : "p-5"}>
        <div className="text-lg font-bold text-[#102A43] leading-tight">
          {ad.brand || "Reserved Sponsor Placement"}
        </div>

        <div className="mt-1 text-sm text-[#52606D] leading-snug">
          {ad.headline}
        </div>

        <p className="mt-2 text-sm text-[#52606D] leading-snug line-clamp-2">
          {ad.body}
        </p>

        <a
          href={ad.sponsorUrl || "#"}
          onClick={handleCtaClick}
          className="mt-4 inline-flex w-full items-center justify-center rounded-2xl border border-[#D9E2EC] bg-white px-4 py-2.5 text-sm font-semibold text-[#102A43] hover:bg-[#F0F4F8]"
        >
          {ad.cta || "Learn More"}
        </a>

        <div className="mt-2 text-[11px] text-[#7B8794]">
          {ad.disclaimer || "Sponsored"}
        </div>
      </div>

    </aside>
  );
}

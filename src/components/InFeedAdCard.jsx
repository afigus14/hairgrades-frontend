// src/components/InFeedAdCard.jsx
import React, { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAdImpression, trackAdClick } from "../lib/useAdTracking";

export default function InFeedAdCard({
  page = "search",
  enabled = true,
  slot = "A", // A/B/C variations
  compact = true,
}) {
  const loc = useLocation();
  const navigate = useNavigate();

  const ad = useMemo(() => {

    // HERO SPONSOR — THE MIC BIKE
    if (slot === "A") {
      return {
        advertiserId: "micbike_001",
        campaignId: "hero_sponsor",
        creativeId: "micbike_a",
        label: "Featured Sponsor",
        headline: "The Mic Bike - Palm Springs' Original Karaoke Party Bike",
        body:
          "Private rides, birthdays, bachelorettes, and unforgettable nights out - The Mic Bike brings karaoke and downtown Palm Springs together in one rolling party experience.",
        cta: "Book Your Ride",
        sponsorUrl: "https://www.themicbike.com/",
        imageUrl: "/assets/sponsors/micbike.jpg",
      };
    }

    // THE MANE ARBOR
    if (slot === "B") {
      return {
        advertiserId: "manearbor_001",
        campaignId: "beauty_partner",
        creativeId: "manearbor_b",
        label: "Beauty Partner",
        headline: "Luxury Hair Extensions + Salon Services",
        body:
          "The Mane Arbor blends elevated color, extensions, and modern salon artistry into a luxury beauty experience designed to help clients feel confident and beautiful.",
        cta: "View on Instagram",
        sponsorUrl: "https://www.instagram.com/themanearbor/",
        imageUrl:
          "https://images.unsplash.com/photo-1522337660859-02fbefca4702?auto=format&fit=crop&w=1200&q=60",
      };
    }

    // ELEMENTS SALON SUITES
    return {
      advertiserId: "elements_001",
      campaignId: "industry_partner",
      creativeId: "elements_c",
      label: "Industry Partner",
      headline: "Luxury Salon & Spa Suites for Independent Professionals",
      body:
        "Elements Salon & Spa Suites offers upscale salon spaces designed for beauty professionals who want independence, flexibility, and a premium client experience.",
      cta: "Explore Suites",
      sponsorUrl: "https://www.elementsssr.com/",
      imageUrl:
        "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=1200&q=60",
    };

  }, [slot]);

  const payload = {
    placement: "in_feed",
    advertiserId: ad.advertiserId,
    campaignId: ad.campaignId,
    creativeId: ad.creativeId,
    page,
    route: loc.pathname,
    ref: `infeed_${slot}`,
  };

  const refEl = useAdImpression({ enabled, payload });

  function handleClick(e) {
    e.preventDefault();
    trackAdClick(payload);

    const params = new URLSearchParams({
      src: "in_feed",
      slot: String(slot),
      ad: ad.advertiserId || ad.creativeId || "unknown",
    });

    if (ad.sponsorUrl) params.set("to", ad.sponsorUrl);

    if (ad.sponsorUrl) {
      window.open(ad.sponsorUrl, "_blank", "noopener,noreferrer");
    } else {
      navigate(`/advertise?${params.toString()}`);
    }
  }

  return (
    <article
      ref={refEl}
      className={[
        slot === "A"
          ? "rounded-3xl border-2 border-[#0F172A] bg-white shadow-md overflow-hidden"
          : "rounded-3xl border border-[#D9E2EC] bg-white shadow-sm overflow-hidden",
        "w-full",
      ].join(" ")}
      aria-label="Sponsored in-feed card"
    >
      <div className={compact ? "p-4" : "p-5"}>
        <div className="flex items-center justify-between gap-3">
          <div className="text-[11px] uppercase tracking-wide text-[#52606D]">
            {ad.label}
          </div>
          <div className="text-[11px] text-[#7B8794]">{page}</div>
        </div>

        {ad.imageUrl ? (
          <div
            className={[
              "mt-3 overflow-hidden bg-[#F0F4F8]",
              slot === "A"
                ? "relative aspect-[21/10] rounded-2xl"
                : "relative aspect-[16/9] rounded-2xl",
            ].join(" ")}
          >
            <img
              src={ad.imageUrl}
              alt=""
              className={[
                "absolute inset-0 h-full w-full",
                slot === "A"
                  ? "object-contain bg-white"
                  : "object-contain bg-white",
              ].join(" ")}
              loading="lazy"
            />
          </div>
        ) : null}

        <div className="mt-3 font-semibold text-[#102A43] leading-snug text-base">
          {ad.headline}
        </div>
        <p className="mt-2 text-sm text-[#52606D] leading-relaxed line-clamp-2">
          {ad.body}
        </p>

        <a
          href="/advertise"
          onClick={handleClick}
          className="mt-4 inline-flex w-full items-center justify-center rounded-2xl bg-black px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90"
        >
          {ad.cta}
        </a>

        <div className="mt-3 text-[11px] text-[#7B8794]">
          Sponsored placement
        </div>
      </div>
    </article>
  );
}

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
    const common = {
      advertiserId: "infeed_001",
      campaignId: "launch_infeed",
      creativeId: `infeed_${String(slot).toLowerCase()}`,
      label: "Sponsored",
      headline: "Advertise with Stylegrades",
      body:
        "Put your salon or brand in front of clients who are actively searching for stylists.",
      cta: "Learn more",
      sponsorUrl: "", // Step 3 later
      imageUrl:
        "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1200&q=60",
    };

    if (slot === "B") {
      return {
        ...common,
        advertiserId: "infeed_002",
        creativeId: "infeed_b",
        headline: "Sponsor a specialty category",
        body:
          "Own a category like Balayage or Curly Hair and stand out while clients browse.",
        cta: "Sponsor a category",
        imageUrl:
          "https://images.unsplash.com/photo-1527799820374-dcf8d9d4a389?auto=format&fit=crop&w=1200&q=60",
      };
    }

    if (slot === "C") {
      return {
        ...common,
        advertiserId: "infeed_003",
        creativeId: "infeed_c",
        headline: "Feature your local offer",
        body:
          "Promote a limited-time deal or event in your city—right where decisions happen.",
        cta: "Request placement",
        imageUrl:
          "https://images.unsplash.com/photo-1522337660859-02fbefca4702?auto=format&fit=crop&w=1200&q=60",
      };
    }

    return common;
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

    navigate(`/advertise?${params.toString()}`);
  }

  return (
    <article
      ref={refEl}
      className={[
        "rounded-3xl border border-[#D9E2EC] bg-white shadow-sm overflow-hidden",
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
          <div className="mt-3 relative aspect-[16/9] rounded-2xl overflow-hidden bg-[#F0F4F8]">
            <img
              src={ad.imageUrl}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
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

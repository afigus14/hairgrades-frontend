// src/components/InlineSponsoredCard.jsx
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAdImpression, trackAdClick } from "../lib/useAdTracking";

export default function InlineSponsoredCard({
  page = "search",
  stylistId = "",
  enabled = true,
    ad = {
    advertiserId: "micbike_001",
    campaignId: "hero_sponsor",
    creativeId: "micbike_inline",
    headline: "Palm Springs’ Original Karaoke Party Bike",
    body:
      "Private rides, birthdays, bachelorettes, and unforgettable nights out—The Mic Bike brings karaoke and downtown Palm Springs together in one rolling party experience.",
    cta: "Book Your Ride",
    url: "https://www.themicbike.com/",
  },
}) {
  const loc = useLocation();
  const navigate = useNavigate();

  const payload = {
    placement: "inline_feed",
    advertiserId: ad.advertiserId,
    campaignId: ad.campaignId,
    creativeId: ad.creativeId,
    page,
    route: loc.pathname,
    stylistId,
    ref: "inline_feed",
  };

  const refEl = useAdImpression({ enabled, payload });

  function handleClick() {
    trackAdClick(payload);

    if (ad.url) {
      window.open(ad.url, "_blank", "noopener,noreferrer");
      return;
    }

    const params = new URLSearchParams({
      src: "inline_feed",
      ad: ad.advertiserId || ad.creativeId || "unknown",
    });

    navigate(`/advertise?${params.toString()}`);
  }

  return (
    <div
      ref={refEl}
      className="rounded-2xl border bg-white shadow-sm p-4"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[11px] uppercase tracking-wide text-gray-500">
            Sponsored
          </div>
          <div className="font-semibold text-gray-900">
            {ad.headline}
          </div>
          <div className="text-sm text-gray-600 mt-1">
            {ad.body}
          </div>
        </div>

        <button
          onClick={handleClick}
          className="shrink-0 px-3 py-2 rounded-lg bg-black text-white text-sm font-semibold hover:opacity-90"
        >
          {ad.cta}
        </button>
      </div>
    </div>
  );
}
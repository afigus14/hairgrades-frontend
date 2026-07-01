// src/components/InFeedAdCard.jsx
import React, { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAdImpression, trackAdClick } from "../lib/useAdTracking";
import { getInFeedAd } from "../lib/adManager";

export default function InFeedAdCard({
  page = "search",
  enabled = true,
  slot = "A",
  compact = true,
  advertiser = null,
}) {
  const loc = useLocation();
  const navigate = useNavigate();

  const ad = useMemo(() => {

    // Use the shared page inventory when available.
    if (advertiser) {
      if (advertiser.type === "advertiser") {
        const a = advertiser.item;

        return {
          advertiserId: a.id,

          brand:
            a.brand_name ||
            a.company_name,

          campaignId: "database_ad",
          creativeId: a.id,
          label: a.is_founding_partner
            ? "Founding Advertiser"
            : "Sponsored",
          headline: a.headline || a.company_name,
          body: a.body || "Sponsored advertiser",
          cta: a.cta || "Learn More",
          sponsorUrl: a.website,
          imageUrl: a.image_url,
        };
      }

      if (advertiser.type === "promo") {
        return advertiser.item;
      }
    }

    // Temporary fallback while we complete the migration.
    const index =
      slot === "A"
        ? 0
        : slot === "B"
        ? 1
        : 2;

    return getInFeedAd(index);

  }, [slot, advertiser]);

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

        <div className="mt-3 text-lg font-bold text-[#102A43]">
          {ad.brand}
        </div>

        <div className="mt-1 font-semibold text-[#52606D] leading-snug text-base">
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

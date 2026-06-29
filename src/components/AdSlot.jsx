import React from "react";

export default function AdSlot({ slot }) {
  if (!slot) return null;

  const ad = slot.item;

  return (
    <article className="rounded-3xl border border-[#D9E2EC] bg-white shadow-sm overflow-hidden">
      <div className="p-3">

        <div className="flex items-center justify-between text-[10px] uppercase tracking-wide text-[#7B8794]">
          <span>Sponsored</span>

          {slot.type === "promo" ? (
            <span>Stylegrades</span>
          ) : (
            <span>Advertiser</span>
          )}
        </div>

        {ad.imageUrl || ad.image_url ? (
          <div className="mt-2 overflow-hidden rounded-xl bg-[#F8FAFC]">
            <img
              src={ad.imageUrl || ad.image_url}
              alt={ad.headline || ad.company_name}
              className="w-full aspect-[16/9] object-cover"
            />
          </div>
        ) : null}

        <h3 className="mt-3 font-semibold text-[#102A43] leading-tight">
          {ad.headline || ad.company_name}
        </h3>

        <p className="mt-2 text-sm text-[#52606D] line-clamp-3">
          {ad.body}
        </p>

        <button
          className="mt-4 w-full rounded-xl bg-black text-white py-2 text-sm font-semibold"
        >
          {ad.cta || "Learn More"}
        </button>

        <div className="mt-3 text-[10px] text-[#9AA5B1]">
          Sponsored placement
        </div>

      </div>
    </article>
  );
}
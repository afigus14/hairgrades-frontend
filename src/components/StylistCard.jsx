// src/components/StylistCard.jsx
import React from "react";
import { Link, useNavigate } from "react-router-dom";

function formatMiles(m) {
  if (m == null || !Number.isFinite(m)) return null;
  return `${m.toFixed(1)} mi`;
}

function normalizeEmail(email) {
  const e = String(email || "").trim();
  if (!e) return "";
  return e;
}

function normalizeWebsite(url) {
  const u = String(url || "").trim();
  if (!u) return "";
  // Add https:// if missing
  if (/^https?:\/\//i.test(u)) return u;
  return `https://${u}`;
}

function normalizeInstagram(handleOrUrl) {
  const v = String(handleOrUrl || "").trim();
  if (!v) return "";

  // if already a URL
  if (/^https?:\/\//i.test(v)) return v;

  // if it's like @name or name
  const handle = v.startsWith("@") ? v.slice(1) : v;
  if (!handle) return "";
  return `https://instagram.com/${handle}`;
}

export default function StylistCard({
  stylist,
  distanceMiles,
  adminHints,
  onProfileClick,
  onContactClick,
}) {
  const navigate = useNavigate();

  const slug = stylist?.profileSlug || stylist?.slug || stylist?.id;
  const name = stylist?.name || stylist?.fullName || "Stylist";
  const city = stylist?.city || "";
  const state = stylist?.state || "";
  const specialty =
    stylist?.specialty ||
    (Array.isArray(stylist?.specialties) && stylist.specialties[0]) ||
    "Stylist";

  const salon = stylist?.salon_name || "";

  const photoUrl = stylist?.photo_url?.trim() || "";

  const miles = formatMiles(distanceMiles);

  // Contact sources (in priority order)
  const email = normalizeEmail(stylist?.email || stylist?.contactEmail);
  const website = normalizeWebsite(stylist?.website);
  const instagram = normalizeInstagram(stylist?.instagram);

  function handleContact(e) {
    // IMPORTANT: prevent the card's Link click
    e.preventDefault();
    e.stopPropagation();

    onContactClick?.(stylist);

    // 1) Email
    if (email) {
      window.location.href = `mailto:${email}?subject=${encodeURIComponent(
        "Stylegrades inquiry"
      )}`;
      return;
    }

    // 2) Website
    if (website) {
      window.open(website, "_blank", "noreferrer");
      return;
    }

    // 3) Instagram
    if (instagram) {
      window.open(instagram, "_blank", "noreferrer");
      return;
    }

    // 4) Fallback: your site contact page (so it never does “nothing”)
    navigate(
      `/contact?stylist=${encodeURIComponent(String(name))}&id=${encodeURIComponent(
        String(stylist?.id || "")
      )}`
    );
  }

  return (
    <div
      className={`relative rounded-xl border-[2px] shadow-sm p-4 transition ${
        stylist.tier_active === "premium"
          ? "bg-amber-50 border-amber-400 shadow-lg ring-2 ring-amber-200"
          : "bg-white border-[#2F3C4F]"
      }`}
    >
          
      {stylist.tier_active === "premium" && (
        <span className="absolute top-2 right-2 bg-amber-400 text-black text-xs font-semibold px-2 py-1 rounded">
          Premium
        </span>
      )}

      {stylist.tier_active === "pro" && (
        <span className="absolute top-2 right-2 bg-slate-700 text-white text-xs px-2 py-1 rounded font-semibold">
          Pro
        </span>
      )}

      {/* Whole card navigates to profile */}
      <Link
        to={`/profile/${encodeURIComponent(String(slug))}`}
        onClick={() => onProfileClick?.(stylist)}
        className="block"
      >
        {/* Image area: show full image (no crop) */}
        <div className="flex gap-4 p-6 pt-8">

          {/* IMAGE */}
          <div className="w-32 h-32 flex-shrink-0 overflow-hidden rounded-lg bg-[#F0F4F8]">
            {photoUrl ? (
              <img
                src={photoUrl}
                alt={name}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-sm text-[#52606D]">
                No photo
              </div>
            )}
          </div>

          {/* CONTENT */}
          <div className="flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              {/* NAME + VERIFIED */}
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold text-[#102A43]">
                  {name}
                </h3>

                {stylist.status === "approved" && stylist.verified && (
                  <span className="inline-flex items-center bg-emerald-50 text-emerald-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                    ✔ Verified
                  </span>
                )}
              </div>

              {/* RATING (OWN LINE) */}
              <div className="mt-1 text-sm font-medium">
                <span className="text-amber-600">
                  ★ {Number(stylist.rating || 0).toFixed(1)}
                </span>

                <span className="text-[#7B8794] ml-1">
                  ({stylist.review_count || 0} Reviews)
                </span>
              </div>
              <div className="text-sm text-[#52606D] truncate">
                {specialty}
              </div>

              {stylist?.featured ? (
                <span className="absolute top-2 left-2 z-10 text-xs font-semibold text-[#7C5E10] bg-[#FFF7E6] border border-[#FFE8B5] px-2 py-1 rounded-full shadow-sm">
                  ⭐ Featured
                </span>
              ) : null}

              {salon && (
                <div className="text-xs text-[#7B8794] truncate">
                  {salon}
                </div>
              )}

              <div className="text-xs text-[#7B8794] mt-1 truncate">
                {city}
                {state ? `, ${state}` : ""}
                {miles ? ` • ${miles}` : ""}
              </div>
            </div>
          </div>

          </div> {/* END CONTENT */}
        </div> {/* END FLEX ROW */}

        {adminHints ? (
          <div className="mt-3 text-[11px] text-[#7B8794]">
            <div>src: {stylist?.__src || "seed"}</div>
            <div>id: {String(stylist?.id)}</div>
            <div>email: {email || "(none)"}</div>
          </div>
        ) : null}

        {/* Footer */}
        <div className="mt-4">
          <button
            type="button"
            onClick={handleContact}
            className="w-full rounded-xl border border-[#D9E2EC] px-3 py-2 text-sm font-semibold text-[#102A43] hover:bg-[#F0F4F8]"
          >
            Contact
          </button>
        </div>
      </Link>
    </div>
  );
}

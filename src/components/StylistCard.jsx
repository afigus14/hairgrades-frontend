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

  const photoUrl =
    stylist?.photo_thumb_url ||
    stylist?.photoUrl ||
    stylist?.photo_url ||
    "";

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
      className={`relative rounded-xl border shadow-sm p-4 transition ${
        stylist.tier_active === "premium"
          ? "bg-amber-50 border-amber-400 shadow-lg ring-2 ring-amber-200"
          : "bg-white border-gray-200"
      }`}
    >
          
      {stylist.tier_active === "premium" && (
        <span className="absolute top-2 right-2 bg-amber-400 text-black text-xs font-semibold px-2 py-1 rounded">
          Premium
        </span>
      )}

      {stylist.tier_active === "pro" && (
        <span className="absolute top-2 left-2 bg-slate-700 text-white text-xs px-2 py-1 rounded font-semibold">
          Pro
        </span>
      )}

      {stylist.verified && (
        <span className="absolute bottom-2 right-2 bg-green-600 text-white text-xs font-semibold px-2 py-1 rounded">
          ✔ Verified
        </span>
      )}
      {/* Whole card navigates to profile */}
      <Link
        to={`/profile/${encodeURIComponent(String(slug))}`}
        onClick={() => onProfileClick?.(stylist)}
        className="block"
      >
        {/* Image area: show full image (no crop) */}
        <div className="bg-[#F0F4F8]">
          <div className="w-full aspect-[4/3] overflow-hidden bg-[#F0F4F8]">
            {photoUrl ? (
              <img
                src={photoUrl}
                alt={name}
                className="h-full w-full object-cover"
                loading="lazy"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-sm text-[#52606D]">
                No photo
              </div>
            )}
          </div>
        </div>

        <div className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-[#102A43]">{name}</h3>
              <div className="text-sm text-[#52606D] truncate">
                {specialty}
              </div>

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

            {stylist?.featured ? (
              <span className="shrink-0 text-xs font-semibold text-[#7C5E10] bg-[#FFF7E6] border border-[#FFE8B5] px-2 py-1 rounded-full">
                Featured
              </span>
            ) : null}
          </div>

          {adminHints ? (
            <div className="mt-3 text-[11px] text-[#7B8794]">
              <div>src: {stylist?.__src || "seed"}</div>
              <div>id: {String(stylist?.id)}</div>
              <div>email: {email || "(none)"}</div>
            </div>
          ) : null}
        </div>

        {/* Footer */}
        <div className="px-4 pb-4">
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

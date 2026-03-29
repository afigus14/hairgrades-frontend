// src/pages/SearchPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import StylistCard from "../components/StylistCard";
import InlineSponsoredCard from "../components/InlineSponsoredCard";
import InFeedAdCard from "../components/InFeedAdCard";
import { supabase } from "../lib/supabase";
import StylistMap from "../components/StylistMap";

// ---------- utils ----------
function safeArray(v) {
  return Array.isArray(v) ? v : [];
}

function normalizeStatus(s) {
  return String(s || "approved").toLowerCase();
}

function track(stylistId, event) {
  try {
    const payload = JSON.stringify({ stylistId: String(stylistId), event });
    const url = `${API_BASE}/api/analytics/track`;

    if (navigator.sendBeacon) {
      const blob = new Blob([payload], { type: "application/json" });
      navigator.sendBeacon(url, blob);
      return;
    }

    fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: payload,
      keepalive: true,
    }).catch(() => {});
  } catch {}
}

function distanceMiles(a, b) {
  const R = 3958.8;
  const toRad = (deg) => (deg * Math.PI) / 180;

  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) *
      Math.sin(dLng / 2) ** 2;

  return 2 * R * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

function normalizePriceTier(v) {
  const s = String(v || "").trim();
  if (!s) return "";
  if (/^\${1,4}$/.test(s)) return s;
  if (["1", "2", "3", "4"].includes(s)) return "$".repeat(Number(s));
  return s;
}

function priceTierFromCost(cost) {
  const n = Number(cost);
  if (!Number.isFinite(n)) return "";
  if (n <= 30) return "$";
  if (n <= 60) return "$$";
  if (n <= 90) return "$$$";
  return "$$$$";
}

function normalizePayments(stylist) {
  const raw = safeArray(stylist?.payments ?? stylist?.paymentMethods).map((x) =>
    String(x || "").trim().toLowerCase()
  );

  return raw
    .map((p) => {
      if (!p) return "";
      if (p.includes("apple")) return "applepay";
      if (p.includes("card") || p.includes("credit")) return "credit_cards";
      if (p.includes("cash")) return "cash_only";
      return p.replace(/\s+/g, "_");
    })
    .filter(Boolean);
}

function alphaName(stylist) {
  const full = String(stylist?.name || stylist?.fullName || "")
    .trim()
    .replace(/\s+/g, " ");

  if (!full) return "";

  const parts = full.split(" ");
  const last = parts.length > 1 ? parts[parts.length - 1] : parts[0];
  const firstMiddle = parts.length > 1 ? parts.slice(0, -1).join(" ") : "";

  return `${last}, ${firstMiddle}`.toLowerCase();
}

function FilterSelect({ label, value, onChange, options }) {
  return (
    <label className="inline-flex items-center gap-2">
      <span className="text-xs font-semibold text-[#243B53]">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-full border border-[#D9E2EC] bg-white px-3 py-2 text-sm text-[#102A43] shadow-sm focus:outline-none focus:ring-2 focus:ring-[#7A9D96]"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function stylistScore(stylist, userLocation) {

  let score = 0;

  // rating weight
  const rating = Number(stylist.rating || 0);
  score += rating * 20;

  // review count weight
  const reviews = Number(stylist.review_count || 0);
  score += Math.min(reviews * 2, 40);

  // profile completeness
  if (stylist.bio) score += 5;
  if (stylist.photo_url || stylist.photo_thumb_url) score += 5;
  if (Array.isArray(stylist.gallery) && stylist.gallery.length > 0) score += 5;

  // featured stylists
  if (stylist.featured) score += 25;

  // distance boost
  if (userLocation && stylist.distanceMiles) {
    score += Math.max(0, 15 - stylist.distanceMiles);
  }

  return score;
}

// ---------- COMPONENT ----------
export default function SearchPage() {
  const [allStylists, setAllStylists] = useState([]);

  const [term, setTerm] = useState("");
  const [location, setLocation] = useState("");
  const [radiusMiles, setRadiusMiles] = useState(25);
  const [userLocation, setUserLocation] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [minRating, setMinRating] = useState("any");
  const [specialtyFilter, setSpecialtyFilter] = useState("all");
  const [sortMode, setSortMode] = useState("featured");
  const [priceFilter, setPriceFilter] = useState("any");
  const [paymentFilter, setPaymentFilter] = useState("any");

  useEffect(() => {
  async function loadStylists() {
    try {
      const { data, error } = await supabase
        .from("stylists")
        .select("*")

      console.log("Stylists from Supabase:", data);
      console.log("Supabase URL:", import.meta.env.VITE_SUPABASE_URL);

      if (error) throw error;

      setAllStylists(
        safeArray(data).map((s) => ({
          ...s,
          name: s.full_name || s.name,
          slug: s.profile_slug || s.slug || s.id,   // ⭐ add this
          photoUrl: s.photo_url || s.photoUrl || s.photo,
          review_count: s.reviews_count,
          specialty: Array.isArray(s.specialties)
            ? s.specialties[0]
            : s.specialties
        }))
      );
    } catch (err) {
      console.error("Error loading stylists:", err);
      setError("Unable to load stylists.");
    }
  }

  loadStylists();
}, []);

  async function geocodeLocation(input) {
    const trimmed = input.trim();

    // ZIP CODE (keep your current logic)
    if (/^\d{5}$/.test(trimmed)) {
      const res = await fetch(`https://api.zippopotam.us/us/${trimmed}`);
      if (!res.ok) return null;

      const data = await res.json();
      const place = data?.places?.[0];
      if (!place) return null;

      return {
        lat: Number(place.latitude),
        lng: Number(place.longitude),
      };
    }

    // CITY / STATE (Google Geocoding)
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

    const res = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(trimmed)}&key=${apiKey}`
    );

    const data = await res.json();

    if (!data.results || data.results.length === 0) return null;

    return {
      lat: data.results[0].geometry.location.lat,
      lng: data.results[0].geometry.location.lng,
    };
  }

  async function handleSearch(e) {
    e?.preventDefault?.();
    setError("");
    setLoading(true);

    try {
      const loc = await geocodeLocation(location);
      if (!loc) {
        setError("Try a valid city, state, or ZIP code.");
        setUserLocation(null);
      } else {
        setUserLocation(loc);
      }
    } catch {
      setError("Location error.");
      setUserLocation(null);
    } finally {
      setLoading(false);
    }
  }

  function handleClear() {
    setTerm("");
    setLocation("");
    setRadiusMiles(25);
    setUserLocation(null);
    setError("");
    setMinRating("any");
    setSpecialtyFilter("all");
    setSortMode("featured");
    setPriceFilter("any");
    setPaymentFilter("any");
  }

  const specialtyOptions = useMemo(() => {
    const set = new Set();
    allStylists.forEach((s) => {
      if (s.specialty) set.add(String(s.specialty).trim());
      safeArray(s.specialties).forEach((x) => set.add(String(x).trim()));
    });

    return ["all", ...Array.from(set).sort()];
  }, [allStylists]);

  const stylists = useMemo(() => {
    let filtered = [...allStylists];

    const q = term.trim().toLowerCase();
    if (q) {
      filtered = filtered.filter((s) => {
        const name = (s.fullName || s.name || "").toLowerCase();
        const specialty = (s.specialty || "").toLowerCase();
        const specialties = safeArray(s.specialties).join(" ").toLowerCase();
        return (
          name.includes(q) ||
          specialty.includes(q) ||
          specialties.includes(q)
        );
      });
    }

    if (specialtyFilter !== "all") {
      const target = specialtyFilter.toLowerCase();
      filtered = filtered.filter((s) => {
        const primary = String(s.specialty || "").toLowerCase();
        const list = safeArray(s.specialties).map((x) =>
          String(x).toLowerCase()
        );
        return primary === target || list.includes(target);
      });
    }

    if (minRating !== "any") {
      const min = Number(minRating);
      filtered = filtered.filter((s) => {
        if (typeof s.rating !== "number") return true;
        return s.rating >= min;
      });
    }

    if (priceFilter !== "any") {
      filtered = filtered.filter((s) => {
        const tier =
          normalizePriceTier(s.priceTier) ||
          normalizePriceTier(s.price) ||
          normalizePriceTier(s.costTier) ||
          priceTierFromCost(s.cost);

        return tier === priceFilter;
      });
    }

    if (paymentFilter !== "any") {
      filtered = filtered.filter((s) => {
        const pmts = normalizePayments(s);
        return pmts.includes(paymentFilter);
      });
    }

    if (userLocation) {
      filtered = filtered
        .map((s) => {
          if (
            typeof s.lat === "number" &&
            typeof s.lng === "number"
          ) {
            return {
              ...s,
              distanceMiles: distanceMiles(userLocation, {
                lat: s.lat,
                lng: s.lng,
              }),
            };
          }
          return s;
        })
        .filter((s) => {
          if (s.distanceMiles == null) return true; // allow missing coords
          return s.distanceMiles <= radiusMiles;
        });
    }

    filtered.sort((a, b) => {

      if (sortMode === "rating") {
        return (b.rating || 0) - (a.rating || 0);
      }

      if (sortMode === "distance") {
        return (a.distanceMiles || 9999) - (b.distanceMiles || 9999);
      }

      const scoreA = stylistScore(a, userLocation);
      const scoreB = stylistScore(b, userLocation);

      return scoreB - scoreA;

    });

    // ----- tier ordering -----

    const premium = filtered.filter((s) => s.tier_active === "premium");
    const pro = filtered.filter((s) => s.tier_active === "pro");
    const free = filtered.filter((s) => !s.tier_active || s.tier_active === "free");

    // rotate premium stylists
    let rotatedPremium = [];

    if (premium.length > 0) {
      const rotateIndex =
        Math.floor(Date.now() / 1000 / 60) % premium.length;

      rotatedPremium = [
        ...premium.slice(rotateIndex),
        ...premium.slice(0, rotateIndex),
      ];
    }

    // final display order
    filtered = [...rotatedPremium, ...pro, ...free];
    
    return filtered;
  }, [
    allStylists,
    term,
    specialtyFilter,
    minRating,
    radiusMiles,
    userLocation,
    sortMode,
    priceFilter,
    paymentFilter,
  ]);

  const premiumStylists = stylists.filter(
    (s) => s.tier_active === "premium"
  );

  const gridItems = useMemo(() => {
    const items = [];
    const AD_EVERY = 8;

    stylists.forEach((stylist, i) => {
      items.push(
        <StylistCard
          key={`sty_${stylist.id}`}
          stylist={stylist}
          distanceMiles={stylist.distanceMiles ?? null}
          onProfileClick={(s) => track(s.id, "profile_click")}
          onContactClick={(s) => track(s.id, "contact_click")}
        />
      );

      if ((i + 1) % AD_EVERY === 0) {
        items.push(
          <InFeedAdCard
            key={`ad_${i}`}
            page="search"
            enabled
            compact
          />
        );
      }
    });

    return items;
  }, [stylists]);

  return (
    <div className="w-full min-w-0 pb-10">
      <div className="max-w-6xl mx-auto px-4">

      <header className="pt-4 pb-4">
        <h2 className="text-xl md:text-2xl lg:text-3xl font-serif text-[#102A43] leading-snug">
          Discover stylists you’ll love. Compare work, reviews, and book with confidence.
        </h2>
      </header>

      <div className="flex flex-wrap items-center gap-3 mb-6">
        <FilterSelect
          label="Rating"
          value={minRating}
          onChange={setMinRating}
          options={[
            { value: "any", label: "Any" },
            { value: "4.5", label: "4.5+ stars" },
            { value: "4", label: "4+ stars" },
            { value: "3.5", label: "3.5+ stars" },
          ]}
        />
        <FilterSelect
          label="Price"
          value={priceFilter}
          onChange={setPriceFilter}
          options={[
            { value: "any", label: "Any" },
            { value: "$", label: "$" },
            { value: "$$", label: "$$" },
            { value: "$$$", label: "$$$" },
            { value: "$$$$", label: "$$$$" },
          ]}
        />
        <FilterSelect
          label="Payment"
          value={paymentFilter}
          onChange={setPaymentFilter}
          options={[
            { value: "any", label: "Any" },
            { value: "credit_cards", label: "Credit cards" },
            { value: "applepay", label: "Apple Pay" },
            { value: "cash_only", label: "Cash only" },
          ]}
        />
        <FilterSelect
          label="Specialty"
          value={specialtyFilter}
          onChange={setSpecialtyFilter}
          options={specialtyOptions.map((s) => ({
            value: s,
            label: s === "all" ? "All" : s,
          }))}
        />
        <FilterSelect
          label="Sort"
          value={sortMode}
          onChange={setSortMode}
          options={[
            { value: "featured", label: "Featured" },
            { value: "rating", label: "Rating" },
            { value: "distance", label: "Distance" },
            { value: "alpha", label: "A → Z" },
          ]}
        />
      </div>
      <section className="w-full rounded-3xl border border-[#1F3A4D] bg-[#101A2A] px-6 py-8 shadow-lg mb-8">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-serif text-[#F7FAFF]">
            Find a stylist near you
          </h1>
          <p className="mt-2 text-sm md:text-base text-[#C7D5E2] max-w-3xl">
            Search by stylist name or specialty, and choose a location and radius to see stylists nearby.
          </p>
        </div>

        <form
          onSubmit={handleSearch}
          className="flex flex-col gap-4 md:grid md:grid-cols-[2fr_2fr_auto] md:items-end md:gap-6"
        >
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-[#C7D5E2] mb-1">
              Stylist or specialty
            </label>
            <input
              type="text"
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              placeholder="e.g. balayage, curly hair, or Ava Lee"
              className="w-full rounded-lg border border-[#30465B] bg-[#050B14] px-3 py-2 text-sm text-[#F7FAFF]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-[#C7D5E2] mb-1">
              Location
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Enter city, state, or ZIP code"
              className="w-full rounded-lg border border-[#30465B] bg-[#050B14] px-3 py-2 text-sm text-[#F7FAFF]"
            />
          <p className="mt-1 text-xs text-[#C7D5E2]">
            Example: Chicago, IL or 60614
          </p>
        </div>

          <div className="flex flex-col gap-3">
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={loading || !location.trim()}
                className="flex-1 rounded-lg bg-[#F4A731] px-4 py-2 text-sm font-semibold text-black"
              >
                {loading ? "Searching..." : "Search"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setTerm("");
                  setLocation("");
                  setRadiusMiles(25);
                  setUserLocation(null);
                  setError("");
                }}
                className="rounded-lg border border-[#30465B] px-4 py-2 text-sm font-medium text-[#C7D5E2]"
              >
                Clear
              </button>
            </div>

            <div>
              <div className="flex items-center justify-between text-[11px] text-[#C7D5E2] mb-1">
                <span>Radius</span>
                <span className="text-[#F7FAFF]">{radiusMiles} miles</span>
              </div>

              <input
                type="range"
                min={5}
                max={50}
                step={5}
                value={radiusMiles}
                onChange={(e) => setRadiusMiles(Number(e.target.value))}
                className="w-full accent-[#F4A731]"
              />
            </div>
          </div>
        </form>

        {error && (
          <p className="mt-3 text-xs text-[#F6B2B2] bg-[#251018] border border-[#5F1E2A] rounded-lg px-3 py-2">
            {error}
          </p>
        )}
      </section>
      <InlineSponsoredCard />

      <section className="mt-8">

        <StylistMap stylists={stylists} userLocation={userLocation} />

        {premiumStylists.length > 0 && (
          <div className="mb-10">
            <h3 className="text-xl font-semibold text-[#102A43] mb-1">
              ⭐ Featured Stylists
            </h3>

            <p className="text-sm text-gray-500 mb-4">
              Premium stylists highlighted for visibility.
            </p>

            <div className="grid gap-6 md:grid-cols-3">
              {premiumStylists.slice(0, 6).map((stylist) => (
                <StylistCard
                  key={`premium_${stylist.id}`}
                  stylist={stylist}
                  distanceMiles={stylist.distanceMiles ?? null}
                  onProfileClick={(s) => track(s.id, "profile_click")}
                  onContactClick={(s) => track(s.id, "contact_click")}
                />
              ))}
            </div>
          </div>
        )}
        
        {stylists.length === 0 ? (
          <p>No stylists found.</p>
        ) : (
          <div className="grid gap-6 [grid-template-columns:repeat(auto-fill,minmax(260px,1fr))]">
            {gridItems}
          </div>
        )}
      </section>
    </div>
   </div> 
  );
}
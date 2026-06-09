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

  // 💰 Tier boost (MAIN DRIVER)
  if (stylist.tier === "premium") score += 80;
  else if (stylist.tier === "pro") score += 50;
  else score += 10;

  // 🔥 Featured boost
  if (stylist.featured) score += 40;

  // ⭐ Verified boost
  if (stylist.verified) score += 25;

  // 🌟 Rating boost
  if (stylist.rating) {
    score += stylist.rating * 5;
  }

  // 📍 Distance boost (closer = higher)
  if (stylist.distanceMiles != null) {
    score += Math.max(0, 50 - stylist.distanceMiles);
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

  const [mobileSearchOpen, setMobileSearchOpen] =
    useState(false);

  useEffect(() => {
  async function loadStylists() {
    try {
      const { data, error } = await supabase
        .from("stylists")
        .select("*")

      console.log("Supabase URL:", import.meta.env.VITE_SUPABASE_URL);

      if (error) throw error;

      setAllStylists(
        safeArray(data).map((s) => ({
          ...s,
          name: s.full_name || s.name,
          slug: s.profile_slug || s.slug || s.id,   // ⭐ add this
          photo_url: s.photo_url ?? "",
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
      console.log("GEOCODE RESPONSE:", data);
      const place = data?.places?.[0];
      if (!place) return null;

      return {
        lat: Number(place.latitude),
        lng: Number(place.longitude),
      };
    }

    // CITY / STATE (Backend Geocoding)

    const res = await fetch(
      `https://stylegrades-api.vercel.app/api/geocode?city=${encodeURIComponent(trimmed)}`
    );

    if (!res.ok) return null;

    const data = await res.json();

    return {
      lat: data.lat,
      lng: data.lng,
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
      if (s.specialty) {
        set.add(String(s.specialty).trim().toLowerCase());
      }

      safeArray(s.specialties).forEach((x) => {
        set.add(String(x).trim().toLowerCase());
      });
    });

    return [
      "all",
      ...Array.from(set)
        .sort()
        .map(
          (s) => s.charAt(0).toUpperCase() + s.slice(1)
        ),
    ];
  }, [allStylists]);

  const stylists = useMemo(() => {
    let filtered = [...allStylists];

    filtered = filtered.filter((s) => {

      const approved =
        normalizeStatus(s.status) === "approved";

      const activeSubscription =
        s.subscription_status === "active";

      const freePlan =
        (s.tier || "free") === "free";

      return approved &&
        (freePlan || activeSubscription);
    });

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

          const lat = Number(s.lat);
          const lng = Number(s.lng);

          if (
            Number.isFinite(lat) &&
            Number.isFinite(lng)
          ) {
            return {
              ...s,
              distanceMiles: distanceMiles(userLocation, {
                lat,
                lng,
              }),
            };
          }

          return s;
        })

        .filter((s) => {
          if (userLocation && s.distanceMiles == null) return false;

          if (userLocation) {
            return s.distanceMiles <= radiusMiles;
          }

          return true;
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
    (s) => s.tier === "premium"
  );

  const gridItems = useMemo(() => {
    const items = [];

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

      if (i === 2) {
        items.push(
          <InFeedAdCard
            key="micbike-feature"
            page="search"
            enabled
            compact={false}
            slot="A"
          />
        );
      }
    });

    return items;
  }, [stylists]);

  return (
    <div className="w-full min-w-0 pb-10">
      <div className="w-full max-w-6xl mx-auto px-3 md:px-4">

      <header className="pt-2 pb-4 md:pt-4 md:pb-6">
        <h2 className="text-lg md:text-2xl lg:text-3xl font-serif text-[#102A43] leading-tight md:leading-snug">
          Discover stylists you’ll love. Compare work, reviews, and book with confidence.
        </h2>
      </header>

      <div className="flex flex-wrap items-center gap-4 mb-6">
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

      <div className="flex flex-wrap gap-2 mb-6">

        {(
          minRating !== "any" ||
          priceFilter !== "any" ||
          paymentFilter !== "any" ||
          specialtyFilter !== "all" ||
          term ||
          location
        ) && (

          <button
            onClick={handleClear}
            className="bg-[#F0F4F8] text-[#486581] border border-[#D9E2EC] text-sm px-3 py-1 rounded-full font-medium hover:bg-[#E4ECF3] transition"
          >
            Clear All ✕
          </button>

        )}

        {minRating !== "any" && (
          <button
            onClick={() => setMinRating("any")}
            className="bg-[#102A43] text-white text-sm px-3 py-1 rounded-full"
          >
            {minRating}+ Stars ✕
          </button>
        )}

        {priceFilter !== "any" && (
          <button
            onClick={() => setPriceFilter("any")}
            className="bg-[#486581] text-white text-sm px-3 py-1 rounded-full"
          >
            {priceFilter} ✕
          </button>
        )}

        {paymentFilter !== "any" && (
          <button
            onClick={() => setPaymentFilter("any")}
            className="bg-[#829AB1] text-white text-sm px-3 py-1 rounded-full"
          >
            {paymentFilter.replace("_", " ")} ✕
          </button>
        )}

        {specialtyFilter !== "all" && (
          <button
            onClick={() => setSpecialtyFilter("all")}
            className="bg-[#F4A731] text-black text-sm px-3 py-1 rounded-full font-medium"
          >
            {specialtyFilter} ✕
          </button>
        )}

      </div>

      {/* Mobile Search Toggle */}
      <div className="md:hidden mb-4">

        <button
          onClick={() =>
            setMobileSearchOpen(!mobileSearchOpen)
          }
          className="w-full bg-[#102A43] text-white rounded-2xl px-5 py-4 flex items-center justify-between font-semibold shadow-sm"
        >
          <span>Search Near You</span>

          <span className="text-xl">
            {mobileSearchOpen ? "−" : "+"}
          </span>
        </button>

      </div>

      <section
        className={`
          w-full rounded-3xl border border-[#1F3A4D]
          bg-[#101A2A] px-6 py-8 shadow-lg mb-8
          ${mobileSearchOpen ? "block" : "hidden"}
          md:block
        `}
      >
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
              className="w-full rounded-lg border border-[#30465B] bg-[#050B14] px-4 py-2.5 text-sm text-[#F7FAFF]"
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

        <div className="border-[3px] border-[#2F3C4F] rounded-2xl overflow-hidden bg-white shadow-sm mb-8">
          <StylistMap stylists={stylists} userLocation={userLocation} />
        </div>  

        </section>

      <section className="mt-8">

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">

        <div>

          <h2 className="text-2xl font-semibold text-[#102A43]">
            {stylists.length} stylist
            {stylists.length !== 1 ? "s" : ""} found
          </h2>

          <p className="text-sm text-gray-500 mt-1">

            {location
              ? `Showing results near ${location}`
              : "Showing all approved stylists"}

          </p>

        </div>

        {(term || specialtyFilter !== "all") && (
          <div className="text-sm text-[#486581] bg-[#F0F4F8] border border-[#D9E2EC] rounded-full px-4 py-2 w-fit">

            {term && (
              <span>
                Search: <strong>{term}</strong>
              </span>
            )}

            {term && specialtyFilter !== "all" && " • "}

            {specialtyFilter !== "all" && (
              <span>
                Specialty: <strong>{specialtyFilter}</strong>
              </span>
            )}

          </div>
        )}

      </div>  

        {/* TEMP REMOVED DUPLICATE FEATURED CARDS
          <h2 className="text-lg font-semibold">
            ⭐ Featured Stylists
          </h2>

          <div className="grid gap-6 md:grid-cols-3">
            {featuredStylists.map((stylist) => (
              <StylistCard ... />
            ))}
          </div>
          */}
        
        {stylists.length === 0 ? (

          <div className="text-center py-16 px-6 bg-white border rounded-2xl shadow-sm">

            <div className="text-5xl mb-4">
              🔍
            </div>

            <h3 className="text-2xl font-semibold text-[#102A43] mb-3">
              No stylists found
            </h3>

            <p className="text-gray-500 max-w-lg mx-auto mb-6">
              Try adjusting your filters or searching a nearby city
              to discover more stylists.
            </p>

            <button
              onClick={handleClear}
              className="bg-[#102A43] hover:bg-[#0B1F33] text-white px-6 py-3 rounded-xl font-semibold transition"
            >
              Reset Search
            </button>

          </div>

        ) : (

          <div className="flex flex-col gap-6 w-full px-0">
            {gridItems}
          </div>

        )}
                
      </section>
    </div>
   </div> 
  );
}
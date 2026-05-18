// src/pages/JoinAsStylist.jsx
import React, { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { applications } from "../lib/api";
import { supabase } from "../lib/supabase";

// ✅ DEFINE FIRST
const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

// ✅ THEN log (optional for debugging)
console.log("CLOUD NAME:", CLOUD_NAME);
console.log("PRESET:", PRESET);

const API_BASE = import.meta.env.VITE_API_BASE_URL || "";

// ✅ Your submit endpoint:
const SUBMIT_URL = "/api/applications";

// Cloudinary public vars (safe to expose):
const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || "";

// ---------- helpers ----------
function getTierPrice(tier) {
  switch (tier) {
    case "premium":
      return 39;
    case "pro":
      return 19;
    default:
      return 0;
  }
}

function isZipCode(value) {
  return /^\d{5}$/.test(value.trim());
}

async function getLocationFromZip(zip) {
  const res = await fetch(`https://api.zippopotam.us/us/${zip}`);
  if (!res.ok) throw new Error("Invalid ZIP code");

  const data = await res.json();
  const place = data.places?.[0];

  return {
    city: place["place name"],
    state: place["state abbreviation"],
    lat: parseFloat(place.latitude),
    lng: parseFloat(place.longitude),
  };
}

async function getCoordsFromCityState(input) {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  const res = await fetch(
    `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(input)}&key=${apiKey}`
  );

  const data = await res.json();

  if (!data.results || data.results.length === 0) {
    throw new Error("Location not found");
  }

  const result = data.results[0];

  return {
    lat: result.geometry.location.lat,
    lng: result.geometry.location.lng,
  };
}

function safeArray(v) {
  return Array.isArray(v) ? v : [];
}

function splitLinesToLinks(text) {
  return String(text || "")
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
}

function splitSpecialties(text) {
  return String(text || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function isProbablyUrl(s) {
  try {
    const u = new URL(s);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

function getGalleryLimit(tier) {
  switch (String(tier).toLowerCase()) {
    case "premium":
      return 20;
    case "pro":
      return 12;
    default:
      return 3;
  }
}

async function uploadToCloudinary(file, { folder }) {
  if (!CLOUD_NAME || !PRESET) {
    throw new Error("Cloudinary environment variables missing.");
  }

  const form = new FormData();
  form.append("file", file);
  form.append("upload_preset", PRESET);
  form.append("folder", folder);

  const uploadUrl = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`;

  const res = await fetch(uploadUrl, {
    method: "POST",
    body: form
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data?.error || "Upload failed");
  }

  return data.secure_url;
}

// ---------- component ----------
export default function JoinAsStylist() {
  const navigate = useNavigate();
  
  const handleCheckout = async (plan) => {
  try {
    const { data: userData } = await supabase.auth.getUser();
    const user = userData?.user;

    if (!user) {
      alert("You must be logged in before upgrading.");
      return;
    }

    console.log("SENDING TO STRIPE:", {
      plan,
      user_id: user.id,
      email: user.email,
    });

    const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/applications`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (data.url) {
      window.location.href = data.url;
    } else {
      console.error("No checkout URL returned");
    }

  } catch (err) {
    console.error("Checkout error:", err);
  }
};

  async function handleUpgradeClick() {
    try {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData?.user;

      if (!user) {
        alert("You must be logged in");
        return;
      }

      const res = await fetch(
        "https://stylegrades-api.vercel.app/api/create-checkout-session",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            plan: "premium",
            user_id: user.id,
            email: user.email,
          }),
        }
      );

      const data = await res.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        alert("Upgrade failed. Try again.");
      }

    } catch (err) {
      console.error(err);
      alert("Error connecting to payment.");
    }
  }

  const [searchParams] = useSearchParams();
  const selectedPlan = searchParams.get("plan") || "free";

  // ---------------- form fields ----------------
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [specialtiesText, setSpecialtiesText] = useState("");
  const [instagram, setInstagram] = useState("");
  const [website, setWebsite] = useState("");
  const [tierRequested, setTierRequested] = useState(selectedPlan);
  const [bio, setBio] = useState("");
  const [salonName, setSalonName] = useState("");
  const [yearsExperience, setYearsExperience] = useState("");
  const [license, setLicense] = useState("");


  // ---------------- uploads ----------------
  const [photoUrl, setPhotoUrl] = useState("");
  const [gallery, setGallery] = useState([]);

  const [licenseUrl, setLicenseUrl] = useState("");
  const [uploadingLicense, setUploadingLicense] = useState(false);

  // show selected file names (so “No file chosen” doesn’t confuse)
  const [headshotFileName, setHeadshotFileName] = useState("");
  const [galleryFileNames, setGalleryFileNames] = useState([]);

  const [uploadingHeadshot, setUploadingHeadshot] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);

  // ---------------- ui state ----------------
  const [status, setStatus] = useState({ type: "idle", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const specialties = useMemo(
    () => splitSpecialties(specialtiesText),
    [specialtiesText]
  );

  const galleryCount = gallery.length;
  const galleryLimit = getGalleryLimit(tierRequested);

  // ---------------- handlers ----------------
  async function handleHeadshotChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    setHeadshotFileName(file.name || "");

    if (!file.type.startsWith("image/")) {
      setStatus({ type: "error", message: "Headshot must be an image file." });
      return;
    }

    setUploadingHeadshot(true);
    setStatus({ type: "idle", message: "" });

    try {
      const url = await uploadToCloudinary(file, {
        folder: "stylegrades/stylists/headshots",
      });
      setPhotoUrl(url);
      setStatus({ type: "success", message: "Headshot uploaded." });
    } catch (err) {
      setStatus({
        type: "error",
        message: err?.message || "Headshot upload failed.",
      });
    } finally {
      setUploadingHeadshot(false);
      e.target.value = ""; // allow reselect same file
    }
  }

  async function handleGalleryChange(e) {
    const files = safeArray(Array.from(e.target.files || []));
    if (!files.length) return;

    setGalleryFileNames(files.map((f) => f.name).filter(Boolean));

    const remaining = galleryLimit - gallery.length;
    const toUpload = files.slice(0, Math.max(0, remaining));

    if (toUpload.length === 0) {
      setStatus({
        type: "error",
        message: `You've reached your limit of ${galleryLimit} photos on the ${tierRequested} plan. Upgrade to add more.`,
      });
      e.target.value = "";
      return;
    }
    const bad = toUpload.find((f) => !f.type.startsWith("image/"));
    if (bad) {
      setStatus({ type: "error", message: "Work photos must be image files." });
      e.target.value = "";
      return;
    }

    setUploadingGallery(true);
    setStatus({ type: "idle", message: "" });

    try {
      const uploaded = [];
      for (const file of toUpload) {
        const url = await uploadToCloudinary(file, {
          folder: "stylegrades/stylists/work",
        });
        uploaded.push(url);
      }

      setGallery((prev) => [...prev, ...uploaded].slice(0, galleryLimit));
      setStatus({
        type: "success",
        message: `Uploaded ${uploaded.length} work photo${
          uploaded.length === 1 ? "" : "s"
        }.`,
      });
    } catch (err) {
      setStatus({
        type: "error",
        message: err?.message || "Work photo upload failed.",
      });
    } finally {
      setUploadingGallery(false);
      e.target.value = "";
    }
  }

  async function handleLicenseUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingLicense(true);
    setStatus({ type: "idle", message: "" });

    try {
      const url = await uploadToCloudinary(file, {
        folder: "stylegrades/licenses",
      });

      setLicenseUrl(url);

      setStatus({
        type: "success",
        message: "License uploaded successfully.",
      });

    } catch (err) {

      setStatus({
        type: "error",
        message: err?.message || "License upload failed.",
      });

    } finally {
      setUploadingLicense(false);
      e.target.value = "";
    }
  }

  function removeGalleryItem(url) {
    setGallery((prev) => prev.filter((x) => x !== url));
  }

  function clearForm() {
    setFullName("");
    setEmail("");
    setPhone("");
    setCity("");
    setSpecialtiesText("");
    setInstagram("");
    setWebsite("");
    setTierRequested("free");
    setBio("");
    setPhotoUrl("");
    setGallery([]);
    setHeadshotFileName("");
    setGalleryFileNames([]);
  }

  function parseCityState(input) {
    const cleaned = input.replace(/[.]/g, "").trim();

    // Case: "Chicago, IL"
    if (cleaned.includes(",")) {
      const [cityPart, statePart] = cleaned.split(",");
      return {
        city: cityPart.trim(),
        state: (statePart || "").trim().toUpperCase(),
      };
    }

    // Case: "Chicago IL"
    const parts = cleaned.split(" ");
    if (parts.length >= 2) {
      const stateCandidate = parts[parts.length - 1];
      if (stateCandidate.length === 2) {
        return {
          city: parts.slice(0, -1).join(" "),
          state: stateCandidate.toUpperCase(),
        };
      }
    }

    // fallback: just city
    return {
      city: cleaned,
      state: "",
    };
  }
  
  async function handleSubmit(e) {
    e.preventDefault();
    setStatus({ type: "idle", message: "" });

    if (!fullName.trim()) {
      setStatus({ type: "error", message: "Please enter your full name." });
      return;
    }
    if (!email.trim()) {
      setStatus({ type: "error", message: "Please enter your email." });
      return;
    }
    if (!city.trim()) {
      setStatus({ type: "error", message: "Please enter your city." });
      return;
    }
    if (gallery.length > galleryLimit) {
      setStatus({
        type: "error",
        message: `Your plan allows only ${galleryLimit} photos.`,
      });
      setSubmitting(false);
      return;
    }

    const parsed = parseCityState(city);

    let finalCity = parsed.city;
    let state = parsed.state;
    let lat = null;
    let lng = null;

    try {
      if (isZipCode(city)) {
        const loc = await getLocationFromZip(city);
        finalCity = loc.city;
        state = loc.state;
        lat = loc.lat;
        lng = loc.lng;
      } else {
        const coords = await getCoordsFromCityState(city);
        lat = coords.lat;
        lng = coords.lng;
      }
    } catch (err) {
      console.warn("Location failed:", err);

      // 👇 DO NOT BLOCK USER
      lat = null;
      lng = null;
    }

    setSubmitting(true);

    try {
      const payload = {
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),

        city: finalCity,
        state,
        zip: isZipCode(city) ? city : null,
        lat,
        lng,

        salonName: salonName.trim(),
        yearsExperience: yearsExperience.trim(),
        license: license.trim(),
        licenseUrl: licenseUrl || "",

        specialties: specialties,

        instagram: instagram.trim(),
        website: website.trim(),
        tierRequested: tierRequested,
        price: getTierPrice(tierRequested),

        bio: bio.trim(),

        photo_url: photoUrl || "",
        gallery: safeArray(gallery),
      };

      console.log("Submitting payload:", payload);
      console.log("API_BASE:", API_BASE);
      console.log("SUBMIT_URL:", SUBMIT_URL);
      console.log("🚀 SUBMITTING TO:", SUBMIT_URL);

      const res = await fetch(SUBMIT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      console.log("🔥 RESPONSE STATUS:", res.status);
      console.log("🔥 RESPONSE BODY:", result);

      if (!res.ok || !result?.ok) { 
        if (result?.error?.toLowerCase?.().includes("already exists")) {
          setStatus({
            type: "error",
            message: "User already exists. Please log in to continue.",
          });
          return;
        }

        throw new Error(result?.error || "Application submission failed.");
      }

      // ✅ First submit application
      setSubmitted(true);
      setStatus({
        type: "success",
        message: "Application submitted!",
      });

    } catch (err) {
      setStatus({
        type: "error",
        message: err?.message || "Submission failed.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  const disabledUploads = uploadingHeadshot || uploadingGallery || submitting;

    if (submitted) {
  return (
    <div className="max-w-xl mx-auto px-4 py-16 text-center">
      <h1 className="text-3xl font-bold mb-4">
        🎉 Application Submitted!
      </h1>

      <p className="text-gray-600 mb-6">
        Thanks for applying to Stylegrades. We’ll review your submission and notify you shortly.
      </p>

      <div className="bg-gray-50 border rounded-xl p-4 text-sm text-gray-700">
        You’ll receive an email once your profile is reviewed.
      </div>
    </div>
  );
}

// 👇 THEN your normal return
return (
  <div className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-2">Join as Stylist</h1>
      <div className="flex items-center justify-between bg-amber-50 border border-amber-200 rounded-lg px-4 py-2 mb-3 text-sm text-amber-800">

        <div>
          Current plan:{" "}
          <span className="font-semibold uppercase">
            {tierRequested}
          </span>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 mb-3">

          {/* Current Plan */}
          <div className="text-sm text-amber-800">
            Current plan:{" "}
            <span className="font-semibold uppercase">
              {tierRequested}
            </span>
          </div>

          {/* Upgrade Options */}
          {tierRequested !== "premium" && (
            <div className="mt-2 flex items-center gap-2 text-xs">

              <span className="text-gray-600">Upgrade your plan:</span>

              {tierRequested === "free" && (
                <>
                  <button
                    type="button"
                    onClick={() => setTierRequested("pro")}
                    className="px-3 py-1 border rounded-full text-[#1F6FEB] border-[#1F6FEB] hover:bg-blue-50 transition"
                  >
                    Pro
                  </button>

                  <button
                    type="button"
                    onClick={() => setTierRequested("premium")}
                    className="px-3 py-1 border rounded-full text-white bg-[#1F6FEB] border-[#1F6FEB] hover:opacity-90 transition"
                  >
                    Premium
                  </button>
                </>
              )}

              {tierRequested === "pro" && (
                <button
                  type="button"
                  onClick={() => setTierRequested("premium")}
                  className="px-3 py-1 border rounded-full text-white bg-[#1F6FEB] border-[#1F6FEB] hover:opacity-90 transition"
                >
                  Upgrade to Premium
                </button>
              )}

            </div>
          )}

        </div>

      </div>
      <p className="text-gray-600 mb-6">
        Submit your info and photos. We’ll review and publish approved profiles.
      </p>

          {/* Progress indicator */}
      <div className="mb-8">

        <div className="flex items-center justify-between text-xs font-semibold text-gray-500">

          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#102A43] text-white text-xs">
              1
            </span>
            Basic Info
          </div>

          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-300 text-gray-700 text-xs">
              2
            </span>
            Professional
          </div>

          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-300 text-gray-700 text-xs">
              3
            </span>
            Portfolio
          </div>

        </div>

      <div className="mt-2 h-1 w-full bg-gray-200 rounded-full overflow-hidden">
        <div className="h-full w-1/3 bg-[#102A43]"></div>
      </div>
    </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl border shadow-sm p-6 space-y-6"
      >
        {/* Status */}
        {status.message ? (
          <div
            className={`text-sm rounded-lg px-3 py-2 border ${
              status.type === "error"
                ? "text-red-700 bg-red-50 border-red-200"
                : status.type === "success"
                ? "text-emerald-800 bg-emerald-50 border-emerald-200"
                : "text-gray-700 bg-gray-50 border-gray-200"
            }`}
          >
            {status.message}

            {status.message.toLowerCase().includes("already exists") && (
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="mt-3 block px-4 py-2 rounded-lg border border-[#1F6FEB] text-[#1F6FEB] hover:bg-blue-50"
              >
                Go to Login
              </button>
            )}
          </div>
        ) : null}

        {/* Basic info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="block">
            <span className="text-sm font-medium">Full name *</span>
            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="mt-1 w-full border rounded-lg px-3 py-2"
              placeholder="e.g. Abigail Smith"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium">Email *</span>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full border rounded-lg px-3 py-2"
              placeholder="you@email.com"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium">Phone</span>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="mt-1 w-full border rounded-lg px-3 py-2"
              placeholder="(optional)"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium">City or ZIP *</span>
            <input
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="mt-1 w-full border rounded-lg px-3 py-2"
              placeholder="e.g. Oak Brook, IL"
            />
          </label>
        </div>

        {/* Professional Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          <label className="block">
            <span className="text-sm font-medium">Salon Name</span>
            <input
              value={salonName}
              onChange={(e) => setSalonName(e.target.value)}
              className="mt-1 w-full border rounded-lg px-3 py-2"
              placeholder="e.g. Luxe Hair Studio"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium">Years of Experience</span>
            <input
              value={yearsExperience}
              onChange={(e) => setYearsExperience(e.target.value)}
              className="mt-1 w-full border rounded-lg px-3 py-2"
              placeholder="e.g. 8"
            />
          </label>

        </div>

        <label className="block">
          <span className="text-sm font-medium">License / Certification</span>
          <input
            value={license}
            onChange={(e) => setLicense(e.target.value)}
            className="mt-1 w-full border rounded-lg px-3 py-2"
            placeholder="e.g. Illinois Licensed Cosmetologist"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium">
            Upload Cosmetology License (optional)
          </span>

          <input
            type="file"
            accept="image/*,.pdf"
            onChange={handleLicenseUpload}
            className="mt-1 w-full border rounded-lg px-3 py-2"
          />

          <div className="text-xs text-gray-500 mt-1">
            Only visible to Stylegrades admin for verification.
          </div>
        </label>

        <label className="block">
          <span className="text-sm font-medium">Specialties</span>
          <input
            value={specialtiesText}
            onChange={(e) => setSpecialtiesText(e.target.value)}
            className="mt-1 w-full border rounded-lg px-3 py-2"
            placeholder="e.g. Balayage, Extensions, Curly Cuts"
          />
          <div className="mt-1 text-xs text-gray-500">
            Separate specialties with commas.
          </div>
        </label>

        {/* Social + tier */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="block">
            <span className="text-sm font-medium">Instagram</span>
            <input
              value={instagram}
              onChange={(e) => setInstagram(e.target.value)}
              className="mt-1 w-full border rounded-lg px-3 py-2"
              placeholder="@yourhandle (optional)"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium">Website</span>
            <input
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              className="mt-1 w-full border rounded-lg px-3 py-2"
              placeholder="https://… (optional)"
            />
          </label>

          <label className="block md:col-span-2">
            <span className="text-sm font-medium">Professional Bio</span>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={4}
              className="mt-1 w-full border rounded-lg px-3 py-2"
              placeholder="Tell clients about your experience, specialties, and style."
            />
          </label>
         </div>

        {/* Uploads */}
        <div className="border rounded-xl p-4">
          <h2 className="font-semibold mb-3">Photos</h2>

          {/* Headshot */}
          <div className="mb-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-medium">Headshot (1 photo)</div>
                <div className="text-xs text-gray-500">
                  Preferred: clear, well-lit, face visible.
                </div>
              </div>

              <label className="inline-flex items-center gap-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleHeadshotChange}
                  disabled={disabledUploads}
                  className="text-sm"
                />
                <p className="mt-1 text-xs text-slate-500">
                  {photoUrl ? "1 file selected" : "No file chosen"}
                </p>
              </label>
            </div>

            {/* shows selected name (helps avoid “No file chosen” confusion) */}
            {headshotFileName && (
              <div className="mt-1 text-xs text-gray-500">
                Selected: {headshotFileName}
              </div>
            )}

            {uploadingHeadshot && (
              <div className="mt-2 text-sm text-gray-600">Uploading…</div>
            )}

            {photoUrl ? (
              <div className="mt-3 flex items-center gap-3">
                <a href={photoUrl} target="_blank" rel="noreferrer">
                  <img
                    src={photoUrl}
                    alt="Headshot preview"
                    className="h-20 w-20 rounded-lg object-cover border"
                  />
                </a>
                <button
                  type="button"
                  onClick={() => setPhotoUrl("")}
                  className="text-sm px-3 py-2 rounded-lg border border-slate-600 text-slate-700 hover:bg-slate-100 transition"
                  disabled={disabledUploads}
                >
                  Remove
                </button>
              </div>
            ) : (
              <div className="mt-2 text-xs text-gray-500">
                No headshot uploaded yet.
              </div>
            )}
          </div>

          {/* Work photos */}
          <div>
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-medium text-[#1F6FEB]">
                  {tierRequested === "premium"
                    ? "Work photos (Premium: up to 20)"
                    : tierRequested === "pro"
                    ? "Work photos (Pro: up to 12)"
                    : "Work photos (Free: up to 3)"}
                </div>
                <div className="text-xs text-gray-500">
                  Show your best cuts, color, or styling.
                </div>
              </div>

              {galleryCount >= galleryLimit && (
                <div className="mt-2 text-xs">
                  
                  <p className="text-red-600">
                    You’ve reached your limit of {galleryLimit} photos.
                  </p>

                  <p className="text-gray-600 mt-1">
                    Upgrade to{" "}
                    
                    <button
                      type="button"
                      onClick={() => setTierRequested("pro")}
                      className="px-2 py-1 border border-[#1F6FEB] rounded-full text-[#1F6FEB] text-xs hover:bg-blue-50"
                    >
                      Pro
                    </button>

                    {" "}or{" "}

                    <button
                      type="button"
                      onClick={() => setTierRequested("premium")}
                      className="px-2 py-1 border border-[#1F6FEB] rounded-full text-[#1F6FEB] text-xs hover:bg-blue-50"
                    >
                      Premium
                    </button>

                    {" "}to add more photos.
                  </p>

                </div>
              )}

              <label className="inline-flex items-center gap-2">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleGalleryChange}
                  disabled={disabledUploads || gallery.length >= galleryLimit}
                  className="text-sm"
                />
              </label>

              <p className="mt-1 text-xs text-slate-500">
                {!gallery || gallery.length === 0
                  ? "No files chosen"
                  : `${gallery.length} file${gallery.length > 1 ? "s" : ""} selected`}
              </p>
            </div>

            {galleryFileNames.length > 0 && (
              <div className="mt-1 text-xs text-gray-500">
                Selected:{" "}
                {galleryFileNames.slice(0, 3).join(", ")}
                {galleryFileNames.length > 3
                  ? ` (+${galleryFileNames.length - 3})`
                  : ""}
              </div>
            )}

            {uploadingGallery && (
              <div className="mt-2 text-sm text-gray-600">Uploading…</div>
            )}

            <div className="mt-3 grid grid-cols-3 sm:grid-cols-4 gap-2">
              {gallery.map((url) => (
                <div key={url} className="relative">
                  <a href={url} target="_blank" rel="noreferrer">
                    <img
                      src={url}
                      alt="Work preview"
                      className="h-20 w-full object-cover rounded border"
                    />
                  </a>
                  <button
                    type="button"
                    onClick={() => removeGalleryItem(url)}
                    disabled={disabledUploads}
                    className="absolute top-1 right-1 bg-slate-100 border border-slate-300 rounded px-2 py-0.5 text-xs hover:bg-slate-200 transition"
                    title="Remove"
                  >

                  </button>
                </div>
              ))}
            </div>

            <div className="mt-2 text-xs text-gray-500">
              {galleryCount}/{galleryLimit} uploaded.
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="submit"
            disabled={submitting || uploadingHeadshot || uploadingGallery}
            className="px-5 py-3 rounded-lg bg-slate-800 text-slate-100 border border-slate-600 font-semibold hover:bg-slate-700 transition disabled:opacity-50"
          >
            {submitting ? "Submitting…" : "Submit application"}
          </button>

          <button
            type="button"
            onClick={clearForm}
            disabled={submitting || uploadingHeadshot || uploadingGallery}
            className="px-5 py-3 rounded-lg border border-slate-600 text-slate-700 font-medium hover:bg-slate-100 transition disabled:opacity-50"
          >
            Clear
          </button>
        </div>
        
        {/* Dev helper */}
        {(!CLOUDINARY_CLOUD_NAME) && (
          <div className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
            Missing Cloudinary frontend env vars. Add{" "}
            <code className="font-mono">VITE_CLOUDINARY_CLOUD_NAME</code> and{" "}
            <code className="font-mono">VITE_CLOUDINARY_UPLOAD_PRESET</code> to your
            frontend <code className="font-mono">.env</code>.
          </div>
        )}

        {/* Live profile preview */}
        <div className="border rounded-xl p-6 bg-gray-50">
          <h2 className="text-lg font-semibold mb-4">Profile Preview</h2>

          <div className="flex gap-4 items-start">

            {/* Headshot */}
            <div className="flex-shrink-0">
              {photoUrl ? (
                <img
                  src={photoUrl}
                  alt="Preview"
                  className="w-24 h-24 rounded-xl object-cover border"
                />
              ) : (
                <div className="w-24 h-24 rounded-xl bg-gray-200 flex items-center justify-center text-xs text-gray-500">
                  Headshot
                </div>
              )}
            </div>

            {/* Profile info */}
            <div className="flex-1">

              <div className="font-semibold text-lg">
                {fullName || "Your Name"}
              </div>

              <div className="text-sm text-gray-600">
                {salonName || "Salon name"}
              </div>

              <div className="text-sm text-gray-500">
                {city || "City"}
              </div>

              {licenseUrl && (
                <div className="text-xs text-green-700 mt-1 font-medium">
                  ✔ License submitted for verification
                </div>
              )}

              {/* Search result preview */}
              <div className="border rounded-xl p-6 bg-white mt-6">
                <h2 className="text-lg font-semibold mb-4">
                  How you will appear in search results
                </h2>

                <div className="flex gap-4 items-center">

                  {photoUrl ? (
                    <img
                      src={photoUrl}
                      alt="Search preview"
                      className="w-16 h-16 rounded-lg object-cover border"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-lg bg-gray-200 flex items-center justify-center text-xs text-gray-500">
                      Photo
                    </div>
                  )}

                  <div className="flex-1">

                    <div className="font-semibold">
                      {fullName || "Your Name"}
                    </div>

                    <div className="text-sm text-gray-600">
                      {salonName || "Salon Name"}
                    </div>

                    <div className="text-sm text-gray-500">
                      {city || "City"}
                    </div>

                    {specialties.length > 0 && (
                      <div className="text-xs text-gray-500 mt-1">
                        {specialties.slice(0, 3).join(" • ")}
                      </div>
                    )}

                  </div>

                </div>
              </div>

              {yearsExperience && (
                <div className="text-sm text-gray-500">
                  {yearsExperience} years experience
                </div>
              )}

              {/* specialties */}
              {specialties.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {specialties.map((s) => (
                    <span
                      key={s}
                      className="text-xs px-2 py-1 bg-white border rounded-full"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              )}

              {/* bio */}
              {bio && (
                <p className="mt-3 text-sm text-gray-700 line-clamp-3">
                  {bio}
                </p>
              )}

            </div>
          </div>

          {/* gallery preview */}
          {gallery.length > 0 && (
            <div className="mt-4 grid grid-cols-4 gap-2">
              {gallery.slice(0, 4).map((img) => (
                <img
                  key={img}
                  src={img}
                  alt="Preview work"
                  className="w-full h-20 object-cover rounded border"
                />
              ))}
            </div>
          )}

        </div>
      </form>
    </div>
  );
}

import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function ClaimProfilePage() {
  const { profile_slug } = useParams();

  const [stylist, setStylist] = useState(null);
  const [loading, setLoading] = useState(true);

  const [licenseNumber, setLicenseNumber] = useState("");
  const [email, setEmail] = useState("");
  const [certified, setCertified] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const API_BASE =
    import.meta.env.VITE_API_BASE_URL ||
    "https://stylegrades-api.vercel.app";

  useEffect(() => {
    async function loadProfile() {
      setLoading(true);

      const { data, error } = await supabase
        .from("stylists")
        .select(
          "id, full_name, city, state, profile_slug, profile_source, license_type, license_state, license_status"
        )
        .eq("profile_slug", profile_slug)
        .single();

      if (error) {
        console.error("Error loading profile:", error);
        setStylist(null);
      } else {
        setStylist(data);
      }

      setLoading(false);
    }

    loadProfile();
  }, [profile_slug]);

  async function handleSubmit(event) {
    event.preventDefault();

    setErrorMessage("");
    setSuccessMessage("");
    setSubmitting(true);

    try {
      const response = await fetch(
        `${API_BASE}/api/claims/verify-license`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            profileSlug: stylist.profile_slug,
            licenseNumber,
            email,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error || "Unable to verify this profile."
        );
      }

      setSuccessMessage(
        "License information matched. Your profile is ready for the next verification step."
      );
    } catch (error) {
      console.error("Profile claim verification error:", error);

      setErrorMessage(
        error.message || "Unable to verify this profile."
      );
    } finally {
      setSubmitting(false);
    }
  }
  
  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <p className="text-[#52606D]">Loading profile...</p>
      </div>
    );
  }

  if (!stylist) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-2xl font-serif text-[#102A43]">
          Profile not found
        </h1>
      </div>
    );
  }

  if (stylist.profile_source !== "registry_unclaimed") {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-2xl font-serif text-[#102A43] mb-3">
          This profile cannot be claimed
        </h1>

        <p className="text-[#52606D]">
          This Stylegrades™ profile has already been claimed or is not
          eligible for the profile claiming process.
        </p>

        <Link
          to={`/profile/${stylist.profile_slug}`}
          className="inline-block mt-6 font-semibold text-[#102A43] underline"
        >
          Return to Profile
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="max-w-2xl">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#102A43] mb-2">
          Claim Your Stylegrades™ Profile
        </p>

        <h1 className="text-3xl font-serif text-[#102A43]">
          {stylist.full_name}
        </h1>

        <p className="mt-2 text-[#52606D]">
          {[stylist.city, stylist.state].filter(Boolean).join(", ")}
        </p>

        <div className="mt-8 rounded-2xl border border-[#D9E2EC] bg-[#F8FAFC] p-6">
          <h2 className="text-lg font-semibold text-[#102A43]">
            Verify that this is your profile
          </h2>

          <p className="mt-2 text-sm leading-6 text-[#52606D]">
            To protect beauty professionals from unauthorized profile claims, Stylegrades™
            requires the professional license information provided during a claim to match
            the licensing information associated with this profile.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-8 space-y-6"
        >
          <div>
            <label
              htmlFor="licenseNumber"
              className="block text-sm font-semibold text-[#243B53] mb-2"
            >
              Full {stylist.license_state === "IL"
                ? "Illinois"
                : stylist.license_state || stylist.state} License Number
            </label>

            <input
              id="licenseNumber"
              name="licenseNumber"
              type="text"
              autoComplete="off"
              required
              value={licenseNumber}
              onChange={(event) => setLicenseNumber(event.target.value)}
              className="w-full rounded-xl border border-[#BCCCDC] px-4 py-3 text-[#243B53] focus:outline-none focus:ring-2 focus:ring-[#102A43]"
            />

            <p className="mt-2 text-xs leading-5 text-[#7B8794]">
              Enter the complete license number associated with this
              professional license.
            </p>
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-semibold text-[#243B53] mb-2"
            >
              Email Address
            </label>

            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-xl border border-[#BCCCDC] px-4 py-3 text-[#243B53] focus:outline-none focus:ring-2 focus:ring-[#102A43]"
            />

            <p className="mt-2 text-xs leading-5 text-[#7B8794]">
              We'll use this email address to continue the profile
              verification process.
            </p>
          </div>

          <div>
            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                required
                checked={certified}
                onChange={(event) => setCertified(event.target.checked)}
                className="mt-1 h-4 w-4"
              />

              <span className="text-sm leading-6 text-[#52606D]">
                I certify that I am the beauty professional named on this
                profile and that the information I provide is accurate.
              </span>
            </label>
          </div>

          {errorMessage && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {errorMessage}
            </div>
          )}

          {successMessage && (
            <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
              {successMessage}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting || !certified}
            className="inline-flex items-center justify-center rounded-xl bg-[#102A43] px-6 py-3 text-sm font-semibold text-white hover:opacity-95 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? "Verifying..." : "Verify My Profile"}
          </button>
        </form>

        <p className="mt-8 text-xs leading-5 text-[#7B8794]">
          Stylegrades™ uses this information only to verify your profile
          claim. Claiming a profile does not affect your professional
          license or licensing status.
        </p>
      </div>
    </div>
  );
}
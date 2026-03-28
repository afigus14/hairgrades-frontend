// src/pages/LeaveVerifiedReviewPage.jsx
import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "";

export default function LeaveVerifiedReviewPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const token = params.get("token");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const [form, setForm] = useState({
    rating: 5,
    headline: "",
    reviewText: "",
    wouldRecommend: true,
  });

  // ---------------------------
  // Validate token exists
  // ---------------------------
  useEffect(() => {
    if (!token) {
      setError("Invalid review link.");
      setLoading(false);
      return;
    }

    // Optional future validation endpoint
    setLoading(false);
  }, [token]);

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  // ---------------------------
  // Submit verified review
  // ---------------------------
  async function handleSubmit(e) {
    e.preventDefault();

    setError("");

    try {
      const res = await fetch(`${API_BASE}/api/reviews/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          rating: Number(form.rating),
          headline: form.headline,
          reviewText: form.reviewText,
          wouldRecommend: form.wouldRecommend,
        }),
      });

      const data = await res.json();

      if (!data.ok) {
        throw new Error(data.error || "Submission failed");
      }

      setSubmitted(true);
    } catch (err) {
      console.error(err);
      setError("We couldn’t submit your review. Please try again.");
    }
  }

  // ---------------------------
  // Success state
  // ---------------------------
  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16">
        <div className="rounded-3xl border border-[#D9E2EC] bg-white shadow-sm p-8 text-center">
          <h1 className="text-2xl font-serif text-[#102A43]">
            Thank you for your review 💛
          </h1>

          <p className="mt-3 text-sm text-[#52606D]">
            Your verified experience helps other clients choose stylists with
            confidence.
          </p>

          <button
            onClick={() => navigate("/search")}
            className="mt-6 rounded-2xl bg-[#102A43] px-5 py-3 text-sm font-semibold text-white hover:opacity-95"
          >
            Return to Stylegrades
          </button>
        </div>
      </div>
    );
  }

  // ---------------------------
  // Loading / Error
  // ---------------------------
  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <p className="text-sm text-[#52606D]">Loading review form…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16">
        <div className="rounded-2xl bg-red-50 border border-red-200 p-6 text-sm text-red-700">
          {error}
        </div>
      </div>
    );
  }

  // ---------------------------
  // Review Form
  // ---------------------------
  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="rounded-3xl border border-[#D9E2EC] bg-white shadow-sm p-8">
        <h1 className="text-2xl font-serif text-[#102A43]">
          Leave a verified review
        </h1>

        <p className="mt-2 text-sm text-[#52606D]">
          This review is linked to a verified appointment experience.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          {/* Rating */}
          <div>
            <label className="block text-sm font-semibold text-[#102A43] mb-1">
              Rating
            </label>

            <select
              value={form.rating}
              onChange={(e) => updateField("rating", e.target.value)}
              className="w-full rounded-xl border border-[#D9E2EC] px-3 py-2"
            >
              {[5, 4, 3, 2, 1].map((r) => (
                <option key={r} value={r}>
                  {r} ⭐
                </option>
              ))}
            </select>
          </div>

          {/* Headline */}
          <div>
            <label className="block text-sm font-semibold text-[#102A43] mb-1">
              Review headline
            </label>

            <input
              type="text"
              value={form.headline}
              onChange={(e) => updateField("headline", e.target.value)}
              className="w-full rounded-xl border border-[#D9E2EC] px-3 py-2"
              placeholder="Great experience!"
              required
            />
          </div>

          {/* Review text */}
          <div>
            <label className="block text-sm font-semibold text-[#102A43] mb-1">
              Your experience
            </label>

            <textarea
              rows={5}
              value={form.reviewText}
              onChange={(e) => updateField("reviewText", e.target.value)}
              className="w-full rounded-xl border border-[#D9E2EC] px-3 py-2"
              placeholder="Tell others about your visit…"
              required
            />
          </div>

          {/* Recommend */}
          <label className="flex items-center gap-2 text-sm text-[#243B53]">
            <input
              type="checkbox"
              checked={form.wouldRecommend}
              onChange={(e) =>
                updateField("wouldRecommend", e.target.checked)
              }
            />
            I would recommend this stylist
          </label>

          <button
            type="submit"
            className="w-full rounded-2xl bg-[#102A43] px-5 py-3 text-sm font-semibold text-white hover:opacity-95"
          >
            Submit verified review
          </button>
        </form>
      </div>
    </div>
  );
}

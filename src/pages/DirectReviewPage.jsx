import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "";

export default function DirectReviewPage() {
  const { id } = useParams();

  const [stylist, setStylist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    reviewerName: "",
    reviewerEmail: "",
    serviceDate: "",
    rating: 5,
    headline: "",
    reviewText: "",
  });

  useEffect(() => {
    async function fetchStylist() {
      setLoading(true);
      setError("");

      const { data, error: stylistError } = await supabase
        .from("stylists")
        .select("id, full_name, city, state, profile_slug")
        .eq("profile_slug", id)
        .single();

      if (stylistError || !data) {
        console.error("Error loading stylist:", stylistError);
        setError("We couldn't find this beauty professional.");
        setLoading(false);
        return;
      }

      setStylist(data);
      document.title = `Review ${data.full_name} | Stylegrades`;
      setLoading(false);
    }

    fetchStylist();
  }, [id]);

  function updateField(field, value) {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!stylist) return;

    setSubmitting(true);
    setError("");

    try {
      const response = await fetch(
        `${API_BASE}/api/reviews/submit-direct`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            stylistId: stylist.id,
            reviewerName: form.reviewerName,
            reviewerEmail: form.reviewerEmail,
            serviceDate: form.serviceDate,
            rating: Number(form.rating),
            headline: form.headline,
            reviewText: form.reviewText,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.ok) {
        throw new Error(
          data.error || "We couldn't submit your review."
        );
      }

      setSubmitted(true);
    } catch (err) {
      console.error("Direct review submission error:", err);

      setError(
        err.message ||
          "We couldn't submit your review. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <p className="text-sm text-[#52606D]">
          Loading review form…
        </p>
      </div>
    );
  }

  if (!stylist) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16">
        <div className="rounded-2xl bg-red-50 border border-red-200 p-6 text-sm text-red-700">
          {error || "Beauty professional not found."}
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16">
        <div className="rounded-3xl border border-[#D9E2EC] bg-white shadow-sm p-8 text-center">
          <div className="text-3xl mb-3">✉️</div>

          <h1 className="text-2xl font-serif text-[#102A43]">
            Check your email
          </h1>

          <p className="mt-3 text-sm leading-6 text-[#52606D]">
            We sent a verification email to{" "}
            <strong>{form.reviewerEmail}</strong>.
          </p>

          <p className="mt-3 text-sm leading-6 text-[#52606D]">
            Please click the verification link in that email. Your
            review will not be eligible for publication until your
            email address has been verified.
          </p>

          <p className="mt-3 text-sm leading-6 text-[#52606D]">
            After verification, your review will be evaluated
            according to the Stylegrades™ Review Guidelines before
            publication.
          </p>

          <div className="mt-6 flex flex-col sm:flex-row justify-center gap-3">
            <Link
              to="/search"
              className="rounded-2xl bg-[#102A43] px-5 py-3 text-sm font-semibold text-white hover:opacity-95"
            >
              Return to Stylegrades
            </Link>

            <Link
              to="/review-guidelines"
              className="rounded-2xl border border-[#D9E2EC] px-5 py-3 text-sm font-semibold text-[#102A43] hover:bg-[#F8FAFC]"
            >
              Review Guidelines
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="rounded-3xl border border-[#D9E2EC] bg-white shadow-sm p-6 sm:p-8">

        <div className="border-b border-[#D9E2EC] pb-6">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#D8B15A] mb-2">
            Verified Client Reviews
          </p>

          <h1 className="text-2xl sm:text-3xl font-serif text-[#102A43]">
            Review {stylist.full_name}
          </h1>

          {(stylist.city || stylist.state) && (
            <p className="mt-2 text-sm text-[#52606D]">
              {[stylist.city, stylist.state]
                .filter(Boolean)
                .join(", ")}
            </p>
          )}
        </div>

        <div className="mt-6 rounded-2xl bg-[#F8FAFC] border border-[#D9E2EC] p-5">
          <h2 className="font-semibold text-[#102A43]">
            Your review will be verified.
          </h2>

          <p className="mt-2 text-sm leading-6 text-[#52606D]">
            After submitting your review, Stylegrades™ will send a
            verification message to the email address you provide.
            Your review will not be eligible for publication until
            verification is complete.
          </p>

          <p className="mt-3 text-sm">
            <Link
              to="/review-guidelines"
              className="font-semibold text-[#102A43] underline underline-offset-2"
            >
              Why you can trust Stylegrades™ reviews
            </Link>
          </p>
        </div>

        {error && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-7 space-y-5">

          <div>
            <label className="block text-sm font-semibold text-[#102A43] mb-1">
              Your name
            </label>

            <input
              type="text"
              value={form.reviewerName}
              onChange={(e) =>
                updateField("reviewerName", e.target.value)
              }
              className="w-full rounded-xl border border-[#D9E2EC] px-3 py-2.5"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#102A43] mb-1">
              Email address
            </label>

            <input
              type="email"
              value={form.reviewerEmail}
              onChange={(e) =>
                updateField("reviewerEmail", e.target.value)
              }
              className="w-full rounded-xl border border-[#D9E2EC] px-3 py-2.5"
              required
            />

            <p className="mt-1.5 text-xs leading-5 text-[#52606D]">
              Used for review verification only. Your email address
              will never be displayed publicly.
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#102A43] mb-1">
              Approximate date of service
            </label>

            <input
              type="date"
              value={form.serviceDate}
              max={new Date().toISOString().split("T")[0]}
              onChange={(e) =>
                updateField("serviceDate", e.target.value)
              }
              className="w-full rounded-xl border border-[#D9E2EC] px-3 py-2.5"
              required
            />

            <p className="mt-1.5 text-xs text-[#52606D]">
              An approximate date is okay.
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#102A43] mb-1">
              Rating
            </label>

            <select
              value={form.rating}
              onChange={(e) =>
                updateField("rating", Number(e.target.value))
              }
              className="w-full rounded-xl border border-[#D9E2EC] px-3 py-2.5"
            >
              <option value={5}>★★★★★ — 5 stars</option>
              <option value={4}>★★★★ — 4 stars</option>
              <option value={3}>★★★ — 3 stars</option>
              <option value={2}>★★ — 2 stars</option>
              <option value={1}>★ — 1 star</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#102A43] mb-1">
              Review headline
            </label>

            <input
              type="text"
              value={form.headline}
              onChange={(e) =>
                updateField("headline", e.target.value)
              }
              className="w-full rounded-xl border border-[#D9E2EC] px-3 py-2.5"
              placeholder="Describe your experience"
              maxLength={100}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#102A43] mb-1">
              Tell us about your experience
            </label>

            <textarea
              rows={6}
              value={form.reviewText}
              onChange={(e) =>
                updateField("reviewText", e.target.value)
              }
              className="w-full rounded-xl border border-[#D9E2EC] px-3 py-2.5"
              placeholder="Share details that could help another client..."
              maxLength={2000}
              required
            />
          </div>

          <div className="rounded-xl border border-[#D9E2EC] bg-[#FFFDF8] p-4">
            <p className="text-xs leading-5 text-[#52606D]">
              By submitting this review, you confirm that it reflects
              your own experience with this beauty professional and
              that the information you provide is truthful to the best
              of your knowledge.
            </p>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-2xl bg-[#102A43] px-5 py-3.5 text-sm font-semibold text-white hover:opacity-95 transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting
              ? "Submitting…"
              : "Submit Review"}
          </button>

        </form>
      </div>
    </div>
  );
}
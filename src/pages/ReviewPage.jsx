// src/pages/ReviewPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "";

function StarButton({ filled, onClick, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={[
        "h-10 w-10 rounded-xl border text-lg font-bold",
        filled
          ? "bg-[#F4A731] border-[#F4A731] text-black"
          : "bg-white border-[#D9E2EC] text-[#52606D] hover:bg-[#F0F4F8]",
      ].join(" ")}
    >
      ★
    </button>
  );
}

export default function ReviewPage() {
  const { token } = useParams();

  const [loading, setLoading] = useState(true);
  const [tokenInfo, setTokenInfo] = useState(null);
  const [stylist, setStylist] = useState(null);

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError("");

      try {
        const res = await fetch(`${API_BASE}/api/public/review-tokens/${token}`);
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data?.ok) {
          throw new Error("This review link is invalid or expired.");
        }

        if (cancelled) return;
        setTokenInfo(data);

        // Optional: fetch stylist details from your existing public stylists endpoint
        // We’ll use the endpoint you already have: /api/public/stylists
        const res2 = await fetch(`${API_BASE}/api/public/stylists`);
        const d2 = await res2.json().catch(() => ({}));
        const list = Array.isArray(d2?.stylists) ? d2.stylists : [];
        const s = list.find((x) => String(x.id) === String(data.stylistId)) || null;

        if (!cancelled) setStylist(s);
      } catch (e) {
        if (!cancelled) setError(e.message || "Could not load review link.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [token]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const res = await fetch(`${API_BASE}/api/public/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, rating, comment }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.ok) {
        throw new Error(
          data?.reason === "used"
            ? "This link has already been used."
            : data?.reason === "expired"
            ? "This link has expired."
            : "Could not submit review. Please try again."
        );
      }

      setDone(true);
    } catch (e) {
      setError(e.message || "Could not submit review.");
    } finally {
      setSubmitting(false);
    }
  }

  const stylistName = useMemo(() => {
    return stylist?.fullName || stylist?.name || "your stylist";
  }, [stylist]);

  if (loading) {
    return (
      <div className="max-w-xl mx-auto px-4 py-10">
        <div className="rounded-3xl border border-[#D9E2EC] bg-white p-6 shadow-sm">
          <div className="text-[#102A43] font-semibold">Loading review link…</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-xl mx-auto px-4 py-10">
        <div className="rounded-3xl border border-[#F2B8B5] bg-[#FFF5F5] p-6 shadow-sm">
          <div className="text-[#7A1F1A] font-semibold">Can’t use this link</div>
          <p className="mt-2 text-sm text-[#7A1F1A]">{error}</p>
          <div className="mt-4">
            <Link
              to="/"
              className="inline-flex items-center justify-center rounded-2xl bg-[#102A43] px-4 py-3 text-sm font-semibold text-white"
            >
              Back to Stylegrades
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (done) {
    return (
      <div className="max-w-xl mx-auto px-4 py-10">
        <div className="rounded-3xl border border-[#D9E2EC] bg-white p-6 shadow-sm">
          <div className="text-[#102A43] font-semibold">Thank you!</div>
          <p className="mt-2 text-sm text-[#52606D]">
            Your verified review for <span className="font-semibold">{stylistName}</span> has been submitted.
          </p>
          <div className="mt-4">
            <Link
              to="/search"
              className="inline-flex items-center justify-center rounded-2xl bg-[#102A43] px-4 py-3 text-sm font-semibold text-white"
            >
              Return to search
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-10">
      <div className="rounded-3xl border border-[#1F3A4D] bg-[#101A2A] p-6 shadow-lg">
        <h1 className="text-2xl font-serif text-white">Leave a verified review</h1>
        <p className="mt-2 text-sm text-[#C7D5E2]">
          This link verifies you were invited to review{" "}
          <span className="font-semibold text-white">{stylistName}</span>.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-[#C7D5E2] mb-2">
              Rating
            </div>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((n) => (
                <StarButton
                  key={n}
                  filled={n <= rating}
                  onClick={() => setRating(n)}
                  label={`${n} stars`}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-[#C7D5E2] mb-2">
              Comment (optional)
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              className="w-full rounded-2xl border border-[#30465B] bg-[#050B14] px-3 py-3 text-sm text-white placeholder:text-[#7B8BA0] focus:outline-none focus:ring-1 focus:ring-[#7A9D96]"
              placeholder="What was your experience like?"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-2xl bg-[#F4A731] px-5 py-3 text-sm font-semibold text-black shadow hover:opacity-95 disabled:opacity-70"
          >
            {submitting ? "Submitting…" : "Submit verified review"}
          </button>

          <div className="text-[11px] text-[#9FB3C8]">
            This link can only be used once.
          </div>
        </form>
      </div>
    </div>
  );
}

import React, { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "";

export default function VerifyDirectReviewPage() {
  const { token } = useParams();

  const [status, setStatus] = useState("verifying");
  const [error, setError] = useState("");

  // Prevent React StrictMode in development from
  // making the verification request twice.
  const hasVerified = useRef(false);

  useEffect(() => {
    if (hasVerified.current) return;
    hasVerified.current = true;

    async function verifyReview() {
      if (!token) {
        setError("This verification link is invalid.");
        setStatus("error");
        return;
      }

      try {
        const response = await fetch(
          `${API_BASE}/api/reviews/verify-direct`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              token,
            }),
          }
        );

        const data = await response.json();

        if (!response.ok || !data.ok) {
          throw new Error(
            data.error || "Review verification failed."
          );
        }

        setStatus("success");
      } catch (err) {
        console.error(
          "Direct review verification error:",
          err
        );

        setError(
          err.message ||
            "We couldn't verify your review. Please try again."
        );

        setStatus("error");
      }
    }

    verifyReview();
  }, [token]);

  if (status === "verifying") {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16">
        <div className="rounded-3xl border border-[#D9E2EC] bg-white shadow-sm p-8 text-center">
          <h1 className="text-2xl font-serif text-[#102A43]">
            Verifying your review…
          </h1>

          <p className="mt-3 text-sm text-[#52606D]">
            This should only take a moment.
          </p>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16">
        <div className="rounded-3xl border border-red-200 bg-white shadow-sm p-8 text-center">
          <h1 className="text-2xl font-serif text-[#102A43]">
            We couldn't verify this review
          </h1>

          <p className="mt-3 text-sm text-[#52606D]">
            {error}
          </p>

          <Link
            to="/"
            className="inline-block mt-6 rounded-2xl bg-[#102A43] px-5 py-3 text-sm font-semibold text-white hover:opacity-95"
          >
            Return to Stylegrades
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-16">
      <div className="rounded-3xl border border-[#D9E2EC] bg-white shadow-sm p-8 text-center">
        <div className="text-3xl mb-3">✓</div>

        <h1 className="text-2xl font-serif text-[#102A43]">
          Your review is verified
        </h1>

        <p className="mt-3 text-sm leading-6 text-[#52606D]">
          Thank you for verifying your email address. Your review
          will now be evaluated according to the Stylegrades™ Review
          Guidelines before publication.
        </p>

        <p className="mt-4 text-sm text-[#52606D]">
          Verification helps us maintain a trustworthy review
          community for clients and beauty professionals.
        </p>

        <div className="mt-6 flex flex-col sm:flex-row justify-center gap-3">
          <Link
            to="/search"
            className="rounded-2xl bg-[#102A43] px-5 py-3 text-sm font-semibold text-white hover:opacity-95"
          >
            Find Beauty Professionals
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
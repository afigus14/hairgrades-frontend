import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

const API_BASE =
  import.meta.env.VITE_API_BASE_URL ||
  "https://stylegrades-api.vercel.app";

export default function VerifyClaimEmailPage() {
  const { token } = useParams();

  const [status, setStatus] = useState("verifying");
  const [message, setMessage] = useState(
    "We're verifying your email address..."
  );

  useEffect(() => {
    async function verifyEmail() {
      try {
        const response = await fetch(
          `${API_BASE}/api/claims/verify-email`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ token }),
          }
        );

        const result = await response.json();

        if (!response.ok) {
          throw new Error(
            result.error || "Unable to verify your email address."
          );
        }

        setStatus("success");
        setMessage(
          "Your email address has been verified. Your profile claim is now pending review by Stylegrades™."
        );
      } catch (error) {
        console.error("Claim email verification error:", error);

        setStatus("error");
        setMessage(
          error.message || "Unable to verify your email address."
        );
      }
    }

    if (token) {
      verifyEmail();
    } else {
      setStatus("error");
      setMessage("This verification link is invalid.");
    }
  }, [token]);

  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <div className="max-w-xl rounded-2xl border border-[#D9E2EC] bg-white shadow-sm p-8">
        {status === "verifying" && (
          <>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#102A43] mb-2">
              Profile Verification
            </p>

            <h1 className="text-3xl font-serif text-[#102A43]">
              Verifying Your Email
            </h1>

            <p className="mt-4 text-[#52606D]">
              {message}
            </p>
          </>
        )}

        {status === "success" && (
          <>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#102A43] mb-2">
              Email Verified
            </p>

            <h1 className="text-3xl font-serif text-[#102A43]">
              Thank You
            </h1>

            <p className="mt-4 leading-7 text-[#52606D]">
              {message}
            </p>

            <p className="mt-4 text-sm leading-6 text-[#52606D]">
              No changes will be made to the professional profile until
              the claim has been reviewed.
            </p>

            <Link
              to="/"
              className="inline-flex mt-7 items-center justify-center rounded-xl bg-[#102A43] px-6 py-3 text-sm font-semibold text-white hover:opacity-95 transition"
            >
              Return to Stylegrades™
            </Link>
          </>
        )}

        {status === "error" && (
          <>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#102A43] mb-2">
              Profile Verification
            </p>

            <h1 className="text-3xl font-serif text-[#102A43]">
              We Couldn't Verify This Link
            </h1>

            <p className="mt-4 leading-7 text-[#52606D]">
              {message}
            </p>

            <Link
              to="/"
              className="inline-block mt-7 font-semibold text-[#102A43] underline"
            >
              Return to Stylegrades™
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
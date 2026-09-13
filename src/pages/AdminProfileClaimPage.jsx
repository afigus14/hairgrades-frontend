// src/pages/AdminProfileClaimPage.jsx

import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function AdminProfileClaimPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [stylist, setStylist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const [actionLoading, setActionLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState("");

  useEffect(() => {
    async function loadClaim() {
      setLoading(true);
      setErrorMessage("");

      const { data, error } = await supabase
        .from("stylists")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error loading profile claim:", error);
        setErrorMessage("Unable to load this profile claim.");
        setStylist(null);
        setLoading(false);
        return;
      }

      if (
        data.profile_source !== "registry_unclaimed" ||
        data.claim_email_verified !== true ||
        data.claimed_at
      ) {
        setErrorMessage(
          "This profile does not have a pending verified claim."
        );
        setStylist(null);
        setLoading(false);
        return;
      }

      setStylist(data);
      setLoading(false);
    }

    loadClaim();
    }, [id]);

    async function handleApproveClaim() {
      if (!stylist?.id) return;

      const confirmed = window.confirm(
        `Approve the profile claim for ${stylist.full_name}? An account activation email will be sent to ${stylist.claim_email}.`
      );

      if (!confirmed) return;

      setActionLoading(true);
      setActionMessage("");

      try {
        const adminKey = localStorage.getItem("stylegrades_admin_key");

        if (!adminKey) {
          throw new Error(
            "Your admin session is missing. Please sign in to the Admin Dashboard again."
          );
        }

        const API_BASE =
          import.meta.env.VITE_API_BASE_URL ||
          "https://stylegrades-api.vercel.app";

        const response = await fetch(
          `${API_BASE}/api/admin/profileClaimAction`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-admin-key": adminKey,
            },
            body: JSON.stringify({
              action: "approve",
              id: stylist.id,
            }),
          }
        );

        const result = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(
            result?.error ||
              "Stylegrades could not approve this profile claim."
          );
        }

        setActionMessage(
          "Claim approved. The account activation email has been sent."
        );
      } catch (error) {
        console.error("Approve profile claim error:", error);

        setActionMessage(
          error?.message ||
            "Stylegrades could not approve this profile claim."
        );
      } finally {
        setActionLoading(false);
      }
    }

    if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="bg-white border rounded-2xl p-8 text-center">
          Loading profile claim...
        </div>
      </div>
    );
  }

  if (!stylist) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-12">
        <button
          onClick={() => navigate(-1)}
          className="text-sm underline text-[#102A43]"
        >
          ← Back
        </button>

        <div className="mt-6 bg-white border rounded-2xl p-8">
          <h1 className="text-2xl font-bold text-[#102A43]">
            Profile Claim
          </h1>

          <p className="mt-3 text-red-600">
            {errorMessage}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <button
        onClick={() => navigate(-1)}
        className="text-sm underline text-[#102A43]"
      >
        ← Back to Admin Dashboard
      </button>

      <div className="mt-6">
        <div className="text-sm font-semibold tracking-[0.25em] uppercase text-[#C9971A]">
          Stylegrades™ Profile Claim
        </div>

        <h1 className="mt-2 text-4xl font-bold text-[#102A43]">
          Review Profile Claim
        </h1>

        <p className="mt-2 text-[#52606D]">
          Review the registry information and completed verification
          steps before approving ownership of this profile.
        </p>
      </div>

      <div className="mt-8 grid gap-6">
        {/* PROFESSIONAL */}

        <section className="bg-white border border-[#D9E2EC] rounded-2xl p-6 shadow-sm">
          <h2 className="text-xl font-bold text-[#102A43]">
            Professional
          </h2>

          <div className="mt-5">
            <div className="text-2xl font-semibold text-[#102A43]">
              {stylist.full_name}
            </div>

            <div className="mt-1 text-[#52606D]">
              Licensed {stylist.license_type || "Beauty Professional"}
            </div>

            <div className="mt-1 text-[#52606D]">
              {[stylist.city, stylist.state]
                .filter(Boolean)
                .join(", ")}
            </div>
          </div>
        </section>

        {/* LICENSE */}

        <section className="bg-white border border-[#D9E2EC] rounded-2xl p-6 shadow-sm">
          <h2 className="text-xl font-bold text-[#102A43]">
            License Record
          </h2>

          <div className="mt-5 grid sm:grid-cols-2 gap-5">
            <InfoItem
              label="License Number"
              value={stylist.license_number}
            />

            <InfoItem
              label="License Status"
              value={stylist.license_status}
            />

            <InfoItem
              label="License State"
              value={stylist.license_state}
            />

            <InfoItem
              label="Registry Source"
              value={stylist.registry_source}
            />

            <InfoItem
              label="Registry Last Verified"
              value={formatDate(stylist.registry_last_verified_at)}
            />
          </div>
        </section>

        {/* CLAIMANT */}

        <section className="bg-white border border-[#D9E2EC] rounded-2xl p-6 shadow-sm">
          <h2 className="text-xl font-bold text-[#102A43]">
            Claimant Verification
          </h2>

          <div className="mt-5 grid sm:grid-cols-2 gap-5">
            <InfoItem
              label="Claim Email"
              value={stylist.claim_email}
            />

            <InfoItem
              label="Claim Requested"
              value={formatDate(stylist.claim_requested_at)}
            />

            <InfoItem
              label="Email Verified"
              value={
                stylist.claim_email_verified
                  ? "Yes"
                  : "No"
              }
            />

            <InfoItem
              label="Email Verified At"
              value={formatDate(stylist.claim_email_verified_at)}
            />
          </div>

          <div className="mt-6 rounded-xl bg-[#ECFDF3] border border-[#A7F3D0] p-5">
            <div className="font-semibold text-[#047857]">
              ✓ License information matched
            </div>

            <div className="mt-2 font-semibold text-[#047857]">
              ✓ Email address verified
            </div>
          </div>
        </section>

        {/* ADMIN ACTION */}

        <section className="bg-white border border-[#D9E2EC] rounded-2xl p-6 shadow-sm">
          <h2 className="text-xl font-bold text-[#102A43]">
            Admin Decision
          </h2>

          <p className="mt-2 text-[#52606D]">
            Approving this claim will send the verified claimant a secure
            account activation link. The profile will not become claimed
            until account activation is successfully completed.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleApproveClaim}
              disabled={actionLoading}
              className="rounded-lg bg-[#102A43] px-5 py-3 font-semibold text-white transition hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {actionLoading ? "Approving..." : "Approve Claim"}
            </button>

            <button
              type="button"
              disabled
              className="rounded-lg border border-red-300 px-5 py-3 font-semibold text-red-700 opacity-40 cursor-not-allowed"
            >
              Reject Claim
            </button>
          </div>

          {actionMessage && (
            <div className="mt-4 rounded-xl bg-[#F5F7FA] border border-[#D9E2EC] px-4 py-3 text-sm text-[#243B53]">
              {actionMessage}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function InfoItem({ label, value }) {
  return (
    <div>
      <div className="text-xs font-semibold uppercase tracking-wide text-[#7B8794]">
        {label}
      </div>

      <div className="mt-1 font-medium text-[#243B53]">
        {value || "-"}
      </div>
    </div>
  );
}

function formatDate(value) {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleString();
}
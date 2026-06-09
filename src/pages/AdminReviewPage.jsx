// src/pages/AdminReviewPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "";

function safeArray(v) {
  return Array.isArray(v) ? v : [];
}

function normalizeStatus(s) {
  return String(s || "pending").toLowerCase();
}

function idSafe(v) {
  return String(v || "").trim();
}

export default function AdminReviewPage() {
  const [adminKey, setAdminKey] = useState(
    localStorage.getItem("stylegrades_admin_key") || ""
  );

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: "idle", message: "" });

  const [applications, setApplications] = useState([]);
  const [reviews, setReviews] = useState([]);

  const [responses, setResponses] = useState({});

  const headers = useMemo(() => {
    return {
      "Content-Type": "application/json",
      "X-Admin-key": adminKey,
    };
  }, [adminKey]);

  useEffect(() => {
    localStorage.setItem("stylegrades_admin_key", adminKey);
  }, [adminKey]);

  async function fetchApplications() {
    setLoading(true);
    setStatus({ type: "idle", message: "" });

    try {
      const { data, error } = await supabase
        .from("stylists")
        .select("*")
        .eq("status", "pending")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setApplications(
        safeArray(data).map((s) => ({
          ...s,
          name: s.full_name || s.name,
          fullName: s.full_name || s.fullName,
          photoUrl:
          s.photo_url ||
          s.photo_urls?.[0] ||
          null,

        gallery:
          s.gallery ||
          s.photo_urls ||
          [],
          licenseUrl: s.license_url || s.licenseUrl,
          yearsExperience: s.years_experience || s.yearsExperience,
          bio: s.bio || "",
        }))
      );

      setStatus({
        type: "success",
        message: `Loaded ${data?.length || 0} application(s).`,
      });

      setStatus({
        type: "success",
        message: `Loaded ${data?.length || 0} application(s).`,
      });
    } catch (e) {
      setApplications([]);
      setStatus({ type: "error", message: e?.message || "Server error" });
    } finally {
      setLoading(false);
    }
  }

  async function fetchReviews() {
    try {
      const { data, error } = await supabase
        .from("reviews")
        .select(`
          *,
          stylist:stylists(full_name)
        `)
        .eq("status", "pending")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setReviews(data || []);

      const existingResponses = {};

      (data || []).forEach((review) => {
        if (review.stylist_response) {
          existingResponses[review.id] =
            review.stylist_response;
        }
      });

      setResponses(existingResponses);
    } catch (e) {
      console.error("Review fetch error:", e);
    }
  }

  async function approveStylist(id) {
    try {
      const stylist = applications.find((s) => s.id === id);

      const res = await fetch(
        `${API_BASE}/api/applicationAction`,
        {
          method: "POST",
          headers,
          body: JSON.stringify({
            action: "approve",
            id,
            message: stylist?._message || "",
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.error || "Approval failed."
        );
      }

      // Remove from UI
      setApplications((prev) =>
        prev.filter((s) => s.id !== id)
      );

      setStatus({
        type: "success",
        message: "Stylist approved and email sent.",
      });
    } catch (e) {
      setStatus({ type: "error", message: e.message });
    }
  }

  async function rejectStylist(id) {
    try {
      const { error } = await supabase
        .from("stylists")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setApplications((prev) => prev.filter((s) => s.id !== id));

      setStatus({
        type: "success",
        message: "Stylist rejected.",
      });
    } catch (e) {
      setStatus({ type: "error", message: e.message });
    }
  }

  async function requestInfo(id, message) {
    try {
      const stylist = applications.find(
        (s) => s.id === id
      );

      const res = await fetch(
        "https://stylegrades-api.vercel.app/api/send-request-info",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: stylist?.email,
            name: stylist?.fullName,
            message,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.error || "Failed to send email."
        );
      }

      setStatus({
        type: "success",
        message:
          "Request for additional information sent.",
      });

    } catch (e) {
      setStatus({
        type: "error",
        message: e.message,
      });
    }
  }

  async function approveReview(id) {

    const review = reviews.find(
      (r) => r.id === id
    );

    const stylistId = review?.stylist_id;

    const { data, error } = await supabase
      .from("reviews")
      .update({
        status: "approved",
      })
      .eq("id", id)
      .select();

    if (error) {
      alert(
        error.message ||
        "Failed to approve review."
      );
      return;
    }

    await fetch(
      "https://stylegrades-api.vercel.app/api/send-review-notification",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "approved",
          reviewerName: review?.reviewer_name,
          reviewerEmail: review?.reviewer_email,
          stylistName: review?.stylist?.full_name,
          reviewText: review?.review_text,
          rating: review?.rating,
        }),
      }
    );

    // Recalculate rating and review count
    const { data: approvedReviews } = await supabase
      .from("reviews")
      .select("rating")
      .eq("stylist_id", stylistId)
      .eq("status", "approved");

    const reviewCount = approvedReviews?.length || 0;

    const averageRating =
      reviewCount > 0
        ? approvedReviews.reduce(
            (sum, r) => sum + Number(r.rating || 0),
            0
          ) / reviewCount
        : 0;

    await supabase
      .from("stylists")
      .update({
        reviews_count: reviewCount,
        rating: averageRating,
      })
      .eq("id", stylistId);

    alert("Review approved!");

    fetchReviews();
  }

  async function saveResponse(reviewId) {
    const response = responses[reviewId];

    if (!response?.trim()) {
      alert("Please enter a response first.");
      return;
    }

    const { error } = await supabase
      .from("reviews")
      .update({
        stylist_response: response,
        stylist_response_date: new Date().toISOString(),
      })
      .eq("id", reviewId);

    if (error) {
      alert(error.message);
      return;
    }

    const review = reviews.find(
      (r) => r.id === reviewId
    );

    await fetch(
      "https://stylegrades-api.vercel.app/api/send-review-response",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reviewerName: review.reviewer_name,
          reviewerEmail: review.reviewer_email,
          stylistName:
            review.stylist?.full_name ||
            "Your stylist",
          reviewText: review.review_text,
          stylistResponse: response,
        }),
      }
    );

    alert("Response saved!");
  }
  
  async function rejectReview(id) {

    console.log("REJECTING REVIEW:", id);

    const { error } = await supabase
      .from("reviews")
      .update({
        status: "rejected",
      })
      .eq("id", id);

    console.log("REJECT ERROR:", error);

    if (error) {
      alert(error.message);
      return;
    }

    alert("Review deleted");

    setReviews((prev) =>
      prev.filter((r) => r.id !== id)
    );
  }

  useEffect(() => {
    // only auto-load if key exists; avoids confusing 401 spam
    if (adminKey) {
      fetchApplications();
      fetchReviews();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-2">Admin — Applications</h1>
      <p className="text-gray-600 mb-6">
        Review stylist submissions. Approve to add them to Managed Stylists.
      </p>

      {/* Key + refresh */}
      <div className="bg-white rounded-2xl border shadow-sm p-4 mb-8">
        <label className="block text-sm font-medium mb-2">Admin API Key</label>

        <div className="flex flex-col md:flex-row gap-3">
          <input
            value={adminKey}
            onChange={(e) => setAdminKey(e.target.value)}
            placeholder="Paste your x-admin-key value here"
            className="w-full md:flex-1 border rounded-lg px-3 py-2"
          />
          <button
            type="button"
            onClick={fetchApplications}
            disabled={loading || !adminKey}
            className="px-4 py-2 rounded-lg bg-black text-white disabled:opacity-50"
          >
            {loading ? "Loading..." : "Refresh"}
          </button>
        </div>

        {status.message ? (
          <div
            className={`mt-3 text-sm ${
              status.type === "error"
                ? "text-red-600"
                : status.type === "success"
                ? "text-green-700"
                : "text-gray-600"
            }`}
          >
            {status.message}
          </div>
        ) : null}

        <div className="mt-3 text-xs text-gray-500">
          API base: <span className="font-mono">{API_BASE}</span>
        </div>
      </div>

      {/* Applications */}
      {applications.length === 0 ? (
        <div className="text-gray-700">No applications yet.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {applications.map((app) => {
            console.log("APP DATA:", app);
            const id = idSafe(app.id);
            const st = normalizeStatus(app.status);
            const isApproved = st === "approved";

            // ✅ normalize location fields
            const lat = app.lat ?? app.latitude ?? null;
            const lng = app.lng ?? app.longitude ?? null;

            return (
              <div key={id || Math.random()} className="bg-white rounded-2xl border shadow-sm p-5">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div>
                    <div className="text-xl font-semibold">
                      {app.fullName || app.name || "(No name)"}{" "}
                      <span className="text-sm font-normal text-gray-500">
                        ({st})
                      </span>
                    </div>

                    {(!lat || !lng) && (
                      <div className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded mt-2 inline-block">
                        ⚠️ Location needs verification
                      </div>
                    )}

                    <div className="text-sm text-gray-700 mt-1">
                      {app.email || ""} • {app.phone || "No phone"} • {app.city || ""} • Tier:{" "}
                      {app.tier_requested || app.tierRequested || "free"}
                    </div>

                    <div className="text-sm text-gray-700 mt-1">
                      Specialties: {safeArray(app.specialties).join(", ") || "—"}
                    </div>

                    <div className="text-xs text-gray-500 mt-2">
                      {id || "Missing id"} • {app.createdAt || ""}
                    </div>

                    <div className="text-sm text-gray-700 mt-2">
                      <strong>Bio:</strong> {app.bio || "—"}
                    </div>

                    {app.licenseUrl && (
                      <div className="mt-2">
                        <a
                          href={app.licenseUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 underline text-sm"
                        >
                          View License Document
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                {/* Message box */}
                  <div className="mt-3">
                    <textarea
                      placeholder="Message to stylist (optional)"
                      className="w-full border rounded-lg px-3 py-2 text-sm"
                      onChange={(e) => {
                        app._message = e.target.value;
                      }}
                    />
                  </div>

                  {/* Buttons */}
                  <div className="flex items-center gap-2 mt-3">
                    <button
                      type="button"
                      onClick={() => approveStylist(id)}
                      disabled={loading || !adminKey || !id || isApproved}
                      className={`px-4 py-2 rounded-lg font-semibold text-white disabled:opacity-50 ${
                        isApproved ? "bg-emerald-400" : "bg-emerald-600 hover:bg-emerald-700"
                      }`}
                    >
                      {isApproved ? "Approved" : "Approve"}
                    </button>

                    <button
                      type="button"
                      onClick={() => rejectStylist(id)}
                      disabled={loading || !adminKey}
                      className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold"
                    >
                      Reject
                    </button>

                    <button
                      type="button"
                      onClick={() => requestInfo(id, app._message)}
                      disabled={loading || !adminKey}
                      className="px-4 py-2 rounded-lg bg-yellow-500 hover:bg-yellow-600 text-white font-semibold"
                    >
                      Request Info
                    </button>
                  </div>

                {/* Photos */}
                <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm font-semibold mb-2">Headshot</div>
                    {app.photoUrl ? (
                      <img
                        src={app.photoUrl}
                        alt="Headshot"
                        className="w-full h-48 object-cover rounded-lg border"
                      />
                    ) : (
                      <div className="text-sm text-gray-500">No headshot.</div>
                    )}
                  </div>

                  <div>
                    <div className="text-sm font-semibold mb-2">Work Photos</div>
                    {safeArray(app.gallery).length ? (
                      <div className="grid grid-cols-3 gap-2">
                        {safeArray(app.gallery).slice(0, 9).map((url) => (
                          <img
                            key={url}
                            src={url}
                            alt="Work"
                            className="h-20 w-full object-cover rounded border"
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="text-sm text-gray-500">No work photos.</div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pending Reviews */}
      <div className="mt-14">
        <h2 className="text-2xl font-bold mb-4">
          Pending Reviews
        </h2>

        {reviews.length === 0 ? (

          <div className="text-gray-600">
            No pending reviews.
          </div>

        ) : (

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {reviews.map((review) => (

              <div
                key={review.id}
                className="bg-white rounded-2xl border shadow-sm p-6"
              >

                <div className="flex items-center justify-between mb-3">

                  <div>
                    <div className="font-semibold text-lg">
                      {review.reviewer_name}
                    </div>

                    <div className="text-sm text-gray-500">
                      {review.reviewer_email}
                    </div>
                  </div>

                  <div className="text-[#F4A731] text-lg">
                    {"★".repeat(review.rating || 0)}
                  </div>

                </div>

                <div className="text-sm text-gray-500 mb-3">
                  Stylist:
                  {" "}
                  {review.stylist?.full_name || "Unknown"}
                </div>

                <div className="text-sm text-gray-500 mb-3">
                  Date of Service:
                  {" "}
                  {review.service_date || "Not provided"}
                </div>

                <div className="border rounded-xl p-4 bg-gray-50 text-gray-700">
                  {review.review_text}
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Stylist Response
                  </label>

                  <textarea
                    placeholder="Write a response to this review..."
                    rows={4}
                    value={responses[review.id] || ""}
                    onChange={(e) =>
                      setResponses((prev) => ({
                        ...prev,
                        [review.id]: e.target.value,
                      }))
                    }
                    className="w-full border rounded-lg px-3 py-2"
                  />

                  <button
                    type="button"
                    onClick={() => saveResponse(review.id)}
                    className="mt-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold"
                  >
                    Save Response
                  </button>
                </div>

                <div className="flex gap-3 mt-5">

                  <button
                    onClick={() => approveReview(review.id)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-semibold"
                  >
                    Approve
                  </button>

                  <button
                    onClick={() => rejectReview(review.id)}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold"
                  >
                    Reject
                  </button>

                </div>

              </div>

            ))}

          </div>

        )}
      </div>
    </div>
  );
}

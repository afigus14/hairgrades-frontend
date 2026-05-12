// src/pages/AdminReviewPage.jsx
import React, { useEffect, useMemo, useState } from "react";

console.log("AdminReviewPage render", window.location.pathname);

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
      const res = await fetch(`${API_BASE}/api/stylists`, {
        method: "GET",
        headers: {
          "x-admin-key": adminKey,
        },
      });

      const result = await res.json();

      if (!res.ok || !result?.stylists) {
        throw new Error("Failed to load applications");
      }

      // ✅ Only pending
      const pending = result.stylists.filter(
        (s) => s.status === "pending"
      );

      setApplications(
        safeArray(pending).map((s) => ({
          ...s,
          name: s.full_name || s.name,
          fullName: s.full_name || s.fullName,
          photoUrl: s.photo_urls?.[0] || null,
          gallery: s.photo_urls || [],
          licenseUrl: s.license_url || s.licenseUrl,
          yearsExperience: s.years_experience || s.yearsExperience,
          bio: s.bio || "",
        }))
      );

      setStatus({
        type: "success",
        message: `Loaded ${pending.length} application(s).`,
      });
    } catch (e) {
      setApplications([]);
      setStatus({ type: "error", message: e?.message || "Server error" });
    } finally {
      setLoading(false);
    }
  }

  async function handleAction(id, action, message = "") {
    if (!adminKey) {
      setStatus({ type: "error", message: "Enter your admin key first." });
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/applications/action`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Admin-Key": adminKey,
        },
        body: JSON.stringify({ id, action, message }),
      });

      if (!res.ok) throw new Error("Action failed");

      setStatus({
        type: "success",
        message: `Action "${action}" completed.`,
      });

      await fetchApplications(); // refresh list
    } catch (e) {
      setStatus({ type: "error", message: e.message });
    }
  }

  useEffect(() => {
    // only auto-load if key exists; avoids confusing 401 spam
    if (adminKey) fetchApplications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stamp = useMemo(() => {
    const d = new Date();
    return `AdminReviewPage.jsx • ${d.toLocaleString()}`;
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      {/* Build stamp */}
      <div className="mb-6 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-xs text-green-800">
        <div className="font-semibold">THIS PAGE IS RENDERING AdminReviewPage.jsx</div>
        <div className="opacity-80">BUILD STAMP: {stamp}</div>
      </div>

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
        <div className="space-y-6">
          {applications.map((app) => {
            const id = idSafe(app.id);
            const st = normalizeStatus(app.status);
            const isApproved = st === "approved";

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

                    <div className="text-sm text-gray-700 mt-1">
                      {app.email || ""} • {app.phone || "No phone"} • {app.city || ""} • Tier:{" "}
                      {app.tierRequested || "free"}
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
                      onClick={() => handleAction(id, "approve")}
                      disabled={loading || !adminKey || !id || isApproved}
                      className={`px-4 py-2 rounded-lg font-semibold text-white disabled:opacity-50 ${
                        isApproved ? "bg-emerald-400" : "bg-emerald-600 hover:bg-emerald-700"
                      }`}
                    >
                      {isApproved ? "Approved" : "Approve"}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleAction(id, "reject", app._message)}
                      disabled={loading || !adminKey}
                      className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold"
                    >
                      Reject
                    </button>

                    <button
                      type="button"
                      onClick={() => handleAction(id, "request_info", app._message)}
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
    </div>
  );
}

// src/pages/AdminStylistsPage.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

const PAGE_SIZE = 50;

function normalizeStatus(s) {
  return String(s || "approved").toLowerCase();
}

function displayName(s) {
  return s?.full_name || s?.name || "(No name)";
}

export default function AdminStylistsPage() {
  const navigate = useNavigate();

  const [adminKey, setAdminKey] = useState(
    localStorage.getItem("stylegrades_admin_key") || ""
  );

  const [stylists, setStylists] = useState([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: "idle", message: "" });
  const [confirmAction, setConfirmAction] = useState(null);

  const [page, setPage] = useState(1);
  const [totalStylists, setTotalStylists] = useState(0);

  // Persist admin key locally
  useEffect(() => {
    localStorage.setItem("stylegrades_admin_key", adminKey);
  }, [adminKey]);

  useEffect(() => {
    loadStylists(page);
  }, [page]);

  async function loadStylists(pageToLoad = page) {
    setLoading(true);

    const from = (pageToLoad - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    const { data, error, count } = await supabase
      .from("stylists")
      .select("*", { count: "exact" })
      .order("full_name", { ascending: true })
      .range(from, to);

    if (error) {
      console.error("Error loading stylists:", error);
      setStylists([]);
    } else {
      const normalized = (data || []).map((s) => ({
        ...s,
        name: s.full_name,
        photoUrl: s.photo_url,
      }));

      setStylists(normalized);
      setTotalStylists(count || 0);
    }

    setLoading(false);
  }

  // Local patch (feature, status, tier)
  function patchStylist(id, patch) {
    setStylists((prev) =>
      prev.map((s) =>
        String(s.id) === String(id) ? { ...s, ...patch } : s
      )
    );

    setStatus({
      type: "success",
      message: "Updated locally (no backend connected).",
    });
  }

  async function deleteStylist(id) {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/admin/deleteStylist`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id,
            adminKey,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Delete failed");
        return;
      }

      await loadStylists(page);
    } catch (err) {
      console.error("Delete error:", err);
      alert("Delete failed");
    }
  }

  async function updateTier(id, tier) {
    const { error } = await supabase
      .from("stylists")
      .update({ tier: tier })
      .eq("id", id);

    if (error) {
      console.error("Tier update failed:", error);
      alert("Tier update failed");
    } else {
      loadStylists(page);
    }
  }

  function Badge({ children, color }) {
    return (
      <span className={`text-xs px-2 py-1 rounded-full font-medium ${color}`}>
        {children}
      </span>
    );
  }

  const totalPages = Math.max(
    1,
    Math.ceil(totalStylists / PAGE_SIZE)
  );

  const firstRecord =
    totalStylists === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;

  const lastRecord = Math.min(
    page * PAGE_SIZE,
    totalStylists
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-6">
        Admin — Manage Stylists
      </h1>

      {/* Admin Key */}
      <div className="bg-white border rounded-xl p-4 mb-6 shadow-sm">
        <label className="block text-sm font-medium mb-2">
          Admin API Key
        </label>

        <div className="flex gap-3">
          <input
            value={adminKey}
            onChange={(e) => setAdminKey(e.target.value)}
            className="flex-1 border rounded-lg px-3 py-2"
          />

          <button
            onClick={() => loadStylists(page)}
            className="px-4 py-2 rounded-lg bg-black text-white"
          >
            Refresh
          </button>
        </div>

        {status.message && (
          <div
            className={`mt-3 text-sm ${
              status.type === "error"
                ? "text-red-600"
                : "text-green-600"
            }`}
          >
            {status.message}
          </div>
        )}
      </div>

      {/* Pagination Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div className="text-sm text-gray-700">
          Showing{" "}
          <strong>
            {firstRecord.toLocaleString()}–{lastRecord.toLocaleString()}
          </strong>{" "}
          of{" "}
          <strong>{totalStylists.toLocaleString()}</strong>{" "}
          stylists
        </div>

        <div className="text-sm text-gray-600">
          Page {page.toLocaleString()} of{" "}
          {totalPages.toLocaleString()}
        </div>
      </div>

      {/* Stylists List */}
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-6 text-gray-500">
            Loading stylists...
          </div>
        ) : (
          <div className="divide-y">
            {stylists.map((s) => {
              const st = normalizeStatus(s.status);
              const tier = s.tier || "free";

              return (
                <div
                  key={s.id}
                  className="p-6 flex flex-col md:flex-row md:justify-between md:items-center gap-6"
                >
                  <div className="flex gap-4 items-center">
                    <div className="h-16 w-16 rounded-xl overflow-hidden border bg-gray-100">
                      {s.photoUrl ? (
                        <img
                          src={s.photoUrl}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-xs text-gray-500">
                          No Photo
                        </div>
                      )}
                    </div>

                    <div>
                      <div className="text-lg font-semibold">
                        {displayName(s)}
                      </div>

                      <div className="flex gap-2 flex-wrap mt-1">
                        <Badge
                          color={
                            st === "approved"
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-200 text-gray-600"
                          }
                        >
                          {st === "approved" ? "Active" : "Inactive"}
                        </Badge>

                        {s.featured && (
                          <Badge color="bg-yellow-100 text-yellow-700">
                            Featured
                          </Badge>
                        )}

                        <Badge
                          color={
                            tier === "premium"
                              ? "bg-purple-100 text-purple-700"
                              : tier === "pro"
                              ? "bg-indigo-100 text-indigo-700"
                              : "bg-blue-100 text-blue-700"
                          }
                        >
                          {tier === "premium"
                            ? "Premium"
                            : tier === "pro"
                            ? "Pro"
                            : "Free"}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 items-center">
                    <select
                      value={s.tier || "free"}
                      onChange={(e) =>
                        updateTier(s.id, e.target.value)
                      }
                      className="border rounded px-2 py-1 text-sm"
                    >
                      <option value="free">Free</option>
                      <option value="pro">Pro</option>
                      <option value="premium">
                        Premium
                      </option>
                    </select>

                    <button
                      onClick={() =>
                        navigate(`/admin/stylists/${s.id}`)
                      }
                      className="px-4 py-2 rounded-lg bg-gray-800 text-white text-sm"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() =>
                        setConfirmAction({
                          type: "delete",
                          stylist: s,
                        })
                      }
                      className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}

            {stylists.length === 0 && (
              <div className="p-6 text-gray-500">
                No stylists found.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
        <button
          onClick={() =>
            setPage((current) => Math.max(1, current - 1))
          }
          disabled={page <= 1 || loading}
          className={`px-5 py-2 rounded-lg border font-medium ${
            page <= 1 || loading
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-white text-gray-800 hover:bg-gray-50"
          }`}
        >
          ← Previous
        </button>

        <div className="text-sm text-gray-600">
          Page{" "}
          <strong>{page.toLocaleString()}</strong>{" "}
          of{" "}
          <strong>{totalPages.toLocaleString()}</strong>
        </div>

        <button
          onClick={() =>
            setPage((current) =>
              Math.min(totalPages, current + 1)
            )
          }
          disabled={page >= totalPages || loading}
          className={`px-5 py-2 rounded-lg border font-medium ${
            page >= totalPages || loading
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-white text-gray-800 hover:bg-gray-50"
          }`}
        >
          Next →
        </button>
      </div>

      {/* Confirmation Modal */}
      {confirmAction && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
            <h3 className="text-lg font-semibold mb-3">
              Confirm Delete
            </h3>

            <p className="text-sm mb-6">
              Permanently delete{" "}
              <strong>
                {displayName(confirmAction.stylist)}
              </strong>
              ?
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmAction(null)}
                className="px-4 py-2 border rounded-lg text-sm"
              >
                Cancel
              </button>

              <button
                onClick={() => {
                  deleteStylist(confirmAction.stylist.id);
                  setConfirmAction(null);
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
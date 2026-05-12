// src/pages/AdminStylistsPage.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

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

  // Persist admin key locally
  useEffect(() => {
    localStorage.setItem("stylegrades_admin_key", adminKey);
  }, [adminKey]);

  useEffect(() => {
    loadStylists();
  }, []);

  async function loadStylists() {
    setLoading(true);

    const { data, error } = await supabase
      .from("stylists")
      .select("*")
      .order("full_name", { ascending: true });

    if (error) {
      console.error("Error loading stylists:", error);
      setStylists([]);
    } else {

      const normalized = (data || []).map((s) => ({
        ...s,
        name: s.full_name,
        photoUrl: s.photo_url
      }));

      setStylists(normalized);
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
      const res = await fetch("/api/admin/deleteStylist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          id,
          adminKey
        })
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Delete failed");
        return;
      }

      await loadStylists();

    } catch (err) {
      console.error("Delete error:", err);
      alert("Delete failed");
    }
  }

  // ⭐ ADD THIS HERE
  async function updateTier(id, tier) {
    const { error } = await supabase
      .from("stylists")
      .update({ tier: tier })
      .eq("id", id);

    if (error) {
      console.error("Tier update failed:", error);
      alert("Tier update failed");
    } else {
      loadStylists();
    }
  }

  function Badge({ children, color }) {
    return (
      <span className={`text-xs px-2 py-1 rounded-full font-medium ${color}`}>
        {children}
      </span>
    );
  }

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
            onClick={loadStylists}
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
                    <button
                      onClick={() =>
                        navigate(`/admin/stylists/${s.id}`)
                      }
                      className="px-4 py-2 rounded-lg bg-gray-800 text-white text-sm"
                    >

                    <select
                      value={s.tier || "free"}
                      onChange={(e) => updateTier(s.id, e.target.value)}
                      className="border rounded px-2 py-1 text-sm"
                    >
                      <option value="free">Free</option>
                      <option value="pro">Pro</option>
                      <option value="premium">Premium</option>
                    </select>  
                      
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
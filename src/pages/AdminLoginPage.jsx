// src/pages/AdminLoginPage.jsx
import React, { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  setAdminAuthed,
  setAdminKey,
  verifyAdminKey,
} from "../auth/adminAuth";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "";

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const from = useMemo(() => {
    const st = location.state || {};
    return st.from || "/admin";
  }, [location.state]);

  const [adminKey, setKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: "idle", message: "" });

  async function handleLogin(e) {
    e.preventDefault();
    setStatus({ type: "idle", message: "" });

    const key = String(adminKey || "").trim();
    if (!key) {
      setStatus({ type: "error", message: "Paste your admin key." });
      return;
    }

    setLoading(true);
    try {
      await verifyAdminKey(API_BASE, key);
      setAdminKey(key);
      setAdminAuthed(true);

      setStatus({ type: "success", message: "Logged in." });
      navigate(from, { replace: true });
    } catch (err) {
      setAdminAuthed(false);
      setStatus({
        type: "error",
        message: err?.message || "Login failed.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-12">
      <div className="rounded-2xl border bg-white shadow-sm p-6">
        <h1 className="text-2xl font-bold">Admin Login</h1>
        <p className="text-sm text-gray-600 mt-1">
          Enter your admin API key to access Stylegrades administration.
        </p>

        {status.message ? (
          <div
            className={`mt-4 text-sm rounded-lg px-3 py-2 border ${
              status.type === "error"
                ? "text-red-700 bg-red-50 border-red-200"
                : status.type === "success"
                ? "text-emerald-800 bg-emerald-50 border-emerald-200"
                : "text-gray-700 bg-gray-50 border-gray-200"
            }`}
          >
            {status.message}
          </div>
        ) : null}

        <form onSubmit={handleLogin} className="mt-5 space-y-4">
          <label className="block">
            <span className="text-sm font-medium">Admin API Key</span>
            <input
              value={adminKey}
              onChange={(e) => setKey(e.target.value)}
              placeholder="stylegrades_admin_..."
              className="mt-1 w-full border rounded-lg px-3 py-2"
              autoComplete="off"
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-black text-white py-2 font-semibold disabled:opacity-50"
          >
            {loading ? "Verifying…" : "Log in"}
          </button>

          <div className="text-xs text-gray-500">
            API base: <span className="font-mono">{API_BASE}</span>
          </div>
        </form>
      </div>
    </div>
  );
}

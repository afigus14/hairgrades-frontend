// src/pages/AdminDashboardPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import seedStylists from "../data/stylists-with-coords.json";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "";

function safeArray(v) {
  return Array.isArray(v) ? v : [];
}

function pct(n) {
  if (!Number.isFinite(n)) return "0%";
  return `${Math.round(n * 1000) / 10}%`;
}

function num(n) {
  const x = Number(n);
  return Number.isFinite(x) ? x : 0;
}

function formatInt(n) {
  return new Intl.NumberFormat().format(num(n));
}

function alphaName(fullName) {
  const full = String(fullName || "").trim().replace(/\s+/g, " ");
  if (!full) return "";
  const parts = full.split(" ");
  const last =
    parts.length > 1 ? parts[parts.length - 1] : parts[0];
  const rest =
    parts.length > 1 ? parts.slice(0, -1).join(" ") : "";
  return `${last}, ${rest}`.toLowerCase();
}

export default function AdminDashboardPage() {
  const [adminKey, setAdminKey] = useState(
    localStorage.getItem("stylegrades_admin_key") || ""
  );

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: "idle", message: "" });

  const [analytics, setAnalytics] = useState(null);
  const [managedStylists, setManagedStylists] = useState([]);

  useEffect(() => {
    localStorage.setItem("stylegrades_admin_key", adminKey);
  }, [adminKey]);

  const headers = useMemo(
    () => ({ "x-admin-key": adminKey }),
    [adminKey]
  );

  const stylistNameMap = useMemo(() => {
    const m = new Map();

    safeArray(seedStylists).forEach((s) => {
      const id = String(s.id);
      const name = s.name || s.fullName || "";
      if (id && name) m.set(id, name);
    });

    safeArray(managedStylists).forEach((s) => {
      const id = String(s.id);
      const name = s.name || s.fullName || "";
      if (id && name) m.set(id, name);
    });

    return m;
  }, [managedStylists]);

  async function fetchManagedStylists() {
    const res = await fetch(`${API_BASE}/api/public/stylists`);
    if (!res.ok) return [];
    const data = await res.json().catch(() => ({}));
    if (!data?.ok) return [];
    return safeArray(data.stylists);
  }

  async function fetchAnalytics() {
    if (!adminKey) {
      throw new Error(
        "Enter your admin key to view analytics."
      );
    }

    const res = await fetch(
      `${API_BASE}/api/admin/analytics`,
      { headers }
    );
    const data = await res.json().catch(() => ({}));

    if (!res.ok || !data?.ok) {
      throw new Error(
        data?.error || "Failed to load analytics."
      );
    }

    return data;
  }

  async function refresh() {
    setLoading(true);
    setStatus({ type: "idle", message: "" });

    try {
      const [managed, an] = await Promise.all([
        fetchManagedStylists(),
        fetchAnalytics(),
      ]);

      setManagedStylists(managed);
      setAnalytics(an);

      setStatus({
        type: "success",
        message: "Dashboard loaded.",
      });
    } catch (e) {
      setStatus({
        type: "error",
        message: e?.message || "Server error",
      });
      setAnalytics(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (adminKey) refresh();
  }, []);

  const kpis = useMemo(() => {
    const totals = analytics?.totals || {};
    const overall = analytics?.overall || {};
    return {
      views: num(totals.views),
      profileClicks: num(totals.profileClicks),
      contactClicks: num(totals.contactClicks),
      favorites: num(totals.favorites),
      profileClickRate: num(overall.profileClickRate),
      contactRate: num(overall.contactRate),
      contactFromProfileRate: num(
        overall.contactFromProfileRate
      ),
    };
  }, [analytics]);

  const rankings = useMemo(() => {
    const r = analytics?.rankings || {};
    const decorate = (rows) =>
      safeArray(rows).map((row) => {
        const id = String(row.stylistId);
        const name =
          stylistNameMap.get(id) || id;
        return { ...row, displayName: name };
      });

    return {
      topByViews: decorate(r.topByViews),
      topByContacts: decorate(r.topByContacts),
      topByContactRate: decorate(r.topByContactRate),
    };
  }, [analytics, stylistNameMap]);

  const tableRows = useMemo(() => {
    const rows = safeArray(analytics?.byStylist).map(
      (row) => {
        const id = String(row.stylistId);
        const name =
          stylistNameMap.get(id) || id;
        return {
          ...row,
          displayName: name,
        };
      }
    );

    rows.sort((a, b) => {
      const ac = num(a?.counts?.contactClicks);
      const bc = num(b?.counts?.contactClicks);
      if (ac !== bc) return bc - ac;

      const av = num(a?.counts?.views);
      const bv = num(b?.counts?.views);
      if (av !== bv) return bv - av;

      return alphaName(a.displayName).localeCompare(
        alphaName(b.displayName)
      );
    });

    return rows;
  }, [analytics, stylistNameMap]);

  const trendData = safeArray(analytics?.trend);
  const tierPieData = Object.entries(
    analytics?.tierCounts || {}
  ).map(([tier, count]) => ({
    name: tier,
    value: num(count),
  }));

  const topContactBar =
    rankings.topByContacts.slice(0, 5).map(
      (row) => ({
        name: row.displayName,
        contacts: num(
          row.counts.contactClicks
        ),
      })
    );

  return (
    <div className="max-w-7xl mx-auto px-8 py-12">
      <div className="flex flex-col items-center w-full">

      {/* HEADER */}
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold">
          Admin Dashboard
        </h1>

        <p className="text-gray-600 mt-2">
          Revenue-ready analytics: views → profile clicks → contact clicks.
        </p>

        <div className="mt-6 flex flex-col items-center gap-3">
          <label className="text-sm font-medium">
            Admin API Key
          </label>

          <input
            value={adminKey}
            onChange={(e) => setAdminKey(e.target.value)}
            className="border rounded-lg px-3 py-2 w-80 text-center"
          />

          <button
            onClick={refresh}
            disabled={loading}
            className="rounded-lg bg-black text-white px-6 py-2"
          >
            {loading ? "Loading..." : "Load dashboard"}
          </button>
        </div>
      </div>

      {/* KPI CARDS */}
      <div className="mb-12 space-y-8">

        {/* PRIMARY ROW */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-4xl mx-auto">
          <KpiCard
            label="Total Views"
            value={formatInt(kpis.views)}
          />
          <KpiCard
            label="Profile Clicks"
            value={formatInt(kpis.profileClicks)}
          />
          <KpiCard
            label="Contact Clicks"
            value={formatInt(kpis.contactClicks)}
          />
        </div>

        {/* SECONDARY ROW */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 w-full max-w-4xl mx-auto">

          <KpiCard
            label="Favorites"
            value={formatInt(kpis.favorites)}
          />

          <div className="bg-gray-50 border rounded-xl p-4 text-sm">
            <div className="text-xs uppercase text-gray-500">
              Monthly Revenue
            </div>
            <div className="text-xl font-bold mt-1">
              ${formatInt(analytics?.mrr || 0)}
            </div>
          </div>

          <div className="bg-gray-50 border rounded-xl p-4 text-sm">
            <div className="text-xs uppercase text-gray-500">
              3 Month Forecast
            </div>
            <div className="text-xl font-bold mt-1">
              ${formatInt(analytics?.forecast3mo || 0)}
            </div>
          </div>

          <div className="bg-gray-50 border rounded-xl p-4 text-sm">
            <div className="text-xs uppercase text-gray-500">
              Ad CTR
            </div>
            <div className="text-xl font-bold mt-1">
              {pct(analytics?.ads?.ctr || 0)}
            </div>
          </div>

        </div>

      </div>

    </div>
  </div>
);
}

function KpiCard({ label, value }) {
  return (
    <div className="bg-white border rounded-2xl p-4 shadow-sm">
      <div className="text-xs uppercase text-gray-500">
        {label}
      </div>
      <div className="text-4xl font-bold mt-2">
        {value}
      </div>
    </div>
  );
}

function ChartCard({ title, children }) {
  return (
    <div className="bg-white border rounded-2xl p-5 shadow-sm mb-10">
      <h3 className="font-semibold mb-4">
        {title}
      </h3>
      {children}
    </div>
  );
}
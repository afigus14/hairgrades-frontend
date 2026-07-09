// src/pages/AdminDashboardPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
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

function getWaitingDays(dateString) {
  if (!dateString) return 0;

  const requested = new Date(dateString);
  const today = new Date();

  return Math.floor(
    (today - requested) / (1000 * 60 * 60 * 24)
  );
}

function getWaitingLabel(dateString) {
  const days = getWaitingDays(dateString);

  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";

  return `${days} days`;
}

function getWaitingColor(dateString) {
  const days = getWaitingDays(dateString);

  if (days >= 8) return "text-red-600";
  if (days >= 4) return "text-amber-600";

  return "text-emerald-600";
}

function getGreeting() {
  const hour = new Date().getHours();

  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";

  return "Good evening";
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

  const [pendingStylists, setPendingStylists] = useState([]);
  const [needsInfoStylists, setNeedsInfoStylists] = useState([]);

  const [platformStats, setPlatformStats] = useState({
    stylists: 0,
    pendingStylists: 0,
    needsInformationStylists: 0,
    reviews: 0,
    pendingReviews: 0,
    advertisers: 0,
    cities: 0,
  });

  const [advertisers, setAdvertisers] = useState([]);

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
    const { data, error } = await supabase
      .from("stylists")
      .select("*");

    if (error) {
      console.error("Error loading stylists:", error);
      return [];
    }

    return data || [];
  }

  async function fetchAdvertisers() {
    const { data, error } = await supabase
      .from("advertisers")
      .select("*");

    if (error) {
      console.error("Error loading advertisers:", error);
      return [];
    }

    return data || [];
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

  async function loadPlatformStats() {
    const [
      stylistResult,
      pendingStylistResult,
      needsInfoResult,
      reviewResult,
      pendingReviewResult,
      advertiserResult,
      citiesResult,
    ] = await Promise.all([

      supabase
        .from("stylists")
        .select("*", { count: "exact", head: true })
        .eq("status", "approved"),

      supabase
        .from("stylists")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending"),

      supabase
        .from("stylists")
        .select("*", { count: "exact", head: true })
        .eq("status", "needs_information"),  

      supabase
        .from("reviews")
        .select("*", { count: "exact", head: true })
        .eq("status", "approved"),

      supabase
        .from("reviews")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending"),

      supabase
        .from("advertisers")
        .select("*", { count: "exact", head: true })
        .eq("status", "approved")
        .eq("is_active", true),

      supabase
        .from("stylists")
        .select("city")
        .eq("status", "approved"),

    ]);

    console.log("Stylist Result:", stylistResult);
    console.log("Pending Stylist Result:", pendingStylistResult);
    console.log("Review Result:", reviewResult);
    console.log("Advertiser Result:", advertiserResult);
    console.log("Cities Result:", citiesResult);  

    const stylistCount = stylistResult.count || 0;
    const pendingStylistCount = pendingStylistResult.count || 0;
    const needsInformationCount =
      needsInfoResult.count || 0;
    const reviewCount = reviewResult.count || 0;
    const pendingReviewCount = pendingReviewResult.count || 0;
    const advertiserCount = advertiserResult.count || 0;
    const cities = citiesResult.data || [];

    const uniqueCities = new Set(
      (cities || [])
        .map((c) => c.city)
        .filter(Boolean)
    );

    setPlatformStats({
      stylists: stylistCount || 0,
      pendingStylists: pendingStylistCount || 0,
      needsInformationStylists: needsInformationCount || 0,
      reviews: reviewCount || 0,
      pendingReviews: pendingReviewCount || 0,
      advertisers: advertiserCount || 0,
      cities: uniqueCities.size,
    });
  }

  async function refresh() {
    setLoading(true);
    setStatus({ type: "idle", message: "" });

    try {
      const [managed, ads, analyticsData] = await Promise.all([
        fetchManagedStylists(),
        fetchAdvertisers(),
        fetchAnalytics(),
      ]);

      setManagedStylists(managed);

      setPendingStylists(
        managed.filter((s) => s.status === "pending")
      );

      setNeedsInfoStylists(
        managed.filter(
          (s) => s.status === "needs_information"
        )
      );

      setAdvertisers(ads);

      setAnalytics(analyticsData);

      await loadPlatformStats();

      setStatus({
        type: "success",
        message: "Dashboard loaded.",
      });
    } catch (e) {
      console.error(e);

      setStatus({
        type: "error",
        message: e?.message || "Server error",
      });
    } finally {
      setLoading(false);
    }
  }   // <-- ADD THIS

  useEffect(() => {
    if (adminKey) {
      refresh();
    }
  }, [adminKey]);

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

  const dailySummary = (() => {
    const pending = platformStats.pendingStylists;
    const actionRequired = platformStats.needsInformationStylists;
    const reviews = platformStats.pendingReviews;

    if (
      pending === 0 &&
      actionRequired === 0 &&
      reviews === 0
    ) {
      return "🎉 Great job! There are no applications or reviews requiring your attention today.";
    }

    const parts = [];

    if (pending > 0) {
      parts.push(
        `${pending} application${pending === 1 ? "" : "s"} awaiting review`
      );
    }

    if (actionRequired > 0) {
      parts.push(
        `${actionRequired} applicant${actionRequired === 1 ? "" : "s"} need${actionRequired === 1 ? "s" : ""} to respond`
      );
    }

    if (reviews > 0) {
      parts.push(
        `${reviews} review${reviews === 1 ? "" : "s"} pending approval`
      );
    }

    return `You have ${parts.join(", ")}.`;
  })();  

  return (
    <div className="max-w-7xl mx-auto px-8 py-12">
      <div className="flex flex-col items-center w-full">

      {/* HEADER */}

      <div className="text-center mb-12">

        <div className="text-sm font-semibold tracking-[0.35em] uppercase text-[#C9971A]">
          Stylegrades
        </div>

        <h1 className="mt-2 text-5xl font-bold text-[#102A43]">
          Admin Dashboard
        </h1>

        <p className="mt-3 text-2xl font-semibold text-[#334E68]">
          {getGreeting()}, Dr. Figus.
        </p>

        <p className="mt-2 text-[#52606D] text-lg max-w-3xl mx-auto">
          {dailySummary}
        </p>

        {!adminKey && (
        
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
        )}

        {/* QUICK ACTIONS */}

        <div className="mt-10 w-full max-w-5xl mx-auto">

          <h2 className="text-2xl font-bold text-[#102A43] text-center mb-6">
            Quick Actions
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            <Link
              to="/admin/stylists"
              className="bg-white rounded-2xl border border-[#D9E2EC] shadow-sm p-6 hover:shadow-md transition"
            >
              <div className="text-4xl mb-3">💇</div>

              <h3 className="text-xl font-semibold text-[#102A43]">
                Manage Stylists
              </h3>

              <p className="mt-2 text-[#52606D]">
                Approve, edit, verify and manage stylist profiles.
              </p>
            </Link>

            <Link
              to="/admin/review"
              className="bg-white rounded-2xl border border-[#D9E2EC] shadow-sm p-6 hover:shadow-md transition"
            >
              <div className="text-4xl mb-3">⭐</div>

              <h3 className="text-xl font-semibold text-[#102A43]">
                Review Queue
              </h3>

              <p className="mt-2 text-[#52606D]">
                Approve, reject and moderate customer reviews.
              </p>
            </Link>

            <Link
              to="/admin/advertisers"
              className="bg-white rounded-2xl border border-[#D9E2EC] shadow-sm p-6 hover:shadow-md transition"
            >
              <div className="text-4xl mb-3">📣</div>

              <h3 className="text-xl font-semibold text-[#102A43]">
                Advertisers
              </h3>

              <p className="mt-2 text-[#52606D]">
                Manage advertising campaigns and sponsorships.
              </p>
            </Link>

          </div>

        </div>
      </div>

      {/* PLATFORM SNAPSHOT */}

      <div className="mt-14 mb-12 w-full max-w-6xl mx-auto">

        <h2 className="text-2xl font-bold text-[#102A43] text-center mb-6">
          Platform Snapshot
        </h2>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">

          <div className="bg-white rounded-2xl border border-[#D9E2EC] shadow-sm p-6 text-center">
            <div className="text-sm uppercase tracking-wide text-[#7B8794]">
              Stylists
            </div>
            <div className="mt-3 text-4xl font-bold text-[#102A43]">
              {platformStats.stylists}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-[#D9E2EC] shadow-sm p-6 text-center">
            <div className="text-sm uppercase tracking-wide text-[#7B8794]">
              Reviews
            </div>
            <div className="mt-3 text-4xl font-bold text-[#102A43]">
              {platformStats.reviews}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-[#D9E2EC] shadow-sm p-6 text-center">
            <div className="text-sm uppercase tracking-wide text-[#7B8794]">
              Advertisers
            </div>
            <div className="mt-3 text-4xl font-bold text-[#102A43]">
              {platformStats.advertisers}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-[#D9E2EC] shadow-sm p-6 text-center">
            <div className="text-sm uppercase tracking-wide text-[#7B8794]">
              Cities Served
            </div>
            <div className="mt-3 text-4xl font-bold text-[#102A43]">
              {platformStats.cities}
            </div>
          </div>

        </div>

      </div>

      {/* NEEDS ATTENTION */}

      <div className="mb-14 w-full max-w-6xl mx-auto">

        <h2 className="text-2xl font-bold text-[#102A43] text-center mb-6">
          Needs Attention
        </h2>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">

          <div className="rounded-2xl bg-[#FEF3F2] border border-[#FECACA] p-6 text-center">
            <div className="text-sm uppercase tracking-wide text-[#991B1B]">
              Pending Reviews
            </div>

            <div className="mt-3 text-5xl font-bold text-[#991B1B]">
              {platformStats.pendingReviews}
            </div>
          </div>

          <Link
            to="/admin/review"
            className="rounded-2xl bg-[#FFF7E6] border border-[#F7D070] p-6 text-center hover:shadow-lg transition block"
          >
            <div className="text-sm uppercase tracking-wide text-[#92400E]">
              Pending Applications
            </div>

            <div className="mt-3 text-5xl font-bold text-[#92400E]">
              {platformStats.pendingStylists}
            </div>

            <div className="mt-4 text-sm font-semibold text-[#92400E]">
              Review →
            </div>
          </Link>

          <div
            onClick={() =>
              document
                .getElementById("action-required")
                ?.scrollIntoView({
                  behavior: "smooth",
                  block: "start",
                })
            }
            className="rounded-2xl bg-[#FFF4E5] border border-[#FDBA74] p-6 text-center hover:shadow-lg transition block cursor-pointer"
          >

            <div className="text-sm uppercase tracking-wide text-[#C2410C]">
              Action Required
            </div>

            <div className="mt-3 text-5xl font-bold text-[#C2410C]">
              {platformStats.needsInformationStylists}
            </div>

            <div className="mt-4 text-sm font-semibold text-[#C2410C]">
              Applicant Response Needed
            </div>

          </div>

          <div className="rounded-2xl bg-[#ECFDF3] border border-[#A7F3D0] p-6 text-center">
            <div className="text-sm uppercase tracking-wide text-[#047857]">
              Monthly Revenue
            </div>

            <div className="mt-3 text-5xl font-bold text-[#047857]">
              $
            </div>
          </div>

        </div>

      </div>

      {/* Pending Stylist List */}

      <div className="mt-10 w-full max-w-5xl mx-auto">

        <div className="flex items-center justify-between mb-4">

          <h2 className="text-2xl font-bold text-[#102A43]">
            Application Pipeline
          </h2>

          <Link
            to="/admin/stylists"
            className="rounded-lg bg-[#102A43] text-white px-4 py-2 hover:bg-[#1F3A5F]"
          >
            Manage Applications
          </Link>

        </div>

        <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">

          {pendingStylists.length === 0 ? (

            <div className="p-8 text-center text-gray-500">
              No stylists are waiting for approval.
            </div>

          ) : (

            <table className="w-full">

              <thead className="bg-gray-50">

                <tr>

                  <th className="text-left px-6 py-3">
                    Stylist
                  </th>

                  <th className="text-left px-6 py-3">
                    City
                  </th>

                  <th className="text-left px-6 py-3">
                    Tier
                  </th>

                  <th className="text-left px-6 py-3">
                    Status
                  </th>

                </tr>

              </thead>

              <tbody>

                {pendingStylists.slice(0,5).map((stylist) => (

                  <tr
                    key={stylist.id}
                    className="border-t"
                  >

                    <td className="px-6 py-4 font-medium">
                      {stylist.full_name}
                    </td>

                    <td className="px-6 py-4">
                      {stylist.city}
                    </td>

                    <td className="px-6 py-4">
                      {stylist.tier}
                    </td>

                    <td className="px-6 py-4">

                      <span className="rounded-full bg-yellow-100 text-yellow-800 px-3 py-1 text-sm">
                        Pending
                      </span>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          )}

        </div>

      </div>

      <div
        id="action-required"
        className="mt-10"
      >

        <div className="flex items-center justify-between mb-4">

          <h3 className="text-xl font-bold text-[#102A43]">
            Action Required by Applicant
          </h3>

        </div>

        <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">

          {needsInfoStylists.length === 0 ? (

            <div className="p-8 text-center text-gray-500">
              No applications are waiting for additional information.
            </div>

          ) : (

            <table className="w-full">

              <thead className="bg-gray-50">

                <tr>

                  <th className="text-left px-6 py-3">
                    Stylist
                  </th>

                  <th className="text-left px-6 py-3">
                    City
                  </th>

                  <th className="text-left px-6 py-3">
                    Tier
                  </th>

                  <th className="text-left px-6 py-3">
                    Status
                  </th>

                  <th className="text-left px-6 py-3">
                    Waiting
                  </th>

                  <th className="text-left px-6 py-3">
                    Last Contact
                  </th>

                  <th className="text-left px-6 py-3">
                    Action
                  </th>

                </tr>

              </thead>

              <tbody>

                {needsInfoStylists.map((stylist) => (

                  <tr
                    key={stylist.id}
                    className="border-t"
                  >

                    <td className="px-6 py-4 font-medium">
                      {stylist.full_name}
                    </td>

                    <td className="px-6 py-4">
                      {stylist.city}
                    </td>

                    <td className="px-6 py-4">
                      {stylist.tier}
                    </td>

                    <td className="px-6 py-4">

                      <span className="rounded-full bg-orange-100 text-orange-700 px-4 py-1.5 text-sm font-medium">
                        Action Required
                      </span>

                    </td>

                    <td className="px-6 py-4">

                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${
                          getWaitingDays(stylist.information_requested_at) >= 8
                            ? "bg-red-100 text-red-700"
                            : getWaitingDays(stylist.information_requested_at) >= 4
                            ? "bg-amber-100 text-amber-700"
                            : "bg-emerald-100 text-emerald-700"
                        }`}
                      >
                        {getWaitingLabel(stylist.information_requested_at)}
                      </span>

                    </td>

                    <td className="px-6 py-4 text-sm text-gray-600">

                      {stylist.information_requested_at
                        ? new Date(
                            stylist.information_requested_at
                          ).toLocaleDateString()
                        : "-"}

                    </td>

                    <td className="px-6 py-4">

                      <Link
                        to={`/admin/stylists/${stylist.id}`}
                        className="inline-flex items-center rounded-lg bg-[#1E3A5F] px-3 py-2 text-sm font-medium text-white hover:bg-[#16304d] transition"
                      >
                        View
                      </Link>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          )}

        </div>

      </div>
      
      {/* KPI CARDS */}
      <div className="mb-12 space-y-8">
        
        <div className="mt-16 mb-6">

          <h2 className="text-2xl font-bold text-[#102A43]">
            Platform Analytics
          </h2>

          <p className="text-gray-600 mt-1">
            Overall platform engagement and business performance.
          </p>

        </div>

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
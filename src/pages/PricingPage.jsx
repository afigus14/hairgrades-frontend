import React, { useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

/**
 * PricingPage.jsx
 * - Earthy/Healthgrades-like layout
 * - 3 cards: Free / Pro / Premium (0, 18, 29)
 * - Includes a pricing comparison table section
 * - Sends selected plan to Join page via query param (?plan=free|pro|premium)
 */

function classNames(...xs) {
  return xs.filter(Boolean).join(" ");
}

function PricingComparisonTable({ rows }) {
  return (
    <div className="mt-6 overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm">
      <div className="p-6 sm:p-8">
        <div className="flex flex-col gap-2">
          <h3 className="text-xl font-semibold text-stone-900">Compare plans</h3>
          <p className="text-sm text-stone-700">
            Everything is admin-reviewed for quality and trust. Upgrade anytime.
          </p>
        </div>

        {/* Desktop table */}
        <div className="mt-6 hidden md:block">
          <div className="grid grid-cols-4 gap-0 rounded-2xl border border-stone-200">
            <div className="p-4 text-sm font-semibold text-stone-900 bg-stone-50 rounded-tl-2xl">
              Features
            </div>
            <div className="p-4 text-sm font-semibold text-stone-900 bg-stone-50 text-center">
              Free
            </div>
            <div className="p-4 text-sm font-semibold text-stone-900 bg-stone-50 text-center">
              Pro
            </div>
            <div className="p-4 text-sm font-semibold text-stone-900 bg-stone-50 text-center rounded-tr-2xl">
              Premium
            </div>

            {rows.map((r, idx) => (
              <React.Fragment key={r.label}>
                <div
                  className={classNames(
                    "p-4 text-sm text-stone-800 border-t border-stone-200",
                    idx % 2 === 0 ? "bg-white" : "bg-stone-50/60"
                  )}
                >
                  {r.label}
                </div>
                <div
                  className={classNames(
                    "p-4 text-sm text-center border-t border-stone-200",
                    idx % 2 === 0 ? "bg-white" : "bg-stone-50/60"
                  )}
                >
                  {r.free ? (
                    <span className="inline-flex items-center justify-center rounded-full border border-amber-200 bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-900">
                      ✓
                    </span>
                  ) : (
                    <span className="text-stone-400">—</span>
                  )}
                </div>
                <div
                  className={classNames(
                    "p-4 text-sm text-center border-t border-stone-200",
                    idx % 2 === 0 ? "bg-white" : "bg-stone-50/60"
                  )}
                >
                  {r.pro ? (
                    <span className="inline-flex items-center justify-center rounded-full border border-amber-200 bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-900">
                      ✓
                    </span>
                  ) : (
                    <span className="text-stone-400">—</span>
                  )}
                </div>
                <div
                  className={classNames(
                    "p-4 text-sm text-center border-t border-stone-200",
                    idx % 2 === 0 ? "bg-white" : "bg-stone-50/60"
                  )}
                >
                  {r.premium ? (
                    <span className="inline-flex items-center justify-center rounded-full border border-amber-200 bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-900">
                      ✓
                    </span>
                  ) : (
                    <span className="text-stone-400">—</span>
                  )}
                </div>
              </React.Fragment>
            ))}

            {/* bottom rounding */}
            <div className="col-span-4 h-px bg-stone-200" />
          </div>
        </div>

        {/* Mobile comparison (stacked cards) */}
        <div className="mt-6 grid grid-cols-1 gap-4 md:hidden">
          {["Starter", "Signature", "Elite"].map((plan) => (
            <div key={plan} className="rounded-2xl border border-stone-200 bg-stone-50 p-5">
              <p className="text-sm font-semibold text-stone-900">{plan}</p>
              <ul className="mt-3 space-y-2 text-sm text-stone-700">
                {rows.map((r) => {
                  const ok =
                    plan === "Free"
                      ? r.free
                      : plan === "Pro"
                      ? r.pro
                      : r.Premium;
                  return (
                    <li key={r.label} className="flex items-start gap-3">
                      <span
                        className={classNames(
                          "mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full border text-xs font-semibold",
                          ok
                            ? "border-amber-200 bg-amber-50 text-amber-900"
                            : "border-stone-200 bg-white text-stone-400"
                        )}
                      >
                        {ok ? "✓" : "—"}
                      </span>
                      <span>{r.label}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>

        <p className="mt-5 text-xs text-stone-500">
          “Verified” and review snippets appear only after admin review for accuracy and quality.
        </p>
      </div>
    </div>
  );
}

export default function PricingPage() {
  const navigate = useNavigate();

  async function startCheckout(tier) {

    const { data } = await supabase.auth.getUser();
    const user = data?.user;

    if (!user) {
      alert("You must be logged in");
      return;
    }

    const res = await fetch(
      "https://stylegrades-api.vercel.app/api/create-checkout-session",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          plan: plan.key,   // or whatever your plan variable is
          user_id: user.id,
          email: user.email,
        }),
      }
    );
  }

  const plans = useMemo(
    () => [
      {
        key: "free",
        name: "Free",
        priceLabel: "$0",
        cadence: "/ month",
        badge: null,
        featured: false,
        blurb: "A polished, professional profile that helps clients find and contact you.",
        highlights: [
          "Profile listing in search results",
          "Services + specialties section",
          "Photo + short bio",
          "Portfolio gallery (3 images)",
          "Contact button (no booking)",
        ],
        cta: "Create your free profile",
      },
      {
        key: "pro",
        name: "Pro",
        priceLabel: "$19",
        cadence: "/ month",
        badge: "Most Popular",
        featured: true,
        blurb: "Stand out and build trust faster with verification, reviews, and a stronger portfolio.",
        highlights: [
          "Everything in Free",
          "Portfolio gallery (12 images)",
          "Verified Profile badge",
          "Verified review snippets",
          "Enhanced profile sections",
        ],
        cta: "Go Pro",
      },
      {
        key: "premium",
        name: "Premium",
        priceLabel: "$39",
        cadence: "/ month",
        badge: null,
        featured: false,
        blurb: "Maximum visibility for stylists who want more discovery in their city.",
        highlights: [
          "Everything in Pro",
          "Portfolio gallery (20 images)",
          "Featured placement boost",
          "Top stylist highlight styling",
          "Pinned review highlights",
        ],
        cta: "Go Premium",
      },
    ],
    []
  );

  const comparisonRows = useMemo(
    () => [
      { label: "Profile listing in search", free: true, pro: true, premium: true },
      { label: "Services + specialties", free: true, pro: true, premium: true },
      { label: "Contact button (no booking)", free: true, pro: true, premium: true },
      { label: "Basic profile insights", free: true, pro: true, premium: true },
      { label: "Verified Profile badge", free: false, pro: true, premium: true },
      { label: "Gallery (expanded)", free: false, pro: true, premium: true },
      { label: "Verified review snippets", free: false, pro: true, premium: true },
      { label: "Training + awards sections", free: false, pro: true, premium: true },
      { label: "Featured placement boost", free: false, pro: false, premium: true },
      { label: "Top Stylist highlight styling", free: false, pro: false, premium: true },
      { label: "Pinned review highlights", free: false, pro: false, premium: true },
    ],
    []
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-50 via-amber-50/40 to-stone-50">
      <div className="h-2" />

      {/* Hero */}
      <section className="px-4 pt-10 pb-8">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-3xl bg-slate-900 text-white shadow-xl">
            <div className="p-8 sm:p-12">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div className="max-w-2xl">
                  <p className="inline-flex items-center rounded-full border border-slate-600 bg-slate-800 px-3 py-1 text-sm font-medium text-slate-300">
                    Stylegrades for Stylists
                  </p>

                  <h1 className="mt-4 text-4xl sm:text-5xl font-serif text-[#F7FAFF] leading-tight">
                    Pricing that <span className="text-[#F4A731]">grows</span> with your business
                  </h1>

                  <p className="mt-4 text-sm md:text-base text-[#C7D5E2] max-w-xl">
                    Get discovered by clients who value quality, professionalism, and a great experience.
                  </p>

                  <p className="mt-4 text-sm md:text-base text-[#C7D5E2] max-w-xl">
                    Apply to join Stylegrades and get discovered by clients in your area. No commissions. No booking fees. Clients contact you directly.
                  </p>

                </div>

                {/* Trust block */}
                <div className="w-full lg:w-[420px]">
                  <div className="rounded-2xl border border-stone-200 bg-gradient-to-b from-white to-stone-50 p-6">
                    <h3 className="text-sm font-semibold text-stone-900">Built for trust</h3>
                    <ul className="mt-3 space-y-3 text-sm text-stone-700">
                      <li className="flex gap-3">
                        <span className="mt-0.5 h-2.5 w-2.5 rounded-full bg-amber-600" />
                        Verified profiles + approved review snippets
                      </li>
                      <li className="flex gap-3">
                        <span className="mt-0.5 h-2.5 w-2.5 rounded-full bg-amber-600" />
                        Admin-reviewed submissions for quality and consistency
                      </li>
                      <li className="flex gap-3">
                        <span className="mt-0.5 h-2.5 w-2.5 rounded-full bg-amber-600" />
                        Contact-first—no booking widget required
                      </li>
                    </ul>
                    <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
                      <p className="text-xs font-medium text-amber-900">
                        Tip: Complete profiles with strong photos convert best.
                      </p>
                    </div>
                  </div>
                </div>
              </div>{" "}
            </div>
          </div>
        </div>
      </section>

      {/* Plan cards */}
      <section className="px-4 pb-10">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
            {plans.map((plan) => (
              <div
                key={plan.key}
                className={classNames(
                  "relative rounded-3xl border shadow-lg transition-all duration-300 bg-gradient-to-b from-[#F7FAFF] to-[#E6F0F3] hover:shadow-2xl hover:-translate-y-1",
                  plan.featured
                    ? "bg-amber-500 text-white hover:bg-amber-600 border border-amber-400 shadow-md"
                    : "bg-slate-800 text-slate-100 border border-slate-600 hover:bg-slate-700"
                )}
>
                {plan.badge ? (
                  <div className="absolute -top-3 left-6">
                    <span className="rounded-full bg-amber-600 px-3 py-1 text-xs font-semibold text-white shadow-sm">
                      {plan.badge}
                    </span>
                  </div>
                ) : null}

                <div className="p-8 space-y-4">
                  <div className="flex flex-col gap-3">

                    {/* Title */}
                    <h2 className="text-xl font-semibold text-stone-900">
                      {plan.name}
                    </h2>

                    {/* Description */}
                    <p className="text-sm text-stone-700">
                      {plan.blurb}
                    </p>

                    {/* Price BELOW description */}
                    <div className="mt-2">
                      <div className="text-3xl font-semibold text-stone-900">
                        {plan.priceLabel}
                      </div>
                      <div className="text-sm text-stone-500">
                        {plan.cadence}
                      </div>
                    </div>

                    {plan.featured && (
                      <p className="text-xs text-amber-700 font-medium">
                        Best balance of visibility and portfolio tools
                      </p>
                    )}

                  </div>

                  <button
                    onClick={() => navigate(`/join?plan=${plan.key}`)}
                    className={classNames(
                      "mt-6 w-full rounded-2xl px-4 py-3 text-sm font-semibold shadow-sm transition",
                      plan.featured
                        ? "bg-amber-500 text-white border border-amber-400 hover:bg-amber-600 shadow-md"
                        : "bg-slate-800 text-slate-100 border border-slate-600 hover:bg-slate-700"
                    )}
                  >
                    {plan.cta}
                  </button>

                  <div className="mt-6">
                    <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">
                      What’s included
                    </p>
                    <ul className="mt-4 space-y-3 text-sm text-stone-700">
                      {plan.highlights.map((h) => (
                        <li key={h} className="flex gap-3">
                          <span className="mt-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                            ✓
                          </span>
                          <span>{h}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className={classNames("rounded-b-3xl px-7 py-5 text-xs text-stone-600", plan.featured ? "bg-amber-50/60" : "bg-stone-50")}>
                  {plan.key === "free"
                    ? "Start free. Upgrade when you’re ready to stand out."
                    : "Paid plans include admin-reviewed verification and profile support."}
                </div>
              </div>
            ))}
          </div>

          {/* Comparison table */}
          <PricingComparisonTable rows={comparisonRows} />

          {/* Bottom CTA */}
          <div className="mt-10 rounded-3xl bg-slate-800 text-white shadow-sm border border-slate-700">
            <div className="p-7 sm:p-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-2xl">
                <h3 className="text-2xl font-serif text-[#F7FAFF]">Ready to get discovered?</h3>
                <p className="mt-2 text-sm text-white/80">
                  Join Stylegrades and start building trust before a client ever sits in your chair.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => navigate(`/join?plan=free`)}
                  className="rounded-2xl bg-slate-700 px-6 py-3 text-sm font-semibold text-white border border-slate-500 hover:bg-slate-600 transition"
                >
                  Join as a Stylist
                </button>
                <Link
                  to="/search"
                  className="rounded-2xl border border-slate-500 bg-slate-800 px-6 py-3 text-sm font-semibold text-slate-100 hover:bg-slate-700 transition"
                >
                  Browse the directory
                </Link>
              </div>
            </div>
          </div>

          <div className="text-center mt-10 mb-2">

            <h3 className="text-2xl md:text-3xl font-serif text-[#102A43]">
              Stylegrades
            </h3>

            <p className="mt-2 text-base md:text-lg font-semibold italic text-[#102A43] tracking-wide">
              Find a stylist that will make you feel good about your hair.
            </p>

          </div>
        </div>
      </section>
    </div>
  );
}

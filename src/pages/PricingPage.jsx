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

        {/* Responsive comparison table */}
        <div className="mt-6">
          <div className="grid grid-cols-[2fr_1fr_1fr_1fr] gap-0 rounded-2xl border border-stone-200">
            <div className="p-3 text-sm font-semibold text-stone-900 bg-stone-50 rounded-tl-2xl">
              Features
            </div>
            <div className="p-3 text-sm font-semibold text-stone-900 bg-stone-50 text-center">
              Free
            </div>
            <div className="p-3 text-sm font-semibold text-stone-900 bg-stone-50 text-center">
              Pro
            </div>
            <div className="p-3 text-sm font-semibold text-stone-900 bg-stone-50 text-center rounded-tr-2xl">
              Premium
            </div>

            {rows.map((r, idx) => (
              <React.Fragment key={r.label}>
                <div
                  className={classNames(
                    "p-3 text-sm text-stone-800 border-t border-stone-200",
                    idx % 2 === 0 ? "bg-white" : "bg-stone-50/60"
                  )}
                >
                  {r.label}
                </div>
                <div
                  className={classNames(
                    "px-3 py-2 text-sm text-center border-t border-stone-200",
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
                    "px-3 py-2 text-sm text-center border-t border-stone-200",
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
                    "px-3 py-2 text-sm text-center border-t border-stone-200",
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

        <p className="md:hidden mt-2 text-center text-xs text-stone-500">
          ← Scroll sideways for full comparison →
        </p>

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
      { label: "Basic profile insights", free: true, pro: true, premium: true },
      { label: "Verified Profile badge", free: true, pro: true, premium: true },
      { label: "Training + awards sections", free: true, pro: true, premium: true },
      { label: "Gallery (expanded)", free: false, pro: true, premium: true },
      { label: "Verified review snippets", free: false, pro: true, premium: true },
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
      <section className="px-4 pt-2 pb-10">
        <div className="mx-auto max-w-6xl">

          <div className="rounded-3xl bg-slate-900 text-white shadow-xl">

            <div className="px-8 py-10 md:px-10 md:py-4">

              <div className="max-w-4xl mx-auto text-center">

                <h1 className="mt-4 text-2xl md:text-3xl font-serif leading-tight text-white">
                  Built to help beauty professionals
                  <span className="text-[#F4A731]"> grow their businesses.</span>
                </h1>

                <p className="mt-4 text-lg text-slate-300 leading-relaxed max-w-3xl mx-auto">
                  Stylegrades is built on integrity, transparency, and respect for the professionals and clients we serve.
                </p>

              </div>

              <div className="mt-4 rounded-xl bg-white border border-[#D9E2EC] p-8">

                <h3 className="text-2xl font-serif text-[#102A43] mb-6">
                  The Stylegrades™ Promise
                </h3>

                <div className="space-y-4 text-[#2F3C4F]">

                  <p><span className="font-semibold">✔ We never sell your personal information.</span></p>

                  <p><span className="font-semibold">✔ We never sell your clients' information.</span></p>

                  <p><span className="font-semibold">✔ No spam. No hidden agendas.</span></p>

                  <p><span className="font-semibold">✔ Ratings can not be purchased.</span></p>

                  <p><span className="font-semibold">✔ We respect your privacy.</span></p>

                </div>

              </div>

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
              </div>
            ))}
          </div>

          {/* Comparison table */}
          <PricingComparisonTable rows={comparisonRows} />
          
          {/* Bottom CTA */}
          <div className="mt-10 rounded-3xl bg-slate-800 text-white shadow-sm border border-slate-700">
            <div className="p-7 sm:p-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-2xl">
                <h3 className="text-2xl font-serif text-[#F7FAFF]">Are you ready to build your reputation?</h3>
                <p className="mt-2 text-sm text-white/80">
                  Join Stylegrades and start building trust before a client ever sits in your chair.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => navigate(`/join?plan=free`)}
                  className="rounded-2xl bg-slate-700 px-6 py-3 text-sm font-semibold text-white border border-slate-500 hover:bg-slate-600 transition"
                >
                  Create My Profile
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

          <div className="text-center mt-2 mb-2">

            

          </div>
        </div>
      </section>
    </div>
  );
}

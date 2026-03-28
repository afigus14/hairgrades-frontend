// src/pages/AdvertisePage.jsx
import React, { useMemo } from "react";
import { Link, useLocation } from "react-router-dom";

const EMAIL = "advertise@stylegrades.com"; // change later to hello@stylegrades.com

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

function TierCard({ title, price, bullets, badge, ctaLabel, to }) {
  return (
    <div className="rounded-3xl border border-[#D9E2EC] bg-white shadow-sm overflow-hidden">
      <div className="p-6">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-lg md:text-xl font-semibold text-[#102A43]">
              {title}
            </h3>
            {price ? (
              <div className="mt-1 text-sm text-[#52606D]">{price}</div>
            ) : null}
          </div>

          {badge ? (
            <span className="shrink-0 rounded-full bg-[#FFF7E6] border border-[#FFE8B5] px-3 py-1 text-xs font-semibold text-[#7C5E10]">
              {badge}
            </span>
          ) : null}
        </div>

        <ul className="mt-4 space-y-2 text-sm text-[#243B53]">
          {bullets.map((b) => (
            <li key={b} className="flex gap-2">
              <span className="mt-1 h-2 w-2 rounded-full bg-[#7A9D96] shrink-0" />
              <span>{b}</span>
            </li>
          ))}
        </ul>

        <div className="mt-6">
          <Link
            to={to}
            className="inline-flex w-full items-center justify-center rounded-2xl bg-[#102A43] px-4 py-3 text-sm font-semibold text-white hover:opacity-95"
          >
            {ctaLabel}
          </Link>
        </div>

        <div className="mt-3 text-[11px] text-[#7B8794]">
          No long-term contracts. We’ll help you pick the best placement.
        </div>
      </div>
    </div>
  );
}

export default function AdvertisePage() {
  const q = useQuery();

  // where did the user come from? (rails, in-feed, sponsored block, etc.)
  const src = q.get("src") || "";
  const ad = q.get("ad") || "";
  const placement = q.get("placement") || ""; // optional (rail/category/featured)
  const sponsorTo = q.get("to") || ""; // optional sponsor website

  const subject = `Stylegrades Advertising Inquiry${placement ? ` — ${placement}` : ""}`;

  const body = `Hi Stylegrades,

I'm interested in advertising on Stylegrades.

Business name:
City/region:
What are you promoting (salon, product, event, etc.)?
Preferred placement (left rail, right rail, category, featured):
Budget range:
Timeline:

(Context: src=${src || "n/a"}, ad=${ad || "n/a"})

Thanks!
`;

  const mailto = `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(
    body
  )}`;

  return (
    <div className="w-full min-w-0 pb-10">
      {/* Hero */}
      <section className="rounded-3xl border border-[#1F3A4D] bg-[#101A2A] px-6 py-8 shadow-lg">
        <div className="max-w-3xl">
          <h1 className="text-2xl md:text-3xl font-serif text-[#F7FAFF]">
            Advertise with Stylegrades
          </h1>

          <p className="mt-3 text-sm md:text-base text-[#C7D5E2] leading-relaxed">
            Reach clients who are actively searching for stylists and services.
            Promote your salon, products, education, or local offers—right where
            people are deciding who to contact.
          </p>

          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <a
              href={mailto}
              className="inline-flex items-center justify-center rounded-2xl bg-[#F4A731] px-5 py-3 text-sm font-semibold text-black shadow hover:opacity-95"
            >
              Email us to sponsor
            </a>

            <a
              href="#placements"
              className="inline-flex items-center justify-center rounded-2xl border border-[#30465B] bg-transparent px-5 py-3 text-sm font-semibold text-[#F7FAFF] hover:bg-[#0E1625]"
            >
              See placements
            </a>

            {/* Optional: after email, you can also click through to sponsor site */}
            {sponsorTo ? (
              <a
                href={sponsorTo}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center rounded-2xl border border-[#30465B] bg-transparent px-5 py-3 text-sm font-semibold text-[#F7FAFF] hover:bg-[#0E1625]"
                title="Sponsor website"
              >
                Continue to sponsor website
              </a>
            ) : null}
          </div>

          <div className="mt-4 text-xs text-[#9FB3C8]">
            Tip: Start with a city placement or a category sponsorship for the
            fastest results.
          </div>
        </div>
      </section>

      {/* Placements */}
      <section id="placements" className="mt-10">
        <h2 className="text-xl md:text-2xl font-serif text-[#102A43]">
          Sponsorship options
        </h2>
        <p className="mt-2 text-sm text-[#52606D]">
          Choose a starting package. Later we can add sponsor landing pages and
          advanced targeting.
        </p>

        <div className="mt-6 grid gap-6 md:grid-cols-3">
          <TierCard
            title="Local Rail Placement"
            price="Best for salons + local services"
            badge="Popular"
            bullets={[
              "Shown next to search + directory pages",
              "High visibility while users browse stylists",
              "Great for city-based campaigns",
              "Simple creative: image + headline + CTA",
            ]}
            ctaLabel="Sponsor a rail spot"
            to={`/advertise?placement=Rail%20Placement`}
          />

          <TierCard
            title="Category Sponsorship"
            price="Best for specialty targeting"
            bullets={[
              "Exclusive placement for a specialty (e.g., Balayage, Curly Hair)",
              "Ideal for educators + premium product brands",
              "Pairs well with verified review messaging",
              "Add your offer + brand badge",
            ]}
            ctaLabel="Sponsor a category"
            to={`/advertise?placement=Category%20Sponsorship`}
          />

          <TierCard
            title="Featured Placement"
            price="Best for maximum impact"
            bullets={[
              "Top-of-page visibility for limited spots",
              "Great for launches, seasonal promos, events",
              "Optional: “Verified partner” badge",
              "Add tracking + reporting",
            ]}
            ctaLabel="Request featured placement"
            to={`/advertise?placement=Featured%20Placement`}
          />
        </div>
      </section>

      {/* How it works */}
      <section className="mt-10 rounded-3xl border border-[#D9E2EC] bg-white shadow-sm">
        <div className="p-6 md:p-8">
          <h3 className="text-lg md:text-xl font-semibold text-[#102A43]">
            How sponsorships work
          </h3>

          <div className="mt-4 grid gap-5 md:grid-cols-3">
            {[
              {
                n: "1",
                t: "Pick a placement",
                d: "Choose rail, category, or featured placement. Start local, then expand.",
              },
              {
                n: "2",
                t: "Email us your info",
                d: "Send your business, city, and what you want to promote. We’ll confirm availability.",
              },
              {
                n: "3",
                t: "Launch + track",
                d: "We’ll track impressions + clicks so you can see performance over time.",
              },
            ].map((x) => (
              <div
                key={x.n}
                className="rounded-2xl bg-[#F8FAFC] border border-[#EDF2F7] p-5"
              >
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#102A43] text-white text-sm font-bold">
                    {x.n}
                  </span>
                  <div className="font-semibold text-[#102A43]">{x.t}</div>
                </div>
                <div className="mt-2 text-sm text-[#52606D]">{x.d}</div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <a
              href={mailto}
              className="inline-flex items-center justify-center rounded-2xl bg-[#102A43] px-5 py-3 text-sm font-semibold text-white hover:opacity-95"
            >
              Email us: {EMAIL}
            </a>

            <Link
              to="/search"
              className="inline-flex items-center justify-center rounded-2xl border border-[#D9E2EC] px-5 py-3 text-sm font-semibold text-[#102A43] hover:bg-[#F0F4F8]"
            >
              See the search page
            </Link>
          </div>

          <div className="mt-4 text-xs text-[#7B8794]">
            For now, ad CTAs route through the Stylegrades “Advertise” flow. Later,
            sponsors can link directly to their own websites.
          </div>
        </div>
      </section>
    </div>
  );
}

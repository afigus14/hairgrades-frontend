import React from "react";
import { Link } from "react-router-dom";

export default function PremierBanner() {
  return (
    <section className="rounded-[28px] border border-[#D8B36A] bg-white shadow-sm overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-[220px_220px_1fr_260px] items-center">

        {/* Left Badge */}
        <div className="flex justify-center p-6">
          <div className="rounded-2xl border border-[#D8B36A] px-6 py-4 text-center">
            <div className="text-[#C9971A] text-lg">★</div>

            <div className="mt-1 text-xs tracking-[0.25em] uppercase text-[#C9971A] font-semibold">
              Become a
            </div>

            <div className="text-lg font-bold tracking-wide text-[#C9971A] uppercase">
              Premier Partner
            </div>
          </div>
        </div>

        {/* Image */}
        <div className="h-full">
          <img
            src="/assets/sponsors/premier-salon.jpg"
            alt="Premier Salon"
            className="h-full w-full object-cover"
          />
        </div>

        {/* Copy */}
        <div className="px-8 py-8">
          <div className="text-xs uppercase tracking-[0.35em] text-[#6B7280]">
            Exclusive Sponsorship Available
          </div>

          <h2 className="mt-2 text-4xl font-bold text-[#102A43]">
            Become a Premier Sponsor
          </h2>

          <p className="mt-4 text-lg leading-8 text-[#52606D] max-w-2xl">
            Reach clients actively searching for stylists, salons,
            beauty brands, and beauty services. Become one of
            Stylegrades' most visible brands with our exclusive
            Premier Partner placement.
          </p>
        </div>

        {/* CTA */}
        <div className="flex justify-center p-8">
          <a
            href="#advertiser-information"
            className="rounded-2xl bg-[#102A43] px-10 py-5 text-lg font-semibold text-white hover:bg-[#0C2038] transition"
          >
            Reserve Premier Placement
          </a>
        </div>

      </div>
    </section>
  );
}
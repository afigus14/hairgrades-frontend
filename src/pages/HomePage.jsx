// src/pages/HomePage.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import StylistCard from "../components/StylistCard";

export default function HomePage() {

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      {/* HERO SECTION */}
      <section className="rounded-3xl border border-[#C7D5E2] bg-[#172538] px-6 py-10 md:px-10 md:py-12 shadow-lg mb-12">
        <div className="grid gap-8 md:grid-cols-2 items-center">
          {/* Left: main message */}
          <div>
            {/* NEW TAGLINE */}
            <p className="text-sm md:text-base text-[#C7D5E2] max-w-xl">
              Discover stylists you’ll love. Compare work, reviews, and book with confidence.
            </p>

            <h1 className="mt-3 text-3xl md:text-4xl lg:text-5xl font-serif text-[#F7FAFF] leading-tight">
              Find a stylist who truly <span className="text-[#F4A731]">gets</span> your hair.
            </h1>

            <p className="mt-4 text-sm md:text-base text-[#C7D5E2] max-w-xl">
              Stylegrades helps you discover stylists by their real work, verified reviews,
              and specialties — so you can feel confident before you sit in the chair.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to="/search"
                className="inline-flex items-center justify-center rounded-lg bg-[#F4A731] px-5 py-2.5 text-sm font-semibold text-black shadow hover:bg-[#F1B154] transition"
              >
                Find stylists near you
              </Link>
              <Link
                to="/pricing"
                className="inline-flex items-center justify-center rounded-lg border border-[#C7D5E2] px-5 py-2.5 text-sm font-medium text-[#F7FAFF] hover:bg-[#101A26] transition"
              >
                Join as a stylist
              </Link>
            </div>
          </div>

          {/* Right: small “how it works” panel */}
          <div className="rounded-2xl bg-[#101A2A] border border-[#30465B] px-5 py-6 text-sm text-[#C7D5E2]">
            <h2 className="text-base font-semibold text-[#F7FAFF] mb-3">
              How Stylegrades works
            </h2>
            <ul className="space-y-3">
              <li className="flex gap-3">
                <span className="mt-1 h-5 w-5 flex items-center justify-center rounded-full bg-[#F4A731] text-[11px] font-bold text-black">
                  1
                </span>
                <div>
                  <p className="font-medium text-[#F7FAFF]">Search by ZIP code</p>
                  <p className="text-xs text-[#C7D5E2]">
                    Use “Find Stylists” to see stylists within a radius you choose.
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="mt-1 h-5 w-5 flex items-center justify-center rounded-full bg-[#F4A731] text-[11px] font-bold text-black">
                  2
                </span>
                <div>
                  <p className="font-medium text-[#F7FAFF]">Compare real work</p>
                  <p className="text-xs text-[#C7D5E2]">
                    Browse photos, specialties, and bios to find a stylist who matches your hair goals.
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="mt-1 h-5 w-5 flex items-center justify-center rounded-full bg-[#F4A731] text-[11px] font-bold text-black">
                  3
                </span>
                <div>
                  <p className="font-medium text-[#F7FAFF]">Read verified reviews</p>
                  <p className="text-xs text-[#C7D5E2]">
                    See what real clients are saying before you reach out and book.
                  </p>
                </div>
              </li>
            </ul>

            <div className="mt-5 border-t border-[#30465B] pt-4 flex flex-wrap gap-4 text-[11px] text-[#C7D5E2]">
              <div>
                <div className="text-[#F7FAFF] font-semibold">Curated profiles</div>
                <div>Stylists are added and verified by the Stylegrades team.</div>
              </div>
              <div>
                <div className="text-[#F7FAFF] font-semibold">Built for real hair journeys</div>
                <div>Especially for women who want to feel seen and understood.</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* WHY STYLEGRADES STRIP */}
      <section className="mb-12">
        <h2 className="text-xl md:text-2xl font-semibold text-[#102A43] mb-4">
          Why use Stylegrades?
        </h2>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl bg-[#101A2A] border border-[#30465B] px-4 py-4">
            <h3 className="text-sm font-semibold text-[#F7FAFF] mb-1">
              See the work first
            </h3>
            <p className="text-xs text-[#C7D5E2]">
              Browse gallery photos and specialties so you know what a stylist actually does best.
            </p>
          </div>
          <div className="rounded-2xl bg-[#101A2A] border border-[#30465B] px-4 py-4">
            <h3 className="text-sm font-semibold text-[#F7FAFF] mb-1">
              Built around your needs
            </h3>
            <p className="text-xs text-[#C7D5E2]">
              Search by location and distance so you don’t fall in love with a stylist three cities away.
            </p>
          </div>
          <div className="rounded-2xl bg-[#101A2A] border border-[#30465B] px-4 py-4">
            <h3 className="text-sm font-semibold text-[#F7FAFF] mb-1">
              Thoughtful, verified reviews
            </h3>
            <p className="text-xs text-[#C7D5E2]">
              Reviews focus on trust, communication, and how clients feel walking out of the salon.
            </p>
          </div>
        </div>
      </section>

      {/* CTA STRIP FOR STYLISTS */}
      <section className="rounded-3xl bg-[#101A2A] border border-[#30465B] px-6 py-8 text-center shadow-lg">
        <h3 className="text-xl font-serif text-[#F7FAFF] mb-2">
          Are you a stylist?
        </h3>
        <p className="text-sm text-[#C7D5E2] mb-4 max-w-2xl mx-auto">
          Stylegrades is designed to highlight your best work and help new clients find you
          for the things you do best — not just the closest open chair.
        </p>
        <Link
          to="/pricing"
          className="inline-flex items-center justify-center rounded-lg bg-[#F4A731] px-6 py-2.5 text-sm font-semibold text-black shadow hover:bg-[#F1B154] transition"
        >
          Join as a stylist
        </Link>
      </section>
    </div>
  );
}

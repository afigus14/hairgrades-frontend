// src/pages/AboutPage.jsx
import React from "react";

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">

      {/* Heading */}
      <h1 className="text-3xl font-serif text-[#2F3C4F] mb-4">
        About Stylegrades
      </h1>

      {/* Sub-heading paragraph */}
      <p className="text-[#2F3C4F] mb-6 max-w-2xl">
        Learn more about our purpose and why Stylegrades exists.
      </p>

      {/* Dark content card */}
      <div className="rounded-2xl border border-[#C7D5E2]/40 bg-[#172538] p-6 shadow-lg space-y-4">
        <p className="text-[#F7FAFF]">
          Stylegrades helps people discover talented stylists in their area —
          with transparency, real reviews, and beautiful portfolios.
        </p>

        <p className="text-[#F7FAFF]">
          Our mission is to bring trust, clarity, and professionalism to the
          hairstylist industry by making information easy to find and compare.
        </p>
      </div>
    </div>
  );
}

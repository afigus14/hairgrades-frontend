import React from "react";

export default function TopBanner() {
  return (
    <div className="bg-gradient-to-r from-[#00303F] to-[#7A9D96] text-[#CAE4DB] py-8 shadow-md">
      <div className="max-w-6xl mx-auto text-center px-4">
        <h1 className="text-4xl font-serif font-semibold tracking-wide mb-2">
          Stylegrades
        </h1>
        <p className="text-base md:text-lg text-[#CAE4DB]/90">
          Discover stylists you’ll love. Compare work, reviews, and book with confidence.
        </p>
      </div>
    </div>
  );
}



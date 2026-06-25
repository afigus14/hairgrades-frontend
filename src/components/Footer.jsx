import React from "react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-[#101A2A] text-[#F7FAFF] mt-12">
      <div className="max-w-6xl mx-auto px-4 py-6 grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
        {/* About Section */}
        <div className="flex items-center h-full">
          <p className="text-[16px] text-[#F7FAFF] leading-relaxed max-w-md">
            Discover stylists you'll love. Compare work, reviews, and book with confidence.
          </p>
        </div>

        {/* Navigation Links */}
        <div className="flex flex-col space-y-2">
          <Link to="/" className="hover:text-[#CAE4DB]/70 transition">Home</Link>
          <Link to="/pricing" className="hover:text-[#CAE4DB]/70 transition">Join as Stylist</Link>
          <Link to="/about" className="hover:text-[#CAE4DB]/70 transition">About</Link>
          <Link to="/contact" className="hover:text-[#CAE4DB]/70 transition">Contact</Link>
        </div>

        {/* Legal / Copyright */}
        <div className="text-[#F7FAFF]/70 md:text-right">

          <div className="mb-3">
            <Link to="/terms" className="hover:text-[#F7FAFF]">
              Terms
            </Link>{" "}
            ·{" "}
            <Link to="/privacy" className="hover:text-[#F7FAFF]">
              Privacy
            </Link>{" "}
            ·{" "}
            <Link to="/refund-policy" className="hover:text-[#F7FAFF]">
              Refunds
            </Link>
          </div>

          <img
            src="/assets/branding/stylegrades-logo.png"
            alt="Stylegrades icon"
            className="h-12 w-auto ml-auto mb-3 opacity-80"
          />

          <p className="text-xs">
            &copy; 2026 Stylegrades LLC. All Rights Reserved.
          </p>

        </div>
      </div>
    </footer>
  );
}


import React from "react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-[#101A2A] text-[#F7FAFF] mt-12">
      <div className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
        {/* About Section */}
        <div>
          <h3 className="text-lg font-semibold font-serif mb-2">Stylegrades</h3>
          <p className="text-[#F7FAFF]/90">
            Discover stylists you’ll love. Compare work, reviews, and book with confidence.
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
          <p className="mt-2 text-xs">&copy; 2025 Stylegrades. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}


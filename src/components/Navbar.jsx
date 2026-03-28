// src/components/Navbar.jsx
import React from "react";
import { Link, useLocation } from "react-router-dom";

export default function Navbar() {
  const { pathname } = useLocation();

  const linkClasses = (path) =>
    `px-3 py-2 text-sm font-medium transition ${
      pathname === path
        ? "text-[#F7FAFF] font-semibold"
        : "text-[#F7FAFF]/80 hover:text-[#F7FAFF]"
    }`;

  return (
    <nav className="w-full bg-[#2F3C4F] border-b border-black/10 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        
        {/* Logo */}
        <Link
          to="/"
          className="text-3xl font-serif font-bold text-[#F7FAFF] tracking-wide"
        >
          Stylegrades
        </Link>

        {/* Navigation Links */}
        <div className="flex items-center gap-6">
          <Link to="/" className={linkClasses("/")}>
            Home
          </Link>

          {/* NOT shown in navbar:
              Pricing (will be inside Join page)
          */}

          <Link to="/pricing" className={linkClasses("/pricing")}>
            Join as Stylist
          </Link>

          <Link to="/about" className={linkClasses("/about")}>
            About
          </Link>

          <Link to="/contact" className={linkClasses("/contact")}>
            Contact
          </Link>
        </div>
      </div>
    </nav>
  );
}

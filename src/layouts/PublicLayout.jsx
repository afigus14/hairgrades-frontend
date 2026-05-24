// src/layouts/PublicLayout.jsx
import React, { useState, useEffect } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import AdRailLeft from "../components/AdRailLeft";
import AdRailRight from "../components/AdRailRight";
import { supabase } from "../lib/supabase";
import Footer from "../components/Footer";

console.log("PublicLayout render", window.location.pathname);

function TopNav() {
  const [user, setUser] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] =
    useState(false);

  useEffect(() => {
    async function loadUser() {
      const { data } = await supabase.auth.getUser();
      setUser(data?.user || null);
    }

    loadUser();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user || null);
      }
    );

    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.reload();
  }

  const linkBase =
    "text-[13px] font-semibold px-2 py-2 rounded-xl transition hover:bg-white/30 focus:outline-none focus:ring-2 focus:ring-white/50";

  const linkActive = "bg-white/40 text-[#102A43]";
  const linkIdle = "text-[#102A43]";

  return (
      <header className="sticky top-0 z-50 backdrop-blur bg-[#9FD0D6]/85 border-b border-white/25">
        <div className="mx-auto w-full max-w-[1280px] px-4 lg:px-6">
          <div className="flex items-center justify-between py-2.5">

            {/* Logo + Tagline */}
            <div className="flex items-baseline gap-3 mr-10 lg:mr-16 shrink-0">

              <NavLink to="/">
                <span className="text-2xl md:text-3xl font-serif font-bold text-[#102A43]">
                  Stylegrades
                </span>
              </NavLink>

              <span className="hidden sm:inline text-sm md:text-base text-[#102A43] leading-tight">
                Find a stylist that will make you feel good about your hair.
              </span>

            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() =>
                setMobileMenuOpen(!mobileMenuOpen)
              }
              className="md:hidden text-[#102A43] text-2xl font-bold"
            >
              ☰
            </button>

            {/* Navigation */}
            <nav className="hidden md:flex items-center gap-1">

              <NavLink
                to="/"
                end
                className={({ isActive }) =>
                  `${linkBase} ${isActive ? linkActive : linkIdle}`
                }
              >
                Home
              </NavLink>

              <NavLink
                to="/search"
                className={({ isActive }) =>
                  `${linkBase} ${isActive ? linkActive : linkIdle}`
                }
              >
                Search
              </NavLink>

              <NavLink
                to="/pricing"
                className={({ isActive }) =>
                  `${linkBase} ${isActive ? linkActive : linkIdle}`
                }
              >
                Join as Stylist
              </NavLink>

              <NavLink
                to="/advertise"
                className={({ isActive }) =>
                  `${linkBase} ${isActive ? linkActive : linkIdle}`
                }
              >
                Advertise
              </NavLink>

              <NavLink
                to="/about"
                className={({ isActive }) =>
                  `${linkBase} ${isActive ? linkActive : linkIdle}`
                }
              >
                About
              </NavLink>

              <NavLink
                to="/contact"
                className={({ isActive }) =>
                  `${linkBase} ${isActive ? linkActive : linkIdle}`
                }
              >
                Contact
              </NavLink>

              {/* Member login when logged out */}
              {!user && (
                <NavLink
                  to="/login"
                  className={({ isActive }) =>
                    `${linkBase} ${isActive ? linkActive : linkIdle}`
                  }
                >
                  Member Login
                </NavLink>
              )}

              {/* Dashboard when logged in */}
              {user && (
                <NavLink
                  to="/dashboard"
                  className={({ isActive }) =>
                    `${linkBase} ${isActive ? linkActive : linkIdle}`
                  }
                >
                  Dashboard
                </NavLink>
              )}

              {/* Logout button */}
              {user && (
                <button
                  onClick={handleLogout}
                  className={`${linkBase} ${linkIdle}`}
                >
                  Logout
                </button>
              )}

            </nav>
          </div>
        </div>
      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (

        <div className="md:hidden bg-[#9FD0D6] border-t border-white/30 px-4 py-4 space-y-2">

          <NavLink
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-[#102A43] font-semibold"
          >
            Home
          </NavLink>

          <NavLink
            to="/search"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-[#102A43] font-semibold"
          >
            Search
          </NavLink>

          <NavLink
            to="/pricing"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-[#102A43] font-semibold"
          >
            Join as Stylist
          </NavLink>

          <NavLink
            to="/advertise"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-[#102A43] font-semibold"
          >
            Advertise
          </NavLink>

          <NavLink
            to="/about"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-[#102A43] font-semibold"
          >
            About
          </NavLink>

          <NavLink
            to="/contact"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-[#102A43] font-semibold"
          >
            Contact
          </NavLink>

          {!user && (
            <NavLink
              to="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-[#102A43] font-semibold"
            >
              Member Login
            </NavLink>
          )}

          {user && (
            <>
              <NavLink
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-[#102A43] font-semibold"
              >
                Dashboard
              </NavLink>

              <button
                onClick={handleLogout}
                className="block text-[#102A43] font-semibold"
              >
                Logout
              </button>
            </>
          )}

        </div>

      )}
      
      </header>
);
}

function pageFromPath(pathname) {
  if (pathname.startsWith("/search")) return "search";
  if (pathname.startsWith("/profile")) return "profile";
  if (pathname.startsWith("/pricing")) return "pricing";
  if (pathname.startsWith("/join")) return "join";
  if (pathname.startsWith("/advertise")) return "advertise";
  if (pathname.startsWith("/about")) return "about";
  if (pathname.startsWith("/contact")) return "contact";
  return "home";
}

function LeftRail({ page }) {
  const slots = ["A", "B", "C", "D"];

  return (
    <div className="w-full min-w-0 space-y-5">
      {slots.map((slot) => (
        <div key={slot} className="w-full min-w-0">
          <AdRailLeft
            page={page}
            enabled
            stylistId={`rail_left_${slot}`}
            variant={slot}
            compact={slot !== "A"}
          />
        </div>
      ))}
    </div>
  );
}

function RightRail({ page }) {
  const slots = ["A", "B", "C", "D"];

  return (
    <div className="w-full min-w-0 space-y-5">
      {slots.map((slot) => (
        <div key={slot} className="w-full min-w-0">
          <AdRailRight
            page={page}
            enabled
            stylistId={`rail_right_${slot}`}
            variant={slot}
            compact={slot !== "A"}
          />
        </div>
      ))}
    </div>
  );
}

export default function PublicLayout() {
  const loc = useLocation();
  const page = pageFromPath(loc.pathname);

  const isAdminPage = loc.pathname.includes("/admin");

  useEffect(() => {
    const hash = window.location.hash;

    if (hash.includes("access_token") && hash.includes("type=recovery")) {
      window.location.replace("/#/update-password");
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#9FD0D6]">
      <TopNav />

      <div className="mx-auto w-full max-w-[1280px] px-4 lg:px-6">
        <div
          className={[
            "grid gap-5",
            isAdminPage
              ? "grid-cols-1"
              : "grid-cols-1 lg:grid-cols-[minmax(0,260px)_minmax(0,1fr)_minmax(0,260px)] xl:grid-cols-[minmax(0,300px)_minmax(0,1fr)_minmax(0,300px)]",
            "items-start",
            "py-5",
          ].join(" ")}
        >
          {!isAdminPage && (
            <div className="hidden lg:block min-w-0">
              <LeftRail page={page} />
            </div>
)}

          <main className="min-w-0">
            <Outlet />
          </main>

          {!isAdminPage && (
            <div className="hidden lg:block min-w-0">
              <RightRail page={page} />
            </div>
          )}
        </div>
      </div>

      <Footer />

    </div>
  );
}
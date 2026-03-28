import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { Link } from "react-router-dom";

export default function DashboardPage() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    async function loadUser() {
      const { data } = await supabase.auth.getUser();
      setUser(data?.user || null);
    }

    loadUser();
  }, []);

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-2xl font-semibold text-[#102A43]">
          Member Dashboard
        </h1>
        <p className="mt-2 text-[#52606D]">
          Please log in to access your dashboard.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-serif text-[#102A43] mb-6">
        Dashboard
      </h1>

      <div className="bg-white border border-[#D9E2EC] rounded-2xl p-6 shadow-sm">
        <p className="text-[#243B53]">
          Welcome, {user.email}
        </p>

        <div className="mt-6 grid md:grid-cols-2 gap-4">

          {/* EDIT PROFILE */}
          <Link
            to="/dashboard/profile"
            className="border rounded-xl p-4 block hover:bg-[#F7FAFC] transition"
          >
            <h3 className="font-semibold text-[#102A43]">
              Edit Profile
            </h3>
            <p className="text-sm text-[#52606D]">
              Update your stylist profile, bio, and contact information.
            </p>
          </Link>

          {/* REVIEWS */}
          <div className="border rounded-xl p-4">
            <h3 className="font-semibold text-[#102A43]">
              Reviews
            </h3>
            <p className="text-sm text-[#52606D]">
              View and respond to client reviews.
            </p>
          </div>

          {/* ADVERTISING */}
          <div className="border rounded-xl p-4">
            <h3 className="font-semibold text-[#102A43]">
              Advertising
            </h3>
            <p className="text-sm text-[#52606D]">
              Manage featured placements and promotions.
            </p>
          </div>

          {/* BILLING */}
          <div className="border rounded-xl p-4">
            <h3 className="font-semibold text-[#102A43]">
              Billing
            </h3>
            <p className="text-sm text-[#52606D]">
              Manage subscription and payments.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { Link } from "react-router-dom";

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [stylist, setStylist] = useState(null);

  useEffect(() => {
    async function loadUser() {
      const { data } = await supabase.auth.getUser();
      const user = data?.user || null;

      setUser(user);

      if (user) {
        const { data: stylistData } = await supabase
          .from("stylists")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle();

        setStylist(stylistData);
      }
    }

    loadUser();
  }, []);

  async function handleUpgrade(plan) {
    try {
      const { data } = await supabase.auth.getUser();
      const user = data?.user;

      if (!user) {
        alert("You must be logged in");
        return;
      }

      const res = await fetch(
        "https://stylegrades-api.vercel.app/api/create-checkout-session",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            plan,
            user_id: user.id,
            email: user.email,
          }),
        }
      );

      const dataRes = await res.json();

      if (!res.ok) {
        throw new Error(dataRes.error || "Checkout failed");
      }

      window.location.href = dataRes.url;

    } catch (err) {
      console.error("❌ Upgrade error:", err);
      alert(err.message || "Something went wrong");
    }
  }

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

  const tier = stylist?.tier || "free";

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">

      <h1 className="text-3xl font-serif text-[#102A43] mb-6">
        Dashboard
      </h1>

      <div className="bg-white border border-[#D9E2EC] rounded-2xl p-6 shadow-sm">
        <p className="font-semibold text-[#102A43]">
          Welcome, {user.email}!
        </p>

        {stylist && (
          <div className="mt-4 mb-6 bg-amber-50 border border-amber-200 rounded-xl p-4">

            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm text-amber-800">
                  Current plan:{" "}
                  <span className="font-semibold uppercase">
                    {tier}
                  </span>
                </p>
              </div>

              <div className="flex gap-2">

                {tier === "free" && (
                  <>
                    <button
                      onClick={() => handleUpgrade("pro")}
                      className="px-3 py-1 text-xs border border-[#1F6FEB] rounded-full text-[#1F6FEB]"
                    >
                      Pro
                    </button>

                    <button
                      onClick={() => handleUpgrade("premium")}
                      className="px-3 py-1 text-xs bg-[#1F6FEB] text-white rounded-full"
                    >
                      Premium
                    </button>
                  </>
                )}

                {tier === "pro" && (
                  <button
                    onClick={() => handleUpgrade("premium")}
                    className="px-3 py-1 text-xs bg-[#1F6FEB] text-white rounded-full"
                  >
                    Upgrade to Premium
                  </button>
                )}

              </div>
            </div>

          </div>
        )}

        <div className="mt-6 grid md:grid-cols-2 gap-4">

          <Link to="/edit-profile" className="border rounded-xl p-4">
            Edit Profile
          </Link>

          <Link to="/reviews" className="border rounded-xl p-4">
            Reviews
          </Link>

          <Link to="/advertise" className="border rounded-xl p-4">
            Advertising
          </Link>

          <Link to="/dashboard/billing" className="border rounded-xl p-4">
            Billing
          </Link>

        </div>
      </div>

    </div>
  );
}
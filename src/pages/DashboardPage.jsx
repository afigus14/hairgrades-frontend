import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { Link } from "react-router-dom";
import QRCode from "react-qr-code";

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [stylist, setStylist] = useState(null);
  const [reviews, setReviews] = useState([]);

  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");

  async function activateSubscription() {

    if (!stylist?.tier || stylist.tier === "free") {
      alert("No paid subscription is required.");
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
          plan: stylist.tier,
          user_id: user.id,
          email: user.email,
        }),
      }
    );

    const data = await res.json();

    if (!data.url) {
      alert("Unable to start checkout.");
      return;
    }

    window.location.href = data.url;
  }

  async function sendInvitation() {
    if (!clientName || !clientEmail) {
      alert("Please enter a client name and email.");
      return;
    }

    if (!stylist?.id) {
      alert("Stylist record not found.");
      return;
    }

    const token =
      crypto.randomUUID() +
      "-" +
      Date.now();

    const { error } = await supabase
      .from("review_invitations")
      .insert([
        {
          stylist_id: stylist.id,
          client_name: clientName,
          client_email: clientEmail,
          token,
        },
      ]);

    if (error) {
      console.error(error);
      alert(error.message);
      return;
    }

    console.log("INVITATION TOKEN:", token);

    await fetch(
      "https://stylegrades-api.vercel.app/api/send-review-invitation",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          clientName,
          clientEmail,
          stylistName:
            stylist?.full_name ||
            stylist?.name ||
            "Your Stylist",
          token,
        }),
      }
    );

    alert("Invitation created!");

    setClientName("");
    setClientEmail("");
  }
  
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

      if (stylistData) {
        const { data: reviewData } = await supabase
          .from("reviews")
          .select("*")
          .eq("stylist_id", stylistData.id)
          .eq("status", "approved")
          .order("created_at", {
            ascending: false,
          });

        setReviews(reviewData || []);
      }
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

  const tier = stylist?.tier || "free";

  const reviewLink = stylist?.profile_slug
  ? `https://www.stylegrades.com/#/review/${stylist.profile_slug}`
  : "";

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">

      <h1 className="text-4xl font-serif font-bold text-[#102A43]">
        Professional Dashboard
      </h1>

      <p className="mt-2 text-lg text-[#102A43]">
        Build your reputation. Grow your business.
      </p>

      <p className="mt-3 max-w-3xl text-[#102A43]">
        Welcome back! Stylegrades gives you the tools to showcase your
        professional expertise, earn verified reviews, and connect with new
        clients.
      </p>

      <div className="bg-white border border-[#D9E2EC] rounded-2xl p-6 shadow-sm">
        <p className="font-semibold text-[#102A43]">
          Welcome, {stylist?.full_name || user?.email}!
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

              <div>
                  {stylist?.subscription_status ===
                  "pending_payment" ? (

                    <button
                      onClick={activateSubscription}
                      className="px-3 py-2 text-sm bg-[#1F6FEB] text-white rounded-lg font-medium"
                    >
                      Activate Subscription
                    </button>

                  ) : (

                    <Link
                      to="/dashboard/billing"
                      className="px-3 py-2 text-sm bg-[#1F6FEB] text-white rounded-lg font-medium"
                    >
                      Manage Subscription
                    </Link>

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

        {/* Reputation Toolkit */}

        <div className="mt-10 rounded-3xl border border-[#D9E2EC] bg-gradient-to-br from-white to-[#F8FBFC] p-8 shadow-sm">

          <div className="flex items-center justify-between">

            <div>

              <h2 className="text-3xl font-serif font-semibold text-[#102A43]">
                🌟 Reputation Toolkit
              </h2>

              <p className="mt-2 max-w-2xl text-[#52606D]">
                Everything you need to build your professional reputation and
                grow your business.
              </p>

            </div>

            <div className="hidden lg:block text-6xl">
              ⭐
            </div>

          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-3">

            <div className="rounded-2xl border bg-white p-6">

              <div className="text-3xl">🔗</div>

              <h3 className="mt-3 text-xl font-semibold text-[#102A43]">
                Permanent Review Link
              </h3>

              <input
                readOnly
                value={reviewLink}
                className="mt-3 w-full rounded-lg border px-3 py-2 text-sm bg-slate-50"
              />

              <button
                onClick={() => navigator.clipboard.writeText(reviewLink)}
                className="mt-3 rounded-xl bg-[#102A43] px-4 py-2 text-white text-sm hover:opacity-90"
              >
                Copy Link
              </button>

            </div>

            <div className="rounded-2xl border bg-white p-6 text-center">

              <div className="text-3xl mb-2">
                📱
              </div>

              <h3 className="text-lg font-semibold text-[#102A43]">
                Personalized QR Code
              </h3>

              <div className="mt-5 flex justify-center">

                <div className="bg-white p-3 rounded-lg border">

                  <QRCode
                    value={reviewLink}
                    size={120}
                  />

                </div>

              </div>

            </div>

            <div className="rounded-2xl border bg-white p-6">

              <div className="text-3xl">🖨</div>

              <h3 className="mt-3 text-xl font-semibold text-[#102A43]">
                Stylegrades Review Display
              </h3>

              <p className="mt-2 text-[#7B8794]">
                Download a beautiful printable display for your station.
              </p>

            </div>

          </div>

          <div className="mt-8 rounded-2xl bg-[#EEF7F8] p-5">

            <h3 className="font-semibold text-[#102A43]">
              Included with every Stylegrades profile
            </h3>

            <p className="mt-2 text-[#52606D]">
              Every beauty professional receives a permanent review link,
              personalized QR code, and printable review display. Additional
              marketing tools and analytics are available with Pro and Premium
              memberships.
            </p>

          </div>

        </div>
        
        <div className="mt-8 border border-[#D9E2EC] rounded-2xl p-6">
          <h2 className="text-xl font-semibold text-[#102A43] mb-4">
            Invite Client to Leave a Review
          </h2>

          <div className="space-y-4">

            <input
              type="text"
              placeholder="Client Name"
              value={clientName}
              onChange={(e) =>
                setClientName(e.target.value)
              }
              className="w-full border rounded-lg px-3 py-2"
            />

            <input
              type="email"
              placeholder="Client Email"
              value={clientEmail}
              onChange={(e) =>
                setClientEmail(e.target.value)
              }
              className="w-full border rounded-lg px-3 py-2"
            />

            <button
              type="button"
              onClick={sendInvitation}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold"
            >
              Send Invitation
            </button>

          </div>
        </div>
      </div>

    </div>
  );
}
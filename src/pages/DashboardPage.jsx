import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { Link } from "react-router-dom";
import QRCode from "react-qr-code";
import ReviewStation from "../components/ReviewStation";
import { useNavigate } from "react-router-dom";

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [stylist, setStylist] = useState(null);
  const [reviews, setReviews] = useState([]);

  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");

  const navigate = useNavigate();

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

    const token = crypto.randomUUID();

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

      if (!user) {
        setStylist(null);
        setReviews([]);
        return;
      }

      const { data: stylistData, error } = await supabase
        .from("stylists")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) {
        console.error(error);
        return;
      }

      setStylist(stylistData);

      if (stylistData) {
        const { data: reviewData, error: reviewError } =
          await supabase
            .from("reviews")
            .select("*")
            .eq("stylist_id", stylistData.id)
            .eq("status", "approved")
            .order("created_at", {
              ascending: false,
            });

        if (reviewError) {
          console.error(reviewError);
        }

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
  ? `${window.location.origin}/#/review/${stylist.profile_slug}`
  : "";

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">

      <h1 className="text-4xl font-serif font-bold text-[#102A43]">
        Professional Dashboard
      </h1>

      <p className="mt-2 text-lg text-[#102A43]">
        Build your reputation. Grow your business.
      </p>

      <p className="mt-5 max-w-3xl text-[#102A43] leading-7">
        Everything you need to build your reputation, earn more verified reviews,
        and grow your business.
      </p>

      <div className="mt-8 bg-white border border-[#D9E2EC] rounded-3xl p-8 shadow-sm">
        <p className="text-lg font-semibold text-[#102A43]">
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

          <Link to="/edit-profile" className="border rounded-xl p-5">
            Edit Profile
          </Link>

          <Link to="/reviews" className="border rounded-xl p-5">
            Reviews
          </Link>

          <Link to="/advertise" className="border rounded-xl p-5">
            Advertising
          </Link>

          <Link to="/dashboard/billing" className="border rounded-xl p-5">
            Billing
          </Link>

        </div>

        {/* Reputation Toolkit */}

        <div className="mt-12 rounded-4xl border border-[#D9E2EC] bg-gradient-to-br from-white to-[#F8FBFC] p-8 shadow-sm">

          <div className="flex items-center justify-between">

            <div>

              <h2 className="text-3xl font-serif font-semibold text-[#102A43]">
                🌟 Reputation Toolkit
              </h2>

              <p className="text-[#52606D] mt-2">
                Simple tools that help you earn more verified reviews and grow your reputation.
              </p>

            </div>

          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-3 items-stretch">

            <div className="rounded-2xl border border-[#D9E2EC] bg-white p-6 flex flex-col h-full shadow-sm">

              <div className="text-3xl">🔗</div>

              <h3 className="mt-4 text-xl font-semibold text-[#102A43]">
                Review Link
              </h3>

              <p className="mt-2 text-[15px] leading-6 text-[#52606D]">
                Share this link with clients so they can leave you a verified review.
              </p>

              <input
                readOnly
                value={reviewLink}
                className="mt-4 w-full rounded-lg border px-3 py-2 text-sm bg-slate-50"
              />

              <button
                onClick={() => {
                  navigator.clipboard.writeText(reviewLink);
                  alert("Review link copied!");
                }}
                className="mt-4 rounded-xl bg-[#102A43] px-4 py-2 text-white text-sm font-semibold hover:opacity-90"
              >
                Copy Link
              </button>

            </div>

            <div className="rounded-2xl border border-[#D9E2EC] bg-white p-6 flex flex-col items-center h-full shadow-sm">

              <div className="text-3xl">
                📱
              </div>

              <h3 className="mt-3 text-xl font-semibold text-[#102A43]">
                Review QR Code
              </h3>

              <p className="mt-2 text-[15px] leading-6 text-center text-[#52606D]">
                Clients can scan your personal QR code to leave you a verified review instantly.
              </p>

              <div className="mt-6">

                <div className="rounded-xl border bg-white p-3 shadow-sm">

                  <QRCode
                    value={reviewLink}
                    size={90}
                  />

                </div>

                <p className="mt-4 text-center text-xs leading-5 text-[#7B8794]">
                  Scan to leave a verified review.
                </p>

              </div>

            </div>

            <div className="rounded-2xl border border-[#D9E2EC] bg-white p-6 flex flex-col h-full shadow-sm">

              <div className="text-3xl">🖨</div>

              <h3 className="mt-4 text-xl font-semibold text-[#102A43]">
                Review Station
              </h3>

              <p className="mt-2 text-[15px] leading-6 text-[#52606D]">
                Download a beautiful countertop display with your personalized QR code.
              </p>

              <button
                onClick={() =>
                  navigate(`/review-station/print/${stylist.profile_slug}`)
                }
                className="mt-5 rounded-xl bg-[#102A43] px-4 py-2 text-white text-sm font-semibold hover:opacity-90"
              >
                Preview & Print
              </button>

            </div>

          </div>

          <div className="mt-8 rounded-2xl bg-[#EEF7F8] p-5">

            <h3 className="font-semibold text-[#102A43]">
              Included with every Stylegrades profile
            </h3>

            <p className="mt-2 text-[#52606D]">
              Every Stylegrades membership includes a Review Link, Review QR Code, and Review Station. Upgrade to Pro or Premium to unlock analytics, marketing tools, and powerful tools to help grow your business.
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
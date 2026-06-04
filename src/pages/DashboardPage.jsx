import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { Link } from "react-router-dom";

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [stylist, setStylist] = useState(null);
  const [reviews, setReviews] = useState([]);

  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");

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

              <div>
                <Link
                  to="/dashboard/billing"
                  className="px-3 py-2 text-sm bg-[#1F6FEB] text-white rounded-lg font-medium"
                >
                  Manage Subscription
                </Link>
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
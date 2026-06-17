import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function AdminAdvertisersPage() {
  const [advertisers, setAdvertisers] = useState([]);

  async function loadAdvertisers() {
    const { data, error } = await supabase
      .from("advertisers")
      .select("*")
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      console.error(error);
      return;
    }

    setAdvertisers(data || []);
  }

  async function updateStatus(id, status) {

    const adminKey =
      localStorage.getItem("stylegrades_admin_key");

    const res = await fetch(
      "https://stylegrades-api.vercel.app/api/advertiserAction",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          "x-admin-key": adminKey,
        },

        body: JSON.stringify({
          id,
          action:
            status === "approved"
              ? "approve"
              : "reject",
        }),
      }
    );

    const data = await res.json();

    if (!res.ok) {
      alert(data.error || "Server error");
      return;
    }

    loadAdvertisers();
  }

  useEffect(() => {
    loadAdvertisers();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">

      <h1 className="text-3xl font-bold mb-6">
        Advertiser Approvals
      </h1>

      <div className="space-y-4">

        {advertisers.map((advertiser) => (

          <div
            key={advertiser.id}
            className="bg-white border rounded-xl p-5 shadow-sm"
          >

            <div className="grid md:grid-cols-2 gap-4">

              <div>
                <p>
                  <strong>Company:</strong>{" "}
                  {advertiser.company_name}
                </p>

                <p>
                  <strong>Email:</strong>{" "}
                  {advertiser.contact_email}
                </p>

                <p>
                  <strong>Website:</strong>{" "}
                  {advertiser.website}
                </p>
              </div>

              <div>
                <p>
                  <strong>Placement:</strong>{" "}
                  {advertiser.placement_type}
                </p>

                <p>
                  <strong>Status:</strong>{" "}
                  {advertiser.status}
                </p>

                <p>
                  <strong>Subscription:</strong>{" "}
                  {advertiser.subscription_status}
                </p>
              </div>

            </div>

            <div className="mt-4 flex gap-3">

              <button
                onClick={() =>
                  updateStatus(
                    advertiser.id,
                    "approved"
                  )
                }
                className="px-4 py-2 bg-green-600 text-white rounded-lg"
              >
                Approve
              </button>

              <button
                onClick={() =>
                  updateStatus(
                    advertiser.id,
                    "rejected"
                  )
                }
                className="px-4 py-2 bg-red-600 text-white rounded-lg"
              >
                Reject
              </button>

            </div>

          </div>

        ))}

      </div>

    </div>
  );
}
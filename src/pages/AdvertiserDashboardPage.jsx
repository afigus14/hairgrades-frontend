import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function AdvertiserDashboardPage() {
  const [advertisers, setAdvertisers] = useState([]);

  useEffect(() => {
    loadAdvertisers();
  }, []);

  async function loadAdvertisers() {
    const { data, error } = await supabase
      .from("advertisers")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      return;
    }

    setAdvertisers(data || []);
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold mb-8">
        Advertiser Dashboard
      </h1>

      <div className="grid gap-6">
        {advertisers.map((ad) => (
          <div
            key={ad.id}
            className="bg-white rounded-xl shadow p-6"
          >
            <h2 className="text-xl font-semibold">
              {ad.company_name}
            </h2>

            <p className="text-gray-600">
              {ad.website}
            </p>

            <div className="mt-4 grid md:grid-cols-3 gap-4">
              <div>
                <div className="text-sm text-gray-500">
                  Status
                </div>
                <div className="font-medium">
                  {ad.subscription_status}
                </div>
              </div>

              <div>
                <div className="text-sm text-gray-500">
                  Impressions
                </div>
                <div className="font-medium">
                  {ad.impressions || 0}
                </div>
              </div>

              <div>
                <div className="text-sm text-gray-500">
                  Clicks
                </div>
                <div className="font-medium">
                  {ad.clicks || 0}
                </div>
              </div>
            </div>

            <div className="mt-4">
              <span className="inline-block px-3 py-1 rounded-full bg-gray-100">
                {ad.placement_type}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
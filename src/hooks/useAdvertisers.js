// src/hooks/useAdvertisers.js

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

function isAdvertiserEligible(advertiser) {
  if (advertiser.status !== "approved") return false;

  if (!advertiser.is_active) return false;

  // Complimentary campaigns
  if (advertiser.complimentary_until) {
    const today = new Date();
    const expires = new Date(advertiser.complimentary_until);

    if (expires >= today) {
      return true;
    }
  }

  // Paid subscription
  return advertiser.subscription_status === "active";
}

export default function useAdvertisers() {
  const [advertisers, setAdvertisers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAdvertisers() {
      const { data, error } = await supabase
        .from("advertisers")
        .select("*")
        .order("priority_level", { ascending: false });

      if (error) {
        console.error(error);
      } else {
        setAdvertisers(
          (data || []).filter(isAdvertiserEligible)
        );
      }

      setLoading(false);
    }

    loadAdvertisers();
  }, []);

  return {
    advertisers,
    loading,
  };
}
// src/hooks/useAdvertisers.js

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

const STORAGE_KEY = "stylegrades-priority-rotation";

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

function rotateGroup(group, offset) {
  if (group.length <= 1) return group;

  const start = offset % group.length;

  return [
    ...group.slice(start),
    ...group.slice(0, start),
  ];
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
        setLoading(false);
        return;
      }

      const eligible = (data || []).filter(isAdvertiserEligible);

      // Group advertisers by priority level
      const groups = {};

      eligible.forEach((advertiser) => {
        const priority = advertiser.priority_level ?? 0;

        if (!groups[priority]) {
          groups[priority] = [];
        }

        groups[priority].push(advertiser);
      });

      const priorities = Object.keys(groups)
        .map(Number)
        .sort((a, b) => b - a);

      const storedOffsets = JSON.parse(
        localStorage.getItem(STORAGE_KEY) || "{}"
      );

      const ordered = [];

      priorities.forEach((priority) => {
        const group = groups[priority];

        const offset =
          storedOffsets[priority] || 0;

        ordered.push(
          ...rotateGroup(group, offset)
        );

        storedOffsets[priority] =
          (offset + 1) % group.length;
      });

      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(storedOffsets)
      );

      console.log(
        "ROTATED ORDER:",
        ordered.map((a) => a.company_name)
      );

      setAdvertisers(ordered);
      setLoading(false);
    }

    loadAdvertisers();
  }, []);

  return {
    advertisers,
    loading,
  };
}
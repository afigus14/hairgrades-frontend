import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function PublicReviewLandingPage() {
  const { profileSlug } = useParams();

  const navigate = useNavigate();

  const [stylist, setStylist] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStylist() {
      const { data } = await supabase
        .from("stylists")
        .select("*")
        .eq("profile_slug", profileSlug)
        .single();

      setStylist(data);
      setLoading(false);
    }

    loadStylist();
  }, [profileSlug]);

  if (loading) {
    return (
      <div className="py-20 text-center">
        Loading...
      </div>
    );
  }

  if (!stylist) {
    return (
      <div className="py-20 text-center">
        Stylist not found.
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-16">

      <div className="rounded-3xl bg-white shadow-lg border p-10 text-center">

        <img
          src={stylist.photo_url}
          alt={stylist.full_name}
          className="mx-auto w-40 h-40 rounded-full object-cover shadow"
        />

        <h1 className="mt-6 text-4xl font-serif font-bold text-[#102A43]">
          Love your new look?
        </h1>

        <p className="mt-3 text-lg text-[#52606D]">
          Tell others about your experience with
        </p>

        <h2 className="mt-5 text-3xl font-bold text-[#102A43]">
          {stylist.full_name}
        </h2>

        <div className="mt-2 text-xl text-[#52606D]">
          {stylist.salon_name}
        </div>

        <div className="mt-1 text-[#7B8794]">
          {stylist.city}, {stylist.state}
        </div>

        <button
          onClick={() =>
            navigate(`/review/start/${stylist.profile_slug}`)
          }
          className="mt-10 rounded-xl bg-[#102A43] px-8 py-4 text-white font-semibold hover:opacity-90"
        >
          Continue
        </button>

      </div>

    </div>
  );
}
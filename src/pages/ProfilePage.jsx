import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function ProfilePage() {
  const { id } = useParams();
  const [stylist, setStylist] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStylist() {
      const { data, error } = await supabase
        .from("stylists")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error loading stylist:", error);
      } else {
        setStylist(data);
      }

      setLoading(false);
    }

    fetchStylist();
  }, [id]);

  if (loading) {
    return <div className="p-10">Loading...</div>;
  }

  if (!stylist) {
    return <div className="p-10">Stylist not found.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-serif text-[#102A43] mb-6">
        {stylist.full_name}
      </h1>

      {/* PHOTO */}
      {stylist.photo_url && (
        <img
          src={stylist.photo_url}
          alt={stylist.full_name}
          className="w-64 h-64 object-cover rounded-xl mb-6"
        />
      )}

      {/* BASIC INFO */}
      <p className="text-[#52606D] mb-2">
        {stylist.city}, {stylist.state}
      </p>

      {stylist.license && (
        <p className="text-sm text-[#52606D]">
          Licensed: {stylist.license}
        </p>
      )}

      <p className="text-[#52606D] mb-4">
        {stylist.email}
      </p>

      {/* VERIFIED BADGE */}
      {stylist.verified && (
        <div className="mb-2 inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-xs font-semibold tracking-wide">
          ✔ Verified by Stylegrades
        </div>
      )}


      {/* BIO */}
      {stylist.bio && (
        <p className="text-[#243B53] mb-6">
          {stylist.bio}
        </p>
      )}

      {/* SPECIALTIES */}
      {stylist.specialties && (
        <div className="mb-6">
          <h3 className="font-semibold mb-2">Specialties</h3>
          <ul className="list-disc list-inside">
            {stylist.specialties.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        </div>
      )}

      {/* GALLERY */}
      {stylist.gallery && stylist.gallery.length > 0 && (
        <div>
          <h3 className="font-semibold mb-2">Gallery</h3>
          <div className="grid grid-cols-3 gap-3">
            {stylist.gallery.map((img, i) => (
              <img
                key={i}
                src={img}
                alt="work"
                className="rounded-lg object-cover h-32 w-full"
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
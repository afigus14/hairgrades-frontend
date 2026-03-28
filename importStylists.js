import { createClient } from "@supabase/supabase-js";
import fs from "fs";

// Load JSON file
const raw = fs.readFileSync("./src/data/stylists-with-coords.json");
const stylists = JSON.parse(raw);

// Supabase connection
const supabase = createClient(
  "https://psrvmlonvirvibgpivnk.supabase.co",
  "sb_publishable_ECHnjxzSBq8ZViWyTuS06A_xi3XU4l7"
);

async function importStylists() {

  const cleaned = stylists.map((s) => ({
    full_name: s.name || s.fullName || "",
    email: "",
    city: s.city || "",
    state: s.state || "",
    bio: s.bio || "",
    specialties: s.specialties || [],
    featured: s.featured || false,
    status: "approved",
    tier_requested: "free",
    tier_active: "free",
    photo_url: s.photoUrl || "",
    gallery: s.gallery || [],
    rating: s.rating || 0,
    reviews_count: s.review_count || 0
  }));

  const { data, error } = await supabase
    .from("stylists")
    .insert(cleaned);

  if (error) {
    console.error("Import error:", error);
  } else {
    console.log("Imported stylists:", cleaned.length);
  }
}

importStylists();
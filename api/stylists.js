// api/stylists.js

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  // ✅ security check
  const adminKey = req.headers["x-admin-key"];

  if (adminKey !== process.env.ADMIN_API_KEY) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const { data, error } = await supabase
      .from("stylists")
      .select("*");

    if (error) {
      throw error;
    }

    return res.status(200).json({
      ok: true,
      stylists: data,
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to load stylists" });
  }
}
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { id, adminKey } = req.body;

  if (adminKey !== process.env.ADMIN_API_KEY) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { error } = await supabase
    .from("stylists")
    .update({ status: "inactive" })
    .eq("id", id);

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.status(200).json({ success: true });
}
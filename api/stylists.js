// api/stylists.js

import fs from "fs";
import path from "path";

export default async function handler(req, res) {
  // ✅ security check
  const adminKey = req.headers["x-admin-key"];

  if (adminKey !== process.env.ADMIN_API_KEY) {
    return res.status(401).json({ error: "Unauthorized" });
  }

    try {
    const stylists = await import("../src/data/stylists-with-coords.json", {
        assert: { type: "json" },
        });

    return res.status(200).json(stylists.default);
 } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to load stylists" });
 }
}
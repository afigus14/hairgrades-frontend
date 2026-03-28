import "dotenv/config";
import fs from "fs/promises";

const INPUT = "./src/data/stylists.json";
const OUTPUT = "./src/data/stylists-with-coords.json";

const GOOGLE_API_KEY = process.env.VITE_GOOGLE_MAPS_API_KEY;

async function geocodeGoogle(address) {
  if (!GOOGLE_API_KEY) {
    console.warn("⚠️ No Google API key found in .env");
    return null;
  }
  const url =
    `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${GOOGLE_API_KEY}`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const data = await res.json();
  const result = data.results?.[0];
  if (!result) return null;
  const { lat, lng } = result.geometry.location;
  return { lat, lng, from: "google" };
}

async function geocodeZip(zip) {
  const url = `https://api.zippopotam.us/us/${encodeURIComponent(zip)}`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const data = await res.json();
  const p = data?.places?.[0];
  if (!p) return null;
  return {
    lat: Number(p.latitude),
    lng: Number(p.longitude),
    from: "zippopotam",
  };
}

async function main() {
  const raw = await fs.readFile(INPUT, "utf-8");
  const stylists = JSON.parse(raw);

  const updated = [];
  for (const s of stylists) {
    const label = `${s.name} (${s.city || ""} ${s.state || ""} ${s.zip || ""})`.trim();
    console.log(`📍 Geocoding: ${label}`);

    const query = s.zip ? s.zip : `${s.city || ""}, ${s.state || ""}`;

    let coords = await geocodeGoogle(query);
    if (!coords && s.zip) {
      console.log("   ⚠️ Google failed — trying ZIP fallback…");
      coords = await geocodeZip(s.zip);
    }

    if (!coords) {
      console.log(`   ❌ Geocode failed for "${s.name}"`);
      updated.push({ ...s, lat: null, lng: null });
    } else {
      console.log(`   ✅ ${s.name}: ${coords.lat}, ${coords.lng} (${coords.from})`);
      updated.push({ ...s, lat: coords.lat, lng: coords.lng, geocodedBy: coords.from });
    }

    await new Promise(r => setTimeout(r, 150));
  }

  await fs.writeFile(OUTPUT, JSON.stringify(updated, null, 2));
  console.log(`\n✅ Done! Updated stylists saved to ${OUTPUT}.`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});

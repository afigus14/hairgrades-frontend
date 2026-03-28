import "dotenv/config";

const key = process.env.VITE_GOOGLE_MAPS_API_KEY;

if (!key) {
  console.error("❌ No key found. Check that .env exists and contains VITE_GOOGLE_MAPS_API_KEY.");
  process.exit(1);
}

console.log("✅ Key loaded from .env successfully! Length:", key.length);

const address = "Chicago, IL";
const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${key}`;

const res = await fetch(url);
const data = await res.json();

if (data.status === "OK") {
  const { lat, lng } = data.results[0].geometry.location;
  console.log(`📍 ${address} → ${lat}, ${lng}`);
} else {
  console.error("⚠️ Geocoding API returned:", data.status, data.error_message || "");
}

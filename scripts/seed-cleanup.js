// scripts/seed-cleanup.js
// One-time cleanup to add price/payments fields + normalize some shape issues.
// Run: node scripts/seed-cleanup.js

import fs from "fs";
import path from "path";

const FILE_PATH = path.join(process.cwd(), "src", "data", "stylists-with-coords.json");

function readJson(p) {
  const raw = fs.readFileSync(p, "utf8");
  return JSON.parse(raw);
}

function writeJson(p, obj) {
  fs.writeFileSync(p, JSON.stringify(obj, null, 2), "utf8");
}

// Choose your platform defaults here:
const DEFAULT_PRICE_BY_TIER = {
  free: "$",
  pro: "$$",
  premium: "$$$",
};

const DEFAULT_PAYMENTS = ["credit_cards"]; // change to what you want as default

function toArray(v) {
  if (Array.isArray(v)) return v;
  if (typeof v === "string") {
    const s = v.trim();
    return s ? [s] : [];
  }
  return [];
}

function cleanString(v) {
  if (v == null) return "";
  return String(v).trim();
}

function normalizePriceTier(sty) {
  // If already set and valid, keep it
  const existing = cleanString(sty.priceTier);
  if (["$", "$$", "$$$", "$$$$"].includes(existing)) return existing;

  // If they filled "cost" with $, $$, etc., prefer that
  const cost = cleanString(sty.cost);
  if (["$", "$$", "$$$", "$$$$"].includes(cost)) return cost;

  // Otherwise infer from tier (free/pro/premium)
  const tier = cleanString(sty.tier || sty.tierRequested).toLowerCase();
  return DEFAULT_PRICE_BY_TIER[tier] || "$$";
}

function normalizePayments(sty) {
  // If already an array and contains allowed values, keep it
  const allowed = new Set(["credit_cards", "apple_pay", "cash_only"]);
  if (Array.isArray(sty.payments) && sty.payments.length) {
    const cleaned = sty.payments
      .map((x) => cleanString(x))
      .filter(Boolean)
      .filter((x) => allowed.has(x));
    if (cleaned.length) return cleaned;
  }

  // Otherwise default
  return [...DEFAULT_PAYMENTS];
}

function normalizeAwards(sty) {
  // Your seed stylists use awards: [] but some approved have awards: ""
  return toArray(sty.awards).filter(Boolean);
}

function normalizeSpecialties(sty) {
  // Make sure specialties is always an array
  return toArray(sty.specialties).map(cleanString).filter(Boolean);
}

function normalizeFeatured(sty) {
  // Ensure featured exists as boolean
  return !!sty.featured;
}

function normalizeVerified(sty) {
  // Ensure verified exists as boolean (default true for approved)
  if (typeof sty.verified === "boolean") return sty.verified;
  return true;
}

function normalizeSortOrder(sty, idx) {
  // If you want reorder controls to work reliably, sortOrder should exist
  // Use existing sortOrder if finite, else give a stable default.
  return Number.isFinite(sty.sortOrder) ? sty.sortOrder : idx;
}

function main() {
  const list = readJson(FILE_PATH);
  if (!Array.isArray(list)) {
    throw new Error("stylists-with-coords.json is not an array");
  }

  let changed = 0;

  const next = list.map((sty, idx) => {
    const before = JSON.stringify(sty);

    const normalized = {
      ...sty,

      // normalize shapes
      specialties: normalizeSpecialties(sty),
      awards: normalizeAwards(sty),

      // ensure booleans exist
      featured: normalizeFeatured(sty),
      verified: normalizeVerified(sty),

      // add new filter fields
      priceTier: normalizePriceTier(sty),
      payments: normalizePayments(sty),

      // ensure sortOrder exists (helps admin reorder later)
      sortOrder: normalizeSortOrder(sty, idx),
    };

    const after = JSON.stringify(normalized);
    if (after !== before) changed += 1;

    return normalized;
  });

  writeJson(FILE_PATH, next);
  console.log(`✅ Done. Updated ${changed} stylist record(s).`);
  console.log(`Wrote: ${FILE_PATH}`);
}

main();


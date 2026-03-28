// src/components/MapEmbed.jsx
import React from "react";

export default function MapEmbed({ lat, lng, label }) {
  // Only render if we have valid coordinates
  if (typeof lat !== "number" || typeof lng !== "number") return null;

  const q = `${lat},${lng}`;
  const mapSrc = `https://www.google.com/maps?q=${encodeURIComponent(q)}&z=14&output=embed`;
  const mapsLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;

  return (
    <div className="mt-6">
      <div className="rounded-xl overflow-hidden shadow ring-1 ring-stone-200">
        <iframe
          title={label ? `Map of ${label}` : "Map"}
          src={mapSrc}
          width="100%"
          height="280"
          style={{ border: 0 }}
          loading="lazy"
          allowFullScreen
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>
      <a
        href={mapsLink}
        target="_blank"
        rel="noreferrer"
        className="text-amber-700 hover:text-amber-800 text-sm inline-block mt-2"
      >
        View on Google Maps →
      </a>
    </div>
  );
}



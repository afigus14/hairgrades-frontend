import React, { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { useNavigate } from "react-router-dom";
import "leaflet/dist/leaflet.css";

function RecenterMap({ location }) {
  const map = useMap();

  useEffect(() => {
    if (location) {
      map.setView([location.lat, location.lng], 11);
    }
  }, [location, map]);

  return null;
}

export default function StylistMap({ stylists, userLocation }) {

  const navigate = useNavigate();

  const center = userLocation
    ? [userLocation.lat, userLocation.lng]
    : stylists.length
    ? [stylists[0].lat, stylists[0].lng]
    : [37.0902, -95.7129];

  return (
    <MapContainer
      center={center}
      zoom={10}
      style={{ height: "400px", width: "100%", borderRadius: "12px" }}
    >
      <TileLayer
        attribution="&copy; OpenStreetMap"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <RecenterMap location={userLocation} />

      {stylists.map((stylist) => {

        if (!stylist.lat || !stylist.lng) return null;

        return (
          <Marker
            key={stylist.id}
            position={[stylist.lat, stylist.lng]}
          >
            <Popup>

              <div style={{ textAlign: "center" }}>
                <strong>{stylist.name}</strong>
                <br />
                {stylist.city}, {stylist.state}

                <br />

                <button
                  onClick={() =>
                    navigate(`/profile/${stylist.id}`)
                  }
                  style={{
                    marginTop: "6px",
                    padding: "4px 8px",
                    cursor: "pointer"
                  }}
                >
                  View Profile
                </button>

              </div>

            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
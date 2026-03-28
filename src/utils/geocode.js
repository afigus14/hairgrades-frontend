export const geocodeCity = async (city) => {
  const response = await fetch(
    `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
      city
    )}&key=AIzaSyCQx5oepF0NDrvePBv-Om16-4tpUTTGi6Q`
  );
  const data = await response.json();
  if (data.status !== "OK" || !data.results.length) {
    throw new Error("Geocoding failed");
  }
  const { lat, lng } = data.results[0].geometry.location;
  return { lat, lon: lng };
};

export const haversineDistance = (coord1, coord2) => {
  const toRad = (x) => (x * Math.PI) / 180;
  const R = 3958.8; // miles
  const dLat = toRad(coord2.lat - coord1.lat);
  const dLon = toRad(coord2.lon - coord1.lon);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(coord1.lat)) *
      Math.cos(toRad(coord2.lat)) *
      Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};
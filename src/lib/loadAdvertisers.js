export async function loadAdvertisers() {
  const API_BASE =
    import.meta.env.VITE_API_BASE_URL ||
    "https://stylegrades-api.vercel.app";

  const response = await fetch(
    `${API_BASE}/api/advertisers`
  );

  if (!response.ok) {
    throw new Error(
      "Failed to load advertisers"
    );
  }

  return response.json();
}
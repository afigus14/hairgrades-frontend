const API_BASE =
  import.meta.env.VITE_API_BASE_URL ||
  "https://stylegrades-api.vercel.app";

export async function applications(formData) {
  const res = await fetch(`${API_BASE}/api/applications`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(formData),
  });

  if (!res.ok) {
    let errorMessage = "Request failed";

    try {
      const data = await res.json();
      errorMessage = data?.error || JSON.stringify(data);
    } catch {
      const text = await res.text();
      errorMessage = text;
    }

    throw new Error(errorMessage);
  }

  return res.json();
}
const API_BASE = import.meta.env.VITE_API_BASE_URL;

export async function applications(formData) {
  const res = await fetch(`${API_BASE}/api/applications`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(formData),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Request failed");
  }

  return res.json();
}
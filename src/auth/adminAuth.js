// src/auth/adminAuth.js

const KEY_STORAGE = "stylegrades_admin_key";
const AUTH_STORAGE = "stylegrades_admin_authed";

/**
 * Simple admin session:
 * - authenticated = "1" when user logged in successfully
 * - adminKey stored separately (used for API calls)
 */

export function getAdminKey() {
  return localStorage.getItem(KEY_STORAGE) || "";
}

export function setAdminKey(key) {
  localStorage.setItem(KEY_STORAGE, key || "");
}

export function isAdminAuthed() {
  return localStorage.getItem(AUTH_STORAGE) === "1" && !!getAdminKey();
}

export function setAdminAuthed(value) {
  localStorage.setItem(AUTH_STORAGE, value ? "1" : "0");
}

export function logoutAdmin() {
  // Keep key or wipe? I recommend wiping to be safe.
  localStorage.removeItem(KEY_STORAGE);
  localStorage.removeItem(AUTH_STORAGE);
}

/**
 * Verifies the key by calling an admin endpoint.
 * We use /api/admin/applications because it exists and is read-only.
 */
export async function verifyAdminKey(apiBase, adminKey) {
  const url = `${apiBase}/api/admin/applications`;
  const res = await fetch(url, {
    method: "GET",
    headers: {
      "x-admin-key": adminKey,
    },
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok || !data?.ok) {
    throw new Error(data?.error || `Admin key rejected (HTTP ${res.status})`);
  }

  return true;
}

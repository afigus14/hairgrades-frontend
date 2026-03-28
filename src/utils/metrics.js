const KEY = "sg_metrics_v1";

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : { views: {}, clicks: {} };
  } catch {
    return { views: {}, clicks: {} };
  }
}

function save(data) {
  localStorage.setItem(KEY, JSON.stringify(data));
}

export function trackProfileView(stylistId) {
  const data = load();
  const id = String(stylistId);
  data.views[id] = (data.views[id] || 0) + 1;
  save(data);
}

export function trackProfileClick(stylistId) {
  const data = load();
  const id = String(stylistId);
  data.clicks[id] = (data.clicks[id] || 0) + 1;
  save(data);
}

export function getMetrics(stylistId) {
  const data = load();
  const id = String(stylistId);
  return {
    views: data.views[id] || 0,
    clicks: data.clicks[id] || 0,
  };
}

export function getAllMetrics() {
  return load(); // { views: {id: n}, clicks: {id: n} }
}

export function resetAllMetrics() {
  save({ views: {}, clicks: {} });
}

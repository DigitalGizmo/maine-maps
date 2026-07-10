// Data access for map sets.
// Online modes (dev, review) fetch the live Django API. The offline kiosk reads
// a bundled static snapshot (public/data/maps.json) instead — gated by
// VITE_KIOSK. Note review is NOT a kiosk build: it sets VITE_ATTRACT (attract
// behavior) but leaves VITE_KIOSK false, so it still fetches live data. Because
// the list and detail API endpoints share one serializer, the snapshot of
// /maps/ holds everything, and detail lookups just filter the list by slug.

const isKiosk = import.meta.env.VITE_KIOSK === 'true';
const API_BASE = import.meta.env.VITE_API_BASE;
const DATA_URL = `${import.meta.env.BASE_URL}data/maps.json`;

let localCache = null;

async function loadLocalData() {
  if (!localCache) {
    const res = await fetch(DATA_URL);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    localCache = await res.json();
  }
  return localCache;
}

export async function getMaps() {
  if (isKiosk) return loadLocalData();
  const res = await fetch(`${API_BASE}/maps/`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function getMap(slug) {
  if (isKiosk) {
    const all = await loadLocalData();
    const mapset = all.find((m) => m.slug === slug);
    if (!mapset) throw new Error(`Map not found: ${slug}`);
    return mapset;
  }
  const res = await fetch(`${API_BASE}/maps/${slug}/`);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

// /api/osm-geocode.js
export const config = { api: { bodyParser: false } };

// naive in-memory cache + throttle (per serverless instance)
const OSM_CACHE = globalThis.__OSM_CACHE__ ??= new Map(); // key -> {ts, data}
let LAST_HIT = globalThis.__OSM_LAST_HIT__ ??= 0;

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

export default async function handler(req, res) {
  try {
    const { q } = Object.fromEntries(new URL(req.url, 'http://x').searchParams);
    if (!q) return res.status(400).json({ error: "Missing ?q=" });

    // 1) serve from cache (10 days)
    const key = `geocode::${q.toLowerCase().trim()}`;
    const now = Date.now();
    const cached = OSM_CACHE.get(key);
    if (cached && (now - cached.ts) < 10 * 24 * 3600 * 1000) {
      res.setHeader("Cache-Control", "s-maxage=86400, stale-while-revalidate=604800");
      return res.status(200).json(cached.data);
    }

    // 2) be nice: throttle to ~1 req/sec
    const delta = now - LAST_HIT;
    if (delta < 1100) await sleep(1100 - delta);
    LAST_HIT = Date.now();

    const url = "https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=us&q=" +
                encodeURIComponent(q);

    const r = await fetch(url, {
      headers: {
        "User-Agent": "MonasAirportLivery/1.0 (replace-with-your-email@example.com)",
        "Accept-Language": "en",
      },
    });
    if (!r.ok) return res.status(r.status).json({ error: `Upstream ${r.status}` });

    const arr = await r.json();
    const hit = arr?.[0] ? {
      lat: parseFloat(arr[0].lat),
      lon: parseFloat(arr[0].lon),
      name: arr[0].display_name,
    } : null;

    const data = hit || null;
    OSM_CACHE.set(key, { ts: Date.now(), data });

    res.setHeader("Cache-Control", "s-maxage=86400, stale-while-revalidate=604800");
    return res.status(200).json(data);
  } catch (e) {
    return res.status(502).json({ error: String(e?.message || e) });
  }
}

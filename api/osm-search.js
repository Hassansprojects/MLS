// /api/osm-search.js
export const config = { api: { bodyParser: false } };

const OSM_CACHE = globalThis.__OSM_CACHE__ ??= new Map();
let LAST_HIT = globalThis.__OSM_LAST_HIT__ ??= 0;

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

export default async function handler(req, res) {
  try {
    const sp = new URL(req.url, "http://x").searchParams;
    const q = (sp.get("q") || "").trim();
    if (q.length < 3) return res.status(200).json([]);

    const key = `search::${q.toLowerCase()}`;
    const now = Date.now();
    const cached = OSM_CACHE.get(key);
    if (cached && (now - cached.ts) < 7 * 24 * 3600 * 1000) {
      res.setHeader("Cache-Control", "s-maxage=86400, stale-while-revalidate=604800");
      return res.status(200).json(cached.data);
    }

    const delta = now - LAST_HIT;
    if (delta < 1100) await sleep(1100 - delta);
    LAST_HIT = Date.now();

    const params = new URLSearchParams({
      format: "json",
      addressdetails: "1",
      limit: "10",
      countrycodes: "us",
      q,
      viewbox: "-75,47,-66,41",
      bounded: "1",
    });
    const url = `https://nominatim.openstreetmap.org/search?${params}`;

    const r = await fetch(url, {
      headers: {
        "User-Agent": "MonasAirportLivery/1.0 (replace-with-your-email@example.com)",
        "Accept-Language": "en",
      },
    });
    if (!r.ok) return res.status(r.status).json({ error: `Upstream ${r.status}` });

    const data = (await r.json()).map(hit => ({
      label: hit.display_name,
      lat: parseFloat(hit.lat),
      lon: parseFloat(hit.lon),
      type: hit.type,
    }));

    OSM_CACHE.set(key, { ts: Date.now(), data });
    res.setHeader("Cache-Control", "s-maxage=86400, stale-while-revalidate=604800");
    return res.status(200).json(data);
  } catch (e) {
    return res.status(502).json({ error: String(e?.message || e) });
  }
}

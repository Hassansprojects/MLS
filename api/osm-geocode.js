// /api/osm-geocode.js
export const config = { api: { bodyParser: false } };

// tiny helpers
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const RETRY_STATUSES = new Set([429, 503, 522, 524]);
async function fetchWithRetry(url, headers, tries = 2) {
  for (let i = 0; i <= tries; i++) {
    const r = await fetch(url, { headers });
    if (r.ok) return r;
    if (!RETRY_STATUSES.has(r.status) || i === tries) return r;
    const retryAfter = parseInt(r.headers.get("retry-after") || "0", 10);
    const waitMs = (retryAfter ? retryAfter * 1000 : 800 * (i + 1)) + Math.floor(Math.random() * 200);
    await sleep(waitMs);
  }
  // defensive fallback (shouldn't hit)
  return new Response(null, { status: 503 });
}

export default async function handler(req, res) {
  try {
    const { searchParams } = new URL(req.url, "http://localhost");
    const q = (searchParams.get("q") || "").trim();
    if (!q) return res.status(400).json({ error: "Missing query" });

    // Build upstream URL
    const url =
      "https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=us&q=" +
      encodeURIComponent(q);

    // IMPORTANT: use a real contact per OSM policy
    const headers = {
      "User-Agent": "MonasAirportLivery/1.0 (monasairportlivery@gmail.com; https://mls-phi.vercel.app/)",
      "Accept-Language": "en",
    };

    // retry/backoff for transient 429/503
    const r = await fetchWithRetry(url, headers);

    // If upstream is unhappy, return 200 with null to avoid console errors
    if (!r.ok) {
      res.setHeader("X-Upstream-Status", String(r.status));
      res.setHeader("Cache-Control", "s-maxage=10"); // brief CDN cache on failure
      return res.status(200).json(null);
    }

    const arr = await r.json();
    const hit = arr?.[0]
      ? { lat: parseFloat(arr[0].lat), lon: parseFloat(arr[0].lon), name: arr[0].display_name }
      : null;

    // cache OK responses at the edge for a day
    res.setHeader("Cache-Control", "s-maxage=86400, stale-while-revalidate=604800");
    return res.status(200).json(hit);
  } catch (e) {
    return res.status(502).json({ error: e?.message || "Upstream error" });
  }
}

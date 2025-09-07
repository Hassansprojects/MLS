// /api/osm-search.js
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
  return new Response(null, { status: 503 });
}

export default async function handler(req, res) {
  try {
    const { searchParams } = new URL(req.url, "http://localhost");
    const q = (searchParams.get("q") || "").trim();
    if (!q || q.length < 3) return res.status(200).json([]);

    const params = new URLSearchParams({
      format: "json",
      addressdetails: "1",
      limit: "10",
      countrycodes: "us",
      q,
      // You can add bounded/viewbox here if you want to limit to a region
    });
    const url = "https://nominatim.openstreetmap.org/search?" + params.toString();

    const headers = {
      "User-Agent": "MonasAirportLivery/1.0 (monasairportlivery@gmail.com; https://mls-phi.vercel.app/)",
      "Accept-Language": "en",
    };

    const r = await fetchWithRetry(url, headers);

    if (!r.ok) {
      res.setHeader("X-Upstream-Status", String(r.status));
      res.setHeader("Cache-Control", "s-maxage=10");
      return res.status(200).json([]);
    }

    const data = await r.json();
    const cleaned = data.map((hit) => ({
      label: hit.display_name,
      lat: parseFloat(hit.lat),
      lon: parseFloat(hit.lon),
      type: hit.type,
    }));

    res.setHeader("Cache-Control", "s-maxage=86400, stale-while-revalidate=604800");
    return res.status(200).json(cleaned);
  } catch (e) {
    return res.status(502).json({ error: e?.message || "Upstream error" });
  }
}

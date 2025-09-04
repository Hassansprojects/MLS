// /api/directions.js
export const config = { api: { bodyParser: true } };

function sum(arr) { return arr.reduce((a, b) => a + b, 0); }

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { origin, destination } = req.body || {};
  if (!origin?.lat || !origin?.lon || !destination?.lat || !destination?.lon) {
    return res.status(400).json({ error: "origin {lat,lon} and destination {lat,lon} required" });
  }

  const key = process.env.GOOGLE_MAPS_API_KEY;
  if (!key) return res.status(500).json({ error: "Missing GOOGLE_MAPS_API_KEY" });

  const url = new URL("https://maps.googleapis.com/maps/api/directions/json");
  url.searchParams.set("origin", `${origin.lat},${origin.lon}`);
  url.searchParams.set("destination", `${destination.lat},${destination.lon}`);
  url.searchParams.set("mode", "driving");
  url.searchParams.set("key", key);

  try {
    const r = await fetch(url.toString());
    const j = await r.json();

    if (j.status !== "OK" || !j.routes?.length) {
      return res.status(502).json({ error: `Directions failed: ${j.status || "Unknown"}` });
    }

    const route = j.routes[0];
    const legs = route.legs || [];
    const meters  = sum(legs.map(l => l.distance?.value || 0));
    const seconds = sum(legs.map(l => l.duration?.value || 0));
    const miles   = meters / 1609.344;
    const minutes = seconds / 60;

    return res.status(200).json({
      meters,
      seconds,
      miles: Number(miles.toFixed(2)),
      minutes: Math.round(minutes),
    });
  } catch (e) {
    return res.status(502).json({ error: `Fetch error: ${e?.message || e}` });
  }
}

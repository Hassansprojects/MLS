// /api/eta.js
export const config = { api: { bodyParser: true } };

// Helper to call Distance Matrix and extract a single origin→dest result
async function dm({ key, origins, destinations, mode, departure_time, traffic_model }) {
  const url = new URL("https://maps.googleapis.com/maps/api/distancematrix/json");
  url.searchParams.set("origins", origins);
  url.searchParams.set("destinations", destinations);
  url.searchParams.set("mode", mode);
  if (departure_time) url.searchParams.set("departure_time", String(departure_time));
  if (traffic_model) url.searchParams.set("traffic_model", traffic_model);
  url.searchParams.set("key", key);

  const r = await fetch(url.toString());
  const j = await r.json();
  if (j.status !== "OK") throw new Error(`DM status ${j.status}`);
  const el = j.rows?.[0]?.elements?.[0];
  if (!el || el.status !== "OK") throw new Error(`DM element ${el?.status || "Unknown"}`);

  // Prefer duration_in_traffic when available (driving w/ departure_time)
  const seconds = el.duration_in_traffic?.value ?? el.duration?.value ?? 0;
  const meters = el.distance?.value ?? 0;
  return { meters, seconds, minutes: Math.round(seconds / 60) };
}

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

    const { origin, destination, when } = req.body || {};
    if (!origin?.lat || !origin?.lon || !destination?.lat || !destination?.lon) {
      return res.status(400).json({ error: "origin {lat,lon} and destination {lat,lon} required" });
    }

    const key = process.env.GOOGLE_MAPS_API_KEY;
    if (!key) return res.status(500).json({ error: "Missing GOOGLE_MAPS_API_KEY" });

    const origins = `${origin.lat},${origin.lon}`;
    const destinations = `${destination.lat},${destination.lon}`;

    // Distance Matrix "now" needs a future epoch (>= now+1 min is safe)
    const nowEpoch = Math.floor(Date.now() / 1000) + 90;
    const whenEpoch = when ? Math.floor(new Date(when).getTime() / 1000) : null;

    // 1) Driving now (traffic_model=best_guess)
    let driving_now = null;
    try {
      driving_now = await dm({
        key, origins, destinations, mode: "driving",
        departure_time: nowEpoch, traffic_model: "best_guess",
      });
    } catch (_) {}

    // 2) Driving at scheduled pickup time (if provided)
    let driving_at = null;
    if (whenEpoch) {
      try {
        driving_at = await dm({
          key, origins, destinations, mode: "driving",
          departure_time: whenEpoch, traffic_model: "best_guess",
        });
      } catch (_) {}
    }

    // 3) Transit (best effort)
    let transit = null;
    try {
      transit = await dm({
        key, origins, destinations, mode: "transit",
        departure_time: nowEpoch,
      });
    } catch (_) {}

    return res.status(200).json({ driving_now, driving_at, transit });
  } catch (e) {
    return res.status(502).json({ error: e?.message || String(e) });
  }
}

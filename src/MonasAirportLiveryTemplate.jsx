import emailjs from "@emailjs/browser";
import React, { useMemo, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { loadStripe } from "@stripe/stripe-js";


import {
  Car,
  Phone,
  Clock,
  MapPin,
  Plane,
  Navigation,
  Star,
  ShieldCheck,
  CreditCard,
  CheckCircle2,
  ChevronDown,
  Users,
  Info,
  Calendar,
  Languages,
  Mail,
  Menu,
  X,
} from "lucide-react";

/**
 * Monas Airport Livery — Single‑file React template
 *
 * ✨ Highlights
 * - Luxury hero with animated stars + glass navbar
 * - Real‑time quote estimator (airport ↔ city / point‑to‑point)
 * - Multi‑step booking widget with validation & summary modal
 * - Fleet showcase with quick‑select to prefill booking
 * - Rates table, services, coverage, reviews, FAQ, contact
 * - Accessibility‑first: labeled inputs, keyboard focus, high contrast
 * - No external APIs required; placeholders for Stripe/flight status/map
 *
 * 🧪 Tip: Click vehicle “Select” to auto‑set the booking vehicle.
 * 📞 Floating Call button (mobile‑friendly)
 */

// ---------------------------------------------------------
// Data: airports, cities, vehicles, FAQs, testimonials
// ---------------------------------------------------------
const AIRPORTS = [
  { code: "BOS", name: "Boston Logan Intl (BOS)", lat: 42.3656, lon: -71.0096 },
  { code: "JFK", name: "New York JFK", lat: 40.6413, lon: -73.7781 },
  { code: "LGA", name: "New York LaGuardia", lat: 40.7769, lon: -73.874 },
  { code: "EWR", name: "Newark (EWR)", lat: 40.6895, lon: -74.1745 },
  { code: "PVD", name: "Providence (PVD)", lat: 41.724, lon: -71.4283 },
  { code: "MHT", name: "Manchester–Boston (MHT)", lat: 42.9326, lon: -71.4357 },
];

const CITIES = [
  { name: "Boston, MA", lat: 42.3601, lon: -71.0589 },
  { name: "Cambridge, MA", lat: 42.3736, lon: -71.1097 },
  { name: "Brookline, MA", lat: 42.3318, lon: -71.1212 },
  { name: "Newton, MA", lat: 42.337, lon: -71.2092 },
  { name: "Waltham, MA", lat: 42.3765, lon: -71.2356 },
  { name: "Somerville, MA", lat: 42.3876, lon: -71.0995 },
  { name: "Worcester, MA", lat: 42.2626, lon: -71.8023 },
  { name: "Providence, RI", lat: 41.824, lon: -71.4128 },
  { name: "Salem, MA", lat: 42.5195, lon: -70.8967 },
  { name: "Lexington, MA", lat: 42.4473, lon: -71.2245 },
];

const EMAILJS_SERVICE_ID = "service_mkdqk0g";   // <- replace
const EMAILJS_TEMPLATE_ID = "template_wyz8yfs"; // <- replace
const EMAILJS_PUBLIC_KEY  = "fNpP1LualtWqCPNFV";   // <- replace
const EMAILJS_TEMPLATE_ID_AUTOREPLY = "template_ie3p2k4"; // <- your new template ID


// Use your Stripe publishable key (TEST key is fine while developing)
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);
// If you deploy to Netlify, set VITE_CHECKOUT_ENDPOINT="/.netlify/functions/create-checkout-session"
// If you deploy to Vercel, set VITE_CHECKOUT_ENDPOINT="/api/create-checkout-session"
const CHECKOUT_ENDPOINT = import.meta.env.VITE_CHECKOUT_ENDPOINT || "/api/create-checkout-session";


const VEHICLES = [
  {
    id: "sedan",
    name: "Executive Sedan",
    seats: 3,
    bags: 3,
    base: 45,
    perMile: 3.1,
    perMin: 0.7,
    description: "Perfect for solo travelers and couples.",
    perks: ["Leather seats", "Bottled water", "Quiet ride"],
  },
  {
    id: "suv",
    name: "Premium SUV",
    seats: 6,
    bags: 6,
    base: 65,
    perMile: 3.8,
    perMin: 0.9,
    description: "Spacious comfort for families and groups.",
    perks: ["Captain chairs", "All‑weather", "Phone chargers"],
  },
  {
    id: "sprinter",
    name: "Luxury Sprinter",
    seats: 12,
    bags: 12,
    base: 120,
    perMile: 5.2,
    perMin: 1.2,
    description: "Group travel with executive finishes.",
    perks: ["High roof", "Ambient lighting", "Media system"],
  },
];

const FAQS = [
  {
    q: "How far in advance should I book?",
    a: "We recommend booking 24–48 hours in advance. Same‑day service is often available — call us for priority scheduling.",
  },
  {
    q: "Do you track flights?",
    a: "Yes — our dispatch monitors arrivals in real time and adjusts pickup times accordingly (no extra fee for delays).",
  },
  {
    q: "Are child seats available?",
    a: "Yes. Select the option in the booking form. We offer infant, toddler, and booster seats.",
  },
  {
    q: "What’s your cancellation policy?",
    a: "Free cancellation up to 12 hours before pickup for sedans/SUVs and 24 hours for Sprinters.",
  },
];

const TESTIMONIALS = [
  {
    name: "Amira H.",
    text: "Immaculate vehicles and on‑time pickups. My go‑to for early‑morning BOS flights.",
    rating: 5,
  },
  {
    name: "Daniel S.",
    text: "Driver tracked my delayed flight and was already waiting. Seamless experience.",
    rating: 5,
  },
  {
    name: "Priya K.",
    text: "Booked a Sprinter for our team — comfortable and professional end‑to‑end.",
    rating: 5,
  },
];

// ---------------------------------------------------------
// Utilities: distance calc, currency, demand multiplier
// ---------------------------------------------------------
const toRad = (deg) => (deg * Math.PI) / 180;
function haversineMiles(a, b) {
  const R = 3958.8; // miles
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}
const fmt = (n) => `$${n.toFixed(2)}`;

function demandMultiplier(dateStr) {
  try {
    const d = new Date(dateStr);
    const hour = d.getHours();
    const isWeekend = [0, 6].includes(d.getDay());
    // Higher demand early morning and late evening, weekends
    let mult = 1;
    if (hour < 6 || hour >= 22) mult += 0.15;
    if (isWeekend) mult += 0.1;
    return mult;
  } catch (e) {
    return 1;
  }
}

// --- Geocoding & Routing (OpenStreetMap) ---------------------------------
async function geocodeUS(query) {
  try {
    if (!query) return null;

    // First try exact match to your built-in CITIES list (fast, offline)
    const byName = CITIES.find(
      (c) => c.name.toLowerCase().trim() === String(query).toLowerCase().trim()
    );
    if (byName) return { lat: byName.lat, lon: byName.lon, name: byName.name };

    // Fallback: Nominatim (no key). Keep requests gentle; we debounce later.
    const url =
      "https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=us&q=" +
      encodeURIComponent(query);
    const res = await fetch(url, { headers: { "Accept-Language": "en" } });
    if (!res.ok) return null;
    const [hit] = await res.json();
    if (!hit) return null;
    return { lat: parseFloat(hit.lat), lon: parseFloat(hit.lon), name: hit.display_name };
  } catch {
    return null;
  }
}

async function routeDriving(from, to) {
  try {
    if (!from || !to) return null;
    const url = `https://router.project-osrm.org/route/v1/driving/${from.lon},${from.lat};${to.lon},${to.lat}?overview=false&alternatives=false&steps=false`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    const [route] = data.routes || [];
    if (!route) return null;
    return {
      miles: route.distance / 1609.34, // meters → miles
      minutes: route.duration / 60,     // seconds → minutes
    };
  } catch {
    return null;
  }
}


// ---------------------------------------------------------
// Booking widget
// ---------------------------------------------------------
function BookingWidget({ presetVehicle, onQuote }) {
  const [step, setStep] = useState(1);
  const [tripMode, setTripMode] = useState("airport"); // airport | p2p
  const [direction, setDirection] = useState("to_airport"); // to_airport | from_airport
  const [airport, setAirport] = useState("BOS");
  const [cityFrom, setCityFrom] = useState("Boston, MA");
  const [cityTo, setCityTo] = useState("Cambridge, MA");
  const [dateTime, setDateTime] = useState(() => new Date(Date.now() + 36e5).toISOString().slice(0, 16));
  const [vehicle, setVehicle] = useState(presetVehicle || "suv");
  const [pax, setPax] = useState(2);
  const [stops, setStops] = useState(0);
  const [childSeats, setChildSeats] = useState(0);
  const [meetGreet, setMeetGreet] = useState(true);
  const [promo, setPromo] = useState("");

  // Live routing state for typed locations
const [route, setRoute] = useState({
  miles: null,
  minutes: null,
  loading: false,
  error: null,
});

{route.loading && (
  <div className="md:col-span-3 text-xs text-white/70">Recalculating using live routing…</div>
)}

  useEffect(() => {
    if (presetVehicle) setVehicle(presetVehicle);
  }, [presetVehicle]);

// Recompute driving route whenever origin/destination change
useEffect(() => {
  let cancelled = false;

  const run = async () => {
    setRoute((r) => ({ ...r, loading: true, error: null }));
    try {
      let from, to;

      if (tripMode === "airport") {
        const a = AIRPORTS.find((x) => x.code === airport);
        if (!a) throw new Error("airport-not-found");
        if (direction === "to_airport") {
          from = await geocodeUS(cityFrom || "");
          to = a;
        } else {
          from = a;
          to = await geocodeUS(cityTo || "");
        }
      } else {
        // point-to-point (both sides typeable in your UI)
        from = await geocodeUS(cityFrom || "");
        to = await geocodeUS(cityTo || "");
      }

      // Try OSRM driving distance first
      let r = await routeDriving(from, to);

      // Fallback: haversine estimate so the UI never breaks
      if (!r && from && to) {
        const factor = tripMode === "airport" ? 1.25 : 1.2; // rough road factor
        const miles = haversineMiles(from, to) * factor;
        r = { miles, minutes: Math.max(20, miles * 2) };
      }

      if (!cancelled) {
        if (r) setRoute({ ...r, loading: false, error: null });
        else setRoute({ miles: null, minutes: null, loading: false, error: "route-failed" });
      }
    } catch {
      if (!cancelled)
        setRoute({ miles: null, minutes: null, loading: false, error: "route-failed" });
    }
  };

  const t = setTimeout(run, 350); // debounce while typing
  return () => {
    cancelled = true;
    clearTimeout(t);
  };
}, [tripMode, direction, airport, cityFrom, cityTo]);


  const quote = useMemo(() => {
    const veh = VEHICLES.find((v) => v.id === vehicle) || VEHICLES[1];
    const mult = demandMultiplier(dateTime);

    // Prefer live routed values if available
let miles = route.miles;
let minutes = route.minutes;

// Fallbacks if routing/geocoding failed
if (miles == null || minutes == null) {
  if (tripMode === "airport") {
    const a = AIRPORTS.find((x) => x.code === airport);
    const name = direction === "to_airport" ? cityFrom : cityTo;
    const c = CITIES.find((x) => x.name === name);
    if (a && c) {
      miles = haversineMiles(a, c) * 1.25;
      minutes = Math.max(20, miles * 2);
    }
  } else {
    const c1 = CITIES.find((x) => x.name === cityFrom);
    const c2 = CITIES.find((x) => x.name === cityTo);
    if (c1 && c2) {
      miles = haversineMiles(c1, c2) * 1.2;
      minutes = Math.max(20, miles * 2);
    }
  }
}
if (miles == null) miles = 10;                 // last-resort
if (minutes == null) minutes = Math.max(20, miles * 2);

    // Pricing
    let total = veh.base + veh.perMile * miles + veh.perMin * minutes;
    total += 7; // airport fee
    total += 8; // tolls estimate
    total += stops * 15;
    total += childSeats * 10;
    if (meetGreet) total += 15;

    total *= mult;

    // Promo codes
    if (promo.trim().toUpperCase() === "WELCOME10") total *= 0.9;

    return {
      miles: Math.round(miles * 10) / 10,
      minutes: Math.round(minutes),
      vehicle: veh.name,
      total: Math.max(veh.base, total),
      mult,
    };
  }, [tripMode, direction, airport, cityFrom, cityTo, dateTime, vehicle, pax, stops, childSeats, meetGreet, promo]);

  function next() {
    setStep((s) => Math.min(3, s + 1));
  }
  function prev() {
    setStep((s) => Math.max(1, s - 1));
  }

  return (
    <div id="book" className="relative rounded-3xl bg-white/5 backdrop-blur-md ring-1 ring-white/10 p-5 sm:p-6 lg:p-8">
      <div className="absolute inset-0 rounded-3xl pointer-events-none border border-white/10" />
      <div className="flex items-center gap-2 mb-4">
        <Car className="w-5 h-5" />
        <h3 className="text-xl font-semibold">Instant Quote & Booking</h3>
      </div>

      {/* Steps */}
      <div className="mb-6 flex items-center gap-2 text-sm">
        {[1, 2, 3].map((s) => (
          <div key={s} className={`flex-1 h-1 rounded ${s <= step ? "bg-blue-500" : "bg-white/20"}`} />
        ))}
      </div>

      {/* Step content */}
      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div key="s1" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm text-white/80">Trip Type</label>
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => setTripMode("airport")} className={`px-3 py-2 rounded-xl border ${tripMode === "airport" ? "border-blue-500 bg-blue-500/10" : "border-white/10"}`}>Airport</button>
                <button onClick={() => setTripMode("p2p")} className={`px-3 py-2 rounded-xl border ${tripMode === "p2p" ? "border-blue-500 bg-blue-500/10" : "border-white/10"}`}>Point‑to‑Point</button>
              </div>
            </div>

            {tripMode === "airport" ? (
              <div className="space-y-2">
                <label className="block text-sm text-white/80">Direction</label>
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => setDirection("to_airport")} className={`px-3 py-2 rounded-xl border ${direction === "to_airport" ? "border-blue-500 bg-blue-500/10" : "border-white/10"}`}>To Airport</button>
                  <button onClick={() => setDirection("from_airport")} className={`px-3 py-2 rounded-xl border ${direction === "from_airport" ? "border-blue-500 bg-blue-500/10" : "border-white/10"}`}>From Airport</button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <label className="block text-sm text-white/80">Passengers</label>
                <input aria-label="Passengers" type="number" min={1} max={12} value={pax} onChange={(e) => setPax(Number(e.target.value))} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            )}

            {tripMode === "airport" ? (
              <>
                <div className="space-y-2">
                  <label className="block text-sm text-white/80">Airport</label>
                  <select aria-label="Airport" value={airport} onChange={(e) => setAirport(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2">
                    {AIRPORTS.map((a) => (
                      <option key={a.code} value={a.code}>{a.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
  <label className="block text-sm text-white/80">
    {direction === "to_airport" ? "Pickup (City / Address) (eg. 123 Elm Street, Springfield, IL 02432)" : "Drop-off (City / Address) (eg. 123 Elm Street, Springfield, IL 02432)"}
  </label>
  <input
    aria-label="City or address"
    list="cities-list"                   // keeps your suggestions
    placeholder="Type a city or exact address"
    value={direction === "to_airport" ? cityFrom : cityTo}
    onChange={(e) =>
      direction === "to_airport" ? setCityFrom(e.target.value) : setCityTo(e.target.value)
    }
    className="input"
  />
</div>
              </>
            ) : (
              <>
                <div className="space-y-2">
  <label className="block text-sm text-white/80">Pickup City / Address (eg. 123 Elm Street, Springfield, IL 02432)</label>
  <input
    aria-label="Pickup city or address"
    list="cities-list"
    placeholder="Type a city or exact address"
    value={cityFrom}
    onChange={(e) => setCityFrom(e.target.value)}
    className="input"
  />
</div>
               <div className="space-y-2">
  <label className="block text-sm text-white/80">Drop-off City / Address (eg. 123 Elm Street, Springfield, IL 02432)</label>
  <input
    aria-label="Drop-off city or address"
    list="cities-list"
    placeholder="Type a city or exact address"
    value={cityTo}
    onChange={(e) => setCityTo(e.target.value)}
    className="input"
  />
</div>
              </>
            )}

            <div className="space-y-2">
              <label className="block text-sm text-white/80">Date & Time</label>
              <div className="relative">
                <input aria-label="Date and time" type="datetime-local" value={dateTime} onChange={(e) => setDateTime(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 pr-10" />
                <Calendar className="absolute right-3 top-2.5 w-4 h-4 text-white/60" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm text-white/80">Vehicle</label>
              <select aria-label="Vehicle" value={vehicle} onChange={(e) => setVehicle(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2">
                {VEHICLES.map((v) => (
                  <option key={v.id} value={v.id}>{v.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm text-white/80">Options</label>
              <div className="grid sm:grid-cols-3 gap-2">
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={meetGreet} onChange={(e) => setMeetGreet(e.target.checked)} />
                  Meet & Greet
                </label>
                <label className="flex items-center gap-2 text-sm">
  <span>Child seats</span>
  <input
    aria-label="Child seats"
    type="tel"
    inputMode="numeric"
    pattern="[0-9]*"
    value={String(childSeats)}
    onChange={(e) => {
      const raw = e.target.value.replace(/\D/g, "");
      const n = Math.max(0, Math.min(4, raw === "" ? 0 : parseInt(raw, 10)));
      setChildSeats(n);
    }}
    className="w-16 bg-white/5 border border-white/10 rounded px-2 py-1"
  />
</label>
                <label className="flex items-center gap-2 text-sm">
  <span>Extra stops (leave note)</span>
  <input
    aria-label="Stops"
    type="tel"
    inputMode="numeric"
    pattern="[0-9]*"
    value={String(stops)}
    onChange={(e) => {
      const raw = e.target.value.replace(/\D/g, "");
      const n = Math.max(0, Math.min(4, raw === "" ? 0 : parseInt(raw, 10)));
      setStops(n);
    }}
    className="w-16 bg-white/5 border border-white/10 rounded px-2 py-1"
  />
</label>
              </div>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div key="s2" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="grid md:grid-cols-3 gap-4">
            <StatCard icon={<Navigation className="w-4 h-4" />} label="Estimated Distance" value={`${quote.miles} mi`} />
            <StatCard icon={<Clock className="w-4 h-4" />} label="Estimated Duration" value={`${quote.minutes} min`} />
            <StatCard icon={<CreditCard className="w-4 h-4" />} label="Quote (before tip)" value={fmt(quote.total)} />

            <div className="md:col-span-3 rounded-2xl border border-white/10 p-4 bg-white/5">
              <div className="flex flex-wrap items-center gap-3 text-sm">
                <div className="px-2 py-1 rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/20">Vehicle: {quote.vehicle}</div>
                <div className="px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">Demand Multiplier: {quote.mult.toFixed(2)}×</div>
                <div className="px-2 py-1 rounded-full bg-white/5 text-white/80 border border-white/10">Includes tolls & airport fees</div>
              </div>
            </div>

            <div className="md:col-span-3 grid sm:grid-cols-2 gap-3">
              <div className="relative">
                <input aria-label="Promo code" placeholder="Promo code (e.g., WELCOME10)" value={promo} onChange={(e) => setPromo(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2" />
                <Info className="absolute right-3 top-2.5 w-4 h-4 text-white/60" />
              </div>
              <div className="text-xs text-white/70">
                This is an instant estimate. Final price may vary with exact route, traffic, or special requests.
              </div>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div key="s3" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="grid sm:grid-cols-2 gap-4">
            <Field label="Full Name"><input aria-label="Full name" className="input" placeholder="Your name" /></Field>
            <Field label="Email"><input aria-label="Email" className="input" placeholder="name@example.com" type="email" /></Field>
            <Field label="Phone"><input aria-label="Phone" className="input" placeholder="(###) ###‑####" /></Field>
            <Field label="Flight # (optional)"><input aria-label="Flight number" className="input" placeholder="e.g., AA123" /></Field>
            <Field label="Notes"><textarea aria-label="Notes" className="input h-24" placeholder="Door #, baggage, accessibility, etc." /></Field>
            <div>
              <div className="text-xs text-white/70">By booking, you agree to our terms, privacy, and cancellation policy.</div>
              <div className="mt-3 flex flex-wrap gap-2 text-xs">
                <span className="badge">Secure • Stripe placeholder</span>
                <span className="badge">Flight tracking</span>
                <span className="badge">24/7 Dispatch</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-6 flex items-center justify-between gap-3">
        <div className="text-white/70 text-sm flex items-center gap-2">
          <ShieldCheck className="w-4 h-4" /> PCI‑ready payment gateway placeholder
        </div>
        <div className="flex gap-2">
          {step > 1 && (
            <button onClick={prev} className="btn-secondary">Back</button>
          )}
          {step < 3 ? (
            <button onClick={next} className="btn-primary">Next</button>
          ) : (
            <button
              onClick={() =>
                onQuote({
                  ...quote,
                  tripMode,
                  direction,
                  airport,
                  cityFrom,
                  cityTo,
                  dateTime,
                  vehicle,
                  pax,
                  childSeats,
                  stops,
                  meetGreet,
                  promo,
                })
              }
              className="btn-primary"
            >
              Confirm & Reserve
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

<datalist id="cities-list">
  {CITIES.map((c) => (
    <option key={c.name} value={c.name} />
  ))}
</datalist>

function Field({ label, children }) {
  return (
    <label className="block text-sm text-white/80">
      <span className="mb-1 block">{label}</span>
      {children}
    </label>
  );
}

function StatCard({ icon, label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 p-4 bg-white/5">
      <div className="text-white/70 text-xs mb-1 flex items-center gap-2">{icon} {label}</div>
      <div className="text-xl font-semibold">{value}</div>
    </div>
  );
}

// ---------------------------------------------------------
// Sections
// ---------------------------------------------------------
function Navbar({ onOpenMenu }) {
  return (
    <div className="fixed top-0 inset-x-0 z-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mt-4 flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl px-4 py-3">
          <a href="#home" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-400 to-emerald-400 grid place-items-center"><Plane className="w-4 h-4 text-slate-900" /></div>
            <span className="font-semibold tracking-wide">Monas Airport Livery</span>
          </a>
          <div className="hidden md:flex items-center gap-6 text-sm">
            {[
              ["Fleet", "#fleet"],
              ["Services", "#services"],
              ["Rates", "#rates"],
              ["Reviews", "#reviews"],
              ["FAQ", "#faq"],
              ["Contact", "#contact"],
            ].map(([label, href]) => (
              <a key={label} href={href} className="hover:text-white/90 text-white/80">{label}</a>
            ))}
            <a href="#book" className="btn-primary inline-flex items-center gap-2"><Calendar className="w-4 h-4" /> Book Now</a>
          </div>
          <button onClick={onOpenMenu} className="md:hidden p-2 rounded-lg hover:bg-white/10" aria-label="Open menu"><Menu className="w-5 h-5" /></button>
        </div>
      </div>
    </div>
  );
}

function Hero() {
  return (
    <section id="home" className="relative pt-28">
      <AnimatedStars />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-10 items-center">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 text-xs px-3 py-1 rounded-full border border-emerald-400/40 bg-emerald-400/10 text-emerald-300">
              <ShieldCheck className="w-3.5 h-3.5" /> Licensed • Insured • 24/7
            </div>
            <h1 className="mt-4 text-4xl sm:text-5xl font-bold leading-tight">
              Black‑Car Luxury, Airport Precision.
            </h1>
            <p className="mt-4 text-white/80 max-w-xl">
              Reliable airport transfers, point‑to‑point rides, and hourly charters across Greater Boston & New England.
              Flight tracking, meet‑and‑greet, and pro chauffeurs come standard.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a href="#book" className="btn-primary inline-flex items-center gap-2"><Calendar className="w-4 h-4" /> Get Instant Quote</a>
              <a href="#fleet" className="btn-secondary inline-flex items-center gap-2"><Car className="w-4 h-4" /> View Fleet</a>
            </div>
            <div className="mt-6 flex items-center gap-6 text-sm text-white/70">
              <div className="flex items-center gap-2"><Star className="w-4 h-4 text-yellow-300" /> 5.0 rating</div>
              <div className="flex items-center gap-2"><Clock className="w-4 h-4" /> On‑time guarantee</div>
              <div className="flex items-center gap-2"><Languages className="w-4 h-4" /> English • Arabic</div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6 }}>
            <div className="relative rounded-3xl border border-white/10 bg-white/5 p-4 sm:p-5 lg:p-6 backdrop-blur-xl">
              <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-gradient-to-tr from-blue-500/40 to-emerald-400/40 blur-2xl" />
              <BookingPreviewCard />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function BookingPreviewCard() {
  return (
    <div className="grid grid-cols-3 gap-3 text-sm">
      <div className="col-span-3 rounded-2xl bg-black/20 p-3 border border-white/10">
        <div className="flex items-center gap-2 text-white/80"><Plane className="w-4 h-4" /> Sample Airport Transfer</div>
        <div className="mt-2 grid grid-cols-2 gap-3 text-xs">
          <div className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5" /> Boston → BOS</div>
          <div className="flex items-center gap-2"><Users className="w-3.5 h-3.5" /> 2 passengers</div>
          <div className="flex items-center gap-2"><Car className="w-3.5 h-3.5" /> Premium SUV</div>
          <div className="flex items-center gap-2"><Clock className="w-3.5 h-3.5" /> ~25 min</div>
        </div>
      </div>
      <div className="col-span-3 rounded-2xl bg-black/20 p-3 border border-white/10">
        <div className="text-xs text-white/70">Estimate</div>
        <div className="text-2xl font-semibold">$92.40</div>
        <div className="text-xs text-white/60">Includes tolls • Meet & Greet</div>
      </div>
      <a href="#book" className="col-span-3 btn-primary text-center">Customize Your Trip</a>
    </div>
  );
}

function Fleet({ onSelect }) {
  return (
    <section id="fleet" className="section">
      <Header icon={<Car className="w-5 h-5" />} title="Our Fleet" subtitle="Curated for comfort, safety, and style." />
      <div className="grid md:grid-cols-3 gap-5">
        {VEHICLES.map((v) => (
          <motion.div key={v.id} whileHover={{ y: -4 }} className="rounded-3xl border border-white/10 bg-white/5 p-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-lg">{v.name}</div>
                <div className="text-white/70 text-sm">Up to {v.seats} riders • {v.bags} bags</div>
              </div>
              <div className="px-3 py-1 rounded-full text-xs bg-emerald-400/10 border border-emerald-400/20 text-emerald-300">From {fmt(v.base)}</div>
            </div>
            <p className="mt-3 text-sm text-white/80">{v.description}</p>
            <ul className="mt-3 grid gap-1 text-sm text-white/80 list-disc list-inside">
              {v.perks.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
            <div className="mt-4 flex gap-2">
              <button onClick={() => onSelect(v.id)} className="btn-primary">Select</button>
              <a href="#rates" className="btn-secondary">View rates</a>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function Services() {
  const items = [
    { icon: <Plane className="w-5 h-5" />, title: "Airport Transfers", desc: "Door‑to‑terminal with flight tracking & curbside or meet‑and‑greet." },
    { icon: <Navigation className="w-5 h-5" />, title: "Point‑to‑Point", desc: "Anywhere across Greater Boston & New England — flat, transparent pricing." },
    { icon: <Clock className="w-5 h-5" />, title: "Hourly Charters", desc: "By the hour for meetings, events, or nights out." },
    { icon: <ShieldCheck className="w-5 h-5" />, title: "Corporate", desc: "Centralized billing, PO support, and priority service level agreements." },
  ];
  return (
    <section id="services" className="section">
      <Header icon={<ShieldCheck className="w-5 h-5" />} title="Services" subtitle="Professional chauffeurs • Luxury vehicles • Transparent pricing" />
      <div className="grid md:grid-cols-4 gap-5">
        {items.map((it) => (
          <div key={it.title} className="rounded-3xl border border-white/10 bg-white/5 p-5">
            <div className="flex items-center gap-2"><div className="icon-pill">{it.icon}</div><div className="font-semibold">{it.title}</div></div>
            <p className="mt-2 text-sm text-white/80">{it.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function Rates() {
  return (
    <section id="rates" className="section">
      <Header icon={<CreditCard className="w-5 h-5" />} title="Rates & Policies" subtitle="Simple, fair, and all‑inclusive estimates." />
      <div className="overflow-x-auto rounded-2xl border border-white/10 bg-white/5">
        <table className="min-w-full text-sm">
          <thead className="text-left text-white/80">
            <tr>
              <th className="px-4 py-3">Vehicle</th>
              <th className="px-4 py-3">Base</th>
              <th className="px-4 py-3">Per Mile</th>
              <th className="px-4 py-3">Per Minute</th>
              <th className="px-4 py-3">Typical BOS→Boston</th>
            </tr>
          </thead>
          <tbody>
            {VEHICLES.map((v) => (
              <tr key={v.id} className="odd:bg-white/0 even:bg-white/[0.03]">
                <td className="px-4 py-3 font-medium">{v.name}</td>
                <td className="px-4 py-3">{fmt(v.base)}</td>
                <td className="px-4 py-3">{fmt(v.perMile)}</td>
                <td className="px-4 py-3">{fmt(v.perMin)}</td>
                <td className="px-4 py-3">{v.id === "sedan" ? "$75‑95" : v.id === "suv" ? "$90‑115" : "$160‑190"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-xs text-white/70">* Final price depends on route, traffic, and options like child seats or meet‑and‑greet.</p>
    </section>
  );
}

function Reviews() {
  return (
    <section id="reviews" className="section">
      <Header icon={<Star className="w-5 h-5 text-yellow-300" />} title="What Riders Say" subtitle="Consistently five stars across platforms." />
      <div className="grid md:grid-cols-3 gap-5">
        {TESTIMONIALS.map((t, i) => (
          <motion.div key={t.name} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }} className="rounded-3xl border border-white/10 bg-white/5 p-5">
            <div className="flex items-center gap-2 mb-2">
              {Array.from({ length: t.rating }).map((_, idx) => (
                <Star key={idx} className="w-4 h-4 text-yellow-300" />
              ))}
            </div>
            <p className="text-sm text-white/90">“{t.text}”</p>
            <div className="mt-3 text-sm text-white/70">— {t.name}</div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function FAQ() {
  const [open, setOpen] = useState(0);
  return (
    <section id="faq" className="section">
      <Header icon={<Info className="w-5 h-5" />} title="FAQ" subtitle="Answers to common questions." />
      <div className="grid md:grid-cols-2 gap-4">
        {FAQS.map((f, idx) => (
          <div key={f.q} className="rounded-2xl border border-white/10 bg-white/5">
            <button onClick={() => setOpen(open === idx ? -1 : idx)} className="w-full flex items-center justify-between px-4 py-3 text-left">
              <div className="font-medium">{f.q}</div>
              <ChevronDown className={`w-4 h-4 transition-transform ${open === idx ? "rotate-180" : ""}`} />
            </button>
            <AnimatePresence>{open === idx && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="px-4 pb-4 text-sm text-white/80">
                {f.a}
              </motion.div>
            )}</AnimatePresence>
          </div>
        ))}
      </div>
    </section>
  );
}

function Contact() {
  // state for the form + UI status
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState("idle"); // idle | sending | sent | error

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  // ⬇️ THIS is the function you asked about — place it here, inside Contact(), above return()
  async function sendEmail(e) {
    e.preventDefault();
    setStatus("sending");
    try {
      // 1) Send the visitor's message to YOUR inbox
      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        {
          from_name: form.name,
          reply_to: form.email,
          message: form.message,
          subject: "Website quick message",
        },
        { publicKey: EMAILJS_PUBLIC_KEY }
      );

      // 2) After success, send the auto-reply to THEM
      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID_AUTOREPLY,
        {
          to_email: form.email,           // must match {{to_email}} in your auto-reply template
          to_name: form.name,             // used in subject/body
          original_message: form.message, // used in body
        },
        { publicKey: EMAILJS_PUBLIC_KEY }
      );

      setStatus("sent");
      setForm({ name: "", email: "", message: "" });
    } catch (err) {
      console.error(err);
      setStatus("error");
    }
  }

  // your UI
  return (
  <section id="contact" className="section">
    <div className="grid md:grid-cols-3 gap-5">
      {/* LEFT: contact info card */}
      <div className="rounded-3xl border border-white/10 bg-white/5 p-5 space-y-4">
        <div className="text-base font-semibold text-white">Contact us</div>

        <div className="space-y-2">
          <div className="text-sm text-white/70">Call or text dispatch</div>
          <a
            href="tel:+16173193204"
            className="btn-primary inline-flex items-center gap-2 w-full justify-center"
          >
            <Phone className="w-4 h-4" /> (617) 319-3204
          </a>
        </div>

        <div className="space-y-2">
          <div className="text-sm text-white/70">Email</div>
          <a
            href="mailto:monasairportlivery@gmail.com"
            className="btn-secondary inline-flex items-center gap-2 w-full justify-center"
          >
            <Mail className="w-4 h-4" /> monasairportlivery@gmail.com
          </a>
        </div>

        <div className="flex items-center gap-2 text-sm text-white/70">
          <Clock className="w-4 h-4" /> 24/7 Service
        </div>
        <div className="flex items-center gap-2 text-sm text-white/70">
          <MapPin className="w-4 h-4" /> Greater Boston & New England
        </div>
      </div>

      {/* RIGHT: quick message form (unchanged, just moved into the grid) */}
      <div className="md:col-span-2 rounded-3xl border border-white/10 bg-white/5 p-5">
        <div className="text-sm text-white/80 mb-2">Quick message</div>

        <form onSubmit={sendEmail} className="grid sm:grid-cols-2 gap-3">
          <input
            name="name"
            type="text"
            placeholder="Name"
            className="input"
            value={form.name}
            onChange={onChange}
            required
          />
          <input
            name="email"
            type="email"
            placeholder="Email"
            className="input"
            value={form.email}
            onChange={onChange}
            required
          />
          <textarea
            name="message"
            placeholder="How can we help?"
            className="input sm:col-span-2 h-28"
            value={form.message}
            onChange={onChange}
            required
          />
          <input type="text" name="_gotcha" className="hidden" tabIndex={-1} autoComplete="off" />
          <button type="submit" disabled={status === "sending"} className="btn-primary sm:col-span-2">
            {status === "sending" ? "Sending…" : "Send Message"}
          </button>

          {status === "sent" && (
            <p className="sm:col-span-2 text-green-400 text-sm">Thanks! We received your message.</p>
          )}
          {status === "error" && (
            <p className="sm:col-span-2 text-red-400 text-sm">Something went wrong. Please try again.</p>
          )}
        </form>
      </div>
    </div>
  </section>
);
}

function Footer() {
  return (
    <footer className="mt-16 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-sm text-white/70">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>© {new Date().getFullYear()} Monas Airport Livery. All rights reserved.</div>
          <div className="flex items-center gap-4">
            <a href="#" className="hover:text-white">Terms</a>
            <a href="#" className="hover:text-white">Privacy</a>
            <a href="#" className="hover:text-white">Accessibility</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

function Header({ icon, title, subtitle }) {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 text-white/80 text-sm">{icon}<span className="uppercase tracking-wide">{title}</span></div>
      <h2 className="text-2xl sm:text-3xl font-semibold mt-1">{subtitle}</h2>
    </div>
  );
}

function AnimatedStars() {
  const [dots] = useState(() => Array.from({ length: 160 }, () => ({
    top: Math.random() * 100,
    left: Math.random() * 100,
    size: Math.random() * 2 + 0.5,
    delay: Math.random() * 6,
  })));
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {dots.map((d, i) => (
        <motion.span
          key={i}
          className="absolute rounded-full bg-white/60"
          style={{ top: `${d.top}%`, left: `${d.left}%`, width: d.size, height: d.size }}
          animate={{ opacity: [0.2, 0.9, 0.2] }}
          transition={{ duration: 4 + d.delay, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
      <div className="absolute inset-0 bg-[radial-gradient(70%_50%_at_70%_10%,rgba(40,150,255,0.12),transparent),radial-gradient(50%_40%_at_20%_10%,rgba(16,185,129,0.12),transparent)]" />
    </div>
  );
}

// ---------------------------------------------------------
// Main App
// ---------------------------------------------------------
export default function MonasAirportLiveryTemplate() {
  const [presetVehicle, setPresetVehicle] = useState(null);
  const [quoteModal, setQuoteModal] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  function handleQuote(details) {
    setQuoteModal(details);
  }

  return (
    <div
    className="min-h-screen text-slate-100 relative"
    style={{
      // Base + weaker bottom fade (solid color stops prevent banding)
      backgroundColor: '#0b0f17',
      backgroundImage:
        'linear-gradient(180deg,#0b0f17 0%,#0b0f17 62%,#0c111a 82%,#0e141f 100%),radial-gradient(60% 70% at 20% 0%, rgba(59,130,246,0.18), transparent),radial-gradient(40% 60% at 80% 10%, rgba(16,185,129,0.18), transparent)',
      backgroundBlendMode: 'normal,normal,normal',
      backgroundRepeat: 'no-repeat',
    }}
  >
    {/* noise overlay to dither the gradient — keep as the first child */}
    <div
      aria-hidden
      className="fixed inset-0 -z-10 pointer-events-none"
      style={{
        backgroundImage:
          'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'160\' height=\'160\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.8\' numOctaves=\'2\' seed=\'3\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")',
        backgroundSize: '160px 160px',
        mixBlendMode: 'soft-light',
        opacity: 0.02, // tweak 0.015–0.03 if needed
      }}
    />
    <AnimatedStars />
      <Navbar onOpenMenu={() => setMenuOpen(true)} />
      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />

      <main className="pt-20">
        <Hero />
        <section className="section -mt-4 relative z-10">
          <BookingWidget presetVehicle={presetVehicle} onQuote={handleQuote} />
        </section>
        <Fleet onSelect={(id) => { setPresetVehicle(id); window.location.hash = "#book"; }} />
        <Services />
        <Rates />
        <Reviews />
        <FAQ />
        <Contact />
      </main>

      <Footer />
      <FloatingCallButton />

      <AnimatePresence>
        {quoteModal && (
          <QuoteModal data={quoteModal} onClose={() => setQuoteModal(null)} />)
        }
      </AnimatePresence>

      {/* Global styles for convenience */}
      <style>{`
        .section{padding:3.5rem 1rem;max-width:72rem;margin:0 auto}
        .btn-primary{background:linear-gradient(90deg,#3b82f6,#10b981);border:1px solid rgba(255,255,255,0.15);color:#0b0f17;padding:.6rem 1rem;border-radius:1rem;font-weight:600}
        .btn-secondary{background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.15);color:white;padding:.6rem 1rem;border-radius:1rem}
        .input{background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.15);border-radius:0.8rem;padding:.55rem .75rem;width:100%}
        .badge{border:1px solid rgba(255,255,255,.18);background:rgba(255,255,255,.06);padding:.2rem .5rem;border-radius:.6rem}
        .icon-pill{width:2.2rem;height:2.2rem;border-radius:.8rem;background:rgba(255,255,255,.08);display:grid;place-items:center;border:1px solid rgba(255,255,255,.12)}
        @media(min-width:640px){.section{padding:4rem 1.5rem}}
        select, input, textarea { color-scheme: dark; }
        /* Fallback for browsers that ignore color-scheme on the popup menu */
        select option {
        background-color: #0f1115;   /* dark menu background */
        color: #e5e7eb;              /* light text so it’s readable */
        }
        select option:checked {
        background-color: #1f2937;   /* highlight selected row */
        color: #ffffff;
        }
        /* Smooth scroll for in-page anchors */
        html { scroll-behavior: smooth; }
        /* Keep sections from hiding under the fixed navbar */
        :root { --nav-offset: 5.5rem; }        /* tweak if your nav height differs */
        [id] { scroll-margin-top: var(--nav-offset); }

        
      `}</style>
      
    </div>
  );
}

function MobileMenu({ open, onClose }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/60">
          <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -10, opacity: 0 }} className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mt-24 rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-center justify-between">
                <div className="font-semibold">Menu</div>
                <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/10" aria-label="Close menu"><X className="w-5 h-5" /></button>
              </div>
              <nav className="mt-3 grid gap-2 text-sm">
                {["#fleet","#services","#rates","#reviews","#faq","#contact","#book"].map((href) => (
                  <a key={href} href={href} onClick={onClose} className="rounded-xl px-3 py-2 hover:bg-white/10 border border-white/10">{href.replace('#','')}</a>
                ))}
              </nav>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function FloatingCallButton(){
  return (
    <a href="tel:+16173193204" className="fixed right-4 bottom-4 z-40 inline-flex items-center gap-2 px-4 py-2 rounded-full border border-emerald-400/30 bg-emerald-400/20 backdrop-blur-md text-emerald-200 hover:bg-emerald-400/30">
      <Phone className="w-4 h-4"/> Call Now
    </a>
  );
}

function QuoteModal({ data, onClose }) {
  const [paying, setPaying] = useState(false);

  async function startCheckout() {
    try {
      setPaying(true);

      // Build payload for your serverless endpoint
      const payload = {
        amountCents: Math.round(data.total * 100),
        currency: "usd",
        booking: {
          whenISO: new Date(data.dateTime).toISOString(),
          tripType:
            data.tripMode === "airport"
              ? `Airport (${data.direction.replace("_", " ")})`
              : "Point-to-Point",
          from:
            data.tripMode === "airport"
              ? (data.direction === "from_airport" ? data.airport : data.cityFrom)
              : data.cityFrom,
          to:
            data.tripMode === "airport"
              ? (data.direction === "to_airport" ? data.airport : data.cityTo)
              : data.cityTo,
          vehicle: VEHICLES.find((v) => v.id === data.vehicle)?.name || "—",
          passengers: data.pax,
          distance_mi: data.miles,
          duration_min: data.minutes,
          options: {
            meetGreet: !!data.meetGreet,
            childSeats: data.childSeats || 0,
            stops: data.stops || 0,
            promo: data.promo || "",
          },
        },
      };

      const res = await fetch(CHECKOUT_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const out = await res.json();

      // Preferred: server returns a hosted Checkout URL
      if (out.url) {
        window.location.href = out.url;
        return;
      }

      // Fallback: use sessionId redirect
      if (out.id) {
        const stripe = await stripePromise;
        const { error } = await stripe.redirectToCheckout({ sessionId: out.id });
        if (error) throw error;
        return;
      }

      throw new Error(out.error || "Unable to start checkout");
    } catch (err) {
      console.error("Checkout error:", err);
      alert("Checkout failed. Please try again.");
    } finally {
      setPaying(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/60 grid place-items-center p-4"
    >
      <motion.div
        initial={{ scale: 0.96, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.98, opacity: 0 }}
        className="w-full max-w-2xl rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-5"
      >
        <div className="flex items-center justify-between">
          <div className="font-semibold">Reservation Summary</div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/10" aria-label="Close">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 mt-4 text-sm">
          <SummaryRow label="Trip Type" value={data.tripMode === "airport" ? `Airport (${data.direction.replace("_"," ")})` : "Point-to-Point"} />
          <SummaryRow label="When" value={new Date(data.dateTime).toLocaleString()} />
          <SummaryRow label="From" value={data.tripMode === "airport" ? (data.direction === "from_airport" ? data.airport : data.cityFrom) : data.cityFrom} />
          <SummaryRow label="To" value={data.tripMode === "airport" ? (data.direction === "to_airport" ? data.airport : data.cityTo) : data.cityTo} />
          <SummaryRow label="Vehicle" value={VEHICLES.find((v) => v.id === data.vehicle)?.name || "—"} />
          <SummaryRow label="Passengers" value={data.pax} />
          <SummaryRow label="Distance" value={`${data.miles} mi`} />
          <SummaryRow label="Duration" value={`${data.minutes} min`} />
          <SummaryRow label="Options" value={`${data.meetGreet ? "Meet & Greet, " : ""}${data.childSeats ? `${data.childSeats} child seat(s), ` : ""}${data.stops ? `${data.stops} stop(s), ` : ""}${data.promo ? `Promo: ${data.promo}` : "None"}`} />
        </div>

        <div className="mt-5 flex items-center justify-between">
          <div className="text-sm text-white/80 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4" /> Secure checkout (Stripe)
          </div>
          <div className="text-right">
            <div className="text-xs text-white/70">Quote (before tip)</div>
            <div className="text-2xl font-semibold">{fmt(data.total)}</div>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <button onClick={() => window.print()} className="btn-secondary">Print</button>
          <button onClick={startCheckout} disabled={paying} className="btn-primary inline-flex items-center gap-2">
            <CreditCard className="w-4 h-4" />
            {paying ? "Processing…" : "Proceed to Payment"}
          </button>
          <button onClick={onClose} className="btn-secondary">Close</button>
        </div>

        <p className="mt-3 text-xs text-white/70">
          Payment, CRM, and flight-status integrations are placeholders ready to be wired to your preferred providers.
        </p>
      </motion.div>
    </motion.div>
  );
}

function SummaryRow({label, value}){
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-3 flex items-center justify-between">
      <div className="text-white/70">{label}</div>
      <div className="font-medium">{value}</div>
    </div>
  );
}

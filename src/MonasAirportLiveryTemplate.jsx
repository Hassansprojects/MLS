import emailjs from "@emailjs/browser";
import React, { useMemo, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { loadStripe } from "@stripe/stripe-js";
import { Link } from "react-router-dom";



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




// Google Maps loader (frontend)
import { Loader as GoogleLoader } from "@googlemaps/js-api-loader";


const GMAPS_BROWSER_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;


function useGoogleLoaded() {
const [ok, setOk] = React.useState(!!(window.google && window.google.maps));
React.useEffect(() => {
if (ok) return;
if (!GMAPS_BROWSER_KEY) return; // silently allow fallback to OSM
const loader = new GoogleLoader({ apiKey: GMAPS_BROWSER_KEY, libraries: ["places"] });
loader
.load()
.then(() => setOk(true))
.catch(() => setOk(false));
}, [ok]);
return ok;
}


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
// Only this vehicle is active for now
const ACTIVE_VEHICLE_ID = "suv"; // Premium SUV



const VEHICLES = [
  {
    id: "sedan",
    name: "Executive Sedan (Soon!)",
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
    name: "Luxury Sprinter (Soon!)",
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

// --- Geocoding (single best hit)
async function geocodeUS(query) {
  try {
    if (!query) return null;

    const byName = CITIES.find(
      (c) => c.name.toLowerCase().trim() === String(query).toLowerCase().trim()
    );
    if (byName) return { lat: byName.lat, lon: byName.lon, name: byName.name };

    // ✅ call the single-result endpoint
    const res = await fetch(`/api/osm-geocode?q=${encodeURIComponent(query.trim())}`);
    if (!res.ok) return null;
    const hit = await res.json(); // object
    if (!hit) return null;
    return { lat: +hit.lat, lon: +hit.lon, name: hit.name || hit.display_name };
  } catch {
    return null;
  }
}

// --- Autocomplete (list)
async function suggestUS(query) {
  if (!query || query.trim().length < 3) return [];
  try {
    // ✅ call the list endpoint
    const res = await fetch(`/api/osm-search?q=${encodeURIComponent(query.trim())}`);
    if (!res.ok) return [];
    const data = await res.json(); // array
    return (Array.isArray(data) ? data : []).map((hit) => ({
      label: hit.label || hit.display_name,
      lat: +hit.lat,
      lon: +hit.lon,
      type: hit.type,
    }));
  } catch {
    return [];
  }
}

// Google Directions via our serverless proxy
async function routeDrivingGoogle(from, to) {
  const res = await fetch("/api/directions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      origin: { lat: from.lat, lon: from.lon },
      destination: { lat: to.lat, lon: to.lon },
    }),
  });
  const j = await res.json();
  if (!res.ok) throw new Error(j.error || "directions-failed");
  return j; // { meters, seconds, miles, minutes }
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




// Smooth-scroll to a section id (works with sticky headers) ------------------------------
function scrollToId(id, offset = 80) {
  const el = document.getElementById(id);
  if (!el) return;
  const y = el.getBoundingClientRect().top + window.scrollY - offset;
  window.scrollTo({ top: y, behavior: "smooth" });
}




// --- Google Places helpers (prefer when loaded) -----------------------------

const _predCache = new Map();   // query → Google predictions[]
const _osmCache  = new Map();   // query → OSM suggestions[]
function googleReady() {
  return !!(window.google && window.google.maps && window.google.maps.places);
}

// Google predictions (fast path) — uses session token + Boston bias
function placesSuggest(query, sessionToken) {
  return new Promise((resolve) => {
    if (!googleReady() || !query || query.trim().length < 3) return resolve([]);
    const g = window.google;
    const svc = new g.maps.places.AutocompleteService();

    // quick cache hit
    const q = query.trim();
    if (_predCache.has(q)) return resolve(_predCache.get(q));

    // Boston/Cambridge-ish center; tweak if your market changes
    const BIAS_CENTER = { lat: 42.361, lng: -71.057 }; // Boston Common
    const BIAS_RADIUS_M = 60000; // 60km

    // re-use a provided token when available
    const opts = {
      input: q,
      componentRestrictions: { country: "us" },
      // use 'location' + 'radius' for wide support
      location: new g.maps.LatLng(BIAS_CENTER.lat, BIAS_CENTER.lng),
      radius: BIAS_RADIUS_M,
      sessionToken,
    };

    svc.getPlacePredictions(opts, (preds, status) => {
      const ok = status === g.maps.places.PlacesServiceStatus.OK && Array.isArray(preds);
      const list = ok ? preds.map(p => ({ label: p.description, place_id: p.place_id })) : [];
      _predCache.set(q, list);
      resolve(list);
    });
  });
}

function placeDetails(place_id) {
  return new Promise((resolve, reject) => {
    if (!googleReady()) return reject(new Error("places-not-ready"));
    const svc = new window.google.maps.places.PlacesService(document.createElement("div"));
    svc.getDetails(
      { placeId: place_id, fields: ["geometry", "formatted_address"] },
      (place, status) => {
        if (
          status !== window.google.maps.places.PlacesServiceStatus.OK ||
          !place?.geometry?.location
        ) {
          return reject(new Error("place-details-failed"));
        }
        const loc = place.geometry.location;
        resolve({
          label: place.formatted_address,
          lat: loc.lat(),
          lon: loc.lng(),
        });
      }
    );
  });
}

function LocationInput({ label, value, onChange, selected, onSelect, placeholder }) {
  // Start/track Google Maps JS + Places loading
  const ok = useGoogleLoaded();

  const rootRef = React.useRef(null);
  const [focused, setFocused] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [items, setItems] = React.useState([]);

  // Keep one Places session token per typing session
  const tokenRef = React.useRef(null);
  const reqSeq   = React.useRef(0);

  // Autocomplete: wait for Google; fallback to OSM only if Google returns nothing
  React.useEffect(() => {
    let cancelled = false;
    let timer;

    async function run() {
      const q = (value || "").trim();

      if (q.length < 3) {
        setItems([]);
        setOpen(false);
        return;
      }

      // If Google isn't ready yet, show spinner + wait (no OSM yet)
      if (!ok) {
        setLoading(true);
        setOpen(false);
        return;
      }

      setLoading(true);

      // 0) cache hit (Google predictions)
      if (_predCache.has(q)) {
        const cached = _predCache.get(q);
        setItems(cached);
        setLoading(false);
        setOpen(focused && cached.length > 0);
        return;
      }

      // 1) ensure a session token (once Google is ready)
      if (!tokenRef.current && window.google) {
        tokenRef.current = new window.google.maps.places.AutocompleteSessionToken();
      }

      const seq = ++reqSeq.current;

      // 2) Ask Google first
      const googleList = await placesSuggest(q, tokenRef.current);
      if (cancelled || seq !== reqSeq.current) return;

      if (googleList && googleList.length > 0) {
        _predCache.set(q, googleList);
        setItems(googleList);
        setLoading(false);
        setOpen(focused && googleList.length > 0);
        return;
      }

      // 3) Fallback to OSM only if Google returned nothing
      try {
        const extras = await suggestUS(q);
        if (cancelled || seq !== reqSeq.current) return;
        _osmCache.set(q, extras || []);
        setItems(extras || []);
        setLoading(false);
        setOpen(focused && (extras?.length || 0) > 0);
      } catch {
        if (!cancelled) {
          setItems([]);
          setLoading(false);
          setOpen(false);
        }
      }
    }

    // Snappy once Google is ready; gentle while it loads
    const delay = ok ? 120 : 250;
    timer = setTimeout(run, delay);
    return () => { cancelled = true; clearTimeout(timer); };
  }, [value, focused, ok]);

  // Close on click-away (extra safety beyond input blur)
  React.useEffect(() => {
    function onDocDown(e) {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(e.target)) {
        setOpen(false);
        setFocused(false);
      }
    }
    document.addEventListener("mousedown", onDocDown);
    document.addEventListener("touchstart", onDocDown, { passive: true });
    return () => {
      document.removeEventListener("mousedown", onDocDown);
      document.removeEventListener("touchstart", onDocDown);
    };
  }, []);

  // Selection uses the SAME token for details → faster + consistent
  const handlePick = React.useCallback(async (it) => {
    let picked = it;
    try {
      if (it.place_id && ok) {
        picked = await placeDetails(it.place_id, tokenRef.current);
      }
    } catch {}
    onSelect(picked);
    onChange(picked.label);
    setOpen(false);

    // Start a fresh session for the next search
    if (ok && window.google) {
      tokenRef.current = new window.google.maps.places.AutocompleteSessionToken();
    }
  }, [onChange, onSelect, ok]);

  return (
    <div ref={rootRef} className="relative">
      <label className="block text-sm text-white/80 mb-1">{label}</label>
      <input
        className="input"
        placeholder={placeholder || "Type a city or exact address"}
        value={value}
        onChange={e => { onChange(e.target.value); onSelect(null); }}
        onFocus={() => { setFocused(true); if (items.length) setOpen(true); }}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        aria-autocomplete="list"
        aria-expanded={open}
        autoComplete="off"
        aria-busy={loading}
      />

      {loading && (
        <div className="pointer-events-none absolute right-3 top-1 h-4 w-4">
          <span className="sr-only">Loading</span>
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"></div>
        </div>
      )}

      {open && items.length > 0 && (
        <div className="absolute z-20 mt-1 max-h-80 w-full overflow-auto rounded-xl border border-white/10 bg-[#0f1115] shadow-lg">
          {items.map((it, i) => (
            <button
              key={`${(it.place_id || `${it.lat},${it.lon}`)},${i}`}
              className="w-full text-left px-3 py-2 hover:bg-white/10 text-sm"
              onMouseDown={(e) => { e.preventDefault(); }}
              onClick={() => handlePick(it)}
            >
              {it.label}
            </button>
          ))}
          {/* tiny attribution is recommended when rendering Google predictions */}
          <div className="flex justify-end px-3 py-1">
            <span className="text-[10px] text-white/40">Powered by Google</span>
          </div>
        </div>
      )}

      {selected && (
        <div className="mt-1 text-xs text-white/60">
          ✓ selected ({selected.lat?.toFixed?.(5)}, {selected.lon?.toFixed?.(5)})
        </div>
      )}
    </div>
  );
}

function RouteMap({ from, to }) {
  const ok = useGoogleLoaded(); // you already load Maps+Places
  const ref = React.useRef(null);

  React.useEffect(() => {
    if (!ok || !from || !to) return;
    const g = window.google;
    const map = new g.maps.Map(ref.current, {
      mapTypeControl: false,
      fullscreenControl: false,
      streetViewControl: false,
      zoomControl: true,
      gestureHandling: "greedy",
      backgroundColor: "#0f1115",
      styles: [
        { elementType: "geometry", stylers: [{ color: "#0f1115" }] },
        { elementType: "labels.text.stroke", stylers: [{ color: "#0f1115" }] },
        { elementType: "labels.text.fill", stylers: [{ color: "#9aa3b2" }] },
        { featureType: "road", elementType: "geometry", stylers: [{ color: "#1f2937" }] },
        { featureType: "water", elementType: "geometry", stylers: [{ color: "#0b1220" }] },
      ],
    });

    const dirSvc = new g.maps.DirectionsService();
    const dirRen = new g.maps.DirectionsRenderer({
      map,
      suppressMarkers: false,
      preserveViewport: false,
      polylineOptions: { strokeOpacity: 0.9 },
    });

    dirSvc.route(
      {
        origin: { lat: from.lat, lng: from.lon },
        destination: { lat: to.lat, lng: to.lon },
        travelMode: g.maps.TravelMode.DRIVING,
      },
      (res, status) => {
        if (status === "OK" && res) {
          dirRen.setDirections(res);
        } else {
          // fallback: just fit bounds around markers
          const b = new g.maps.LatLngBounds();
          b.extend(new g.maps.LatLng(from.lat, from.lon));
          b.extend(new g.maps.LatLng(to.lat, to.lon));
          map.fitBounds(b, 48);
          new g.maps.Marker({ map, position: { lat: from.lat, lng: from.lon } });
          new g.maps.Marker({ map, position: { lat: to.lat, lng: to.lon } });
        }
      }
    );
  }, [ok, from?.lat, from?.lon, to?.lat, to?.lon]);

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 h-64 md:h-72">
      <div ref={ref} className="w-full h-full rounded-2xl" />
    </div>
  );
}


// ---------------------------------------------------------
// Booking widget
// ---------------------------------------------------------
function BookingWidget({ presetVehicle, onQuote }) {
  // kick off the Google JS loader right away (even before the map)
  const googleOk = useGoogleLoaded();
  const [step, setStep] = useState(1);
  const [tripMode, setTripMode] = useState("airport"); // airport | p2p
  const [direction, setDirection] = useState("to_airport"); // to_airport | from_airport
  const [airport, setAirport] = useState("BOS");
  const [cityFrom, setCityFrom] = useState("Boston, MA");
  const [cityTo, setCityTo] = useState("Cambridge, MA");
  const [dateTime, setDateTime] = useState(() => new Date(Date.now() + 36e5).toISOString().slice(0, 16));
  const dateInputRef = React.useRef(null);
  const [vehicle, setVehicle] = useState(presetVehicle || "suv");
  const [pax, setPax] = useState(2);
  const [paxText, setPaxText] = useState(String(pax));
useEffect(() => { setPaxText(String(pax)); }, [pax]);
// Hourly service
const [hours, setHours] = useState(2);
const [hoursText, setHoursText] = useState("2");
useEffect(() => { setHoursText(String(hours)); }, [hours]);


const [fromPlace, setFromPlace] = useState(null); // {label, lat, lon}
const [toPlace,   setToPlace]   = useState(null);
  const [stops, setStops] = useState(0);
  const [childSeats, setChildSeats] = useState(0);
  const [meetGreet, setMeetGreet] = useState(true);
  const [promo, setPromo] = useState("");
  const [fullName, setFullName] = useState("");
const [email, setEmail]     = useState("");
const [phone, setPhone]     = useState("");
const [flight, setFlight]   = useState("");
const [notes, setNotes]     = useState("");

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
// Commute ETAs (driving now, scheduled, transit)
const [eta, setEta] = useState({
  driving_now: null,
  driving_at: null,
  transit: null,
  loading: false,
  error: null,
});

// For map + ETA: compute "from" and "to" points when available
const mapEnds = useMemo(() => {
  try {
    if (tripMode === "hourly") return { from: null, to: null };
    const a0 = AIRPORTS.find((x) => x.code === airport);
    const airportPoint = a0 ? { lat: a0.lat, lon: a0.lon } : null;

    if (tripMode === "airport" && airportPoint) {
      if (direction === "to_airport") {
        return { from: fromPlace || null, to: airportPoint };
      } else {
        return { from: airportPoint, to: toPlace || null };
      }
    }
    if (tripMode === "p2p") {
      return { from: fromPlace || null, to: toPlace || null };
    }
  } catch {}
  return { from: null, to: null };
}, [tripMode, direction, airport, fromPlace, toPlace]);

// Fetch commute ETAs (Distance Matrix)
useEffect(() => {
  let cancelled = false;
  const run = async () => {
    if (!mapEnds.from || !mapEnds.to) {
      setEta({ driving_now: null, driving_at: null, transit: null, loading: false, error: null });
      return;
    }
    setEta((s) => ({ ...s, loading: true, error: null }));
    try {
      const res = await fetch("/api/eta", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          origin: mapEnds.from,
          destination: mapEnds.to,
          when: dateTime,
        }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || "eta-failed");
      if (!cancelled) setEta({ ...j, loading: false, error: null });
    } catch (e) {
      if (!cancelled) setEta({ driving_now: null, driving_at: null, transit: null, loading: false, error: String(e?.message || e) });
    }
  };
  const t = setTimeout(run, 400); // debounce
  return () => { cancelled = true; clearTimeout(t); };
}, [mapEnds.from, mapEnds.to, dateTime]);
  useEffect(() => {
    if (presetVehicle) setVehicle(presetVehicle);
  }, [presetVehicle]);

// Recompute driving route whenever origin/destination change
useEffect(() => {
  let cancelled = false;

  const run = async () => {
    setRoute((r) => ({ ...r, loading: true, error: null }));
    try {
      // 1) Resolve from/to using selected places when available
let from, to;

if (tripMode === "airport") {
  const a0 = AIRPORTS.find(x => x.code === airport);
  if (!a0) throw new Error("airport-not-found");

  // ensure we have airport coords; if not, geocode by name
  const a = (a0.lat != null && a0.lon != null) ? a0 : await geocodeUS(a0.name);

  if (direction === "to_airport") {
    from = fromPlace || await geocodeUS(cityFrom || "");
    to   = a;
  } else { // from_airport
    from = a;
    to   = toPlace || await geocodeUS(cityTo || "");
  }
} else if (tripMode === "p2p") {
  // wait for user to pick from autocomplete (Google-first)
  from = fromPlace || null;
  to   = toPlace   || null;
}


// 2) Prefer Google Directions (most accurate road miles)
let r = null;
if (from && to) {
  try {
    const g = await routeDrivingGoogle(from, to); // { miles, minutes, meters, seconds }
    r = { miles: g.miles, minutes: g.minutes };
  } catch (_) {
    // fallback to OSRM if Google call fails
    r = await routeDriving(from, to);
  }
}

// 3) Last resort so UI never breaks
if (!r && from && to) {
  const factor = tripMode === "airport" ? 1.25 : 1.2;
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
}, [tripMode, direction, airport, cityFrom, cityTo, fromPlace, toPlace]);


  const quote = useMemo(() => {
    const veh = VEHICLES.find((v) => v.id === vehicle) || VEHICLES[1];
    const mult = demandMultiplier(dateTime);

    // Hourly service: $110–$135/hr, 2-hour minimum (demand-scaled, clamped)
if (tripMode === "hourly") {
  const minHours = Math.max(2, hours);
  const rate = Math.min(135, Math.max(110, 110 * mult)); // clamp 110..135
  let total = rate * minHours;

  // keep any surcharges you want
  total += childSeats * 10;

  return {
    miles: 0,
    minutes: minHours * 60,
    vehicle: veh.name,
    total,
    mult,
    hours: minHours,
    hourlyRate: rate,
  };
}

    // Prefer live routed values if available
let miles = route.miles;
let minutes = (eta?.driving_at?.minutes != null) ? eta.driving_at.minutes : route.minutes;

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
  }, [tripMode, direction, airport, cityFrom, cityTo, dateTime, vehicle, pax, stops, childSeats, meetGreet, promo, hours, eta]);

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
            <div className="grid grid-cols-3 gap-2">
  <button onClick={() => setTripMode("airport")}
    className={`px-3 py-2 rounded-xl border ${tripMode === "airport" ? "border-blue-500 bg-blue-500/10" : "border-white/10"}`}>
    Airport
  </button>
  <button onClick={() => setTripMode("p2p")}
    className={`px-3 py-2 rounded-xl border ${tripMode === "p2p" ? "border-blue-500 bg-blue-500/10" : "border-white/10"}`}>
    Point-to-Point
  </button>
  <button onClick={() => setTripMode("hourly")}
    className={`px-3 py-2 rounded-xl border ${tripMode === "hourly" ? "border-blue-500 bg-blue-500/10" : "border-white/10"}`}>
    Hourly
  </button>
</div>

            {tripMode === "airport" && (
  <div className="space-y-2">
    <label className="block text-sm text-white/80">Direction</label>
    <div className="grid grid-cols-2 gap-2">
      <button onClick={() => setDirection("to_airport")} className={`px-3 py-2 rounded-xl border ${direction === "to_airport" ? "border-blue-500 bg-blue-500/10" : "border-white/10"}`}>To Airport</button>
      <button onClick={() => setDirection("from_airport")} className={`px-3 py-2 rounded-xl border ${direction === "from_airport" ? "border-blue-500 bg-blue-500/10" : "border-white/10"}`}>From Airport</button>
    </div>
  </div>
)}

{tripMode === "p2p" && (
  <div className="space-y-2">
    <label className="block text-sm text-white/80">Passengers</label>
    <input
      aria-label="Passengers"
      type="tel" inputMode="numeric" pattern="[0-9]*"
      value={paxText}
      onChange={(e) => { const d = e.target.value.replace(/\D/g,""); setPaxText(d.slice(0,1)); }}
      onBlur={() => { let n = paxText === "" ? 1 : parseInt(paxText,10); n = Math.max(1, Math.min(7, n)); setPax(n); setPaxText(String(n)); }}
      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
  </div>
)}

{tripMode === "hourly" && (
  <div className="grid sm:grid-cols-2 gap-4">
    <div className="space-y-2">
      <label className="block text-sm text-white/80">Passengers</label>
      <input
        aria-label="Passengers"
        type="tel" inputMode="numeric" pattern="[0-9]*"
        value={paxText}
        onChange={(e) => { const d = e.target.value.replace(/\D/g,""); setPaxText(d.slice(0,1)); }}
        onBlur={() => { let n = paxText === "" ? 1 : parseInt(paxText,10); n = Math.max(1, Math.min(7, n)); setPax(n); setPaxText(String(n)); }}
        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>

    <div className="space-y-2">
      <label className="block text-sm text-white/80">Hours (2-hour minimum)</label>
      <input
        aria-label="Hours"
        type="tel" inputMode="numeric" pattern="[0-9]*"
        value={hoursText}
        onChange={(e) => { const d = e.target.value.replace(/\D/g,""); setHoursText(d.slice(0,2)); }}
        onBlur={() => { let h = hoursText === "" ? 2 : parseInt(hoursText,10); h = Math.max(2, Math.min(12, h)); setHours(h); setHoursText(String(h)); }}
        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  </div>
)}

            {tripMode === "airport" ? (
  <>
    {/* keep your Airport select unchanged */}
    <div className="space-y-2">
      <label className="block text-sm text-white/80">Airport</label>
      <select
        aria-label="Airport"
        value={airport}
        onChange={(e) => setAirport(e.target.value)}
        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2"
      >
        {AIRPORTS.map((a) => (
          <option key={a.code} value={a.code}>{a.name}</option>
        ))}
      </select>
    </div>

    {/* replace the old text input with LocationInput */}
    <LocationInput
      label={direction === "to_airport"
        ? "Pickup (City / Address)"
        : "Drop-off (City / Address)"}
      value={direction === "to_airport" ? cityFrom : cityTo}
      onChange={(v) =>
        direction === "to_airport" ? setCityFrom(v) : setCityTo(v)
      }
      selected={direction === "to_airport" ? fromPlace : toPlace}
      onSelect={(p) =>
        direction === "to_airport" ? setFromPlace(p) : setToPlace(p)
      }
      placeholder="e.g. 123 Elm Street, Springfield, IL 02432"
    />
  </>
) : (
  <>
    {/* replace the two point-to-point inputs with LocationInput */}
    <LocationInput
      label="Pickup City / Address"
      value={cityFrom}
      onChange={(v) => setCityFrom(v)}
      selected={fromPlace}
      onSelect={setFromPlace}
      placeholder="e.g. 1 Washington St, Boston, MA 02108"
    />

    <LocationInput
      label="Drop-off City / Address"
      value={cityTo}
      onChange={(v) => setCityTo(v)}
      selected={toPlace}
      onSelect={setToPlace}
      placeholder="e.g. 700 Boylston St, Boston, MA 02116"
    />
  </>
)}

            <div className="space-y-2">
              <label className="block text-sm text-white/80">Date & Time</label>
              <div className="relative">
  <input
    ref={dateInputRef}
    aria-label="Date and time"
    type="datetime-local"
    value={dateTime}
    onChange={(e) => setDateTime(e.target.value)}
    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 pr-12 [color-scheme:dark] hide-native-picker"
  />

  {/* Clickable calendar icon (positioned where you want it) */}
  <button
    type="button"
    aria-label="Open calendar"
    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/70 hover:text-white"
    onClick={() => (dateInputRef.current?.showPicker ? dateInputRef.current.showPicker() : dateInputRef.current?.focus())}
  >
    <Calendar className="w-4 h-4" />
  </button>
</div>
            </div>

            <div className="space-y-2">
  <label className="block text-sm text-white/80">Vehicle</label>
  {/* Only allow Premium SUV in the dropdown for now */}
  <select
    aria-label="Vehicle"
    value={vehicle}
    onChange={(e) => setVehicle(e.target.value)} // harmless; only one option
    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2"
  >
    <option value="suv">Premium SUV</option>
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
            {tripMode === "hourly" ? (
  <>
    <StatCard icon={<Clock className="w-4 h-4" />} label="Hours" value={`${quote.hours} hr`} />
    <StatCard icon={<CreditCard className="w-4 h-4" />} label="Hourly Rate" value={fmt(quote.hourlyRate)} />
    <StatCard icon={<CreditCard className="w-4 h-4" />} label="Quote (before tip)" value={fmt(quote.total)} />
  </>
) : (
  <>
    <StatCard
  icon={<Navigation className="w-4 h-4" />}
  label="Estimated Distance"
  value={`${quote.miles} mi`}
/>

<StatCard
  icon={<Clock className="w-4 h-4" />}
  label="Driving now (traffic)"
  value={eta.loading ? "…" : (eta?.driving_now?.minutes != null ? `${eta.driving_now.minutes} min` : "—")}
/>

<StatCard
  icon={<Clock className="w-4 h-4" />}
  label="Driving at pickup time"
  value={eta.loading ? "…" : (eta?.driving_at?.minutes != null ? `${eta.driving_at.minutes} min` : "—")}
/>

<StatCard
  icon={<CreditCard className="w-4 h-4" />}
  label="Quote (before tip)"
  value={fmt(quote.total)}
/>
  </>
)}


            <div className="md:col-span-3 rounded-2xl border border-white/10 p-4 bg-white/5">
              <div className="flex flex-wrap items-center gap-3 text-sm">
                <div className="px-2 py-1 rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/20">Vehicle: {quote.vehicle}</div>
                <div className="px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">Demand Multiplier: {quote.mult.toFixed(2)}×</div>
                <div className="px-2 py-1 rounded-full bg-white/5 text-white/80 border border-white/10">Includes tolls & airport fees</div>
              </div>
            </div>

 {/* asdasd 
{// Commute & Transit panel }
<div className="md:col-span-3 grid md:grid-cols-3 gap-3">
  <div className="rounded-2xl border border-white/10 p-4 bg-white/5">
    <div className="text-white/70 text-xs mb-1">Driving now (traffic)</div>
    <div className="text-xl font-semibold">
      {eta.loading ? "…" : eta.driving_now ? `${eta.driving_now.minutes} min` : "—"}
    </div>
  </div>
  <div className="rounded-2xl border border-white/10 p-4 bg-white/5">
    <div className="text-white/70 text-xs mb-1">Driving at pickup time</div>
    <div className="text-xl font-semibold">
      {eta.loading ? "…" : eta.driving_at ? `${eta.driving_at.minutes} min` : "—"}
    </div>
  </div>
  <div className="rounded-2xl border border-white/10 p-4 bg-white/5">
    <div className="text-white/70 text-xs mb-1">Public Transit (best effort)</div>
    <div className="text-xl font-semibold">
      {eta.loading ? "…" : eta.transit ? `${eta.transit.minutes} min` : "—"}
    </div>
  </div>
</div>

*/}

{/* Map preview of the route */}
{tripMode !== "hourly" && mapEnds.from && mapEnds.to && (
  <div className="md:col-span-3">
    <RouteMap from={mapEnds.from} to={mapEnds.to} />
  </div>
)}
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
            <Field label="Full Name">
  <input
    className="input"
    placeholder="Your name"
    value={fullName}
    onChange={(e) => setFullName(e.target.value)}
  />
</Field>

<Field label="Email">
  <input
    className="input"
    type="email"
    placeholder="name@example.com"
    value={email}
    onChange={(e) => setEmail(e.target.value)}
  />
</Field>

<Field label="Phone">
  <input
    className="input"
    placeholder="(###) ###-####"
    value={phone}
    onChange={(e) => setPhone(e.target.value)}
  />
</Field>

<Field label="Flight # (optional)">
  <input
    className="input"
    placeholder="e.g., AA123"
    value={flight}
    onChange={(e) => setFlight(e.target.value)}
  />
</Field>

<Field label="Notes">
  <textarea
    className="input h-24"
    placeholder="Door #, baggage, accessibility, etc."
    value={notes}
    onChange={(e) => setNotes(e.target.value)}
  />
</Field>
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
    fromPlace,
    toPlace,
    dateTime,
    vehicle,
    pax,
    childSeats,
    stops,
    meetGreet,
    promo,
    hours,
    // NEW
    fullName,
    email,
    phone,
    flight,
    notes,
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
           <a
    href="#home"
    onClick={(e) => { e.preventDefault(); scrollToId("home", 0); }} // 0 = highest point
    className="flex items-center gap-2"
    aria-label="Back to top"
  >
    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-400 to-emerald-400 grid place-items-center">
      <Plane className="w-4 h-4 text-slate-900" />
    </div>
    <span className="font-semibold tracking-wide">Monas Airport Livery</span>
  </a>
          <div className="hidden md:flex items-center gap-6 text-sm">
  {[
    ["Fleet", "fleet"],
    ["Services", "services"],
    ["Rates", "rates"],
    ["Reviews", "reviews"],
    ["FAQ", "faq"],
    ["Contact", "contact"],
  ].map(([label, id]) => (
    <a
      key={label}
      href={`#${id}`}
      onClick={(e) => { e.preventDefault(); scrollToId(id); }}
      className="hover:text-white/90 text-white/80"
    >
      {label}
    </a>
  ))}

  <a
    href="#book"
    onClick={(e) => { e.preventDefault(); scrollToId("book"); }}
    className="btn-primary inline-flex items-center gap-2"
  >
    <Calendar className="w-4 h-4" /> Book Now
  </a>
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
  <a
    href="#book"
    onClick={(e) => { e.preventDefault(); scrollToId("book"); }}
    className="btn-primary inline-flex items-center gap-2"
  >
    <Calendar className="w-4 h-4" /> Get Instant Quote
  </a>

  <a
    href="#fleet"
    onClick={(e) => { e.preventDefault(); scrollToId("fleet"); }}
    className="btn-secondary inline-flex items-center gap-2"
  >
    <Car className="w-4 h-4" /> View Fleet
  </a>
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

      {/* changed here */}
      <a
        href="#book"
        onClick={(e) => { e.preventDefault(); scrollToId("book"); }}
        className="col-span-3 btn-primary text-center"
      >
        Customize Your Trip
      </a>
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
            {/* ⬇️ Buttons — only SUV works; others do nothing */}
<div className="mt-6 flex gap-3">
  {(() => {
    const isActive = v.id === "suv"; // Premium SUV only
    return (
      <>
        <button
          className={`btn-primary ${!isActive ? "opacity-50 cursor-not-allowed" : ""}`}
          onClick={(e) => {
            if (!isActive) { e.preventDefault(); return; } // do nothing
            onSelect(v.id);
            scrollToId("book");
          }}
          aria-disabled={!isActive}
          tabIndex={isActive ? 0 : -1}
        >
          Select
        </button>

        <button
          className={`btn-secondary ${!isActive ? "opacity-50 cursor-not-allowed" : ""}`}
          onClick={(e) => {
            if (!isActive) { e.preventDefault(); return; } // do nothing
            scrollToId("rates");
          }}
          aria-disabled={!isActive}
          tabIndex={isActive ? 0 : -1}
        >
          View rates
        </button>
      </>
    );
  })()}
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
  <Link to="/terms" className="hover:text-white/90 underline">Terms</Link>
  <Link to="/privacy" className="hover:text-white/90 underline">Privacy</Link>
  <Link to="/accessibility" className="hover:text-white/90 underline">Accessibility</Link>
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

        <style>{`
  .hide-native-picker::-webkit-calendar-picker-indicator { opacity: 0; display: none; }
  .hide-native-picker::-webkit-clear-button { display: none; }
  .hide-native-picker::-webkit-inner-spin-button { display: none; }
`}</style>

      <main className="pt-0">
        <Hero />
        <section className="section -mt-4 relative z-10">
          <BookingWidget presetVehicle={presetVehicle} onQuote={handleQuote} />
        </section>
        <Fleet onSelect={(id) => { setPresetVehicle(id); }} />
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
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm">
          <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -10, opacity: 0 }} className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mt-24 rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-center justify-between">
                <div className="font-semibold">Menu</div>
                <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/10" aria-label="Close menu"><X className="w-5 h-5" /></button>
              </div>
              <nav className="mt-3 grid gap-2 text-sm">
  {[
  ["Fleet", "#fleet"],
  ["Services", "#services"],
  ["Rates", "#rates"],
  ["Reviews", "#reviews"],
  ["FAQ", "#faq"],
  ["Contact", "#contact"],
  ["Book", "#book"],
].map(([label, href]) => (
  <a
    key={href}
    href={href}
    onClick={(e) => {
      e.preventDefault();          // don't let the browser jump immediately
      onClose();                   // close the overlay
      // after it closes, perform the smooth scroll
      requestAnimationFrame(() => scrollToId(href.slice(1)));
    }}
    className="w-full rounded-xl px-3 py-2 text-center font-semibold text-white/90
               bg-white/5 border border-white/10 transition-all duration-200
               hover:bg-white/10 hover:border-blue-400 hover:shadow-[0_0_24px_rgba(96,165,250,0.35)]
               focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/60
               active:scale-[0.98]"
  >
    {label}
  </a>
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
    setPaying(true);
    try {
      // ⬇️ INSERT THIS GUARD BLOCK HERE
      if (data.tripMode === "p2p" && (!data.fromPlace || !data.toPlace)) {
        alert("Please select an exact Pickup and Drop-off from the suggestions.");
        setPaying(false); return;
      }
      if (data.tripMode === "airport") {
        if (data.direction === "to_airport" && !data.fromPlace) {
          alert("Please select an exact Pickup address from the suggestions.");
          setPaying(false); return;
        }
        if (data.direction === "from_airport" && !data.toPlace) {
          alert("Please select an exact Drop-off address from the suggestions.");
          setPaying(false); return;
        }
      }

      // 1) Labels
const tripType =
  data.tripMode === "airport"
    ? `Airport (${data.direction.replace("_", " ")})`
    : data.tripMode === "hourly"
    ? "Hourly"
    : "Point-to-Point";

const airportName =
  (AIRPORTS.find(a => a.code === data.airport)?.name) || "Airport";

const vehicleName =
  (VEHICLES.find(v => v.id === data.vehicle)?.name) || "—";

// 2) From/To  <<< REPLACE your old 2) block with this one >>>
const fromLabel = data.fromPlace?.label || data.cityFrom || "";
const toLabel   = data.toPlace?.label   || data.cityTo   || "";

let from = fromLabel;
let to   = toLabel;

if (data.tripMode === "airport") {
  if (data.direction === "to_airport") {
    from = fromLabel;
    to   = airportName;
  } else { // from_airport
    from = airportName;
    to   = toLabel;
  }
} else if (data.tripMode === "hourly") {
  to = ""; // hourly has no dropoff
}

    // 3) Payload
    const payload = {
      amountCents: Math.round((data.total || 0) * 100),
      currency: "usd",
      booking: {
        whenISO: new Date(data.dateTime).toISOString(),
        tripType,
        from,
        to,
        vehicle: vehicleName,
        passengers: data.pax,
        hours: data.tripMode === "hourly" ? (data.hours || 2) : undefined,
        distance_mi: data.miles,
        duration_min: data.minutes,
        notes: data.notes || "",
        flight: data.flight || ""
      },
      customer: {
        name:  data.fullName || data.name || "",
        email: data.email || "",
        phone: data.phone || data.phoneNumber || ""
      }
    };

    // 4) Create session + redirect
    const res = await fetch(CHECKOUT_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const text = await res.text();
    let out = {};
    try { out = JSON.parse(text); } catch {}

    if (!res.ok) throw new Error(out.error || text || `HTTP ${res.status}`);

    if (out.url) { window.location.href = out.url; return; }
    if (out.id) {
      const stripe = await stripePromise;
      const { error } = await stripe.redirectToCheckout({ sessionId: out.id });
      if (error) throw error;
      return;
    }
    throw new Error("Unexpected response from checkout");
  } catch (err) {
    alert("Checkout failed. " + (err?.message || "Please try again."));
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
          <SummaryRow
  label="Trip Type"
  value={
    data.tripMode === "airport"
      ? `Airport (${data.direction.replace("_"," ")})`
      : data.tripMode === "hourly"
      ? "Hourly"
      : "Point-to-Point"
  }
/>
          <SummaryRow label="When" value={new Date(data.dateTime).toLocaleString()} />
          <SummaryRow label="From" value={data.tripMode === "airport" ? (data.direction === "from_airport" ? data.airport : data.cityFrom) : data.cityFrom} />
          <SummaryRow label="To" value={data.tripMode === "airport" ? (data.direction === "to_airport" ? data.airport : data.cityTo) : data.cityTo} />
          <SummaryRow label="Vehicle" value={VEHICLES.find((v) => v.id === data.vehicle)?.name || "—"} />
          <SummaryRow label="Passengers" value={data.pax} />

{/* Hourly: show Hours; hide Distance/Duration */}
{data.tripMode === "hourly" ? (
  <SummaryRow label="Hours" value={`${data.hours || 2} hr`} />
) : (
  <>
    <SummaryRow label="Distance" value={`${data.miles} mi`} />
    <SummaryRow label="Duration" value={`${data.minutes} min`} />
  </>
)}
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

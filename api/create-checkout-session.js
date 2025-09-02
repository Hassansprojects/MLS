// /api/create-checkout-session.js  (Vercel Serverless Function - Node.js)
import Stripe from "stripe";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const { amountCents, currency = "usd", booking, customer } = req.body || {}; ///////////////////////////////

    // Build a reliable base URL for success/cancel
const originHeader = req.headers.origin;
const host = req.headers.host; // e.g. mls-phi.vercel.app
const proto = req.headers["x-forwarded-proto"] || "https";
const baseUrl = originHeader || (host ? `${proto}://${host}` : "");

// Safety: if we still couldn't resolve a base URL, bail clearly
if (!baseUrl.startsWith("http")) {
  return res.status(400).json({
    error: "missing_origin_host",
    hint: "No Origin/Host header; cannot build redirect URLs."
  });
}

/*
    // (A) 🔐 Origin allowlist (optional but recommended)
    const origin = req.headers.origin || "";
    const allowed = (process.env.ALLOWED_ORIGINS || "")
      .split(",")
      .map(s => s.trim())
      .filter(Boolean);
    if (allowed.length && !allowed.includes(origin)) {
      return res.status(403).json({ error: "origin_not_allowed" });
    }

    */

    // (B) 💵 Amount: QUICK START clamp (replace with server-side fare calc later)
    // TODO: re-compute price server-side using your rates instead of trusting client.
    const amount = Math.min(Math.max(parseInt(amountCents || 0, 10), 1500), 200000); // $15–$2000

    const session = await stripe.checkout.sessions.create({
  mode: "payment",
  allow_promotion_codes: true,
  payment_method_types: ["card"],

  // Attach contact to the session/customer
  customer_email: customer?.email || undefined,
  customer_creation: "always",
  phone_number_collection: { enabled: true },

  line_items: [
    {
      price_data: {
        currency,
        product_data: {
          name: `Mona Airport Livery — ${booking?.vehicle || "Ride"}`,
          // Only show the arrow/to if a "to" exists; avoids weird text for Hourly.
          description: `${booking?.from || "Origin"}${booking?.to ? ` → ${booking?.to}` : ""}`,
        },
        unit_amount: amount, // already clamped above
      },
      quantity: 1,
    },
  ],

  // Put everything in metadata so you can see/search it in Stripe
  metadata: {
    name: customer?.name || "",
    email: customer?.email || "",
    phone: customer?.phone || "",
    whenISO: booking?.whenISO || "",
    tripType: booking?.tripType || "",
    from: booking?.from || "",
    to: booking?.to || "",
    vehicle: booking?.vehicle || "",
    passengers: String(booking?.passengers ?? ""),
    hours: String(booking?.hours ?? ""),
    distance_mi: String(booking?.distance_mi ?? ""),
    duration_min: String(booking?.duration_min ?? ""),
    notes: booking?.notes || "",
    flight: booking?.flight || "",
    options: JSON.stringify(booking?.options || {}),
  },

  // Mirror key fields on the PaymentIntent too
  payment_intent_data: {
  metadata: {
    // contact
    name:   customer?.name  || "",
    email:  customer?.email || "",
    phone:  customer?.phone || "",

    // trip core
    tripType:  booking?.tripType  || "",
    whenISO:   booking?.whenISO   || "",
    vehicle:   booking?.vehicle   || "",
    passengers: booking?.passengers || "",

    // pickup / dropoff (same as session metadata)
    from:      booking?.from      || "",
    to:        booking?.to        || "",
    pickup:    booking?.from      || "",  // friendly aliases
    dropoff:   booking?.to        || "",

    // extras
    notes:  booking?.notes  || "",
    flight: booking?.flight || "",
  },
},

  success_url: `${baseUrl}/?paid=1&session_id={CHECKOUT_SESSION_ID}`,
  cancel_url: `${baseUrl}/?canceled=1`,
});

    // Return the hosted Checkout URL (simplest)
    return res.status(200).json({ url: session.url, id: session.id });
  } catch (e) {
    console.error("Stripe create session error:", e);
    return res.status(400).json({ error: e.message || "stripe_error" });
  }
}
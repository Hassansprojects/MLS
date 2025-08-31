// /api/create-checkout-session.js  (Vercel Serverless Function - Node.js)
import Stripe from "stripe";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const { amountCents, currency = "usd", booking } = req.body || {};

    /*    // (A) 🔐 Origin allowlist (optional but recommended)
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
      line_items: [
        {
          price_data: {
            currency,
            product_data: {
              name: `Mona Airport Livery — ${booking?.vehicle || "Ride"}`,
              description: `${booking?.from || "Origin"} → ${booking?.to || "Destination"} (${booking?.distance_mi || "?"} mi)`,
            },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      metadata: {
        whenISO: booking?.whenISO || "",
        tripType: booking?.tripType || "",
        passengers: String(booking?.passengers || ""),
        options: JSON.stringify(booking?.options || {}),
      },
      success_url: `${origin}/?paid=1&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/?canceled=1`,
    });

    // Return the hosted Checkout URL (simplest)
    return res.status(200).json({ url: session.url, id: session.id });
  } catch (e) {
    console.error("Stripe create session error:", e);
    return res.status(400).json({ error: e.message || "stripe_error" });
  }
}
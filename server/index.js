require("dotenv").config();
const express = require("express");
const cors = require("cors");
const Stripe = require("stripe");

const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY); // sk_test_***

app.post("/create-checkout-session", async (req, res) => {
  try {
    const { amountCents, currency = "usd", booking } = req.body || {};
    const amount = Math.min(Math.max(parseInt(amountCents || 0, 10), 1500), 200000); // $15–$2000 clamp

    const origin = req.headers.origin || "http://localhost:5173";
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      allow_promotion_codes: true,
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

    res.json({ url: session.url, id: session.id });
  } catch (e) {
    console.error("Stripe error:", e);
    res.status(400).json({ error: e.message || "stripe_error" });
  }
});

const PORT = process.env.PORT || 8787;
app.listen(PORT, () => console.log(`Server listening on http://localhost:${PORT}`));
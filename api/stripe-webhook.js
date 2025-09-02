// /api/stripe-webhook.js
import Stripe from "stripe";

export const config = { api: { bodyParser: false } };

function readRawBody(req) {
  return new Promise((resolve, reject) => {
    let data = "";
    req.setEncoding("utf8");
    req.on("data", (chunk) => (data += chunk));
    req.on("end", () => resolve(data));
    req.on("error", reject);
  });
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const sig = req.headers["stripe-signature"];
  const rawBody = await readRawBody(req);

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    // Pull contact + trip data
    const cd = session.customer_details || {};
    const m = session.metadata || {};

    // Example: email dispatch via Resend (or swap to SendGrid/Nodemailer/Slack)
    // npm i resend
    try {
      const { Resend } = await import("resend");
      const resend = new Resend(process.env.RESEND_API_KEY);

      const html = `
        <h2>New Booking Paid</h2>
        <p><b>Name:</b> ${cd.name || m.fullName || ""}</p>
        <p><b>Email:</b> ${cd.email || m.email || ""}</p>
        <p><b>Phone:</b> ${cd.phone || m.phone || ""}</p>
        <p><b>Trip:</b> ${m.tripMode || ""} — ${m.direction || ""}</p>
        <p><b>When:</b> ${m.dateTime || ""}</p>
        <p><b>From:</b> ${m.cityFrom || m.from || ""}</p>
        <p><b>To:</b> ${m.cityTo || m.to || ""}</p>
        <p><b>Airport:</b> ${m.airport || ""}</p>
        <p><b>Vehicle/Pax:</b> ${m.vehicle || ""} / ${m.pax || ""}</p>
        <p><b>Hours / Miles / Minutes:</b> ${m.hours || "N/A"} / ${m.distance || ""} / ${m.duration || ""}</p>
        <p><b>Flight:</b> ${m.flight || ""}</p>
        <p><b>Options:</b> childSeats:${m.childSeats || 0}, stops:${m.stops || 0}, meetGreet:${m.meetGreet || "no"}</p>
        <p><b>Notes:</b> ${m.notes || ""}</p>
        <p><i>Stripe Session:</i> ${session.id}</p>
      `;

      await resend.emails.send({
        from: "bookings@yourdomain.com",
        to: process.env.DISPATCH_EMAIL, // e.g., ops@yourdomain.com
        subject: "New Mona Airport Livery Booking (Paid)",
        html,
      });
    } catch (e) {
      console.error("Notification send failed:", e);
    }
  }

  res.json({ received: true });
}
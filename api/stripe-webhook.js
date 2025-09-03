// /api/stripe-webhook.js
import Stripe from "stripe";
import nodemailer from "nodemailer";

export const config = { api: { bodyParser: false } };

// Read raw body so Stripe can verify signature
function readRawBody(req) {
  return new Promise((resolve, reject) => {
    let data = "";
    req.setEncoding("utf8");
    req.on("data", (chunk) => (data += chunk));
    req.on("end", () => resolve(data));
    req.on("error", reject);
  });
}

const fmtMoney = (cents, cur) =>
  typeof cents === "number" ? `$${(cents / 100).toFixed(2)} ${String(cur || "").toUpperCase()}` : "";

function buildEmailHTML({ cd, m, session, amount, currency }) {
  const name = cd.name || m.fullName || "";
  const when = m.dateTime || m.whenISO || "";
  const tripTitle =
    m.tripMode === "hourly"
      ? `Hourly — ${m.hours || "N/A"} hrs`
      : `${m.from || m.cityFrom || "—"} → ${m.to || m.cityTo || (m.airport ? "Airport" : "—")}`;

  return `
  <div style="font-family:system-ui,Segoe UI,Roboto,Arial,sans-serif;line-height:1.4">
    <h2 style="margin:0 0 8px">Booking confirmed — ${tripTitle}</h2>
    <p style="margin:0 0 12px">Thank you ${name}! Your ride is confirmed.</p>
    <table style="border-collapse:collapse;width:100%;max-width:560px">
      <tbody>
        <tr><td style="padding:6px 0"><b>When</b></td><td style="padding:6px 0">${when}</td></tr>
        <tr><td style="padding:6px 0"><b>From</b></td><td style="padding:6px 0">${m.from || ""}</td></tr>
        <tr><td style="padding:6px 0"><b>To</b></td><td style="padding:6px 0">${m.to || ""}</td></tr>
        <tr><td style="padding:6px 0"><b>Airport</b></td><td style="padding:6px 0">${m.airport || ""}</td></tr>
        <tr><td style="padding:6px 0"><b>Vehicle</b></td><td style="padding:6px 0">${m.vehicle || ""}</td></tr>
        <tr><td style="padding:6px 0"><b>Passengers</b></td><td style="padding:6px 0">${m.pax || m.passengers || ""}</td></tr>
        <tr><td style="padding:6px 0"><b>Hours/Miles/Minutes</b></td><td style="padding:6px 0">${m.hours || "N/A"} / ${m.distance || ""} / ${m.duration || ""}</td></tr>
        <tr><td style="padding:6px 0"><b>Options</b></td><td style="padding:6px 0">childSeats: ${m.childSeats || 0}, stops: ${m.stops || 0}, meetGreet: ${m.meetGreet || "no"}</td></tr>
        <tr><td style="padding:6px 0"><b>Flight</b></td><td style="padding:6px 0">${m.flight || ""}</td></tr>
        <tr><td style="padding:6px 0"><b>Notes</b></td><td style="padding:6px 0">${(m.notes || "").replace(/\n/g,"<br>")}</td></tr>
        <tr><td style="padding:6px 0"><b>Total</b></td><td style="padding:6px 0">${fmtMoney(amount, currency)}</td></tr>
      </tbody>
    </table>
    <p style="color:#6b7280;margin-top:12px">Ref: ${session.id}</p>
  </div>`;
}

function buildTransporter() {
  const host = process.env.SMTP_HOST || "smtp.gmail.com";
  const port = Number(process.env.SMTP_PORT || 465);
  const secure = String(process.env.SMTP_SECURE || "true") === "true";
  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user: process.env.SMTP_USER, // your Gmail address
      pass: process.env.SMTP_PASS, // 16-char App Password
    },
  });
}

async function emailCustomerAndOps(session, m, cd, amount, currency) {
  const transporter = buildTransporter();
  const FROM = process.env.SENDER_EMAIL || process.env.SMTP_USER; // must be your Gmail
  const TO_CUSTOMER = cd.email || m.email || "";                  // buyer from Stripe Checkout
  const TO_OPS = process.env.DISPATCH_EMAIL;                      // fixed seller inbox

  const html = buildEmailHTML({ cd, m, session, amount, currency });
  const subjectCustomer = "Your Mona Airport Livery booking is confirmed";
  const subjectOps =
    m.tripMode === "hourly" ? `New booking — Hourly ${m.hours || ""}h` : `New booking — ${m.from || ""} → ${m.to || ""}`;

  // Send to customer
  if (TO_CUSTOMER) {
    await transporter.sendMail({
      from: FROM,
      to: TO_CUSTOMER,
      replyTo: TO_OPS, // replies go to your ops inbox
      subject: subjectCustomer,
      html,
      text: html.replace(/<[^>]+>/g, " "),
    });
  }

  // Send to ops
  if (TO_OPS) {
    await transporter.sendMail({
      from: FROM,
      to: TO_OPS,
      replyTo: TO_CUSTOMER || FROM, // reply back to buyer if available
      subject: subjectOps,
      html,
      text: html.replace(/<[^>]+>/g, " "),
    });
  }
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
    const cd = session.customer_details || {};
    const m = session.metadata || {};

    // Prefer totals from PaymentIntent
    let amount = session.amount_total;
    let currency = session.currency;
    try {
      if (session.payment_intent) {
        const pi = await stripe.paymentIntents.retrieve(session.payment_intent);
        amount = pi.amount_received ?? pi.amount ?? amount;
        currency = pi.currency ?? currency;
      }
    } catch (e) {
      console.warn("Could not retrieve PaymentIntent:", e?.message);
    }

    try {
      await emailCustomerAndOps(session, m, cd, amount, currency);
    } catch (e) {
      console.error("Email sending failed:", e?.message);
    }
  }

  res.json({ received: true });
}

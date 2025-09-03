import nodemailer from "nodemailer";

export default async function handler(req, res) {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 465),
      secure: String(process.env.SMTP_SECURE || "true") === "true",
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });

    // Verify credentials with Gmail first
    await transporter.verify();

    const info = await transporter.sendMail({
      from: process.env.SENDER_EMAIL || process.env.SMTP_USER,
      to: process.env.DISPATCH_EMAIL || process.env.SMTP_USER,
      subject: "SMTP test OK",
      text: "If you see this, Gmail SMTP is working from Vercel.",
    });

    res.status(200).json({ ok: true, messageId: info.messageId });
  } catch (e) {
    console.error("SMTP test failed:", e);
    res.status(500).json({ ok: false, error: String(e) });
  }
}

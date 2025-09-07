// src/pages/Privacy.jsx
const COMPANY_NAME = "Monas Airport Livery";
const EFFECTIVE_DATE = "September 7, 2025";
const LAST_UPDATED  = "September 7, 2025";
const EMAIL = "monasairportlivery@gmail.com";
const PHONE = "(617) 319-3204";
const ADDRESS_LINE = "Boston, MA";

export default function Privacy() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10 text-white/90">
      <h1 className="text-3xl font-semibold mb-2">Privacy Policy</h1>
      <p className="text-sm text-white/60 mb-8">
        Effective: {EFFECTIVE_DATE} • Last updated: {LAST_UPDATED}
      </p>

      <section className="space-y-6">
        <p>
          {COMPANY_NAME} (“we,” “us,” “our”) respects your privacy. This policy explains what we
          collect, how we use it, and your choices. This policy applies to our website, apps, and
          transportation services.
        </p>

        <div>
          <h2 className="text-xl font-semibold mb-2">1) Information We Collect</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Contact &amp; identity:</strong> name, email, phone.</li>
            <li><strong>Trip details:</strong> pickup/dropoff, dates/times, flight info, passengers, preferences.</li>
            <li><strong>Payment info:</strong> processed by our payment provider (e.g., Stripe). We do not store full card numbers.</li>
            <li><strong>Device &amp; usage:</strong> IP address, browser/device, pages viewed, cookies; may include location if you allow it.</li>
            <li><strong>Communications:</strong> messages or calls with customer support or drivers.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">2) How We Use Information</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Provide, secure, and improve our services and website.</li>
            <li>Process bookings, payments, confirmations, and receipts.</li>
            <li>Communicate about rides, delays, safety, or support.</li>
            <li>Personalize quotes, routes, and vehicle options.</li>
            <li>Analyze performance, detect fraud/abuse, and comply with law.</li>
            <li>Marketing with your consent where required (you can opt out).</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">3) Sharing</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Vendors &amp; processors:</strong> payment, mapping, communications, analytics, hosting (bound by contracts).</li>
            <li><strong>Affiliated operators:</strong> to fulfill your trip if needed.</li>
            <li><strong>Legal/safety:</strong> to comply with law, enforce terms, or protect rights and safety.</li>
            <li><strong>Business transfers:</strong> as part of a merger, acquisition, or asset sale.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">4) Cookies &amp; Analytics</h2>
          <p className="mb-2">We use cookies and similar tech for essential site functions, performance, and analytics (e.g., Google Analytics/Tag Manager).</p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Manage preferences:</strong> adjust your browser settings or use our cookie banner (if present).</li>
            <li><strong>Do Not Track:</strong> we currently do not respond to DNT signals.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">5) Your Choices &amp; Rights</h2>
          <p className="mb-2">Depending on your location, you may have rights to access, correct, delete, or limit use of your data.</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>To exercise rights or request deletion, email <a className="underline" href={`mailto:${EMAIL}`}>{EMAIL}</a>.</li>
            <li>Marketing emails include an unsubscribe link.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">6) Data Retention &amp; Security</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>We keep data only as long as needed for bookings, legal, tax, or business purposes.</li>
            <li>We use reasonable administrative, technical, and physical safeguards; no method is 100% secure.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">7) Children’s Privacy</h2>
          <p>Our services are not directed to children under 13. If we learn we collected data from a child under 13, we will delete it.</p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">8) International Users</h2>
          <p>Your data may be processed in the United States. By using our services, you consent to transfers as permitted by law.</p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">9) Changes &amp; Contact</h2>
          <p>We may update this Policy and will post a new “Effective” date here.</p>
          <p className="mt-2">Questions? <a className="underline" href={`mailto:${EMAIL}`}>{EMAIL}</a> • {PHONE} • {ADDRESS_LINE}</p>
          <p className="mt-2 text-white/60">This template is informational and not legal advice.</p>
        </div>
      </section>
    </main>
  );
}

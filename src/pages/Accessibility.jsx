// src/pages/Accessibility.jsx
const COMPANY_NAME = "Monas Airport Livery";
const EFFECTIVE_DATE = "September 7, 2025";
const LAST_UPDATED = "September 7, 2025";
const EMAIL = "monasairportlivery@gmail.com";
const PHONE = "(617) 319-3204";
const ADDRESS_LINE = "Boston, MA";
const RESPONSE_TIME = "2";

export default function Accessibility() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10 text-white/90">
      <h1 className="text-3xl font-semibold mb-2">Accessibility Statement</h1>
      <p className="text-sm text-white/60 mb-8">
        Effective: {EFFECTIVE_DATE} • Last updated: {LAST_UPDATED}
      </p>

      <section className="space-y-6">
        <p>
          {COMPANY_NAME} is committed to providing a website and transportation experience accessible to the widest possible audience,
          regardless of technology or ability. We strive to meet or exceed <strong>WCAG 2.2 AA</strong> guidelines.
        </p>

        <div>
          <h2 className="text-xl font-semibold mb-2">Our Measures</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Semantic HTML, clear headings, and descriptive links.</li>
            <li>Keyboard-navigable controls and visible focus states.</li>
            <li>Sufficient color contrast and scalable text.</li>
            <li>Alt text for informative images; captions or transcripts where applicable.</li>
            <li>Ongoing testing and remediation as we add new features.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">Compatibility &amp; Assistive Tech</h2>
          <p>Our site aims to work with current versions of major browsers and assistive technologies. Some older browsers or custom settings may reduce functionality.</p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">Feedback &amp; Support</h2>
          <p>If you experience difficulty or have suggestions to improve accessibility, please contact us:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Email: <a className="underline" href={`mailto:${EMAIL}`}>{EMAIL}</a></li>
            <li>Phone: {PHONE} (voice/SMS)</li>
            <li>Mailing address: {ADDRESS_LINE}</li>
          </ul>
          <p className="mt-2">We aim to respond within {RESPONSE_TIME} business days.</p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">Ongoing Commitment</h2>
          <p>We review our site regularly and train our team to maintain and improve accessibility across our digital and in-vehicle services.</p>
        </div>
      </section>
    </main>
  );
}

// src/pages/Terms.jsx

// 🔧 Edit these to your real values
const COMPANY_NAME = "Monas Airport Livery";
const EFFECTIVE_DATE = "September 7, 2025";
const LAST_UPDATED = "September 7, 2025";
const EMAIL = "monasairportlivery@gmail.com";
const PHONE = "(617) 319-3204";
const COUNTY = "Middlesex County";
const FREE_CANCEL_HOURS = 24;
const LATE_CANCEL_FEE = "up to the full fare";
const NO_SHOW_GRACE_MIN = 15;
const WAIT_GRACE_MIN = 10;
const WAIT_RATE = "$1.50";
const WAIT_UNIT = "minute";
const EXTRA_STOP_FEE = "$15";

export default function Terms() {
  return (
    <div className="min-h-screen bg-[#0b0f17] text-white/90">
      <main className="mx-auto max-w-3xl px-4 py-10">
        <a href="#/" className="text-sm underline text-white/70">← Back to home</a>
        <h1 className="text-3xl font-semibold mt-2 mb-2">Terms &amp; Conditions</h1>
        <p className="text-sm text-white/60 mb-8">
          Effective: {EFFECTIVE_DATE} • Last updated: {LAST_UPDATED}
        </p>

        <section className="space-y-6">
          <p>
            These Terms govern your use of transportation services provided by{" "}
            <strong>{COMPANY_NAME}</strong> (“we,” “us,” “our”) in Boston, MA and surrounding areas.
            By booking, paying for, or using our service, you agree to these Terms. If you do not agree, please do not use the service.
          </p>

          <div>
            <h2 className="text-xl font-semibold mb-2">1) Bookings, Quotes &amp; Payments</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Quotes.</strong> Online quotes are estimates based on route, date/time, and vehicle. Final price may include tolls, parking, wait time, extra stops, cleaning or damage fees, and surcharges (see below).</li>
              <li><strong>Securing a reservation.</strong> A valid payment method is required to confirm. We may place an authorization hold.</li>
              <li><strong>Changes.</strong> Changes to time, route, stops, or vehicle are subject to availability and may affect price.</li>
              <li><strong>Gratuity.</strong> Optional; if an automatic gratuity or service fee applies, it will be shown before checkout.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">2) Cancellations, No-Shows &amp; Wait Time</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Cancellation window.</strong> Free cancellation until {FREE_CANCEL_HOURS} hours before pickup. After that, {LATE_CANCEL_FEE} may apply.</li>
              <li><strong>No-show.</strong> If we cannot reach you after {NO_SHOW_GRACE_MIN} minutes at the pickup point, the ride may be marked as no-show and up to the full fare charged.</li>
              <li><strong>Wait time.</strong> A grace period of {WAIT_GRACE_MIN} minutes applies. After that, wait time may be billed at {WAIT_RATE} per {WAIT_UNIT}.</li>
              <li><strong>Extra stops.</strong> Additional stops or detours may incur {EXTRA_STOP_FEE} per stop or time/mileage charges.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">3) Airport &amp; Event Policies</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Airport pickups (Logan).</strong> Subject to Massport rules. Meet-and-greet or curbside pickup depends on terminal regulations and traffic control at the time of arrival.</li>
              <li><strong>Flight tracking.</strong> We monitor reported flight delays when possible; substantial schedule changes may require re-confirmation.</li>
              <li><strong>Events.</strong> High-demand periods (conventions, sports, concerts, storms) may have surcharges and stricter cancellation terms.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">4) Passenger Safety &amp; Conduct</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Seat belts.</strong> Required for all passengers.</li>
              <li><strong>Child seats.</strong> Massachusetts law may require appropriate child restraints; please request in advance if needed (fees may apply).</li>
              <li><strong>No smoking/vaping.</strong> Prohibited; a cleaning fee may apply for violations.</li>
              <li><strong>Alcohol &amp; substances.</strong> Open containers or illegal substances are not permitted.</li>
              <li><strong>Service animals.</strong> ADA service animals are welcome. Pets may be permitted with advance notice and carriers.</li>
              <li><strong>Damage &amp; cleaning.</strong> Excessive cleaning or damage may be billed at actual cost plus downtime.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">5) Delays, Routing &amp; Force Majeure</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>We are not responsible for delays due to traffic, weather, road closures, compliance with law-enforcement directions, or other events beyond our control.</li>
              <li>Drivers may adjust routes for safety, efficiency, or regulatory reasons.</li>
              <li>If a vehicle becomes unavailable, we may substitute a comparable vehicle or engage an affiliated operator.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">6) Disclaimers &amp; Liability Limits</h2>
            <p className="mb-2">Except as required by law, services are provided “as available.” To the fullest extent permitted by Massachusetts law:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>We disclaim implied warranties of merchantability and fitness for a particular purpose.</li>
              <li>Our aggregate liability for claims arising from a ride or these Terms will not exceed the total amount paid for the specific booking at issue.</li>
              <li>We are not liable for indirect, incidental, special, or consequential damages.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">7) Governing Law &amp; Disputes</h2>
            <p>
              These Terms are governed by the laws of the Commonwealth of Massachusetts. Venue for any dispute shall be the state or federal courts located in {COUNTY}, Massachusetts, unless otherwise required by law. You agree to personal jurisdiction in Massachusetts.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">8) Updates &amp; Contact</h2>
            <p>We may update these Terms from time to time. Material changes will be posted on this page with a new “Effective” date.</p>
            <p className="mt-2">
              Questions? Contact us at{" "}
              <a className="underline" href={`mailto:${EMAIL}`}>{EMAIL}</a> or {PHONE}.
            </p>
            <p className="mt-2 text-white/60">This content is a general template and not legal advice.</p>
          </div>
        </section>
      </main>
    </div>
  );
}

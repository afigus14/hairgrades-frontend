import React from "react";

export default function RefundPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-10">

      <h1 className="text-4xl font-serif text-[#102A43] mb-6">
        Refund & Cancellation Policy
      </h1>

      <div className="space-y-6 text-gray-700 leading-7">

        <p>
          Stylegrades LLC subscriptions are billed on a recurring monthly basis.
        </p>

        <section>
          <h2 className="text-2xl font-semibold mb-2">
            Subscription Cancellation
          </h2>

          <p>
            Subscribers may cancel at any time through the Stripe Billing Portal.
            Access to paid features remains available through the end of the
            current billing period.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-2">
            Refunds
          </h2>

          <p>
            Stylegrades LLC does not provide prorated refunds, partial refunds, or
            credits for unused subscription time. Payments already processed are
            generally non-refundable except where required by law.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-2">
            Failed Payments
          </h2>

          <p>
            Access to paid features may be limited or suspended if subscription
            payments cannot be successfully processed.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-2">
            Future Billing
          </h2>

          <p>
            Once canceled, future recurring charges stop automatically at the end
            of the active billing period.
          </p>
        </section>

      </div>
    </div>
  );
}
import React from "react";

export default function RefundPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-4xl font-serif text-[#102A43] mb-6">
        Refund & Cancellation Policy
      </h1>

      <div className="space-y-6 text-gray-700 leading-7">

        <p>
          Stylegrades subscriptions may be canceled at any time.
        </p>

        <section>
          <h2 className="text-2xl font-semibold mb-2">
            Subscription Cancellation
          </h2>

          <p>
            When a subscription is canceled, access to paid features will remain
            active until the end of the current billing period.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-2">
            Refunds
          </h2>

          <p>
            Stylegrades does not provide prorated refunds or partial refunds for
            unused subscription time.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-2">
            Future Billing
          </h2>

          <p>
            Once canceled, future subscription charges will stop automatically.
          </p>
        </section>

      </div>
    </div>
  );
}
import React from "react";

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12 text-[#2F3C4F]">

      <h1 className="text-4xl font-serif text-center mb-4">
        Privacy Policy
      </h1>

      <p className="text-center text-lg text-[#52606D] mb-12">
        At Stylegrades, trust is the foundation of everything we do.
      </p>

      {/* TRUST PROMISE */}

      <div className="bg-[#F7FAFC] border border-[#D9E2EC] rounded-2xl p-8 mb-12">

        <h2 className="text-3xl font-serif text-[#102A43] mb-4">
          The Stylegrades™ Trust Promise
        </h2>

        <p className="mb-6">
          Stylegrades was created to help beauty professionals grow their
          businesses—not to profit from their personal information.
        </p>

        <div className="space-y-4">

          <div>
            <strong>✓ We never sell your personal information.</strong>
            <p>
              Your email address, phone number, and account information are never
              sold or rented to advertisers, marketers, or third-party data brokers.
            </p>
          </div>

          <div>
            <strong>✓ We never sell your clients' information.</strong>
            <p>
              Client information submitted for verified reviews is used only to
              deliver the review invitation you request. We never market to your
              clients or add them to mailing lists without their permission.
            </p>
          </div>

          <div>
            <strong>✓ No spam. No hidden agendas.</strong>
            <p>
              Stylegrades does not make money by selling contact lists or personal
              information.
            </p>
          </div>

          <div>
            <strong>✓ Your reputation belongs to you.</strong>
            <p>
              Our mission is to help professionals build trust, attract new
              clients, and grow their businesses—not to exploit their data.
            </p>
          </div>

        </div>

      </div>

      {/* WHY WE COLLECT INFORMATION */}

      <section className="space-y-6">

        <div>

          <h2 className="text-2xl font-semibold mb-2">
            Information We Collect
          </h2>

          <p>
            We may collect names, email addresses, phone numbers, stylist profile
            information, uploaded portfolio photos, subscription information,
            communications submitted through the platform, and client review
            information necessary to operate Stylegrades.
          </p>

        </div>

        <div>

          <h2 className="text-2xl font-semibold mb-2">
            How We Use Your Information
          </h2>

          <p>
            We use your information to operate the platform, manage accounts,
            process subscriptions, deliver verified review invitations, improve
            platform performance, and communicate important account updates.
          </p>

        </div>

        <div>

          <h2 className="text-2xl font-semibold mb-2">
            How Stylegrades Makes Money
          </h2>

          <p>
            Unlike many online platforms, Stylegrades does not generate revenue by
            selling personal information.
          </p>

          <p className="mt-3">
            Our business is supported through professional subscriptions,
            advertising partnerships, and featured business listings.
          </p>

        </div>

        <div>

          <h2 className="text-2xl font-semibold mb-2">
            Payment Processing
          </h2>

          <p>
            Subscription payments are securely processed through Stripe.
            Stylegrades never stores complete credit card numbers.
          </p>

        </div>

        <div>

          <h2 className="text-2xl font-semibold mb-2">
            Third-Party Services
          </h2>

          <p>
            To operate the platform we utilize trusted providers including Stripe,
            Supabase, Cloudinary, and Resend. These providers receive only the
            information necessary to perform their services.
          </p>

        </div>

        <div>

          <h2 className="text-2xl font-semibold mb-2">
            Data Sharing
          </h2>

          <p>
            Stylegrades does not sell personal information.
          </p>

          <p className="mt-3">
            Information is shared only when necessary to operate the platform,
            process payments, deliver email communications you request, or comply
            with applicable laws.
          </p>

        </div>

        <div>

          <h2 className="text-2xl font-semibold mb-2">
            Security
          </h2>

          <p>
            We use commercially reasonable safeguards to protect user information
            and continuously work to maintain the security of the Stylegrades
            platform.
          </p>

        </div>

        <div>

          <h2 className="text-2xl font-semibold mb-2">
            Your Choices
          </h2>

          <p>
            You may update your profile information at any time. If you have
            questions regarding your account or privacy, please contact us through
            the Stylegrades Contact page.
          </p>

        </div>

      </section>

      <div className="mt-12 p-6 bg-[#FFF8E8] border border-[#F7D070] rounded-xl">

        <p className="font-semibold text-[#7A5C00]">
          Our Commitment
        </p>

        <p className="mt-2">
          <strong>Your trust is worth more than your data.</strong> Every decision
          we make is guided by one simple principle: help beauty professionals
          grow their businesses while respecting the privacy of both stylists and
          clients.
        </p>

      </div>

    </div>
  );
}
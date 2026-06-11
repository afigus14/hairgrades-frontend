import React from "react";

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12 text-[#2F3C4F]">

      <h1 className="text-4xl font-serif mb-6">
        Privacy Policy
      </h1>

      <div className="space-y-6 leading-relaxed">

        <p>
          Stylegrades LLC respects your privacy and is committed to protecting your
          personal information when you use the Stylegrades platform.
        </p>

        <div>
          <h2 className="text-2xl font-semibold mb-2">
            Information We Collect
          </h2>

          <p>
            We may collect names, email addresses, phone numbers, stylist profile
            information, uploaded photos, subscription information, and
            communications submitted through the platform.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-2">
            How Information Is Used
          </h2>

          <p>
            Information collected through Stylegrades may be used to operate the
            platform, process subscriptions, manage accounts, improve user
            experience, and communicate important updates.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-2">
            Payment Processing
          </h2>

          <p>
            Payments are securely processed through Stripe. Stylegrades LLC does not
            store complete credit card information.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-2">
            Third-Party Service Providers
          </h2>

          <p>
            Stylegrades LLC utilizes trusted third-party providers including Stripe,
            Supabase, and Cloudinary to operate the platform.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-2">
            Data Sharing
          </h2>

          <p>
            Stylegrades LLC does not sell personal information to third parties.
            Information may be shared only when necessary to operate the platform
            or comply with legal obligations.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-2">
            Security
          </h2>

          <p>
            Reasonable measures are used to protect user information and maintain
            platform security.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-2">
            Contact
          </h2>

          <p>
            Questions regarding this Privacy Policy may be submitted through the
            Stylegrades Contact page.
          </p>
        </div>

      </div>
    </div>
  );
}
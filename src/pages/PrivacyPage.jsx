import React from "react";

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12 text-[#2F3C4F]">

      <h1 className="text-4xl font-serif mb-6">
        Privacy Policy
      </h1>

      <div className="space-y-6 leading-relaxed">

        <p>
          Stylegrades respects your privacy and is committed to protecting your
          personal information.
        </p>

        <div>
          <h2 className="text-2xl font-semibold mb-2">
            Information We Collect
          </h2>

          <p>
            We may collect information such as your name, email address,
            stylist profile details, uploaded photos, payment information,
            and communications submitted through the platform.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-2">
            How Information Is Used
          </h2>

          <p>
            Information collected through Stylegrades is used to provide
            platform functionality, improve user experience, process
            subscriptions, and communicate important updates.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-2">
            Data Sharing
          </h2>

          <p>
            Stylegrades does not sell personal information to third parties.
            Limited information may be shared with trusted service providers
            required to operate the platform.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-2">
            Security
          </h2>

          <p>
            We take reasonable measures to protect user information and
            maintain platform security.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-2">
            Contact
          </h2>

          <p>
            Questions regarding this Privacy Policy may be submitted through
            the Stylegrades contact page.
          </p>
        </div>

      </div>
    </div>
  );
}

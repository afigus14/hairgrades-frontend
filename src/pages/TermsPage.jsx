import React from "react";

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 text-[#2F3C4F]">

      <h1 className="text-4xl font-serif mb-6">
        Terms of Service
      </h1>

      <div className="space-y-6 leading-relaxed">

        <p>
          Welcome to Stylegrades. By accessing or using the Stylegrades platform,
          you agree to comply with and be bound by these Terms of Service. These Terms
          are provided by Stylegrades LLC, the owner and operator of the platform.
        </p>

        <div>
          <h2 className="text-2xl font-semibold mb-2">
            Platform Purpose
          </h2>

          <p>
            Stylegrades is an online platform that allows users to discover,
            review, and connect with hairstylists, salons, and beauty professionals.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-2">
            User Accounts
          </h2>

          <p>
            Users are responsible for maintaining the confidentiality of their
            login credentials and for all activity occurring under their account.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-2">
            Stylist Profiles
          </h2>

          <p>
            Stylist profiles may be reviewed, approved, edited, suspended, or
            removed by Stylegrades LLC at its sole discretion.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-2">
            Reviews and Content
          </h2>

          <p>
            Users agree to provide honest and accurate reviews. Stylegrades LLC
            reserves the right to remove content that is fraudulent,
            misleading, offensive, or otherwise inappropriate.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-2">
            Subscription Services
          </h2>

          <p>
            Certain features require a paid subscription. Subscription fees are
            billed through Stripe and renew automatically unless canceled before
            the next billing cycle.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-2">
            Limitation of Liability
          </h2>

          <p>
            Stylegrades LLC is not responsible for the quality, safety, results, or
            satisfaction associated with services provided by independent beauty
            professionals listed on the platform.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-2">
            Contact
          </h2>

          <p>
            Questions regarding these Terms may be submitted through the
            Stylegrades Contact page.
          </p>
        </div>

      </div>
    </div>
  );
}
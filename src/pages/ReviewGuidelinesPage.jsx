import React from "react";

export default function ReviewGuidelinesPage() {
  return (
    <div className="bg-white">
      <div className="max-w-4xl mx-auto px-6 py-14 md:py-20">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#D8B15A] mb-3">
            Review Integrity
          </p>

          <h1 className="text-3xl md:text-4xl font-serif font-semibold text-[#102A43] mb-6">
            Why You Can Trust Stylegrades™ Reviews
          </h1>

          <p className="text-lg leading-8 text-[#334E68] mb-10">
            Finding the right beauty professional is personal. That&apos;s why
            Stylegrades™ takes steps to protect the quality, authenticity, and
            integrity of the reviews on our platform.
          </p>

          <div className="space-y-8">
            <ReviewStandard title="Reviews must be verified before publication.">
              Reviewers are required to complete Stylegrades™ verification
              before a review can be published.
            </ReviewStandard>

            <ReviewStandard title="Reviews are reviewed for authenticity and compliance.">
              We monitor reviews for inappropriate content, harassment, fraud,
              conflicts of interest, and other violations of our review
              guidelines.
            </ReviewStandard>

            <ReviewStandard title="Beauty professionals cannot buy better ratings or positive reviews.">
              Advertising, placement, or a paid Stylegrades™ plan does not
              influence a professional&apos;s rating or the content of client
              reviews.
            </ReviewStandard>

            <ReviewStandard title="Beauty professionals cannot pay to remove negative reviews.">
              Reviews are held to the same standards regardless of whether
              they are positive or negative.
            </ReviewStandard>

            <ReviewStandard title="Fraudulent reviews are not permitted.">
              Reviews determined to be fraudulent or in violation of our
              guidelines may be rejected or removed.
            </ReviewStandard>

            <ReviewStandard title="Reviewer contact information is never displayed publicly.">
              Information collected for verification is kept private and is
              not displayed on the beauty professional&apos;s public profile.
            </ReviewStandard>
          </div>

          <div className="mt-12 rounded-2xl border border-[#D8B15A]/40 bg-[#FFFDF8] p-6 md:p-8">
            <h2 className="text-xl font-semibold text-[#102A43] mb-3">
              Our goal is simple.
            </h2>

            <p className="leading-7 text-[#334E68]">
              Help clients make informed decisions while giving beauty
              professionals a fair and trustworthy place to build their
              reputations.
            </p>
          </div>

          <div className="mt-10 border-t border-gray-200 pt-8">
            <h2 className="text-xl font-semibold text-[#102A43] mb-3">
              What “Verified Client Review” Means
            </h2>

            <p className="leading-7 text-[#334E68]">
              A Verified Client Review has completed the Stylegrades™
              verification process before publication. Verification helps us
              protect the integrity of the review system, but it does not mean
              that Stylegrades™ endorses the opinions expressed in an
              individual review.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ReviewStandard({ title, children }) {
  return (
    <div className="flex gap-4">
      <div className="flex-shrink-0 mt-1 w-7 h-7 rounded-full bg-[#102A43] text-white flex items-center justify-center text-sm font-bold">
        ✓
      </div>

      <div>
        <h2 className="text-lg font-semibold text-[#102A43] mb-1">
          {title}
        </h2>

        <p className="leading-7 text-[#52606D]">
          {children}
        </p>
      </div>
    </div>
  );
}
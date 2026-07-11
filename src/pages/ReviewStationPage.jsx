import QRCode from "react-qr-code";
import { useLocation } from "react-router-dom";

export default function ReviewStationPage() {
  const { state } = useLocation();

  const stylist = state?.stylist;

  if (!stylist) {
    return (
      <div className="max-w-xl mx-auto py-24 text-center">
        Review Station not found.
      </div>
    );
  }

  const reviewLink =
    `${window.location.origin}/#/review/${stylist.profile_slug}`;

  return (
    <div className="min-h-screen bg-[#EEF8FA] py-16">
        
        <div className="mb-10 flex justify-center gap-4 print:hidden">

            <button
                onClick={() => window.print()}
                className="rounded-xl bg-[#102A43] px-6 py-3 text-white font-semibold hover:bg-[#1B3A57]"
            >
                🖨 Print Review Station™
            </button>

            <button
                onClick={() => window.history.back()}
                className="rounded-xl border border-[#102A43] bg-white px-6 py-3 font-semibold text-[#102A43] hover:bg-slate-50"
            >
                ← Back to Dashboard
            </button>

            </div>

        <div className="mx-auto max-w-xl flex justify-center">

            <div className="w-full max-w-[520px] rounded-[32px] bg-white shadow-2xl overflow-hidden">

          {/* Gold Accent */}

          <div className="h-3 bg-[#D8B15A]" />

          {/* Body */}

          <div className="p-14 text-center">

            <img
              src="/assets/branding/stylegrades-logo.png"
              alt="Stylegrades"
              className="mx-auto h-16"
            />

            <p className="mt-8 text-lg font-semibold tracking-[0.3em] uppercase text-[#D8B15A]">
                REVIEW STATION™
            </p>

            <h2 className="mt-6 text-5xl font-serif font-bold leading-tight text-[#102A43]">
                Love Your New Look?
            </h2>

            <p className="mt-5 text-lg text-[#52606D]">
                If you loved your visit, we'd love to hear about it.
            </p>

            <img
              src={stylist.photo_url}
              alt={stylist.full_name}
              className="mx-auto mt-10 h-44 w-44 rounded-full object-cover shadow-lg"
            />

            <h2 className="mt-8 text-4xl font-bold text-[#102A43]">
              {stylist.full_name}
            </h2>

            <p className="mt-2 text-2xl text-[#52606D]">
              {stylist.salon_name}
            </p>

            {stylist.verified && (
              <div className="mt-6 inline-flex items-center rounded-full border border-[#D8B15A] bg-[#FFF8E8] px-6 py-2 text-sm font-semibold text-[#8A6A21]">
                ✓ Verified Stylegrades Professional
              </div>
            )}

            <div className="mt-12">

                <div className="mx-auto mb-8 h-px w-32 bg-[#D8B15A]" />

                <p className="text-center text-sm font-semibold uppercase tracking-[0.25em] text-[#D8B15A]">
                    Leave Your Verified Review
                </p>

                <div className="mt-8 flex justify-center">

                    <div className="rounded-3xl border border-[#E6E6E6] bg-white p-6 shadow">

                        <QRCode
                            value={reviewLink}
                            size={280}
                        />

                    </div>

                </div>

            </div>

            <p className="mt-8 text-2xl font-semibold text-[#102A43]">
                Scan to leave your verified review
            </p>

            <p className="mt-3 text-[#52606D] leading-7">
                It only takes about a minute, and your feedback helps future clients choose with confidence.
            </p>

            <div className="mt-10 text-sm text-[#7B8794] leading-6">

              Your verified review helps future clients
              discover trusted beauty professionals.

            </div>

            <div className="mt-12 border-t pt-6">

                <p className="text-sm text-[#7B8794]">
                    Helping clients choose with confidence.
                </p>

                <p className="mt-2 font-semibold tracking-wide text-[#102A43]">
                    stylegrades.com
                </p>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
import QRCode from "react-qr-code";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function ReviewStationPrintPage() {

  const { profileSlug } = useParams();

  const [stylist, setStylist] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStylist() {

      const { data, error } = await supabase
        .from("stylists")
        .select("*")
        .eq("profile_slug", profileSlug)
        .maybeSingle();

      if (error) {
        console.error(error);
      }

      setStylist(data);
      setLoading(false);

    }

    loadStylist();

  }, [profileSlug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading Review Station...
      </div>
    );
  }

  if (!stylist) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Review Station not found.
      </div>
    );
  }

  const reviewLink =
    `${window.location.origin}/#/review/${stylist.profile_slug}`;

  function handlePrint() {
    window.print();
  }

  return (

    <div className="bg-slate-100 py-12 print:bg-white print:py-0">

      <div className="mx-auto max-w-6xl print:max-w-none">

        <div className="mb-10 flex justify-center gap-4 print:hidden">

          <button
            onClick={handlePrint}
            className="rounded-xl bg-[#102A43] px-6 py-3 text-white font-semibold hover:bg-[#1B3A57]"
          >
            🖨 Print Review Station™
          </button>

          <button
            onClick={() => window.history.back()}
            className="rounded-xl border border-[#102A43] bg-white px-6 py-3 font-semibold text-[#102A43]"
          >
            ← Back
          </button>

        </div>

        <div
            id="review-station"
            className="
                mx-auto
                w-[520px]
                rounded-[28px]
                bg-white
                shadow-2xl

                print:w-full
                print:max-w-[7.5in]
                print:rounded-none
                print:shadow-none
            "
        >

          <div className="h-3 rounded-t-[28px] bg-[#D8B15A]" />

          <div className="p-10 text-center">

            <img
              src="/assets/branding/stylegrades-logo.png"
              alt="Stylegrades"
              className="mx-auto h-10"
            />

            <p className="mt-4 text-xs font-semibold tracking-[0.35em] uppercase text-[#C49A3A]">
              STYLEGRADES REVIEW STATION™
            </p>

            <h1 className="mt-5 text-4xl font-serif font-bold text-[#102A43]">
              Love Your New Look?
            </h1>

            <div className="mt-3 text-xl tracking-[0.35em] text-[#D8B15A]">
              ★★★★★
            </div>

            <p className="mt-4 text-[#52606D]">
              Share your experience and help future clients choose with confidence.
            </p>

            <img
              src={stylist.photo_url}
              alt={stylist.full_name}
              className="mx-auto mt-6 h-24 w-24 rounded-full object-cover shadow-md"
            />

            <h2 className="mt-4 text-3xl font-bold text-[#102A43]">
              {stylist.full_name}
            </h2>

            <p className="mt-1 text-lg text-[#52606D]">
              {stylist.salon_name}
            </p>

            <div className="mt-5 inline-flex rounded-full border border-[#D8B15A] bg-[#FFF8E8] px-5 py-2 text-sm font-semibold text-[#8A6A21]">
              ✓ Verified Stylegrades Professional
            </div>

            <div className="mt-4 flex justify-center">

                <div className="rounded-2xl border border-[#D8B15A] bg-white p-4 shadow-sm">

                    <QRCode
                    value={reviewLink}
                    size={180}
                    />

                </div>

            </div>

            <p className="mt-4 text-xl font-semibold text-[#102A43]">
                Scan to Leave Your Verified Review
            </p>

            <p className="mt-2 text-[#52606D]">
                It only takes about one minute.
            </p>

            <div className="mt-5 border-t pt-4">

                <p className="text-sm text-[#7B8794]">
                    Trusted reviews for beauty professionals.
                </p>

                <p className="mt-1 font-semibold tracking-wide">
                    stylegrades.com
                </p>

            </div>

          </div>

        </div>

      </div>

    </div>

  );

}
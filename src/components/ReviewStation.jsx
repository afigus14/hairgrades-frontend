import QRCode from "react-qr-code";

export default function ReviewStation({ stylist, reviewLink }) {
  
    if (!stylist) return null;

    return (
    <div className="mx-auto max-w-md rounded-3xl border border-[#D9E2EC] bg-white p-8 shadow-xl">

      {/* Logo */}
      <div className="text-center">
        <img
          src="/assets/branding/stylegrades-logo.png"
          alt="Stylegrades"
          className="mx-auto h-10"
        />
      </div>

      {/* Title */}
      <div className="mt-6 text-center">

        <h1 className="text-3xl font-serif font-bold text-[#102A43]">
          Love your experience?
        </h1>

        <p className="mt-2 text-[#52606D]">
          Leave a verified review for
        </p>

      </div>

      {/* Stylist */}

      <div className="mt-8 text-center">

        <img
          src={stylist.photo_url}
          alt={stylist.full_name}
          className="mx-auto h-32 w-32 rounded-full object-cover shadow-md"
        />

        <h2 className="mt-5 text-2xl font-bold text-[#102A43]">
          {stylist.full_name}
        </h2>

        <p className="text-lg text-[#52606D]">
          {stylist.salon_name}
        </p>

      </div>

      {/* QR */}

      <div className="mt-8 flex justify-center">

        <div className="rounded-2xl border bg-white p-4 shadow">

          <QRCode
            value={reviewLink}
            size={200}
          />

        </div>

      </div>

      <p className="mt-6 text-center text-[#52606D]">
        Scan to leave a verified review.
      </p>

      <p className="mt-2 text-center text-sm text-[#7B8794]">
        Your feedback helps other clients discover trusted beauty professionals.
      </p>

      <div className="mt-8 text-center text-sm text-[#9AA5B1]">

        stylegrades.com

      </div>

    </div>
  );
}
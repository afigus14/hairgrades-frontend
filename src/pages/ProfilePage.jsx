import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function ProfilePage() {
  const { id } = useParams();
  const [stylist, setStylist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);

  const [selectedImage, setSelectedImage] = useState(null);
  
  const allImages = [
    stylist?.photo_url,
    ...(stylist?.gallery || []),
  ].filter(Boolean);

  const selectedImageIndex =
    allImages.indexOf(selectedImage);

  const averageRating =
    reviews.length > 0
      ? (
          reviews.reduce(
            (sum, review) => sum + review.rating,
            0
          ) / reviews.length
        ).toFixed(1)
      : "0.0";

  function showNextImage() {
    if (selectedImageIndex === -1) return;

    const nextIndex =
      (selectedImageIndex + 1) % allImages.length;

    setSelectedImage(allImages[nextIndex]);
  }

  function showPreviousImage() {
    if (selectedImageIndex === -1) return;

    const prevIndex =
      (selectedImageIndex - 1 + allImages.length) %
      allImages.length;

    setSelectedImage(allImages[prevIndex]);
  }
  
  useEffect(() => {

    function handleKeyDown(e) {

      if (!selectedImage) return;

      if (e.key === "Escape") {
        setSelectedImage(null);
      }

      if (e.key === "ArrowRight") {
        showNextImage();
      }

      if (e.key === "ArrowLeft") {
        showPreviousImage();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };

  }, [selectedImage, selectedImageIndex]);

  useEffect(() => {
    async function fetchStylist() {
      const { data, error } = await supabase
        .from("stylists")
        .select("*")
        .eq("profile_slug", id)
        .single();

      if (error) {
        console.error("Error loading stylist:", error);
      } else {
        setStylist(data);
        document.title =
          `${data.full_name} | Stylegrades`;

        // Load reviews using the actual stylist UUID
        fetchReviews(data.id);
      }

      setLoading(false);
    }

    async function fetchReviews(stylistId) {

      const { data, error } = await supabase
        .from("reviews")
        .select("*")
        .eq("stylist_id", stylistId)
        .eq("status", "approved")
        .order("created_at", {
          ascending: false,
        });

      if (error) {
        console.error(
          "Error loading reviews:",
          error
        );
      } else {
        setReviews(data || []);
      }
    }

    fetchStylist();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 animate-pulse">

        <div className="h-10 w-64 bg-gray-200 rounded mb-6" />

        <div className="w-full max-w-[320px] aspect-square bg-gray-200 rounded-xl mb-6" />

        <div className="h-5 w-40 bg-gray-200 rounded mb-3" />
        <div className="h-5 w-52 bg-gray-200 rounded mb-3" />
        <div className="h-5 w-60 bg-gray-200 rounded mb-6" />

        <div className="space-y-2 mb-8">
          <div className="h-4 bg-gray-200 rounded w-full" />
          <div className="h-4 bg-gray-200 rounded w-full" />
          <div className="h-4 bg-gray-200 rounded w-5/6" />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-10">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="h-32 bg-gray-200 rounded-lg"
            />
          ))}
        </div>

        <div className="bg-white rounded-2xl border shadow-sm p-6">
          <div className="h-6 w-48 bg-gray-200 rounded mb-4" />

          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="border rounded-xl p-4"
              >
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-3" />
                <div className="h-3 bg-gray-200 rounded w-1/4 mb-4" />

                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-full" />
                  <div className="h-3 bg-gray-200 rounded w-full" />
                  <div className="h-3 bg-gray-200 rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    );
  }

  if (!stylist) {
    return <div className="p-10">Stylist not found.</div>;
  }

  const isRegistryUnclaimed =
    stylist.profile_source === "registry_unclaimed";

  if (isRegistryUnclaimed) {
    const licenseState =
      stylist.license_state || stylist.state || "";

    const licenseType =
      stylist.license_type || "Cosmetologist";

    const licenseStatus =
      stylist.license_status || "";

    const registrySource =
      stylist.registry_source || "";

    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#102A43] mb-2">
            Licensed Beauty Professional
          </p>

          <h1 className="text-3xl font-serif text-[#102A43] mb-2">
            {stylist.full_name}
          </h1>

          <p className="text-lg font-medium text-[#243B53]">
            Licensed {licenseType}
          </p>

          {(stylist.city || stylist.state) && (
            <p className="mt-1 text-[#52606D]">
              {[stylist.city, stylist.state]
                .filter(Boolean)
                .join(", ")}
            </p>
          )}

          <div className="mt-8 rounded-2xl border border-[#D9E2EC] bg-white shadow-sm p-6">
            <h2 className="text-xl font-semibold text-[#102A43] mb-4">
              {licenseState === "IL"
                ? "Illinois License Information"
                : "License Information"}
            </h2>

            <div className="space-y-3 text-sm">
              {stylist.license_number && (
                <div>
                  <span className="font-semibold text-[#243B53]">
                    License Number:
                  </span>{" "}
                  <span className="text-[#52606D]">
                    ••••••{String(stylist.license_number).slice(-4)}
                  </span>
                </div>
              )}

              {licenseStatus && (
                <div>
                  <span className="font-semibold text-[#243B53]">
                    License Status:
                  </span>{" "}
                  <span className="text-[#52606D]">
                    {licenseStatus.charAt(0).toUpperCase() +
                      licenseStatus.slice(1).toLowerCase()}
                  </span>
                </div>
              )}
            </div>

            {registrySource && (
              <p className="mt-5 pt-4 border-t border-[#D9E2EC] text-xs leading-5 text-[#7B8794] italic">
                License information obtained from the{" "}
                {registrySource === "Illinois IDFPR"
                  ? "Illinois Department of Financial & Professional Regulation."
                  : `${registrySource}.`}
              </p>
            )}
          </div>

          <div className="mt-6 rounded-2xl border border-[#D9E2EC] bg-[#F8FAFC] p-6">
            <h2 className="text-lg font-semibold text-[#102A43]">
              This professional has not yet claimed their Stylegrades™
              profile.
            </h2>

            <p className="mt-2 text-sm leading-6 text-[#52606D]">
              Claim your profile to add your photo, salon information,
              specialties, portfolio of work, and other professional details.
            </p>

            <div className="mt-5">
              <p className="text-sm font-semibold text-[#243B53] mb-3">
                Are you this professional?
              </p>

              <Link
                to={`/claim-profile/${stylist.profile_slug}`}
                className="inline-flex items-center justify-center rounded-xl bg-[#102A43] px-6 py-3 text-sm font-semibold text-white hover:opacity-95 transition"
              >
                Claim This Profile
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-serif text-[#102A43] mb-6">
        {stylist.full_name}
      </h1>

      {/* PHOTO */}
      {stylist.photo_url && (
        <img
          src={stylist.photo_url}
          alt={stylist.full_name}
          onClick={() =>
            setSelectedImage(stylist.photo_url)
          }
          className="w-full max-w-[320px] h-auto aspect-square object-cover rounded-xl mb-6 cursor-zoom-in transition-transform duration-300 hover:scale-[1.02]"
        />
      )}

      {/* BASIC INFO */}
      <p className="text-lg font-medium text-[#243B53] mb-2">
        {stylist.city}, {stylist.state}
      </p>

      {(stylist.salon_name || stylist.salonName) && (
        <p className="text-lg font-medium text-[#243B53] mb-2">
          {stylist.salon_name || stylist.salonName}
        </p>
      )}

      {stylist.license && (
        <p className="text-sm text-[#52606D]">
          Licensed: {stylist.license}
        </p>
      )}

      {stylist.email && (
        <a
          href={`mailto:${stylist.email}`}
          className="block text-[#1F6FEB] hover:underline mb-4"
        >
          {stylist.email}
        </a>
      )}

      {stylist.phone && (
        <a
          href={`tel:${stylist.phone}`}
          className="block text-[#1F6FEB] hover:underline mb-2"
        >
          {stylist.phone}
        </a>
      )}

      {stylist.website && (
        <a
          href={
            stylist.website.startsWith("http")
              ? stylist.website
              : `https://${stylist.website}`
          }
          target="_blank"
          rel="noreferrer"
          className="block text-[#1F6FEB] hover:underline mb-2"
        >
          Visit Website
        </a>
      )}

      {stylist.instagram && (
        <a
          href={
            stylist.instagram.startsWith("http")
              ? stylist.instagram
              : `https://instagram.com/${stylist.instagram.replace("@", "")}`
          }
          target="_blank"
          rel="noreferrer"
          className="block text-[#1F6FEB] hover:underline mb-2"
        >
          Instagram
        </a>
      )}

      {stylist.facebook && (
        <a
          href={
            stylist.facebook.startsWith("http")
              ? stylist.facebook
              : `https://${stylist.facebook}`
          }
          target="_blank"
          rel="noreferrer"
          className="block text-[#1F6FEB] hover:underline mb-2"
        >
          Facebook
        </a>
      )}

      {/* PROFESSIONAL CREDENTIALS */}
      {(stylist.verified || stylist.certifications) && (
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-[#102A43] mb-3">
            Professional Credentials
          </h3>

          <div className="bg-[#F8FAFC] border border-[#D9E2EC] rounded-xl p-5 space-y-3">

            {stylist.verified && (
              <div className="flex items-center gap-3">
                <img
                  src="/assets/branding/stylegrades-icon.png"
                  alt="Verified by Stylegrades"
                  className="w-8 h-8"
                />

                <div>
                  <div className="font-semibold text-emerald-700">
                    Verified by Stylegrades
                  </div>

                  <div className="text-sm text-[#52606D]">
                    License and professional information verified.
                  </div>
                </div>
              </div>
            )}

            {stylist.certifications &&
              stylist.certifications
                .split("\n")
                .filter((c) => c.trim())
                .map((cert, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 pl-11"
                  >
                    <span className="text-amber-500 text-lg">
                      🏅
                    </span>

                    <span className="text-[#243B53]">
                      {cert}
                    </span>
                  </div>
                ))}

          </div>
        </div>
      )}  

      {/* BIO */}
      {stylist.bio && (
        <p className="text-[#243B53] mb-6">
          {stylist.bio}
        </p>
      )}

      {/* SPECIALTIES */}
      {stylist.specialties && (
        <div className="mb-6">
          <h3 className="font-semibold mb-2">Specialties</h3>
          <ul className="list-disc list-inside">
            {stylist.specialties.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        </div>
      )}

      {/* GALLERY */}
      {stylist.gallery && stylist.gallery.length > 0 && (
        <div>
          <h3 className="font-semibold mb-2">Gallery</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {stylist.gallery.map((img, i) => (
              <img
                key={i}
                src={img}
                alt="work"
                onClick={() => setSelectedImage(img)}
                className="rounded-lg object-cover h-32 w-full cursor-zoom-in transition-transform duration-300 hover:scale-[1.02]"
              />
            ))}
          </div>
        </div>
      )}

      {/* Reviews Section */}
      <div className="mt-10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <h2 className="text-2xl font-serif text-[#102A43]">
            Client Reviews
          </h2>

          <Link
            to={`/review/direct/${stylist.profile_slug}`}
            className="inline-flex items-center justify-center rounded-xl bg-[#102A43] px-5 py-2.5 text-sm font-semibold text-white hover:opacity-95 transition"
          >
            Leave a Review
          </Link>
        </div>

        <div className="bg-white rounded-2xl border shadow-sm p-6">

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <span className="text-3xl font-bold text-[#102A43]">
                {averageRating}
              </span>

              <div>
                <p className="text-[#F4A731] text-lg">
                  {reviews.length > 0
                    ? "★".repeat(
                        Math.round(Number(averageRating))
                      )
                    : "No ratings yet"}
                </p>

                <p className="text-sm text-gray-500">
                  {reviews.length}{" "}
                  {reviews.length === 1 ? "review" : "reviews"}
                </p>
              </div>
            </div>

            <Link
              to="/review-guidelines"
              className="text-sm font-semibold text-[#102A43] underline underline-offset-2 hover:opacity-75"
            >
              Why you can trust our reviews
            </Link>
          </div>

          <div className="border-t pt-4 text-gray-600">
            {reviews.length > 0 ? (
              <div className="space-y-4">

                {reviews.map((review) => {
                  const reviewParts =
                    typeof review.review_text === "string"
                      ? review.review_text.split(/\n\s*\n/)
                      : [];

                  const reviewHeadline =
                    reviewParts.length > 1
                      ? reviewParts[0].trim()
                      : "";

                  const reviewBody =
                    reviewParts.length > 1
                      ? reviewParts.slice(1).join("\n\n").trim()
                      : review.review_text;

                  return (
                    <div
                      key={review.id}
                      className="border rounded-xl p-4 sm:p-5 bg-gray-50"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">

                        <div>
                          <div className="flex items-center gap-2 flex-wrap">

                            <div className="font-semibold text-[#102A43]">
                              {review.reviewer_name}
                            </div>

                            {review.verified_client && (
                              <span className="inline-flex items-center bg-blue-50 text-blue-700 text-[11px] font-semibold px-2 py-0.5 rounded-full border border-blue-100">
                                ✔ Verified Client
                              </span>
                            )}

                          </div>

                          {review.service_date && (
                            <div className="text-xs text-gray-500">
                              Service Date: {review.service_date}
                            </div>
                          )}
                        </div>

                        <div className="text-[#F4A731]">
                          {"★".repeat(Number(review.rating) || 0)}
                        </div>

                      </div>

                      {reviewHeadline && (
                        <h4 className="font-semibold text-[#102A43] mt-3 mb-1">
                          {reviewHeadline}
                        </h4>
                      )}

                      <p className="text-gray-700 whitespace-pre-line">
                        {reviewBody}
                      </p>

                      {review.stylist_response && (
                        <div className="mt-4 ml-4 border-l-4 border-[#F4A731] pl-4">
                          <div className="text-sm font-semibold text-[#102A43] mb-1">
                            Response from {stylist.full_name}
                          </div>

                          <p className="text-gray-700">
                            {review.stylist_response}
                          </p>

                          {review.stylist_response_date && (
                            <div className="text-xs text-gray-500 mt-1">
                              {new Date(
                                review.stylist_response_date
                              ).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}

              </div>
            ) : (
              <div className="text-center py-10 px-4">

                <div className="text-5xl mb-4">
                  ✨
                </div>

                <h3 className="text-xl font-semibold text-[#102A43] mb-2">
                  No reviews yet
                </h3>

                <p className="text-gray-500 max-w-md mx-auto mb-5">
                  Be the first to share your experience with{" "}
                  {stylist.full_name}.
                </p>

                <Link
                  to={`/review/direct/${stylist.profile_slug}`}
                  className="inline-flex items-center justify-center rounded-xl bg-[#102A43] px-5 py-2.5 text-sm font-semibold text-white hover:opacity-95 transition"
                >
                  Leave the First Review
                </Link>

                <div className="mt-4">
                  <Link
                    to="/review-guidelines"
                    className="text-sm font-medium text-[#102A43] underline underline-offset-2"
                  >
                    Learn how Stylegrades™ verifies reviews
                  </Link>
                </div>

              </div>
            )}
          </div>
        </div>
      </div>

      {selectedImage && (

        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setSelectedImage(null)}
        >

          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-4 right-4 text-white text-4xl leading-none hover:opacity-70 transition"
          >
            ×
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              showPreviousImage();
            }}
            className="absolute left-4 md:left-8 text-white text-5xl hover:opacity-70 transition"
          >
            ‹
          </button>

          <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-50 bg-black/60 text-white text-sm px-4 py-1.5 rounded-full backdrop-blur-md">
            {selectedImageIndex + 1} / {allImages.length}
          </div>

          <img
            src={selectedImage}
            alt="Enlarged"
            className="max-w-full max-h-[90vh] rounded-2xl shadow-[0_25px_80px_rgba(0,0,0,0.65)]"
            onClick={(e) => e.stopPropagation()}
          />

          <button
            onClick={(e) => {
              e.stopPropagation();
              showNextImage();
            }}
            className="absolute right-4 md:right-8 text-white text-5xl hover:opacity-70 transition"
          >
            ›
          </button>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 overflow-x-auto max-w-[90vw] px-2 py-2">

            {allImages.map((img, index) => (

              <img
                key={index}
                src={img}
                alt={`Thumbnail ${index + 1}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedImage(img);
                }}
                className={`h-14 w-14 object-cover rounded-lg cursor-pointer border-2 transition ${
                  selectedImage === img
                    ? "border-white scale-105"
                    : "border-transparent opacity-70 hover:opacity-100"
                }`}
              />

            ))}

          </div>

        </div>

      )}

    </div>
  );
}
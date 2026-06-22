import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

const CLOUD_NAME =
  import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;

const PRESET =
  import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

async function uploadToCloudinary(file) {

  const form = new FormData();

  form.append("file", file);
  form.append("upload_preset", PRESET);
  form.append(
    "folder",
    "stylegrades/advertisers"
  );

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`,
    {
      method: "POST",
      body: form,
    }
  );

  const data = await res.json();

  if (!res.ok) {
    throw new Error(
      data?.error?.message ||
      "Upload failed"
    );
  }

  return data.secure_url;
}

  export default function AdminAdvertisersPage() {
  const [advertisers, setAdvertisers] = useState([]);

  const [editingAdvertiser, setEditingAdvertiser] = useState(null);

  const [uploadingImage, setUploadingImage] =
    useState(false);

  async function loadAdvertisers() {
    const { data, error } = await supabase
      .from("advertisers")
      .select("*")
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      console.error(error);
      return;
    }

    setAdvertisers(data || []);
  }

  async function updateStatus(id, status) {

    const adminKey =
      localStorage.getItem("stylegrades_admin_key");

    const res = await fetch(
      "https://stylegrades-api.vercel.app/api/advertiserAction",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          "x-admin-key": adminKey,
        },

        body: JSON.stringify({
          id,
          action:
            status === "approved"
              ? "approve"
              : "reject",
        }),
      }
    );

    const data = await res.json();

    if (!res.ok) {
      alert(data.error || "Server error");
      return;
    }

    loadAdvertisers();
  }

  async function saveAdvertiser() {

    console.log("SAVE ADVERTISER CALLED");

    const adminKey =
      localStorage.getItem(
        "stylegrades_admin_key"
      );

    console.log("LOCAL STORAGE KEY:", adminKey); 

    console.log(
      "REQUEST HEADERS:",
      {
        "Content-Type": "application/json",
        "x-admin-key": adminKey,
      }
    );

    const res = await fetch(
      "https://stylegrades-api.vercel.app/api/updateAdvertiser",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          "x-admin-key": adminKey,
        },

        body: JSON.stringify({
          id: editingAdvertiser.id,
          headline:
            editingAdvertiser.headline,
          cta:
            editingAdvertiser.cta,
          body:
            editingAdvertiser.body,
          website:
            editingAdvertiser.website,
          image_url:
            editingAdvertiser.image_url,
          is_founding_partner:
            editingAdvertiser.is_founding_partner,
        }),
      }
    );

    console.log("RESPONSE STATUS:", res.status);

    const data = await res.json();

    if (!res.ok) {
      alert(data.error || "Server error");
      return;
    }

    alert("Advertiser updated!");

    setEditingAdvertiser(null);

    loadAdvertisers();
  }

  async function handleImageUpload(e) {

    const file = e.target.files?.[0];

    if (!file) return;

    try {

      setUploadingImage(true);

      const imageUrl =
        await uploadToCloudinary(file);

      setEditingAdvertiser({
        ...editingAdvertiser,
        image_url: imageUrl,
      });

    } catch (err) {

      alert(
        err.message ||
        "Image upload failed"
      );

    } finally {

      setUploadingImage(false);

    }
  }

  useEffect(() => {
    loadAdvertisers();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">

      <h1 className="text-3xl font-bold mb-6">
        Advertiser Management
      </h1>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">

        <div className="bg-white rounded-xl shadow-sm border p-4">
          <div className="text-sm text-gray-500">
            Total Advertisers
          </div>

          <div className="text-3xl font-bold">
            {advertisers.length}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-4">
          <div className="text-sm text-gray-500">
            Active
          </div>

          <div className="text-3xl font-bold">
            {
              advertisers.filter(
                a => a.subscription_status === "active"
              ).length
            }
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-4">
          <div className="text-sm text-gray-500">
            Founding Advertisers
          </div>

          <div className="text-3xl font-bold">
            {
              advertisers.filter(
                a => a.is_founding_partner
              ).length
            }
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-4">
          <div className="text-sm text-gray-500">
            Pending
          </div>

          <div className="text-3xl font-bold">
            {
              advertisers.filter(
                a => a.status === "pending"
              ).length
            }
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-4">
          <div className="text-sm text-gray-500">
            Monthly Revenue
          </div>

          <div className="text-3xl font-bold">
            $
            {
              advertisers.reduce((sum, a) => {

                if (
                  a.subscription_status !==
                  "active"
                ) {
                  return sum;
                }

                if (
                  a.placement_type ===
                  "featured"
                ) {
                  return sum + 99;
                }

                return sum + 49;

              }, 0)
            }
          </div>
        </div>

      </div>

      <div className="space-y-4">

        {advertisers.map((advertiser) => (

          <div
            key={advertiser.id}
            className="bg-white border rounded-xl p-5 shadow-sm"
          >

            <div className="grid md:grid-cols-2 gap-4">

              <div>
                <p>
                  <strong>Company:</strong>{" "}
                  {advertiser.company_name}
                </p>

                <p>
                  <strong>Email:</strong>{" "}
                  {advertiser.contact_email}
                </p>

                <p>
                  <strong>Website:</strong>{" "}
                  {advertiser.website}
                </p>

                <p>
                  <strong>Headline:</strong>{" "}
                  {advertiser.headline}
                </p>

                <p>
                  <strong>CTA:</strong>{" "}
                  {advertiser.cta}
                </p>

                {advertiser.image_url && (
                  <img
                    src={advertiser.image_url}
                    alt={advertiser.company_name}
                    className="mt-3 h-24 w-auto rounded-lg border"
                  />
                )}
              </div>

              <div>
                <p>
                  <strong>Placement:</strong>{" "}
                  {advertiser.placement_type}
                </p>

                <p>
                  <strong>Status:</strong>{" "}
                  {advertiser.status}
                </p>

                <p>
                  <strong>Subscription:</strong>{" "}
                  {advertiser.subscription_status}
                </p>

                <p>
                  <strong>Targeting:</strong>{" "}
                  {advertiser.targeting_type}
                </p>

                <p>
                  <strong>Priority:</strong>{" "}
                  {advertiser.priority_level}
                </p>

                <p>
                  <strong>Impressions:</strong>{" "}
                  {advertiser.impressions || 0}
                </p>

                <p>
                  <strong>Clicks:</strong>{" "}
                  {advertiser.clicks || 0}
                </p>

                <p>
                  <strong>CTR:</strong>{" "}
                  {advertiser.impressions > 0
                    ? (
                        (advertiser.clicks /
                          advertiser.impressions) *
                        100
                      ).toFixed(2)
                    : "0.00"}
                  %
                </p>

                <p>
                  <strong>Stripe Customer:</strong>{" "}
                  {advertiser.stripe_customer_id || "—"}
                </p>

                <p>
                  <strong>Stripe Subscription:</strong>{" "}
                  {advertiser.stripe_subscription_id || "—"}
                </p>

                <p>
                  <strong>Target City:</strong>{" "}
                  {advertiser.target_city || "—"}
                </p>

                <p>
                  <strong>Target State:</strong>{" "}
                  {advertiser.target_state || "—"}
                </p>

                <p>
                  <strong>Target Zip:</strong>{" "}
                  {advertiser.target_zip || "—"}
                </p>

                <p>
                  <strong>Radius:</strong>{" "}
                  {advertiser.radius_miles || "—"}
                </p>
                
              </div>

            </div>

            <div className="mt-4 flex gap-3 flex-wrap">

              <button
                onClick={() =>
                  updateStatus(
                    advertiser.id,
                    "approved"
                  )
                }
                className="px-4 py-2 bg-green-600 text-white rounded-lg"
              >
                Approve
              </button>

              <button
                onClick={() =>
                  updateStatus(
                    advertiser.id,
                    "rejected"
                  )
                }
                className="px-4 py-2 bg-red-600 text-white rounded-lg"
              >
                Reject
              </button>

              <button
                onClick={() =>
                  setEditingAdvertiser(advertiser)
                }
                className="px-4 py-2 bg-blue-600 text-white rounded-lg"
              >
                Edit
              </button>

              <button
                onClick={() => {
                  console.log("BILLING CLICKED");
                }}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg"
              >
                Billing
              </button>

            </div>

          </div>

        ))}

      </div>

      {editingAdvertiser && (
        <div className="mt-8 bg-white border rounded-xl p-6 shadow-sm">

          <h2 className="text-2xl font-bold mb-4">
            Edit Advertiser
          </h2>

          <p>
            <strong>Company:</strong>{" "}
            {editingAdvertiser.company_name}
          </p>

          <div className="mt-4">
            <label className="block font-semibold mb-1">
              Headline
            </label>

            <input
              type="text"
              value={editingAdvertiser.headline || ""}
              onChange={(e) =>
                setEditingAdvertiser({
                  ...editingAdvertiser,
                  headline: e.target.value,
                })
              }
              className="w-full border rounded-lg p-2"
            />
          </div>

          <div className="mt-4">
            <label className="block font-semibold mb-1">
              CTA
            </label>

            <input
              type="text"
              value={editingAdvertiser.cta || ""}
              onChange={(e) =>
                setEditingAdvertiser({
                  ...editingAdvertiser,
                  cta: e.target.value,
                })
              }
              className="w-full border rounded-lg p-2"
            />
          </div>

          <div className="mt-4">
            <label className="block font-semibold mb-1">
              Body Text
            </label>

            <textarea
              value={editingAdvertiser.body || ""}
              onChange={(e) =>
                setEditingAdvertiser({
                  ...editingAdvertiser,
                  body: e.target.value,
                })
              }
              className="w-full border rounded-lg p-2"
              rows={4}
            />
          </div>

          <div className="mt-4">
            <label className="block font-semibold mb-1">
              Website URL
            </label>

            <input
              type="text"
              value={editingAdvertiser.website || ""}
              onChange={(e) =>
                setEditingAdvertiser({
                  ...editingAdvertiser,
                  website: e.target.value,
                })
              }
              className="w-full border rounded-lg p-2"
            />
          </div>

          <div className="mt-4">
            <label className="block font-semibold mb-1">
              Image URL
            </label>

            <input
              type="text"
              value={editingAdvertiser.image_url || ""}
              onChange={(e) =>
                setEditingAdvertiser({
                  ...editingAdvertiser,
                  image_url: e.target.value,
                })
              }
              className="w-full border rounded-lg p-2"
            />
          </div>

          <div className="mt-3">

            <label className="inline-flex items-center gap-2 cursor-pointer">

              <span className="px-3 py-2 border rounded-lg bg-white hover:bg-gray-50 text-sm">
                Upload New Image
              </span>

              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />

            </label>

            {uploadingImage && (
              <p className="text-sm text-gray-500 mt-2">
                Uploading...
              </p>
            )}

          </div>

          {editingAdvertiser.image_url && (
            <div className="mt-4">
              <p className="font-semibold mb-2">
                Image Preview
              </p>

              <img
                src={editingAdvertiser.image_url}
                alt="Preview"
                className="h-40 rounded-lg border"
              />
            </div>
          )}
          
          <div className="mt-4">
            <label className="flex items-center gap-2">

              <input
                type="checkbox"
                checked={
                  editingAdvertiser.is_founding_partner || false
                }
                onChange={(e) =>
                  setEditingAdvertiser({
                    ...editingAdvertiser,
                    is_founding_partner: e.target.checked,
                  })
                }
              />

              Founding Advertiser
            </label>
          </div>

          <button
            onClick={saveAdvertiser}
            className="mt-4 mr-3 px-4 py-2 bg-green-600 text-white rounded-lg"
          >
            Save Changes
          </button>

          <button
            onClick={() =>
              setEditingAdvertiser(null)
            }
            className="mt-4 px-4 py-2 bg-gray-600 text-white rounded-lg"
          >
            Close
          </button>

        </div>
      )}

    </div>
  );
}
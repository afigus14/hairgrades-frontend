// src/pages/AdminEditStylistPage.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

function getGalleryLimit(tier) {
  if (tier === "premium") return 20;
  if (tier === "pro") return 12;
  return 3;
}

export default function AdminEditStylistPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [original, setOriginal] = useState(null);
  const [stylist, setStylist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [dragIndex, setDragIndex] = useState(null);
  const [tierActive, setTierActive] = useState("free");

  useEffect(() => {
  async function loadStylist() {

    const { data, error } = await supabase
      .from("stylists")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error loading stylist:", error);
      setStylist(null);
    } else {
      setOriginal(data);

      setStylist({
        ...data,
        fullName: data.full_name,
        photoUrl: data.photo_url,
        gallery: data.gallery || []
      });

      setTierActive(data.tier || "free");
    }

    setLoading(false);
  }

  loadStylist();
}, [id]);

  function showToast(type, message) {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  }

  // ----------------------------
  // Save 
  // ----------------------------
  async function saveChanges() {

    if (!stylist) return;

    setSaving(true);

    console.log("Tier being saved:", stylist.tier);
    
    const { error } = await supabase
      .from("stylists")
      .update({
        full_name: stylist.fullName,
        bio: stylist.bio,
        salon_name: stylist.salon_name,
        phone: stylist.phone,
        website: stylist.website,
        instagram: stylist.instagram,
        years_experience: stylist.years_experience,

        license: stylist.license,
        license_url: stylist.license_url,
        
        verified: stylist.verified,
        tier: tierActive,
        featured: stylist.featured,
        gallery: stylist.gallery,
        photo_url: stylist.photoUrl
      })
      .eq("id", stylist.id);

    if (error) {
      console.error(error);
      showToast("error", "Save failed");
    } else {
      showToast("success", "Changes saved");

      // update local copy so it doesn't revert
      setOriginal(stylist);
    }

    setSaving(false);
  }

  // ----------------------------
  // Local Image Upload (Preview Only)
  // ----------------------------
  function handleImageUpload(file, field) {
    const reader = new FileReader();
    reader.onload = () => {
      setStylist({
        ...stylist,
        [field]: reader.result,
      });
    };
    reader.readAsDataURL(file);
  }

  function handleGalleryUpload(files) {
    const limit = getGalleryLimit(stylist.tier)
    const current = stylist.gallery || [];

    if (current.length >= limit) {
      showToast(
        "error",
        `Gallery limit reached (${limit} images)`
      );
      return;
    }

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        setStylist((prev) => ({
          ...prev,
          gallery: [...(prev.gallery || []), reader.result],
        }));
      };
      reader.readAsDataURL(file);
    });
  }

  // ----------------------------
  // Drag Reorder
  // ----------------------------
  function handleDragStart(index) {
    setDragIndex(index);
  }

  function handleDrop(index) {
    const updated = [...stylist.gallery];
    const [moved] = updated.splice(dragIndex, 1);
    updated.splice(index, 0, moved);

    setStylist({
      ...stylist,
      gallery: updated,
    });
    setDragIndex(null);
  }

  if (loading)
    return <div className="p-10">Loading...</div>;

  if (!stylist)
    return <div className="p-10">Stylist not found.</div>;

  const galleryLimit = getGalleryLimit(stylist?.tier);

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      {toast && (
        <div
          className={`fixed top-6 right-6 px-5 py-3 rounded-lg shadow-lg text-sm z-50 ${
            toast.type === "success"
              ? "bg-green-600 text-white"
              : toast.type === "error"
              ? "bg-red-600 text-white"
              : "bg-gray-700 text-white"
          }`}
        >
          {toast.message}
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-12">
        {/* LEFT COLUMN */}
        <div className="space-y-8">
          <div className="flex justify-between items-center">
            <button
              onClick={() => navigate(-1)}
              className="text-sm underline"
            >
              ← Back
            </button>

            <button
              onClick={saveChanges}
              disabled={saving}
              className="px-6 py-2 bg-black text-white rounded-lg"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>

          <h1 className="text-3xl font-bold">
            Edit {stylist.fullName || stylist.full_name}
          </h1>

          {/* BASIC INFO */}
          <section className="bg-white border rounded-xl p-6 space-y-4">
            <h2 className="text-xl font-semibold">
              Basic Information
            </h2>

            <input
              value={stylist.fullName || ""}
              onChange={(e) =>
                setStylist({
                  ...stylist,
                  fullName: e.target.value,
                })
              }
              className="w-full border rounded-lg px-3 py-2"
            />

            <textarea
              rows={4}
              value={stylist.bio || ""}
              onChange={(e) =>
                setStylist({
                  ...stylist,
                  bio: e.target.value,
                })
              }
              className="w-full border rounded-lg px-3 py-2"
            />
          </section>

          {/* BUSINESS DETAILS */}
          <section className="bg-white border rounded-xl p-6 space-y-4">
            <h2 className="text-xl font-semibold">
              Business Details
            </h2>

            <input
              value={stylist.salon_name || ""}
              onChange={(e) =>
                setStylist({
                  ...stylist,
                  salon_name: e.target.value,
                })
              }
              placeholder="Salon Name"
              className="w-full border rounded-lg px-3 py-2"
            />

            <input
              value={stylist.phone || ""}
              onChange={(e) =>
                setStylist({
                  ...stylist,
                  phone: e.target.value,
                })
              }
              placeholder="Phone"
              className="w-full border rounded-lg px-3 py-2"
            />

            <input
              value={stylist.website || ""}
              onChange={(e) =>
                setStylist({
                  ...stylist,
                  website: e.target.value,
                })
              }
              placeholder="Website"
              className="w-full border rounded-lg px-3 py-2"
            />

            <input
              value={stylist.instagram || ""}
              onChange={(e) =>
                setStylist({
                  ...stylist,
                  instagram: e.target.value,
                })
              }
              placeholder="Instagram"
              className="w-full border rounded-lg px-3 py-2"
            />

            <input
              value={stylist.years_experience || ""}
              onChange={(e) =>
                setStylist({
                  ...stylist,
                  years_experience: e.target.value,
                })
              }
              placeholder="Years Experience"
              className="w-full border rounded-lg px-3 py-2"
            />
          </section>

          <section className="bg-white border rounded-xl p-6 space-y-4">
            <h2 className="text-xl font-semibold">
              Professional Information
            </h2>

            <input
              value={stylist.license || ""}
              onChange={(e) =>
                setStylist({
                  ...stylist,
                  license: e.target.value,
                })
              }
              placeholder="License Number"
              className="w-full border rounded-lg px-3 py-2"
            />

            {stylist.license_url && (
              <a
                href={stylist.license_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block text-blue-600 underline"
              >
                View Uploaded License
              </a>
            )}

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={stylist.verified || false}
                onChange={(e) =>
                  setStylist({
                    ...stylist,
                    verified: e.target.checked,
                  })
                }
              />
              Verified Stylist
            </label>
          </section>

          <section className="bg-white border rounded-xl p-6 space-y-4">
            <h2 className="text-xl font-semibold">Tier Settings</h2>

            <select
              value={tierActive}
              onChange={(e) => setTierActive(e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
            >
              <option value="free">Free</option>
              <option value="pro">Pro</option>
              <option value="premium">Premium</option>
            </select>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={stylist.featured || false}
                onChange={(e) =>
                  setStylist({ ...stylist, featured: e.target.checked })
                }
              />
              Featured stylist
            </label>
          </section>

          {/* MAIN PHOTO */}
          <section className="bg-white border rounded-xl p-6 space-y-4">
            <h2 className="text-xl font-semibold">
              Main Photo
            </h2>

            {stylist.photoUrl && (
              <img
                src={stylist.photoUrl}
                alt=""
                className="w-32 h-32 object-cover rounded-lg"
              />
            )}

            <input
              type="file"
              accept="image/*"
              onChange={(e) =>
                handleImageUpload(
                  e.target.files[0],
                  "photoUrl"
                )
              }
            />
          </section>

          {/* GALLERY */}
          <section className="bg-white border rounded-xl p-6 space-y-4">
            <h2 className="text-xl font-semibold">
              Work Gallery ({stylist.gallery?.length || 0}/{galleryLimit})
            </h2>

            <div className="grid grid-cols-3 gap-4">
              {(stylist.gallery || []).map((img, i) => (
                <div
                  key={i}
                  draggable
                  onDragStart={() => handleDragStart(i)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => handleDrop(i)}
                  className="relative"
                >
                  <img
                    src={img}
                    alt=""
                    className="h-28 w-full object-cover rounded-lg border"
                  />

                  <button
                    onClick={() =>
                      setStylist({
                        ...stylist,
                        gallery: stylist.gallery.filter(
                          (_, idx) => idx !== i
                        ),
                      })
                    }
                    className="absolute top-1 right-1 bg-black/70 text-white text-xs px-2 py-1 rounded"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>

            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) =>
                handleGalleryUpload(e.target.files)
              }
            />
          </section>
        </div>

        {/* RIGHT PREVIEW */}
        <div className="sticky top-24 space-y-6">
          <h2 className="text-2xl font-bold">
            Live Preview
          </h2>

          <div className="bg-white border rounded-xl p-6 shadow-sm space-y-4">
            {stylist.photoUrl && (
              <img
                src={stylist.photoUrl}
                alt=""
                className="w-40 h-40 object-cover rounded-lg"
              />
            )}

            <div className="text-xl font-semibold">
              {stylist.fullName}
            </div>

            <div className="text-sm text-gray-500">
              {stylist.city}, {stylist.state}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
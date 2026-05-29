import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { Link } from "react-router-dom";

function getGalleryLimit(tier) {
  if (tier === "premium") return 20;
  if (tier === "pro") return 12;
  return 3;
}
/* IMAGE OPTIMIZATION */

async function optimizeImage(file, maxSize = 1200) {
  return new Promise((resolve) => {
    const img = new Image();
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    img.onload = () => {
      let { width, height } = img;

      if (width > height && width > maxSize) {
        height *= maxSize / width;
        width = maxSize;
      } else if (height > maxSize) {
        width *= maxSize / height;
        height = maxSize;
      }

      canvas.width = width;
      canvas.height = height;

      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => resolve(new File([blob], file.name, { type: "image/jpeg" })),
        "image/jpeg",
        0.8
      );
    };

    img.src = URL.createObjectURL(file);
  });
}

async function createThumbnail(file, size = 300) {
  return new Promise((resolve) => {
    const img = new Image();
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    img.onload = () => {
      const scale = Math.min(size / img.width, size / img.height);

      const width = img.width * scale;
      const height = img.height * scale;

      canvas.width = width;
      canvas.height = height;

      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => resolve(new File([blob], file.name, { type: "image/jpeg" })),
        "image/jpeg",
        0.75
      );
    };

    img.src = URL.createObjectURL(file);
  });
}

export default function EditProfilePage() {
  const [user, setUser] = useState(null);
  const [stylist, setStylist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [uploading, setUploading] = useState(false);
  const [dragIndex, setDragIndex] = useState(null);

  const [licenseUrl, setLicenseUrl] = useState("");
  
  const [form, setForm] = useState({
    full_name: "",
    specialties: "",
    bio: "",
    salon_name: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    phone: "",
    email: "",
    instagram: "",
    website: "",
    facebook: "",
    tiktok: "",
    pinterest: "",
  });

  useEffect(() => {
    async function loadData() {
      const { data } = await supabase.auth.getUser();
      const currentUser = data?.user;

      console.log("AUTH EMAIL:", currentUser.email);

      console.log("USER:", currentUser);

      setUser(currentUser);

      if (!currentUser) {
        console.log("❌ No user logged in");
        setLoading(false);
        return;
      }

      // ✅ FIXED: match by email instead of user_id
      const { data: stylistData, error } = await supabase
        .from("stylists")
        .select("*")
        .eq("full_name", "Gina Burgess")
        .single();

      if (stylistData) {
        setStylist(stylistData);

        setForm({
          full_name: stylistData.full_name || "",
          bio: stylistData.bio || "",
          salon_name: stylistData.salon_name || "",
          address: stylistData.address || "",
          city: stylistData.city || "",
          state: stylistData.state || "",
          zip: stylistData.zip || "",
          phone: stylistData.phone || "",
          email: stylistData.email || "",
          instagram: stylistData.instagram || "",
          website: stylistData.website || ""
        });

        setLicenseUrl(stylistData.license_url || "");
      }

      setLoading(false);
    }

    loadData();
  }, []);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSave() {
    if (!stylist) return;

    setSaving(true);

    const { error } = await supabase
      .from("stylists")
      .update(form)
      .eq("id", stylist.id);

    if (error) {

      console.error(error);

      setErrorMessage(
        "Something went wrong while saving your profile."
      );

      setTimeout(() => {
        setErrorMessage("");
      }, 4000);

    } else {

      setErrorMessage("");

      setSaveMessage(
        "Profile updated successfully!"
      );

      setTimeout(() => {
        setSaveMessage("");
      }, 3000);
    }

    setSaving(false);
  }

  /* HEADSHOT UPLOAD */

  async function uploadHeadshot(event) {
    let file = event.target.files?.[0];
    if (!file || !user || !stylist) return;

    file = await optimizeImage(file, 800);
    const thumbnail = await createThumbnail(file, 300);

    const safeName = file.name.replace(/\s+/g, "-");
    const filePath = `${user.id}/headshot-${Date.now()}-${safeName}`;

    await supabase.storage
      .from("stylist-photos")
      .upload(filePath, file, { upsert: true });

    await supabase.storage
      .from("stylist-thumbs")
      .upload(filePath, thumbnail, { upsert: true });

    const { data: fullUrl } = supabase.storage
      .from("stylist-photos")
      .getPublicUrl(filePath);

    const { data: thumbUrl } = supabase.storage
      .from("stylist-thumbs")
      .getPublicUrl(filePath);

    await supabase
      .from("stylists")
      .update({
        photo_url: fullUrl.publicUrl,
        photo_thumb_url: thumbUrl.publicUrl
      })
      .eq("id", stylist.id);

    setStylist((prev) => ({
      ...prev,
      photo_url: fullUrl.publicUrl
    }));
  }

  async function uploadLicense(event) {
    let file = event.target.files?.[0];

    if (!file || !user || !stylist) return;

    const safeName = file.name.replace(/\s+/g, "-");

    const filePath = `${user.id}/license-${Date.now()}-${safeName}`;

    await supabase.storage
      .from("stylist-licenses")
      .upload(filePath, file, { upsert: true });

    const { data } = supabase.storage
      .from("stylist-licenses")
      .getPublicUrl(filePath);

    await supabase
      .from("stylists")
      .update({
        license_url: data.publicUrl
      })
      .eq("id", stylist.id);

    setLicenseUrl(data.publicUrl);
  }

  /* GALLERY */

  async function saveGallery(newGallery) {
    await supabase
      .from("stylists")
      .update({ gallery: newGallery })
      .eq("id", stylist.id);

    setStylist((prev) => ({ ...prev, gallery: newGallery }));
  }

  async function uploadPhoto(event) {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;

    const limit = getGalleryLimit(stylist?.tier)
    const currentCount = stylist?.gallery?.length || 0;

    if (currentCount >= limit) {
      alert(`Your plan allows ${limit} portfolio images. Upgrade to add more.`);
      return;
    }

    const allowed = limit - currentCount;
    const filesToUpload = files.slice(0, allowed);

    setUploading(true);

    const uploadedUrls = [];

    for (let file of filesToUpload) {
      file = await optimizeImage(file, 1200);

      const safeName = file.name.replace(/\s+/g, "-");
      const filePath = `${user.id}/${Date.now()}-${safeName}`;

      await supabase.storage
        .from("stylist-photos")
        .upload(filePath, file, { upsert: true });

      const { data } = supabase.storage
        .from("stylist-photos")
        .getPublicUrl(filePath);

      uploadedUrls.push(data.publicUrl);
    }

    const newGallery = [...(stylist.gallery || []), ...uploadedUrls];
    await saveGallery(newGallery);

    setUploading(false);
    event.target.value = "";
  }

  async function deletePhoto(url) {
    const newGallery = (stylist.gallery || []).filter((u) => u !== url);
    await saveGallery(newGallery);
  }

  async function handleDrop(dropIndex) {
    if (dragIndex === null) return;

    const updated = [...stylist.gallery];
    const [moved] = updated.splice(dragIndex, 1);
    updated.splice(dropIndex, 0, moved);

    setDragIndex(null);
    await saveGallery(updated);
  }

  if (loading) return <div className="p-10">Loading...</div>;

  if (!stylist) {
    return (
      <div className="p-10">
        <h2 className="text-xl font-semibold">
          No stylist profile found
        </h2>
        <p className="mt-2 text-gray-600">
          Your account is not linked to a stylist yet.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-5 md:py-10">

      <h1 className="text-3xl font-serif text-[#102A43] mb-5">
        Edit Profile
      </h1>

      {saveMessage && (
        <div className="mb-5 rounded-xl bg-green-50 border border-green-200 text-green-700 px-4 py-3 text-sm font-medium">
          {saveMessage}
        </div>
      )}

      {errorMessage && (
        <div className="mb-5 rounded-xl bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm font-medium">
          {errorMessage}
        </div>
      )}

      <div className="space-y-8">

        {/* PROFILE */}

        <div className="bg-white border rounded-2xl p-6">
          <h2 className="text-xl font-semibold mb-4">Profile</h2>

          {stylist.photo_url && (
            <img
              src={stylist.photo_url}
              alt="Headshot"
              className="w-28 h-28 rounded-xl object-cover mb-4"
            />
          )}

          <label
            className={`inline-flex items-center gap-2 ${
              uploading
                ? "opacity-50 cursor-not-allowed"
                : "cursor-pointer"
            }`}
          >
            <span className="px-3 py-2 border rounded-lg bg-white hover:bg-gray-50 text-sm">
              Choose File
            </span>

            <input
              type="file"
              accept="image/*"
              onChange={uploadHeadshot}
              className="hidden"
            />
          </label>

          <p className="mt-1 text-xs text-slate-500">
            {stylist.photo_url ? "1 file selected" : "No file chosen"}
          </p>

          <input
            name="full_name"
            value={form.full_name}
            onChange={handleChange}
            placeholder="Full name"
            className="w-full border rounded-lg px-3 py-2 mt-4"
          />

          <textarea
            name="bio"
            value={form.bio}
            onChange={handleChange}
            placeholder="Professional bio"
            className="w-full border rounded-lg px-3 py-2 mt-3 min-h-[120px]"
          />
        </div>

        {/* SALON */}

        <div className="bg-white border rounded-2xl p-6">
          <h2 className="text-xl font-semibold mb-4">Salon Information</h2>

          <input
            name="salon_name"
            value={form.salon_name}
            onChange={handleChange}
            placeholder="Salon name"
            className="w-full border rounded-lg px-3 py-2"
          />

          <input
            name="address"
            value={form.address}
            onChange={handleChange}
            placeholder="Address"
            className="w-full border rounded-lg px-3 py-2 mt-3"
          />

          <div className="grid grid-cols-3 gap-3 mt-3">

            <input
              name="city"
              value={form.city}
              onChange={handleChange}
              placeholder="City"
              className="border rounded-lg px-3 py-2"
            />

            <input
              name="state"
              value={form.state}
              onChange={handleChange}
              placeholder="State"
              className="border rounded-lg px-3 py-2"
            />

            <input
              name="zip"
              value={form.zip}
              onChange={handleChange}
              placeholder="ZIP"
              className="border rounded-lg px-3 py-2"
            />

          </div>
        </div>

        {/* CONTACT */}

        <div className="bg-white border rounded-2xl p-6">
          <h2 className="text-xl font-semibold mb-4">Contact</h2>

          <input
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Email"
            className="w-full border rounded-lg px-3 py-2"
          />

          <input
            name="phone"
            value={form.phone}
            onChange={handleChange}
            placeholder="Phone"
            className="w-full border rounded-lg px-3 py-2 mt-3"
          />

          <input
            name="website"
            value={form.website}
            onChange={handleChange}
            placeholder="Website"
            className="w-full border rounded-lg px-3 py-2 mt-3"
          />

          <input
            name="instagram"
            value={form.instagram}
            onChange={handleChange}
            placeholder="Instagram"
            className="w-full border rounded-lg px-3 py-2 mt-3"
          />
        </div>

        {/* LICENSE */}

        <div className="bg-white border rounded-2xl p-6">
          <h2 className="text-xl font-semibold mb-4">
            License Verification
          </h2>

          <label className="inline-flex items-center gap-2 cursor-pointer">
            <span className="px-3 py-2 border rounded-lg bg-white hover:bg-gray-50 text-sm">
              Upload License
            </span>

            <input
              type="file"
              accept="image/*,.pdf"
              onChange={uploadLicense}
              className="hidden"
            />
          </label>

          <p className="mt-2 text-xs text-slate-500">
            {licenseUrl ? "1 file selected" : "No file chosen"}
          </p>

          <p className="mt-2 text-xs text-gray-500">
            Only visible to Stylegrades admin for verification.
          </p>

          {licenseUrl && (
            <a
              href={licenseUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline text-sm mt-3 inline-block"
            >
              View Uploaded License
            </a>
          )}
        </div>
        
        <div className="bg-white rounded-2xl shadow-sm border p-6 space-y-4">
          <h2 className="text-xl font-semibold mb-4">
            Social & Professional Links
          </h2>

          <input
            type="text"
            placeholder="Instagram"
            value={form.instagram}
            onChange={(e) =>
              setForm({ ...form, instagram: e.target.value })
            }
            className="w-full border rounded-lg px-3 py-2"
          />

          <input
            type="text"
            placeholder="Facebook"
            value={form.facebook}
            onChange={(e) =>
              setForm({ ...form, facebook: e.target.value })
            }
            className="w-full border rounded-lg px-3 py-2"
          />

          <input
            type="text"
            placeholder="TikTok"
            value={form.tiktok}
            onChange={(e) =>
              setForm({ ...form, tiktok: e.target.value })
            }
            className="w-full border rounded-lg px-3 py-2"
          />

          <input
            type="text"
            placeholder="Pinterest"
            value={form.pinterest}
            onChange={(e) =>
              setForm({ ...form, pinterest: e.target.value })
            }
            className="w-full border rounded-lg px-3 py-2"
          />

          <textarea
            placeholder="Specialties (ex: Balayage, Color, Extensions)"
            value={form.specialties}
            onChange={(e) =>
              setForm({ ...form, specialties: e.target.value })
            }
            className="w-full border rounded-lg px-3 py-2"
          />
        </div>
        
        {/* PORTFOLIO */}

        <div className="bg-white border rounded-2xl p-6">
          <h2 className="text-xl font-semibold mb-4">
            Portfolio Photos
          </h2>

          <p className="text-sm text-gray-500 mb-2">
            Your plan allows{" "}
            <span className="font-semibold text-[#102A43]">
              {getGalleryLimit(stylist?.tier)}
            </span>{" "}
            portfolio images.
          </p>

          <p className="text-sm text-gray-500 mb-4">
            You currently have{" "}
            <span className="font-semibold">
              {(stylist.gallery || []).length}
            </span>{" "}
            uploaded.
            {" "}
            {Math.max(
              getGalleryLimit(stylist?.tier) -
                (stylist.gallery || []).length,
              0
            )}{" "}
            remaining.
          </p>

          {stylist?.tier !== "premium" && (
            <p className="text-sm text-[#1F6FEB] mb-3">
              Upgrade your plan to upload more portfolio photos.
              <Link to="/pricing" className="ml-2 underline font-semibold">
                View plans →
              </Link>
            </p>
          )}

          <label className="inline-flex items-center gap-2 cursor-pointer">
            <span className="px-3 py-2 border rounded-lg bg-white hover:bg-gray-50 text-sm">
              Choose Files
            </span>

            <input
              type="file"
              accept="image/*"
              multiple
              onChange={uploadPhoto}
              className="hidden"
            />
          </label>

          <p className="mt-2 text-xs text-slate-500">
            {(stylist.gallery || []).length} file
            {(stylist.gallery || []).length !== 1 ? "s" : ""} uploaded
          </p>

          {uploading && (
            <div className="mt-3 flex items-center gap-2 text-sm text-[#102A43]">

              <div className="h-4 w-4 border-2 border-[#102A43] border-t-transparent rounded-full animate-spin" />

              Uploading and optimizing images...

            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mt-4">
            {(stylist.gallery || []).map((url, index) => (
              <div
                key={`${url}-${index}`}
                draggable
                onDragStart={() => setDragIndex(index)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => handleDrop(index)}
                className="border rounded-lg p-1.5 bg-[#F8FAFC] cursor-move"
              >
                <img
                  src={url}
                  alt="Portfolio"
                  className="rounded-lg object-cover h-24 sm:h-28 w-full"
                />

                <button
                  disabled={uploading}
                  onClick={() => deletePhoto(url)}
                  className={`mt-1 w-full text-xs border rounded px-2 py-1 ${
                    uploading
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:bg-gray-100"
                  }`}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="sticky bottom-0 left-0 right-0 bg-white/95 backdrop-blur border-t p-4 flex justify-end mt-8">
          <button
            onClick={handleSave}
            disabled={saving}
            className={`px-6 py-3 rounded-xl font-semibold transition ${
              saving
                ? "bg-gray-400 text-white cursor-not-allowed"
                : "bg-[#102A43] hover:bg-[#0B1F33] text-white"
            }`}
          >
            {saving ? "Saving..." : "Save Profile"}
          </button>
        </div>

      </div>
    </div>
  );
}
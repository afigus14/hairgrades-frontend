import React from "react";

export default function ApplicationForm({
  form,
  handleChange,
  readOnlyEmail = false,
}) {
  return (
    <div className="space-y-8">

      {/* PERSONAL INFORMATION */}
      <div>
        <h2 className="text-xl font-bold border-b pb-2 mb-4">
          Personal Information
        </h2>

        <div className="grid md:grid-cols-2 gap-6">

          <div>
            <label className="block font-semibold mb-1">
              Full Name
            </label>

            <input
              type="text"
              name="full_name"
              value={form.full_name || ""}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>

          <div>
            <label className="block font-semibold mb-1">
              Email
            </label>

            <input
              type="email"
              value={form.email || ""}
              disabled={readOnlyEmail}
              className="w-full border rounded-lg px-3 py-2 bg-gray-100"
            />
          </div>

          <div>
            <label className="block font-semibold mb-1">
              Phone
            </label>

            <input
              type="text"
              name="phone"
              value={form.phone || ""}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>

        </div>
      </div>

      {/* PROFESSIONAL INFORMATION */}

      <div>
        <h2 className="text-xl font-bold border-b pb-2 mb-4">
          Professional Information
        </h2>

        <div className="grid md:grid-cols-2 gap-6">

          <div>
            <label className="block font-semibold mb-1">
              Salon Name
            </label>

            <input
              type="text"
              name="salon_name"
              value={form.salon_name || ""}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>

          <div>
            <label className="block font-semibold mb-1">
              Years of Experience
            </label>

            <input
              type="number"
              name="years_experience"
              value={form.years_experience || ""}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>

          <div>
            <label className="block font-semibold mb-1">
              City
            </label>

            <input
              type="text"
              name="city"
              value={form.city || ""}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>

          <div>
            <label className="block font-semibold mb-1">
              State
            </label>

            <input
              type="text"
              name="state"
              value={form.state || ""}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>

          <div>
            <label className="block font-semibold mb-1">
              ZIP Code
            </label>

            <input
              type="text"
              name="zip"
              value={form.zip || ""}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>

          <div>
            <label className="block font-semibold mb-1">
              License Number
            </label>

            <input
              type="text"
              name="license"
              value={form.license || ""}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>

        </div>
      </div>

      {/* ONLINE PRESENCE */}

      <div>
        <h2 className="text-xl font-bold border-b pb-2 mb-4">
          Online Presence
        </h2>

        <div className="grid md:grid-cols-2 gap-6">

          <div>
            <label className="block font-semibold mb-1">
              Instagram
            </label>

            <input
              type="text"
              name="instagram"
              value={form.instagram || ""}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>

          <div>
            <label className="block font-semibold mb-1">
              Website
            </label>

            <input
              type="text"
              name="website"
              value={form.website || ""}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>

        </div>
      </div>

      {/* ABOUT */}

      <div>
        <h2 className="text-xl font-bold border-b pb-2 mb-4">
          About You
        </h2>

        <div>

          <label className="block font-semibold mb-1">
            Biography
          </label>

          <textarea
            rows={6}
            name="bio"
            value={form.bio || ""}
            onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2"
          />

        </div>

      </div>

    </div>
  );
}
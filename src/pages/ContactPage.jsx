// src/pages/ContactPage.jsx
import React, { useState } from "react";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    setSubmitted(true);
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">

      {/* Page Heading */}
      <h1 className="text-3xl font-serif text-[#2F3C4F] mb-2">
        Contact Us
      </h1>

      {/* Sub-heading */}
      <p className="text-[#2F3C4F] mb-6 max-w-xl">
        Have questions, feedback, or partnership inquiries? We'd love to hear from you.
      </p>

      {/* Contact Card */}
      <div className="rounded-2xl border border-[#C7D5E2]/40 bg-[#172538] p-6 shadow-lg">
        {!submitted ? (
          <form onSubmit={handleSubmit} className="space-y-5">

            <div>
              <label className="block text-sm mb-1 text-[#CAE4DB]">
                Your Name
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 rounded-lg bg-[#101A2A] border border-[#30465B] text-[#F7FAFF]"
                required
              />
            </div>

            <div>
              <label className="block text-sm mb-1 text-[#CAE4DB]">
                Email
              </label>
              <input
                type="email"
                className="w-full px-3 py-2 rounded-lg bg-[#101A2A] border border-[#30465B] text-[#F7FAFF]"
                required
              />
            </div>

            <div>
              <label className="block text-sm mb-1 text-[#CAE4DB]">
                Message
              </label>
              <textarea
                rows="4"
                className="w-full px-3 py-2 rounded-lg bg-[#101A2A] border border-[#30465B] text-[#F7FAFF]"
                required
              />
            </div>

            <button
              className="mt-4 bg-[#F4A731] text-black px-6 py-2 rounded-lg font-semibold hover:bg-[#F1B154] transition"
            >
              Send Message
            </button>

          </form>
        ) : (
          <p className="text-lg text-[#CAE4DB]">
            Thank you for reaching out! We will get back to you soon.
          </p>
        )}
      </div>
    </div>
  );
}

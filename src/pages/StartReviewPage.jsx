import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

export default function StartReviewPage() {

  const { profileSlug } = useParams();

  const navigate = useNavigate();

  const [name, setName] = useState("");

  const [email, setEmail] = useState("");

  function handleContinue(e) {

    e.preventDefault();

    navigate(`/review/verify/${profileSlug}`, {
      state: {
        reviewerName: name,
        reviewerEmail: email,
      },
    });

  }

  return (

    <div className="max-w-xl mx-auto py-20 px-6">

      <div className="rounded-3xl border bg-white p-8 shadow">

        <h1 className="text-3xl font-serif font-bold">

          Verify Your Email

        </h1>

        <p className="mt-3 text-[#52606D]">

          Before leaving your review we need to verify your email.

        </p>

        <form
          onSubmit={handleContinue}
          className="mt-8 space-y-5"
        >

          <input
            required
            value={name}
            onChange={(e)=>setName(e.target.value)}
            placeholder="Your Name"
            className="w-full rounded-xl border px-4 py-3"
          />

          <input
            required
            type="email"
            value={email}
            onChange={(e)=>setEmail(e.target.value)}
            placeholder="Email Address"
            className="w-full rounded-xl border px-4 py-3"
          />

          <button
            className="w-full rounded-xl bg-[#102A43] py-3 text-white font-semibold"
          >
            Send Verification Email
          </button>

        </form>

      </div>

    </div>

  );

}
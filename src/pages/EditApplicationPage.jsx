import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import ApplicationForm from "../components/ApplicationForm";

export default function EditApplicationPage() {
  const { id } = useParams();

  const [loading, setLoading] = useState(true);
  const [application, setApplication] = useState(null);
  const [form, setForm] = useState({});
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    loadApplication();
  }, []);

  async function loadApplication() {
    setLoading(true);

    const { data, error } = await supabase
      .from("stylists")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error(error);
      setError("We couldn't find your application.");
      setLoading(false);
      return;
    }

    setApplication(data);
    setForm(data);
    setLoading(false);
  }

  function handleChange(e) {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const { error } = await supabase
      .from("stylists")
      .update({
        ...form,

        specialties: String(form.specialties || "")
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),

        status: "pending",
      })
      .eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl shadow-lg border p-10 text-center">

          <div className="text-6xl mb-6">🎉</div>

          <h1 className="text-3xl font-bold mb-4">
            Application Successfully Resubmitted
          </h1>

          <p className="text-gray-600 mb-8">
            Thank you for updating your Stylegrades application.
            <br /><br />
            Our team has received your changes and will review your
            application shortly.
            <br /><br />
            You'll receive an email once the review has been completed.
          </p>

          <button
            onClick={() => window.location.href = "/#/"}
            className="bg-[#1E3A5F] hover:bg-[#16304d] text-white px-8 py-3 rounded-xl font-semibold"
          >
            Return Home
          </button>

        </div>
      </div>
    );
  }
  
  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold mb-3">
          Update Your Application
        </h1>

        <p className="text-gray-600 mb-8">
          Please wait while we retrieve your application.
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold mb-3">
          Update Your Application
        </h1>

        <div className="rounded-xl bg-red-50 border border-red-200 p-6">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">

      <h1 className="text-3xl font-bold mb-3">
        Update Your Application
      </h1>

      <p className="text-gray-600 mb-8">
        Please review the information below before resubmitting your
        application.
      </p>

      <div className="rounded-2xl border bg-white p-8 shadow-sm">

        <ApplicationForm
          form={form}
          handleChange={handleChange}
          readOnlyEmail={true}
        />

        <div className="mt-8 flex justify-end">
          <button
            type="button"
            onClick={handleSubmit}
            className="bg-[#1E3A5F] hover:bg-[#16304d] text-white font-semibold px-8 py-3 rounded-xl shadow"
          >
            Save & Resubmit Application
          </button>
        </div>

      </div>

    </div>
  );
}
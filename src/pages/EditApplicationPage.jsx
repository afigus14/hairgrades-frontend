import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function EditApplicationPage() {
  const { id } = useParams();

  const [loading, setLoading] = useState(true);
  const [application, setApplication] = useState(null);
  const [error, setError] = useState("");

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
    setLoading(false);
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

        <div className="space-y-3">

          <div>
            <strong>Name:</strong> {application.full_name}
          </div>

          <div>
            <strong>Email:</strong> {application.email}
          </div>

          <div>
            <strong>Phone:</strong> {application.phone}
          </div>

          <div>
            <strong>Salon:</strong> {application.salon_name}
          </div>

          <div>
            <strong>City:</strong> {application.city}
          </div>

          <div>
            <strong>State:</strong> {application.state}
          </div>

          <div>
            <strong>Status:</strong> {application.status}
          </div>

        </div>

      </div>

    </div>
  );
}
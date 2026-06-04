import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function ReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [user, setUser] = useState(null);
  const [responses, setResponses] = useState({});

  async function saveResponse(reviewId) {
    const response = responses[reviewId];

    if (!response?.trim()) {
      alert("Please enter a response first.");
      return;
    }

    const review = reviews.find(
      (r) => r.id === reviewId
    );

    const { error } = await supabase
      .from("reviews")
      .update({
        stylist_response: response,
        stylist_response_date:
          new Date().toISOString(),
      })
      .eq("id", reviewId);

    if (error) {
      alert(error.message);
      return;
    }

    await fetch(
      "https://stylegrades-api.vercel.app/api/send-review-response",
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          reviewerName:
            review.reviewer_name,
          reviewerEmail:
            review.reviewer_email,
          stylistName: 
            "Your stylist",
          reviewText:
            review.review_text,
          stylistResponse:
            response,
        }),
      }
    );

    setReviews((prev) =>
      prev.map((r) =>
        r.id === reviewId
          ? {
              ...r,
              stylist_response: response,
              stylist_response_date:
                new Date().toISOString(),
            }
          : r
      )
    );

    alert("Response saved!");
  }
  
  useEffect(() => {
    async function loadData() {
      const { data } = await supabase.auth.getUser();
      const user = data?.user;

      setUser(user);

      if (!user) return;

      const { data: stylistData } = await supabase
        .from("stylists")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!stylistData) return;

      const { data: reviewData, error } = await supabase
        .from("reviews")
        .select("*")
        .eq("stylist_id", stylistData.id)
        .eq("status", "approved")
        .order("created_at", {
          ascending: false,
        });

      if (error) {
        console.error(error);
        return;
      }

      setReviews(reviewData || []);

      const existingResponses = {};

      (reviewData || []).forEach((review) => {
        if (review.stylist_response) {
          existingResponses[review.id] =
            review.stylist_response;
        }
      });

      setResponses(existingResponses);
    }

    loadData();
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-semibold text-[#102A43] mb-4">
        Your Reviews
      </h1>

      <div className="bg-white border rounded-xl p-6">

        {reviews.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-600">
              You don’t have any reviews yet.
            </p>

            <p className="text-sm text-gray-500 mt-2">
              Once clients leave reviews, they’ll appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="border rounded-xl p-4 bg-gray-50"
              >
                <div className="flex justify-between items-center mb-2">
                  <div className="font-semibold">
                    {review.reviewer_name}
                  </div>

                  <div className="text-[#F4A731]">
                    {"★".repeat(review.rating || 0)}
                  </div>
                </div>

                <p className="text-gray-700 mb-3">
                  {review.review_text}
                </p>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Response
                  </label>

                  <textarea
                    rows={4}
                    value={responses[review.id] || ""}
                    onChange={(e) =>
                      setResponses((prev) => ({
                        ...prev,
                        [review.id]: e.target.value,
                      }))
                    }
                    placeholder="Write a response to this review..."
                    className="w-full border rounded-lg px-3 py-2"
                  />

                  <button
                    type="button"
                    onClick={() => saveResponse(review.id)}
                    className="mt-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold"
                  >
                    Save Response
                  </button>
                </div>

              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
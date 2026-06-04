import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function ReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [user, setUser] = useState(null);

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

                {review.stylist_response && (
                  <div className="mt-3 border-l-4 border-[#F4A731] pl-4">
                    <div className="font-semibold text-[#102A43] mb-1">
                      Your Response
                    </div>

                    <p className="text-gray-700">
                      {review.stylist_response}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
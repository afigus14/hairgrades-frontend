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

      // 🔥 later we will connect real reviews
      setReviews([]);
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
          <div>
            {/* future reviews list */}
          </div>
        )}

      </div>
    </div>
  );
}
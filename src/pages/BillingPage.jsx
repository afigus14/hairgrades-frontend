import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";

export default function BillingPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [stylist, setStylist] = useState(null);

  const handleBilling = async () => {
    if (!stylist?.stripe_customer_id) {
      alert("No billing account found.");
      return;
    }

    const res = await fetch(
      `${import.meta.env.VITE_API_BASE_URL}/api/create-portal-session`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_id: stylist.stripe_customer_id,
        }),
      }
    );

    const data = await res.json();
    console.log("PORTAL RESPONSE:", data);
    window.location.href = data.url;
  };

  useEffect(() => {
    async function loadData() {
      const { data } = await supabase.auth.getUser();
      const user = data?.user;
      setUser(user);

      if (user) {
        console.log("USER EMAIL:", user.email);
        
        const { data: stylistData } = await supabase
            .from("stylists")
            .select("*")
            .eq("user_id", user.id)
            .limit(1)
            .maybeSingle();

        console.log("STYLIST DATA:", stylistData);
        
        setStylist(stylistData);
      }
    }

    loadData();
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-semibold text-[#102A43] mb-4">
        Billing
      </h1>

      <div className="bg-white border rounded-xl p-6">

        {stylist && (
        <div>
            <p className="text-sm text-gray-600">
            Current plan:{" "}
            <span className="font-semibold uppercase">
                {stylist.tier || "free"}
            </span>
            </p>

            <p className="text-xs text-gray-500 mt-1">
            Upgrade or manage your subscription anytime.
            </p>
        </div>
        )}

        <div className="mt-4">
          <button
            onClick={handleBilling}
            className="px-4 py-2 border rounded-lg hover:bg-gray-100"
          >
            Manage Billing
          </button>
        </div>

      </div>
    </div>
  );
}
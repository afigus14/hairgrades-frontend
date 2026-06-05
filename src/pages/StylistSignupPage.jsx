import { useState } from "react";
import { supabase } from "../lib/supabase";

export default function StylistSignupPage() {

  const [email,setEmail] = useState("");
  const [password,setPassword] = useState("");
  const [message,setMessage] = useState("");

  async function handleSignup(e){
    e.preventDefault();

    setMessage("");

    // Find approved stylist profile

    const { data: stylist } = await supabase
      .from("stylists")
      .select("*")
      .eq("email", email.toLowerCase())
      .eq("status", "approved")
      .maybeSingle();

    if (!stylist) {
      setMessage(
        "No approved stylist profile was found for this email."
      );
      return;
    }

    if (stylist.user_id) {
      setMessage(
        "This stylist profile is already linked to an account."
      );
      return;
    }

    const { data, error } =
      await supabase.auth.signUp({
        email,
        password,
      });

    if (error) {
      setMessage(error.message);
      return;
    }

    const userId = data?.user?.id;

    if (userId) {
      await supabase
        .from("stylists")
        .update({
          user_id: userId,
        })
        .eq("id", stylist.id);
    }

    setMessage(
      "Account created! You can now log in."
    );
  }

  return (
    <div className="max-w-md mx-auto py-16">

      <h1 className="text-2xl font-semibold mb-6">
        Create Stylist Account
      </h1>

      <form onSubmit={handleSignup} className="space-y-4">

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e)=>setEmail(e.target.value)}
          className="w-full border p-2 rounded"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e)=>setPassword(e.target.value)}
          className="w-full border p-2 rounded"
        />

        <button
          type="submit"
          className="bg-black text-white px-4 py-2 rounded"
        >
          Create Account
        </button>

        {message && (
          <div className="text-sm text-gray-600">
            {message}
          </div>
        )}

      </form>

    </div>
  );
}
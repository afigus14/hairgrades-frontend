import { useState } from "react";
import { Link, useParams } from "react-router-dom";

const API_BASE =
  import.meta.env.VITE_API_BASE_URL ||
  "https://stylegrades-api.vercel.app";

export default function ActivateClaimAccountPage() {
  const { token } = useParams();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [complete, setComplete] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage("");

    if (password.length < 8) {
      setMessage("Please choose a password with at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("Your passwords do not match.");
      return;
    }

    if (!token) {
      setMessage("This activation link is invalid.");
      return;
    }

    setLoading(true);

    try {

      const response = await fetch(
        `${API_BASE}/api/claims/activate-account`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            activationToken: token,
            password,
          }),
        }
      );

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          result?.error ||
            "Stylegrades could not activate your professional profile."
        );
      }

      setComplete(true);
    } catch (error) {
      console.error("Profile activation error:", error);

      setMessage(
        error?.message ||
          "Stylegrades could not activate your professional profile."
      );
    } finally {
      setLoading(false);
    }
  }

  if (complete) {
    return (
      <main className="min-h-screen bg-[#EAF7F7] px-4 py-12">
        <div className="mx-auto max-w-xl rounded-2xl bg-white p-8 shadow-sm">
          <div className="text-sm font-bold tracking-[0.18em] text-[#B58A2A]">
            PROFILE ACTIVATED
          </div>

          <h1 className="mt-3 text-3xl font-bold text-[#102A43]">
            Welcome to Stylegrades™
          </h1>

          <p className="mt-4 text-[#52606D]">
            Your account is now securely connected to your professional
            profile.
          </p>

          <p className="mt-3 text-[#52606D]">
            You can sign in and manage your profile from your Stylegrades™
            stylist dashboard.
          </p>

          <Link
            to="/login"
            className="mt-7 inline-flex items-center justify-center rounded-xl bg-[#102A43] px-6 py-3 font-semibold text-white transition hover:opacity-95"
          >
            Go to Stylist Login
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#EAF7F7] px-4 py-12">
      <div className="mx-auto max-w-xl rounded-2xl bg-white p-8 shadow-sm">
        <div className="text-sm font-bold tracking-[0.18em] text-[#B58A2A]">
          ACCOUNT ACTIVATION
        </div>

        <h1 className="mt-3 text-3xl font-bold text-[#102A43]">
          Activate Your Stylegrades™ Account
        </h1>

        <p className="mt-4 text-[#52606D]">
          Create your password to securely connect your login to the
          professional profile you claimed.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          
          <div>
            <label
              htmlFor="claim-activation-password"
              className="mb-2 block text-sm font-semibold text-[#102A43]"
            >
              Create Password
            </label>

            <input
              id="claim-activation-password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#102A43]"
              required
            />
          </div>

          <div>
            <label
              htmlFor="claim-activation-confirm-password"
              className="mb-2 block text-sm font-semibold text-[#102A43]"
            >
              Confirm Password
            </label>

            <input
              id="claim-activation-confirm-password"
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#102A43]"
              required
            />
          </div>

          {message && (
            <div className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900">
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-[#102A43] px-6 py-3 font-semibold text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Activating..." : "Activate My Account"}
          </button>
        </form>

        <p className="mt-6 text-sm text-[#7B8794]">
          For your protection, this account will be connected only to the
          email address you previously verified when claiming this profile.
        </p>
      </div>
    </main>
  );
}
import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";

const API_BASE =
  import.meta.env.VITE_API_BASE_URL ||
  "https://stylegrades-api.vercel.app";

export default function ActivateClaimAccountPage() {
  const { token } = useParams();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [existingPassword, setExistingPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [complete, setComplete] = useState(false);
  const [message, setMessage] = useState("");
  const [existingAccount, setExistingAccount] = useState(false);
  const [claimEmail, setClaimEmail] = useState("");

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
        if (result?.code === "EXISTING_AUTH_ACCOUNT") {
        setClaimEmail(result?.claimEmail || "");
        setExistingAccount(true);
        setMessage("");
        return;
      }

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

  async function handleExistingAccount(e) {
    e.preventDefault();
    setMessage("");

    if (!existingPassword) {
      setMessage("Please enter your existing Stylegrades password.");
      return;
    }

    if (!token) {
      setMessage("This activation link is invalid.");
      return;
    }

    setLoading(true);

    try {
      if (!claimEmail) {
        throw new Error(
          "Stylegrades could not verify the email address for this profile claim."
        );
      }

      const {
        data: signInData,
        error: signInError,
      } = await supabase.auth.signInWithPassword({
        email: claimEmail,
        password: existingPassword,
      });

      if (signInError || !signInData?.session?.access_token) {
        throw new Error(
          "The password you entered does not match your existing Stylegrades account."
        );
      }

      const response = await fetch(
        `${API_BASE}/api/claims/activate-account`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${signInData.session.access_token}`,
          },
          body: JSON.stringify({
            activationToken: token,
            useExistingAccount: true,
          }),
        }
      );

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          result?.error ||
            "Stylegrades could not connect this professional profile to your existing account."
        );
      }

      setComplete(true);
    } catch (error) {
      console.error("Existing account activation error:", error);

      setMessage(
        error?.message ||
          "Stylegrades could not verify your existing account."
      );
    } finally {
      setLoading(false);
    }
  }

  if (existingAccount && !complete) {
    return (
      <main className="min-h-screen bg-[#EAF7F7] px-4 py-12">
        <div className="mx-auto max-w-xl rounded-2xl bg-white p-8 shadow-sm">
          <div className="text-sm font-bold tracking-[0.18em] text-[#B58A2A]">
            EXISTING STYLEGRADES™ ACCOUNT
          </div>

          <h1 className="mt-3 text-3xl font-bold text-[#102A43]">
            Sign In to Connect Your Profile
          </h1>

          <p className="mt-4 text-[#52606D]">
            A Stylegrades™ account already exists for the email address
            you verified when claiming this professional profile.
          </p>

          <p className="mt-3 text-[#52606D]">
            Enter your existing Stylegrades™ password to securely connect
            this claimed profile to your account.
          </p>

          <form onSubmit={handleExistingAccount} className="mt-8 space-y-5">
            <div>
              <label
                htmlFor="existing-stylegrades-password"
                className="mb-2 block text-sm font-semibold text-[#102A43]"
              >
                Existing Stylegrades™ Password
              </label>

              <input
                id="existing-stylegrades-password"
                type="password"
                autoComplete="current-password"
                value={existingPassword}
                onChange={(e) => setExistingPassword(e.target.value)}
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
              {loading
                ? "Connecting Profile..."
                : "Sign In & Connect My Profile"}
            </button>
          </form>

          <p className="mt-6 text-sm text-[#7B8794]">
            Your existing password will be verified securely through
            Stylegrades™ sign-in. Your password will not be changed.
          </p>
        </div>
      </main>
    );
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
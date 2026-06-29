// src/lib/scoreAdvertisers.js

export default function scoreAdvertisers(advertisers = []) {
  const today = new Date();

  return advertisers.filter((advertiser) => {

    // Must be approved
    if (advertiser.status !== "approved") {
      return false;
    }

    // Must be active
    if (!advertiser.is_active) {
      return false;
    }

    // Paused advertisers don't display
    if (advertiser.is_paused) {
      return false;
    }

    // Complimentary advertisers remain active until expiration
    if (advertiser.complimentary_until) {
      const expires = new Date(advertiser.complimentary_until);

      if (expires >= today) {
        return true;
      }
    }

    // Subscription-based advertisers
    if (
      advertiser.subscription_status &&
      advertiser.subscription_status !== "active"
    ) {
      return false;
    }

    return true;
  });
}
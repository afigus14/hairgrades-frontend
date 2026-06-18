import { pickUniqueAdvertisers } from "./advertiserPool";

export function getEligibleAdvertisers(
  advertisers = [],
  searchLocation = null
) {
  if (!searchLocation) {
    return advertisers;
  }

  const city =
    searchLocation.city?.toLowerCase() || "";

  const state =
    searchLocation.state?.toLowerCase() || "";

  return advertisers.filter((ad) => {
    // National advertisers show everywhere
    if (ad.targeting_type === "national") {
      return true;
    }

    // Local advertisers
    if (ad.targeting_type === "local") {
      const adCity =
        ad.target_city?.toLowerCase() || "";

      const adState =
        ad.target_state?.toLowerCase() || "";

      return (
        adCity === city &&
        adState === state
      );
    }

    return true;
  });
}

export function selectAdvertisers(
  advertisers = [],
  count = 1,
  searchLocation = null
) {
  const eligible =
    getEligibleAdvertisers(
      advertisers,
      searchLocation
    );

  return pickUniqueAdvertisers(
    eligible,
    count
  );
}
// src/lib/buildPageInventory.js

import promoInventory from "./promoInventory";
import scoreAdvertisers from "./scoreAdvertisers";

export const INVENTORY_SIZE = 8;

/**
 * Builds the advertising inventory for a page.
 *
 * Rules:
 * 1. No advertiser appears more than once.
 * 2. Advertisers are randomly shuffled (temporary until weighted rotation).
 * 3. Promotional cards are mixed naturally into the inventory.
 * 4. Remaining empty slots are filled with promotional inventory.
 */

function shuffle(array) {
  const copy = [...array];

  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }

  return copy;
}

export function buildPageInventory(advertisers = []) {

  // Remove duplicate advertisers
  const eligibleAdvertisers = scoreAdvertisers(advertisers);
    
  const uniqueAdvertisers = eligibleAdvertisers.filter(
    (ad, index, self) =>
      self.findIndex((a) => a.id === ad.id) === index
  );

  // Randomize advertiser order
  const availableAdvertisers = shuffle(uniqueAdvertisers);

  const availablePromos = shuffle([...promoInventory]);

  // Promo locations within the 8-slot inventory
  const promoSlots = [2, 5, 6, 7];

  const inventory = [];

  let advertiserIndex = 0;
  let promoIndex = 0;

  for (let slot = 0; slot < INVENTORY_SIZE; slot++) {

    const shouldUsePromo =
      promoSlots.includes(slot) ||
      advertiserIndex >= availableAdvertisers.length;

    if (shouldUsePromo) {

      inventory.push({
        type: "promo",
        item:
          availablePromos[
            promoIndex % availablePromos.length
          ],
      });

      promoIndex++;

    } else {

      inventory.push({
        type: "advertiser",
        item:
          availableAdvertisers[
            advertiserIndex++
          ],
      });

    }

  }

  return inventory;
}
import { INVENTORY_ADS } from "./inventoryAds";

export function buildAdPool(
  advertisers = [],
  targetSize = 8
) {
  const pool = [...advertisers];

  const availableInventory = [...INVENTORY_ADS];

  while (
    pool.length < targetSize &&
    availableInventory.length > 0
  ) {
    const randomIndex = Math.floor(
      Math.random() *
      availableInventory.length
    );

    pool.push(
      availableInventory[randomIndex]
    );

    availableInventory.splice(
      randomIndex,
      1
    );
  }

  return pool;
}
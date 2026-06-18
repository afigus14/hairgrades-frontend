export const FOUNDING_PARTNERS = [
  {
    advertiserId: "micbike_001",
    brand_name: "The Mic Bike",
    company_name: "The Mic Bike",
    website: "https://www.themicbike.com/",
    image_url: "/assets/sponsors/micbike.jpg",
    headline:
      "Palm Springs' Original Karaoke Party Bike",
    body:
      "Private rides, birthdays, bachelorettes, and unforgettable nights out.",
    cta: "Book Your Ride",
    rotation_weight: 3,
    is_founding_partner: true,
  },

  {
    advertiserId: "manearbor_001",
    brand_name: "The Mane Arbor",
    company_name: "The Mane Arbor",
    website:
      "https://www.instagram.com/themanearbor/",
    image_url: "/assets/sponsors/mane-arbor.jpg",
    headline:
      "Luxury Hair Extensions + Salon Services",
    body:
      "Elevated color, extensions, and modern salon artistry.",
    cta: "View on Instagram",
    rotation_weight: 3,
    is_founding_partner: true,
  },

  {
    advertiserId: "elements_001",
    brand_name: "Elements Salon & Spa Suites",
    company_name: "Elements Salon & Spa Suites",
    website: "https://www.elementsssr.com/",
    image_url: "/assets/sponsors/elements.jpg",
    headline:
      "Luxury Salon & Spa Suites",
    body:
      "Upscale salon suites designed for independent beauty professionals.",
    cta: "Explore Suites",
    rotation_weight: 3,
    is_founding_partner: true,
  },

  {
    advertiserId: "onu_001",
    brand_name:
      "ONU Interior & Architectural Design",
    company_name:
      "Olivet Nazarene University",
    website:
      "https://www.olivet.edu/area-study/interior-design-major-minor/",
    image_url: "/assets/sponsors/onu-design.jpg",
    headline:
      "Design Spaces That Shape Human Experience",
    body:
      "Explore Olivet Nazarene University's Interior Design program.",
    cta: "Explore the Program",
    rotation_weight: 3,
    is_founding_partner: true,
  },
];

export function buildWeightedPool(advertisers = []) {
  const pool = [];

  advertisers.forEach((ad) => {
    const weight = Number(ad.rotation_weight || 1);

    for (let i = 0; i < weight; i++) {
      pool.push(ad);
    }
  });

  return pool;
}

export function pickUniqueAdvertisers(
  advertisers = [],
  count = 1
) {
  const weightedPool =
    buildWeightedPool(advertisers);

  const selected = [];
  const usedIds = new Set();

  while (
    weightedPool.length > 0 &&
    selected.length < count
  ) {
    const index = Math.floor(
      Math.random() * weightedPool.length
    );

    const ad = weightedPool[index];

    const uniqueId =
      ad.advertiserId || ad.id;

    if (!usedIds.has(uniqueId)) {
      selected.push(ad);

      usedIds.add(uniqueId);
    }

    weightedPool.splice(index, 1);
  }

  return selected;
}

export function getFoundingPartnerById(id) {
  return FOUNDING_PARTNERS.find(
    (x) => x.advertiserId === id
  );
}
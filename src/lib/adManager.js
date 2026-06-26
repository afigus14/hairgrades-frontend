// src/lib/adManager.js

const ads = [
  {
    advertiserId: "micbike_001",
    featured: true,
    label: "Featured Sponsor",
    headline:
      "The Mic Bike - Palm Springs' Original Karaoke Party Bike",
    body:
      "Private rides, birthdays, bachelorettes, and unforgettable nights out.",
    cta: "Book Your Ride",
    sponsorUrl: "https://www.themicbike.com/",
    imageUrl: "/assets/sponsors/micbike.jpg",
  },

  {
    advertiserId: "manearbor_001",
    featured: false,
    label: "Beauty Partner",
    headline:
      "Luxury Hair Extensions + Salon Services",
    body:
      "Luxury color, extensions, and modern salon artistry.",
    cta: "View on Instagram",
    sponsorUrl:
      "https://www.instagram.com/themanearbor/",
    imageUrl:
      "https://images.unsplash.com/photo-1522337660859-02fbefca4702?auto=format&fit=crop&w=1200&q=60",
  },

  {
    advertiserId: "elements_001",
    featured: false,
    label: "Industry Partner",
    headline:
      "Luxury Salon & Spa Suites for Independent Professionals",
    body:
      "Upscale salon spaces designed for beauty professionals.",
    cta: "Explore Suites",
    sponsorUrl:
      "https://www.elementsssr.com/",
    imageUrl:
      "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=1200&q=60",
  },
];

export function getInFeedAd(index) {
  return ads[index % ads.length];
}

export function getFeaturedAd() {
  return ads.find((a) => a.featured) || ads[0];
}

export default ads;
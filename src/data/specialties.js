// src/data/specialties.js
// Official Stylegrades™ specialty taxonomy.
// This is the single source of truth for specialty selections
// across Join, Edit Profile, and Search.

export const SPECIALTY_GROUPS = [
  {
    category: "Color",
    specialties: [
      "All-Over Color",
      "Balayage",
      "Blonding",
      "Bronde Color",
      "Brunette Color",
      "Color Correction",
      "Dimensional Color",
      "Enhancing Natural Color",
      "Gray Blending",
      "Gray Coverage",
      "Highlights",
      "Lived-In Color",
      "Lowlights",
      "Vivid/Fashion Color",
    ],
  },
  {
    category: "Cutting & Barbering",
    specialties: [
      "Haircuts",
      "Long Haircuts",
      "Pixie & Short Cuts",
      "Curly Haircuts",
      "Razor Cuts",
      "Clipper Cuts",
      "Fades",
      "Tapers",
      "Textured Cuts",
      "Beard Trims & Grooming",
    ],
  },
  {
    category: "Natural & Textured Hair",
    specialties: [
      "Natural Hair",
      "Curly Hair",
      "Coily Hair",
      "Braids",
      "Locs",
      "Twists",
      "Silk Press",
      "Protective Styles",
    ],
  },
  {
    category: "Extensions & Hair Enhancement",
    specialties: [
      "Hair Extensions",
      "Hand-Tied Extensions",
      "Tape-In Extensions",
      "I-Tip/K-Tip Extensions",
      "Sew-Ins/Weaves",
      "Wigs & Hairpieces",
    ],
  },
  {
    category: "Styling & Special Occasions",
    specialties: [
      "Blowouts",
      "Bridal Hair",
      "Special Occasion & Event Styling",
      "Updos",
      "Formal Styling",
    ],
  },
  {
    category: "Texture, Treatments & Hair Care",
    specialties: [
      "Keratin & Smoothing Treatments",
      "Modern & Trending Techniques",
      "Perms",
      "Relaxers",
      "Scalp Treatments",
      "Hair Repair & Conditioning Treatments",
      "Thinning Hair & Hair Loss Services",
      "Dematting",
    ],
  },
];

// Flat version for places that don't need category headings,
// such as search filters and validation.
export const SPECIALTIES = SPECIALTY_GROUPS.flatMap(
  (group) => group.specialties
);
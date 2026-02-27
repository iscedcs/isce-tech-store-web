export const FOOTER_LINKS = {
  Company: [
    { name: "About Company", href: "https://www.isce.tech/about" },
    // { name: "Blog", href: "#" },
    { name: "Partners", href: "https://www.isce.tech/#customers" },
  ],
  "Address Business": [
    { name: "Amg workspace, Festac Town", href: null },
    { name: "Lagos, Nigeria", href: null },
  ],
  Services: [
    { name: "Web Development", href: "https://www.isce.tech/services" },
    { name: "Mobile Development", href: "https://www.isce.tech/services" },
    { name: "Graphics Design", href: "https://www.isce.tech/services" },
    {
      name: "Consultation",
      href: "https://www.isce.tech/quote",
    },
  ],
  "Quick Link": [
    { name: "About Company", href: "https://www.isce.tech/about" },
    { name: "Need a Career", href: "https://www.palmtechniq.com/courses" },
    { name: "Meet Our Team", href: "https://www.isce.tech/profile" },
    { name: "Clients Feedback", href: "https://www.isce.tech/#customers" },
    { name: "Contact Us", href: "https://www.isce.tech/contact" },
  ],
};

export const CONTACT_INFO = {
  email: "hello@isce.tech",
  phone: "+2349137206365",
};

export const SOCIAL_LINKS = [
  {
    name: "Instagram",
    href: "https://www.instagram.com/iscetech",
    icon: "Instagram",
  },
  { name: "Twitter", href: "#", icon: "Twitter" },
  { name: "Linkedin", href: "#", icon: "Linkedin" },
  { name: "Youtube", href: "#", icon: "Youtube" },
];

export const PRODUCTS: Record<string, any> = {
  "classic-digital-business-card": {
    id: "1",
    slug: "classic-digital-business-card",
    title: "Classic Digital Business Card",
    price: 32.99,
    rating: 4.9,
    reviewCount: 4.8,
    description:
      "Premium NFC business card with instant contact sharing. Tap to share your digital profile, social media, and portfolio",
    benefits: ["Stylish Design", "Wireless Payment", "Contactless Access"],
    imageSrc: "/products/alabaster-prime.jpeg",
    badge: "NFC",
  },
  "nfc-stickers": {
    id: "2",
    slug: "nfc-stickers",
    title: "IISCE Stickers",
    price: 32.99,
    rating: 4.8,
    reviewCount: 6.8,
    description:
      "Premium NFC stickers with instant contact sharing. Tap to share your digital profile, social media, and portfolio",
    benefits: ["Stylish Design", "Wireless Payment", "Contactless Access"],
    imageSrc: "/products/obsidian-reserve.jpeg",
    badge: "NFC",
  },
  "nfc-smart-watch": {
    id: "3",
    slug: "nfc-smart-watch",
    title: "NFC Smart Watch",
    price: 32.99,
    rating: 4.8,
    reviewCount: 6.8,
    description:
      "Premium NFC business card with instant contact sharing. Tap to share your digital profile, social media, and portfolio",
    benefits: ["Stylish Design", "Wireless Payment", "Contactless Access"],
    imageSrc: "/products/amethyst-reserve.jpeg",
    badge: "NFC",
  },
};

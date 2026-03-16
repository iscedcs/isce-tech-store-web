export const FOOTER_LINKS = {
  Company: [
    { name: "About Company", href: "https://www.isce.tech/about" },
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
  "alabaster-prime": {
    id: "1",
    slug: "alabaster-prime",
    title: "Alabaster Prime",
    category: "SMART DEVICE",
    price: 25000,
    rating: 4.9,
    reviewCount: 10,
    description:
      "Effortlessly modernize your networking with Alabaster Prime; the pristine edition of the ISCE Contactless Card. Designed for executives, creatives, and professionals who lead with clarity, this exquisitely white, smart card lets you instantly share your contact details, social platforms, portfolio links, website, and more by simply tapping it on any smartphone.",
    longDescription:
      "No app downloads or installations needed. Each card connects to your dynamic, editable digital profile and features an integrated QR code backup for universal access; ensuring your information is always within reach.",
    features: [
      "Smart Tap-to-Share Contact Info (No App Required)",
      "Personalized QR Code Backup",
      "Fully Customizable Digital Profile",
      "Real-Time Profile Updates (Instant Edits Reflect Everywhere)",
      "Multi-Link Sharing (Website, Socials, Portfolio, Files)",
    ],
    brandFeel: ["Timeless", "Elite", "Architectural", "Minimal luxury"],
    imageSrc: "/products/alabaster-prime.jpeg",
    badge: "SMART DEVICE",
    colors: ["White"],
  },
  "obsidian-reserve": {
    id: "2",
    slug: "obsidian-reserve",
    title: "Obsidian Reserve",
    category: "SMART DEVICE",
    price: 25000,
    rating: 4.9,
    reviewCount: 30,
    description:
      "Present your professional identity with commanding presence and sophistication. The Obsidian Reserve ISCE Contactless Card encapsulates bold elegance, enabling seamless smart sharing and universal connectivity. With a single tap or scan, recipients access your contact details, biography, social links, and website.",
    longDescription:
      "All from one elegant digital profile that adapts as your professional journey evolves. Designed for individuals who command respect without needing to speak loudly.",
    features: [
      "Contactless smart Sharing (Instant Accessibility)",
      "Backup QR Code for Non-NFC Devices",
      "Custom Digital Profile & Vanity Links",
      "Live Updates Without Reprints",
      "Multi-Platform Link Integration (Email, Socials, Sites)",
    ],
    brandFeel: ["Powerful", "Exclusive", "Executive dominance"],
    imageSrc: "/products/obsidian-reserve.jpeg",
    badge: "SMART DEVICE",
    colors: ["Black"],
  },
  "viridian-signature": {
    id: "3",
    slug: "viridian-signature",
    title: "Viridian Signature",
    category: "SMART DEVICE",
    price: 25000,
    rating: 4.8,
    reviewCount: 20,
    description:
      "Step into networking with style and confidence. The Viridian Signature card blends tech innovation with timeless design; perfect for disruptors, visionaries, and professionals forging meaningful connections. Smart technology lets you share your profile instantly with a tap.",
    longDescription:
      "The integrated QR ensures universal compatibility. Keep your qualified leads informed and stay connected without repeating your details.",
    features: [
      "Tap-to-Connect with smart Technology",
      "Always-Accessible QR Code Option",
      "Editable Digital Profile (Name, Role, Bio, Links)",
      "Unlimited Link Sharing (Websites, Portfolios, Media)",
      "Instant Profile Updates in Real-Time",
    ],
    brandFeel: ["Innovative", "Distinct", "Refined confidence"],
    imageSrc: "/products/viridian-signature.jpeg",
    badge: "SMART DEVICE",
    colors: ["Green"],
  },
  "rose-eclat": {
    id: "4",
    slug: "rose-eclat",
    title: "Rose Éclat",
    category: "SMART DEVICE",
    price: 25000,
    rating: 4.7,
    reviewCount: 10,
    description:
      "Delicately radiant yet unmistakably professional; Rose Éclat brings refined elegance to how you introduce yourself. Built on the same advanced ISCE digital ecosystem, this edition empowers you to share your contact data, social platforms, project links, and more.",
    longDescription:
      "Whether at conferences, meetings, or casual introductions, your curated digital identity stays in perfect sync with your evolving story.",
    features: [
      "Contactless smart Tap Sharing",
      "Dual Sharing with Integrated QR Code",
      "Dynamic & Customizable Profile Dashboard",
      "Online Profile Updates on Demand",
      "Rich Multi-Link Support (Socials, Contact, Media)",
    ],
    brandFeel: ["Radiant", "Elegant", "Contemporary luxury"],
    imageSrc: "/products/rose-eclat.jpeg",
    badge: "SMART DEVICE",
    colors: ["Pink"],
  },
  "amethyst-reserve": {
    id: "5",
    slug: "amethyst-reserve",
    title: "Amethyst Reserve",
    category: "SMART DEVICE",
    price: 25000,
    rating: 4.9,
    reviewCount: 50,
    description:
      "Powered by sophistication and thoughtful design, the Amethyst Reserve card ensures your first impression always resonates. With seamless smart functionality and universally accessible QR sharing, recipients can explore your digital business profile instantly.",
    longDescription:
      "No app or login required. Perfect for entrepreneurs, creators, and professionals with a story to share.",
    features: [
      "Smart Tap-to-Share Networking",
      "Backup QR Code for Any Device",
      "Custom Digital Profile with Live Editing",
      "Multi-Channel Link Sharing (Socials, Portfolio, Resources)",
      "Real-Time Updates on Every Interaction",
    ],
    brandFeel: ["Regal", "Creative", "Elite distinction"],
    imageSrc: "/products/amethyst-reserve.jpeg",
    badge: "SMART DEVICE",
    colors: ["Purple"],
  },
};

export const PRODUCT_CATEGORIES = [
  "All",
  "WEARABLE",
  "SMART DEVICE",
  "ACCESSORIES",
];

export const AUTH_API = process.env.ISCE_AUTH_BACKEND_URL;
export const baseUrl = process.env.NEXT_PUBLIC_API_URL;
export const GIG_Logistics = process.env.GIG_BASE_URL;

export const URLS = {
  auth: {
    sign_up: "/auth/signup",
    sign_in: "/auth/signin",
    sign_out: "/auth/signout",
    reset_token: "/auth/send-reset-token",
    reset_password: "/auth/reset-password",
  },
  user: {
    one: "/user/one/{id}",
  },
  device: {
    request_token: "/device/request-token",
    create: "/device/create",
  },
};

const DEVICE_TYPE_MAPPING = {
  CARD: "6214bdef7dbcb",
  WRISTBAND: "6214bdef6dbcb",
  STICKER: "6214bdef5dbcb",
  KEYCHAIN: "6214bdef4dbcb",
};

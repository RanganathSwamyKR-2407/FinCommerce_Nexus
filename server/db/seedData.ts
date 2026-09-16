export interface DBProduct {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: number; // In INR (₹)
  compareAtPrice?: number;
  categoryName: string;
  sellerName: string;
  sellerCity: string;
  imageUrl: string;
  galleryUrls: string[];
  stockQuantity: number;
  rating: number;
  reviewCount: number;
  isFeatured: boolean;
  tags: string[];
  emiPerMonth: number;
  specs?: Record<string, string>;
}

export interface DBCategory {
  id: number;
  name: string;
  slug: string;
  description: string;
  icon: string;
}

export const initialCategories: DBCategory[] = [
  {
    id: 1,
    name: 'Smart Tech & Sound',
    slug: 'smart-tech-sound',
    description: 'Noise-cancelling wireless earbuds, high-res audio DACs, and precision soundbars.',
    icon: 'Headphones',
  },
  {
    id: 2,
    name: 'Artisanal & Handloom',
    slug: 'artisanal-handloom',
    description: 'Authentic Indian handicrafts, Kashmiri Pashmina, Varanasi pure silk, and brass accents.',
    icon: 'Sparkles',
  },
  {
    id: 3,
    name: 'Workspace & Ergonomics',
    slug: 'workspace-ergonomics',
    description: 'Solid Sheesham wood desk risers, mechanical keyboards with bilingual keycaps, and ergonomic chairs.',
    icon: 'Monitor',
  },
  {
    id: 4,
    name: 'Organics & Superfoods',
    slug: 'organics-superfoods',
    description: 'Coorg single-origin Arabica, Kashmiri saffron, cold-pressed virgin oils, and raw forest honey.',
    icon: 'ShoppingBag',
  },
  {
    id: 5,
    name: 'FinCommerce Hardware',
    slug: 'fincommerce-hardware',
    description: 'Bharat Soundbox audio payment alert units, contactless Micro-POS terminals, and biometric hardware vaults.',
    icon: 'CreditCard',
  },
];

export const initialProducts: DBProduct[] = [
  {
    id: 1,
    name: 'Bharat Soundbox Pro 4G with Multilingual Voice',
    slug: 'bharat-soundbox-pro-4g',
    description: 'Instant loud voice confirmation for all UPI and QR payments in 11 Indian regional languages. Features high-gain 4G dual-SIM auto-switch, 5-day battery backup, and rugged splash-resistant housing built for Indian retail counters.',
    price: 1899.00,
    compareAtPrice: 2499.00,
    categoryName: 'FinCommerce Hardware',
    sellerName: 'Bengaluru Tech Instruments',
    sellerCity: 'Bengaluru, Karnataka',
    imageUrl: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=1200&auto=format&fit=crop&q=85',
    galleryUrls: [
      'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=1200&auto=format&fit=crop&q=85',
      'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&auto=format&fit=crop&q=85',
      'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=1200&auto=format&fit=crop&q=85'
    ],
    stockQuantity: 45,
    rating: 4.9,
    reviewCount: 412,
    isFeatured: true,
    tags: ['upi soundbox', 'qr audio', 'multilingual', 'merchant', '4g'],
    emiPerMonth: 633,
    specs: {
      'Languages': 'English, Hindi, Kannada, Tamil, Telugu, Marathi + 5 more',
      'Connectivity': '4G LTE Dual SIM + 2.4GHz Wi-Fi',
      'Battery Life': '120 Hours Continuous Standby',
      'Audio Output': '95dB High-Clarity Amplifier'
    }
  },
  {
    id: 2,
    name: 'Aura Wave Pro Wireless ANC Earbuds (Spatial Audio)',
    slug: 'aura-wave-pro-wireless-anc',
    description: 'Flagship hybrid active noise cancellation (up to 48dB) tailored for bustling metro environments. Powered by dual 11mm graphene drivers, LDAC high-res decoding, and 38 hours of playtime with rapid warp charge.',
    price: 4499.00,
    compareAtPrice: 5999.00,
    categoryName: 'Smart Tech & Sound',
    sellerName: 'Sonic Bharat Labs',
    sellerCity: 'Hyderabad, Telangana',
    imageUrl: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=1200&auto=format&fit=crop&q=85',
    galleryUrls: [
      'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=1200&auto=format&fit=crop&q=85',
      'https://images.unsplash.com/photo-1572536147248-ac59a8abfa4b?w=1200&auto=format&fit=crop&q=85',
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1200&auto=format&fit=crop&q=85'
    ],
    stockQuantity: 28,
    rating: 4.8,
    reviewCount: 184,
    isFeatured: true,
    tags: ['anc', 'wireless', 'bluetooth 5.3', 'spatial audio'],
    emiPerMonth: 1500,
    specs: {
      'Noise Reduction': '48dB Hybrid ANC',
      'Battery': '38 Hours Total (Earbuds + Case)',
      'Fast Charge': '10 Mins gives 5 Hours Play',
      'Water Resistance': 'IPX5 Sweat Resistant'
    }
  },
  {
    id: 3,
    name: 'Handwoven Cashmere Pashmina Stole (GI Certified)',
    slug: 'handwoven-cashmere-pashmina-stole',
    description: 'Crafted from authentic Changthangi goat wool hand-spun on traditional charkhas in the Kashmir valley. Featuring delicate Sozni needlework borders, feather-light weight (120g), and heirloom thermal warmth.',
    price: 8999.00,
    compareAtPrice: 11500.00,
    categoryName: 'Artisanal & Handloom',
    sellerName: 'Kashmir Heritage Craftsmen',
    sellerCity: 'Srinagar, Jammu & Kashmir',
    imageUrl: 'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=1200&auto=format&fit=crop&q=85',
    galleryUrls: [
      'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=1200&auto=format&fit=crop&q=85',
      'https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?w=1200&auto=format&fit=crop&q=85',
      'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=1200&auto=format&fit=crop&q=85'
    ],
    stockQuantity: 12,
    rating: 4.95,
    reviewCount: 96,
    isFeatured: true,
    tags: ['pashmina', 'cashmere', 'gi-certified', 'handloom', 'kashmir'],
    emiPerMonth: 3000,
    specs: {
      'Material': '100% Changthangi Cashmere',
      'Weave': 'Traditional Charkha Handspun Diamond Weave',
      'Certification': 'Geographical Indication (GI) Tagged',
      'Dimensions': '200cm x 70cm'
    }
  },
  {
    id: 4,
    name: 'Solid Sheesham Wood Dual-Monitor Ergonomic Riser',
    slug: 'sheesham-wood-monitor-riser',
    description: 'Handcrafted from kiln-dried Indian Rosewood (Sheesham) with natural grain honey wax finish. Elevated height promotes optimal spinal alignment and declutters desks with integrated phone dock, pen groove, and keyboard garage.',
    price: 2799.00,
    compareAtPrice: 3499.00,
    categoryName: 'Workspace & Ergonomics',
    sellerName: 'Rajasthan Timber & Guild',
    sellerCity: 'Jodhpur, Rajasthan',
    imageUrl: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=1200&auto=format&fit=crop&q=85',
    galleryUrls: [
      'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=1200&auto=format&fit=crop&q=85',
      'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=1200&auto=format&fit=crop&q=85',
      'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=1200&auto=format&fit=crop&q=85'
    ],
    stockQuantity: 24,
    rating: 4.85,
    reviewCount: 230,
    isFeatured: false,
    tags: ['sheesham', 'desk organizer', 'ergonomic', 'artisan', 'solid wood'],
    emiPerMonth: 933,
    specs: {
      'Wood': 'Sustainable Indian Sheesham (Rosewood)',
      'Load Capacity': 'Tested up to 35 kg',
      'Dimensions': '105cm x 24cm x 11cm',
      'Finish': 'Zero-VOC Eco Honey Wax'
    }
  },
  {
    id: 5,
    name: 'Coorg Single-Estate Arabica Roast & Brass Filter Set',
    slug: 'coorg-arabica-brass-filter-set',
    description: 'Shade-grown under silver oak canopies in the Western Ghats at 3,800ft elevation. Medium-dark roast paired with a traditional heavy-gauge Kumbakonam virgin brass South Indian drip filter.',
    price: 1299.00,
    compareAtPrice: 1599.00,
    categoryName: 'Organics & Superfoods',
    sellerName: 'Coorg Estate Coffee Roasters',
    sellerCity: 'Madikeri, Karnataka',
    imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=1200&auto=format&fit=crop&q=85',
    galleryUrls: [
      'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=1200&auto=format&fit=crop&q=85',
      'https://images.unsplash.com/photo-1511920170033-f8396924c348?w=1200&auto=format&fit=crop&q=85',
      'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1200&auto=format&fit=crop&q=85'
    ],
    stockQuantity: 65,
    rating: 4.9,
    reviewCount: 310,
    isFeatured: false,
    tags: ['coffee', 'filter coffee', 'brass', 'coorg', 'organic'],
    emiPerMonth: 433,
    specs: {
      'Origin': 'Western Ghats, Coorg (3,800 ft)',
      'Roast Profile': 'Medium-Dark Slow Drum Roast',
      'Tasting Notes': 'Dark Chocolate, Roasted Hazelnut, Caramel',
      'Hardware': 'Pure Food-Grade Heavy Brass Filter (200ml)'
    }
  },
  {
    id: 6,
    name: 'FinCommerce Tap-to-Pay Micro POS & RuPay Terminal',
    slug: 'fincommerce-tap-to-pay-pos',
    description: 'Pocket-sized EMV contactless card & UPI QR reader. Connects via Bluetooth to any Android or iOS smartphone. 0% transaction MDR on RuPay debit cards & UPI transactions under ₹2,000.',
    price: 2499.00,
    compareAtPrice: 3199.00,
    categoryName: 'FinCommerce Hardware',
    sellerName: 'FinCommerce Payment Systems',
    sellerCity: 'Mumbai, Maharashtra',
    imageUrl: 'https://images.unsplash.com/photo-1556740758-90de374c12ad?w=1200&auto=format&fit=crop&q=85',
    galleryUrls: [
      'https://images.unsplash.com/photo-1556740758-90de374c12ad?w=1200&auto=format&fit=crop&q=85',
      'https://images.unsplash.com/photo-1556742031-c6961e8560b0?w=1200&auto=format&fit=crop&q=85',
      'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=1200&auto=format&fit=crop&q=85'
    ],
    stockQuantity: 35,
    rating: 4.88,
    reviewCount: 178,
    isFeatured: false,
    tags: ['pos', 'rupay', 'nfc', 'contactless', 'merchant'],
    emiPerMonth: 833,
    specs: {
      'Supported Payments': 'UPI QR, RuPay Contactless, Visa, Mastercard',
      'Compliance': 'PCI-PTS 6.x & EMVCo L1/L2 Certified',
      'Battery': '800 Transactions per Charge',
      'Connectivity': 'BLE 5.2 + USB-C'
    }
  },
  {
    id: 7,
    name: 'Devanagari Bilingual Wireless Mechanical Keyboard (Hot-Swap)',
    slug: 'devanagari-bilingual-mechanical-keyboard',
    description: 'Precision 75% mechanical keyboard with laser-etched English & Devanagari Hindi legends. Pre-lubed linear switches, sound-dampening silicone gaskets, and tri-mode connectivity (2.4GHz, Bluetooth 5.0, USB-C).',
    price: 3899.00,
    compareAtPrice: 4799.00,
    categoryName: 'Workspace & Ergonomics',
    sellerName: 'Akshar Mechanical Studio',
    sellerCity: 'Pune, Maharashtra',
    imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=1200&auto=format&fit=crop&q=85',
    galleryUrls: [
      'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=1200&auto=format&fit=crop&q=85',
      'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=1200&auto=format&fit=crop&q=85',
      'https://images.unsplash.com/photo-1595225476474-87563907a212?w=1200&auto=format&fit=crop&q=85'
    ],
    stockQuantity: 20,
    rating: 4.82,
    reviewCount: 142,
    isFeatured: false,
    tags: ['keyboard', 'devanagari', 'mechanical', 'hindi', 'ergonomic'],
    emiPerMonth: 1300,
    specs: {
      'Switches': 'Custom Pre-lubed Gateron Yellow Linear',
      'Keycaps': 'Double-shot PBT with Devanagari Sub-legends',
      'Battery': '4,000mAh (Up to 200 Hours without RGB)',
      'Compatibility': 'Windows, macOS, Linux, Android'
    }
  },
  {
    id: 8,
    name: 'Kashmiri Mogra Saffron (10g) & Raw Forest Honey Reserve',
    slug: 'kashmiri-saffron-forest-honey-reserve',
    description: 'Grade-A1 certified deep-crimson saffron filaments harvested at dawn in Pampore, paired with unpasteurized multifloral honey collected by tribal cooperatives in the Jim Corbett biosphere.',
    price: 2199.00,
    compareAtPrice: 2899.00,
    categoryName: 'Organics & Superfoods',
    sellerName: 'Pampore Golden Spice Cooperative',
    sellerCity: 'Pampore, Jammu & Kashmir',
    imageUrl: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=1200&auto=format&fit=crop&q=85',
    galleryUrls: [
      'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=1200&auto=format&fit=crop&q=85',
      'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=1200&auto=format&fit=crop&q=85',
      'https://images.unsplash.com/photo-1509358271058-acd22cc93898?w=1200&auto=format&fit=crop&q=85'
    ],
    stockQuantity: 50,
    rating: 4.93,
    reviewCount: 224,
    isFeatured: false,
    tags: ['saffron', 'honey', 'ayurvedic', 'organic', 'pampore'],
    emiPerMonth: 733,
    specs: {
      'Saffron Grade': 'ISO 3632 Category 1 Certified (Mogra)',
      'Honey Processing': 'Unfiltered, Raw, Cold-Extracted',
      'Weight': '10g Saffron + 500g Glass Jar Forest Honey',
      'Harvest': 'Current Autumn Crop'
    }
  }
];

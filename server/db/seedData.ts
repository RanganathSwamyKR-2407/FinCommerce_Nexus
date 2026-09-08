import bcrypt from 'bcryptjs';

export interface DBProduct {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  categoryName: string;
  imageUrl: string;
  galleryUrls: string[];
  stockQuantity: number;
  rating: number;
  reviewCount: number;
  isFeatured: boolean;
  tags: string[];
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
    name: 'Audio & Acoustics',
    slug: 'audio-acoustics',
    description: 'Studio-grade headphones, wireless earbuds, and precision soundbars.',
    icon: 'Headphones',
  },
  {
    id: 2,
    name: 'Smart Workspace',
    slug: 'smart-workspace',
    description: 'Ergonomic accessories, mechanical keyboards, and 4K displays.',
    icon: 'Monitor',
  },
  {
    id: 3,
    name: 'Wearables & Fitness',
    slug: 'wearables-fitness',
    description: 'Precision biometric smartwatches, rings, and telemetry bands.',
    icon: 'Watch',
  },
  {
    id: 4,
    name: 'Modern Lifestyle',
    slug: 'modern-lifestyle',
    description: 'Minimalist travel bags, titanium daily carry, and smart home lighting.',
    icon: 'Briefcase',
  },
];

export const initialProducts: DBProduct[] = [
  {
    id: 1,
    name: 'Aether Pro Wireless Noise-Cancelling Headphones',
    slug: 'aether-pro-wireless-headphones',
    description: 'Engineered with custom 45mm beryllium drivers and active adaptive noise cancellation. Delivers ultra-low distortion, high-resolution 96kHz/24-bit audio playback, and 40 hours of continuous battery life.',
    price: 349.00,
    compareAtPrice: 399.00,
    categoryName: 'Audio & Acoustics',
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
    galleryUrls: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&auto=format&fit=crop&q=80'
    ],
    stockQuantity: 42,
    rating: 4.9,
    reviewCount: 328,
    isFeatured: true,
    tags: ['wireless', 'noise-cancelling', 'audiophile', 'bluetooth 5.3'],
    specs: {
      'Driver Size': '45mm Beryllium',
      'Battery Life': '40 Hours (ANC On)',
      'Connectivity': 'Bluetooth 5.3 + USB-C DAC',
      'Weight': '265g'
    }
  },
  {
    id: 2,
    name: 'Vanguard Chrono Smartwatch Ultra',
    slug: 'vanguard-chrono-smartwatch-ultra',
    description: 'Aerospace-grade titanium chassis with sapphire crystal display. Continuous cardiovascular monitoring, multi-band GPS tracking, and 100m water resistance for rugged outdoor expeditions.',
    price: 499.00,
    compareAtPrice: 549.00,
    categoryName: 'Wearables & Fitness',
    imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80',
    galleryUrls: [
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800&auto=format&fit=crop&q=80'
    ],
    stockQuantity: 18,
    rating: 4.8,
    reviewCount: 194,
    isFeatured: true,
    tags: ['smartwatch', 'titanium', 'fitness', 'gps'],
    specs: {
      'Case Material': 'Grade 5 Titanium',
      'Display': '1.43" AMOLED 1000 nits',
      'Water Resistance': '10 ATM (100m)',
      'Sensors': 'Optical PPG, ECG, SpO2, Altimeter'
    }
  },
  {
    id: 3,
    name: 'Tactile Lumina 75% Custom Mechanical Keyboard',
    slug: 'tactile-lumina-mechanical-keyboard',
    description: 'CNC-milled solid anodized aluminum housing with gasket-mounted PCB, pre-lubed silent tactile switches, and hot-swappable sockets. Features per-key RGB backlighting and tri-mode wireless connectivity.',
    price: 189.00,
    compareAtPrice: 220.00,
    categoryName: 'Smart Workspace',
    imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80',
    galleryUrls: [
      'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=800&auto=format&fit=crop&q=80'
    ],
    stockQuantity: 27,
    rating: 4.95,
    reviewCount: 412,
    isFeatured: true,
    tags: ['keyboard', 'mechanical', 'custom', 'wireless'],
    specs: {
      'Layout': '75% Compact (82 Keys)',
      'Mounting': 'Poron Gasket Mount',
      'Switches': 'Gateron Oil King (Lubed)',
      'Connectivity': '2.4GHz / Bluetooth / USB-C'
    }
  },
  {
    id: 4,
    name: 'Horizon Minimalist Weatherproof Commuter Backpack',
    slug: 'horizon-commuter-backpack',
    description: 'Crafted from 100% recycled Cordura ripstop nylon with YKK AquaGuard seam-sealed zippers. Features a dedicated suspended 16" laptop sleeve, magnetic Fidlock buckles, and hidden passport security pocket.',
    price: 159.00,
    categoryName: 'Modern Lifestyle',
    imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=80',
    galleryUrls: [
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?w=800&auto=format&fit=crop&q=80'
    ],
    stockQuantity: 35,
    rating: 4.7,
    reviewCount: 167,
    isFeatured: false,
    tags: ['backpack', 'travel', 'waterproof', 'cordura'],
    specs: {
      'Volume': '24 Liters',
      'Laptop Compatibility': 'Up to 16" MacBook Pro',
      'Fabric': '1000D Ballistic Cordura',
      'Weight': '980g'
    }
  },
  {
    id: 5,
    name: 'Orbit Studio Pure Sound True Wireless Earbuds',
    slug: 'orbit-studio-wireless-earbuds',
    description: 'Compact acoustic marvel with hybrid noise cancellation, transparency mode, spatial audio head tracking, and Qi wireless fast charging case.',
    price: 179.00,
    compareAtPrice: 199.00,
    categoryName: 'Audio & Acoustics',
    imageUrl: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&auto=format&fit=crop&q=80',
    galleryUrls: [
      'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&auto=format&fit=crop&q=80'
    ],
    stockQuantity: 64,
    rating: 4.85,
    reviewCount: 289,
    isFeatured: true,
    tags: ['earbuds', 'wireless', 'anc', 'spatial-audio'],
    specs: {
      'Battery': '8 hrs + 24 hrs with Case',
      'Water Resistance': 'IPX5 Sweat Resistant',
      'Codecs': 'LDAC, AAC, aptX Lossless'
    }
  },
  {
    id: 6,
    name: 'Solace Ergonomic Desk Light Bar with Auto-Dimming',
    slug: 'solace-desk-light-bar',
    description: 'Asymmetric optical design illuminates your desk without glare on monitors. Built-in ambient light sensor balances circadian color temperatures from 2700K to 6500K.',
    price: 89.00,
    compareAtPrice: 110.00,
    categoryName: 'Smart Workspace',
    imageUrl: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&auto=format&fit=crop&q=80',
    galleryUrls: [
      'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&auto=format&fit=crop&q=80'
    ],
    stockQuantity: 50,
    rating: 4.75,
    reviewCount: 142,
    isFeatured: false,
    tags: ['lighting', 'desk-setup', 'ergonomic', 'led'],
    specs: {
      'CRI': 'Ra > 97 High Fidelity',
      'Color Temperature': '2700K - 6500K Adjustable',
      'Power': 'USB-C Powered (5V/2A)'
    }
  },
  {
    id: 7,
    name: 'Aura Smart Sleep & Biometrics Recovery Ring',
    slug: 'aura-smart-sleep-ring',
    description: 'Featherweight titanium sleep tracker delivering medical-grade body temperature variations, HRV monitoring, and recovery score algorithms.',
    price: 279.00,
    categoryName: 'Wearables & Fitness',
    imageUrl: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&auto=format&fit=crop&q=80',
    galleryUrls: [
      'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&auto=format&fit=crop&q=80'
    ],
    stockQuantity: 22,
    rating: 4.65,
    reviewCount: 88,
    isFeatured: false,
    tags: ['sleep', 'health', 'ring', 'titanium'],
    specs: {
      'Material': 'Brushed Titanium / Diamond-Like Carbon',
      'Battery Life': 'Up to 7 Days',
      'Weight': '4 to 6 grams (size dependent)'
    }
  },
  {
    id: 8,
    name: 'Zenith MagSafe 3-in-1 Fast Wireless Charging Station',
    slug: 'zenith-magsafe-charging-station',
    description: 'Precision machined solid aluminum weighted base. Charges iPhone at full 15W Qi2 fast speeds, Apple Watch rapid charging, and AirPods simultaneously.',
    price: 129.00,
    compareAtPrice: 149.00,
    categoryName: 'Smart Workspace',
    imageUrl: 'https://images.unsplash.com/photo-1622445262464-84b1456045b6?w=800&auto=format&fit=crop&q=80',
    galleryUrls: [
      'https://images.unsplash.com/photo-1622445262464-84b1456045b6?w=800&auto=format&fit=crop&q=80'
    ],
    stockQuantity: 40,
    rating: 4.88,
    reviewCount: 206,
    isFeatured: true,
    tags: ['charging', 'magsafe', 'apple', 'minimalist'],
    specs: {
      'Output': '15W MagSafe + 5W Watch + 5W Pad',
      'Adapter Included': '45W GaN USB-C Charger',
      'Material': 'Space Gray Aircraft Aluminum'
    }
  },
  {
    id: 9,
    name: 'Prism 4K Ultra-Wide Color-Accurate Creator Monitor',
    slug: 'prism-4k-ultrawide-monitor',
    description: '32-inch 4K IPS Black panel with 99% DCI-P3 coverage, factory Delta E < 1 calibration, Thunderbolt 4 96W power delivery, and built-in KVM switch.',
    price: 849.00,
    compareAtPrice: 999.00,
    categoryName: 'Smart Workspace',
    imageUrl: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&auto=format&fit=crop&q=80',
    galleryUrls: [
      'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&auto=format&fit=crop&q=80'
    ],
    stockQuantity: 12,
    rating: 4.92,
    reviewCount: 74,
    isFeatured: true,
    tags: ['monitor', '4k', 'thunderbolt', 'creator'],
    specs: {
      'Resolution': '3840 x 2160 @ 120Hz',
      'Color Gamut': '99% DCI-P3, 100% sRGB',
      'Port Array': 'Thunderbolt 4, HDMI 2.1, DP 1.4, Hub'
    }
  },
  {
    id: 10,
    name: 'Nomad Grade-5 Titanium Everyday Pocket Knife',
    slug: 'nomad-titanium-pocket-knife',
    description: 'Sleek EDC folding knife featuring a CPM-S35VN crucible steel blade, ball bearing pivot action, and deep-carry reversible titanium pocket clip.',
    price: 119.00,
    categoryName: 'Modern Lifestyle',
    imageUrl: 'https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?w=800&auto=format&fit=crop&q=80',
    galleryUrls: [
      'https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?w=800&auto=format&fit=crop&q=80'
    ],
    stockQuantity: 30,
    rating: 4.79,
    reviewCount: 95,
    isFeatured: false,
    tags: ['edc', 'titanium', 'steel', 'gear'],
    specs: {
      'Blade Steel': 'CPM-S35VN Stainless',
      'Blade Length': '2.95 Inches (75mm)',
      'Lock Mechanism': 'Precision Frame Lock'
    }
  },
  {
    id: 11,
    name: 'Echo Pod Hi-Res Spatial Smart Speaker',
    slug: 'echo-pod-smart-speaker',
    description: 'Room-filling 360-degree acoustic performance with custom woofer, five beamforming tweeters, real-time room calibration, and lossless Wi-Fi streaming.',
    price: 229.00,
    compareAtPrice: 249.00,
    categoryName: 'Audio & Acoustics',
    imageUrl: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800&auto=format&fit=crop&q=80',
    galleryUrls: [
      'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800&auto=format&fit=crop&q=80'
    ],
    stockQuantity: 45,
    rating: 4.81,
    reviewCount: 178,
    isFeatured: false,
    tags: ['speaker', 'airplay', 'audio', 'smart-home'],
    specs: {
      'Amplification': 'Class-D Digital Amps (80W)',
      'Connectivity': 'Wi-Fi 6, AirPlay 2, Spotify Connect',
      'Frequency Range': '35Hz - 22,000Hz'
    }
  },
  {
    id: 12,
    name: 'Atlas Carbon Fiber Cardholder & RFID Shield Wallet',
    slug: 'atlas-carbon-fiber-wallet',
    description: 'Aerospace forged carbon fiber plates with expandable silicone money strap and quick-eject mechanical thumb card slider holding up to 12 cards.',
    price: 79.00,
    compareAtPrice: 95.00,
    categoryName: 'Modern Lifestyle',
    imageUrl: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=800&auto=format&fit=crop&q=80',
    galleryUrls: [
      'https://images.unsplash.com/photo-1627123424574-724758594e93?w=800&auto=format&fit=crop&q=80'
    ],
    stockQuantity: 55,
    rating: 4.87,
    reviewCount: 310,
    isFeatured: true,
    tags: ['wallet', 'carbon-fiber', 'rfid', 'minimalist'],
    specs: {
      'Capacity': '1 to 12 Cards + Cash',
      'Protection': 'Military RFID/NFC Blocking',
      'Weight': '1.6 oz (45g)'
    }
  }
];

export async function getHashedDemoPassword() {
  return await bcrypt.hash('password123', 10);
}

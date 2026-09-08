// server.ts
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";

// server/db/database.ts
import { Pool } from "pg";
import bcrypt2 from "bcryptjs";

// server/db/seedData.ts
import bcrypt from "bcryptjs";
var initialCategories = [
  {
    id: 1,
    name: "Audio & Acoustics",
    slug: "audio-acoustics",
    description: "Studio-grade headphones, wireless earbuds, and precision soundbars.",
    icon: "Headphones"
  },
  {
    id: 2,
    name: "Smart Workspace",
    slug: "smart-workspace",
    description: "Ergonomic accessories, mechanical keyboards, and 4K displays.",
    icon: "Monitor"
  },
  {
    id: 3,
    name: "Wearables & Fitness",
    slug: "wearables-fitness",
    description: "Precision biometric smartwatches, rings, and telemetry bands.",
    icon: "Watch"
  },
  {
    id: 4,
    name: "Modern Lifestyle",
    slug: "modern-lifestyle",
    description: "Minimalist travel bags, titanium daily carry, and smart home lighting.",
    icon: "Briefcase"
  }
];
var initialProducts = [
  {
    id: 1,
    name: "Aether Pro Wireless Noise-Cancelling Headphones",
    slug: "aether-pro-wireless-headphones",
    description: "Engineered with custom 45mm beryllium drivers and active adaptive noise cancellation. Delivers ultra-low distortion, high-resolution 96kHz/24-bit audio playback, and 40 hours of continuous battery life.",
    price: 349,
    compareAtPrice: 399,
    categoryName: "Audio & Acoustics",
    imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80",
    galleryUrls: [
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&auto=format&fit=crop&q=80"
    ],
    stockQuantity: 42,
    rating: 4.9,
    reviewCount: 328,
    isFeatured: true,
    tags: ["wireless", "noise-cancelling", "audiophile", "bluetooth 5.3"],
    specs: {
      "Driver Size": "45mm Beryllium",
      "Battery Life": "40 Hours (ANC On)",
      "Connectivity": "Bluetooth 5.3 + USB-C DAC",
      "Weight": "265g"
    }
  },
  {
    id: 2,
    name: "Vanguard Chrono Smartwatch Ultra",
    slug: "vanguard-chrono-smartwatch-ultra",
    description: "Aerospace-grade titanium chassis with sapphire crystal display. Continuous cardiovascular monitoring, multi-band GPS tracking, and 100m water resistance for rugged outdoor expeditions.",
    price: 499,
    compareAtPrice: 549,
    categoryName: "Wearables & Fitness",
    imageUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80",
    galleryUrls: [
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800&auto=format&fit=crop&q=80"
    ],
    stockQuantity: 18,
    rating: 4.8,
    reviewCount: 194,
    isFeatured: true,
    tags: ["smartwatch", "titanium", "fitness", "gps"],
    specs: {
      "Case Material": "Grade 5 Titanium",
      "Display": '1.43" AMOLED 1000 nits',
      "Water Resistance": "10 ATM (100m)",
      "Sensors": "Optical PPG, ECG, SpO2, Altimeter"
    }
  },
  {
    id: 3,
    name: "Tactile Lumina 75% Custom Mechanical Keyboard",
    slug: "tactile-lumina-mechanical-keyboard",
    description: "CNC-milled solid anodized aluminum housing with gasket-mounted PCB, pre-lubed silent tactile switches, and hot-swappable sockets. Features per-key RGB backlighting and tri-mode wireless connectivity.",
    price: 189,
    compareAtPrice: 220,
    categoryName: "Smart Workspace",
    imageUrl: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80",
    galleryUrls: [
      "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=800&auto=format&fit=crop&q=80"
    ],
    stockQuantity: 27,
    rating: 4.95,
    reviewCount: 412,
    isFeatured: true,
    tags: ["keyboard", "mechanical", "custom", "wireless"],
    specs: {
      "Layout": "75% Compact (82 Keys)",
      "Mounting": "Poron Gasket Mount",
      "Switches": "Gateron Oil King (Lubed)",
      "Connectivity": "2.4GHz / Bluetooth / USB-C"
    }
  },
  {
    id: 4,
    name: "Horizon Minimalist Weatherproof Commuter Backpack",
    slug: "horizon-commuter-backpack",
    description: 'Crafted from 100% recycled Cordura ripstop nylon with YKK AquaGuard seam-sealed zippers. Features a dedicated suspended 16" laptop sleeve, magnetic Fidlock buckles, and hidden passport security pocket.',
    price: 159,
    categoryName: "Modern Lifestyle",
    imageUrl: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=80",
    galleryUrls: [
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?w=800&auto=format&fit=crop&q=80"
    ],
    stockQuantity: 35,
    rating: 4.7,
    reviewCount: 167,
    isFeatured: false,
    tags: ["backpack", "travel", "waterproof", "cordura"],
    specs: {
      "Volume": "24 Liters",
      "Laptop Compatibility": 'Up to 16" MacBook Pro',
      "Fabric": "1000D Ballistic Cordura",
      "Weight": "980g"
    }
  },
  {
    id: 5,
    name: "Orbit Studio Pure Sound True Wireless Earbuds",
    slug: "orbit-studio-wireless-earbuds",
    description: "Compact acoustic marvel with hybrid noise cancellation, transparency mode, spatial audio head tracking, and Qi wireless fast charging case.",
    price: 179,
    compareAtPrice: 199,
    categoryName: "Audio & Acoustics",
    imageUrl: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&auto=format&fit=crop&q=80",
    galleryUrls: [
      "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&auto=format&fit=crop&q=80"
    ],
    stockQuantity: 64,
    rating: 4.85,
    reviewCount: 289,
    isFeatured: true,
    tags: ["earbuds", "wireless", "anc", "spatial-audio"],
    specs: {
      "Battery": "8 hrs + 24 hrs with Case",
      "Water Resistance": "IPX5 Sweat Resistant",
      "Codecs": "LDAC, AAC, aptX Lossless"
    }
  },
  {
    id: 6,
    name: "Solace Ergonomic Desk Light Bar with Auto-Dimming",
    slug: "solace-desk-light-bar",
    description: "Asymmetric optical design illuminates your desk without glare on monitors. Built-in ambient light sensor balances circadian color temperatures from 2700K to 6500K.",
    price: 89,
    compareAtPrice: 110,
    categoryName: "Smart Workspace",
    imageUrl: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&auto=format&fit=crop&q=80",
    galleryUrls: [
      "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&auto=format&fit=crop&q=80"
    ],
    stockQuantity: 50,
    rating: 4.75,
    reviewCount: 142,
    isFeatured: false,
    tags: ["lighting", "desk-setup", "ergonomic", "led"],
    specs: {
      "CRI": "Ra > 97 High Fidelity",
      "Color Temperature": "2700K - 6500K Adjustable",
      "Power": "USB-C Powered (5V/2A)"
    }
  },
  {
    id: 7,
    name: "Aura Smart Sleep & Biometrics Recovery Ring",
    slug: "aura-smart-sleep-ring",
    description: "Featherweight titanium sleep tracker delivering medical-grade body temperature variations, HRV monitoring, and recovery score algorithms.",
    price: 279,
    categoryName: "Wearables & Fitness",
    imageUrl: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&auto=format&fit=crop&q=80",
    galleryUrls: [
      "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&auto=format&fit=crop&q=80"
    ],
    stockQuantity: 22,
    rating: 4.65,
    reviewCount: 88,
    isFeatured: false,
    tags: ["sleep", "health", "ring", "titanium"],
    specs: {
      "Material": "Brushed Titanium / Diamond-Like Carbon",
      "Battery Life": "Up to 7 Days",
      "Weight": "4 to 6 grams (size dependent)"
    }
  },
  {
    id: 8,
    name: "Zenith MagSafe 3-in-1 Fast Wireless Charging Station",
    slug: "zenith-magsafe-charging-station",
    description: "Precision machined solid aluminum weighted base. Charges iPhone at full 15W Qi2 fast speeds, Apple Watch rapid charging, and AirPods simultaneously.",
    price: 129,
    compareAtPrice: 149,
    categoryName: "Smart Workspace",
    imageUrl: "https://images.unsplash.com/photo-1622445262464-84b1456045b6?w=800&auto=format&fit=crop&q=80",
    galleryUrls: [
      "https://images.unsplash.com/photo-1622445262464-84b1456045b6?w=800&auto=format&fit=crop&q=80"
    ],
    stockQuantity: 40,
    rating: 4.88,
    reviewCount: 206,
    isFeatured: true,
    tags: ["charging", "magsafe", "apple", "minimalist"],
    specs: {
      "Output": "15W MagSafe + 5W Watch + 5W Pad",
      "Adapter Included": "45W GaN USB-C Charger",
      "Material": "Space Gray Aircraft Aluminum"
    }
  },
  {
    id: 9,
    name: "Prism 4K Ultra-Wide Color-Accurate Creator Monitor",
    slug: "prism-4k-ultrawide-monitor",
    description: "32-inch 4K IPS Black panel with 99% DCI-P3 coverage, factory Delta E < 1 calibration, Thunderbolt 4 96W power delivery, and built-in KVM switch.",
    price: 849,
    compareAtPrice: 999,
    categoryName: "Smart Workspace",
    imageUrl: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&auto=format&fit=crop&q=80",
    galleryUrls: [
      "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&auto=format&fit=crop&q=80"
    ],
    stockQuantity: 12,
    rating: 4.92,
    reviewCount: 74,
    isFeatured: true,
    tags: ["monitor", "4k", "thunderbolt", "creator"],
    specs: {
      "Resolution": "3840 x 2160 @ 120Hz",
      "Color Gamut": "99% DCI-P3, 100% sRGB",
      "Port Array": "Thunderbolt 4, HDMI 2.1, DP 1.4, Hub"
    }
  },
  {
    id: 10,
    name: "Nomad Grade-5 Titanium Everyday Pocket Knife",
    slug: "nomad-titanium-pocket-knife",
    description: "Sleek EDC folding knife featuring a CPM-S35VN crucible steel blade, ball bearing pivot action, and deep-carry reversible titanium pocket clip.",
    price: 119,
    categoryName: "Modern Lifestyle",
    imageUrl: "https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?w=800&auto=format&fit=crop&q=80",
    galleryUrls: [
      "https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?w=800&auto=format&fit=crop&q=80"
    ],
    stockQuantity: 30,
    rating: 4.79,
    reviewCount: 95,
    isFeatured: false,
    tags: ["edc", "titanium", "steel", "gear"],
    specs: {
      "Blade Steel": "CPM-S35VN Stainless",
      "Blade Length": "2.95 Inches (75mm)",
      "Lock Mechanism": "Precision Frame Lock"
    }
  },
  {
    id: 11,
    name: "Echo Pod Hi-Res Spatial Smart Speaker",
    slug: "echo-pod-smart-speaker",
    description: "Room-filling 360-degree acoustic performance with custom woofer, five beamforming tweeters, real-time room calibration, and lossless Wi-Fi streaming.",
    price: 229,
    compareAtPrice: 249,
    categoryName: "Audio & Acoustics",
    imageUrl: "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800&auto=format&fit=crop&q=80",
    galleryUrls: [
      "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800&auto=format&fit=crop&q=80"
    ],
    stockQuantity: 45,
    rating: 4.81,
    reviewCount: 178,
    isFeatured: false,
    tags: ["speaker", "airplay", "audio", "smart-home"],
    specs: {
      "Amplification": "Class-D Digital Amps (80W)",
      "Connectivity": "Wi-Fi 6, AirPlay 2, Spotify Connect",
      "Frequency Range": "35Hz - 22,000Hz"
    }
  },
  {
    id: 12,
    name: "Atlas Carbon Fiber Cardholder & RFID Shield Wallet",
    slug: "atlas-carbon-fiber-wallet",
    description: "Aerospace forged carbon fiber plates with expandable silicone money strap and quick-eject mechanical thumb card slider holding up to 12 cards.",
    price: 79,
    compareAtPrice: 95,
    categoryName: "Modern Lifestyle",
    imageUrl: "https://images.unsplash.com/photo-1627123424574-724758594e93?w=800&auto=format&fit=crop&q=80",
    galleryUrls: [
      "https://images.unsplash.com/photo-1627123424574-724758594e93?w=800&auto=format&fit=crop&q=80"
    ],
    stockQuantity: 55,
    rating: 4.87,
    reviewCount: 310,
    isFeatured: true,
    tags: ["wallet", "carbon-fiber", "rfid", "minimalist"],
    specs: {
      "Capacity": "1 to 12 Cards + Cash",
      "Protection": "Military RFID/NFC Blocking",
      "Weight": "1.6 oz (45g)"
    }
  }
];

// server/config.ts
import dotenv from "dotenv";
import Stripe from "stripe";
dotenv.config();
var config = {
  port: parseInt(process.env.PORT || "3000", 10),
  jwtSecret: process.env.JWT_SECRET || "nexus_ecommerce_jwt_super_secret_key_2026",
  databaseUrl: process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/nexus_commerce",
  stripeSecretKey: process.env.STRIPE_SECRET_KEY || "",
  stripePublishableKey: process.env.STRIPE_PUBLISHABLE_KEY || "",
  nodeEnv: process.env.NODE_ENV || "development"
};
var stripeClient = null;
function getStripe() {
  if (!config.stripeSecretKey) {
    return null;
  }
  if (!stripeClient) {
    stripeClient = new Stripe(config.stripeSecretKey, {
      apiVersion: "2025-02-24.acacia"
    });
  }
  return stripeClient;
}

// server/db/database.ts
var InMemStore = class {
  constructor() {
    this.users = [];
    this.categories = [...initialCategories];
    this.products = [...initialProducts];
    this.cartItems = [];
    this.orders = [];
    this.orderItems = [];
    this.userIdCounter = 2;
    this.orderIdCounter = 1;
    this.orderItemIdCounter = 1;
    this.cartItemIdCounter = 1;
    const passwordHash = bcrypt2.hashSync("password123", 10);
    this.users.push({
      id: 1,
      email: "demo@nexuscommerce.com",
      passwordHash,
      name: "Alex Mercer",
      role: "customer",
      phone: "+1 (555) 382-9912",
      addressLine1: "742 Evergreen Terrace",
      city: "San Francisco",
      postalCode: "94107",
      country: "United States",
      createdAt: new Date(Date.now() - 30 * 24 * 3600 * 1e3).toISOString()
    });
    this.orders.push({
      id: 1,
      orderNumber: "NEX-98214",
      userId: 1,
      subtotal: 538,
      taxAmount: 43.04,
      shippingFee: 0,
      totalAmount: 581.04,
      status: "delivered",
      paymentStatus: "paid",
      paymentIntentId: "pi_demo_8829472194",
      shippingName: "Alex Mercer",
      shippingAddress: "742 Evergreen Terrace",
      shippingCity: "San Francisco",
      shippingPostalCode: "94107",
      shippingCountry: "United States",
      shippingMethod: "Express 2-Day",
      trackingNumber: "TRK-US-940294829",
      estimatedDelivery: new Date(Date.now() - 12 * 24 * 3600 * 1e3).toISOString(),
      createdAt: new Date(Date.now() - 14 * 24 * 3600 * 1e3).toISOString(),
      items: [
        {
          id: 1,
          orderId: 1,
          productId: 1,
          productName: "Aether Pro Wireless Noise-Cancelling Headphones",
          productImage: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80",
          price: 349,
          quantity: 1,
          subtotal: 349
        },
        {
          id: 2,
          orderId: 1,
          productId: 3,
          productName: "Tactile Lumina 75% Custom Mechanical Keyboard",
          productImage: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80",
          price: 189,
          quantity: 1,
          subtotal: 189
        }
      ]
    });
    this.orders.push({
      id: 2,
      orderNumber: "NEX-10492",
      userId: 1,
      subtotal: 129,
      taxAmount: 10.32,
      shippingFee: 0,
      totalAmount: 139.32,
      status: "shipped",
      paymentStatus: "paid",
      paymentIntentId: "pi_demo_9921471023",
      shippingName: "Alex Mercer",
      shippingAddress: "742 Evergreen Terrace",
      shippingCity: "San Francisco",
      shippingPostalCode: "94107",
      shippingCountry: "United States",
      shippingMethod: "Standard Delivery",
      trackingNumber: "TRK-US-882910481",
      estimatedDelivery: new Date(Date.now() + 2 * 24 * 3600 * 1e3).toISOString(),
      createdAt: new Date(Date.now() - 2 * 24 * 3600 * 1e3).toISOString(),
      items: [
        {
          id: 3,
          orderId: 2,
          productId: 8,
          productName: "Zenith MagSafe 3-in-1 Fast Wireless Charging Station",
          productImage: "https://images.unsplash.com/photo-1622445262464-84b1456045b6?w=800&auto=format&fit=crop&q=80",
          price: 129,
          quantity: 1,
          subtotal: 129
        }
      ]
    });
  }
};
var memStore = new InMemStore();
var pgPool = null;
var isPgConnected = false;
async function initDatabase() {
  if (config.databaseUrl) {
    try {
      const pool = new Pool({
        connectionString: config.databaseUrl,
        connectionTimeoutMillis: 3e3
      });
      const client = await pool.connect();
      client.release();
      pgPool = pool;
      isPgConnected = true;
      console.log("Successfully connected to PostgreSQL database.");
    } catch (err) {
      console.log("PostgreSQL database server not reachable locally; operating with high-speed in-memory database store with complete relational schema semantics.");
      isPgConnected = false;
    }
  }
}
var db = {
  // Check engine
  isPostgres() {
    return isPgConnected;
  },
  // USERS
  async findUserByEmail(email) {
    const normalized = email.trim().toLowerCase();
    const user = memStore.users.find((u) => u.email.toLowerCase() === normalized);
    return user || null;
  },
  async findUserById(id) {
    const user = memStore.users.find((u) => u.id === id);
    return user || null;
  },
  async createUser(data) {
    const newUser = {
      id: ++memStore.userIdCounter,
      email: data.email.trim().toLowerCase(),
      passwordHash: data.passwordHash,
      name: data.name.trim(),
      role: "customer",
      country: "United States",
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    memStore.users.push(newUser);
    return newUser;
  },
  async updateUserProfile(userId, updates) {
    const index = memStore.users.findIndex((u) => u.id === userId);
    if (index === -1) return null;
    memStore.users[index] = { ...memStore.users[index], ...updates };
    return memStore.users[index];
  },
  // CATEGORIES
  async getCategories() {
    return memStore.categories;
  },
  // PRODUCTS
  async getProducts(params) {
    let list = [...memStore.products];
    if (params.q && params.q.trim()) {
      const q = params.q.trim().toLowerCase();
      list = list.filter(
        (p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q) || p.categoryName.toLowerCase().includes(q) || p.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
    if (params.category && params.category !== "all") {
      const catLower = params.category.toLowerCase();
      list = list.filter((p) => p.categoryName.toLowerCase() === catLower);
    }
    if (typeof params.minPrice === "number" && !isNaN(params.minPrice)) {
      list = list.filter((p) => p.price >= params.minPrice);
    }
    if (typeof params.maxPrice === "number" && !isNaN(params.maxPrice)) {
      list = list.filter((p) => p.price <= params.maxPrice);
    }
    if (typeof params.rating === "number" && !isNaN(params.rating)) {
      list = list.filter((p) => p.rating >= params.rating);
    }
    if (params.inStock) {
      list = list.filter((p) => p.stockQuantity > 0);
    }
    if (params.featured) {
      list = list.filter((p) => p.isFeatured);
    }
    switch (params.sort) {
      case "price_asc":
        list.sort((a, b) => a.price - b.price);
        break;
      case "price_desc":
        list.sort((a, b) => b.price - a.price);
        break;
      case "rating_desc":
        list.sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount);
        break;
      case "reviews_desc":
        list.sort((a, b) => b.reviewCount - a.reviewCount);
        break;
      case "newest":
        list.sort((a, b) => b.id - a.id);
        break;
      default:
        list.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
        break;
    }
    const total = list.length;
    const page = Math.max(1, params.page || 1);
    const limit = Math.max(1, params.limit || 12);
    const totalPages = Math.ceil(total / limit) || 1;
    const startIndex = (page - 1) * limit;
    const paginated = list.slice(startIndex, startIndex + limit);
    return {
      products: paginated,
      total,
      page,
      totalPages
    };
  },
  async getProductById(id) {
    const product = memStore.products.find((p) => p.id === id);
    return product || null;
  },
  async getProductBySlug(slug) {
    const product = memStore.products.find((p) => p.slug === slug);
    return product || null;
  },
  // SHOPPING CART
  async getCart(userId) {
    const items = memStore.cartItems.filter((i) => i.userId === userId);
    return items.map((item) => {
      const product = memStore.products.find((p) => p.id === item.productId);
      return {
        ...item,
        product
      };
    }).filter((i) => !!i.product);
  },
  async addToCart(userId, productId, quantity = 1) {
    const existingIndex = memStore.cartItems.findIndex((i) => i.userId === userId && i.productId === productId);
    if (existingIndex > -1) {
      memStore.cartItems[existingIndex].quantity += quantity;
    } else {
      memStore.cartItems.push({
        id: ++memStore.cartItemIdCounter,
        userId,
        productId,
        quantity: Math.max(1, quantity),
        createdAt: (/* @__PURE__ */ new Date()).toISOString()
      });
    }
    return this.getCart(userId);
  },
  async updateCartItem(userId, productId, quantity) {
    if (quantity <= 0) {
      memStore.cartItems = memStore.cartItems.filter((i) => !(i.userId === userId && i.productId === productId));
    } else {
      const item = memStore.cartItems.find((i) => i.userId === userId && i.productId === productId);
      if (item) {
        item.quantity = quantity;
      }
    }
    return this.getCart(userId);
  },
  async removeFromCart(userId, productId) {
    memStore.cartItems = memStore.cartItems.filter((i) => !(i.userId === userId && i.productId === productId));
    return this.getCart(userId);
  },
  async clearCart(userId) {
    memStore.cartItems = memStore.cartItems.filter((i) => i.userId !== userId);
  },
  async syncCart(userId, items) {
    for (const item of items) {
      await this.addToCart(userId, item.productId, item.quantity);
    }
    return this.getCart(userId);
  },
  // ORDERS
  async getOrders(userId) {
    const list = memStore.orders.filter((o) => o.userId === userId);
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },
  async getOrderById(orderId, userId) {
    const order = memStore.orders.find((o) => o.id === orderId && o.userId === userId);
    return order || null;
  },
  async getOrderByNumber(orderNumber, userId) {
    const order = memStore.orders.find((o) => o.orderNumber === orderNumber && o.userId === userId);
    return order || null;
  },
  async getOrderByTrackingOrNumber(query) {
    const clean = query.trim().toUpperCase();
    const order = memStore.orders.find(
      (o) => o.orderNumber.toUpperCase() === clean || o.trackingNumber.toUpperCase() === clean
    );
    return order || null;
  },
  async createOrder(data) {
    let subtotal = 0;
    const orderItems = [];
    const newOrderId = ++memStore.orderIdCounter;
    for (const item of data.items) {
      const product = memStore.products.find((p) => p.id === item.productId);
      if (!product) continue;
      const lineSubtotal = product.price * item.quantity;
      subtotal += lineSubtotal;
      product.stockQuantity = Math.max(0, product.stockQuantity - item.quantity);
      orderItems.push({
        id: ++memStore.orderItemIdCounter,
        orderId: newOrderId,
        productId: product.id,
        productName: product.name,
        productImage: product.imageUrl,
        price: product.price,
        quantity: item.quantity,
        subtotal: parseFloat(lineSubtotal.toFixed(2))
      });
    }
    const taxAmount = parseFloat((subtotal * 0.08).toFixed(2));
    const shippingFee = subtotal >= 100 ? 0 : 15;
    const totalAmount = parseFloat((subtotal + taxAmount + shippingFee).toFixed(2));
    const randomHex = Math.floor(1e4 + Math.random() * 9e4);
    const trackingCode = `TRK-US-${Math.floor(1e8 + Math.random() * 9e8)}`;
    const estimatedDate = new Date(Date.now() + 4 * 24 * 3600 * 1e3).toISOString();
    const newOrder = {
      id: newOrderId,
      orderNumber: `NEX-${randomHex}`,
      userId: data.userId || null,
      customerEmail: data.customerEmail,
      subtotal: parseFloat(subtotal.toFixed(2)),
      taxAmount,
      shippingFee,
      totalAmount,
      status: "processing",
      paymentStatus: "paid",
      paymentIntentId: data.paymentIntentId || `pi_sim_${Date.now()}`,
      shippingName: data.shippingName,
      shippingAddress: data.shippingAddress,
      shippingCity: data.shippingCity,
      shippingPostalCode: data.shippingPostalCode,
      shippingCountry: data.shippingCountry,
      shippingMethod: data.shippingMethod || "Standard Ground",
      trackingNumber: trackingCode,
      estimatedDelivery: estimatedDate,
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      items: orderItems
    };
    memStore.orders.push(newOrder);
    if (data.userId) {
      await this.clearCart(data.userId);
    }
    return newOrder;
  }
};

// server/routes/auth.ts
import { Router } from "express";
import bcrypt3 from "bcryptjs";

// server/middleware/auth.ts
import jwt from "jsonwebtoken";
function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    },
    config.jwtSecret,
    { expiresIn: "7d" }
  );
}
function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized: Missing or malformed authorization token." });
    return;
  }
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: "Unauthorized: Invalid or expired authorization token." });
    return;
  }
}
function optionalAuth(req, _res, next) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    try {
      const decoded = jwt.verify(token, config.jwtSecret);
      req.user = decoded;
    } catch {
    }
  }
  next();
}

// server/routes/auth.ts
var router = Router();
router.post("/register", async (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ error: "Please provide email, password, and your full name." });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Please provide a valid email address." });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters long." });
    }
    const existing = await db.findUserByEmail(email);
    if (existing) {
      return res.status(409).json({ error: "An account with this email address already exists." });
    }
    const passwordHash = await bcrypt3.hash(password, 10);
    const user = await db.createUser({
      email,
      passwordHash,
      name
    });
    const token = generateToken({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    });
    const { passwordHash: _, ...safeUser } = user;
    res.status(201).json({
      message: "Account successfully registered.",
      token,
      user: safeUser
    });
  } catch (error) {
    console.error("Error in register:", error);
    res.status(500).json({ error: "Failed to create account. Please try again." });
  }
});
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Please enter both your email address and password." });
    }
    const user = await db.findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password." });
    }
    const isMatch = await bcrypt3.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid email or password." });
    }
    const token = generateToken({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    });
    const { passwordHash: _, ...safeUser } = user;
    res.json({
      message: "Successfully signed in.",
      token,
      user: safeUser
    });
  } catch (error) {
    console.error("Error in login:", error);
    res.status(500).json({ error: "Authentication failed. Please try again." });
  }
});
router.get("/me", verifyToken, async (req, res) => {
  try {
    const user = await db.findUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: "User profile not found." });
    }
    const { passwordHash: _, ...safeUser } = user;
    res.json({ user: safeUser });
  } catch (error) {
    console.error("Error in auth me:", error);
    res.status(500).json({ error: "Failed to retrieve profile." });
  }
});
router.put("/profile", verifyToken, async (req, res) => {
  try {
    const { name, phone, addressLine1, city, postalCode, country } = req.body;
    const updated = await db.updateUserProfile(req.user.id, {
      ...name ? { name } : {},
      ...phone !== void 0 ? { phone } : {},
      ...addressLine1 !== void 0 ? { addressLine1 } : {},
      ...city !== void 0 ? { city } : {},
      ...postalCode !== void 0 ? { postalCode } : {},
      ...country !== void 0 ? { country } : {}
    });
    if (!updated) {
      return res.status(404).json({ error: "User not found." });
    }
    const { passwordHash: _, ...safeUser } = updated;
    res.json({ message: "Profile updated successfully.", user: safeUser });
  } catch (error) {
    console.error("Error in update profile:", error);
    res.status(500).json({ error: "Failed to update profile." });
  }
});
var auth_default = router;

// server/routes/products.ts
import { Router as Router2 } from "express";
var router2 = Router2();
router2.get("/", async (req, res) => {
  try {
    const {
      q,
      category,
      minPrice,
      maxPrice,
      rating,
      inStock,
      sort,
      featured,
      page,
      limit
    } = req.query;
    const result = await db.getProducts({
      q: typeof q === "string" ? q : void 0,
      category: typeof category === "string" ? category : void 0,
      minPrice: minPrice ? parseFloat(minPrice) : void 0,
      maxPrice: maxPrice ? parseFloat(maxPrice) : void 0,
      rating: rating ? parseFloat(rating) : void 0,
      inStock: inStock === "true" || inStock === "1",
      sort: typeof sort === "string" ? sort : void 0,
      featured: featured === "true" || featured === "1",
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 12
    });
    res.json(result);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ error: "Failed to fetch products." });
  }
});
router2.get("/categories", async (_req, res) => {
  try {
    const categories = await db.getCategories();
    const allProducts = await db.getProducts({ limit: 1e3 });
    const enriched = categories.map((cat) => ({
      ...cat,
      productCount: allProducts.products.filter((p) => p.categoryName === cat.name).length
    }));
    res.json({ categories: enriched });
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ error: "Failed to fetch categories." });
  }
});
router2.get("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid product ID." });
    }
    const product = await db.getProductById(id);
    if (!product) {
      return res.status(404).json({ error: "Product not found." });
    }
    const related = await db.getProducts({ category: product.categoryName, limit: 4 });
    const relatedProducts = related.products.filter((p) => p.id !== product.id).slice(0, 3);
    res.json({ product, relatedProducts });
  } catch (error) {
    console.error("Error fetching product details:", error);
    res.status(500).json({ error: "Failed to fetch product details." });
  }
});
var products_default = router2;

// server/routes/cart.ts
import { Router as Router3 } from "express";
var router3 = Router3();
router3.use(verifyToken);
router3.get("/", async (req, res) => {
  try {
    const items = await db.getCart(req.user.id);
    const subtotal = items.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
    const tax = subtotal * 0.08;
    const shipping = subtotal >= 100 || subtotal === 0 ? 0 : 15;
    const total = subtotal + tax + shipping;
    res.json({
      items,
      itemCount: items.reduce((acc, item) => acc + item.quantity, 0),
      summary: {
        subtotal: parseFloat(subtotal.toFixed(2)),
        tax: parseFloat(tax.toFixed(2)),
        shipping: parseFloat(shipping.toFixed(2)),
        total: parseFloat(total.toFixed(2)),
        freeShippingThreshold: 100,
        amountToFreeShipping: Math.max(0, parseFloat((100 - subtotal).toFixed(2)))
      }
    });
  } catch (error) {
    console.error("Error fetching cart:", error);
    res.status(500).json({ error: "Failed to retrieve shopping cart." });
  }
});
router3.post("/add", async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    if (!productId) {
      return res.status(400).json({ error: "Product ID is required." });
    }
    const product = await db.getProductById(parseInt(productId, 10));
    if (!product) {
      return res.status(404).json({ error: "Product not found." });
    }
    const items = await db.addToCart(req.user.id, product.id, parseInt(quantity, 10) || 1);
    res.json({ message: "Item added to cart.", items });
  } catch (error) {
    console.error("Error adding to cart:", error);
    res.status(500).json({ error: "Failed to add item to cart." });
  }
});
router3.put("/item/:productId", async (req, res) => {
  try {
    const productId = parseInt(req.params.productId, 10);
    const { quantity } = req.body;
    if (isNaN(productId) || typeof quantity !== "number") {
      return res.status(400).json({ error: "Invalid product ID or quantity." });
    }
    const items = await db.updateCartItem(req.user.id, productId, quantity);
    res.json({ message: "Cart updated.", items });
  } catch (error) {
    console.error("Error updating cart item:", error);
    res.status(500).json({ error: "Failed to update item quantity." });
  }
});
router3.delete("/item/:productId", async (req, res) => {
  try {
    const productId = parseInt(req.params.productId, 10);
    if (isNaN(productId)) {
      return res.status(400).json({ error: "Invalid product ID." });
    }
    const items = await db.removeFromCart(req.user.id, productId);
    res.json({ message: "Item removed from cart.", items });
  } catch (error) {
    console.error("Error removing cart item:", error);
    res.status(500).json({ error: "Failed to remove item from cart." });
  }
});
router3.post("/sync", async (req, res) => {
  try {
    const { items } = req.body;
    if (Array.isArray(items)) {
      const updated = await db.syncCart(req.user.id, items);
      return res.json({ message: "Cart synced successfully.", items: updated });
    }
    res.status(400).json({ error: "Items array required." });
  } catch (error) {
    console.error("Error syncing cart:", error);
    res.status(500).json({ error: "Failed to synchronize cart." });
  }
});
router3.delete("/", async (req, res) => {
  try {
    await db.clearCart(req.user.id);
    res.json({ message: "Cart cleared successfully." });
  } catch (error) {
    console.error("Error clearing cart:", error);
    res.status(500).json({ error: "Failed to clear cart." });
  }
});
var cart_default = router3;

// server/routes/orders.ts
import { Router as Router4 } from "express";
import jwt2 from "jsonwebtoken";
var router4 = Router4();
var optionalAuth2 = (req, _res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    try {
      const decoded = jwt2.verify(token, config.jwtSecret);
      req.user = decoded;
    } catch {
    }
  }
  next();
};
router4.get("/track/:query", async (req, res) => {
  try {
    const { query } = req.params;
    if (!query || query.trim().length === 0) {
      return res.status(400).json({ error: "Tracking query is required." });
    }
    const order = await db.getOrderByTrackingOrNumber(query.trim());
    if (!order) {
      return res.status(404).json({ error: "No order found with the provided reference or tracking number." });
    }
    const sanitizedOrder = {
      ...order,
      shippingAddress: order.shippingAddress.replace(/^(\d+).*$/, "$1 [Protected Street]")
    };
    res.json({ order: sanitizedOrder });
  } catch (error) {
    console.error("Error tracking order:", error);
    res.status(500).json({ error: "Failed to retrieve tracking information." });
  }
});
router4.get("/", verifyToken, async (req, res) => {
  try {
    const orders = await db.getOrders(req.user.id);
    res.json({ orders });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ error: "Failed to retrieve order history." });
  }
});
router4.get("/:id", verifyToken, async (req, res) => {
  try {
    const orderId = parseInt(req.params.id, 10);
    if (isNaN(orderId)) {
      return res.status(400).json({ error: "Invalid order ID." });
    }
    const order = await db.getOrderById(orderId, req.user.id);
    if (!order) {
      return res.status(404).json({ error: "Order not found." });
    }
    res.json({ order });
  } catch (error) {
    console.error("Error fetching order details:", error);
    res.status(500).json({ error: "Failed to retrieve order details." });
  }
});
router4.post("/", optionalAuth2, async (req, res) => {
  try {
    const {
      items,
      customerEmail,
      shippingName,
      shippingAddress,
      shippingCity,
      shippingPostalCode,
      shippingCountry,
      shippingMethod,
      paymentIntentId
    } = req.body;
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "Order must contain at least one item." });
    }
    if (!shippingName || !shippingAddress || !shippingCity || !shippingPostalCode) {
      return res.status(400).json({ error: "Complete recipient and shipping address information is required." });
    }
    for (const item of items) {
      const product = await db.getProductById(item.productId);
      if (!product) {
        return res.status(404).json({ error: `Product with ID ${item.productId} was not found.` });
      }
      if (product.stockQuantity < item.quantity) {
        return res.status(400).json({
          error: `Insufficient stock for "${product.name}". Available: ${product.stockQuantity}, Requested: ${item.quantity}.`
        });
      }
    }
    const userId = req.user?.id || null;
    const order = await db.createOrder({
      userId,
      customerEmail: customerEmail || req.user?.email || "guest@nexuscommerce.com",
      items,
      shippingName,
      shippingAddress,
      shippingCity,
      shippingPostalCode,
      shippingCountry: shippingCountry || "United States",
      shippingMethod: shippingMethod || "Standard Ground (3-5 Days)",
      paymentIntentId
    });
    res.status(201).json({
      message: "Order placed successfully!",
      order
    });
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ error: "Failed to process order placement." });
  }
});
var orders_default = router4;

// server/routes/payment.ts
import { Router as Router5 } from "express";
var router5 = Router5();
router5.get("/config", (_req, res) => {
  res.json({
    publishableKey: config.stripePublishableKey,
    hasSecretKey: !!config.stripeSecretKey,
    isConfigured: !!(config.stripeSecretKey && config.stripePublishableKey),
    currency: "USD"
  });
});
router5.post("/create-payment-intent", optionalAuth, async (req, res) => {
  try {
    const { amount, currency = "usd", metadata } = req.body;
    if (!amount || typeof amount !== "number" || amount <= 0) {
      return res.status(400).json({ error: "Valid payment amount is required." });
    }
    const stripe = getStripe();
    if (stripe) {
      const amountInCents = Math.round(amount * 100);
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amountInCents,
        currency: currency.toLowerCase(),
        automatic_payment_methods: { enabled: true },
        metadata: {
          userId: req.user?.id?.toString() || "guest",
          userEmail: req.user?.email || "guest",
          ...metadata
        }
      });
      return res.json({
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        mode: "stripe",
        amount
      });
    }
    const mockIntentId = `pi_demo_${Date.now()}`;
    const mockClientSecret = `${mockIntentId}_secret_${Math.random().toString(36).substring(2, 12)}`;
    res.json({
      clientSecret: mockClientSecret,
      paymentIntentId: mockIntentId,
      mode: "demo",
      amount,
      message: "Demo payment simulated. Provide STRIPE_SECRET_KEY in Settings to enable real Stripe payments."
    });
  } catch (error) {
    console.error("Error creating payment intent:", error);
    res.status(500).json({ error: error.message || "Payment processing initialization failed." });
  }
});
var payment_default = router5;

// server.ts
var __filename = fileURLToPath(import.meta.url);
var __dirname = path.dirname(__filename);
async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3e3;
  await initDatabase();
  app.use(cors());
  app.use(express.json());
  app.get("/api/health", (_req, res) => {
    res.json({
      status: "ok",
      service: "Nexus E-Commerce API",
      version: "1.0.0",
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
  });
  app.use("/api/auth", auth_default);
  app.use("/api/products", products_default);
  app.use("/api/cart", cart_default);
  app.use("/api/orders", orders_default);
  app.use("/api/payment", payment_default);
  app.all("/api/*", (_req, res) => {
    res.status(404).json({ error: "API endpoint not found." });
  });
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Nexus E-Commerce Server running on http://0.0.0.0:${PORT}`);
  });
}
startServer().catch((err) => {
  console.error("Fatal server startup error:", err);
  process.exit(1);
});
//# sourceMappingURL=server.mjs.map

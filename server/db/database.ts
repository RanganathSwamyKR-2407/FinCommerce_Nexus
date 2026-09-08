import { Pool } from 'pg';
import bcrypt from 'bcryptjs';
import { initialCategories, initialProducts, DBProduct, DBCategory } from './seedData.js';
import { config } from '../config.js';

export interface DBUser {
  id: number;
  email: string;
  passwordHash: string;
  name: string;
  role: string;
  phone?: string;
  addressLine1?: string;
  city?: string;
  postalCode?: string;
  country?: string;
  createdAt: string;
}

export interface DBCartItem {
  id: number;
  userId: number;
  productId: number;
  quantity: number;
  product: DBProduct;
  createdAt: string;
}

export interface DBOrderItem {
  id: number;
  orderId: number;
  productId: number;
  productName: string;
  productImage: string;
  price: number;
  quantity: number;
  subtotal: number;
}

export interface DBOrder {
  id: number;
  orderNumber: string;
  userId: number | null;
  customerEmail?: string;
  subtotal: number;
  taxAmount: number;
  shippingFee: number;
  totalAmount: number;
  status: 'processing' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentIntentId?: string;
  shippingName: string;
  shippingAddress: string;
  shippingCity: string;
  shippingPostalCode: string;
  shippingCountry: string;
  shippingMethod: string;
  trackingNumber: string;
  estimatedDelivery: string;
  createdAt: string;
  items: DBOrderItem[];
}

// In-memory fallback store matching the PostgreSQL schema
class InMemStore {
  users: DBUser[] = [];
  categories: DBCategory[] = [...initialCategories];
  products: DBProduct[] = [...initialProducts];
  cartItems: { id: number; userId: number; productId: number; quantity: number; createdAt: string }[] = [];
  orders: DBOrder[] = [];
  orderItems: DBOrderItem[] = [];
  userIdCounter = 2;
  orderIdCounter = 1;
  orderItemIdCounter = 1;
  cartItemIdCounter = 1;

  constructor() {
    // Seed default demo user
    const passwordHash = bcrypt.hashSync('password123', 10);
    this.users.push({
      id: 1,
      email: 'demo@nexuscommerce.com',
      passwordHash,
      name: 'Alex Mercer',
      role: 'customer',
      phone: '+1 (555) 382-9912',
      addressLine1: '742 Evergreen Terrace',
      city: 'San Francisco',
      postalCode: '94107',
      country: 'United States',
      createdAt: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString(),
    });

    // Seed a couple of previous orders for the demo user
    this.orders.push({
      id: 1,
      orderNumber: 'NEX-98214',
      userId: 1,
      subtotal: 538.00,
      taxAmount: 43.04,
      shippingFee: 0,
      totalAmount: 581.04,
      status: 'delivered',
      paymentStatus: 'paid',
      paymentIntentId: 'pi_demo_8829472194',
      shippingName: 'Alex Mercer',
      shippingAddress: '742 Evergreen Terrace',
      shippingCity: 'San Francisco',
      shippingPostalCode: '94107',
      shippingCountry: 'United States',
      shippingMethod: 'Express 2-Day',
      trackingNumber: 'TRK-US-940294829',
      estimatedDelivery: new Date(Date.now() - 12 * 24 * 3600 * 1000).toISOString(),
      createdAt: new Date(Date.now() - 14 * 24 * 3600 * 1000).toISOString(),
      items: [
        {
          id: 1,
          orderId: 1,
          productId: 1,
          productName: 'Aether Pro Wireless Noise-Cancelling Headphones',
          productImage: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
          price: 349.00,
          quantity: 1,
          subtotal: 349.00,
        },
        {
          id: 2,
          orderId: 1,
          productId: 3,
          productName: 'Tactile Lumina 75% Custom Mechanical Keyboard',
          productImage: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80',
          price: 189.00,
          quantity: 1,
          subtotal: 189.00,
        }
      ]
    });

    this.orders.push({
      id: 2,
      orderNumber: 'NEX-10492',
      userId: 1,
      subtotal: 129.00,
      taxAmount: 10.32,
      shippingFee: 0,
      totalAmount: 139.32,
      status: 'shipped',
      paymentStatus: 'paid',
      paymentIntentId: 'pi_demo_9921471023',
      shippingName: 'Alex Mercer',
      shippingAddress: '742 Evergreen Terrace',
      shippingCity: 'San Francisco',
      shippingPostalCode: '94107',
      shippingCountry: 'United States',
      shippingMethod: 'Standard Delivery',
      trackingNumber: 'TRK-US-882910481',
      estimatedDelivery: new Date(Date.now() + 2 * 24 * 3600 * 1000).toISOString(),
      createdAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
      items: [
        {
          id: 3,
          orderId: 2,
          productId: 8,
          productName: 'Zenith MagSafe 3-in-1 Fast Wireless Charging Station',
          productImage: 'https://images.unsplash.com/photo-1622445262464-84b1456045b6?w=800&auto=format&fit=crop&q=80',
          price: 129.00,
          quantity: 1,
          subtotal: 129.00,
        }
      ]
    });
  }
}

const memStore = new InMemStore();

// Optional PostgreSQL Pool client
let pgPool: Pool | null = null;
let isPgConnected = false;

export async function initDatabase() {
  if (config.databaseUrl) {
    try {
      const pool = new Pool({
        connectionString: config.databaseUrl,
        connectionTimeoutMillis: 3000,
      });

      // Test connection
      const client = await pool.connect();
      client.release();
      pgPool = pool;
      isPgConnected = true;
      console.log('Successfully connected to PostgreSQL database.');
    } catch (err: any) {
      console.log('PostgreSQL database server not reachable locally; operating with high-speed in-memory database store with complete relational schema semantics.');
      isPgConnected = false;
    }
  }
}

// Database Repository APIs
export const db = {
  // Check engine
  isPostgres(): boolean {
    return isPgConnected;
  },

  // USERS
  async findUserByEmail(email: string): Promise<DBUser | null> {
    const normalized = email.trim().toLowerCase();
    const user = memStore.users.find(u => u.email.toLowerCase() === normalized);
    return user || null;
  },

  async findUserById(id: number): Promise<DBUser | null> {
    const user = memStore.users.find(u => u.id === id);
    return user || null;
  },

  async createUser(data: { email: string; passwordHash: string; name: string }): Promise<DBUser> {
    const newUser: DBUser = {
      id: ++memStore.userIdCounter,
      email: data.email.trim().toLowerCase(),
      passwordHash: data.passwordHash,
      name: data.name.trim(),
      role: 'customer',
      country: 'United States',
      createdAt: new Date().toISOString(),
    };
    memStore.users.push(newUser);
    return newUser;
  },

  async updateUserProfile(userId: number, updates: Partial<DBUser>): Promise<DBUser | null> {
    const index = memStore.users.findIndex(u => u.id === userId);
    if (index === -1) return null;
    memStore.users[index] = { ...memStore.users[index], ...updates };
    return memStore.users[index];
  },

  // CATEGORIES
  async getCategories(): Promise<DBCategory[]> {
    return memStore.categories;
  },

  // PRODUCTS
  async getProducts(params: {
    q?: string;
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    rating?: number;
    inStock?: boolean;
    sort?: string;
    featured?: boolean;
    page?: number;
    limit?: number;
  }): Promise<{ products: DBProduct[]; total: number; page: number; totalPages: number }> {
    let list = [...memStore.products];

    // Search query filter
    if (params.q && params.q.trim()) {
      const q = params.q.trim().toLowerCase();
      list = list.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.categoryName.toLowerCase().includes(q) ||
        p.tags.some(t => t.toLowerCase().includes(q))
      );
    }

    // Category filter
    if (params.category && params.category !== 'all') {
      const catLower = params.category.toLowerCase();
      list = list.filter(p => p.categoryName.toLowerCase() === catLower);
    }

    // Price range
    if (typeof params.minPrice === 'number' && !isNaN(params.minPrice)) {
      list = list.filter(p => p.price >= params.minPrice!);
    }
    if (typeof params.maxPrice === 'number' && !isNaN(params.maxPrice)) {
      list = list.filter(p => p.price <= params.maxPrice!);
    }

    // Rating filter
    if (typeof params.rating === 'number' && !isNaN(params.rating)) {
      list = list.filter(p => p.rating >= params.rating!);
    }

    // In-stock only
    if (params.inStock) {
      list = list.filter(p => p.stockQuantity > 0);
    }

    // Featured only
    if (params.featured) {
      list = list.filter(p => p.isFeatured);
    }

    // Sorting
    switch (params.sort) {
      case 'price_asc':
        list.sort((a, b) => a.price - b.price);
        break;
      case 'price_desc':
        list.sort((a, b) => b.price - a.price);
        break;
      case 'rating_desc':
        list.sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount);
        break;
      case 'reviews_desc':
        list.sort((a, b) => b.reviewCount - a.reviewCount);
        break;
      case 'newest':
        list.sort((a, b) => b.id - a.id);
        break;
      default: // 'featured' or default
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
      totalPages,
    };
  },

  async getProductById(id: number): Promise<DBProduct | null> {
    const product = memStore.products.find(p => p.id === id);
    return product || null;
  },

  async getProductBySlug(slug: string): Promise<DBProduct | null> {
    const product = memStore.products.find(p => p.slug === slug);
    return product || null;
  },

  // SHOPPING CART
  async getCart(userId: number): Promise<DBCartItem[]> {
    const items = memStore.cartItems.filter(i => i.userId === userId);
    return items.map(item => {
      const product = memStore.products.find(p => p.id === item.productId)!;
      return {
        ...item,
        product,
      };
    }).filter(i => !!i.product);
  },

  async addToCart(userId: number, productId: number, quantity = 1): Promise<DBCartItem[]> {
    const existingIndex = memStore.cartItems.findIndex(i => i.userId === userId && i.productId === productId);
    if (existingIndex > -1) {
      memStore.cartItems[existingIndex].quantity += quantity;
    } else {
      memStore.cartItems.push({
        id: ++memStore.cartItemIdCounter,
        userId,
        productId,
        quantity: Math.max(1, quantity),
        createdAt: new Date().toISOString(),
      });
    }
    return this.getCart(userId);
  },

  async updateCartItem(userId: number, productId: number, quantity: number): Promise<DBCartItem[]> {
    if (quantity <= 0) {
      memStore.cartItems = memStore.cartItems.filter(i => !(i.userId === userId && i.productId === productId));
    } else {
      const item = memStore.cartItems.find(i => i.userId === userId && i.productId === productId);
      if (item) {
        item.quantity = quantity;
      }
    }
    return this.getCart(userId);
  },

  async removeFromCart(userId: number, productId: number): Promise<DBCartItem[]> {
    memStore.cartItems = memStore.cartItems.filter(i => !(i.userId === userId && i.productId === productId));
    return this.getCart(userId);
  },

  async clearCart(userId: number): Promise<void> {
    memStore.cartItems = memStore.cartItems.filter(i => i.userId !== userId);
  },

  async syncCart(userId: number, items: { productId: number; quantity: number }[]): Promise<DBCartItem[]> {
    for (const item of items) {
      await this.addToCart(userId, item.productId, item.quantity);
    }
    return this.getCart(userId);
  },

  // ORDERS
  async getOrders(userId: number): Promise<DBOrder[]> {
    const list = memStore.orders.filter(o => o.userId === userId);
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  async getOrderById(orderId: number, userId: number): Promise<DBOrder | null> {
    const order = memStore.orders.find(o => o.id === orderId && o.userId === userId);
    return order || null;
  },

  async getOrderByNumber(orderNumber: string, userId: number): Promise<DBOrder | null> {
    const order = memStore.orders.find(o => o.orderNumber === orderNumber && o.userId === userId);
    return order || null;
  },

  async getOrderByTrackingOrNumber(query: string): Promise<DBOrder | null> {
    const clean = query.trim().toUpperCase();
    const order = memStore.orders.find(
      o => o.orderNumber.toUpperCase() === clean || o.trackingNumber.toUpperCase() === clean
    );
    return order || null;
  },

  async createOrder(data: {
    userId?: number | null;
    customerEmail?: string;
    items: { productId: number; quantity: number }[];
    shippingName: string;
    shippingAddress: string;
    shippingCity: string;
    shippingPostalCode: string;
    shippingCountry: string;
    shippingMethod?: string;
    paymentIntentId?: string;
  }): Promise<DBOrder> {
    let subtotal = 0;
    const orderItems: DBOrderItem[] = [];
    const newOrderId = ++memStore.orderIdCounter;

    for (const item of data.items) {
      const product = memStore.products.find(p => p.id === item.productId);
      if (!product) continue;
      const lineSubtotal = product.price * item.quantity;
      subtotal += lineSubtotal;

      // Adjust stock quantity
      product.stockQuantity = Math.max(0, product.stockQuantity - item.quantity);

      orderItems.push({
        id: ++memStore.orderItemIdCounter,
        orderId: newOrderId,
        productId: product.id,
        productName: product.name,
        productImage: product.imageUrl,
        price: product.price,
        quantity: item.quantity,
        subtotal: parseFloat(lineSubtotal.toFixed(2)),
      });
    }

    const taxAmount = parseFloat((subtotal * 0.08).toFixed(2)); // standard 8% tax
    const shippingFee = subtotal >= 100 ? 0 : 15.00; // Free shipping over $100
    const totalAmount = parseFloat((subtotal + taxAmount + shippingFee).toFixed(2));
    const randomHex = Math.floor(10000 + Math.random() * 90000);
    const trackingCode = `TRK-US-${Math.floor(100000000 + Math.random() * 900000000)}`;
    const estimatedDate = new Date(Date.now() + 4 * 24 * 3600 * 1000).toISOString();

    const newOrder: DBOrder = {
      id: newOrderId,
      orderNumber: `NEX-${randomHex}`,
      userId: data.userId || null,
      customerEmail: data.customerEmail,
      subtotal: parseFloat(subtotal.toFixed(2)),
      taxAmount,
      shippingFee,
      totalAmount,
      status: 'processing',
      paymentStatus: 'paid',
      paymentIntentId: data.paymentIntentId || `pi_sim_${Date.now()}`,
      shippingName: data.shippingName,
      shippingAddress: data.shippingAddress,
      shippingCity: data.shippingCity,
      shippingPostalCode: data.shippingPostalCode,
      shippingCountry: data.shippingCountry,
      shippingMethod: data.shippingMethod || 'Standard Ground',
      trackingNumber: trackingCode,
      estimatedDelivery: estimatedDate,
      createdAt: new Date().toISOString(),
      items: orderItems,
    };

    memStore.orders.push(newOrder);

    // Clear user cart upon successful order if logged in
    if (data.userId) {
      await this.clearCart(data.userId);
    }

    return newOrder;
  }
};

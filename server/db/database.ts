import { Pool } from 'pg';
import bcrypt from 'bcryptjs';
import { initialCategories, initialProducts, DBProduct, DBCategory } from './seedData.js';
import { config } from '../config.js';

export interface BankAccount {
  bankName: string;
  accountNumber: string;
  ifsc: string;
  balance: number; // In INR
  upiId: string;
}

export interface CreditLineAccount {
  totalLimit: number;
  availableLimit: number;
  usedLimit: number;
  status: 'active' | 'suspended';
  interestRateApr: number;
  nextBillingDate: string;
}

export interface FinancialHealthMetrics {
  score: number; // 0 - 100
  rating: 'Excellent' | 'Good' | 'Moderate' | 'Needs Attention';
  savingsStreakWeeks: number;
  monthlySavingsRate: number; // percentage (e.g. 28%)
  emergencyBufferMonths: number;
  debtToIncomeRatio: number; // percentage
  onTimeBillPercentage: number;
}

export interface DBUser {
  id: number;
  email: string;
  passwordHash: string;
  name: string;
  role: string;
  phone: string;
  upiId: string;
  addressLine1: string;
  city: string;
  postalCode: string;
  country: string;
  bankAccount: BankAccount;
  creditLine: CreditLineAccount;
  digitalGoldGrams: number;
  digitalGoldValueInr: number;
  financialHealth: FinancialHealthMetrics;
  createdAt: string;
}

export interface DBTransaction {
  id: number;
  userId: number;
  referenceId: string;
  type: 'upi_transfer' | 'qr_scan' | 'merchant_order' | 'autopay_mandate' | 'loan_disbursal' | 'investment_sip' | 'bill_payment' | 'credit_line_draw';
  direction: 'debit' | 'credit';
  amount: number;
  recipientName: string;
  recipientUpiOrAccount: string;
  category: 'Shopping' | 'Bills & Utilities' | 'Food & Groceries' | 'Investments' | 'Transfers' | 'Credit Repayment' | 'Income';
  note: string;
  paymentMethod: 'UPI' | 'QR Code' | 'Credit Line' | 'Net Banking' | 'AutoPay Mandate';
  status: 'success' | 'pending' | 'failed';
  createdAt: string;
}

export interface DBAutoPayMandate {
  id: number;
  userId: number;
  mandateRef: string;
  name: string;
  category: 'Utilities' | 'SIP / Investment' | 'Broadband' | 'Insurance' | 'OTT / Media';
  amount: number;
  maxLimit: number;
  frequency: 'monthly' | 'weekly' | 'quarterly';
  nextDueDate: string;
  status: 'active' | 'paused' | 'revoked';
  upiId: string;
  createdAt: string;
}

export interface DBLoanApplication {
  id: number;
  userId: number;
  applicationRef: string;
  monthlyIncome: number;
  existingEmi: number;
  requestedAmount: number;
  tenureMonths: number;
  purpose: string;
  calculatedDti: number;
  eligibilityScore: number;
  approvedLimit: number;
  indicativeInterestRate: number;
  monthlyEmi: number;
  totalRepayment: number;
  status: 'approved' | 'disbursed' | 'under_review' | 'rejected';
  explainableFactors: {
    positive: string[];
    warnings: string[];
  };
  createdAt: string;
}

export interface DBInvestment {
  id: number;
  userId: number;
  investmentRef: string;
  fundName: string;
  fundType: 'nifty_index' | 'digital_gold' | 'green_energy' | 'liquid_debt';
  riskLevel: 'Low' | 'Moderate' | 'High';
  investedAmount: number;
  currentValue: number;
  returnsPercentage: number;
  unitsOrGrams: number;
  isSip: boolean;
  sipAmount?: number;
  sipFrequency?: 'monthly' | 'weekly';
  nextSipDate?: string;
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
  paymentMethod: 'upi_instant' | 'split_pay_3mo' | 'credit_line' | 'card';
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

// In-memory relational store
class InMemStore {
  users: DBUser[] = [];
  categories: DBCategory[] = [...initialCategories];
  products: DBProduct[] = [...initialProducts];
  cartItems: { id: number; userId: number; productId: number; quantity: number; createdAt: string }[] = [];
  orders: DBOrder[] = [];
  orderItems: DBOrderItem[] = [];
  transactions: DBTransaction[] = [];
  mandates: DBAutoPayMandate[] = [];
  loans: DBLoanApplication[] = [];
  investments: DBInvestment[] = [];

  userIdCounter = 2;
  orderIdCounter = 3;
  orderItemIdCounter = 4;
  cartItemIdCounter = 1;
  txnIdCounter = 10;
  mandateIdCounter = 4;
  loanIdCounter = 2;
  investmentIdCounter = 4;

  constructor() {
    const passwordHash = bcrypt.hashSync('password123', 10);

    // Primary demo user: Priya Sharma (India-First professional profile)
    this.users.push({
      id: 1,
      email: 'priya.sharma@fincommerce.in',
      passwordHash,
      name: 'Priya Sharma',
      role: 'customer',
      phone: '+91 98765 43210',
      upiId: 'priya.sharma@okhdfcbank',
      addressLine1: 'Flat 402, Nilgiri Heights, Koramangala 4th Block',
      city: 'Bengaluru',
      postalCode: '560034',
      country: 'India',
      bankAccount: {
        bankName: 'HDFC Bank Ltd.',
        accountNumber: '•••• •••• 4912',
        ifsc: 'HDFC0000287',
        balance: 48500,
        upiId: 'priya.sharma@okhdfcbank',
      },
      creditLine: {
        totalLimit: 150000,
        availableLimit: 124500,
        usedLimit: 25500,
        status: 'active',
        interestRateApr: 11.5,
        nextBillingDate: '2026-10-01',
      },
      digitalGoldGrams: 4.85,
      digitalGoldValueInr: 34920, // 4.85g * ~₹7,200/g
      financialHealth: {
        score: 84,
        rating: 'Excellent',
        savingsStreakWeeks: 14,
        monthlySavingsRate: 28,
        emergencyBufferMonths: 4.2,
        debtToIncomeRatio: 16.5,
        onTimeBillPercentage: 99,
      },
      createdAt: new Date(Date.now() - 180 * 24 * 3600 * 1000).toISOString(),
    });

    // Seed realistic Indian payments transactions
    this.transactions = [
      {
        id: 1,
        userId: 1,
        referenceId: 'FC-UPI-8849102',
        type: 'qr_scan',
        direction: 'debit',
        amount: 1450,
        recipientName: 'Bengaluru Tech Instruments (Soundbox)',
        recipientUpiOrAccount: 'soundbox.bengaluru@icici',
        category: 'Shopping',
        note: 'FinCommerce Instant Checkout',
        paymentMethod: 'UPI',
        status: 'success',
        createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
      },
      {
        id: 2,
        userId: 1,
        referenceId: 'FC-UPI-8830194',
        type: 'autopay_mandate',
        direction: 'debit',
        amount: 5000,
        recipientName: 'Nippon India Nifty 50 Index SIP',
        recipientUpiOrAccount: 'nippon.sip@axisbank',
        category: 'Investments',
        note: 'Monthly AutoPay Mandate',
        paymentMethod: 'AutoPay Mandate',
        status: 'success',
        createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
      },
      {
        id: 3,
        userId: 1,
        referenceId: 'FC-UPI-8812984',
        type: 'bill_payment',
        direction: 'debit',
        amount: 2180,
        recipientName: 'BESCOM Bangalore Electricity',
        recipientUpiOrAccount: 'bescom.bills@sbi',
        category: 'Bills & Utilities',
        note: 'Consumer #BES-9021948',
        paymentMethod: 'UPI',
        status: 'success',
        createdAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
      },
      {
        id: 4,
        userId: 1,
        referenceId: 'FC-UPI-8794821',
        type: 'upi_transfer',
        direction: 'credit',
        amount: 4500,
        recipientName: 'Rahul Verma',
        recipientUpiOrAccount: 'rahul.verma@ybl',
        category: 'Transfers',
        note: 'Weekend trip split payment',
        paymentMethod: 'UPI',
        status: 'success',
        createdAt: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
      },
      {
        id: 5,
        userId: 1,
        referenceId: 'FC-UPI-8740192',
        type: 'upi_transfer',
        direction: 'credit',
        amount: 85000,
        recipientName: 'Infosys Corp Payroll (NEFT/IMPS)',
        recipientUpiOrAccount: 'salary.disbursal@hdfcbank',
        category: 'Income',
        note: 'Monthly Salary Credit',
        paymentMethod: 'Net Banking',
        status: 'success',
        createdAt: new Date(Date.now() - 8 * 24 * 3600 * 1000).toISOString(),
      },
    ];

    // Seed AutoPay Mandates
    this.mandates = [
      {
        id: 1,
        userId: 1,
        mandateRef: 'MND-BESCOM-492',
        name: 'BESCOM Electricity Bill',
        category: 'Utilities',
        amount: 2180,
        maxLimit: 4000,
        frequency: 'monthly',
        nextDueDate: '2026-10-15',
        status: 'active',
        upiId: 'bescom.bills@sbi',
        createdAt: new Date(Date.now() - 60 * 24 * 3600 * 1000).toISOString(),
      },
      {
        id: 2,
        userId: 1,
        mandateRef: 'MND-SIP-NIFTY-104',
        name: 'Nifty 50 Index Fund Systematic SIP',
        category: 'SIP / Investment',
        amount: 5000,
        maxLimit: 10000,
        frequency: 'monthly',
        nextDueDate: '2026-10-05',
        status: 'active',
        upiId: 'nippon.sip@axisbank',
        createdAt: new Date(Date.now() - 90 * 24 * 3600 * 1000).toISOString(),
      },
      {
        id: 3,
        userId: 1,
        mandateRef: 'MND-AIRTEL-812',
        name: 'Airtel Xstream Fiber 200Mbps',
        category: 'Broadband',
        amount: 1179,
        maxLimit: 2000,
        frequency: 'monthly',
        nextDueDate: '2026-10-22',
        status: 'active',
        upiId: 'airtel.bills@icici',
        createdAt: new Date(Date.now() - 45 * 24 * 3600 * 1000).toISOString(),
      },
    ];

    // Seed Investments
    this.investments = [
      {
        id: 1,
        userId: 1,
        investmentRef: 'INV-NIFTY-50-INDEX',
        fundName: 'FinCommerce Nifty 50 Index Fund',
        fundType: 'nifty_index',
        riskLevel: 'Low',
        investedAmount: 50000,
        currentValue: 58400,
        returnsPercentage: 16.8,
        unitsOrGrams: 312.45,
        isSip: true,
        sipAmount: 5000,
        sipFrequency: 'monthly',
        nextSipDate: '2026-10-05',
        createdAt: new Date(Date.now() - 120 * 24 * 3600 * 1000).toISOString(),
      },
      {
        id: 2,
        userId: 1,
        investmentRef: 'INV-DIGI-GOLD-24K',
        fundName: '24K 99.9% Pure Digital Gold (MMTC-PAMP)',
        fundType: 'digital_gold',
        riskLevel: 'Low',
        investedAmount: 30000,
        currentValue: 34920,
        returnsPercentage: 16.4,
        unitsOrGrams: 4.85,
        isSip: false,
        createdAt: new Date(Date.now() - 90 * 24 * 3600 * 1000).toISOString(),
      },
      {
        id: 3,
        userId: 1,
        investmentRef: 'INV-BHARAT-GREEN',
        fundName: 'Bharat Green Energy & Clean Tech Basket',
        fundType: 'green_energy',
        riskLevel: 'Moderate',
        investedAmount: 20000,
        currentValue: 23100,
        returnsPercentage: 15.5,
        unitsOrGrams: 145.2,
        isSip: true,
        sipAmount: 2500,
        sipFrequency: 'monthly',
        nextSipDate: '2026-10-10',
        createdAt: new Date(Date.now() - 75 * 24 * 3600 * 1000).toISOString(),
      },
    ];

    // Seed Active Loan Application
    this.loans = [
      {
        id: 1,
        userId: 1,
        applicationRef: 'LN-2026-9041',
        monthlyIncome: 85000,
        existingEmi: 14000,
        requestedAmount: 150000,
        tenureMonths: 12,
        purpose: 'Workspace & Home Studio Equipment Upgrade',
        calculatedDti: 16.5,
        eligibilityScore: 785,
        approvedLimit: 150000,
        indicativeInterestRate: 11.5,
        monthlyEmi: 13295,
        totalRepayment: 159540,
        status: 'approved',
        explainableFactors: {
          positive: [
            'Debt-to-Income (DTI) ratio is 16.5%, well below the safe 40% threshold.',
            'Regular salary inflow verified over past 6 consecutive months.',
            'Flawless on-time bill payment discipline (99%).',
            'Strong savings cushion of over 4 months emergency expenses.'
          ],
          warnings: [
            'Avoid taking supplementary unsecured consumer debt during the active 12-month tenure.'
          ]
        },
        createdAt: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString(),
      }
    ];

    // Seed Commerce Orders
    this.orders.push({
      id: 1,
      orderNumber: 'FC-ORD-98214',
      userId: 1,
      subtotal: 4499,
      taxAmount: 809.82,
      shippingFee: 0,
      totalAmount: 5308.82,
      status: 'delivered',
      paymentStatus: 'paid',
      paymentMethod: 'upi_instant',
      paymentIntentId: 'pi_upi_8829472194',
      shippingName: 'Priya Sharma',
      shippingAddress: 'Flat 402, Nilgiri Heights, Koramangala 4th Block',
      shippingCity: 'Bengaluru',
      shippingPostalCode: '560034',
      shippingCountry: 'India',
      shippingMethod: 'Bluedart Express Surface',
      trackingNumber: 'BLR-BD-940294829',
      estimatedDelivery: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
      createdAt: new Date(Date.now() - 8 * 24 * 3600 * 1000).toISOString(),
      items: [
        {
          id: 1,
          orderId: 1,
          productId: 2,
          productName: 'Aura Wave Pro Wireless ANC Earbuds (Spatial Audio)',
          productImage: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&auto=format&fit=crop&q=80',
          price: 4499,
          quantity: 1,
          subtotal: 4499,
        }
      ]
    });

    this.orders.push({
      id: 2,
      orderNumber: 'FC-ORD-99104',
      userId: 1,
      subtotal: 1899,
      taxAmount: 341.82,
      shippingFee: 0,
      totalAmount: 2240.82,
      status: 'shipped',
      paymentStatus: 'paid',
      paymentMethod: 'credit_line',
      paymentIntentId: 'pi_credit_9921471023',
      shippingName: 'Priya Sharma',
      shippingAddress: 'Flat 402, Nilgiri Heights, Koramangala 4th Block',
      shippingCity: 'Bengaluru',
      shippingPostalCode: '560034',
      shippingCountry: 'India',
      shippingMethod: 'Delhivery Air Next-Day',
      trackingNumber: 'DLH-IND-882910481',
      estimatedDelivery: new Date(Date.now() + 1 * 24 * 3600 * 1000).toISOString(),
      createdAt: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
      items: [
        {
          id: 2,
          orderId: 2,
          productId: 1,
          productName: 'Bharat Soundbox Pro 4G with Multilingual Voice',
          productImage: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800&auto=format&fit=crop&q=80',
          price: 1899,
          quantity: 1,
          subtotal: 1899,
        }
      ]
    });
  }
}

const memStore = new InMemStore();
let pgPool: Pool | null = null;
let isPgConnected = false;

export async function initDatabase() {
  if (config.databaseUrl) {
    try {
      const pool = new Pool({
        connectionString: config.databaseUrl,
        connectionTimeoutMillis: 3000,
      });
      const client = await pool.connect();
      client.release();
      pgPool = pool;
      isPgConnected = true;
      console.log('Successfully connected to PostgreSQL database.');
    } catch {
      console.log('Operating with high-speed FinCommerce in-memory data store.');
      isPgConnected = false;
    }
  }
}

// Database Repository APIs
export const db = {
  isPostgres(): boolean {
    return isPgConnected;
  },

  // USERS
  async findUserByEmail(email: string): Promise<DBUser | null> {
    const normalized = email.trim().toLowerCase();
    const user = memStore.users.find(u => u.email.toLowerCase() === normalized);
    return user ? JSON.parse(JSON.stringify(user)) : null;
  },

  async findUserById(id: number): Promise<DBUser | null> {
    const user = memStore.users.find(u => u.id === id);
    return user ? JSON.parse(JSON.stringify(user)) : null;
  },

  async createUser(userData: { email: string; password?: string; passwordHash?: string; name: string; phone?: string; upiId?: string }): Promise<DBUser> {
    const passwordHash = userData.passwordHash || (userData.password ? bcrypt.hashSync(userData.password, 10) : bcrypt.hashSync('password123', 10));
    const id = memStore.userIdCounter++;
    const defaultUpi = userData.upiId || `${userData.name.toLowerCase().replace(/\s+/g, '')}@okhdfcbank`;

    const newUser: DBUser = {
      id,
      email: userData.email.trim().toLowerCase(),
      passwordHash,
      name: userData.name.trim(),
      role: 'customer',
      phone: userData.phone || '+91 98765 00000',
      upiId: defaultUpi,
      addressLine1: 'MG Road',
      city: 'Bengaluru',
      postalCode: '560001',
      country: 'India',
      bankAccount: {
        bankName: 'HDFC Bank Ltd.',
        accountNumber: '•••• •••• ' + Math.floor(1000 + Math.random() * 9000),
        ifsc: 'HDFC0000123',
        balance: 25000,
        upiId: defaultUpi,
      },
      creditLine: {
        totalLimit: 50000,
        availableLimit: 50000,
        usedLimit: 0,
        status: 'active',
        interestRateApr: 12.0,
        nextBillingDate: '2026-10-01',
      },
      digitalGoldGrams: 0,
      digitalGoldValueInr: 0,
      financialHealth: {
        score: 75,
        rating: 'Good',
        savingsStreakWeeks: 4,
        monthlySavingsRate: 20,
        emergencyBufferMonths: 2.5,
        debtToIncomeRatio: 18,
        onTimeBillPercentage: 98,
      },
      createdAt: new Date().toISOString(),
    };

    memStore.users.push(newUser);
    return JSON.parse(JSON.stringify(newUser));
  },

  async updateUserProfile(id: number, data: Partial<DBUser>): Promise<DBUser | null> {
    const user = memStore.users.find(u => u.id === id);
    if (!user) return null;
    Object.assign(user, data);
    return JSON.parse(JSON.stringify(user));
  },

  // PRODUCTS
  async getAllProducts(params?: {
    category?: string;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    rating?: number;
    inStock?: boolean;
    sort?: string;
  }): Promise<{ products: DBProduct[]; total: number }> {
    let items = [...memStore.products];

    if (params?.category && params.category !== 'all') {
      const catLower = params.category.toLowerCase();
      items = items.filter(p => p.categoryName.toLowerCase() === catLower || p.slug.includes(catLower));
    }

    if (params?.search) {
      const q = params.search.toLowerCase().trim();
      items = items.filter(
        p =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.categoryName.toLowerCase().includes(q) ||
          p.sellerName.toLowerCase().includes(q) ||
          p.tags.some(t => t.toLowerCase().includes(q))
      );
    }

    if (params?.minPrice !== undefined && params.minPrice !== null) {
      items = items.filter(p => p.price >= params.minPrice!);
    }

    if (params?.maxPrice !== undefined && params.maxPrice !== null) {
      items = items.filter(p => p.price <= params.maxPrice!);
    }

    if (params?.rating) {
      items = items.filter(p => p.rating >= params.rating!);
    }

    if (params?.inStock) {
      items = items.filter(p => p.stockQuantity > 0);
    }

    if (params?.sort) {
      switch (params.sort) {
        case 'price-low':
          items.sort((a, b) => a.price - b.price);
          break;
        case 'price-high':
          items.sort((a, b) => b.price - a.price);
          break;
        case 'rating':
          items.sort((a, b) => b.rating - a.rating);
          break;
        case 'newest':
          items.sort((a, b) => b.id - a.id);
          break;
        default:
          items.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
          break;
      }
    }

    return { products: items, total: items.length };
  },

  async getProductById(id: number): Promise<DBProduct | null> {
    const product = memStore.products.find(p => p.id === id);
    return product ? JSON.parse(JSON.stringify(product)) : null;
  },

  async getAllCategories(): Promise<DBCategory[]> {
    return JSON.parse(JSON.stringify(memStore.categories));
  },

  // Aliases for routes
  async getCategories(): Promise<DBCategory[]> {
    return this.getAllCategories();
  },

  async getProducts(params?: any): Promise<{ products: DBProduct[]; total: number }> {
    return this.getAllProducts(params ? {
      category: params.category,
      search: params.q || params.search,
      minPrice: params.minPrice,
      maxPrice: params.maxPrice,
      rating: params.rating,
      inStock: params.inStock,
      sort: params.sort,
    } : undefined);
  },

  // CART
  async getCart(userId: number): Promise<{ id: number; userId: number; productId: number; quantity: number; product: DBProduct }[]> {
    const items = memStore.cartItems.filter(c => c.userId === userId);
    const result: { id: number; userId: number; productId: number; quantity: number; product: DBProduct }[] = [];
    for (const item of items) {
      const product = memStore.products.find(p => p.id === item.productId);
      if (product) {
        result.push({
          id: item.id,
          userId: item.userId,
          productId: item.productId,
          quantity: item.quantity,
          product: JSON.parse(JSON.stringify(product)),
        });
      }
    }
    return result;
  },

  async addToCart(userId: number, productId: number, quantity: number = 1) {
    const existing = memStore.cartItems.find(c => c.userId === userId && c.productId === productId);
    if (existing) {
      existing.quantity += quantity;
    } else {
      memStore.cartItems.push({
        id: memStore.cartItemIdCounter++,
        userId,
        productId,
        quantity,
        createdAt: new Date().toISOString(),
      });
    }
    return this.getCart(userId);
  },

  async updateCartItem(userId: number, productId: number, quantity: number) {
    const existing = memStore.cartItems.find(c => c.userId === userId && c.productId === productId);
    if (existing) {
      if (quantity <= 0) {
        memStore.cartItems = memStore.cartItems.filter(c => !(c.userId === userId && c.productId === productId));
      } else {
        existing.quantity = quantity;
      }
    }
    return this.getCart(userId);
  },

  async removeFromCart(userId: number, productId: number) {
    memStore.cartItems = memStore.cartItems.filter(c => !(c.userId === userId && c.productId === productId));
    return this.getCart(userId);
  },

  async syncCart(userId: number, clientItems: { productId: number; quantity: number }[]) {
    for (const item of clientItems) {
      const existing = memStore.cartItems.find(c => c.userId === userId && c.productId === item.productId);
      if (existing) {
        existing.quantity = Math.max(existing.quantity, item.quantity);
      } else {
        memStore.cartItems.push({
          id: memStore.cartItemIdCounter++,
          userId,
          productId: item.productId,
          quantity: item.quantity,
          createdAt: new Date().toISOString(),
        });
      }
    }
    return this.getCart(userId);
  },

  async clearCart(userId: number) {
    memStore.cartItems = memStore.cartItems.filter(c => c.userId !== userId);
    return [];
  },

  // PAYMENTS & TRANSACTIONS
  async getTransactions(userId: number): Promise<DBTransaction[]> {
    const txns = memStore.transactions.filter(t => t.userId === userId);
    return JSON.parse(JSON.stringify(txns.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())));
  },

  async processPayment(params: {
    userId: number;
    recipient: string;
    recipientUpiOrAccount?: string;
    amount: number;
    paymentMethod: 'UPI' | 'QR Code' | 'Credit Line' | 'Net Banking' | 'AutoPay Mandate';
    category?: 'Shopping' | 'Bills & Utilities' | 'Food & Groceries' | 'Investments' | 'Transfers' | 'Credit Repayment';
    note?: string;
  }): Promise<DBTransaction> {
    const user = memStore.users.find(u => u.id === params.userId);
    if (!user) throw new Error('User not found.');

    const ref = 'FC-UPI-' + Math.floor(1000000 + Math.random() * 9000000);

    // Deduct balance
    if (params.paymentMethod === 'Credit Line') {
      if (user.creditLine.availableLimit < params.amount) {
        throw new Error('Insufficient credit line limit available.');
      }
      user.creditLine.availableLimit -= params.amount;
      user.creditLine.usedLimit += params.amount;
    } else {
      if (user.bankAccount.balance < params.amount) {
        throw new Error('Insufficient UPI bank balance.');
      }
      user.bankAccount.balance -= params.amount;
    }

    const newTxn: DBTransaction = {
      id: memStore.txnIdCounter++,
      userId: params.userId,
      referenceId: ref,
      type: params.paymentMethod === 'QR Code' ? 'qr_scan' : params.paymentMethod === 'Credit Line' ? 'credit_line_draw' : 'upi_transfer',
      direction: 'debit',
      amount: params.amount,
      recipientName: params.recipient,
      recipientUpiOrAccount: params.recipientUpiOrAccount || `${params.recipient.toLowerCase().replace(/[^a-z0-9]/g, '')}@upi`,
      category: params.category || 'Transfers',
      note: params.note || 'Payment via FinCommerce',
      paymentMethod: params.paymentMethod,
      status: 'success',
      createdAt: new Date().toISOString(),
    };

    memStore.transactions.unshift(newTxn);
    return JSON.parse(JSON.stringify(newTxn));
  },

  // AUTOPAY MANDATES
  async getMandates(userId: number): Promise<DBAutoPayMandate[]> {
    return JSON.parse(JSON.stringify(memStore.mandates.filter(m => m.userId === userId)));
  },

  async createMandate(userId: number, mandate: {
    name: string;
    category: 'Utilities' | 'SIP / Investment' | 'Broadband' | 'Insurance' | 'OTT / Media';
    amount: number;
    maxLimit: number;
    frequency: 'monthly' | 'weekly';
    upiId: string;
  }): Promise<DBAutoPayMandate> {
    const newMandate: DBAutoPayMandate = {
      id: memStore.mandateIdCounter++,
      userId,
      mandateRef: 'MND-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
      name: mandate.name,
      category: mandate.category,
      amount: mandate.amount,
      maxLimit: mandate.maxLimit,
      frequency: mandate.frequency,
      nextDueDate: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().split('T')[0],
      status: 'active',
      upiId: mandate.upiId,
      createdAt: new Date().toISOString(),
    };

    memStore.mandates.push(newMandate);
    return JSON.parse(JSON.stringify(newMandate));
  },

  // LENDING & CREDIT
  async getLoans(userId: number): Promise<DBLoanApplication[]> {
    return JSON.parse(JSON.stringify(memStore.loans.filter(l => l.userId === userId)));
  },

  async applyLoan(userId: number, data: {
    monthlyIncome: number;
    existingEmi: number;
    requestedAmount: number;
    tenureMonths: number;
    purpose: string;
  }): Promise<DBLoanApplication> {
    const user = memStore.users.find(u => u.id === userId);
    const dti = Number(((data.existingEmi / data.monthlyIncome) * 100).toFixed(1));
    const disposableIncome = data.monthlyIncome - data.existingEmi;

    // Explainable credit scoring algorithm
    let score = 750;
    if (dti < 20) score += 40;
    else if (dti < 35) score += 15;
    else if (dti > 50) score -= 80;

    if (data.monthlyIncome >= 75000) score += 30;
    else if (data.monthlyIncome >= 40000) score += 15;

    // Positive and warning factors
    const positive: string[] = [];
    const warnings: string[] = [];

    if (dti <= 30) {
      positive.push(`Healthy Debt-to-Income ratio of ${dti}% (well under standard 40% cap).`);
    } else {
      warnings.push(`Existing debt commitments consume ${dti}% of gross income.`);
    }

    if (disposableIncome >= 30000) {
      positive.push(`Sufficient disposable buffer of ₹${disposableIncome.toLocaleString('en-IN')}/month.`);
    }

    positive.push('Consistent banking activity and digital transaction trails verified.');

    const interestRate = score >= 750 ? 11.0 : score >= 700 ? 12.5 : 14.5;
    const monthlyRate = interestRate / 12 / 100;
    const emi = Math.round(
      (data.requestedAmount * monthlyRate * Math.pow(1 + monthlyRate, data.tenureMonths)) /
        (Math.pow(1 + monthlyRate, data.tenureMonths) - 1)
    );
    const totalRepay = emi * data.tenureMonths;
    const approvedLimit = Math.min(data.requestedAmount, Math.round(disposableIncome * 0.5 * data.tenureMonths));

    const newLoan: DBLoanApplication = {
      id: memStore.loanIdCounter++,
      userId,
      applicationRef: 'LN-2026-' + Math.floor(1000 + Math.random() * 9000),
      monthlyIncome: data.monthlyIncome,
      existingEmi: data.existingEmi,
      requestedAmount: data.requestedAmount,
      tenureMonths: data.tenureMonths,
      purpose: data.purpose,
      calculatedDti: dti,
      eligibilityScore: score,
      approvedLimit,
      indicativeInterestRate: interestRate,
      monthlyEmi: emi,
      totalRepayment: totalRepay,
      status: score >= 650 ? 'approved' : 'rejected',
      explainableFactors: { positive, warnings },
      createdAt: new Date().toISOString(),
    };

    memStore.loans.push(newLoan);

    // If approved, update user credit line limit
    if (user && newLoan.status === 'approved') {
      user.creditLine.totalLimit = Math.max(user.creditLine.totalLimit, approvedLimit);
      user.creditLine.availableLimit = user.creditLine.totalLimit - user.creditLine.usedLimit;
    }

    return JSON.parse(JSON.stringify(newLoan));
  },

  // INVESTMENTS
  async getInvestments(userId: number): Promise<DBInvestment[]> {
    return JSON.parse(JSON.stringify(memStore.investments.filter(i => i.userId === userId)));
  },

  async createInvestment(userId: number, data: {
    fundName: string;
    fundType: 'nifty_index' | 'digital_gold' | 'green_energy' | 'liquid_debt';
    amount: number;
    isSip: boolean;
    frequency?: 'monthly' | 'weekly';
  }): Promise<DBInvestment> {
    const user = memStore.users.find(u => u.id === userId);
    if (!user) throw new Error('User not found.');

    if (user.bankAccount.balance < data.amount) {
      throw new Error('Insufficient UPI bank account balance for investment.');
    }

    user.bankAccount.balance -= data.amount;

    let units = 0;
    if (data.fundType === 'digital_gold') {
      units = Number((data.amount / 7200).toFixed(4)); // Gold rate ~₹7200/g
      user.digitalGoldGrams += units;
      user.digitalGoldValueInr += data.amount;
    } else {
      units = Number((data.amount / 150).toFixed(2));
    }

    const newInv: DBInvestment = {
      id: memStore.investmentIdCounter++,
      userId,
      investmentRef: 'INV-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
      fundName: data.fundName,
      fundType: data.fundType,
      riskLevel: data.fundType === 'digital_gold' || data.fundType === 'nifty_index' ? 'Low' : 'Moderate',
      investedAmount: data.amount,
      currentValue: data.amount,
      returnsPercentage: 0,
      unitsOrGrams: units,
      isSip: data.isSip,
      sipAmount: data.isSip ? data.amount : undefined,
      sipFrequency: data.frequency || 'monthly',
      nextSipDate: data.isSip ? new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().split('T')[0] : undefined,
      createdAt: new Date().toISOString(),
    };

    memStore.investments.push(newInv);

    // Record as transaction
    memStore.transactions.unshift({
      id: memStore.txnIdCounter++,
      userId,
      referenceId: 'FC-INV-' + Math.floor(1000000 + Math.random() * 9000000),
      type: 'investment_sip',
      direction: 'debit',
      amount: data.amount,
      recipientName: data.fundName,
      recipientUpiOrAccount: 'investment@fincommerce',
      category: 'Investments',
      note: data.isSip ? 'SIP Installment' : 'Lumpsum Investment',
      paymentMethod: 'UPI',
      status: 'success',
      createdAt: new Date().toISOString(),
    });

    return JSON.parse(JSON.stringify(newInv));
  },

  // ORDERS & COMMERCE
  async getOrders(userId: number): Promise<DBOrder[]> {
    const orders = memStore.orders.filter(o => o.userId === userId);
    return JSON.parse(JSON.stringify(orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())));
  },

  async getOrderByNumber(orderNumber: string): Promise<DBOrder | null> {
    const order = memStore.orders.find(o => o.orderNumber === orderNumber);
    return order ? JSON.parse(JSON.stringify(order)) : null;
  },

  async getOrderByTracking(trackingNumber: string): Promise<DBOrder | null> {
    const order = memStore.orders.find(o => o.trackingNumber === trackingNumber);
    return order ? JSON.parse(JSON.stringify(order)) : null;
  },

  async getOrderById(id: number, userId?: number): Promise<DBOrder | null> {
    const order = memStore.orders.find(o => o.id === id && (userId === undefined || o.userId === userId));
    return order ? JSON.parse(JSON.stringify(order)) : null;
  },

  async getOrderByTrackingOrNumber(query: string): Promise<DBOrder | null> {
    const q = query.trim().toUpperCase();
    const order = memStore.orders.find(o => o.orderNumber.toUpperCase() === q || o.trackingNumber.toUpperCase() === q);
    return order ? JSON.parse(JSON.stringify(order)) : null;
  },

  async createOrder(orderData: {
    userId: number | null;
    customerEmail: string;
    shippingName: string;
    shippingAddress: string;
    shippingCity: string;
    shippingPostalCode: string;
    shippingCountry?: string;
    shippingMethod?: string;
    paymentMethod: 'upi_instant' | 'split_pay_3mo' | 'credit_line' | 'card';
    items: { productId: number; quantity: number }[];
  }): Promise<DBOrder> {
    const orderId = memStore.orderIdCounter++;
    const orderNumber = 'FC-ORD-' + Math.floor(10000 + Math.random() * 90000);
    const trackingNumber = 'IND-EXP-' + Math.floor(100000000 + Math.random() * 900000000);

    let subtotal = 0;
    const orderItems: DBOrderItem[] = [];

    for (const item of orderData.items) {
      const prod = memStore.products.find(p => p.id === item.productId);
      if (!prod) continue;
      const itemSubtotal = prod.price * item.quantity;
      subtotal += itemSubtotal;

      orderItems.push({
        id: memStore.orderItemIdCounter++,
        orderId,
        productId: prod.id,
        productName: prod.name,
        productImage: prod.imageUrl,
        price: prod.price,
        quantity: item.quantity,
        subtotal: itemSubtotal,
      });

      prod.stockQuantity = Math.max(0, prod.stockQuantity - item.quantity);
    }

    const taxAmount = Number((subtotal * 0.18).toFixed(2)); // Standard 18% GST
    const shippingFee = subtotal >= 999 ? 0 : 99; // Free shipping over ₹999
    const totalAmount = Number((subtotal + taxAmount + shippingFee).toFixed(2));

    // Handle payment method deduction if registered user
    if (orderData.userId) {
      const user = memStore.users.find(u => u.id === orderData.userId);
      if (user) {
        if (orderData.paymentMethod === 'credit_line') {
          if (user.creditLine.availableLimit < totalAmount) {
            throw new Error('Insufficient FinCommerce Credit Line limit.');
          }
          user.creditLine.availableLimit -= totalAmount;
          user.creditLine.usedLimit += totalAmount;
        } else if (orderData.paymentMethod === 'upi_instant') {
          if (user.bankAccount.balance < totalAmount) {
            throw new Error('Insufficient UPI Bank balance.');
          }
          user.bankAccount.balance -= totalAmount;
        }

        // Add to transaction log
        memStore.transactions.unshift({
          id: memStore.txnIdCounter++,
          userId: user.id,
          referenceId: 'FC-ORD-TXN-' + Math.floor(100000 + Math.random() * 900000),
          type: 'merchant_order',
          direction: 'debit',
          amount: totalAmount,
          recipientName: 'FinCommerce Store Checkout',
          recipientUpiOrAccount: 'merchants.fincommerce@hdfcbank',
          category: 'Shopping',
          note: `Order ${orderNumber} (${orderItems.length} items)`,
          paymentMethod: orderData.paymentMethod === 'credit_line' ? 'Credit Line' : 'UPI',
          status: 'success',
          createdAt: new Date().toISOString(),
        });
      }
    }

    const newOrder: DBOrder = {
      id: orderId,
      orderNumber,
      userId: orderData.userId,
      customerEmail: orderData.customerEmail,
      subtotal,
      taxAmount,
      shippingFee,
      totalAmount,
      status: 'processing',
      paymentStatus: 'paid',
      paymentMethod: orderData.paymentMethod,
      paymentIntentId: 'pi_' + Math.random().toString(36).substring(2, 12),
      shippingName: orderData.shippingName,
      shippingAddress: orderData.shippingAddress,
      shippingCity: orderData.shippingCity,
      shippingPostalCode: orderData.shippingPostalCode,
      shippingCountry: orderData.shippingCountry || 'India',
      shippingMethod: orderData.shippingMethod || 'Express Surface Courier (2-3 Days)',
      trackingNumber,
      estimatedDelivery: new Date(Date.now() + 3 * 24 * 3600 * 1000).toISOString(),
      createdAt: new Date().toISOString(),
      items: orderItems,
    };

    memStore.orders.unshift(newOrder);
    return JSON.parse(JSON.stringify(newOrder));
  },
};

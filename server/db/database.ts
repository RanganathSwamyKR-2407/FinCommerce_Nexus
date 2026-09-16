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

export interface DBSaasPlan {
  id: 'starter' | 'growth' | 'enterprise';
  name: string;
  tagline: string;
  monthlyPrice: number;
  annualPrice: number;
  badge?: string;
  recommended?: boolean;
  features: string[];
  limits: {
    maxInvoicesPerMonth: number | 'unlimited';
    apiRequestsPerMin: number;
    teamSeats: number;
    transactionMdrPercent: number;
  };
}

export interface DBSaasSubscription {
  id: string;
  userId: number;
  planId: 'starter' | 'growth' | 'enterprise';
  planName: string;
  status: 'active' | 'trialing' | 'past_due' | 'cancelled';
  billingCycle: 'monthly' | 'annual';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  autoRenew: boolean;
  paymentMethod: 'upi_autopay' | 'credit_line' | 'hdfc_netbanking';
  amount: number;
  nextBillingDate: string;
  mandateRef: string;
}

export interface DBSaasInvoice {
  id: string;
  invoiceNumber: string;
  userId: number;
  clientName: string;
  clientGstin: string;
  clientEmail: string;
  clientState: string;
  itemDescription: string;
  hsnCode: string;
  subtotal: number;
  cgst: number;
  sgst: number;
  igst: number;
  totalAmount: number;
  status: 'paid' | 'pending' | 'overdue';
  dueDate: string;
  paymentLink: string;
  createdAt: string;
}

export interface DBSaasCustomerSubscription {
  id: string;
  userId: number;
  customerName: string;
  customerEmail: string;
  customerUpi: string;
  planName: string;
  mrrAmount: number;
  frequency: 'monthly' | 'quarterly' | 'annual';
  status: 'active' | 'paused' | 'cancelled';
  mandateRef: string;
  nextChargeDate: string;
  lastChargedAt: string;
}

export interface DBSaasApiKey {
  id: string;
  userId: number;
  keyType: 'live' | 'test';
  name: string;
  prefix: string;
  maskedKey: string;
  fullKey?: string;
  createdAt: string;
  lastUsedAt: string;
}

export interface DBSaasWebhookLog {
  id: string;
  event: 'payment.captured' | 'subscription.renewed' | 'invoice.paid' | 'mandate.authorized';
  status: 'delivered' | 'failed';
  httpCode: number;
  timestamp: string;
  payload: Record<string, any>;
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
  saasSubscriptions: DBSaasSubscription[] = [];
  saasInvoices: DBSaasInvoice[] = [];
  saasCustomerSubscriptions: DBSaasCustomerSubscription[] = [];
  saasApiKeys: DBSaasApiKey[] = [];
  saasWebhookLogs: DBSaasWebhookLog[] = [];

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

    // Secondary demo user: Alex Mercer
    const alexPasswordHash = bcrypt.hashSync('Password123!', 10);
    this.users.push({
      id: 2,
      email: 'alex@nexuscommerce.com',
      passwordHash: alexPasswordHash,
      name: 'Alex Mercer',
      role: 'customer',
      phone: '+91 98111 22334',
      upiId: 'alex.mercer@okhdfcbank',
      addressLine1: 'Indiranagar 100ft Road',
      city: 'Bengaluru',
      postalCode: '560038',
      country: 'India',
      bankAccount: {
        bankName: 'State Bank of India',
        accountNumber: '•••• •••• 8812',
        ifsc: 'SBIN0004123',
        balance: 32000,
        upiId: 'alex.mercer@okhdfcbank',
      },
      creditLine: {
        totalLimit: 100000,
        availableLimit: 85000,
        usedLimit: 15000,
        status: 'active',
        interestRateApr: 12.0,
        nextBillingDate: '2026-10-01',
      },
      digitalGoldGrams: 2.1,
      digitalGoldValueInr: 15120,
      financialHealth: {
        score: 80,
        rating: 'Good',
        savingsStreakWeeks: 8,
        monthlySavingsRate: 24,
        emergencyBufferMonths: 3.5,
        debtToIncomeRatio: 18,
        onTimeBillPercentage: 98,
      },
      createdAt: new Date().toISOString(),
    });
    this.userIdCounter = 3;

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
          productImage: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=1200&auto=format&fit=crop&q=85',
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
          productImage: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=1200&auto=format&fit=crop&q=85',
          price: 1899,
          quantity: 1,
          subtotal: 1899,
        }
      ]
    });

    // Seed SaaS Subscription for Priya Sharma (User 1)
    this.saasSubscriptions.push({
      id: 'SUB-GROWTH-2026-01',
      userId: 1,
      planId: 'growth',
      planName: 'Growth Business Pro',
      status: 'active',
      billingCycle: 'monthly',
      currentPeriodStart: new Date(Date.now() - 15 * 24 * 3600 * 1000).toISOString(),
      currentPeriodEnd: new Date(Date.now() + 15 * 24 * 3600 * 1000).toISOString(),
      autoRenew: true,
      paymentMethod: 'upi_autopay',
      amount: 1499,
      nextBillingDate: '2026-10-01',
      mandateRef: 'FC-AUTOPAY-MNDT-99201',
    });

    // Seed SaaS Invoices for User 1's business
    this.saasInvoices.push(
      {
        id: 'INV-2026-0842',
        invoiceNumber: 'FC-GST-2026-0842',
        userId: 1,
        clientName: 'Zomato Hyperpure India Pvt Ltd',
        clientGstin: '29AAACZ1234F1Z8',
        clientEmail: 'procurement@zomato.com',
        clientState: 'Karnataka (29)',
        itemDescription: 'Wholesale Single-Estate Arabica Roast & Barista Hardware Suite',
        hsnCode: '09012190',
        subtotal: 42000,
        cgst: 3780,
        sgst: 3780,
        igst: 0,
        totalAmount: 49560,
        status: 'paid',
        dueDate: '2026-09-20',
        paymentLink: 'https://fincommerce.in/pay/inv_9984120',
        createdAt: new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString(),
      },
      {
        id: 'INV-2026-0841',
        invoiceNumber: 'FC-GST-2026-0841',
        userId: 1,
        clientName: 'FabIndia Overseas Private Ltd',
        clientGstin: '07AAACF2914G1Z2',
        clientEmail: 'accounts@fabindia.net',
        clientState: 'Delhi (07)',
        itemDescription: 'Handwoven Cashmere Pashmina Consignment Q3 (Interstate)',
        hsnCode: '62142010',
        subtotal: 88000,
        cgst: 0,
        sgst: 0,
        igst: 10560,
        totalAmount: 98560,
        status: 'paid',
        dueDate: '2026-09-15',
        paymentLink: 'https://fincommerce.in/pay/inv_9984119',
        createdAt: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString(),
      },
      {
        id: 'INV-2026-0843',
        invoiceNumber: 'FC-GST-2026-0843',
        userId: 1,
        clientName: 'Chai Point (Mountain Trail Foods)',
        clientGstin: '29AABCM8291H1Z5',
        clientEmail: 'finance@chaipoint.com',
        clientState: 'Karnataka (29)',
        itemDescription: 'FinCommerce Bharat Soundbox 4G Terminals & Cloud Setup (Batch 1)',
        hsnCode: '85176290',
        subtotal: 18990,
        cgst: 1709.1,
        sgst: 1709.1,
        igst: 0,
        totalAmount: 22408.2,
        status: 'pending',
        dueDate: '2026-09-28',
        paymentLink: 'https://fincommerce.in/pay/inv_9984121',
        createdAt: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
      }
    );

    // Seed Customer Subscriptions managed via merchant's UPI Autopay Engine
    this.saasCustomerSubscriptions.push(
      {
        id: 'CSUB-991',
        userId: 1,
        customerName: 'Kalyan Retailers (Koramangala)',
        customerEmail: 'ops@kalyanretail.in',
        customerUpi: 'kalyan.pos@hdfcbank',
        planName: 'Enterprise Micro-POS & Soundbox Cloud',
        mrrAmount: 2999,
        frequency: 'monthly',
        status: 'active',
        mandateRef: 'UMN/KALYAN/2026/8812',
        nextChargeDate: '2026-10-02',
        lastChargedAt: '2026-09-02',
      },
      {
        id: 'CSUB-992',
        userId: 1,
        customerName: 'Third Wave Coffee Roasters',
        customerEmail: 'billing@thirdwave.coffee',
        customerUpi: 'thirdwave.ops@icici',
        planName: 'Growth Billing & Loyalty SDK',
        mrrAmount: 1499,
        frequency: 'monthly',
        status: 'active',
        mandateRef: 'UMN/THIRDWAVE/2026/9012',
        nextChargeDate: '2026-10-05',
        lastChargedAt: '2026-09-05',
      },
      {
        id: 'CSUB-993',
        userId: 1,
        customerName: 'Bombay Sweet Shop Retail',
        customerEmail: 'accounts@bombaysweets.in',
        customerUpi: 'bombaysweets@axisbank',
        planName: 'Growth Billing & UPI Autopay Engine',
        mrrAmount: 1499,
        frequency: 'monthly',
        status: 'active',
        mandateRef: 'UMN/BOMBAY/2026/7719',
        nextChargeDate: '2026-10-12',
        lastChargedAt: '2026-09-12',
      },
      {
        id: 'CSUB-994',
        userId: 1,
        customerName: 'Blue Tokai Coffee Roasters',
        customerEmail: 'finance@bluetokaicoffee.com',
        customerUpi: 'bluetokai@yesbank',
        planName: 'Growth Billing & Loyalty SDK',
        mrrAmount: 1499,
        frequency: 'monthly',
        status: 'paused',
        mandateRef: 'UMN/BLUETOKAI/2026/4412',
        nextChargeDate: '2026-10-18',
        lastChargedAt: '2026-08-18',
      }
    );

    // Seed SaaS Developer API Keys
    this.saasApiKeys.push(
      {
        id: 'KEY-01',
        userId: 1,
        keyType: 'live',
        name: 'Production Webhook & POS Connector',
        prefix: 'fc_live_',
        maskedKey: 'fc_live_••••••••••••••••9a8f4c1b',
        fullKey: 'fc_live_9a8f4c1b92049e771038bc4a01948ef2',
        createdAt: new Date(Date.now() - 60 * 24 * 3600 * 1000).toISOString(),
        lastUsedAt: 'Just now (2 mins ago)',
      },
      {
        id: 'KEY-02',
        userId: 1,
        keyType: 'test',
        name: 'Staging / Sandbox Test Environment',
        prefix: 'fc_test_',
        maskedKey: 'fc_test_••••••••••••••••3d7e8291',
        fullKey: 'fc_test_3d7e82910a55bc99201f84b17728aa91',
        createdAt: new Date(Date.now() - 90 * 24 * 3600 * 1000).toISOString(),
        lastUsedAt: 'Yesterday at 18:42',
      }
    );

    // Seed Webhook Simulation Logs
    this.saasWebhookLogs.push(
      {
        id: 'WH-8910',
        event: 'payment.captured',
        status: 'delivered',
        httpCode: 200,
        timestamp: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
        payload: {
          event: 'payment.captured',
          amount: 49560,
          currency: 'INR',
          upi_ref: 'FC-UPI-8849102',
          customer: 'Zomato Hyperpure India Pvt Ltd',
        },
      },
      {
        id: 'WH-8909',
        event: 'subscription.renewed',
        status: 'delivered',
        httpCode: 200,
        timestamp: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
        payload: {
          event: 'subscription.renewed',
          subscription_id: 'CSUB-991',
          customer_upi: 'kalyan.pos@hdfcbank',
          amount: 2999,
          mandate_ref: 'UMN/KALYAN/2026/8812',
        },
      },
      {
        id: 'WH-8908',
        event: 'invoice.paid',
        status: 'delivered',
        httpCode: 200,
        timestamp: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
        payload: {
          event: 'invoice.paid',
          invoice_id: 'INV-2026-0841',
          amount: 98560,
          mode: 'UPI_AUTOPAY',
          gstin: '07AAACF2914G1Z2',
        },
      }
    );
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

  // SAAS & BUSINESS SUITE REPOSITORY
  getSaasPlans(): DBSaasPlan[] {
    return [
      {
        id: 'starter',
        name: 'Starter Merchant',
        tagline: 'Ideal for early-stage artisans, independent creators & pilot storefronts',
        monthlyPrice: 0,
        annualPrice: 0,
        features: [
          'Up to 15 manual GST invoices per month',
          'Dynamic UPI QR code generation',
          'Basic payment confirmation webhooks',
          'Email invoice PDF delivery',
          '1 Store Admin team seat',
          '1.8% standard UPI payment MDR'
        ],
        limits: {
          maxInvoicesPerMonth: 15,
          apiRequestsPerMin: 60,
          teamSeats: 1,
          transactionMdrPercent: 1.8
        }
      },
      {
        id: 'growth',
        name: 'Growth Business Pro',
        tagline: 'For scaling retail stores, high-traffic D2C brands & regional merchants',
        monthlyPrice: 1499,
        annualPrice: 14990,
        recommended: true,
        badge: 'MOST POPULAR',
        features: [
          'Unlimited GST E-Invoices & E-Way Bills',
          'UPI Autopay recurring customer billing engine',
          'Sub-second Government IRP IRN generation',
          'Automated WhatsApp Business PDF dispatch',
          'AI Cash Flow & Predictive MRR Forecaster',
          '5 Multi-role team seats (Owner, Cashier, Accountant)',
          '1,000 API req/min with live webhooks',
          '0.9% discounted platform transaction fee'
        ],
        limits: {
          maxInvoicesPerMonth: 'unlimited',
          apiRequestsPerMin: 1000,
          teamSeats: 5,
          transactionMdrPercent: 0.9
        }
      },
      {
        id: 'enterprise',
        name: 'Enterprise FinTech Suite',
        tagline: 'For high-volume retail chains, omni-channel distributors & FinTech platforms',
        monthlyPrice: 4999,
        annualPrice: 49990,
        badge: 'ENTERPRISE SLA',
        features: [
          'Everything in Growth Business Pro included',
          'Tally Prime & Zoho Books bi-directional sync',
          'White-label custom domain checkout & invoices',
          'Multi-branch & warehouse inventory sync',
          'Unlimited team seats & audit logs',
          '10,000 API req/min with 99.99% uptime SLA',
          'Dedicated 24/7 Relationship Manager & Slack channel',
          '0.4% VIP enterprise payment processing rate'
        ],
        limits: {
          maxInvoicesPerMonth: 'unlimited',
          apiRequestsPerMin: 10000,
          teamSeats: 999,
          transactionMdrPercent: 0.4
        }
      }
    ];
  },

  async getSaasOverview(userId: number) {
    const plans = this.getSaasPlans();
    let subscription = memStore.saasSubscriptions.find(s => s.userId === userId);
    
    // Auto-create default Growth tier for User 1 or Starter for others
    if (!subscription) {
      subscription = {
        id: 'SUB-' + Math.floor(10000 + Math.random() * 90000),
        userId,
        planId: userId === 1 ? 'growth' : 'starter',
        planName: userId === 1 ? 'Growth Business Pro' : 'Starter Merchant',
        status: 'active',
        billingCycle: 'monthly',
        currentPeriodStart: new Date().toISOString(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString(),
        autoRenew: true,
        paymentMethod: 'upi_autopay',
        amount: userId === 1 ? 1499 : 0,
        nextBillingDate: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().split('T')[0],
        mandateRef: 'FC-AUTOPAY-MNDT-' + Math.floor(10000 + Math.random() * 90000),
      };
      memStore.saasSubscriptions.push(subscription);
    }

    const invoices = memStore.saasInvoices.filter(i => i.userId === userId);
    const customerSubs = memStore.saasCustomerSubscriptions.filter(c => c.userId === userId);
    const apiKeys = memStore.saasApiKeys.filter(k => k.userId === userId);
    const webhookLogs = memStore.saasWebhookLogs;

    // Financial calculations
    const activeCustomerSubs = customerSubs.filter(c => c.status === 'active');
    const mrr = activeCustomerSubs.reduce((sum, c) => sum + c.mrrAmount, 0);
    const arr = mrr * 12;
    const churnRate = customerSubs.length > 0 
      ? Number(((customerSubs.filter(c => c.status === 'cancelled' || c.status === 'paused').length / customerSubs.length) * 100).toFixed(1))
      : 0;

    const totalInvoicedMonth = invoices.reduce((sum, i) => sum + i.totalAmount, 0);
    const receivablesPending = invoices.filter(i => i.status === 'pending').reduce((sum, i) => sum + i.totalAmount, 0);

    const analytics = {
      mrr,
      arr,
      activeSubscribers: activeCustomerSubs.length,
      churnRate,
      totalInvoicedMonth,
      receivablesPending,
      cashRunwayMonths: 14.6,
      aiBusinessInsights: [
        `Predictive Cash Flow: ₹${Math.round(mrr * 1.15).toLocaleString('en-IN')} projected for next month with 98.2% on-time UPI Autopay collection rate.`,
        `GST Compliance Alert: Advance tax GSTR-1 filing due on the 11th. Total output tax liability is ₹${Math.round(totalInvoicedMonth * 0.18).toLocaleString('en-IN')}.`,
        `Working Capital: ₹${receivablesPending.toLocaleString('en-IN')} in pending invoices can be unlocked instantly using FinCommerce Invoice Factoring at 0% processing fee.`
      ]
    };

    return {
      subscription: JSON.parse(JSON.stringify(subscription)),
      plans,
      invoices: JSON.parse(JSON.stringify(invoices)),
      customerSubscriptions: JSON.parse(JSON.stringify(customerSubs)),
      apiKeys: JSON.parse(JSON.stringify(apiKeys)),
      webhookLogs: JSON.parse(JSON.stringify(webhookLogs)),
      analytics,
    };
  },

  async subscribeSaasPlan(userId: number, planId: 'starter' | 'growth' | 'enterprise', billingCycle: 'monthly' | 'annual', paymentMethod: string) {
    const plans = this.getSaasPlans();
    const targetPlan = plans.find(p => p.id === planId) || plans[1];
    const amount = billingCycle === 'annual' ? targetPlan.annualPrice : targetPlan.monthlyPrice;

    // Deduct from bank or credit line if not free
    if (amount > 0) {
      const user = memStore.users.find(u => u.id === userId);
      if (user) {
        if (paymentMethod === 'credit_line') {
          if (user.creditLine.availableLimit < amount) {
            throw new Error('Insufficient FinCommerce Credit Line limit for this subscription.');
          }
          user.creditLine.availableLimit -= amount;
          user.creditLine.usedLimit += amount;
        } else if (paymentMethod === 'upi_autopay' || paymentMethod === 'hdfc_netbanking') {
          if (user.bankAccount.balance < amount) {
            throw new Error('Insufficient UPI Bank balance to activate plan.');
          }
          user.bankAccount.balance -= amount;
        }

        // Add transaction
        memStore.transactions.unshift({
          id: memStore.txnIdCounter++,
          userId,
          referenceId: 'FC-SAAS-' + Math.floor(100000 + Math.random() * 900000),
          type: 'autopay_mandate',
          direction: 'debit',
          amount,
          recipientName: `FinCommerce SaaS Cloud (${targetPlan.name})`,
          recipientUpiOrAccount: 'saas.billing@fincommerce',
          category: 'Bills & Utilities',
          note: `${targetPlan.name} ${billingCycle.toUpperCase()} Subscription Renewal`,
          paymentMethod: paymentMethod === 'credit_line' ? 'Credit Line' : 'AutoPay Mandate',
          status: 'success',
          createdAt: new Date().toISOString(),
        });
      }
    }

    let subIndex = memStore.saasSubscriptions.findIndex(s => s.userId === userId);
    const nextDueDate = new Date(Date.now() + (billingCycle === 'annual' ? 365 : 30) * 24 * 3600 * 1000);

    const updatedSub: DBSaasSubscription = {
      id: 'SUB-' + targetPlan.id.toUpperCase() + '-' + Math.floor(1000 + Math.random() * 9000),
      userId,
      planId: targetPlan.id,
      planName: targetPlan.name,
      status: 'active',
      billingCycle,
      currentPeriodStart: new Date().toISOString(),
      currentPeriodEnd: nextDueDate.toISOString(),
      autoRenew: true,
      paymentMethod: (paymentMethod as any) || 'upi_autopay',
      amount,
      nextBillingDate: nextDueDate.toISOString().split('T')[0],
      mandateRef: 'FC-AUTOPAY-MNDT-' + Math.floor(10000 + Math.random() * 90000),
    };

    if (subIndex >= 0) {
      memStore.saasSubscriptions[subIndex] = updatedSub;
    } else {
      memStore.saasSubscriptions.push(updatedSub);
    }

    return JSON.parse(JSON.stringify(updatedSub));
  },

  async createSaasInvoice(userId: number, invoiceData: {
    clientName: string;
    clientGstin: string;
    clientEmail: string;
    clientState?: string;
    itemDescription: string;
    hsnCode?: string;
    subtotal: number;
    taxRate?: number;
    dueDate?: string;
  }): Promise<DBSaasInvoice> {
    const taxRate = invoiceData.taxRate || 18;
    const isInterstate = invoiceData.clientState && !invoiceData.clientState.includes('Karnataka');
    const taxAmount = (invoiceData.subtotal * taxRate) / 100;
    
    const cgst = isInterstate ? 0 : taxAmount / 2;
    const sgst = isInterstate ? 0 : taxAmount / 2;
    const igst = isInterstate ? taxAmount : 0;
    const totalAmount = invoiceData.subtotal + taxAmount;

    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const invoiceNumber = `FC-GST-2026-${randomNum}`;

    const newInvoice: DBSaasInvoice = {
      id: `INV-2026-${randomNum}`,
      invoiceNumber,
      userId,
      clientName: invoiceData.clientName,
      clientGstin: invoiceData.clientGstin || '29AAAAA0000A1Z5',
      clientEmail: invoiceData.clientEmail,
      clientState: invoiceData.clientState || 'Karnataka (29)',
      itemDescription: invoiceData.itemDescription,
      hsnCode: invoiceData.hsnCode || '998311',
      subtotal: invoiceData.subtotal,
      cgst,
      sgst,
      igst,
      totalAmount,
      status: 'pending',
      dueDate: invoiceData.dueDate || new Date(Date.now() + 15 * 24 * 3600 * 1000).toISOString().split('T')[0],
      paymentLink: `https://fincommerce.in/pay/inv_${randomNum}`,
      createdAt: new Date().toISOString(),
    };

    memStore.saasInvoices.unshift(newInvoice);

    // Also push a webhook log
    memStore.saasWebhookLogs.unshift({
      id: 'WH-' + Math.floor(1000 + Math.random() * 9000),
      event: 'invoice.paid',
      status: 'delivered',
      httpCode: 200,
      timestamp: new Date().toISOString(),
      payload: {
        event: 'invoice.created',
        invoice_number: invoiceNumber,
        client: invoiceData.clientName,
        total: totalAmount,
        irn: 'IRN-' + Math.random().toString(36).substring(2, 14).toUpperCase(),
      }
    });

    return JSON.parse(JSON.stringify(newInvoice));
  },

  async updateSaasInvoiceStatus(userId: number, invoiceId: string, status: 'paid' | 'pending' | 'overdue'): Promise<DBSaasInvoice | null> {
    const inv = memStore.saasInvoices.find(i => i.id === invoiceId && i.userId === userId);
    if (!inv) return null;
    inv.status = status;
    return JSON.parse(JSON.stringify(inv));
  },

  async toggleCustomerSubscription(userId: number, subId: string): Promise<DBSaasCustomerSubscription | null> {
    const sub = memStore.saasCustomerSubscriptions.find(c => c.id === subId && c.userId === userId);
    if (!sub) return null;
    sub.status = sub.status === 'active' ? 'paused' : 'active';
    return JSON.parse(JSON.stringify(sub));
  },

  async chargeCustomerSubscription(userId: number, subId: string): Promise<{ success: boolean; chargedAmount: number; nextDueDate: string }> {
    const sub = memStore.saasCustomerSubscriptions.find(c => c.id === subId && c.userId === userId);
    if (!sub) throw new Error('Customer subscription not found.');
    
    sub.lastChargedAt = new Date().toISOString().split('T')[0];
    const nextDate = new Date(Date.now() + 30 * 24 * 3600 * 1000);
    sub.nextChargeDate = nextDate.toISOString().split('T')[0];

    // Credit to merchant's bank balance!
    const user = memStore.users.find(u => u.id === userId);
    if (user) {
      user.bankAccount.balance += sub.mrrAmount;
      memStore.transactions.unshift({
        id: memStore.txnIdCounter++,
        userId,
        referenceId: 'FC-RECUR-' + Math.floor(100000 + Math.random() * 900000),
        type: 'autopay_mandate',
        direction: 'credit',
        amount: sub.mrrAmount,
        recipientName: sub.customerName,
        recipientUpiOrAccount: sub.customerUpi,
        category: 'Income',
        note: `UPI Autopay Recurring Charge (${sub.planName})`,
        paymentMethod: 'AutoPay Mandate',
        status: 'success',
        createdAt: new Date().toISOString(),
      });
    }

    // Log webhook
    memStore.saasWebhookLogs.unshift({
      id: 'WH-' + Math.floor(1000 + Math.random() * 9000),
      event: 'subscription.renewed',
      status: 'delivered',
      httpCode: 200,
      timestamp: new Date().toISOString(),
      payload: {
        event: 'subscription.charged',
        subscription_id: sub.id,
        amount: sub.mrrAmount,
        customer: sub.customerName,
        upi: sub.customerUpi,
      }
    });

    return {
      success: true,
      chargedAmount: sub.mrrAmount,
      nextDueDate: sub.nextChargeDate,
    };
  },

  async generateSaasApiKey(userId: number, keyType: 'live' | 'test', name: string): Promise<DBSaasApiKey> {
    const prefix = keyType === 'live' ? 'fc_live_' : 'fc_test_';
    const randomHex = Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    const fullKey = prefix + randomHex;
    const maskedKey = `${prefix}••••••••••••••••${randomHex.slice(-8)}`;

    const newKey: DBSaasApiKey = {
      id: 'KEY-' + Math.floor(10 + Math.random() * 90),
      userId,
      keyType,
      name: name || `${keyType === 'live' ? 'Production' : 'Sandbox'} Key`,
      prefix,
      maskedKey,
      fullKey,
      createdAt: new Date().toISOString(),
      lastUsedAt: 'Never',
    };

    memStore.saasApiKeys.unshift(newKey);
    return JSON.parse(JSON.stringify(newKey));
  },

  async simulateSaasWebhook(userId: number, eventType: string): Promise<DBSaasWebhookLog> {
    const validEvents: Array<DBSaasWebhookLog['event']> = [
      'payment.captured',
      'subscription.renewed',
      'invoice.paid',
      'mandate.authorized',
    ];

    const chosenEvent = validEvents.includes(eventType as any) ? (eventType as DBSaasWebhookLog['event']) : 'payment.captured';

    const samplePayloads: Record<string, any> = {
      'payment.captured': {
        event: 'payment.captured',
        payment_id: 'pay_' + Math.random().toString(36).substring(2, 12),
        amount: 3499,
        currency: 'INR',
        upi_vpa: 'customer@okhdfcbank',
        captured_at: new Date().toISOString(),
      },
      'subscription.renewed': {
        event: 'subscription.renewed',
        subscription_id: 'CSUB-991',
        amount: 2999,
        status: 'active',
        next_billing: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().split('T')[0],
      },
      'invoice.paid': {
        event: 'invoice.paid',
        invoice_number: 'FC-GST-2026-0843',
        amount: 22408.20,
        settlement_mode: 'IMPS_DIRECT_UPI',
      },
      'mandate.authorized': {
        event: 'mandate.authorized',
        mandate_ref: 'UMN/NPCI/2026/9941',
        max_amount: 15000,
        frequency: 'MONTHLY',
      }
    };

    const newLog: DBSaasWebhookLog = {
      id: 'WH-' + Math.floor(1000 + Math.random() * 9000),
      event: chosenEvent,
      status: 'delivered',
      httpCode: 200,
      timestamp: new Date().toISOString(),
      payload: samplePayloads[chosenEvent] || samplePayloads['payment.captured'],
    };

    memStore.saasWebhookLogs.unshift(newLog);
    return JSON.parse(JSON.stringify(newLog));
  }
};

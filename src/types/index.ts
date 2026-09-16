export interface BankAccount {
  bankName: string;
  accountNumber: string;
  ifsc: string;
  balance: number;
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

export type CreditLine = CreditLineAccount;
export type Loan = LoanApplication;

export interface FinancialHealthMetrics {
  score: number;
  rating: 'Excellent' | 'Good' | 'Moderate' | 'Needs Attention';
  savingsStreakWeeks: number;
  monthlySavingsRate: number;
  emergencyBufferMonths: number;
  debtToIncomeRatio: number;
  onTimeBillPercentage: number;
}

export interface User {
  id: number;
  email: string;
  name: string;
  role: string;
  phone?: string;
  upiId?: string;
  addressLine1?: string;
  city?: string;
  postalCode?: string;
  country?: string;
  bankAccount?: BankAccount;
  creditLine?: CreditLineAccount;
  digitalGoldGrams?: number;
  digitalGoldValueInr?: number;
  financialHealth?: FinancialHealthMetrics;
  createdAt: string;
}

export interface Product {
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
  sellerName?: string;
  emiPerMonth?: number;
  fastDeliveryHours?: number;
  specs?: Record<string, string>;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  icon: string;
  productCount?: number;
}

export interface CartItem {
  id?: number;
  productId: number;
  quantity: number;
  product: Product;
}

export interface CartSummary {
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  freeShippingThreshold: number;
  amountToFreeShipping: number;
}

export interface OrderItem {
  id: number;
  orderId: number;
  productId: number;
  productName: string;
  productImage: string;
  price: number;
  quantity: number;
  subtotal: number;
}

export interface Order {
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
  paymentMethod?: 'upi_instant' | 'split_pay_3mo' | 'credit_line' | 'card';
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
  items: OrderItem[];
}

export interface FilterState {
  q: string;
  category: string;
  minPrice: number | null;
  maxPrice: number | null;
  rating: number | null;
  inStock: boolean;
  sort: string;
}

export interface Transaction {
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

export interface AutoPayMandate {
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

export interface LoanApplication {
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

export interface Investment {
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

export interface DashboardData {
  user: User;
  balances: {
    upiBankBalance: number;
    bankName: string;
    accountNumber: string;
    upiId: string;
    creditLineTotal: number;
    creditLineAvailable: number;
    creditLineUsed: number;
    creditLineApr: number;
    digitalGoldGrams: number;
    digitalGoldValueInr: number;
    totalInvested: number;
    totalCurrentValue: number;
    monthlyMandateTotal: number;
  };
  financialHealth: FinancialHealthMetrics;
  recentTransactions: Transaction[];
  mandates: AutoPayMandate[];
  loans: LoanApplication[];
  investments: Investment[];
  featuredProducts: Product[];
  aiIntelligence: {
    headline: string;
    insight: string;
    savingsRate: string;
    streakWeeks: number;
    resilienceScore: number;
    rating: string;
  };
}

export interface SaasPlan {
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

export interface SaasSubscription {
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

export interface SaasInvoiceItem {
  id: string;
  description: string;
  hsnCode: string;
  quantity: number;
  unitPrice: number;
  gstRate: number; // e.g. 18
  amount: number;
}

export interface SaasInvoice {
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

export interface SaasCustomerSubscription {
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

export interface SaasApiKey {
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

export interface SaasWebhookLog {
  id: string;
  event: 'payment.captured' | 'subscription.renewed' | 'invoice.paid' | 'mandate.authorized';
  status: 'delivered' | 'failed';
  httpCode: number;
  timestamp: string;
  payload: Record<string, any>;
}

export interface SaasOverviewData {
  subscription: SaasSubscription;
  plans: SaasPlan[];
  invoices: SaasInvoice[];
  customerSubscriptions: SaasCustomerSubscription[];
  apiKeys: SaasApiKey[];
  webhookLogs: SaasWebhookLog[];
  analytics: {
    mrr: number;
    arr: number;
    activeSubscribers: number;
    churnRate: number;
    totalInvoicedMonth: number;
    receivablesPending: number;
    cashRunwayMonths: number;
    aiBusinessInsights: string[];
  };
}


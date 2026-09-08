export interface User {
  id: number;
  email: string;
  name: string;
  role: string;
  phone?: string;
  addressLine1?: string;
  city?: string;
  postalCode?: string;
  country?: string;
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

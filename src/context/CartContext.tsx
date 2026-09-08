import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, CartSummary, Product } from '../types/index.js';
import { useAuth } from './AuthContext.js';

interface CartContextType {
  items: CartItem[];
  summary: CartSummary;
  itemCount: number;
  isLoading: boolean;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  addToCart: (product: Product, quantity?: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  removeFromCart: (productId: number) => void;
  clearCart: () => void;
  toast: { message: string; type: 'success' | 'info' | 'error' } | null;
  showToast: (message: string, type?: 'success' | 'info' | 'error') => void;
  closeToast: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const GUEST_CART_KEY = 'nexus_guest_cart';

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, token } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(prev => (prev?.message === message ? null : prev));
    }, 3200);
  };

  const closeToast = () => setToast(null);

  // Load cart on initial mount or when auth state changes
  useEffect(() => {
    if (token) {
      // User is logged in, fetch cart from server
      fetchServerCart(token);
    } else {
      // Guest mode, load from localStorage
      loadGuestCart();
    }
  }, [token]);

  const loadGuestCart = () => {
    try {
      const saved = localStorage.getItem(GUEST_CART_KEY);
      if (saved) {
        setItems(JSON.parse(saved));
      } else {
        setItems([]);
      }
    } catch {
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  };

  const saveGuestCart = (newItems: CartItem[]) => {
    setItems(newItems);
    localStorage.setItem(GUEST_CART_KEY, JSON.stringify(newItems));
  };

  const fetchServerCart = async (authToken: string) => {
    setIsLoading(true);
    try {
      // Check if there was a guest cart to sync
      const savedGuest = localStorage.getItem(GUEST_CART_KEY);
      if (savedGuest) {
        const guestItems: CartItem[] = JSON.parse(savedGuest);
        if (guestItems.length > 0) {
          await fetch('/api/cart/sync', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${authToken}`,
            },
            body: JSON.stringify({
              items: guestItems.map(i => ({ productId: i.productId, quantity: i.quantity })),
            }),
          });
          localStorage.removeItem(GUEST_CART_KEY);
        }
      }

      const response = await fetch('/api/cart', {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      if (response.ok) {
        const data = await response.json();
        setItems(data.items.map((i: any) => ({
          id: i.id,
          productId: i.productId,
          quantity: i.quantity,
          product: i.product,
        })));
      }
    } catch (err) {
      console.error('Error fetching server cart:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const addToCart = async (product: Product, quantity = 1) => {
    const qty = Math.max(1, quantity);

    if (token) {
      try {
        const response = await fetch('/api/cart/add', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ productId: product.id, quantity: qty }),
        });

        if (response.ok) {
          const data = await response.json();
          setItems(data.items.map((i: any) => ({
            id: i.id,
            productId: i.productId,
            quantity: i.quantity,
            product: i.product,
          })));
          showToast(`Added "${product.name}" to your cart.`, 'success');
        }
      } catch (err) {
        console.error('Error adding to server cart:', err);
      }
    } else {
      // Guest local cart
      const existingIndex = items.findIndex(i => i.productId === product.id);
      let updated: CartItem[];
      if (existingIndex > -1) {
        updated = [...items];
        updated[existingIndex].quantity += qty;
      } else {
        updated = [...items, { productId: product.id, quantity: qty, product }];
      }
      saveGuestCart(updated);
      showToast(`Added "${product.name}" to your cart.`, 'success');
    }
  };

  const updateQuantity = async (productId: number, quantity: number) => {
    if (token) {
      try {
        const response = await fetch(`/api/cart/item/${productId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ quantity }),
        });

        if (response.ok) {
          const data = await response.json();
          setItems(data.items.map((i: any) => ({
            id: i.id,
            productId: i.productId,
            quantity: i.quantity,
            product: i.product,
          })));
        }
      } catch (err) {
        console.error('Error updating cart quantity:', err);
      }
    } else {
      let updated: CartItem[];
      if (quantity <= 0) {
        updated = items.filter(i => i.productId !== productId);
      } else {
        updated = items.map(i => (i.productId === productId ? { ...i, quantity } : i));
      }
      saveGuestCart(updated);
    }
  };

  const removeFromCart = async (productId: number) => {
    if (token) {
      try {
        const response = await fetch(`/api/cart/item/${productId}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          const data = await response.json();
          setItems(data.items.map((i: any) => ({
            id: i.id,
            productId: i.productId,
            quantity: i.quantity,
            product: i.product,
          })));
          showToast('Item removed from cart.', 'info');
        }
      } catch (err) {
        console.error('Error removing from cart:', err);
      }
    } else {
      const updated = items.filter(i => i.productId !== productId);
      saveGuestCart(updated);
      showToast('Item removed from cart.', 'info');
    }
  };

  const clearCart = async () => {
    if (token) {
      try {
        await fetch('/api/cart', {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch (err) {
        console.error('Error clearing cart on server:', err);
      }
    } else {
      localStorage.removeItem(GUEST_CART_KEY);
    }
    setItems([]);
  };

  // Calculations
  const subtotal = items.reduce((acc, item) => acc + (item.product?.price || 0) * item.quantity, 0);
  const tax = subtotal * 0.08;
  const shipping = subtotal >= 100 || subtotal === 0 ? 0 : 15.00;
  const total = subtotal + tax + shipping;
  const freeShippingThreshold = 100;
  const amountToFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);

  const summary: CartSummary = {
    subtotal: parseFloat(subtotal.toFixed(2)),
    tax: parseFloat(tax.toFixed(2)),
    shipping: parseFloat(shipping.toFixed(2)),
    total: parseFloat(total.toFixed(2)),
    freeShippingThreshold,
    amountToFreeShipping: parseFloat(amountToFreeShipping.toFixed(2)),
  };

  return (
    <CartContext.Provider
      value={{
        items,
        summary,
        itemCount,
        isLoading,
        isCartOpen,
        setIsCartOpen,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        toast,
        showToast,
        closeToast,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

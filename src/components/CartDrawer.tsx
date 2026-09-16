import React, { useEffect, useRef } from 'react';
import { X, Trash2, ShoppingBag, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { useCart } from '../context/CartContext.js';
import { formatInr } from '../utils/format.js';
import { SafeImage } from './SafeImage.js';

interface CartDrawerProps {
  onCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ onCheckout }) => {
  const {
    items,
    summary,
    itemCount,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeFromCart,
    clearCart,
  } = useCart();

  const closeBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isCartOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeBtnRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsCartOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isCartOpen, setIsCartOpen]);

  if (!isCartOpen) return null;

  const progressPercent = Math.min(
    100,
    Math.round((summary.subtotal / summary.freeShippingThreshold) * 100)
  );

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="cart-drawer-title"
      className="fixed inset-0 z-50 overflow-hidden"
    >
      {/* Backdrop */}
      <div
        onClick={() => setIsCartOpen(false)}
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-300"
        aria-hidden="true"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-300">
          {/* Drawer Header */}
          <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ShoppingBag className="w-5 h-5 text-slate-900" aria-hidden="true" />
              <h2 id="cart-drawer-title" className="text-lg font-bold text-slate-900 font-serif">
                Your Cart
              </h2>
              <span className="bg-slate-100 text-slate-800 text-xs font-black px-2.5 py-0.5 rounded-full" aria-label={`${itemCount} items in cart`}>
                {itemCount}
              </span>
            </div>
            <button
              ref={closeBtnRef}
              onClick={() => setIsCartOpen(false)}
              id="cart-drawer-close-btn"
              aria-label="Close cart drawer"
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:outline-none transition-colors"
            >
              <X className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>

          {/* Free Shipping Progress Meter */}
          <div className="px-5 py-3 bg-indigo-50/70 border-b border-indigo-100">
            <div className="flex items-center justify-between text-xs font-semibold text-indigo-950 mb-1.5">
              <span className="flex items-center">
                <Sparkles className="w-3.5 h-3.5 mr-1 text-indigo-600" aria-hidden="true" />
                {summary.amountToFreeShipping > 0
                  ? `Add ${formatInr(summary.amountToFreeShipping)} more for Free Express Shipping`
                  : 'You unlocked Free Express Shipping!'}
              </span>
              <span className="text-[11px] text-indigo-700 font-bold">{progressPercent}%</span>
            </div>
            <div
              role="progressbar"
              aria-valuenow={progressPercent}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Free shipping qualification progress"
              className="w-full bg-indigo-200/60 h-2 rounded-full overflow-hidden"
            >
              <div
                className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Cart Item List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 divide-y divide-slate-100" role="list">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
                <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center" aria-hidden="true">
                  <ShoppingBag className="w-8 h-8 stroke-1" />
                </div>
                <h3 className="text-base font-bold text-slate-800 font-serif">Your cart is empty</h3>
                <p className="text-xs text-slate-600 max-w-xs leading-relaxed">
                  Explore our curated audio instruments, soundboxes, and precision lifestyle equipment.
                </p>
                <button
                  type="button"
                  onClick={() => setIsCartOpen(false)}
                  className="mt-2 px-5 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold shadow-md hover:bg-slate-800 focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:outline-none"
                >
                  Start Browsing
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div key={item.productId} role="listitem" className="py-4 flex space-x-3.5 group">
                  <div className="w-18 h-18 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                    <SafeImage
                      src={item.product?.imageUrl}
                      alt={`Thumbnail of ${item.product?.name}`}
                      fallbackCategory={item.product?.categoryName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <h4 className="text-xs font-bold text-slate-900 line-clamp-1 leading-snug">
                          {item.product?.name}
                        </h4>
                        <button
                          type="button"
                          onClick={() => removeFromCart(item.productId)}
                          aria-label={`Remove ${item.product?.name} from cart`}
                          className="text-slate-400 hover:text-rose-600 p-1 rounded transition-colors focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:outline-none"
                        >
                          <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                        </button>
                      </div>
                      <span className="text-[11px] text-slate-500 font-medium">
                        {formatInr(item.product?.price)} each
                      </span>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      {/* Quantity controls */}
                      <div className="inline-flex items-center border border-slate-200 rounded-lg overflow-hidden bg-slate-50" role="group" aria-label={`Quantity for ${item.product?.name}`}>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          aria-label={`Decrease quantity of ${item.product?.name}`}
                          className="px-2 py-0.5 text-xs font-bold text-slate-700 hover:bg-slate-200 focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:outline-none"
                        >
                          -
                        </button>
                        <span className="px-2.5 py-0.5 text-xs font-bold text-slate-900" aria-live="polite">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          aria-label={`Increase quantity of ${item.product?.name}`}
                          className="px-2 py-0.5 text-xs font-bold text-slate-700 hover:bg-slate-200 focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:outline-none"
                        >
                          +
                        </button>
                      </div>

                      <span className="text-xs font-black text-slate-900">
                        {formatInr((item.product?.price || 0) * item.quantity)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Drawer Footer & Checkout */}
          {items.length > 0 && (
            <div className="p-5 border-t border-slate-100 bg-slate-50/80 space-y-4">
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-700">
                  <span>Subtotal</span>
                  <span className="font-semibold text-slate-900">{formatInr(summary.subtotal)}</span>
                </div>
                <div className="flex justify-between text-slate-700">
                  <span>GST (18% Goods & Services Tax)</span>
                  <span className="font-semibold text-slate-900">{formatInr(summary.tax)}</span>
                </div>
                <div className="flex justify-between text-slate-700">
                  <span>Shipping</span>
                  <span className="font-semibold text-slate-900">
                    {summary.shipping === 0 ? (
                      <span className="text-emerald-700 font-bold">FREE</span>
                    ) : (
                      formatInr(summary.shipping)
                    )}
                  </span>
                </div>
                <div className="pt-2 border-t border-slate-200 flex justify-between text-sm">
                  <span className="font-bold text-slate-900">Total Amount</span>
                  <span className="font-black text-slate-900 text-base">
                    {formatInr(summary.total)}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsCartOpen(false);
                    onCheckout();
                  }}
                  id="cart-drawer-checkout-btn"
                  className="w-full py-3.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2 focus-visible:outline-none transition-all flex items-center justify-center space-x-2"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </button>
                <div className="flex justify-between items-center text-[11px] text-slate-500 px-1">
                  <button
                    type="button"
                    onClick={clearCart}
                    aria-label="Clear all items from shopping cart"
                    className="hover:text-rose-600 underline focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:outline-none rounded"
                  >
                    Clear cart
                  </button>
                  <span className="flex items-center">
                    <ShieldCheck className="w-3.5 h-3.5 mr-1 text-emerald-600" aria-hidden="true" /> NPCI UPI & 256-Bit Encrypted
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect, useRef } from 'react';
import { X, Lock, CreditCard, CheckCircle2, Truck, Copy, Check, ArrowRight, AlertCircle, Sparkles, Mail } from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { useCart } from '../context/CartContext.js';
import { Order } from '../types/index.js';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onViewOrderHistory: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  onViewOrderHistory,
}) => {
  const { user, token, isAuthenticated, openSignIn } = useAuth();
  const { items, summary, clearCart, showToast } = useCart();

  const [step, setStep] = useState<'shipping' | 'payment' | 'confirmation'>('shipping');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form State
  const [customerEmail, setCustomerEmail] = useState('');
  const [shippingName, setShippingName] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [shippingCity, setShippingCity] = useState('');
  const [shippingPostalCode, setShippingPostalCode] = useState('');
  const [shippingCountry, setShippingCountry] = useState('United States');
  const [shippingMethod, setShippingMethod] = useState('Standard Ground (3-5 Business Days)');

  // Card details state
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvc, setCardCvc] = useState('884');
  const [cardName, setCardName] = useState('');

  // Confirmation state
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  const [copiedTracking, setCopiedTracking] = useState(false);
  const [paymentConfig, setPaymentConfig] = useState<{ isConfigured: boolean; mode: string } | null>(null);

  const closeBtnRef = useRef<HTMLButtonElement>(null);

  // Pre-fill user details if logged in
  useEffect(() => {
    if (user) {
      setCustomerEmail(user.email || '');
      setShippingName(user.name || '');
      setCardName(user.name || '');
      if (user.addressLine1) setShippingAddress(user.addressLine1);
      if (user.city) setShippingCity(user.city);
      if (user.postalCode) setShippingPostalCode(user.postalCode);
      if (user.country) setShippingCountry(user.country);
    }
  }, [user]);

  // Load payment config
  useEffect(() => {
    fetch('/api/payment/config')
      .then((res) => res.json())
      .then((data) => setPaymentConfig(data))
      .catch(() => {});
  }, []);

  // Lock body scroll and handle Escape key
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeBtnRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isProcessing) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose, isProcessing]);

  if (!isOpen) return null;

  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!shippingName.trim() || !shippingAddress.trim() || !shippingCity.trim() || !shippingPostalCode.trim()) {
      setErrorMessage('Please fill in all required shipping address fields.');
      return;
    }
    if (!isAuthenticated && !customerEmail.trim()) {
      setErrorMessage('Please provide your email address for order confirmation & tracking.');
      return;
    }
    setErrorMessage(null);
    setStep('payment');
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setErrorMessage(null);

    try {
      // 1. Create Payment Intent via Stripe API
      const intentRes = await fetch('/api/payment/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          amount: summary.total,
          currency: 'usd',
          metadata: {
            itemCount: items.length,
            shippingName,
            customerEmail: customerEmail || user?.email,
          },
        }),
      });

      const intentData = await intentRes.json();
      if (!intentRes.ok) {
        throw new Error(intentData.error || 'Failed to initialize payment gateway.');
      }

      // Simulate Stripe 3D Secure / authorization latency
      await new Promise((resolve) => setTimeout(resolve, 1200));

      // 2. Submit order to database (supports both authenticated and guest orders)
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const orderRes = await fetch('/api/orders', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
          customerEmail: customerEmail || user?.email || 'customer@nexuscommerce.com',
          shippingName,
          shippingAddress,
          shippingCity,
          shippingPostalCode,
          shippingCountry,
          shippingMethod,
          paymentIntentId: intentData.paymentIntentId,
        }),
      });

      const orderData = await orderRes.json();

      if (!orderRes.ok) {
        throw new Error(orderData.error || 'Failed to record order.');
      }

      setCompletedOrder(orderData.order);
      clearCart();
      showToast('Order confirmed! Package reference assigned.', 'success');
      setStep('confirmation');
    } catch (err: any) {
      setErrorMessage(err.message || 'Payment processing failed. Please check your credentials and try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const copyTracking = () => {
    if (completedOrder?.trackingNumber) {
      navigator.clipboard.writeText(completedOrder.trackingNumber);
      setCopiedTracking(true);
      setTimeout(() => setCopiedTracking(false), 2000);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="checkout-modal-title"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 md:p-6 animate-in fade-in duration-200"
    >
      <div
        className="relative bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center space-x-2">
            <Lock className="w-4 h-4 text-emerald-600" aria-hidden="true" />
            <h2 id="checkout-modal-title" className="font-extrabold text-sm text-slate-900 tracking-tight font-serif">
              NEXUS SECURE CHECKOUT
            </h2>
            <span className="text-[11px] bg-slate-200/80 text-slate-800 px-2 py-0.5 rounded font-mono">
              Stripe 256-Bit
            </span>
          </div>
          <button
            ref={closeBtnRef}
            onClick={onClose}
            aria-label="Close checkout modal"
            className="p-1 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:outline-none"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Accessible Step Progress Tracker */}
        <nav aria-label="Checkout steps" className="px-6 pt-4 pb-2">
          <ol className="flex items-center justify-between text-xs font-bold text-slate-600">
            <li className={`flex items-center space-x-1.5 ${step === 'shipping' ? 'text-indigo-700' : 'text-slate-900'}`} aria-current={step === 'shipping' ? 'step' : undefined}>
              <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-800 flex items-center justify-center text-[10px] font-black" aria-hidden="true">
                1
              </span>
              <span>Shipping</span>
            </li>
            <div className="w-12 h-0.5 bg-slate-200" aria-hidden="true" />
            <li className={`flex items-center space-x-1.5 ${step === 'payment' ? 'text-indigo-700' : step === 'confirmation' ? 'text-slate-900' : 'text-slate-500'}`} aria-current={step === 'payment' ? 'step' : undefined}>
              <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-800 flex items-center justify-center text-[10px] font-black" aria-hidden="true">
                2
              </span>
              <span>Payment</span>
            </li>
            <div className="w-12 h-0.5 bg-slate-200" aria-hidden="true" />
            <li className={`flex items-center space-x-1.5 ${step === 'confirmation' ? 'text-indigo-700' : 'text-slate-500'}`} aria-current={step === 'confirmation' ? 'step' : undefined}>
              <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-800 flex items-center justify-center text-[10px] font-black" aria-hidden="true">
                3
              </span>
              <span>Confirmation</span>
            </li>
          </ol>
        </nav>

        {/* Error Alert */}
        {errorMessage && (
          <div role="alert" className="mx-6 mt-3 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" aria-hidden="true" />
            <span className="flex-1 font-medium">{errorMessage}</span>
          </div>
        )}

        {/* STEP 1: SHIPPING & CONTACT */}
        {step === 'shipping' && (
          <form onSubmit={handleShippingSubmit} className="p-6 space-y-4">
            {!isAuthenticated ? (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-center justify-between">
                <span>Checking out as a Guest. You can place your order instantly below.</span>
                <button
                  type="button"
                  onClick={openSignIn}
                  className="font-bold underline text-indigo-700 hover:text-indigo-900 ml-2 shrink-0 focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:outline-none rounded"
                >
                  Sign In instead
                </button>
              </div>
            ) : null}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {!isAuthenticated && (
                <div className="sm:col-span-2">
                  <label htmlFor="checkout-email" className="block text-xs font-bold text-slate-800 mb-1">
                    Contact Email Address * (For order receipts & tracking)
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      id="checkout-email"
                      required
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="e.g. yourname@example.com"
                      className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3.5 py-2.5 text-slate-900 focus-visible:ring-2 focus-visible:ring-indigo-600 focus:outline-none"
                    />
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" aria-hidden="true" />
                  </div>
                </div>
              )}

              <div className="sm:col-span-2">
                <label htmlFor="checkout-shipping-name" className="block text-xs font-bold text-slate-800 mb-1">
                  Full Recipient Name *
                </label>
                <input
                  type="text"
                  id="checkout-shipping-name"
                  required
                  value={shippingName}
                  onChange={(e) => setShippingName(e.target.value)}
                  placeholder="e.g. Alex Mercer"
                  className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus-visible:ring-2 focus-visible:ring-indigo-600 focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="checkout-shipping-address" className="block text-xs font-bold text-slate-800 mb-1">
                  Delivery Address *
                </label>
                <input
                  type="text"
                  id="checkout-shipping-address"
                  required
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  placeholder="Street address, apartment, suite or unit"
                  className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus-visible:ring-2 focus-visible:ring-indigo-600 focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="checkout-shipping-city" className="block text-xs font-bold text-slate-800 mb-1">
                  City *
                </label>
                <input
                  type="text"
                  id="checkout-shipping-city"
                  required
                  value={shippingCity}
                  onChange={(e) => setShippingCity(e.target.value)}
                  placeholder="San Francisco"
                  className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus-visible:ring-2 focus-visible:ring-indigo-600 focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="checkout-shipping-postal" className="block text-xs font-bold text-slate-800 mb-1">
                  Postal / ZIP Code *
                </label>
                <input
                  type="text"
                  id="checkout-shipping-postal"
                  required
                  value={shippingPostalCode}
                  onChange={(e) => setShippingPostalCode(e.target.value)}
                  placeholder="94107"
                  className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus-visible:ring-2 focus-visible:ring-indigo-600 focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="checkout-shipping-country" className="block text-xs font-bold text-slate-800 mb-1">
                  Country
                </label>
                <select
                  id="checkout-shipping-country"
                  value={shippingCountry}
                  onChange={(e) => setShippingCountry(e.target.value)}
                  className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus-visible:ring-2 focus-visible:ring-indigo-600 focus:outline-none"
                >
                  <option value="United States">United States</option>
                  <option value="Canada">Canada</option>
                  <option value="United Kingdom">United Kingdom</option>
                  <option value="Germany">Germany</option>
                  <option value="Japan">Japan</option>
                  <option value="Australia">Australia</option>
                </select>
              </div>

              <fieldset className="sm:col-span-2 space-y-1">
                <legend className="text-xs font-bold text-slate-800 mb-1">Delivery Speed Option</legend>
                <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-50 focus-within:ring-2 focus-within:ring-indigo-600">
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="shipping-ground"
                      name="deliveryMethod"
                      checked={shippingMethod.includes('Standard')}
                      onChange={() => setShippingMethod('Standard Ground (3-5 Business Days)')}
                      className="text-indigo-600 focus-visible:ring-2 focus-visible:ring-indigo-600"
                    />
                    <span className="text-xs font-medium text-slate-800">Standard Ground (3-5 Business Days)</span>
                  </div>
                  <span className="text-xs font-bold text-emerald-700">
                    {summary.shipping === 0 ? 'FREE' : '$15.00'}
                  </span>
                </label>
              </fieldset>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-500 block">Total Due</span>
                <span className="text-xl font-black text-slate-900">${summary.total.toFixed(2)}</span>
              </div>
              <button
                type="submit"
                id="checkout-next-payment-btn"
                className="px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-md focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2 focus-visible:outline-none flex items-center space-x-2 transition-all"
              >
                <span>Continue to Payment</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          </form>
        )}

        {/* STEP 2: PAYMENT (STRIPE) */}
        {step === 'payment' && (
          <form onSubmit={handlePaymentSubmit} className="p-6 space-y-4">
            {/* Stripe Badge Header */}
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs" aria-hidden="true">
                  S
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">Stripe Payment Gateway</p>
                  <p className="text-[11px] text-slate-600">
                    {paymentConfig?.isConfigured
                      ? 'Live Stripe card processing active'
                      : 'Sandbox test card processing active'}
                  </p>
                </div>
              </div>
              <span className="text-[11px] bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded-full font-bold">
                256-Bit SSL Encrypted
              </span>
            </div>

            {/* Card Inputs */}
            <div className="space-y-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <div>
                <label htmlFor="card-name-input" className="block text-xs font-bold text-slate-800 mb-1">
                  Name on Card
                </label>
                <input
                  type="text"
                  id="card-name-input"
                  required
                  value={cardName || shippingName}
                  onChange={(e) => setCardName(e.target.value)}
                  placeholder="Cardholder Name"
                  className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 focus-visible:ring-2 focus-visible:ring-indigo-600 focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="card-number-input" className="block text-xs font-bold text-slate-800 mb-1">
                  Card Number
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="card-number-input"
                    required
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    placeholder="4242 4242 4242 4242"
                    className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3.5 py-2 text-slate-900 font-mono focus-visible:ring-2 focus-visible:ring-indigo-600 focus:outline-none"
                  />
                  <CreditCard className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" aria-hidden="true" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="card-expiry-input" className="block text-xs font-bold text-slate-800 mb-1">
                    Expiry Date
                  </label>
                  <input
                    type="text"
                    id="card-expiry-input"
                    required
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(e.target.value)}
                    placeholder="MM/YY"
                    className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 font-mono focus-visible:ring-2 focus-visible:ring-indigo-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="card-cvc-input" className="block text-xs font-bold text-slate-800 mb-1">
                    CVC / Security Code
                  </label>
                  <input
                    type="text"
                    id="card-cvc-input"
                    required
                    value={cardCvc}
                    onChange={(e) => setCardCvc(e.target.value)}
                    placeholder="123"
                    className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 font-mono focus-visible:ring-2 focus-visible:ring-indigo-600 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Mini Order Summary */}
            <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-700 space-y-1">
              <div className="flex justify-between font-medium">
                <span>Shipping Destination:</span>
                <span className="text-slate-900 truncate max-w-[220px] font-semibold">{shippingAddress}, {shippingCity}</span>
              </div>
              <div className="flex justify-between font-medium">
                <span>Order Total ({items.length} items):</span>
                <span className="text-slate-900 font-black">${summary.total.toFixed(2)}</span>
              </div>
            </div>

            {/* Payment Actions */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep('shipping')}
                className="text-xs font-bold text-slate-600 hover:text-slate-900 focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:outline-none px-2 py-1 rounded"
              >
                ← Back to Shipping
              </button>

              <button
                type="submit"
                disabled={isProcessing}
                id="checkout-pay-now-btn"
                aria-busy={isProcessing}
                className="px-6 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm shadow-lg hover:shadow-indigo-500/25 focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2 focus-visible:outline-none transition-all flex items-center space-x-2 disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" aria-hidden="true" />
                    <span>Processing with Stripe...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" aria-hidden="true" />
                    <span>Pay ${summary.total.toFixed(2)}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* STEP 3: ORDER CONFIRMATION */}
        {step === 'confirmation' && completedOrder && (
          <div className="p-6 sm:p-8 space-y-6 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-inner" aria-hidden="true">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 font-serif">
                Thank You For Your Order!
              </h2>
              <p className="text-xs text-slate-600 mt-1.5">
                A confirmation receipt and tracking notification has been recorded for {completedOrder.customerEmail || user?.email}.
              </p>
            </div>

            {/* Order Metrics Card */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div>
                  <span className="text-[11px] text-slate-500 block font-bold uppercase">Order Reference</span>
                  <span className="text-base font-black text-slate-900 font-mono">
                    {completedOrder.orderNumber}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-slate-500 block font-bold uppercase">Estimated Delivery</span>
                  <span className="text-xs font-bold text-emerald-800">
                    {new Date(completedOrder.estimatedDelivery).toLocaleDateString(undefined, {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-slate-500 block font-bold uppercase">Tracking Code</span>
                  <span className="text-xs font-mono font-bold text-slate-900">
                    {completedOrder.trackingNumber}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={copyTracking}
                  aria-label="Copy package tracking code to clipboard"
                  className="text-xs font-semibold text-indigo-700 hover:text-indigo-900 flex items-center space-x-1 px-2.5 py-1 rounded-md bg-white border border-slate-200 shadow-2xs focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:outline-none"
                >
                  {copiedTracking ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" aria-hidden="true" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Copy Code</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Purchased Items List Preview */}
            <div className="text-left space-y-2">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Ordered Items</h3>
              <div className="divide-y divide-slate-100 max-h-40 overflow-y-auto pr-1" role="list">
                {completedOrder.items.map((item) => (
                  <div key={item.id} role="listitem" className="py-2 flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-2.5 truncate">
                      <img src={item.productImage} alt="" className="w-9 h-9 rounded-lg object-cover bg-slate-100" />
                      <div className="truncate">
                        <p className="font-bold text-slate-900 truncate">{item.productName}</p>
                        <p className="text-[11px] text-slate-500">Qty: {item.quantity}</p>
                      </div>
                    </div>
                    <span className="font-bold text-slate-900">${item.subtotal.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onViewOrderHistory();
                }}
                id="confirmation-view-orders-btn"
                className="flex-1 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center space-x-2 focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:outline-none"
              >
                <Truck className="w-4 h-4" aria-hidden="true" />
                <span>Track Package Now</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold text-sm transition-colors focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:outline-none"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

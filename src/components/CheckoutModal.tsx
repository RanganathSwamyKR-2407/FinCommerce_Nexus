import React, { useState, useEffect, useRef } from 'react';
import { X, Lock, CreditCard, CheckCircle2, Truck, Copy, Check, ArrowRight, AlertCircle, Sparkles, Mail, Smartphone, QrCode, ShieldCheck, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { useCart } from '../context/CartContext.js';
import { Order } from '../types/index.js';
import { formatInr } from '../utils/format.js';

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
  const { user, token, isAuthenticated, openSignIn, refreshUser } = useAuth();
  const { items, summary, clearCart, showToast } = useCart();

  const [step, setStep] = useState<'shipping' | 'payment' | 'confirmation'>('shipping');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form State
  const [customerEmail, setCustomerEmail] = useState('');
  const [shippingName, setShippingName] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [shippingCity, setShippingCity] = useState('Bengaluru');
  const [shippingPostalCode, setShippingPostalCode] = useState('560001');
  const [shippingCountry, setShippingCountry] = useState('India');
  const [shippingMethod, setShippingMethod] = useState('Bharat Express (Next-Day Delivery)');

  // Payment Selection
  const [paymentMode, setPaymentMode] = useState<'upi' | 'credit_line' | 'card'>('upi');
  const [upiId, setUpiId] = useState('user@oksbi');
  const [cardNumber, setCardNumber] = useState('4524 •••• •••• 1088');
  const [cardExpiry, setCardExpiry] = useState('08/29');
  const [cardCvc, setCardCvc] = useState('884');
  const [cardName, setCardName] = useState('');

  // Confirmation state
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  const [copiedTracking, setCopiedTracking] = useState(false);

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
      if (user.upiId) setUpiId(user.upiId);
    }
  }, [user]);

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
      setErrorMessage('Please complete all required delivery address fields.');
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
      if (paymentMode === 'credit_line') {
        const availableCredit = user?.availableCreditLimit || 124500;
        if (summary.total > availableCredit) {
          throw new Error(`Order total exceeds available credit line (${formatInr(availableCredit)}).`);
        }
      }

      // Simulate gateway authorization / UPI callback
      await new Promise((resolve) => setTimeout(resolve, 1000));

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
          customerEmail: customerEmail || user?.email || 'customer@fincommerce.in',
          shippingName,
          shippingAddress,
          shippingCity,
          shippingPostalCode,
          shippingCountry,
          shippingMethod,
          paymentMethod: paymentMode === 'upi' ? 'UPI' : paymentMode === 'credit_line' ? 'Credit Line' : 'Card',
          paymentIntentId: `pi_fin_${Date.now()}`,
        }),
      });

      const orderData = await orderRes.json();

      if (!orderRes.ok) {
        throw new Error(orderData.error || 'Failed to record order.');
      }

      setCompletedOrder(orderData.order);
      clearCart();
      await refreshUser();
      showToast('Order confirmed! Tracking ID & tax invoice generated.', 'success');
      setStep('confirmation');
    } catch (err: any) {
      setErrorMessage(err.message || 'Payment processing failed. Please check credentials and try again.');
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
              FINCOMMERCE SECURE CHECKOUT
            </h2>
            <span className="text-[11px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-mono font-bold">
              NPCI UPI & 256-Bit SSL
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
              <span>Delivery Details</span>
            </li>
            <div className="w-12 h-0.5 bg-slate-200" aria-hidden="true" />
            <li className={`flex items-center space-x-1.5 ${step === 'payment' ? 'text-indigo-700' : step === 'confirmation' ? 'text-slate-900' : 'text-slate-500'}`} aria-current={step === 'payment' ? 'step' : undefined}>
              <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-800 flex items-center justify-center text-[10px] font-black" aria-hidden="true">
                2
              </span>
              <span>Payment (UPI / Credit / Card)</span>
            </li>
            <div className="w-12 h-0.5 bg-slate-200" aria-hidden="true" />
            <li className={`flex items-center space-x-1.5 ${step === 'confirmation' ? 'text-indigo-700' : 'text-slate-500'}`} aria-current={step === 'confirmation' ? 'step' : undefined}>
              <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-800 flex items-center justify-center text-[10px] font-black" aria-hidden="true">
                3
              </span>
              <span>Order Confirmation</span>
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
                <span>Guest checkout active. You can enter details and complete payment directly.</span>
                <button
                  type="button"
                  onClick={openSignIn}
                  className="font-bold underline text-indigo-700 hover:text-indigo-900 ml-2 shrink-0 focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:outline-none rounded"
                >
                  Sign In
                </button>
              </div>
            ) : null}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {!isAuthenticated && (
                <div className="sm:col-span-2">
                  <label htmlFor="checkout-email" className="block text-xs font-bold text-slate-800 mb-1">
                    Contact Email * (For GST invoice & SMS/email delivery tracking)
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      id="checkout-email"
                      required
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="name@example.in"
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
                  placeholder="e.g. Priya Sharma"
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
                  placeholder="Flat/House No., Building, Street Name, Area"
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
                  placeholder="Bengaluru"
                  className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus-visible:ring-2 focus-visible:ring-indigo-600 focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="checkout-shipping-postal" className="block text-xs font-bold text-slate-800 mb-1">
                  PIN Code *
                </label>
                <input
                  type="text"
                  id="checkout-shipping-postal"
                  required
                  value={shippingPostalCode}
                  onChange={(e) => setShippingPostalCode(e.target.value)}
                  placeholder="560001"
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
                  <option value="India">India</option>
                  <option value="United States">United States</option>
                  <option value="United Kingdom">United Kingdom</option>
                  <option value="Singapore">Singapore</option>
                  <option value="UAE">United Arab Emirates</option>
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
                      checked={shippingMethod.includes('Bharat Express')}
                      onChange={() => setShippingMethod('Bharat Express (Next-Day Delivery)')}
                      className="text-indigo-600 focus-visible:ring-2 focus-visible:ring-indigo-600"
                    />
                    <span className="text-xs font-medium text-slate-800">Bharat Express (1-2 Days Guaranteed)</span>
                  </div>
                  <span className="text-xs font-bold text-emerald-700">
                    {summary.shipping === 0 ? 'FREE' : formatInr(summary.shipping)}
                  </span>
                </label>
              </fieldset>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-500 block">Total Payable</span>
                <span className="text-xl font-black text-slate-900">{formatInr(summary.total)}</span>
              </div>
              <button
                type="submit"
                id="checkout-next-payment-btn"
                className="px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-md focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2 focus-visible:outline-none flex items-center space-x-2 transition-all"
              >
                <span>Select Payment Method</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          </form>
        )}

        {/* STEP 2: PAYMENT (UPI / CREDIT LINE / CARD) */}
        {step === 'payment' && (
          <form onSubmit={handlePaymentSubmit} className="p-6 space-y-4">
            {/* Payment Method Selector */}
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMode('upi')}
                className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center justify-center space-y-1 ${
                  paymentMode === 'upi'
                    ? 'border-indigo-600 bg-indigo-50/70 text-indigo-900 font-bold ring-2 ring-indigo-600'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Smartphone className="w-5 h-5 text-indigo-600" />
                <span className="text-xs">UPI Instant</span>
                <span className="text-[10px] text-emerald-700 font-medium">⚡ 0% Fee</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMode('credit_line')}
                className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center justify-center space-y-1 ${
                  paymentMode === 'credit_line'
                    ? 'border-indigo-600 bg-indigo-50/70 text-indigo-900 font-bold ring-2 ring-indigo-600'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Zap className="w-5 h-5 text-amber-500" />
                <span className="text-xs">FinCommerce Credit</span>
                <span className="text-[10px] text-indigo-700 font-medium">Split in 3 @ ₹0</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMode('card')}
                className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center justify-center space-y-1 ${
                  paymentMode === 'card'
                    ? 'border-indigo-600 bg-indigo-50/70 text-indigo-900 font-bold ring-2 ring-indigo-600'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                <CreditCard className="w-5 h-5 text-slate-700" />
                <span className="text-xs">RuPay / Cards</span>
                <span className="text-[10px] text-slate-500 font-medium">Debit & Credit</span>
              </button>
            </div>

            {/* UPI Option Form */}
            {paymentMode === 'upi' && (
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <QrCode className="w-5 h-5 text-indigo-600" />
                    <span className="text-xs font-bold text-slate-900">Virtual Payment Address (VPA)</span>
                  </div>
                  <span className="text-[11px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">
                    Instant Approval
                  </span>
                </div>

                <div>
                  <label htmlFor="upi-vpa-input" className="block text-xs font-bold text-slate-700 mb-1">
                    Enter UPI ID (e.g. mobile@upi, name@oksbi)
                  </label>
                  <input
                    type="text"
                    id="upi-vpa-input"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="e.g. 9876543210@paytm"
                    className="w-full text-sm bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 font-mono focus-visible:ring-2 focus-visible:ring-indigo-600 focus:outline-none"
                  />
                </div>
                <p className="text-[11px] text-slate-500">
                  Supported by Google Pay, PhonePe, Paytm, BHIM, and all NPCI certified banks.
                </p>
              </div>
            )}

            {/* Credit Line Option Form */}
            {paymentMode === 'credit_line' && (
              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-200 rounded-2xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-950">Pre-Approved FinCommerce Credit</span>
                  <span className="text-xs font-black text-indigo-700">
                    Avail: {formatInr(user?.availableCreditLimit || 124500)}
                  </span>
                </div>
                <div className="p-3 bg-white/80 rounded-xl border border-indigo-100 text-xs text-slate-800 space-y-1">
                  <div className="flex justify-between font-medium">
                    <span>Pay Today:</span>
                    <strong className="text-emerald-700">{formatInr(Math.round(summary.total / 3))}</strong>
                  </div>
                  <div className="flex justify-between font-medium">
                    <span>Month 2 & 3:</span>
                    <span>2 equal payments of {formatInr(Math.round(summary.total / 3))}</span>
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                    <span>Interest & Processing fee:</span>
                    <span className="font-bold text-emerald-700">₹0 (Zero Cost)</span>
                  </div>
                </div>
              </div>
            )}

            {/* Card Option Form */}
            {paymentMode === 'card' && (
              <div className="space-y-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                <div>
                  <label htmlFor="card-name-input" className="block text-xs font-bold text-slate-800 mb-1">
                    Cardholder Name
                  </label>
                  <input
                    type="text"
                    id="card-name-input"
                    value={cardName || shippingName}
                    onChange={(e) => setCardName(e.target.value)}
                    placeholder="Name as printed on card"
                    className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 focus-visible:ring-2 focus-visible:ring-indigo-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label htmlFor="card-number-input" className="block text-xs font-bold text-slate-800 mb-1">
                    Card Number (RuPay, Visa, Mastercard)
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      id="card-number-input"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      placeholder="4524 •••• •••• 1088"
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
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      placeholder="MM/YY"
                      className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 font-mono focus-visible:ring-2 focus-visible:ring-indigo-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label htmlFor="card-cvc-input" className="block text-xs font-bold text-slate-800 mb-1">
                      CVV
                    </label>
                    <input
                      type="text"
                      id="card-cvc-input"
                      value={cardCvc}
                      onChange={(e) => setCardCvc(e.target.value)}
                      placeholder="884"
                      className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 font-mono focus-visible:ring-2 focus-visible:ring-indigo-600 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Mini Order Summary */}
            <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-700 space-y-1">
              <div className="flex justify-between font-medium">
                <span>Delivery Destination:</span>
                <span className="text-slate-900 truncate max-w-[220px] font-semibold">{shippingAddress}, {shippingCity}</span>
              </div>
              <div className="flex justify-between font-medium">
                <span>Order Total ({items.length} items):</span>
                <span className="text-slate-900 font-black">{formatInr(summary.total)}</span>
              </div>
            </div>

            {/* Payment Actions */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep('shipping')}
                className="text-xs font-bold text-slate-600 hover:text-slate-900 focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:outline-none px-2 py-1 rounded"
              >
                ← Back to Details
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
                    <span>Authorizing Payment...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" aria-hidden="true" />
                    <span>Authorize {formatInr(summary.total)}</span>
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
                Order Confirmed!
              </h2>
              <p className="text-xs text-slate-600 mt-1.5">
                GST invoice and delivery updates sent to {completedOrder.customerEmail || user?.email}.
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
                    {new Date(completedOrder.estimatedDelivery).toLocaleDateString('en-IN', {
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
                    <span className="font-bold text-slate-900">{formatInr(item.subtotal)}</span>
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

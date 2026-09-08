import React, { useState, useEffect } from 'react';
import { Package, Truck, Calendar, MapPin, Search, Copy, Check, ArrowLeft, RefreshCw, AlertCircle } from 'lucide-react';
import { Order } from '../types/index.js';
import { useAuth } from '../context/AuthContext.js';
import { useCart } from '../context/CartContext.js';
import { formatInr } from '../utils/format.js';

interface OrderHistoryViewProps {
  onBack: () => void;
  onOpenProduct?: (productId: number) => void;
}

export const OrderHistoryView: React.FC<OrderHistoryViewProps> = ({ onBack }) => {
  const { token, isAuthenticated, openSignIn } = useAuth();
  const { addToCart, showToast } = useCart();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [copiedTracking, setCopiedTracking] = useState<string | null>(null);

  // Tracking query search state (usable by guests and authenticated users alike)
  const [trackingQuery, setTrackingQuery] = useState('');
  const [isSearchingTrack, setIsSearchingTrack] = useState(false);
  const [trackingError, setTrackingError] = useState<string | null>(null);

  useEffect(() => {
    if (token) {
      fetchOrders();
    }
  }, [token]);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/orders', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setOrders(data.orders);
        if (data.orders.length > 0 && !selectedOrder) {
          setSelectedOrder(data.orders[0]);
        }
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTrackSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingQuery.trim()) return;

    setIsSearchingTrack(true);
    setTrackingError(null);

    try {
      const response = await fetch(`/api/orders/track/${encodeURIComponent(trackingQuery.trim())}`);
      const data = await response.json();

      if (response.ok && data.order) {
        setSelectedOrder(data.order);
        showToast(`Tracking details loaded for ${data.order.orderNumber}.`, 'info');
      } else {
        setTrackingError(data.error || 'No shipment found with that reference number.');
      }
    } catch {
      setTrackingError('Failed to connect to tracking telemetry service.');
    } finally {
      setIsSearchingTrack(false);
    }
  };

  const copyTracking = (tracking: string) => {
    navigator.clipboard.writeText(tracking);
    setCopiedTracking(tracking);
    setTimeout(() => setCopiedTracking(null), 2000);
  };

  const reorderAllItems = async (order: Order) => {
    for (const item of order.items) {
      addToCart({
        id: item.productId,
        name: item.productName,
        slug: 'item',
        description: '',
        price: item.price,
        categoryName: 'General',
        imageUrl: item.productImage,
        galleryUrls: [],
        stockQuantity: 50,
        rating: 5,
        reviewCount: 1,
        isFeatured: false,
        tags: [],
      }, item.quantity);
    }
    showToast(`Added ${order.items.length} items from order ${order.orderNumber} to cart.`, 'success');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-300">
      {/* Back button and page title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 pb-4 border-b border-slate-200 gap-4">
        <div className="flex items-center space-x-3">
          <button
            onClick={onBack}
            id="orders-back-to-shop-btn"
            aria-label="Back to product catalog"
            className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:outline-none transition-colors"
          >
            <ArrowLeft className="w-5 h-5" aria-hidden="true" />
          </button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 font-serif">Order History & Tracking</h1>
            <p className="text-xs text-slate-600 mt-0.5">Live package telemetry, delivery itineraries, and past order records.</p>
          </div>
        </div>

        {isAuthenticated && (
          <button
            onClick={fetchOrders}
            disabled={isLoading}
            aria-label="Refresh order history"
            className="p-2 text-xs font-semibold text-slate-700 hover:text-slate-900 flex items-center space-x-1.5 self-start sm:self-auto focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:outline-none rounded-lg"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} aria-hidden="true" />
            <span>Refresh</span>
          </button>
        )}
      </div>

      {/* Public Package Lookup Bar (Works for any order code) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-sm mb-8">
        <form onSubmit={handleTrackSearch} className="flex flex-col sm:flex-row gap-3 items-center">
          <div className="relative flex-1 w-full">
            <label htmlFor="order-lookup-input" className="sr-only">
              Enter Order Number or Tracking Code
            </label>
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" aria-hidden="true" />
            <input
              type="text"
              id="order-lookup-input"
              value={trackingQuery}
              onChange={(e) => setTrackingQuery(e.target.value)}
              placeholder="Track any package by Order Reference (e.g. NEX-12345) or Tracking Code..."
              className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-slate-900 focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:bg-white focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={isSearchingTrack}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-sm flex items-center justify-center space-x-2 focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:outline-none disabled:opacity-50"
          >
            {isSearchingTrack ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" aria-hidden="true" />
            ) : (
              <Truck className="w-4 h-4" aria-hidden="true" />
            )}
            <span>Track Shipment</span>
          </button>
        </form>

        {trackingError && (
          <div role="alert" className="mt-3 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" aria-hidden="true" />
            <span>{trackingError}</span>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      {!isAuthenticated && !selectedOrder ? (
        <div className="py-16 text-center bg-white rounded-3xl border border-slate-200 p-8 space-y-4 max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center mx-auto" aria-hidden="true">
            <Package className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 font-serif">Track Packages or Sign In</h2>
          <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
            Enter your Order Number above to inspect shipment status, or sign in to your Nexus account to view your complete order history.
          </p>
          <div className="flex justify-center gap-3 pt-2">
            <button
              onClick={openSignIn}
              className="px-6 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold shadow-md hover:bg-slate-800 focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:outline-none"
            >
              Sign In to Account
            </button>
          </div>
        </div>
      ) : isLoading ? (
        <div className="py-20 text-center text-slate-600 text-sm" aria-live="polite">
          <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" aria-hidden="true" />
          Retrieving order telemetry records...
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Orders Sidebar List (if user has orders) */}
          {orders.length > 0 && (
            <div className="lg:col-span-4 space-y-3">
              <h2 className="text-xs font-bold text-slate-600 uppercase tracking-wider px-1">
                Your Orders ({orders.length})
              </h2>
              <div className="space-y-2.5 max-h-[70vh] overflow-y-auto pr-1" role="list" aria-label="Past orders">
                {orders.map((order) => (
                  <button
                    key={order.id}
                    onClick={() => setSelectedOrder(order)}
                    aria-pressed={selectedOrder?.id === order.id}
                    className={`w-full p-4 rounded-2xl border transition-all text-left focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:outline-none ${
                      selectedOrder?.id === order.id
                        ? 'bg-slate-900 text-white border-slate-900 shadow-md'
                        : 'bg-white text-slate-900 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-mono font-black">{order.orderNumber}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                          selectedOrder?.id === order.id
                            ? 'bg-white/20 text-white'
                            : order.status === 'delivered'
                            ? 'bg-emerald-100 text-emerald-900'
                            : order.status === 'shipped'
                            ? 'bg-sky-100 text-sky-900'
                            : 'bg-amber-100 text-amber-900'
                        }`}
                      >
                        {order.status}
                      </span>
                    </div>

                    <div className="flex justify-between items-baseline text-xs">
                      <span className={selectedOrder?.id === order.id ? 'text-slate-300' : 'text-slate-600'}>
                        {new Date(order.createdAt).toLocaleDateString('en-IN', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                      <span className="font-black text-sm">{formatInr(order.totalAmount)}</span>
                    </div>

                    <div className={`text-[11px] mt-2 truncate ${selectedOrder?.id === order.id ? 'text-slate-400' : 'text-slate-500'}`}>
                      {order.items.length} item{order.items.length > 1 ? 's' : ''}: {order.items.map((i) => i.productName).join(', ')}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Selected Order Details Panel */}
          {selectedOrder ? (
            <div className={`${orders.length > 0 ? 'lg:col-span-8' : 'lg:col-span-12'} bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6`}>
              {/* Top Meta */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-100 gap-4">
                <div>
                  <div className="flex items-center space-x-2">
                    <h2 className="text-2xl font-black text-slate-900 font-mono">
                      {selectedOrder.orderNumber}
                    </h2>
                    <span className="text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-300">
                      Payment {selectedOrder.paymentStatus}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1 flex items-center">
                    <Calendar className="w-3.5 h-3.5 mr-1" aria-hidden="true" />
                    Placed on {new Date(selectedOrder.createdAt).toLocaleString(undefined, { dateStyle: 'long', timeStyle: 'short' })}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => reorderAllItems(selectedOrder)}
                  className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-800 flex items-center space-x-1.5 transition-colors self-start sm:self-auto focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:outline-none"
                >
                  <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Re-Order Items</span>
                </button>
              </div>

              {/* Status Visual Tracker */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-800">Shipment Status</span>
                    <p className="text-xs text-slate-600">
                      {selectedOrder.shippingMethod}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-slate-800">Estimated Delivery</span>
                    <p className="text-xs font-bold text-emerald-700">
                      {new Date(selectedOrder.estimatedDelivery).toLocaleDateString(undefined, {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                </div>

                {/* Progress Bar steps */}
                <div className="grid grid-cols-4 gap-2 pt-2" role="list" aria-label="Shipment stages">
                  {[
                    { label: 'Confirmed', isDone: true },
                    { label: 'Processing', isDone: ['processing', 'shipped', 'delivered'].includes(selectedOrder.status) },
                    { label: 'In Transit', isDone: ['shipped', 'delivered'].includes(selectedOrder.status) },
                    { label: 'Delivered', isDone: selectedOrder.status === 'delivered' },
                  ].map((step, idx) => (
                    <div key={idx} className="space-y-1.5" role="listitem">
                      <div
                        className={`h-2 rounded-full transition-colors ${
                          step.isDone ? 'bg-indigo-600' : 'bg-slate-200'
                        }`}
                      />
                      <span className={`text-[10px] font-bold block truncate ${
                        step.isDone ? 'text-indigo-950' : 'text-slate-500'
                      }`}>
                        {step.label}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Tracking Code with copy */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-200/60 text-xs">
                  <div className="flex items-center space-x-2">
                    <Truck className="w-4 h-4 text-slate-500" aria-hidden="true" />
                    <span className="text-slate-600 font-medium">Tracking:</span>
                    <span className="font-mono font-bold text-slate-900">{selectedOrder.trackingNumber}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyTracking(selectedOrder.trackingNumber)}
                    aria-label="Copy tracking code"
                    className="text-xs font-semibold text-indigo-700 hover:text-indigo-900 flex items-center space-x-1 focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:outline-none px-2 py-0.5 rounded"
                  >
                    {copiedTracking === selectedOrder.trackingNumber ? (
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

              {/* Items in Order */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Order Items ({selectedOrder.items.length})
                </h3>
                <div className="divide-y divide-slate-100 border border-slate-100 rounded-2xl overflow-hidden" role="list">
                  {selectedOrder.items.map((item) => (
                    <div key={item.id} role="listitem" className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                      <div className="flex items-center space-x-3.5">
                        <img
                          src={item.productImage}
                          alt=""
                          className="w-14 h-14 rounded-xl object-cover bg-slate-100 border border-slate-200"
                          referrerPolicy="no-referrer"
                        />
                        <div>
                          <h4 className="text-sm font-bold text-slate-900 leading-snug">{item.productName}</h4>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {formatInr(item.price)} × {item.quantity}
                          </p>
                        </div>
                      </div>
                      <span className="text-sm font-black text-slate-900">
                        {formatInr(item.subtotal)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Totals & Shipping Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
                {/* Shipping destination */}
                <div className="space-y-1.5 text-xs text-slate-700 bg-slate-50 p-4 rounded-2xl">
                  <div className="flex items-center space-x-1 text-slate-900 font-bold mb-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-600" aria-hidden="true" />
                    <span>Shipping Destination</span>
                  </div>
                  <p className="font-semibold text-slate-900">{selectedOrder.shippingName}</p>
                  <p>{selectedOrder.shippingAddress}</p>
                  <p>{selectedOrder.shippingCity}, {selectedOrder.shippingPostalCode}</p>
                  <p>{selectedOrder.shippingCountry}</p>
                </div>

                {/* Price Summary Breakdown */}
                <div className="space-y-1.5 text-xs bg-slate-50 p-4 rounded-2xl">
                  <div className="flex justify-between text-slate-700">
                    <span>Items Subtotal:</span>
                    <span className="font-semibold text-slate-900">{formatInr(selectedOrder.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-slate-700">
                    <span>GST (18%):</span>
                    <span className="font-semibold text-slate-900">{formatInr(selectedOrder.taxAmount)}</span>
                  </div>
                  <div className="flex justify-between text-slate-700">
                    <span>Shipping:</span>
                    <span className="font-semibold text-slate-900">
                      {selectedOrder.shippingFee === 0 ? 'FREE' : formatInr(selectedOrder.shippingFee)}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-slate-200 flex justify-between text-sm">
                    <span className="font-bold text-slate-900">Grand Total:</span>
                    <span className="font-black text-slate-900 text-base">{formatInr(selectedOrder.totalAmount)}</span>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};

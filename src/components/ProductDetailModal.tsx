import React, { useState, useEffect, useRef } from 'react';
import { X, Star, ShoppingBag, Truck, ShieldCheck, Check, ArrowRight } from 'lucide-react';
import { Product } from '../types/index.js';
import { useCart } from '../context/CartContext.js';
import { formatInr } from '../utils/format.js';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onInstantCheckout: (product: Product) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onInstantCheckout,
}) => {
  if (!product) return null;

  const { addToCart, items } = useCart();
  const [selectedImage, setSelectedImage] = useState<string>(product.imageUrl);
  const [quantity, setQuantity] = useState<number>(1);
  const inCart = items.find((i) => i.productId === product.id);
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  // Sync selectedImage when product changes
  useEffect(() => {
    setSelectedImage(product.imageUrl);
    setQuantity(1);
  }, [product]);

  // Lock body scroll and handle Escape key
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeBtnRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  const gallery = product.galleryUrls && product.galleryUrls.length > 0
    ? product.galleryUrls
    : [product.imageUrl];

  const discountPercent = product.compareAtPrice
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="product-modal-title"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 md:p-6 animate-in fade-in duration-200"
    >
      <div
        className="relative bg-white rounded-3xl max-w-4xl w-full overflow-hidden shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          ref={closeBtnRef}
          onClick={onClose}
          id="product-modal-close-btn"
          aria-label="Close product details dialog"
          className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors shadow-sm focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:outline-none"
        >
          <X className="w-5 h-5" aria-hidden="true" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
          {/* Left Column: Image Gallery */}
          <div className="p-6 bg-slate-50 flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-200">
            <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-white shadow-inner mb-4">
              <img
                src={selectedImage}
                alt={`Detailed view of ${product.name}`}
                className="w-full h-full object-cover object-center"
                referrerPolicy="no-referrer"
              />
              {discountPercent && (
                <div className="absolute top-3 left-3 bg-rose-600 text-white px-2.5 py-1 rounded-md text-xs font-black shadow-md">
                  SAVE {discountPercent}%
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {gallery.length > 1 && (
              <div className="flex space-x-2.5 overflow-x-auto pb-1" role="group" aria-label="Product thumbnail gallery">
                {gallery.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(img)}
                    aria-label={`View product image ${idx + 1}`}
                    aria-pressed={selectedImage === img}
                    className={`relative w-16 h-16 rounded-xl overflow-hidden shrink-0 border-2 transition-all focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:outline-none ${
                      selectedImage === img
                        ? 'border-indigo-600 ring-2 ring-indigo-600/20'
                        : 'border-slate-200 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Product Specs & Actions */}
          <div className="p-6 sm:p-8 flex flex-col justify-between space-y-6 max-h-[85vh] overflow-y-auto">
            <div>
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-bold text-indigo-700 uppercase tracking-wider text-xs">
                  {product.categoryName}
                </span>
                <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-300">
                  {product.stockQuantity > 0 ? `${product.stockQuantity} in stock` : 'Out of stock'}
                </span>
              </div>

              <h2 id="product-modal-title" className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight font-serif">
                {product.name}
              </h2>

              {/* Rating */}
              <div className="flex items-center space-x-2 mt-2.5" aria-label={`Rating ${product.rating} stars out of 5 from ${product.reviewCount} customer reviews`}>
                <div className="flex text-amber-400" aria-hidden="true">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.floor(product.rating)
                          ? 'fill-amber-400 text-amber-400'
                          : 'fill-slate-200 text-slate-200'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm font-bold text-slate-800">{product.rating}</span>
                <span className="text-xs text-slate-500">({product.reviewCount} customer reviews)</span>
              </div>

              {/* Price */}
              <div className="flex flex-col mt-4 pt-4 border-t border-slate-100">
                <div className="flex items-baseline space-x-3">
                  <span className="text-3xl font-black text-slate-900">
                    {formatInr(product.price)}
                  </span>
                  {product.compareAtPrice && (
                    <span className="text-base text-slate-500 line-through font-medium">
                      {formatInr(product.compareAtPrice)}
                    </span>
                  )}
                </div>
                {product.emiPerMonth && (
                  <div className="mt-2 text-xs font-semibold text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-lg inline-flex items-center space-x-2 border border-indigo-100 self-start">
                    <span>Credit & Split Pay: Pay {formatInr(product.emiPerMonth)}/month for 3 months with 0% interest</span>
                  </div>
                )}
                {product.sellerName && (
                  <div className="mt-2 text-xs text-slate-600 font-medium">
                    Fulfilled by verified Indian merchant: <strong className="text-slate-900">{product.sellerName}</strong>
                  </div>
                )}
              </div>

              {/* Description */}
              <p className="text-slate-700 text-sm leading-relaxed mt-4">
                {product.description}
              </p>

              {/* Specs Table */}
              {product.specs && Object.keys(product.specs).length > 0 && (
                <div className="mt-5 pt-4 border-t border-slate-100">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                    Key Specifications
                  </h3>
                  <dl className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-xl">
                    {Object.entries(product.specs).map(([key, value]) => (
                      <div key={key}>
                        <dt className="text-slate-500 block text-[11px] font-medium">{key}</dt>
                        <dd className="font-semibold text-slate-900">{value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="space-y-3 pt-4 border-t border-slate-100">
              {/* Quantity selector */}
              <div className="flex items-center space-x-3">
                <span className="text-xs font-bold text-slate-800" id="quantity-stepper-label">Quantity:</span>
                <div className="inline-flex items-center border border-slate-200 rounded-xl overflow-hidden bg-slate-50" role="group" aria-labelledby="quantity-stepper-label">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    aria-label="Decrease quantity"
                    className="px-3 py-1.5 text-sm font-bold text-slate-700 hover:bg-slate-200 focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:outline-none transition-colors"
                  >
                    -
                  </button>
                  <span className="px-4 py-1.5 text-xs font-black text-slate-900 min-w-[2.5rem] text-center" aria-live="polite">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.min(product.stockQuantity, quantity + 1))}
                    aria-label="Increase quantity"
                    className="px-3 py-1.5 text-sm font-bold text-slate-700 hover:bg-slate-200 focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:outline-none transition-colors"
                  >
                    +
                  </button>
                </div>
                {inCart && (
                  <span className="text-xs text-emerald-700 font-semibold flex items-center">
                    <Check className="w-3.5 h-3.5 mr-1" aria-hidden="true" /> Currently {inCart.quantity} in cart
                  </span>
                )}
              </div>

              {/* Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => addToCart(product, quantity)}
                  id="modal-add-to-cart-btn"
                  className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-md focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:outline-none transition-all flex items-center justify-center space-x-2"
                >
                  <ShoppingBag className="w-4 h-4" aria-hidden="true" />
                  <span>Add to Cart</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    addToCart(product, quantity);
                    onInstantCheckout(product);
                  }}
                  id="modal-instant-checkout-btn"
                  className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:outline-none transition-all flex items-center justify-center space-x-2"
                >
                  <span>Checkout Now</span>
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>

              {/* Trust Badges */}
              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2">
                <span className="flex items-center">
                  <Truck className="w-3.5 h-3.5 mr-1 text-slate-500" aria-hidden="true" /> Free Insured Delivery
                </span>
                <span className="flex items-center">
                  <ShieldCheck className="w-3.5 h-3.5 mr-1 text-slate-500" aria-hidden="true" /> 2-Year Manufacturer Warranty
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

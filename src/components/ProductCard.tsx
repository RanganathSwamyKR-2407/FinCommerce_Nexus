import React from 'react';
import { Star, ShoppingBag, Eye, Check } from 'lucide-react';
import { Product } from '../types/index.js';
import { useCart } from '../context/CartContext.js';

interface ProductCardProps {
  product: Product;
  onSelect: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onSelect }) => {
  const { addToCart, items } = useCart();
  const inCart = items.some((i) => i.productId === product.id);

  const discountPercent = product.compareAtPrice
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : null;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelect(product);
    }
  };

  return (
    <article
      tabIndex={0}
      role="button"
      aria-label={`${product.name}, price $${product.price.toFixed(2)}, rating ${product.rating} stars`}
      onClick={() => onSelect(product)}
      onKeyDown={handleKeyDown}
      className="group bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl hover:border-slate-300 focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2 focus-visible:outline-none transition-all duration-300 flex flex-col cursor-pointer"
      id={`product-card-${product.id}`}
    >
      {/* Product Image Area */}
      <div className="relative aspect-square w-full bg-slate-100 overflow-hidden">
        <img
          src={product.imageUrl}
          alt={`Product photo of ${product.name}`}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
          referrerPolicy="no-referrer"
        />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {product.isFeatured && (
            <span className="bg-slate-900/90 backdrop-blur-md text-white px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider">
              Featured
            </span>
          )}
          {discountPercent && (
            <span className="bg-rose-600 text-white px-2 py-0.5 rounded-md text-[11px] font-black tracking-tight">
              -{discountPercent}%
            </span>
          )}
        </div>

        {/* Quick View Indicator */}
        <div className="absolute inset-0 bg-slate-900/20 opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
          <span className="bg-white/95 backdrop-blur-md text-slate-900 px-3.5 py-1.5 rounded-full text-xs font-bold shadow-lg flex items-center space-x-1.5">
            <Eye className="w-3.5 h-3.5 text-slate-700" aria-hidden="true" />
            <span>Quick View</span>
          </span>
        </div>
      </div>

      {/* Product Information */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <div className="flex items-center justify-between text-xs text-slate-600 mb-1">
            <span className="font-semibold text-indigo-700 uppercase tracking-wider text-[11px]">
              {product.categoryName}
            </span>
            <div className="flex items-center space-x-1 text-amber-600 font-bold text-xs" aria-label={`Rating ${product.rating} out of 5 stars from ${product.reviewCount} reviews`}>
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" aria-hidden="true" />
              <span>{product.rating}</span>
              <span className="text-slate-500 font-normal">({product.reviewCount})</span>
            </div>
          </div>

          <h3 className="font-bold text-slate-900 text-base leading-snug group-hover:text-indigo-600 transition-colors line-clamp-2">
            {product.name}
          </h3>

          <p className="text-xs text-slate-600 line-clamp-2 mt-1.5 font-normal leading-relaxed">
            {product.description}
          </p>
        </div>

        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-baseline space-x-1.5">
            <span className="text-lg font-black text-slate-900">
              ${product.price.toFixed(2)}
            </span>
            {product.compareAtPrice && (
              <span className="text-xs text-slate-500 line-through font-medium">
                ${product.compareAtPrice.toFixed(2)}
              </span>
            )}
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              addToCart(product, 1);
            }}
            id={`add-to-cart-btn-${product.id}`}
            aria-label={inCart ? `Already in cart: ${product.name}. Click to add another.` : `Add ${product.name} to cart`}
            className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all shadow-sm focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:outline-none ${
              inCart
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100'
                : 'bg-slate-900 text-white hover:bg-indigo-600'
            }`}
          >
            {inCart ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-700" aria-hidden="true" />
                <span>In Cart</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Add</span>
              </>
            )}
          </button>
        </div>
      </div>
    </article>
  );
};

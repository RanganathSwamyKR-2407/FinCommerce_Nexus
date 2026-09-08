import React from 'react';
import { ShieldCheck, Truck, RotateCcw, CreditCard, Sparkles, ArrowRight } from 'lucide-react';
import { Product } from '../types/index.js';

interface HeroBannerProps {
  featuredProduct?: Product;
  onSelectProduct: (product: Product) => void;
  onShopNow: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  featuredProduct,
  onSelectProduct,
  onShopNow,
}) => {
  return (
    <section aria-label="Hero Spotlight" className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white pt-8 pb-12 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
      {/* Decorative ambient background glows */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" aria-hidden="true" />
      <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" aria-hidden="true" />

      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Main Copy */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" aria-hidden="true" />
              <span>Engineered Precision Equipment & Design Objects</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight text-white font-serif">
              Master the Craft of Everyday Gear.
            </h1>

            <p className="text-slate-300 text-base sm:text-lg max-w-xl mx-auto lg:mx-0 font-normal leading-relaxed">
              Curated audio instruments, titanium daily carry, and ergonomic workspaces. Tested for longevity, precision, and architectural aesthetics.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-2">
              <button
                onClick={onShopNow}
                id="hero-shop-collection-btn"
                aria-label="Explore entire product catalog"
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-sm shadow-lg hover:shadow-white/20 transition-all flex items-center justify-center space-x-2 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 focus-visible:outline-none"
              >
                <span>Explore Catalog</span>
                <ArrowRight className="w-4 h-4 text-slate-900" aria-hidden="true" />
              </button>

              {featuredProduct && (
                <button
                  onClick={() => onSelectProduct(featuredProduct)}
                  id="hero-view-featured-btn"
                  aria-label={`View featured product details for ${featuredProduct.name}`}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-200 border border-slate-700 font-semibold text-sm transition-all focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:outline-none"
                >
                  Featured: {featuredProduct.name.split(' ')[0]} {featuredProduct.name.split(' ')[1]}
                </button>
              )}
            </div>
          </div>

          {/* Featured Visual Spotlight */}
          {featuredProduct && (
            <div className="lg:col-span-5 flex justify-center">
              <div
                tabIndex={0}
                role="button"
                aria-label={`Featured product: ${featuredProduct.name}, price $${featuredProduct.price.toFixed(2)}`}
                onClick={() => onSelectProduct(featuredProduct)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelectProduct(featuredProduct);
                  }
                }}
                className="cursor-pointer group relative w-full max-w-md bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-2xl backdrop-blur-sm transition-transform hover:-translate-y-1 duration-300 focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:outline-none"
              >
                <div className="relative aspect-4/3 w-full overflow-hidden rounded-xl bg-slate-800 mb-4">
                  <img
                    src={featuredProduct.imageUrl}
                    alt={`Photo of featured product: ${featuredProduct.name}`}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-3 left-3 bg-slate-900/90 backdrop-blur-md px-2.5 py-1 rounded-md text-[11px] font-bold text-amber-300 border border-amber-400/20">
                    ★ {featuredProduct.rating} ({featuredProduct.reviewCount} reviews)
                  </div>
                  {featuredProduct.compareAtPrice && (
                    <div className="absolute top-3 right-3 bg-rose-600 text-white px-2 py-0.5 rounded-md text-xs font-bold shadow-md">
                      SAVE ${(featuredProduct.compareAtPrice - featuredProduct.price).toFixed(0)}
                    </div>
                  )}
                </div>

                <div className="space-y-1.5">
                  <span className="text-xs font-medium text-indigo-400 uppercase tracking-wider">
                    {featuredProduct.categoryName}
                  </span>
                  <h2 className="text-lg font-bold text-white group-hover:text-indigo-300 transition-colors line-clamp-1">
                    {featuredProduct.name}
                  </h2>
                  <div className="flex items-baseline space-x-2 pt-1">
                    <span className="text-2xl font-black text-white">
                      ${featuredProduct.price.toFixed(2)}
                    </span>
                    {featuredProduct.compareAtPrice && (
                      <span className="text-sm line-through text-slate-500 font-medium">
                        ${featuredProduct.compareAtPrice.toFixed(2)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Value Props Strip */}
        <div className="mt-12 pt-8 border-t border-slate-800/80 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 text-slate-300 text-xs sm:text-sm">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
              <Truck className="w-4 h-4" aria-hidden="true" />
            </div>
            <div>
              <p className="font-bold text-white text-xs sm:text-sm">Fast Global Delivery</p>
              <p className="text-[11px] text-slate-400">Free over $100</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center shrink-0">
              <CreditCard className="w-4 h-4" aria-hidden="true" />
            </div>
            <div>
              <p className="font-bold text-white text-xs sm:text-sm">Stripe Payments</p>
              <p className="text-[11px] text-slate-400">Card, Apple Pay, Google Pay</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0">
              <RotateCcw className="w-4 h-4" aria-hidden="true" />
            </div>
            <div>
              <p className="font-bold text-white text-xs sm:text-sm">30-Day Hassle Free</p>
              <p className="text-[11px] text-slate-400">100% money back returns</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4" aria-hidden="true" />
            </div>
            <div>
              <p className="font-bold text-white text-xs sm:text-sm">Verified Authentic</p>
              <p className="text-[11px] text-slate-400">2-year warranty included</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

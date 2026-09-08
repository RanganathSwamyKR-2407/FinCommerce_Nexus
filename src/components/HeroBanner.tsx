import React from 'react';
import { ShieldCheck, Truck, RotateCcw, CreditCard, Sparkles, ArrowRight, Zap, Smartphone } from 'lucide-react';
import { Product } from '../types/index.js';
import { formatInr } from '../utils/format.js';

interface HeroBannerProps {
  featuredProduct?: Product;
  onSelectProduct: (product: Product) => void;
  onShopNow: () => void;
  onOpenDashboard?: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  featuredProduct,
  onSelectProduct,
  onShopNow,
  onOpenDashboard,
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
            <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" aria-hidden="true" />
              <span>India's Unified Commerce & Finance Ecosystem</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight text-white font-serif">
              Pay, Shop, Borrow, & Invest in One Unified Flow.
            </h1>

            <p className="text-slate-300 text-base sm:text-lg max-w-xl mx-auto lg:mx-0 font-normal leading-relaxed">
              Curated audio equipment, mechanical desks, and workspace precision hardware. Checkout with instant UPI or 0% interest Split-in-3 credit, while building resilient wealth with 24K digital gold.
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

              {onOpenDashboard && (
                <button
                  onClick={onOpenDashboard}
                  id="hero-view-dashboard-btn"
                  aria-label="Open FinCommerce financial dashboard"
                  className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-indigo-600/90 hover:bg-indigo-600 text-white font-semibold text-sm transition-all shadow-md flex items-center justify-center space-x-2 focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:outline-none"
                >
                  <Zap className="w-4 h-4 text-amber-300" />
                  <span>Open Financial Hub</span>
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
                aria-label={`Featured product: ${featuredProduct.name}, price ${formatInr(featuredProduct.price)}`}
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
                      SAVE {formatInr(featuredProduct.compareAtPrice - featuredProduct.price)}
                    </div>
                  )}
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-indigo-400 uppercase tracking-wider">
                      {featuredProduct.categoryName}
                    </span>
                    <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded-full font-bold">
                      0% Split in 3 Available
                    </span>
                  </div>
                  <h2 className="text-lg font-bold text-white group-hover:text-indigo-300 transition-colors line-clamp-1">
                    {featuredProduct.name}
                  </h2>
                  <div className="flex items-baseline space-x-2 pt-1">
                    <span className="text-2xl font-black text-white">
                      {formatInr(featuredProduct.price)}
                    </span>
                    {featuredProduct.compareAtPrice && (
                      <span className="text-sm line-through text-slate-500 font-medium">
                        {formatInr(featuredProduct.compareAtPrice)}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Or 3 monthly payments of {formatInr(Math.round(featuredProduct.price / 3))} with FinCommerce Credit
                  </p>
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
              <p className="font-bold text-white text-xs sm:text-sm">Express Pan-India Delivery</p>
              <p className="text-[11px] text-slate-400">Free on orders above ₹999</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center shrink-0">
              <Smartphone className="w-4 h-4" aria-hidden="true" />
            </div>
            <div>
              <p className="font-bold text-white text-xs sm:text-sm">NPCI UPI & AutoPay</p>
              <p className="text-[11px] text-slate-400">Instant zero-fee settlements</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0">
              <Zap className="w-4 h-4" aria-hidden="true" />
            </div>
            <div>
              <p className="font-bold text-white text-xs sm:text-sm">Pre-Approved Credit</p>
              <p className="text-[11px] text-slate-400">0% Interest Split-in-3</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4" aria-hidden="true" />
            </div>
            <div>
              <p className="font-bold text-white text-xs sm:text-sm">24K Digital Gold & SIP</p>
              <p className="text-[11px] text-slate-400">Automatic round-up savings</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

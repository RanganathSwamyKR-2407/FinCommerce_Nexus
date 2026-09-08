import React, { useState, useEffect, useRef } from 'react';
import {
  ShoppingBag,
  Search,
  User as UserIcon,
  LogOut,
  Package,
  ChevronDown,
  ShieldCheck,
  Zap,
  X,
  Sparkles,
  Smartphone,
  CreditCard,
  TrendingUp,
  LayoutDashboard
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { useCart } from '../context/CartContext.js';

export type ActiveView = 'catalog' | 'dashboard' | 'payments' | 'lending' | 'investing' | 'orders';

interface NavbarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  categories: Array<{ id: number; name: string; slug: string }>;
  currentView: ActiveView;
  onNavigateView: (view: ActiveView) => void;
  onOpenAiAdvisor: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onSelectCategory,
  categories,
  currentView,
  onNavigateView,
  onOpenAiAdvisor,
}) => {
  const { user, isAuthenticated, logout, openSignIn } = useAuth();
  const { itemCount, setIsCartOpen } = useCart();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Keyboard shortcut '/' to focus search, and 'Escape' to close dropdown
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === '/' &&
        document.activeElement !== searchInputRef.current &&
        !(document.activeElement instanceof HTMLInputElement || document.activeElement instanceof HTMLTextAreaElement)
      ) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      if (e.key === 'Escape' && isUserMenuOpen) {
        setIsUserMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isUserMenuOpen]);

  // Click outside to close user menu
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    if (isUserMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isUserMenuOpen]);

  return (
    <header role="banner" className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-2xs">
      {/* Top announcement bar */}
      <div className="bg-slate-900 text-slate-200 px-4 py-1.5 text-xs font-medium">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="inline-flex items-center text-emerald-400 font-semibold">
              <Zap className="w-3.5 h-3.5 mr-1" aria-hidden="true" /> Free Express Shipping on orders over ₹999
            </span>
            <span className="hidden sm:inline text-slate-500" aria-hidden="true">|</span>
            <span className="hidden sm:inline text-slate-300">Next-Day Pan-India Dispatch Guaranteed</span>
          </div>
          <div className="flex items-center space-x-4">
            <span className="flex items-center text-slate-200">
              <ShieldCheck className="w-3.5 h-3.5 mr-1 text-emerald-400" aria-hidden="true" /> NPCI UPI & 256-Bit RBI Encrypted
            </span>
            <span className="text-slate-300 font-bold font-mono">INR (₹)</span>
          </div>
        </div>
      </div>

      {/* Main navigation row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
          {/* Brand Logo */}
          <div className="flex items-center">
            <button
              onClick={() => {
                onNavigateView('catalog');
                onSelectCategory('all');
                onSearchChange('');
              }}
              className="group text-left flex items-center space-x-2.5 focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2 focus-visible:outline-none rounded-xl p-1"
              id="brand-logo-btn"
              aria-label="FinCommerce - Home"
            >
              <div
                className="w-9 h-9 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-black text-xl tracking-tight shadow-md group-hover:bg-indigo-700 transition-colors"
                aria-hidden="true"
              >
                F
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-extrabold tracking-tight text-slate-900 font-serif leading-none">
                  FINCOMMERCE
                </span>
                <span className="text-[10px] tracking-widest text-indigo-700 font-mono font-bold uppercase mt-0.5">
                  India FinTech + Commerce
                </span>
              </div>
            </button>
          </div>

          {/* Accessible Search bar with keyboard shortcut */}
          <div className="flex-1 max-w-lg mx-2 sm:mx-4">
            <div className="relative">
              <label htmlFor="global-search-input" className="sr-only">
                Search products, gear, and audio instruments
              </label>
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400" aria-hidden="true">
                <Search className="w-4 h-4" />
              </div>
              <input
                ref={searchInputRef}
                type="search"
                id="global-search-input"
                value={searchQuery}
                onChange={(e) => {
                  if (currentView !== 'catalog') onNavigateView('catalog');
                  onSearchChange(e.target.value);
                }}
                placeholder="Search products & equipment... (Press '/' to focus)"
                className="w-full pl-10 pr-12 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:bg-white focus:outline-none transition-all text-slate-900 placeholder-slate-400"
              />
              <div className="absolute inset-y-0 right-0 pr-2 flex items-center space-x-1">
                {searchQuery ? (
                  <button
                    onClick={() => onSearchChange('')}
                    aria-label="Clear search query"
                    className="p-1 rounded-md text-slate-400 hover:text-slate-700 focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:outline-none"
                  >
                    <X className="w-4 h-4" />
                  </button>
                ) : (
                  <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono font-semibold text-slate-500 bg-slate-200/80 rounded border border-slate-300">
                    /
                  </kbd>
                )}
              </div>
            </div>
          </div>

          {/* Right Action buttons */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Ask AI Advisor Button */}
            <button
              onClick={onOpenAiAdvisor}
              id="navbar-ai-advisor-btn"
              aria-label="Open AI Financial Advisor"
              className="hidden lg:flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200/80 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
              <span>AI Advisor</span>
            </button>

            {/* User Account / Auth */}
            {isAuthenticated ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  id="navbar-user-menu-btn"
                  aria-haspopup="true"
                  aria-expanded={isUserMenuOpen}
                  aria-label={`User account menu for ${user?.name || 'user'}`}
                  className="flex items-center space-x-2 px-2.5 py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 bg-white focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:outline-none transition-all text-sm font-medium text-slate-800"
                >
                  <div
                    className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs"
                    aria-hidden="true"
                  >
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <span className="hidden md:inline max-w-[100px] truncate text-slate-700">
                    {user?.name}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" />
                </button>

                {isUserMenuOpen && (
                  <div
                    role="menu"
                    aria-orientation="vertical"
                    aria-labelledby="navbar-user-menu-btn"
                    className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in zoom-in-95"
                  >
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs text-slate-500 font-medium">Signed in as</p>
                      <p className="text-sm font-semibold text-slate-900 truncate">{user?.name}</p>
                      <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                      <p className="text-[10px] text-indigo-600 font-mono mt-0.5">{user?.upiId || 'priya@oksbi'}</p>
                    </div>
                    <button
                      role="menuitem"
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        onNavigateView('dashboard');
                      }}
                      className="w-full px-4 py-2 text-left text-xs text-slate-700 hover:bg-slate-50 flex items-center space-x-2 focus-visible:bg-slate-50 focus-visible:outline-none"
                    >
                      <LayoutDashboard className="w-4 h-4 text-slate-500" aria-hidden="true" />
                      <span>Financial Dashboard</span>
                    </button>
                    <button
                      role="menuitem"
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        onNavigateView('orders');
                      }}
                      className="w-full px-4 py-2 text-left text-xs text-slate-700 hover:bg-slate-50 flex items-center space-x-2 focus-visible:bg-slate-50 focus-visible:outline-none"
                    >
                      <Package className="w-4 h-4 text-slate-500" aria-hidden="true" />
                      <span>Order History & Tracking</span>
                    </button>
                    <div className="border-t border-slate-100 my-1" />
                    <button
                      role="menuitem"
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        logout();
                      }}
                      className="w-full px-4 py-2 text-left text-xs text-rose-600 hover:bg-rose-50 flex items-center space-x-2 font-medium focus-visible:bg-rose-50 focus-visible:outline-none"
                    >
                      <LogOut className="w-4 h-4 text-rose-500" aria-hidden="true" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={openSignIn}
                id="navbar-signin-btn"
                aria-label="Sign in to your account"
                className="flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:outline-none transition-colors"
              >
                <UserIcon className="w-4 h-4 text-slate-500" aria-hidden="true" />
                <span>Sign In</span>
              </button>
            )}

            {/* Shopping Cart Trigger */}
            <button
              onClick={() => setIsCartOpen(true)}
              id="navbar-cart-btn"
              aria-label={`View shopping cart with ${itemCount} items`}
              className="relative flex items-center space-x-2 bg-slate-900 hover:bg-slate-800 text-white px-3.5 py-2 rounded-xl text-xs font-semibold shadow-sm focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2 focus-visible:outline-none transition-all"
            >
              <ShoppingBag className="w-4 h-4" aria-hidden="true" />
              <span className="hidden sm:inline">Cart</span>
              {itemCount > 0 && (
                <span
                  aria-label={`${itemCount} items in cart`}
                  className="bg-indigo-500 text-white text-[11px] font-black px-2 py-0.5 rounded-full ml-1 animate-pulse"
                >
                  {itemCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Unified Ecosystem Navigation Tabs */}
        <nav aria-label="Ecosystem navigation" className="flex items-center space-x-1 sm:space-x-2 overflow-x-auto py-2 scrollbar-none border-t border-slate-100 text-xs font-semibold">
          <button
            onClick={() => onNavigateView('catalog')}
            aria-current={currentView === 'catalog' ? 'page' : undefined}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all flex items-center space-x-1.5 ${
              currentView === 'catalog'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Shop Equipment</span>
          </button>

          <button
            onClick={() => onNavigateView('dashboard')}
            aria-current={currentView === 'dashboard' ? 'page' : undefined}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all flex items-center space-x-1.5 ${
              currentView === 'dashboard'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Financial Hub</span>
          </button>

          <button
            onClick={() => onNavigateView('payments')}
            aria-current={currentView === 'payments' ? 'page' : undefined}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all flex items-center space-x-1.5 ${
              currentView === 'payments'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>UPI & Payments</span>
          </button>

          <button
            onClick={() => onNavigateView('lending')}
            aria-current={currentView === 'lending' ? 'page' : undefined}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all flex items-center space-x-1.5 ${
              currentView === 'lending'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>0% Split Credit</span>
          </button>

          <button
            onClick={() => onNavigateView('investing')}
            aria-current={currentView === 'investing' ? 'page' : undefined}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all flex items-center space-x-1.5 ${
              currentView === 'investing'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Invest & 24K Gold</span>
          </button>

          <button
            onClick={() => onNavigateView('orders')}
            aria-current={currentView === 'orders' ? 'page' : undefined}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all flex items-center space-x-1.5 ${
              currentView === 'orders'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>Orders</span>
          </button>
        </nav>

        {/* Secondary Category bar when on Catalog */}
        {currentView === 'catalog' && (
          <div aria-label="Product categories" className="flex items-center space-x-2 overflow-x-auto py-2 scrollbar-none border-t border-slate-100 text-xs">
            <span className="text-[10px] uppercase font-bold text-slate-600 tracking-wider mr-1">Category:</span>
            <button
              onClick={() => onSelectCategory('all')}
              aria-pressed={selectedCategory === 'all'}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold whitespace-nowrap transition-all ${
                selectedCategory === 'all'
                  ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 font-bold'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              All Gear
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.name)}
                aria-pressed={selectedCategory.toLowerCase() === cat.name.toLowerCase()}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold whitespace-nowrap transition-all ${
                  selectedCategory.toLowerCase() === cat.name.toLowerCase()
                    ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 font-bold'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        )}
      </div>
    </header>
  );
};

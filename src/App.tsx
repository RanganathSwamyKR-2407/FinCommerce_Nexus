import React, { useState, useEffect, useCallback } from 'react';
import { AuthProvider } from './context/AuthContext.js';
import { CartProvider } from './context/CartContext.js';
import { Navbar, ActiveView } from './components/Navbar.js';
import { HeroBanner } from './components/HeroBanner.js';
import { ProductCard } from './components/ProductCard.js';
import { ProductFilters } from './components/ProductFilters.js';
import { ProductDetailModal } from './components/ProductDetailModal.js';
import { CartDrawer } from './components/CartDrawer.js';
import { CheckoutModal } from './components/CheckoutModal.js';
import { OrderHistoryView } from './components/OrderHistoryView.js';
import { UnifiedDashboardView } from './components/UnifiedDashboardView.js';
import { PaymentsView } from './components/PaymentsView.js';
import { LendingView } from './components/LendingView.js';
import { InvestingView } from './components/InvestingView.js';
import { AiFinancialAdvisorModal } from './components/AiFinancialAdvisorModal.js';
import { AuthModal } from './components/AuthModal.js';
import { NotificationToast } from './components/NotificationToast.js';
import { Footer } from './components/Footer.js';
import { Product, Category, FilterState } from './types/index.js';
import { initialCategories, initialProducts } from '../server/db/seedData.js';
import { Search, Filter, X } from 'lucide-react';

const initialFilterState: FilterState = {
  q: '',
  category: 'all',
  minPrice: null,
  maxPrice: null,
  rating: null,
  inStock: false,
  sort: 'featured',
};

function filterLocalProducts(items: Product[], f: FilterState): Product[] {
  let result = [...items];
  if (f.category && f.category !== 'all') {
    result = result.filter((p) => p.categoryName.toLowerCase() === f.category.toLowerCase());
  }
  if (f.q && f.q.trim()) {
    const query = f.q.toLowerCase().trim();
    result = result.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query) ||
        p.tags?.some((t) => t.toLowerCase().includes(query))
    );
  }
  if (f.minPrice !== null) {
    result = result.filter((p) => p.price >= f.minPrice!);
  }
  if (f.maxPrice !== null) {
    result = result.filter((p) => p.price <= f.maxPrice!);
  }
  if (f.rating !== null) {
    result = result.filter((p) => p.rating >= f.rating!);
  }
  if (f.inStock) {
    result = result.filter((p) => p.stockQuantity > 0);
  }
  if (f.sort === 'price-low') {
    result.sort((a, b) => a.price - b.price);
  } else if (f.sort === 'price-high') {
    result.sort((a, b) => b.price - a.price);
  } else if (f.sort === 'rating') {
    result.sort((a, b) => b.rating - a.rating);
  }
  return result;
}

function MainContent() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [totalProducts, setTotalProducts] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [filters, setFilters] = useState<FilterState>(initialFilterState);

  // Modals and Views
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [currentView, setCurrentView] = useState<ActiveView>('catalog');
  const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState<boolean>(false);
  const [isAiAdvisorOpen, setIsAiAdvisorOpen] = useState<boolean>(false);

  // Load Categories on mount
  useEffect(() => {
    fetch('/api/products/categories')
      .then((res) => {
        if (!res.ok) throw new Error('API failed');
        return res.json();
      })
      .then((data) => {
        if (data.categories && Array.isArray(data.categories)) {
          setCategories(data.categories);
        } else {
          setCategories(initialCategories);
        }
      })
      .catch(() => setCategories(initialCategories));
  }, []);

  // Fetch Products based on current filters
  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.q) params.append('q', filters.q);
      if (filters.category && filters.category !== 'all') params.append('category', filters.category);
      if (filters.minPrice !== null) params.append('minPrice', filters.minPrice.toString());
      if (filters.maxPrice !== null) params.append('maxPrice', filters.maxPrice.toString());
      if (filters.rating !== null) params.append('rating', filters.rating.toString());
      if (filters.inStock) params.append('inStock', 'true');
      if (filters.sort) params.append('sort', filters.sort);

      const response = await fetch(`/api/products?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setProducts(data.products || []);
        setTotalProducts(data.total || 0);
      } else {
        const filtered = filterLocalProducts(initialProducts, filters);
        setProducts(filtered);
        setTotalProducts(filtered.length);
      }
    } catch {
      const filtered = filterLocalProducts(initialProducts, filters);
      setProducts(filtered);
      setTotalProducts(filtered.length);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts();
    }, 150);
    return () => clearTimeout(timer);
  }, [fetchProducts]);

  // Handle mobile filters escape key
  useEffect(() => {
    if (!isMobileFiltersOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMobileFiltersOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMobileFiltersOpen]);

  const handleFilterChange = (newFilters: Partial<FilterState>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const handleResetFilters = () => {
    setFilters(initialFilterState);
  };

  const featuredProduct = products.find((p) => p.isFeatured) || products[0];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-indigo-500 selection:text-white">
      {/* Accessible Skip to Main Content Link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2.5 focus:bg-indigo-600 focus:text-white focus:rounded-xl focus:shadow-2xl focus:font-bold focus:text-xs focus:outline-none"
      >
        Skip to main content
      </a>

      {/* Global Navigation */}
      <Navbar
        searchQuery={filters.q}
        onSearchChange={(q) => handleFilterChange({ q })}
        selectedCategory={filters.category}
        onSelectCategory={(category) => {
          handleFilterChange({ category });
          if (currentView !== 'catalog') setCurrentView('catalog');
        }}
        categories={categories}
        currentView={currentView}
        onNavigateView={(view) => {
          setCurrentView(view);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenAiAdvisor={() => setIsAiAdvisorOpen(true)}
      />

      {/* Main Body with accessible id & tabIndex for skip-link */}
      <main id="main-content" tabIndex={-1} className="flex-1 focus:outline-none">
        {currentView === 'dashboard' && (
          <UnifiedDashboardView
            onNavigate={(view) => setCurrentView(view)}
            onOpenAiAdvisor={() => setIsAiAdvisorOpen(true)}
          />
        )}

        {currentView === 'payments' && <PaymentsView />}

        {currentView === 'lending' && <LendingView />}

        {currentView === 'investing' && <InvestingView />}

        {currentView === 'orders' && (
          <OrderHistoryView
            onBack={() => setCurrentView('catalog')}
            onOpenProduct={(id) => {
              const prod = products.find((p) => p.id === id);
              if (prod) setSelectedProduct(prod);
            }}
          />
        )}

        {currentView === 'catalog' && (
          <>
            {/* Hero Section (only when on default view without active search) */}
            {!filters.q && filters.category === 'all' && (
              <HeroBanner
                featuredProduct={featuredProduct}
                onSelectProduct={(p) => setSelectedProduct(p)}
                onShopNow={() => {
                  const el = document.getElementById('catalog-grid');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                onOpenDashboard={() => setCurrentView('dashboard')}
              />
            )}

            {/* Product Catalog Section */}
            <section id="catalog-grid" aria-label="Product Catalog" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
              {/* Category Header & Result Counts */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-6 border-b border-slate-200 gap-4">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-900 font-serif tracking-tight">
                    {filters.category === 'all' ? 'Hardware & Electronics Catalog' : filters.category}
                  </h2>
                  <p className="text-xs text-slate-600 mt-1">
                    {filters.q
                      ? `Search results for "${filters.q}" (${totalProducts} products)`
                      : `Displaying ${totalProducts} precision engineered products • 0% Split in 3 available`}
                  </p>
                </div>

                {/* Mobile Filter Trigger */}
                <div className="flex items-center space-x-2 sm:hidden">
                  <button
                    onClick={() => setIsMobileFiltersOpen(true)}
                    aria-label="Open filter and sorting menu"
                    className="flex-1 py-2 px-3.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 flex items-center justify-center space-x-1.5 shadow-2xs focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:outline-none"
                  >
                    <Filter className="w-3.5 h-3.5 text-indigo-600" aria-hidden="true" />
                    <span>Filter & Sort</span>
                  </button>
                </div>
              </div>

              {/* Grid with Left Sidebar Filters */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Desktop Left Filter Sidebar */}
                <div className="hidden lg:block lg:col-span-3 sticky top-28">
                  <ProductFilters
                    filters={filters}
                    onFilterChange={handleFilterChange}
                    onResetFilters={handleResetFilters}
                    categories={categories}
                    totalResults={totalProducts}
                  />
                </div>

                {/* Product Grid Area */}
                <div className="lg:col-span-9">
                  {isLoading ? (
                    <div className="py-24 text-center" aria-live="polite">
                      <div className="w-9 h-9 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" aria-hidden="true" />
                      <p className="text-xs text-slate-600 font-medium">Retrieving verified catalog records...</p>
                    </div>
                  ) : products.length === 0 ? (
                    <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-lg mx-auto space-y-4 my-8" role="status">
                      <div className="w-14 h-14 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center mx-auto" aria-hidden="true">
                        <Search className="w-6 h-6" />
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 font-serif">No products found</h3>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        We couldn't find any products matching your specific filter criteria. Try clearing search keywords or widening price constraints.
                      </p>
                      <button
                        onClick={handleResetFilters}
                        className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-md transition-colors focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:outline-none"
                      >
                        Reset All Filters
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 sm:gap-6">
                      {products.map((product) => (
                        <ProductCard
                          key={product.id}
                          product={product}
                          onSelect={(p) => setSelectedProduct(p)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </section>
          </>
        )}
      </main>

      {/* Mobile Filters Slide-over Sheet */}
      {isMobileFiltersOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="mobile-filters-title"
          className="fixed inset-0 z-50 overflow-hidden lg:hidden"
        >
          <div
            onClick={() => setIsMobileFiltersOpen(false)}
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
            aria-hidden="true"
          />
          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-xs bg-white shadow-2xl p-5 overflow-y-auto flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h3 id="mobile-filters-title" className="font-bold text-slate-900 text-sm">
                    Filters & Sorting
                  </h3>
                  <button
                    onClick={() => setIsMobileFiltersOpen(false)}
                    aria-label="Close filters sheet"
                    className="p-1 rounded-md text-slate-500 hover:text-slate-800 focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:outline-none"
                  >
                    <X className="w-5 h-5" aria-hidden="true" />
                  </button>
                </div>
                <ProductFilters
                  filters={filters}
                  onFilterChange={handleFilterChange}
                  onResetFilters={handleResetFilters}
                  categories={categories}
                  totalResults={totalProducts}
                />
              </div>
              <button
                onClick={() => setIsMobileFiltersOpen(false)}
                className="w-full py-3 rounded-xl bg-slate-900 text-white font-bold text-xs shadow-md mt-6 focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:outline-none"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modals & Slide-overs */}
      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onInstantCheckout={() => {
          setSelectedProduct(null);
          setIsCheckoutOpen(true);
        }}
      />

      <CartDrawer onCheckout={() => setIsCheckoutOpen(true)} />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        onViewOrderHistory={() => {
          setIsCheckoutOpen(false);
          setCurrentView('orders');
        }}
      />

      <AiFinancialAdvisorModal
        isOpen={isAiAdvisorOpen}
        onClose={() => setIsAiAdvisorOpen(false)}
        onNavigateToView={(view) => {
          setIsAiAdvisorOpen(false);
          setCurrentView(view);
        }}
      />

      <AuthModal />
      <NotificationToast />

      {/* Global Footer */}
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <MainContent />
      </CartProvider>
    </AuthProvider>
  );
}

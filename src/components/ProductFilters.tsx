import React from 'react';
import { SlidersHorizontal, RotateCcw } from 'lucide-react';
import { FilterState, Category } from '../types/index.js';

interface ProductFiltersProps {
  filters: FilterState;
  onFilterChange: (newFilters: Partial<FilterState>) => void;
  onResetFilters: () => void;
  categories: Category[];
  totalResults: number;
}

export const ProductFilters: React.FC<ProductFiltersProps> = ({
  filters,
  onFilterChange,
  onResetFilters,
  categories,
  totalResults,
}) => {
  const hasActiveFilters =
    filters.q !== '' ||
    filters.category !== 'all' ||
    filters.minPrice !== null ||
    filters.maxPrice !== null ||
    filters.rating !== null ||
    filters.inStock ||
    filters.sort !== 'featured';

  return (
    <nav aria-label="Product catalog filters" className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-sm space-y-5">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center space-x-2">
          <SlidersHorizontal className="w-4 h-4 text-indigo-600" aria-hidden="true" />
          <h2 className="font-bold text-slate-900 text-sm">Filters & Sorting</h2>
        </div>
        {hasActiveFilters && (
          <button
            onClick={onResetFilters}
            aria-label="Reset all applied filters"
            className="text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center space-x-1 focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:outline-none rounded-md px-1.5 py-0.5"
          >
            <RotateCcw className="w-3 h-3" aria-hidden="true" />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* Sorting */}
      <div className="space-y-1.5">
        <label htmlFor="filter-sort-select" className="block text-xs font-bold text-slate-800">
          Sort Products By
        </label>
        <select
          id="filter-sort-select"
          value={filters.sort}
          onChange={(e) => onFilterChange({ sort: e.target.value })}
          className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:bg-white focus:outline-none"
        >
          <option value="featured">Featured & Recommended</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
          <option value="rating_desc">Highest Rated</option>
          <option value="reviews_desc">Most Reviewed</option>
          <option value="newest">Newest Arrivals</option>
        </select>
      </div>

      {/* Categories Fieldset */}
      <fieldset className="space-y-2">
        <legend className="text-xs font-bold text-slate-800 mb-1">Product Category</legend>
        <div className="flex flex-col space-y-1 text-xs">
          <button
            type="button"
            onClick={() => onFilterChange({ category: 'all' })}
            aria-pressed={filters.category === 'all'}
            className={`text-left px-2.5 py-1.5 rounded-lg font-medium transition-colors flex items-center justify-between focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:outline-none ${
              filters.category === 'all'
                ? 'bg-indigo-50 text-indigo-800 font-bold border border-indigo-200'
                : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            <span>All Categories</span>
          </button>
          {categories.map((cat) => (
            <button
              type="button"
              key={cat.id}
              onClick={() => onFilterChange({ category: cat.name })}
              aria-pressed={filters.category.toLowerCase() === cat.name.toLowerCase()}
              className={`text-left px-2.5 py-1.5 rounded-lg font-medium transition-colors flex items-center justify-between focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:outline-none ${
                filters.category.toLowerCase() === cat.name.toLowerCase()
                  ? 'bg-indigo-50 text-indigo-800 font-bold border border-indigo-200'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <span>{cat.name}</span>
              {typeof cat.productCount === 'number' && (
                <span className="text-[10px] text-slate-500 font-mono">({cat.productCount})</span>
              )}
            </button>
          ))}
        </div>
      </fieldset>

      {/* Price Range Fieldset */}
      <fieldset className="space-y-2 pt-2 border-t border-slate-100">
        <legend className="text-xs font-bold text-slate-800 mb-1">Price Range ($)</legend>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label htmlFor="filter-min-price" className="text-[11px] text-slate-600 block mb-0.5">Min Price</label>
            <input
              type="number"
              id="filter-min-price"
              placeholder="0"
              min="0"
              value={filters.minPrice ?? ''}
              onChange={(e) =>
                onFilterChange({
                  minPrice: e.target.value ? parseFloat(e.target.value) : null,
                })
              }
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-900 focus-visible:ring-2 focus-visible:ring-indigo-600 focus:outline-none"
            />
          </div>
          <div>
            <label htmlFor="filter-max-price" className="text-[11px] text-slate-600 block mb-0.5">Max Price</label>
            <input
              type="number"
              id="filter-max-price"
              placeholder="1000"
              min="0"
              value={filters.maxPrice ?? ''}
              onChange={(e) =>
                onFilterChange({
                  maxPrice: e.target.value ? parseFloat(e.target.value) : null,
                })
              }
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-900 focus-visible:ring-2 focus-visible:ring-indigo-600 focus:outline-none"
            />
          </div>
        </div>
      </fieldset>

      {/* Minimum Rating Fieldset */}
      <fieldset className="space-y-2 pt-2 border-t border-slate-100">
        <legend className="text-xs font-bold text-slate-800 mb-1">Customer Rating</legend>
        <div className="flex space-x-1.5">
          {[4.5, 4.0, 3.5].map((r) => (
            <button
              type="button"
              key={r}
              onClick={() => onFilterChange({ rating: filters.rating === r ? null : r })}
              aria-pressed={filters.rating === r}
              aria-label={`${r} stars and above`}
              className={`flex-1 py-1 rounded-md text-xs font-semibold border transition-all focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:outline-none ${
                filters.rating === r
                  ? 'bg-amber-50 border-amber-400 text-amber-900'
                  : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
              }`}
            >
              ★ {r}+
            </button>
          ))}
        </div>
      </fieldset>

      {/* In-Stock Toggle */}
      <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
        <label htmlFor="filter-in-stock-checkbox" className="text-xs font-bold text-slate-800 cursor-pointer">
          In-Stock Only
        </label>
        <input
          type="checkbox"
          id="filter-in-stock-checkbox"
          checked={filters.inStock}
          onChange={(e) => onFilterChange({ inStock: e.target.checked })}
          className="w-4 h-4 rounded text-indigo-600 focus-visible:ring-2 focus-visible:ring-indigo-600 border-slate-300 cursor-pointer"
        />
      </div>

      <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-600 text-center font-medium" aria-live="polite">
        Showing {totalResults} items matching criteria
      </div>
    </nav>
  );
};

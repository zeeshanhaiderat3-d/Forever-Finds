import React from 'react';
import { Search, X } from 'lucide-react';
import { CATEGORIES } from '../data/products';
import { CategorySlug, SortOption } from '../types';

interface CatalogControlsProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedCategory: CategorySlug | 'all';
  onCategoryChange?: (category: CategorySlug | 'all') => void;
  showCategoryFilter?: boolean;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  resultCount: number;
}

export const CatalogControls: React.FC<CatalogControlsProps> = ({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  showCategoryFilter = false,
  sortBy,
  onSortChange,
  resultCount,
}) => {
  return (
    <div className="space-y-5 border-y border-beige py-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        {/* Search Input */}
        <div className="relative w-full lg:max-w-md">
          <label htmlFor="catalog-search" className="sr-only">
            Search curated finds
          </label>
          <Search
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-taupe"
            aria-hidden="true"
          />
          <input
            id="catalog-search"
            type="search"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search finds by title or keyword..."
            className="w-full border border-beige bg-cream-dark/50 py-2.5 pl-10 pr-10 text-sm text-charcoal placeholder:text-taupe focus:border-charcoal focus:bg-cream focus:outline-none"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              aria-label="Clear search query"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-taupe hover:text-charcoal cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Count & Sort */}
        <div className="flex flex-wrap items-center justify-between gap-4 sm:justify-end">
          <span className="text-xs tracking-wide text-taupe tabular-nums">
            Showing {resultCount} {resultCount === 1 ? 'find' : 'finds'}
          </span>

          <div className="flex items-center gap-2.5">
            <label htmlFor="catalog-sort" className="text-xs uppercase tracking-wider text-taupe">
              Sort
            </label>
            <select
              id="catalog-sort"
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value as SortOption)}
              className="border border-beige bg-cream px-3 py-2 text-xs font-medium text-charcoal focus:border-charcoal focus:outline-none cursor-pointer"
            >
              <option value="featured">Curated Featured</option>
              <option value="editors-pick">Editor&apos;s Picks First</option>
              <option value="name-asc">Alphabetical: A–Z</option>
              <option value="name-desc">Alphabetical: Z–A</option>
            </select>
          </div>
        </div>
      </div>

      {/* Category Filter Buttons */}
      {showCategoryFilter && onCategoryChange && (
        <div
          role="group"
          aria-label="Filter by category"
          className="flex flex-wrap items-center gap-2"
        >
          <button
            type="button"
            onClick={() => onCategoryChange('all')}
            className={`px-3.5 py-2 text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-charcoal text-cream'
                : 'border border-beige bg-cream text-charcoal-soft hover:border-taupe hover:text-charcoal'
            }`}
          >
            All Categories
          </button>
          {CATEGORIES.map((category) => (
            <button
              key={category.slug}
              type="button"
              onClick={() => onCategoryChange(category.slug)}
              className={`px-3.5 py-2 text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                selectedCategory === category.slug
                  ? 'bg-charcoal text-cream'
                  : 'border border-beige bg-cream text-charcoal-soft hover:border-taupe hover:text-charcoal'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

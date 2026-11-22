import React, { useEffect, useMemo, useState } from 'react';
import { CatalogControls } from '../components/CatalogControls';
import { NewsletterSection } from '../components/NewsletterSection';
import { ProductCard } from '../components/ProductCard';
import { useCatalog } from '../context/CatalogContext';
import { CATEGORIES } from '../data/products';
import { CategorySlug, PageId, SortOption } from '../types';

interface CatalogPageProps {
  mode: 'catalog' | 'trending' | CategorySlug;
  onNavigate: (page: PageId) => void;
}

export const CatalogPage: React.FC<CatalogPageProps> = ({ mode, onNavigate }) => {
  const { products, isUsingDemoCatalog, catalogLoading, connectionState } = useCatalog();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CategorySlug | 'all'>('all');
  const [sortBy, setSortBy] = useState<SortOption>('featured');

  // Reset local filters when navigating between category views
  useEffect(() => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSortBy('featured');
  }, [mode]);

  const activeCategoryInfo = CATEGORIES.find((c) => c.slug === mode);

  const pageTitle = useMemo(() => {
    if (mode === 'catalog') return 'All Curated Finds';
    if (mode === 'trending') return 'Trending Finds';
    return activeCategoryInfo?.name ?? 'Curated Finds';
  }, [mode, activeCategoryInfo]);

  const pageKicker = useMemo(() => {
    if (mode === 'catalog') return 'Complete Directory · USA · UK · Canada';
    if (mode === 'trending') return 'Current Favorites · Updated Edit';
    return activeCategoryInfo?.kicker ?? 'Category Collection';
  }, [mode, activeCategoryInfo]);

  const pageDescription = useMemo(() => {
    if (mode === 'catalog') {
      return 'Browse every curated find across Beauty, Fashion, Home & Kitchen, Electronics, and Lifestyle & Wellness.';
    }
    if (mode === 'trending') {
      return 'A focused look at the pieces drawing the most editorial attention across everyday home, wardrobe, and wellness routines.';
    }
    return activeCategoryInfo?.description ?? '';
  }, [mode, activeCategoryInfo]);

  const filteredProducts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    const base = products.filter((product) => {
      if (mode === 'trending' && !product.isTrending) return false;
      if (mode !== 'catalog' && mode !== 'trending' && product.category !== mode) return false;

      if ((mode === 'catalog' || mode === 'trending') && selectedCategory !== 'all') {
        if (product.category !== selectedCategory) return false;
      }

      if (query) {
        const haystack =
          `${product.name} ${product.shortDescription} ${product.categoryLabel}`.toLowerCase();
        if (!haystack.includes(query)) return false;
      }

      return true;
    });

    const sorted = [...base];
    sorted.sort((a, b) => {
      if (sortBy === 'name-asc') return a.name.localeCompare(b.name);
      if (sortBy === 'name-desc') return b.name.localeCompare(a.name);
      if (sortBy === 'editors-pick') {
        return Number(Boolean(b.isEditorPick)) - Number(Boolean(a.isEditorPick));
      }
      return Number(Boolean(b.isFeatured)) - Number(Boolean(a.isFeatured));
    });

    return sorted;
  }, [products, mode, searchQuery, selectedCategory, sortBy]);

  const handleReset = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSortBy('featured');
  };

  return (
    <div>
      {/* Editorial Header */}
      <section className="border-b border-beige bg-cream">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <nav aria-label="Breadcrumb" className="text-xs text-taupe">
            <button
              type="button"
              onClick={() => onNavigate('home')}
              className="hover:text-charcoal hover:underline underline-offset-4 cursor-pointer"
            >
              Home
            </button>
            <span className="mx-2" aria-hidden="true">
              /
            </span>
            <span className="text-charcoal">{pageTitle}</span>
          </nav>

          <div className="mt-6 max-w-3xl">
            <p className="text-xs uppercase tracking-[0.18em] text-taupe">{pageKicker}</p>
            <h1 className="mt-3 font-editorial text-4xl font-medium tracking-tight text-charcoal sm:text-5xl text-balance">
              {pageTitle}
            </h1>
            <p className="mt-4 text-base leading-relaxed text-charcoal-soft">
              {pageDescription}
            </p>
          </div>

          {isUsingDemoCatalog && (
            <div className="mt-8 border border-beige bg-cream-dark/60 px-5 py-3.5 text-xs leading-relaxed text-charcoal-soft">
              <strong className="font-medium text-charcoal">
                {connectionState === 'not-configured'
                  ? 'Demo Mode (Firebase Not Configured):'
                  : 'Demo Catalog Notice:'}
              </strong>{' '}
              Products shown below are placeholder demo listings until live products are imported through the Admin Bulk Import console. No fabricated prices, discounts, stock status, or customer reviews are displayed.
            </div>
          )}
        </div>
      </section>

      {/* Filter & Product Grid */}
      <section className="bg-cream">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
          <CatalogControls
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            showCategoryFilter={mode === 'catalog' || mode === 'trending'}
            sortBy={sortBy}
            onSortChange={setSortBy}
            resultCount={filteredProducts.length}
          />

          {catalogLoading ? (
            <div className="mt-10 grid grid-cols-1 gap-7 md:grid-cols-2 lg:grid-cols-3">
              {[0, 1, 2].map((idx) => (
                <div
                  key={idx}
                  className="h-96 animate-pulse border border-beige bg-cream-dark/50"
                />
              ))}
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="mt-10 grid grid-cols-1 gap-7 md:grid-cols-2 lg:grid-cols-3">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="mt-12 border border-beige bg-cream-dark/40 px-6 py-16 text-center">
              <h2 className="font-editorial text-2xl font-medium text-charcoal">
                No matching finds
              </h2>
              <p className="mt-2 text-sm text-charcoal-soft">
                Try adjusting your search keywords or resetting the category filter.
              </p>
              <button
                type="button"
                onClick={handleReset}
                className="mt-6 bg-charcoal px-6 py-2.5 text-xs font-medium uppercase tracking-wider text-cream transition-colors hover:bg-charcoal-soft cursor-pointer"
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>
      </section>

      <NewsletterSection onNavigate={onNavigate} />
    </div>
  );
};

import React, { useState } from 'react';
import { ArrowRight, ArrowUpRight, ImageOff } from 'lucide-react';
import { motion } from 'motion/react';
import { NewsletterSection } from '../components/NewsletterSection';
import { ProductCard } from '../components/ProductCard';
import { useCatalog } from '../context/CatalogContext';
import { CATEGORIES, HERO_IMAGE } from '../data/products';
import { PageId } from '../types';

interface HomePageProps {
  onNavigate: (page: PageId) => void;
}

type ShowcaseTab = 'featured' | 'trending' | 'editors';

export const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  const { products, isUsingDemoCatalog, catalogLoading } = useCatalog();
  const [activeTab, setActiveTab] = useState<ShowcaseTab>('featured');
  const [heroImgError, setHeroImgError] = useState(false);

  const displayedProducts = products
    .filter((product) => {
      if (activeTab === 'featured') return product.isFeatured;
      if (activeTab === 'trending') return product.isTrending;
      return product.isEditorPick || (product.isFeatured && product.isTrending);
    })
    .slice(0, 6);

  // If a newly imported live catalog has no products flagged featured/trending yet,
  // gracefully show the newest live products under the active tab instead of an empty grid.
  const fallbackDisplay =
    displayedProducts.length > 0 ? displayedProducts : products.slice(0, 6);

  const scrollToCategories = () => {
    const el = document.getElementById('categories-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="border-b border-beige bg-cream">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
          <div className="grid grid-cols-1 items-stretch gap-10 lg:grid-cols-12 lg:gap-12">
            {/* Editorial Copy Column */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col justify-between lg:col-span-5"
            >
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-taupe">
                  Your Everyday Finds, All in One Place
                </p>
                <h1 className="mt-5 font-editorial text-4xl font-medium leading-[1.08] tracking-tight text-charcoal sm:text-5xl lg:text-[3.5rem] text-balance">
                  Discover Your Next Favorite Find
                </h1>
                <p className="mt-5 max-w-md text-base leading-relaxed text-charcoal-soft sm:text-lg">
                  Thoughtfully curated finds for everyday living.
                </p>

                <div className="mt-8 flex flex-wrap items-center gap-3.5">
                  <button
                    type="button"
                    onClick={() => onNavigate('catalog')}
                    className="inline-flex items-center gap-2 bg-charcoal px-6 py-3.5 text-xs font-medium uppercase tracking-wider text-cream transition-colors duration-150 hover:bg-charcoal-soft whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <span>Explore Finds</span>
                    <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={scrollToCategories}
                    className="inline-flex items-center gap-2 border border-taupe-light bg-cream px-6 py-3.5 text-xs font-medium uppercase tracking-wider text-charcoal transition-colors duration-150 hover:border-charcoal hover:bg-cream-dark whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <span>Shop Categories</span>
                  </button>
                </div>
              </div>

              <div className="mt-10 border-t border-beige pt-5">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-taupe">
                  <span>Curated for USA · UK · Canada</span>
                  <span aria-hidden="true">/</span>
                  <button
                    type="button"
                    onClick={() => onNavigate('affiliate-disclosure')}
                    className="underline underline-offset-4 hover:text-charcoal cursor-pointer"
                  >
                    Affiliate Disclosure
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Hero Editorial Photograph Column */}
            <motion.div
              initial={{ opacity: 0, scale: 0.99 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-7"
            >
              <div className="relative aspect-[16/10] w-full overflow-hidden border border-beige bg-cream-dark lg:aspect-auto lg:h-full lg:min-h-[460px]">
                {!heroImgError ? (
                  <img
                    src={HERO_IMAGE}
                    alt="Minimalist travertine stone console with sculptural ceramic vessel and folded cream cashmere throw in sunlit room"
                    referrerPolicy="no-referrer"
                    onError={() => setHeroImgError(true)}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full min-h-[360px] w-full flex-col items-center justify-center bg-beige/70 p-8 text-center">
                    <ImageOff className="mb-3 h-8 w-8 text-taupe" aria-hidden="true" />
                    <p className="font-editorial text-2xl text-charcoal">Forever Finds Editorial</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Featured Categories Section */}
      <section
        id="categories-section"
        aria-labelledby="categories-heading"
        className="border-b border-beige bg-cream-dark/45"
      >
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-taupe">Curated Departments</p>
              <h2
                id="categories-heading"
                className="mt-2 font-editorial text-3xl font-medium text-charcoal sm:text-4xl"
              >
                Shop by Category
              </h2>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('catalog')}
              className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-charcoal underline underline-offset-4 hover:text-taupe whitespace-nowrap shrink-0 cursor-pointer"
            >
              <span>Browse All Finds</span>
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">
            {CATEGORIES.map((category) => (
              <button
                key={category.slug}
                type="button"
                onClick={() => onNavigate(category.slug)}
                className="group flex flex-col border border-beige bg-cream text-left transition-transform duration-200 hover:-translate-y-0.5 cursor-pointer"
              >
                <div className="aspect-[4/3] w-full overflow-hidden bg-cream-dark">
                  <img
                    src={category.image}
                    alt={category.imageAlt}
                    loading="lazy"
                    referrerPolicy="no-referrer"
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                  />
                </div>
                <div className="flex flex-1 flex-col justify-between p-5">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.14em] text-taupe">
                      {category.kicker}
                    </p>
                    <h3 className="mt-1.5 font-editorial text-xl font-medium text-charcoal">
                      {category.name}
                    </h3>
                  </div>
                  <span className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-charcoal-soft group-hover:text-charcoal">
                    <span>Explore</span>
                    <ArrowRight
                      className="h-3.5 w-3.5 transition-transform duration-150 group-hover:translate-x-0.5"
                      aria-hidden="true"
                    />
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured, Trending & Editor's Picks Product Grid */}
      <section aria-labelledby="curated-finds-heading" className="bg-cream">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="flex flex-col justify-between gap-6 border-b border-beige pb-6 md:flex-row md:items-end">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-taupe">
                {isUsingDemoCatalog ? 'Editorial Selections · Demo Showcase' : 'Editorial Selections'}
              </p>
              <h2
                id="curated-finds-heading"
                className="mt-2 font-editorial text-3xl font-medium text-charcoal sm:text-4xl"
              >
                Featured, Trending &amp; Editor&apos;s Picks
              </h2>
            </div>

            {/* Segmented Tab Switcher */}
            <div
              role="tablist"
              aria-label="Curated showcase views"
              className="inline-flex border border-beige bg-cream-dark/60 p-1"
            >
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'featured'}
                onClick={() => setActiveTab('featured')}
                className={`px-4 py-2 text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  activeTab === 'featured'
                    ? 'bg-cream text-charcoal shadow-xs'
                    : 'text-taupe hover:text-charcoal'
                }`}
              >
                Featured Finds
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'trending'}
                onClick={() => setActiveTab('trending')}
                className={`px-4 py-2 text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  activeTab === 'trending'
                    ? 'bg-cream text-charcoal shadow-xs'
                    : 'text-taupe hover:text-charcoal'
                }`}
              >
                Trending Finds
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'editors'}
                onClick={() => setActiveTab('editors')}
                className={`px-4 py-2 text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  activeTab === 'editors'
                    ? 'bg-cream text-charcoal shadow-xs'
                    : 'text-taupe hover:text-charcoal'
                }`}
              >
                Editor&apos;s Picks
              </button>
            </div>
          </div>

          {isUsingDemoCatalog && (
            <p className="mt-5 text-xs text-taupe">
              Demo Mode: Listings below are clearly marked placeholder demo products until live products are imported via the Admin Bulk Import console.
            </p>
          )}

          {catalogLoading ? (
            <div className="mt-8 grid grid-cols-1 gap-7 md:grid-cols-2 lg:grid-cols-3">
              {[0, 1, 2].map((idx) => (
                <div
                  key={idx}
                  className="h-96 animate-pulse border border-beige bg-cream-dark/50"
                />
              ))}
            </div>
          ) : (
            <div className="mt-8 grid grid-cols-1 gap-7 md:grid-cols-2 lg:grid-cols-3">
              {fallbackDisplay.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          <div className="mt-12 flex flex-wrap items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => onNavigate('catalog')}
              className="inline-flex items-center gap-2 bg-charcoal px-7 py-3.5 text-xs font-medium uppercase tracking-wider text-cream transition-colors hover:bg-charcoal-soft cursor-pointer"
            >
              <span>Search &amp; Filter All Finds</span>
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => onNavigate('trending')}
              className="inline-flex items-center gap-2 border border-taupe-light px-7 py-3.5 text-xs font-medium uppercase tracking-wider text-charcoal transition-colors hover:border-charcoal hover:bg-cream-dark cursor-pointer"
            >
              <span>View Trending Finds</span>
            </button>
          </div>
        </div>
      </section>

      {/* Editorial Story & Transparency Strip */}
      <section className="border-t border-beige bg-cream">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="grid grid-cols-1 gap-10 border border-beige bg-cream-dark/40 p-8 sm:p-12 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-7">
              <p className="text-xs uppercase tracking-[0.18em] text-taupe">
                Editorial Philosophy
              </p>
              <h2 className="mt-3 font-editorial text-3xl font-medium leading-snug text-charcoal sm:text-4xl text-balance">
                Fewer, Better Things Chosen with Quiet Discernment
              </h2>
              <p className="mt-4 max-w-2xl text-sm leading-relaxed text-charcoal-soft sm:text-base">
                Forever Finds exists to remove the noise from online discovery. Instead of endless discount banners or fleeting impulse lists, our editors organize thoughtful everyday essentials across beauty, wardrobe, home, technology, and wellness for shoppers in the USA, UK, and Canada.
              </p>
            </div>
            <div className="flex flex-col gap-3 lg:col-span-5 lg:items-end">
              <button
                type="button"
                onClick={() => onNavigate('about')}
                className="inline-flex items-center justify-center gap-2 border border-charcoal bg-transparent px-6 py-3 text-xs font-medium uppercase tracking-wider text-charcoal transition-colors hover:bg-charcoal hover:text-cream whitespace-nowrap cursor-pointer"
              >
                <span>Read Our Story</span>
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => onNavigate('affiliate-disclosure')}
                className="inline-flex items-center gap-1.5 text-xs text-taupe underline underline-offset-4 hover:text-charcoal cursor-pointer"
              >
                <span>How Our Affiliate Links Work</span>
                <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <NewsletterSection onNavigate={onNavigate} />
    </div>
  );
};

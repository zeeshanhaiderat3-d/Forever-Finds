import React, { useEffect, useRef, useState } from 'react';
import { ChevronDown, Menu, X } from 'lucide-react';
import { CATEGORIES } from '../data/products';
import { PageId } from '../types';

interface NavbarProps {
  currentPage: PageId;
  onNavigate: (page: PageId) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentPage, onNavigate }) => {
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isCategoryActive = CATEGORIES.some((cat) => cat.slug === currentPage);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setCategoriesOpen(false);
      }
    };
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setCategoriesOpen(false);
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  const handleLinkClick = (page: PageId) => {
    setCategoriesOpen(false);
    setMobileMenuOpen(false);
    onNavigate(page);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-beige bg-cream/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-8 px-4 sm:px-6 lg:px-8">
        {/* Zone 1: Single-element Brand Wordmark */}
        <a
          href="/"
          onClick={(e) => {
            e.preventDefault();
            handleLinkClick('home');
          }}
          className="font-editorial text-2xl font-semibold tracking-tight text-charcoal whitespace-nowrap shrink-0"
        >
          Forever Finds
        </a>

        {/* Zone 2: 5 concise single-line text navigation links */}
        <nav
          aria-label="Primary Navigation"
          className="hidden md:flex items-center gap-7 text-sm font-medium text-charcoal-soft"
        >
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              handleLinkClick('home');
            }}
            className={`whitespace-nowrap shrink-0 py-1 border-b transition-colors duration-150 ${
              currentPage === 'home'
                ? 'border-charcoal text-charcoal'
                : 'border-transparent hover:border-taupe-light hover:text-charcoal'
            }`}
          >
            Home
          </a>

          <div ref={dropdownRef} className="relative">
            <button
              type="button"
              aria-expanded={categoriesOpen}
              aria-haspopup="true"
              onClick={() => setCategoriesOpen((prev) => !prev)}
              className={`inline-flex items-center gap-1 whitespace-nowrap shrink-0 py-1 border-b transition-colors duration-150 cursor-pointer ${
                isCategoryActive
                  ? 'border-charcoal text-charcoal'
                  : 'border-transparent hover:border-taupe-light hover:text-charcoal'
              }`}
            >
              <span>Categories</span>
              <ChevronDown
                className={`h-3.5 w-3.5 transition-transform duration-150 ${
                  categoriesOpen ? 'rotate-180' : ''
                }`}
                aria-hidden="true"
              />
            </button>

            {categoriesOpen && (
              <div
                role="menu"
                aria-label="Product Categories"
                className="absolute left-0 top-full mt-3 w-64 border border-beige bg-cream p-2 shadow-sm"
              >
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => handleLinkClick('catalog')}
                  className={`flex w-full items-center justify-between px-3 py-2.5 text-left text-xs uppercase tracking-wider transition-colors cursor-pointer ${
                    currentPage === 'catalog'
                      ? 'bg-cream-dark font-semibold text-charcoal'
                      : 'text-taupe hover:bg-cream-dark hover:text-charcoal'
                  }`}
                >
                  <span>All Curated Finds</span>
                </button>
                <div className="my-1 border-t border-beige" />
                {CATEGORIES.map((category) => (
                  <button
                    key={category.slug}
                    type="button"
                    role="menuitem"
                    onClick={() => handleLinkClick(category.slug)}
                    className={`flex w-full items-center justify-between px-3 py-2.5 text-left text-sm transition-colors cursor-pointer ${
                      currentPage === category.slug
                        ? 'bg-cream-dark font-semibold text-charcoal'
                        : 'text-charcoal-soft hover:bg-cream-dark hover:text-charcoal'
                    }`}
                  >
                    <span>{category.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <a
            href="/trending-finds"
            onClick={(e) => {
              e.preventDefault();
              handleLinkClick('trending');
            }}
            className={`whitespace-nowrap shrink-0 py-1 border-b transition-colors duration-150 ${
              currentPage === 'trending'
                ? 'border-charcoal text-charcoal'
                : 'border-transparent hover:border-taupe-light hover:text-charcoal'
            }`}
          >
            Trending
          </a>

          <a
            href="/about-us"
            onClick={(e) => {
              e.preventDefault();
              handleLinkClick('about');
            }}
            className={`whitespace-nowrap shrink-0 py-1 border-b transition-colors duration-150 ${
              currentPage === 'about'
                ? 'border-charcoal text-charcoal'
                : 'border-transparent hover:border-taupe-light hover:text-charcoal'
            }`}
          >
            About
          </a>

          <a
            href="/contact-us"
            onClick={(e) => {
              e.preventDefault();
              handleLinkClick('contact');
            }}
            className={`whitespace-nowrap shrink-0 py-1 border-b transition-colors duration-150 ${
              currentPage === 'contact'
                ? 'border-charcoal text-charcoal'
                : 'border-transparent hover:border-taupe-light hover:text-charcoal'
            }`}
          >
            Contact
          </a>
        </nav>

        {/* Zone 3: 1 Primary Action + Mobile Drawer Toggle */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => handleLinkClick('catalog')}
            className="hidden sm:inline-flex items-center justify-center bg-charcoal px-4 py-2 text-xs font-medium tracking-wide text-cream transition-colors duration-150 hover:bg-charcoal-soft whitespace-nowrap shrink-0 cursor-pointer"
          >
            Explore Finds
          </button>

          <button
            type="button"
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileMenuOpen}
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="inline-flex h-11 w-11 items-center justify-center text-charcoal md:hidden cursor-pointer"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <nav
          aria-label="Mobile Navigation"
          className="border-t border-beige bg-cream px-4 py-5 md:hidden"
        >
          <div className="flex flex-col space-y-1">
            <button
              type="button"
              onClick={() => handleLinkClick('home')}
              className={`px-3 py-3 text-left text-sm font-medium cursor-pointer ${
                currentPage === 'home' ? 'bg-cream-dark text-charcoal' : 'text-charcoal-soft'
              }`}
            >
              Home
            </button>
            <button
              type="button"
              onClick={() => handleLinkClick('catalog')}
              className={`px-3 py-3 text-left text-sm font-medium cursor-pointer ${
                currentPage === 'catalog' ? 'bg-cream-dark text-charcoal' : 'text-charcoal-soft'
              }`}
            >
              Explore All Finds
            </button>
            <button
              type="button"
              onClick={() => handleLinkClick('trending')}
              className={`px-3 py-3 text-left text-sm font-medium cursor-pointer ${
                currentPage === 'trending' ? 'bg-cream-dark text-charcoal' : 'text-charcoal-soft'
              }`}
            >
              Trending Finds
            </button>

            <div className="pt-3 pb-1 px-3 text-xs uppercase tracking-wider text-taupe">
              Categories
            </div>
            {CATEGORIES.map((category) => (
              <button
                key={category.slug}
                type="button"
                onClick={() => handleLinkClick(category.slug)}
                className={`px-3 py-2.5 text-left text-sm cursor-pointer ${
                  currentPage === category.slug
                    ? 'bg-cream-dark font-medium text-charcoal'
                    : 'text-charcoal-soft'
                }`}
              >
                {category.name}
              </button>
            ))}

            <div className="my-2 border-t border-beige" />
            <button
              type="button"
              onClick={() => handleLinkClick('about')}
              className={`px-3 py-2.5 text-left text-sm cursor-pointer ${
                currentPage === 'about' ? 'bg-cream-dark font-medium text-charcoal' : 'text-charcoal-soft'
              }`}
            >
              About Us
            </button>
            <button
              type="button"
              onClick={() => handleLinkClick('contact')}
              className={`px-3 py-2.5 text-left text-sm cursor-pointer ${
                currentPage === 'contact' ? 'bg-cream-dark font-medium text-charcoal' : 'text-charcoal-soft'
              }`}
            >
              Contact Us
            </button>
            <button
              type="button"
              onClick={() => handleLinkClick('affiliate-disclosure')}
              className={`px-3 py-2.5 text-left text-sm cursor-pointer ${
                currentPage === 'affiliate-disclosure'
                  ? 'bg-cream-dark font-medium text-charcoal'
                  : 'text-charcoal-soft'
              }`}
            >
              Affiliate Disclosure
            </button>
          </div>
        </nav>
      )}
    </header>
  );
};

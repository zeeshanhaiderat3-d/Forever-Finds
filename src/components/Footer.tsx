import React from 'react';
import { CATEGORIES } from '../data/products';
import { PageId } from '../types';

interface FooterProps {
  onNavigate: (page: PageId) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const handleNav = (e: React.MouseEvent, page: PageId) => {
    e.preventDefault();
    onNavigate(page);
  };

  return (
    <footer className="border-t border-beige bg-cream text-charcoal">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand Column */}
          <div>
            <a
              href="/"
              onClick={(e) => handleNav(e, 'home')}
              className="font-editorial text-2xl font-semibold tracking-tight text-charcoal"
            >
              Forever Finds
            </a>
            <p className="mt-3 text-sm leading-relaxed text-charcoal-soft">
              Your Everyday Finds, All in One Place. Curated editorial shopping for readers in the USA, UK, and Canada.
            </p>
            <p className="mt-4 text-xs leading-relaxed text-taupe">
              Affiliate Notice: Forever Finds may earn commissions from qualifying purchases made through links on this site, at no extra cost to you.
            </p>
          </div>

          {/* Categories Column */}
          <div>
            <h3 className="font-sans text-xs font-semibold uppercase tracking-[0.14em] text-taupe">
              Categories
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm text-charcoal-soft">
              {CATEGORIES.map((category) => (
                <li key={category.slug}>
                  <a
                    href={`/${category.slug}`}
                    onClick={(e) => handleNav(e, category.slug)}
                    className="hover:text-charcoal hover:underline underline-offset-4"
                  >
                    {category.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Editorial & Company Column */}
          <div>
            <h3 className="font-sans text-xs font-semibold uppercase tracking-[0.14em] text-taupe">
              Editorial
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm text-charcoal-soft">
              <li>
                <a
                  href="/"
                  onClick={(e) => handleNav(e, 'home')}
                  className="hover:text-charcoal hover:underline underline-offset-4"
                >
                  Home
                </a>
              </li>
              <li>
                <a
                  href="/finds"
                  onClick={(e) => handleNav(e, 'catalog')}
                  className="hover:text-charcoal hover:underline underline-offset-4"
                >
                  Explore All Finds
                </a>
              </li>
              <li>
                <a
                  href="/trending-finds"
                  onClick={(e) => handleNav(e, 'trending')}
                  className="hover:text-charcoal hover:underline underline-offset-4"
                >
                  Trending Finds
                </a>
              </li>
              <li>
                <a
                  href="/about-us"
                  onClick={(e) => handleNav(e, 'about')}
                  className="hover:text-charcoal hover:underline underline-offset-4"
                >
                  About Us
                </a>
              </li>
              <li>
                <a
                  href="/contact-us"
                  onClick={(e) => handleNav(e, 'contact')}
                  className="hover:text-charcoal hover:underline underline-offset-4"
                >
                  Contact Us
                </a>
              </li>
            </ul>
          </div>

          {/* Legal & Transparency Column */}
          <div>
            <h3 className="font-sans text-xs font-semibold uppercase tracking-[0.14em] text-taupe">
              Transparency &amp; Legal
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm text-charcoal-soft">
              <li>
                <a
                  href="/affiliate-disclosure"
                  onClick={(e) => handleNav(e, 'affiliate-disclosure')}
                  className="hover:text-charcoal hover:underline underline-offset-4"
                >
                  Affiliate Disclosure
                </a>
              </li>
              <li>
                <a
                  href="/privacy-policy"
                  onClick={(e) => handleNav(e, 'privacy-policy')}
                  className="hover:text-charcoal hover:underline underline-offset-4"
                >
                  Privacy Policy
                </a>
              </li>
              <li>
                <a
                  href="/terms-conditions"
                  onClick={(e) => handleNav(e, 'terms-conditions')}
                  className="hover:text-charcoal hover:underline underline-offset-4"
                >
                  Terms &amp; Conditions
                </a>
              </li>
              <li className="pt-2 border-t border-beige">
                <a
                  href="/admin/import"
                  onClick={(e) => handleNav(e, 'admin-import')}
                  className="text-xs uppercase tracking-wider text-taupe hover:text-charcoal hover:underline underline-offset-4"
                >
                  Admin Product Import
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-4 border-t border-beige pt-8 text-xs text-taupe sm:flex-row sm:items-center">
          <p>&copy; {new Date().getFullYear()} Forever Finds. All rights reserved.</p>
          <p>Curated Finds · USA · UK · Canada</p>
        </div>
      </div>
    </footer>
  );
};

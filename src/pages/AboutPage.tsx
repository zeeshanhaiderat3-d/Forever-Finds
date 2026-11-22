import React from 'react';
import { ArrowRight } from 'lucide-react';
import { NewsletterSection } from '../components/NewsletterSection';
import { HERO_IMAGE } from '../data/products';
import { PageId } from '../types';

interface AboutPageProps {
  onNavigate: (page: PageId) => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onNavigate }) => {
  return (
    <div>
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
            <span className="text-charcoal">About Us</span>
          </nav>

          <div className="mt-8 grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-14">
            <div className="lg:col-span-6">
              <p className="text-xs uppercase tracking-[0.18em] text-taupe">
                Our Story · Forever Finds
              </p>
              <h1 className="mt-3 font-editorial text-4xl font-medium leading-tight text-charcoal sm:text-5xl text-balance">
                Your Everyday Finds, All in One Place.
              </h1>
              <p className="mt-5 text-base leading-relaxed text-charcoal-soft">
                Forever Finds was created as a calm editorial alternative to overwhelming online marketplaces. Designed for thoughtful shoppers across the United States, United Kingdom, and Canada, we bring together timeless beauty, fashion, home, technology, and wellness discoveries in one cohesive destination.
              </p>
              <p className="mt-4 text-base leading-relaxed text-charcoal-soft">
                Rather than chasing fleeting flash sales or cluttering pages with pop-ups, our curation highlights enduring utility, warm tactile materials, and understated visual restraint.
              </p>
            </div>

            <div className="lg:col-span-6">
              <div className="aspect-[16/10] overflow-hidden border border-beige bg-cream-dark">
                <img
                  src={HERO_IMAGE}
                  alt="Forever Finds serene minimalist living space"
                  referrerPolicy="no-referrer"
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-cream">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-xs uppercase tracking-[0.18em] text-taupe">How We Curate</p>
            <h2 className="mt-2 font-editorial text-3xl font-medium text-charcoal sm:text-4xl">
              Three Guiding Principles
            </h2>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="border border-beige bg-cream-dark/40 p-7">
              <p className="text-xs uppercase tracking-[0.16em] text-taupe">01. Restraint</p>
              <h3 className="mt-2 font-editorial text-2xl font-medium text-charcoal">
                Intentional Editing
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-charcoal-soft">
                Every category is edited down to cohesive, versatile pieces that integrate naturally into modern living without visual noise.
              </p>
            </div>

            <div className="border border-beige bg-cream-dark/40 p-7">
              <p className="text-xs uppercase tracking-[0.16em] text-taupe">02. Transparency</p>
              <h3 className="mt-2 font-editorial text-2xl font-medium text-charcoal">
                Honest Affiliate Model
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-charcoal-soft">
                We clearly disclose when outbound retailer links are affiliate links and clearly label placeholder demo entries prior to live merchant integration.
              </p>
            </div>

            <div className="border border-beige bg-cream-dark/40 p-7">
              <p className="text-xs uppercase tracking-[0.16em] text-taupe">03. Longevity</p>
              <h3 className="mt-2 font-editorial text-2xl font-medium text-charcoal">
                Cross-Region Relevance
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-charcoal-soft">
                Our edits focus on widely accessible essentials tailored for everyday households and style sensibilities across the USA, UK, and Canada.
              </p>
            </div>
          </div>

          <div className="mt-12 flex flex-wrap gap-4">
            <button
              type="button"
              onClick={() => onNavigate('catalog')}
              className="inline-flex items-center gap-2 bg-charcoal px-6 py-3 text-xs font-medium uppercase tracking-wider text-cream transition-colors hover:bg-charcoal-soft cursor-pointer"
            >
              <span>Explore Curated Finds</span>
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => onNavigate('affiliate-disclosure')}
              className="inline-flex items-center gap-2 border border-taupe-light px-6 py-3 text-xs font-medium uppercase tracking-wider text-charcoal transition-colors hover:border-charcoal cursor-pointer"
            >
              <span>Read Affiliate Disclosure</span>
            </button>
          </div>
        </div>
      </section>

      <NewsletterSection onNavigate={onNavigate} />
    </div>
  );
};

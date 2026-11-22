import React from 'react';
import { PageId } from '../types';

interface LegalPageProps {
  page: 'affiliate-disclosure' | 'privacy-policy' | 'terms-conditions';
  onNavigate: (page: PageId) => void;
}

export const LegalPage: React.FC<LegalPageProps> = ({ page, onNavigate }) => {
  return (
    <section className="bg-cream">
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
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
          <span className="text-charcoal">
            {page === 'affiliate-disclosure'
              ? 'Affiliate Disclosure'
              : page === 'privacy-policy'
              ? 'Privacy Policy'
              : 'Terms & Conditions'}
          </span>
        </nav>

        {page === 'affiliate-disclosure' && (
          <article className="mt-8 space-y-6">
            <header className="border-b border-beige pb-6">
              <p className="text-xs uppercase tracking-[0.18em] text-taupe">Transparency</p>
              <h1 className="mt-3 font-editorial text-4xl font-medium text-charcoal sm:text-5xl">
                Affiliate Disclosure
              </h1>
              <p className="mt-3 text-xs text-taupe">
                Applicable to readers in the United States, United Kingdom, and Canada
              </p>
            </header>

            <div className="space-y-5 text-sm leading-relaxed text-charcoal-soft sm:text-base">
              <p>
                Forever Finds is a curated editorial shopping platform. In the interest of complete transparency, please note that Forever Finds participates in affiliate marketing programs and may earn commissions from qualifying purchases made through links on this website.
              </p>
              <h2 className="pt-2 font-editorial text-2xl font-medium text-charcoal">
                How Affiliate Links Work
              </h2>
              <p>
                When you click a &ldquo;Shop Now&rdquo; button or outbound retailer link on Forever Finds, your browser opens the third-party merchant&apos;s website in a new tab. If you complete a qualifying purchase, the merchant may pay Forever Finds a referral commission at zero additional cost to you.
              </p>
              <h2 className="pt-2 font-editorial text-2xl font-medium text-charcoal">
                Editorial Independence &amp; Demo Listings
              </h2>
              <p>
                Commission relationships never dictate our aesthetic standards or editorial selections. Furthermore, during this initial release, product cards are clearly labeled as placeholder demo listings using editable demo affiliate URLs until verified retailer links, real-time pricing, and availability details are connected.
              </p>
              <h2 className="pt-2 font-editorial text-2xl font-medium text-charcoal">
                Retailer Responsibility
              </h2>
              <p>
                Forever Finds does not process payments, manage inventory, or ship merchandise directly. All orders, customer support, warranties, shipping, and returns are handled solely by the external merchant you purchase from.
              </p>
            </div>
          </article>
        )}

        {page === 'privacy-policy' && (
          <article className="mt-8 space-y-6">
            <header className="border-b border-beige pb-6">
              <p className="text-xs uppercase tracking-[0.18em] text-taupe">Data &amp; Privacy</p>
              <h1 className="mt-3 font-editorial text-4xl font-medium text-charcoal sm:text-5xl">
                Privacy Policy
              </h1>
              <p className="mt-3 text-xs text-taupe">Last updated: November 2026</p>
            </header>

            <div className="space-y-5 text-sm leading-relaxed text-charcoal-soft sm:text-base">
              <p>
                Forever Finds respects your privacy. This policy explains what information may be collected when you browse our website, subscribe to our editorial newsletter, or send an inquiry through our contact page.
              </p>
              <h2 className="pt-2 font-editorial text-2xl font-medium text-charcoal">
                Information You Provide Voluntarily
              </h2>
              <p>
                If you subscribe to The Weekly Edit newsletter or submit a message via the Contact Us page, you voluntarily share details such as your name and email address. In this initial frontend edition, form submissions operate locally in your browser without storing personal data in an external database.
              </p>
              <h2 className="pt-2 font-editorial text-2xl font-medium text-charcoal">
                Outbound Affiliate Links &amp; Cookies
              </h2>
              <p>
                When you follow an external affiliate link to a retail partner in the USA, UK, or Canada, that third-party merchant may use cookies or referral tracking parameters in accordance with their own privacy policy to attribute qualifying purchases.
              </p>
              <h2 className="pt-2 font-editorial text-2xl font-medium text-charcoal">
                Contact Regarding Privacy
              </h2>
              <p>
                If you have questions about how privacy is handled on Forever Finds, please reach out via our{' '}
                <button
                  type="button"
                  onClick={() => onNavigate('contact')}
                  className="text-charcoal underline underline-offset-4 cursor-pointer"
                >
                  Contact Us
                </button>{' '}
                page.
              </p>
            </div>
          </article>
        )}

        {page === 'terms-conditions' && (
          <article className="mt-8 space-y-6">
            <header className="border-b border-beige pb-6">
              <p className="text-xs uppercase tracking-[0.18em] text-taupe">Legal</p>
              <h1 className="mt-3 font-editorial text-4xl font-medium text-charcoal sm:text-5xl">
                Terms &amp; Conditions
              </h1>
              <p className="mt-3 text-xs text-taupe">Last updated: November 2026</p>
            </header>

            <div className="space-y-5 text-sm leading-relaxed text-charcoal-soft sm:text-base">
              <p>
                By accessing and using Forever Finds, you agree to be bound by these Terms &amp; Conditions. Forever Finds operates solely as a curated product discovery and editorial affiliate publication.
              </p>
              <h2 className="pt-2 font-editorial text-2xl font-medium text-charcoal">
                No Direct Sales or Checkout
              </h2>
              <p>
                Forever Finds does not sell products directly, accept payment information, or provide a checkout service. Product buttons redirect you to external third-party merchant websites.
              </p>
              <h2 className="pt-2 font-editorial text-2xl font-medium text-charcoal">
                Accuracy of Placeholder &amp; Retailer Information
              </h2>
              <p>
                Listings currently marked as Demo Listings contain placeholder descriptions, price placeholders, and demo URLs. Even after live affiliate links are enabled, product pricing, promotions, shipping terms, and stock availability are controlled by the respective external merchant and may change without notice.
              </p>
              <h2 className="pt-2 font-editorial text-2xl font-medium text-charcoal">
                Intellectual Property
              </h2>
              <p>
                All editorial copy, site layout, and branding associated with Forever Finds remain the property of Forever Finds and may not be reproduced without permission.
              </p>
            </div>
          </article>
        )}

        <div className="mt-12 flex flex-wrap gap-6 border-t border-beige pt-6 text-xs text-taupe">
          <button
            type="button"
            onClick={() => onNavigate('affiliate-disclosure')}
            className={`hover:text-charcoal cursor-pointer ${
              page === 'affiliate-disclosure' ? 'font-semibold text-charcoal underline underline-offset-4' : ''
            }`}
          >
            Affiliate Disclosure
          </button>
          <button
            type="button"
            onClick={() => onNavigate('privacy-policy')}
            className={`hover:text-charcoal cursor-pointer ${
              page === 'privacy-policy' ? 'font-semibold text-charcoal underline underline-offset-4' : ''
            }`}
          >
            Privacy Policy
          </button>
          <button
            type="button"
            onClick={() => onNavigate('terms-conditions')}
            className={`hover:text-charcoal cursor-pointer ${
              page === 'terms-conditions' ? 'font-semibold text-charcoal underline underline-offset-4' : ''
            }`}
          >
            Terms &amp; Conditions
          </button>
        </div>
      </div>
    </section>
  );
};

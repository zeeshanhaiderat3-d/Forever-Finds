import React, { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { PageId } from '../types';

interface NewsletterSectionProps {
  onNavigate: (page: PageId) => void;
}

export const NewsletterSection: React.FC<NewsletterSectionProps> = ({ onNavigate }) => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError('Please enter a valid email address.');
      return;
    }
    setError('');
    setSubmitted(true);
    setEmail('');
  };

  return (
    <section
      aria-labelledby="newsletter-heading"
      className="border-t border-beige bg-cream-dark/70"
    >
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs uppercase tracking-[0.18em] text-taupe">
            The Weekly Edit · USA · UK · Canada
          </p>
          <h2
            id="newsletter-heading"
            className="mt-3 font-editorial text-3xl font-medium text-charcoal sm:text-4xl text-balance"
          >
            Receive Thoughtfully Curated Finds in Your Inbox
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-charcoal-soft sm:text-base">
            Join readers across North America and the United Kingdom for seasonal edits, timeless home staples, and quiet everyday discoveries.
          </p>

          {submitted ? (
            <div
              role="status"
              className="mt-8 inline-flex items-center gap-2.5 border border-beige bg-cream px-5 py-3.5 text-sm text-charcoal"
            >
              <CheckCircle2 className="h-4 w-4 text-charcoal" aria-hidden="true" />
              <span>Thank you for subscribing to the Forever Finds weekly edit.</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="mt-8">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
                <label htmlFor="newsletter-email" className="sr-only">
                  Email address
                </label>
                <input
                  id="newsletter-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  required
                  className="flex-1 border border-taupe-light bg-cream px-4 py-3 text-sm text-charcoal placeholder:text-taupe focus:border-charcoal focus:outline-none"
                />
                <button
                  type="submit"
                  className="bg-charcoal px-7 py-3 text-xs font-medium uppercase tracking-wider text-cream transition-colors duration-150 hover:bg-charcoal-soft whitespace-nowrap shrink-0 cursor-pointer"
                >
                  Subscribe
                </button>
              </div>
              {error && (
                <p role="alert" className="mt-2.5 text-xs text-charcoal">
                  {error}
                </p>
              )}
              <p className="mt-3 text-xs text-taupe">
                By subscribing, you agree to our{' '}
                <button
                  type="button"
                  onClick={() => onNavigate('privacy-policy')}
                  className="underline underline-offset-4 hover:text-charcoal cursor-pointer"
                >
                  Privacy Policy
                </button>
                . Unsubscribe anytime.
              </p>
            </form>
          )}
        </div>
      </div>
    </section>
  );
};

import React, { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { PageId } from '../types';

interface ContactPageProps {
  onNavigate: (page: PageId) => void;
}

export const ContactPage: React.FC<ContactPageProps> = ({ onNavigate }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [region, setRegion] = useState('USA');
  const [topic, setTopic] = useState('Editorial Inquiry');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      setError('Please complete your name, email address, and message.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }
    setError('');
    setSubmitted(true);
  };

  return (
    <section className="bg-cream">
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
          <span className="text-charcoal">Contact Us</span>
        </nav>

        <div className="mt-8 grid grid-cols-1 gap-12 lg:grid-cols-12">
          {/* Editorial Contact Details */}
          <div className="lg:col-span-5">
            <p className="text-xs uppercase tracking-[0.18em] text-taupe">
              Editorial &amp; Partnerships
            </p>
            <h1 className="mt-3 font-editorial text-4xl font-medium text-charcoal sm:text-5xl">
              Contact Forever Finds
            </h1>
            <p className="mt-4 text-base leading-relaxed text-charcoal-soft">
              Have a question about a curated listing, brand collaboration, or affiliate partnership across the USA, UK, or Canada? Send our editorial desk a note using the form.
            </p>

            <div className="mt-8 space-y-6 border-t border-beige pt-8 text-sm">
              <div>
                <h2 className="font-sans text-xs font-semibold uppercase tracking-[0.14em] text-taupe">
                  Editorial Desk
                </h2>
                <p className="mt-1.5 text-charcoal">editorial@foreverfinds.example</p>
              </div>
              <div>
                <h2 className="font-sans text-xs font-semibold uppercase tracking-[0.14em] text-taupe">
                  Partner &amp; Brand Submissions
                </h2>
                <p className="mt-1.5 text-charcoal">partners@foreverfinds.example</p>
              </div>
              <div>
                <h2 className="font-sans text-xs font-semibold uppercase tracking-[0.14em] text-taupe">
                  Primary Coverage
                </h2>
                <p className="mt-1.5 text-charcoal-soft">United States · United Kingdom · Canada</p>
              </div>
            </div>
          </div>

          {/* Interactive Contact Form */}
          <div className="lg:col-span-7">
            <div className="border border-beige bg-cream-dark/40 p-6 sm:p-10">
              {submitted ? (
                <div role="status" className="py-8 text-center">
                  <CheckCircle2 className="mx-auto h-8 w-8 text-charcoal" aria-hidden="true" />
                  <h2 className="mt-4 font-editorial text-3xl font-medium text-charcoal">
                    Message Received
                  </h2>
                  <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-charcoal-soft">
                    Thank you, {name}. Your {topic.toLowerCase()} note has been recorded in this demo preview.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSubmitted(false);
                      setName('');
                      setEmail('');
                      setMessage('');
                    }}
                    className="mt-6 border border-charcoal px-6 py-2.5 text-xs font-medium uppercase tracking-wider text-charcoal hover:bg-charcoal hover:text-cream transition-colors cursor-pointer"
                  >
                    Send Another Note
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} noValidate className="space-y-5">
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <div>
                      <label htmlFor="contact-name" className="block text-xs font-medium uppercase tracking-wider text-taupe">
                        Full Name
                      </label>
                      <input
                        id="contact-name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Your name"
                        required
                        className="mt-2 w-full border border-beige bg-cream px-4 py-3 text-sm text-charcoal placeholder:text-taupe focus:border-charcoal focus:outline-none"
                      />
                    </div>
                    <div>
                      <label htmlFor="contact-email" className="block text-xs font-medium uppercase tracking-wider text-taupe">
                        Email Address
                      </label>
                      <input
                        id="contact-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        required
                        className="mt-2 w-full border border-beige bg-cream px-4 py-3 text-sm text-charcoal placeholder:text-taupe focus:border-charcoal focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <div>
                      <label htmlFor="contact-region" className="block text-xs font-medium uppercase tracking-wider text-taupe">
                        Region
                      </label>
                      <select
                        id="contact-region"
                        value={region}
                        onChange={(e) => setRegion(e.target.value)}
                        className="mt-2 w-full border border-beige bg-cream px-4 py-3 text-sm text-charcoal focus:border-charcoal focus:outline-none cursor-pointer"
                      >
                        <option value="USA">United States</option>
                        <option value="UK">United Kingdom</option>
                        <option value="Canada">Canada</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="contact-topic" className="block text-xs font-medium uppercase tracking-wider text-taupe">
                        Inquiry Type
                      </label>
                      <select
                        id="contact-topic"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        className="mt-2 w-full border border-beige bg-cream px-4 py-3 text-sm text-charcoal focus:border-charcoal focus:outline-none cursor-pointer"
                      >
                        <option value="Editorial Inquiry">Editorial Inquiry</option>
                        <option value="Affiliate Partnership">Affiliate Partnership</option>
                        <option value="Product Suggestion">Product Suggestion</option>
                        <option value="Press & Media">Press &amp; Media</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="contact-message" className="block text-xs font-medium uppercase tracking-wider text-taupe">
                      Message
                    </label>
                    <textarea
                      id="contact-message"
                      rows={5}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="How can our editorial team assist you?"
                      required
                      className="mt-2 w-full border border-beige bg-cream px-4 py-3 text-sm text-charcoal placeholder:text-taupe focus:border-charcoal focus:outline-none"
                    />
                  </div>

                  {error && (
                    <p role="alert" className="text-xs font-medium text-charcoal">
                      {error}
                    </p>
                  )}

                  <button
                    type="submit"
                    className="w-full bg-charcoal px-6 py-3.5 text-xs font-medium uppercase tracking-wider text-cream transition-colors hover:bg-charcoal-soft sm:w-auto cursor-pointer"
                  >
                    Send Message
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

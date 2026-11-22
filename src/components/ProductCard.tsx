import React, { useState } from 'react';
import { ArrowUpRight, ImageOff } from 'lucide-react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const [imageError, setImageError] = useState(false);

  const displayPrice = product.isDemo
    ? product.pricePlaceholder
    : product.price
      ? `${product.currency ? `${product.currency} ` : ''}${product.price}`
      : 'Check Retailer for Price';

  return (
    <article className="group flex h-full flex-col border border-beige bg-cream transition-transform duration-200 hover:-translate-y-0.5">
      {/* Product Image — 4:3 Editorial Ratio */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-cream-dark">
        {!imageError ? (
          <img
            src={product.image}
            alt={product.imageAlt}
            loading="lazy"
            referrerPolicy="no-referrer"
            onError={() => setImageError(true)}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center bg-beige/60 px-6 text-center">
            <ImageOff className="mb-2 h-6 w-6 text-taupe" aria-hidden="true" />
            <span className="font-editorial text-lg text-charcoal">{product.name}</span>
          </div>
        )}
      </div>

      {/* Card Body */}
      <div className="flex flex-1 flex-col justify-between p-6">
        <div>
          {/* Clean Unboxed Metadata */}
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] uppercase tracking-[0.12em] text-taupe">
            <span>{product.categoryLabel}</span>
            {product.isDemo && (
              <>
                <span aria-hidden="true">·</span>
                <span>Demo Listing</span>
              </>
            )}
            {product.isEditorPick && (
              <>
                <span aria-hidden="true">·</span>
                <span className="text-charcoal-soft">Editor&apos;s Pick</span>
              </>
            )}
            {!product.isEditorPick && product.isTrending && (
              <>
                <span aria-hidden="true">·</span>
                <span className="text-charcoal-soft">Trending</span>
              </>
            )}
          </div>

          {/* Product Name */}
          <h3 className="mt-2.5 font-editorial text-2xl font-medium leading-snug text-charcoal">
            {product.name}
          </h3>

          {/* Short Description (only rendered if non-empty, never fabricated) */}
          {product.shortDescription && (
            <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-charcoal-soft">
              {product.shortDescription}
            </p>
          )}
        </div>

        {/* Price, Optional Rating Field & Shop Now External Affiliate CTA */}
        <div className="mt-6 border-t border-beige pt-4">
          <div className="flex items-baseline justify-between gap-3">
            <span className="text-sm font-medium text-charcoal tabular-nums">
              {displayPrice}
            </span>
          </div>

          {product.ratingPlaceholder && (
            <p className="mt-1 text-xs text-taupe tabular-nums">
              {product.ratingPlaceholder}
            </p>
          )}

          <div className="mt-4">
            <a
              href={product.affiliateUrl}
              target="_blank"
              rel="noopener noreferrer nofollow sponsored"
              aria-label={`Shop Now: ${product.name} (opens external affiliate link in a new tab)`}
              className="inline-flex w-full items-center justify-center gap-2 bg-charcoal px-4 py-2.5 text-xs font-medium tracking-wider uppercase text-cream transition-colors duration-150 hover:bg-charcoal-soft whitespace-nowrap"
            >
              <span>Shop Now</span>
              <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>
    </article>
  );
};

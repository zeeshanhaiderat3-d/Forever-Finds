import { CATEGORIES } from '../data/products';
import {
  CategorySlug,
  ImportSummaryCounts,
  Product,
  RawCsvProductRow,
  ValidatedImportRow,
  ValidationStatus,
} from '../types';

const ID_PATTERN = /^[a-zA-Z0-9_-]+$/;
const CURRENCY_PATTERN = /^[A-Za-z]{3}$/;
const PRICE_PATTERN = /^\d+(\.\d{1,2})?$/;

const CATEGORY_ALIAS_MAP: Record<string, { slug: CategorySlug; label: string }> = {
  'beauty-personal-care': { slug: 'beauty-personal-care', label: 'Beauty & Personal Care' },
  'beauty & personal care': { slug: 'beauty-personal-care', label: 'Beauty & Personal Care' },
  'beauty and personal care': { slug: 'beauty-personal-care', label: 'Beauty & Personal Care' },
  beauty: { slug: 'beauty-personal-care', label: 'Beauty & Personal Care' },
  'fashion-accessories': { slug: 'fashion-accessories', label: 'Fashion & Accessories' },
  'fashion & accessories': { slug: 'fashion-accessories', label: 'Fashion & Accessories' },
  'fashion and accessories': { slug: 'fashion-accessories', label: 'Fashion & Accessories' },
  fashion: { slug: 'fashion-accessories', label: 'Fashion & Accessories' },
  'home-kitchen': { slug: 'home-kitchen', label: 'Home & Kitchen' },
  'home & kitchen': { slug: 'home-kitchen', label: 'Home & Kitchen' },
  'home and kitchen': { slug: 'home-kitchen', label: 'Home & Kitchen' },
  home: { slug: 'home-kitchen', label: 'Home & Kitchen' },
  'electronics-gadgets': { slug: 'electronics-gadgets', label: 'Electronics & Gadgets' },
  'electronics & gadgets': { slug: 'electronics-gadgets', label: 'Electronics & Gadgets' },
  'electronics and gadgets': { slug: 'electronics-gadgets', label: 'Electronics & Gadgets' },
  electronics: { slug: 'electronics-gadgets', label: 'Electronics & Gadgets' },
  'lifestyle-wellness': { slug: 'lifestyle-wellness', label: 'Lifestyle & Wellness' },
  'lifestyle & wellness': { slug: 'lifestyle-wellness', label: 'Lifestyle & Wellness' },
  'lifestyle and wellness': { slug: 'lifestyle-wellness', label: 'Lifestyle & Wellness' },
  wellness: { slug: 'lifestyle-wellness', label: 'Lifestyle & Wellness' },
};

export function normalizeCategory(
  input: string
): { slug: CategorySlug; label: string } | null {
  const key = input.trim().toLowerCase();
  if (!key) return null;
  if (CATEGORY_ALIAS_MAP[key]) return CATEGORY_ALIAS_MAP[key];
  const exact = CATEGORIES.find(
    (c) => c.slug === key || c.name.toLowerCase() === key
  );
  return exact ? { slug: exact.slug, label: exact.name } : null;
}

export function isSafeHttpUrl(rawUrl: string): boolean {
  const trimmed = rawUrl.trim();
  if (!trimmed || trimmed.length > 2048) return false;
  // Block dangerous schemes explicitly
  if (/^(javascript|data|vbscript|file):/i.test(trimmed)) return false;
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
}

export function isSafeImageUrl(rawUrl: string): boolean {
  const trimmed = rawUrl.trim();
  if (!trimmed || trimmed.length > 2048) return false;
  if (trimmed.startsWith('/src/assets/images/')) {
    return !trimmed.includes('..');
  }
  return isSafeHttpUrl(trimmed);
}

export function normalizeUrlForDuplicateCheck(rawUrl: string): string {
  const trimmed = rawUrl.trim();
  if (!trimmed) return '';
  try {
    const parsed = new URL(trimmed);
    const host = parsed.hostname.toLowerCase();
    const path = parsed.pathname.replace(/\/+$/, '') || '';
    return `${parsed.protocol.toLowerCase()}//${host}${path}${parsed.search}`;
  } catch {
    return trimmed.toLowerCase();
  }
}

export function parseCsvBoolean(value: string): { parsed: boolean; valid: boolean } {
  const normalized = value.trim().toLowerCase();
  if (normalized === '' || normalized === 'false' || normalized === '0' || normalized === 'no') {
    return { parsed: false, valid: true };
  }
  if (normalized === 'true' || normalized === '1' || normalized === 'yes') {
    return { parsed: true, valid: true };
  }
  return { parsed: false, valid: false };
}

export function validateSingleRowFields(raw: RawCsvProductRow): {
  errors: string[];
  normalized: ValidatedImportRow['normalized'];
} {
  const errors: string[] = [];

  const id = raw.id.trim();
  if (!id) {
    errors.push('Product ID is required.');
  } else if (id.length > 128) {
    errors.push('Product ID must be 128 characters or fewer.');
  } else if (!ID_PATTERN.test(id)) {
    errors.push('Product ID may only contain letters, numbers, hyphens (-), and underscores (_).');
  }

  const name = raw.name.trim();
  if (!name) {
    errors.push('Product name is required.');
  } else if (name.length > 200) {
    errors.push('Product name must be 200 characters or fewer.');
  }

  const description = raw.description.trim();
  if (description.length > 2000) {
    errors.push('Description must be 2,000 characters or fewer.');
  }

  const categoryMatch = normalizeCategory(raw.category);
  if (!raw.category.trim()) {
    errors.push('Category is required.');
  } else if (!categoryMatch) {
    errors.push(
      `Invalid category "${raw.category.trim()}". Use one of: beauty-personal-care, fashion-accessories, home-kitchen, electronics-gadgets, lifestyle-wellness.`
    );
  }

  const imageUrl = raw.image_url.trim();
  if (!imageUrl) {
    errors.push('Image URL is required.');
  } else if (!isSafeImageUrl(imageUrl)) {
    errors.push('Image URL must be a valid http:// or https:// URL.');
  }

  const affiliateUrl = raw.affiliate_url.trim();
  if (!affiliateUrl) {
    errors.push('Affiliate URL is required.');
  } else if (!isSafeHttpUrl(affiliateUrl)) {
    errors.push('Affiliate URL must be a valid http:// or https:// URL.');
  }

  const originalUrl = raw.original_url.trim();
  if (originalUrl && !isSafeHttpUrl(originalUrl)) {
    errors.push('Original URL must be a valid http:// or https:// URL when provided.');
  }

  const price = raw.price.trim();
  if (price) {
    const cleanPrice = price.replace(/,/g, '');
    if (cleanPrice.length > 40 || !PRICE_PATTERN.test(cleanPrice)) {
      errors.push('Price must be a valid non-negative number (e.g., 48.00) or left empty.');
    }
  }

  const currency = raw.currency.trim().toUpperCase();
  if (currency && (!CURRENCY_PATTERN.test(currency) || currency.length > 12)) {
    errors.push('Currency must be a 3-letter ISO code (e.g., USD, GBP, CAD) or left empty.');
  }

  const featuredRes = parseCsvBoolean(raw.featured);
  if (!featuredRes.valid) {
    errors.push('Featured must be true/false, yes/no, 1/0, or empty.');
  }

  const trendingRes = parseCsvBoolean(raw.trending);
  if (!trendingRes.valid) {
    errors.push('Trending must be true/false, yes/no, 1/0, or empty.');
  }

  return {
    errors,
    normalized: {
      id,
      name,
      description,
      category: categoryMatch?.slug ?? '',
      categoryLabel: categoryMatch?.label ?? '',
      imageUrl,
      price: price ? price.replace(/,/g, '') : '',
      currency,
      affiliateUrl,
      originalUrl,
      featured: featuredRes.parsed,
      trending: trendingRes.parsed,
    },
  };
}

export function validateAndBuildPreview(
  rawRows: RawCsvProductRow[],
  existingProducts: Product[],
  existingSkipMap?: Map<number, boolean>
): ValidatedImportRow[] {
  const existingIds = new Set(existingProducts.map((p) => p.id.trim().toLowerCase()));
  const existingAffiliateUrls = new Set(
    existingProducts.map((p) => normalizeUrlForDuplicateCheck(p.affiliateUrl)).filter(Boolean)
  );

  const seenCsvIds = new Map<string, number>();
  const seenCsvAffiliateUrls = new Map<string, number>();

  return rawRows.map((raw) => {
    const { errors, normalized } = validateSingleRowFields(raw);
    const duplicateReasons: string[] = [];

    const idKey = normalized.id.toLowerCase();
    const affKey = normalizeUrlForDuplicateCheck(normalized.affiliateUrl);

    if (idKey) {
      if (existingIds.has(idKey)) {
        duplicateReasons.push(`Product ID "${normalized.id}" already exists in the database.`);
      } else if (seenCsvIds.has(idKey)) {
        duplicateReasons.push(
          `Duplicate Product ID "${normalized.id}" (first appeared on CSV row ${seenCsvIds.get(idKey)}).`
        );
      } else {
        seenCsvIds.set(idKey, raw.rowNumber);
      }
    }

    if (affKey && isSafeHttpUrl(normalized.affiliateUrl)) {
      if (existingAffiliateUrls.has(affKey)) {
        duplicateReasons.push('Affiliate URL already exists on an existing product in the database.');
      } else if (seenCsvAffiliateUrls.has(affKey)) {
        duplicateReasons.push(
          `Duplicate Affiliate URL in CSV (first appeared on CSV row ${seenCsvAffiliateUrls.get(affKey)}).`
        );
      } else {
        seenCsvAffiliateUrls.set(affKey, raw.rowNumber);
      }
    }

    let status: ValidationStatus = 'valid';
    if (errors.length > 0) {
      status = 'invalid';
    } else if (duplicateReasons.length > 0) {
      status = 'duplicate';
    }

    return {
      rowNumber: raw.rowNumber,
      raw,
      normalized,
      status,
      errors,
      duplicateReasons,
      skipped: existingSkipMap?.get(raw.rowNumber) ?? false,
    };
  });
}

export function computeSummaryCounts(rows: ValidatedImportRow[]): ImportSummaryCounts {
  let validCount = 0;
  let invalidCount = 0;
  let duplicateCount = 0;
  let skippedCount = 0;

  for (const row of rows) {
    if (row.skipped) {
      skippedCount++;
    } else if (row.status === 'valid') {
      validCount++;
    } else if (row.status === 'invalid') {
      invalidCount++;
    } else if (row.status === 'duplicate') {
      duplicateCount++;
    }
  }

  return {
    totalRows: rows.length,
    validCount,
    invalidCount,
    duplicateCount,
    skippedCount,
  };
}

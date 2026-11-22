export type CategorySlug =
  | 'beauty-personal-care'
  | 'fashion-accessories'
  | 'home-kitchen'
  | 'electronics-gadgets'
  | 'lifestyle-wellness';

export type PageId =
  | 'home'
  | 'catalog'
  | 'trending'
  | CategorySlug
  | 'about'
  | 'contact'
  | 'affiliate-disclosure'
  | 'privacy-policy'
  | 'terms-conditions'
  | 'admin-import';

export type SortOption = 'featured' | 'editors-pick' | 'name-asc' | 'name-desc';

export interface Product {
  id: string;
  name: string;
  category: CategorySlug;
  categoryLabel: string;
  shortDescription: string;
  /** Placeholder text for unconfigured demo listings */
  pricePlaceholder: string;
  /** Real imported price from CSV (empty string if omitted) */
  price?: string;
  /** Real imported currency code from CSV (empty string if omitted) */
  currency?: string;
  /** Optional rating placeholder — kept explicitly unrated/demo rather than fabricated */
  ratingPlaceholder?: string;
  /** Editable external affiliate link opened in a new tab */
  affiliateUrl: string;
  /** Optional original merchant URL from CSV */
  originalUrl?: string;
  image: string;
  imageAlt: string;
  isDemo: boolean;
  isFeatured?: boolean;
  isTrending?: boolean;
  isEditorPick?: boolean;
  createdAtMs?: number;
}

export interface CategoryInfo {
  slug: CategorySlug;
  name: string;
  shortName: string;
  kicker: string;
  description: string;
  image: string;
  imageAlt: string;
}

export interface PageMeta {
  id: PageId;
  path: string;
  title: string;
  metaDescription: string;
}

export interface RawCsvProductRow {
  rowNumber: number;
  id: string;
  name: string;
  description: string;
  category: string;
  image_url: string;
  price: string;
  currency: string;
  affiliate_url: string;
  original_url: string;
  featured: string;
  trending: string;
}

export type ValidationStatus = 'valid' | 'invalid' | 'duplicate';

export interface ValidatedImportRow {
  rowNumber: number;
  raw: RawCsvProductRow;
  normalized: {
    id: string;
    name: string;
    description: string;
    category: CategorySlug | '';
    categoryLabel: string;
    imageUrl: string;
    price: string;
    currency: string;
    affiliateUrl: string;
    originalUrl: string;
    featured: boolean;
    trending: boolean;
  };
  status: ValidationStatus;
  errors: string[];
  duplicateReasons: string[];
  skipped: boolean;
}

export interface ImportSummaryCounts {
  totalRows: number;
  validCount: number;
  invalidCount: number;
  duplicateCount: number;
  skippedCount: number;
}

export interface ImportIssueRecord {
  rowNumber: number;
  id: string;
  name: string;
  status: 'skipped' | 'duplicate' | 'failed';
  reason: string;
}

export interface ImportReport {
  fileName: string;
  totalRows: number;
  importedCount: number;
  skippedCount: number;
  duplicateCount: number;
  failedCount: number;
  issues: ImportIssueRecord[];
  completedAt: string;
}

export interface ImportProgress {
  phase: 'preparing' | 'writing' | 'logging' | 'complete';
  currentBatch: number;
  totalBatches: number;
  processedRows: number;
  totalToWrite: number;
}

export interface ImportLogEntry {
  id: string;
  fileName: string;
  totalRows: number;
  importedCount: number;
  skippedCount: number;
  duplicateCount: number;
  failedCount: number;
  importedBy: string;
  createdAtMs: number;
}

export type FirebaseConnectionState =
  | 'checking'
  | 'configured-online'
  | 'configured-offline'
  | 'not-configured';

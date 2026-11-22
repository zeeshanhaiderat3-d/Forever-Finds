import { describe, expect, it, vi } from 'vitest';
import {
  exportProductsToCsv,
  generateCsvTemplate,
  generateErrorReportCsv,
  MAX_CSV_ROWS,
  parseProductCsv,
} from '../csvParser';
import { chunkArray, executeBulkImport, FIRESTORE_BATCH_LIMIT } from '../firestoreImport';
import { computeSummaryCounts, validateAndBuildPreview } from '../productValidation';
import { Product, RawCsvProductRow } from '../../types';

// Mock firebase/firestore so executeBulkImport batching & non-overwrite logic can be tested deterministically
const mockSet = vi.fn();
const mockCommit = vi.fn().mockResolvedValue(undefined);

vi.mock('firebase/firestore', async () => {
  const actual = await vi.importActual<typeof import('firebase/firestore')>('firebase/firestore');
  return {
    ...actual,
    collection: vi.fn((_db, name: string) => ({ path: name })),
    doc: vi.fn((colRef: { path: string }, id: string) => ({ path: `${colRef.path}/${id}`, id })),
    serverTimestamp: vi.fn(() => 'SERVER_TIMESTAMP'),
    writeBatch: vi.fn(() => ({
      set: mockSet,
      commit: mockCommit,
    })),
  };
});

const SAMPLE_EXISTING: Product[] = [
  {
    id: 'existing-001',
    name: 'Existing Ceramic Vase',
    category: 'home-kitchen',
    categoryLabel: 'Home & Kitchen',
    shortDescription: 'Already stored in Firestore.',
    pricePlaceholder: 'USD 65.00',
    price: '65.00',
    currency: 'USD',
    affiliateUrl: 'https://retailer.example.com/vase?tag=ff',
    image: 'https://retailer.example.com/vase.jpg',
    imageAlt: 'Existing Ceramic Vase',
    isDemo: false,
    isFeatured: true,
    isTrending: false,
  },
];

describe('CSV Parser (RFC-4180 & UTF-8)', () => {
  it('parses commas inside quotes, escaped quotes, UTF-8 characters, and empty optional fields', () => {
    const csv =
      '\uFEFFid,name,description,category,image_url,price,currency,affiliate_url,original_url,featured,trending\r\n' +
      'prod-1,"Café Ceramic Mug, Matte","Crafted ""by hand"" in Kyoto, Japan",home-kitchen,https://cdn.example.com/mug.jpg,,USD,https://aff.example.com/mug,,true,false\r\n' +
      'prod-2,Linen Scarf,,Fashion & Accessories,https://cdn.example.com/scarf.jpg,120.50,GBP,https://aff.example.com/scarf,https://orig.example.com/scarf,yes,1';

    const { rows, fileErrors } = parseProductCsv(csv);
    expect(fileErrors).toEqual([]);
    expect(rows).toHaveLength(2);
    expect(rows[0].name).toBe('Café Ceramic Mug, Matte');
    expect(rows[0].description).toBe('Crafted "by hand" in Kyoto, Japan');
    expect(rows[0].price).toBe('');
    expect(rows[1].category).toBe('Fashion & Accessories');
    expect(rows[1].currency).toBe('GBP');
  });

  it('rejects CSVs missing required columns', () => {
    const csv = 'id,name,price\np-1,Lamp,45.00';
    const { rows, fileErrors } = parseProductCsv(csv);
    expect(rows).toHaveLength(0);
    expect(fileErrors[0]).toContain('Missing required CSV column(s)');
  });

  it('enforces maximum row limit of 1,000 rows', () => {
    const header = 'id,name,description,category,image_url,price,currency,affiliate_url,original_url,featured,trending';
    const data = Array.from({ length: MAX_CSV_ROWS + 1 }, (_, i) =>
      `id-${i},Product ${i},,home-kitchen,https://img.example.com/${i}.jpg,10,USD,https://aff.example.com/${i},,false,false`
    );
    const { rows, fileErrors } = parseProductCsv([header, ...data].join('\n'));
    expect(rows).toHaveLength(0);
    expect(fileErrors[0]).toContain('exceeding the maximum limit of 1000');
  });

  it('round-trips generated CSV template and exported products', () => {
    const template = generateCsvTemplate();
    const parsedTemplate = parseProductCsv(template);
    expect(parsedTemplate.fileErrors).toEqual([]);
    expect(parsedTemplate.rows).toHaveLength(2);

    const exported = exportProductsToCsv(SAMPLE_EXISTING);
    const parsedExport = parseProductCsv(exported);
    expect(parsedExport.fileErrors).toEqual([]);
    expect(parsedExport.rows[0].id).toBe('existing-001');
  });
});

describe('Product Validation & Duplicate Detection', () => {
  it('validates valid rows, catches unsafe URLs and missing required fields, and detects CSV & DB duplicates', () => {
    const rows: RawCsvProductRow[] = [
      {
        rowNumber: 2,
        id: 'new-valid-1',
        name: 'Travertine Tray',
        description: '',
        category: 'Home & Kitchen',
        image_url: 'https://cdn.example.com/tray.jpg',
        price: '',
        currency: '',
        affiliate_url: 'https://aff.example.com/tray',
        original_url: '',
        featured: 'true',
        trending: 'no',
      },
      {
        rowNumber: 3,
        id: 'bad-url-row',
        name: 'Unsafe Link Item',
        description: '',
        category: 'beauty-personal-care',
        image_url: 'https://cdn.example.com/serum.jpg',
        price: 'not-a-number',
        currency: 'USD',
        affiliate_url: 'javascript:alert(1)',
        original_url: '',
        featured: '',
        trending: '',
      },
      {
        rowNumber: 4,
        id: 'existing-001', // duplicate against DB
        name: 'Overwrite Attempt',
        description: '',
        category: 'home-kitchen',
        image_url: 'https://cdn.example.com/vase2.jpg',
        price: '70.00',
        currency: 'USD',
        affiliate_url: 'https://aff.example.com/vase2',
        original_url: '',
        featured: 'false',
        trending: 'false',
      },
      {
        rowNumber: 5,
        id: 'dup-url-row',
        name: 'Duplicate Affiliate URL Row',
        description: '',
        category: 'home-kitchen',
        image_url: 'https://cdn.example.com/tray2.jpg',
        price: '25.00',
        currency: 'USD',
        affiliate_url: 'https://AFF.example.com/tray/', // matches row 2 after normalization
        original_url: '',
        featured: 'false',
        trending: 'false',
      },
    ];

    const preview = validateAndBuildPreview(rows, SAMPLE_EXISTING);
    const counts = computeSummaryCounts(preview);

    expect(preview[0].status).toBe('valid');
    expect(preview[0].normalized.category).toBe('home-kitchen');
    expect(preview[0].normalized.price).toBe(''); // never invents missing price

    expect(preview[1].status).toBe('invalid');
    expect(preview[1].errors.some((e) => e.includes('Affiliate URL'))).toBe(true);
    expect(preview[1].errors.some((e) => e.includes('Price'))).toBe(true);

    expect(preview[2].status).toBe('duplicate');
    expect(preview[2].duplicateReasons[0]).toContain('already exists in the database');

    expect(preview[3].status).toBe('duplicate');
    expect(preview[3].duplicateReasons[0]).toContain('Duplicate Affiliate URL in CSV');

    expect(counts).toEqual({
      totalRows: 4,
      validCount: 1,
      invalidCount: 1,
      duplicateCount: 2,
      skippedCount: 0,
    });
  });
});

describe('Batched Firestore Import & Error Reporting', () => {
  it('chunks large imports safely below Firestore 500-op batch limit', () => {
    const items = Array.from({ length: 850 }, (_, i) => i);
    const chunks = chunkArray(items, FIRESTORE_BATCH_LIMIT);
    expect(chunks.map((c) => c.length)).toEqual([400, 400, 50]);
  });

  it('imports only valid non-skipped rows across safe batches and never overwrites duplicates', async () => {
    mockSet.mockClear();
    mockCommit.mockClear();

    const rawRows: RawCsvProductRow[] = Array.from({ length: 405 }, (_, i) => ({
      rowNumber: i + 2,
      id: `batch-item-${i + 1}`,
      name: `Editorial Object ${i + 1}`,
      description: 'Curated object',
      category: 'home-kitchen',
      image_url: `https://cdn.example.com/item-${i + 1}.jpg`,
      price: '45.00',
      currency: 'USD',
      affiliate_url: `https://aff.example.com/item-${i + 1}`,
      original_url: '',
      featured: i < 2 ? 'true' : 'false',
      trending: i === 0 ? 'true' : 'false',
    }));

    // Add 1 duplicate against existing DB and 1 invalid row
    rawRows.push({
      rowNumber: 407,
      id: 'existing-001',
      name: 'Duplicate DB Row',
      description: '',
      category: 'home-kitchen',
      image_url: 'https://cdn.example.com/dup.jpg',
      price: '50.00',
      currency: 'USD',
      affiliate_url: 'https://aff.example.com/dup-db',
      original_url: '',
      featured: 'false',
      trending: 'false',
    });
    rawRows.push({
      rowNumber: 408,
      id: 'invalid-row',
      name: '',
      description: '',
      category: 'unknown-cat',
      image_url: 'not-a-url',
      price: '',
      currency: '',
      affiliate_url: 'not-a-url',
      original_url: '',
      featured: '',
      trending: '',
    });

    const skipMap = new Map<number, boolean>([[2, true]]); // Admin explicitly skips row #2
    const preview = validateAndBuildPreview(rawRows, SAMPLE_EXISTING, skipMap);

    const progressUpdates: number[] = [];
    const report = await executeBulkImport({
      rows: preview,
      existingProducts: SAMPLE_EXISTING,
      adminUid: 'admin-uid-123',
      fileName: 'catalog-407.csv',
      firestoreInstance: {} as never,
      onProgress: (p) => progressUpdates.push(p.processedRows),
    });

    expect(report.importedCount).toBe(404);
    expect(report.skippedCount).toBe(1);
    expect(report.duplicateCount).toBe(1);
    expect(report.failedCount).toBe(1);
    expect(report.issues).toHaveLength(3);

    // 2 product batches (400 + 4) + 1 audit log batch = 3 commits
    expect(mockCommit).toHaveBeenCalledTimes(3);
    expect(mockSet).toHaveBeenCalledTimes(405); // 404 products + 1 import_log
    expect(progressUpdates.length).toBeGreaterThan(0);

    const errorCsv = generateErrorReportCsv(report.issues);
    expect(errorCsv).toContain('row_number,id,name,status,reason');
    expect(errorCsv).toContain('existing-001');
    expect(errorCsv).toContain('invalid-row');
  });
});

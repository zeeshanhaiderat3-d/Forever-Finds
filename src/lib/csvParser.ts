import { ImportIssueRecord, Product, RawCsvProductRow } from '../types';

export const CSV_COLUMNS = [
  'id',
  'name',
  'description',
  'category',
  'image_url',
  'price',
  'currency',
  'affiliate_url',
  'original_url',
  'featured',
  'trending',
] as const;

export const REQUIRED_CSV_COLUMNS = [
  'id',
  'name',
  'category',
  'image_url',
  'affiliate_url',
] as const;

export const MAX_CSV_ROWS = 1000;

/**
 * RFC-4180 compliant CSV matrix parser supporting UTF-8, BOM, commas inside
 * quotes, escaped quotes (""), embedded newlines inside quotes, and CRLF/LF.
 */
export function parseCsvMatrix(rawText: string): { matrix: string[][]; syntaxErrors: string[] } {
  const syntaxErrors: string[] = [];
  // Strip UTF-8 BOM if present
  const text = rawText.charCodeAt(0) === 0xfeff ? rawText.slice(1) : rawText;

  const matrix: string[][] = [];
  let currentRow: string[] = [];
  let currentField = '';
  let inQuotes = false;
  let fieldStartedWithQuote = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (inQuotes) {
      if (char === '"') {
        if (nextChar === '"') {
          currentField += '"';
          i++; // skip escaped quote
        } else {
          inQuotes = false;
        }
      } else {
        currentField += char;
      }
    } else {
      if (char === '"' && currentField.length === 0) {
        inQuotes = true;
        fieldStartedWithQuote = true;
      } else if (char === ',') {
        currentRow.push(fieldStartedWithQuote ? currentField : currentField.trim());
        currentField = '';
        fieldStartedWithQuote = false;
      } else if (char === '\r' && nextChar === '\n') {
        currentRow.push(fieldStartedWithQuote ? currentField : currentField.trim());
        matrix.push(currentRow);
        currentRow = [];
        currentField = '';
        fieldStartedWithQuote = false;
        i++; // skip \n
      } else if (char === '\n' || char === '\r') {
        currentRow.push(fieldStartedWithQuote ? currentField : currentField.trim());
        matrix.push(currentRow);
        currentRow = [];
        currentField = '';
        fieldStartedWithQuote = false;
      } else {
        currentField += char;
      }
    }
  }

  if (inQuotes) {
    syntaxErrors.push('Malformed CSV: unclosed quotation mark detected at end of file.');
  }

  // Push final field/row if non-empty
  if (currentField.length > 0 || currentRow.length > 0) {
    currentRow.push(fieldStartedWithQuote ? currentField : currentField.trim());
    matrix.push(currentRow);
  }

  // Remove completely blank trailing rows
  const nonEmptyRows = matrix.filter((row) => row.some((cell) => cell.trim() !== ''));
  return { matrix: nonEmptyRows, syntaxErrors };
}

export function parseProductCsv(csvText: string): {
  rows: RawCsvProductRow[];
  fileErrors: string[];
} {
  const fileErrors: string[] = [];

  if (!csvText || csvText.trim() === '') {
    return {
      rows: [],
      fileErrors: ['The uploaded CSV file is empty. Please upload a file with 1 to 1,000 product rows.'],
    };
  }

  const { matrix, syntaxErrors } = parseCsvMatrix(csvText);
  if (syntaxErrors.length > 0) {
    fileErrors.push(...syntaxErrors);
  }

  if (matrix.length === 0) {
    return {
      rows: [],
      fileErrors: ['No header row or product rows were found in the CSV file.'],
    };
  }

  const rawHeaders = matrix[0].map((h) => h.trim().toLowerCase());
  const headerIndexMap = new Map<string, number>();
  rawHeaders.forEach((header, idx) => {
    if (header && !headerIndexMap.has(header)) {
      headerIndexMap.set(header, idx);
    }
  });

  const missingColumns = REQUIRED_CSV_COLUMNS.filter((col) => !headerIndexMap.has(col));
  if (missingColumns.length > 0) {
    fileErrors.push(
      `Missing required CSV column(s): ${missingColumns.join(', ')}. Expected headers: ${CSV_COLUMNS.join(', ')}.`
    );
    return { rows: [], fileErrors };
  }

  const dataRows = matrix.slice(1);
  if (dataRows.length === 0) {
    fileErrors.push('The CSV contains a header row but 0 product rows. Add 1 to 1,000 product rows.');
    return { rows: [], fileErrors };
  }

  if (dataRows.length > MAX_CSV_ROWS) {
    fileErrors.push(
      `CSV contains ${dataRows.length} product rows, exceeding the maximum limit of ${MAX_CSV_ROWS} rows per import.`
    );
    return { rows: [], fileErrors };
  }

  const getCell = (row: string[], col: string): string => {
    const idx = headerIndexMap.get(col);
    if (idx === undefined || idx >= row.length) return '';
    return (row[idx] ?? '').trim();
  };

  const rows: RawCsvProductRow[] = dataRows.map((row, index) => ({
    rowNumber: index + 2, // 1-based line number accounting for header row
    id: getCell(row, 'id'),
    name: getCell(row, 'name'),
    description: getCell(row, 'description'),
    category: getCell(row, 'category'),
    image_url: getCell(row, 'image_url'),
    price: getCell(row, 'price'),
    currency: getCell(row, 'currency'),
    affiliate_url: getCell(row, 'affiliate_url'),
    original_url: getCell(row, 'original_url'),
    featured: getCell(row, 'featured'),
    trending: getCell(row, 'trending'),
  }));

  return { rows, fileErrors };
}

export function escapeCsvCell(value: string | number | boolean | undefined | null): string {
  const str = value === undefined || value === null ? '' : String(value);
  if (/[",\r\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function generateCsvString(headers: readonly string[], rows: (string | number | boolean)[][]): string {
  const headerLine = headers.map(escapeCsvCell).join(',');
  const bodyLines = rows.map((row) => row.map(escapeCsvCell).join(','));
  // Prepend UTF-8 BOM for reliable Excel / Sheets UTF-8 opening
  return '\uFEFF' + [headerLine, ...bodyLines].join('\r\n');
}

export function generateCsvTemplate(): string {
  const sampleRows = [
    [
      'ff-stoneware-mug-01',
      'Matte Stoneware Morning Mug',
      'Hand-finished cream ceramic mug crafted for daily pour-over rituals.',
      'home-kitchen',
      'https://example.com/images/stoneware-mug.jpg',
      '38.00',
      'USD',
      'https://example.com/aff/stoneware-mug?tag=foreverfinds',
      'https://example.com/products/stoneware-mug',
      'true',
      'true',
    ],
    [
      'ff-linen-tote-02',
      'Structured Taupe Linen Market Tote',
      'Minimalist woven carryall with reinforced leather handles.',
      'fashion-accessories',
      'https://example.com/images/taupe-tote.jpg',
      '95.00',
      'USD',
      'https://example.com/aff/taupe-tote?tag=foreverfinds',
      '',
      'false',
      'true',
    ],
  ];
  return generateCsvString(CSV_COLUMNS, sampleRows);
}

export function exportProductsToCsv(products: Product[]): string {
  const rows = products.map((p) => [
    p.id,
    p.name,
    p.shortDescription,
    p.category,
    p.image,
    p.price ?? '',
    p.currency ?? '',
    p.affiliateUrl,
    p.originalUrl ?? '',
    Boolean(p.isFeatured),
    Boolean(p.isTrending),
  ]);
  return generateCsvString(CSV_COLUMNS, rows);
}

export function generateErrorReportCsv(issues: ImportIssueRecord[]): string {
  const headers = ['row_number', 'id', 'name', 'status', 'reason'];
  const rows = issues.map((item) => [
    item.rowNumber,
    item.id,
    item.name,
    item.status,
    item.reason,
  ]);
  return generateCsvString(headers, rows);
}

export function triggerCsvDownload(csvContent: string, filename: string): void {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

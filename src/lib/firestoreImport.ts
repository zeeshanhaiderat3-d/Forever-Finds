import {
  collection,
  deleteDoc,
  doc,
  Firestore,
  serverTimestamp,
  writeBatch,
} from 'firebase/firestore';
import {
  ImportIssueRecord,
  ImportProgress,
  ImportReport,
  Product,
  ValidatedImportRow,
} from '../types';
import { db, handleFirestoreError, OperationType } from './firebase';
import { normalizeUrlForDuplicateCheck } from './productValidation';

/**
 * Firestore writeBatch supports up to 500 operations per batch.
 * Keep a safe buffer of 400 documents per batch for large imports (up to 1,000 rows).
 */
export const FIRESTORE_BATCH_LIMIT = 400;

export function chunkArray<T>(items: T[], size: number = FIRESTORE_BATCH_LIMIT): T[][] {
  if (size <= 0) throw new Error('Batch chunk size must be greater than 0.');
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
}

interface ExecuteBulkImportParams {
  rows: ValidatedImportRow[];
  existingProducts: Product[];
  adminUid: string;
  fileName: string;
  firestoreInstance?: Firestore | null;
  onProgress?: (progress: ImportProgress) => void;
}

export async function executeBulkImport({
  rows,
  existingProducts,
  adminUid,
  fileName,
  firestoreInstance = db,
  onProgress,
}: ExecuteBulkImportParams): Promise<ImportReport> {
  if (!firestoreInstance) {
    throw new Error('Firebase Firestore is not configured. Configure Firebase before importing.');
  }

  const issues: ImportIssueRecord[] = [];
  const toImport: ValidatedImportRow[] = [];

  const existingIds = new Set(existingProducts.map((p) => p.id.trim().toLowerCase()));
  const existingUrls = new Set(
    existingProducts.map((p) => normalizeUrlForDuplicateCheck(p.affiliateUrl)).filter(Boolean)
  );

  let skippedCount = 0;
  let duplicateCount = 0;
  let failedCount = 0;

  for (const row of rows) {
    if (row.skipped) {
      skippedCount++;
      issues.push({
        rowNumber: row.rowNumber,
        id: row.normalized.id || '(missing)',
        name: row.normalized.name || '(unnamed)',
        status: 'skipped',
        reason: 'Skipped by administrator prior to import.',
      });
      continue;
    }

    if (row.status === 'invalid') {
      failedCount++;
      issues.push({
        rowNumber: row.rowNumber,
        id: row.normalized.id || '(missing)',
        name: row.normalized.name || '(unnamed)',
        status: 'failed',
        reason: row.errors.join(' '),
      });
      continue;
    }

    const idKey = row.normalized.id.toLowerCase();
    const urlKey = normalizeUrlForDuplicateCheck(row.normalized.affiliateUrl);

    // Enforce non-overwrite policy against existing Firestore records
    if (row.status === 'duplicate' || existingIds.has(idKey) || existingUrls.has(urlKey)) {
      duplicateCount++;
      issues.push({
        rowNumber: row.rowNumber,
        id: row.normalized.id,
        name: row.normalized.name,
        status: 'duplicate',
        reason:
          row.duplicateReasons.join(' ') ||
          'Existing product with matching ID or affiliate URL was preserved without overwriting.',
      });
      continue;
    }

    existingIds.add(idKey);
    existingUrls.add(urlKey);
    toImport.push(row);
  }

  const batches = chunkArray(toImport, FIRESTORE_BATCH_LIMIT);
  const totalBatches = Math.max(batches.length, 1);

  onProgress?.({
    phase: 'preparing',
    currentBatch: 0,
    totalBatches,
    processedRows: 0,
    totalToWrite: toImport.length,
  });

  let importedCount = 0;

  for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
    const chunk = batches[batchIndex];
    const batch = writeBatch(firestoreInstance);

    for (const row of chunk) {
      if (!row.normalized.category) continue;
      const productRef = doc(collection(firestoreInstance, 'products'), row.normalized.id);
      batch.set(productRef, {
        id: row.normalized.id,
        name: row.normalized.name,
        description: row.normalized.description,
        category: row.normalized.category,
        categoryLabel: row.normalized.categoryLabel,
        imageUrl: row.normalized.imageUrl,
        price: row.normalized.price,
        currency: row.normalized.currency,
        affiliateUrl: row.normalized.affiliateUrl,
        originalUrl: row.normalized.originalUrl,
        featured: row.normalized.featured,
        trending: row.normalized.trending,
        status: 'published',
        importedBy: adminUid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }

    onProgress?.({
      phase: 'writing',
      currentBatch: batchIndex + 1,
      totalBatches,
      processedRows: importedCount,
      totalToWrite: toImport.length,
    });

    try {
      await batch.commit();
      importedCount += chunk.length;
    } catch (error) {
      // Mark this batch's rows as failed and report structured error
      for (const row of chunk) {
        failedCount++;
        issues.push({
          rowNumber: row.rowNumber,
          id: row.normalized.id,
          name: row.normalized.name,
          status: 'failed',
          reason:
            error instanceof Error
              ? `Firestore batch write failed: ${error.message}`
              : 'Firestore batch write failed.',
        });
      }
      handleFirestoreError(error, OperationType.WRITE, 'products');
    }
  }

  // Record audit log in /import_logs
  onProgress?.({
    phase: 'logging',
    currentBatch: totalBatches,
    totalBatches,
    processedRows: importedCount,
    totalToWrite: toImport.length,
  });

  const logId = `import_${Date.now()}`;
  const logBatch = writeBatch(firestoreInstance);
  logBatch.set(doc(collection(firestoreInstance, 'import_logs'), logId), {
    id: logId,
    fileName: fileName.slice(0, 255) || 'products.csv',
    totalRows: rows.length,
    importedCount,
    skippedCount,
    duplicateCount,
    failedCount,
    importedBy: adminUid,
    createdAt: serverTimestamp(),
  });

  try {
    await logBatch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `import_logs/${logId}`);
  }

  onProgress?.({
    phase: 'complete',
    currentBatch: totalBatches,
    totalBatches,
    processedRows: importedCount,
    totalToWrite: toImport.length,
  });

  return {
    fileName,
    totalRows: rows.length,
    importedCount,
    skippedCount,
    duplicateCount,
    failedCount,
    issues,
    completedAt: new Date().toISOString(),
  };
}

export async function deleteFirestoreProduct(productId: string): Promise<void> {
  if (!db) {
    throw new Error('Firebase Firestore is not configured.');
  }
  const path = `products/${productId}`;
  try {
    await deleteDoc(doc(db, 'products', productId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

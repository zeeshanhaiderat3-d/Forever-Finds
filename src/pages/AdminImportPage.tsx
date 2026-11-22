import React, { useMemo, useRef, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  ImageOff,
  Lock,
  LogOut,
  Pencil,
  ShieldAlert,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import { useCatalog } from '../context/CatalogContext';
import { CATEGORIES } from '../data/products';
import {
  CSV_COLUMNS,
  exportProductsToCsv,
  generateCsvTemplate,
  generateErrorReportCsv,
  MAX_CSV_ROWS,
  parseProductCsv,
  triggerCsvDownload,
} from '../lib/csvParser';
import { deleteFirestoreProduct, executeBulkImport } from '../lib/firestoreImport';
import { computeSummaryCounts, validateAndBuildPreview } from '../lib/productValidation';
import {
  ImportProgress,
  ImportReport,
  PageId,
  RawCsvProductRow,
  ValidatedImportRow,
} from '../types';

interface AdminImportPageProps {
  onNavigate: (page: PageId) => void;
}

type PreviewFilter = 'all' | 'valid' | 'invalid' | 'duplicate' | 'skipped';
type AdminTab = 'import' | 'catalog' | 'logs';

export const AdminImportPage: React.FC<AdminImportPageProps> = ({ onNavigate }) => {
  const {
    products,
    firestoreProducts,
    importLogs,
    connectionState,
    user,
    authLoading,
    isAdmin,
    authError,
    signInWithGoogle,
    signOutAdmin,
  } = useCatalog();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState<AdminTab>('import');
  const [uploadedFileName, setUploadedFileName] = useState<string>('');
  const [fileErrors, setFileErrors] = useState<string[]>([]);
  const [rawRows, setRawRows] = useState<RawCsvProductRow[]>([]);
  const [skipMap, setSkipMap] = useState<Map<number, boolean>>(new Map());
  const [previewFilter, setPreviewFilter] = useState<PreviewFilter>('all');
  const [editingRowNumber, setEditingRowNumber] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState<ImportProgress | null>(null);
  const [importError, setImportError] = useState<string>('');
  const [importReport, setImportReport] = useState<ImportReport | null>(null);

  // Catalog management state
  const [catalogSearch, setCatalogSearch] = useState('');
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Live preview validation against existing Firestore products
  const validatedRows: ValidatedImportRow[] = useMemo(() => {
    if (rawRows.length === 0) return [];
    return validateAndBuildPreview(rawRows, firestoreProducts, skipMap);
  }, [rawRows, firestoreProducts, skipMap]);

  const summary = useMemo(() => computeSummaryCounts(validatedRows), [validatedRows]);

  const filteredPreviewRows = useMemo(() => {
    return validatedRows.filter((row) => {
      if (previewFilter === 'all') return true;
      if (previewFilter === 'skipped') return row.skipped;
      if (row.skipped) return false;
      return row.status === previewFilter;
    });
  }, [validatedRows, previewFilter]);

  const filteredLiveCatalog = useMemo(() => {
    const q = catalogSearch.trim().toLowerCase();
    if (!q) return firestoreProducts;
    return firestoreProducts.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q) ||
        p.categoryLabel.toLowerCase().includes(q)
    );
  }, [firestoreProducts, catalogSearch]);

  const handleFileSelected = async (file: File | undefined) => {
    if (!file) return;
    setImportError('');
    setImportReport(null);
    setImportProgress(null);
    setEditingRowNumber(null);
    setPreviewFilter('all');
    setUploadedFileName(file.name);

    try {
      const text = await file.text();
      const { rows, fileErrors: errors } = parseProductCsv(text);
      setFileErrors(errors);
      setRawRows(rows);
      setSkipMap(new Map());
    } catch (err) {
      setFileErrors([
        err instanceof Error ? err.message : 'Unable to read the selected CSV file.',
      ]);
      setRawRows([]);
    }
  };

  const handleClearPreview = () => {
    setUploadedFileName('');
    setFileErrors([]);
    setRawRows([]);
    setSkipMap(new Map());
    setEditingRowNumber(null);
    setPreviewFilter('all');
    setImportError('');
    setImportProgress(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDownloadTemplate = () => {
    const csv = generateCsvTemplate();
    triggerCsvDownload(csv, 'forever-finds-import-template.csv');
  };

  const handleDownloadCurrentProducts = () => {
    const source = firestoreProducts.length > 0 ? firestoreProducts : products;
    const csv = exportProductsToCsv(source);
    const name =
      firestoreProducts.length > 0
        ? 'forever-finds-live-products.csv'
        : 'forever-finds-demo-products.csv';
    triggerCsvDownload(csv, name);
  };

  const handleDownloadErrorReport = () => {
    if (!importReport) return;
    const csv = generateErrorReportCsv(importReport.issues);
    triggerCsvDownload(csv, `forever-finds-import-errors-${Date.now()}.csv`);
  };

  const handleToggleSkipRow = (rowNumber: number) => {
    setSkipMap((prev) => {
      const next = new Map(prev);
      next.set(rowNumber, !(next.get(rowNumber) ?? false));
      return next;
    });
  };

  const handleSkipAllProblemRows = () => {
    setSkipMap((prev) => {
      const next = new Map(prev);
      for (const row of validatedRows) {
        if (row.status === 'invalid' || row.status === 'duplicate') {
          next.set(row.rowNumber, true);
        }
      }
      return next;
    });
  };

  const handleUpdateRawField = (
    rowNumber: number,
    field: keyof RawCsvProductRow,
    value: string
  ) => {
    setRawRows((prev) =>
      prev.map((r) => (r.rowNumber === rowNumber ? { ...r, [field]: value } : r))
    );
  };

  const handleRunImport = async () => {
    if (!user || !isAdmin || connectionState !== 'configured-online') {
      setImportError(
        'Cannot write to Firestore: Firebase must be configured and an authorized administrator must be signed in.'
      );
      return;
    }

    if (summary.validCount === 0) {
      setImportError('There are no valid, non-skipped products ready to import.');
      return;
    }

    setIsImporting(true);
    setImportError('');
    setImportReport(null);

    try {
      const report = await executeBulkImport({
        rows: validatedRows,
        existingProducts: firestoreProducts,
        adminUid: user.uid,
        fileName: uploadedFileName || 'bulk-import.csv',
        onProgress: (progress) => setImportProgress(progress),
      });
      setImportReport(report);
      // Clear preview rows once committed so duplicate errors aren't immediately shown against newly inserted docs
      setRawRows([]);
      setSkipMap(new Map());
      setUploadedFileName('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      setImportError(
        err instanceof Error ? err.message : 'Bulk import failed while writing to Firestore.'
      );
    } finally {
      setIsImporting(false);
    }
  };

  const handleDeleteLiveProduct = async (productId: string) => {
    setDeletingId(productId);
    try {
      await deleteFirestoreProduct(productId);
      setPendingDeleteId(null);
    } catch (err) {
      setImportError(
        err instanceof Error ? err.message : 'Failed to delete product from Firestore.'
      );
    } finally {
      setDeletingId(null);
    }
  };

  const isFirebaseReady = connectionState === 'configured-online';
  const progressPercent = importProgress
    ? importProgress.totalToWrite > 0
      ? Math.round((importProgress.processedRows / importProgress.totalToWrite) * 100)
      : 100
    : 0;

  return (
    <section className="bg-cream">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        {/* Breadcrumb */}
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
          <span className="text-charcoal">Admin Product Import</span>
        </nav>

        {/* Page Title & Status */}
        <div className="mt-6 flex flex-col justify-between gap-6 border-b border-beige pb-8 lg:flex-row lg:items-end">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-taupe">
              Protected Administration · Cloud Firestore
            </p>
            <h1 className="mt-2 font-editorial text-4xl font-medium text-charcoal sm:text-5xl">
              Bulk Product Import
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-charcoal-soft">
              Upload UTF-8 CSV catalogs (1 to 1,000 products), validate fields and affiliate URLs, review duplicates before publishing, and commit safely to Cloud Firestore.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span className="border border-beige bg-cream-dark/60 px-3.5 py-2 text-xs text-charcoal-soft tabular-nums">
              {connectionState === 'not-configured'
                ? 'Firebase: Not Configured (Demo Mode)'
                : connectionState === 'configured-offline'
                  ? 'Firebase: Offline'
                  : `Live Firestore Products: ${firestoreProducts.length}`}
            </span>
            {user && (
              <button
                type="button"
                onClick={signOutAdmin}
                className="inline-flex items-center gap-2 border border-taupe-light px-4 py-2 text-xs font-medium text-charcoal hover:border-charcoal hover:bg-cream-dark cursor-pointer"
              >
                <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Sign Out</span>
              </button>
            )}
          </div>
        </div>

        {/* Auth & Firebase Setup Gate */}
        {authLoading ? (
          <div className="mt-10 border border-beige bg-cream-dark/40 p-12 text-center text-sm text-taupe">
            Verifying administrator session...
          </div>
        ) : connectionState === 'not-configured' ? (
          <div className="mt-10 space-y-6">
            <div className="border border-beige bg-cream-dark/60 p-8">
              <div className="flex items-start gap-4">
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-charcoal" aria-hidden="true" />
                <div>
                  <h2 className="font-editorial text-2xl font-medium text-charcoal">
                    Firebase Not Configured — Demo Preview Mode Only
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-charcoal-soft">
                    Cloud Firestore and Firebase Authentication are not configured yet. Database persistence is disabled and no products will be saved until `firebase-applet-config.json` contains a valid Firebase Web configuration and Firestore security rules are deployed.
                  </p>
                  <p className="mt-2 text-xs text-taupe">
                    You can still test CSV template download, upload, parsing, and validation locally below.
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : !user ? (
          <div className="mx-auto mt-12 max-w-xl border border-beige bg-cream-dark/40 p-8 sm:p-10 text-center">
            <Lock className="mx-auto h-7 w-7 text-charcoal" aria-hidden="true" />
            <h2 className="mt-4 font-editorial text-3xl font-medium text-charcoal">
              Administrator Sign-In Required
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-charcoal-soft">
              Sign in with your authorized Google administrator account to upload CSV catalogs, manage live Firestore products, and review import audit logs.
            </p>
            {authError && (
              <p role="alert" className="mt-4 border border-beige bg-cream p-3 text-xs text-charcoal">
                {authError}
              </p>
            )}
            <button
              type="button"
              onClick={signInWithGoogle}
              className="mt-6 inline-flex items-center justify-center gap-2 bg-charcoal px-7 py-3.5 text-xs font-medium uppercase tracking-wider text-cream transition-colors hover:bg-charcoal-soft cursor-pointer"
            >
              <span>Sign In with Google</span>
            </button>
            <p className="mt-4 text-xs text-taupe">
              Protected by Firebase Authentication and Firestore Security Rules.
            </p>
          </div>
        ) : !isAdmin ? (
          <div className="mx-auto mt-12 max-w-xl border border-beige bg-cream-dark/40 p-8 sm:p-10 text-center">
            <ShieldAlert className="mx-auto h-7 w-7 text-charcoal" aria-hidden="true" />
            <h2 className="mt-4 font-editorial text-3xl font-medium text-charcoal">
              Unauthorized Account
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-charcoal-soft">
              Signed in as <strong className="font-medium text-charcoal">{user.email}</strong>. This account does not have administrator permissions to import or modify Forever Finds products.
            </p>
            <button
              type="button"
              onClick={signOutAdmin}
              className="mt-6 border border-charcoal px-6 py-2.5 text-xs font-medium uppercase tracking-wider text-charcoal hover:bg-charcoal hover:text-cream cursor-pointer"
            >
              Sign Out &amp; Switch Account
            </button>
          </div>
        ) : null}

        {/* Authorized Admin Workspace (or Local CSV Validation Demo when Firebase is unconfigured) */}
        {((user && isAdmin) || connectionState === 'not-configured') && (
          <div className="mt-8 space-y-8">
            {/* Workspace Sub-Navigation Tabs */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-beige pb-4">
              <div role="tablist" aria-label="Admin sections" className="flex flex-wrap gap-2">
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeTab === 'import'}
                  onClick={() => setActiveTab('import')}
                  className={`px-4 py-2 text-xs font-medium uppercase tracking-wider transition-colors cursor-pointer ${
                    activeTab === 'import'
                      ? 'bg-charcoal text-cream'
                      : 'border border-beige bg-cream text-charcoal-soft hover:border-taupe'
                  }`}
                >
                  CSV Bulk Import
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeTab === 'catalog'}
                  onClick={() => setActiveTab('catalog')}
                  className={`px-4 py-2 text-xs font-medium uppercase tracking-wider transition-colors tabular-nums cursor-pointer ${
                    activeTab === 'catalog'
                      ? 'bg-charcoal text-cream'
                      : 'border border-beige bg-cream text-charcoal-soft hover:border-taupe'
                  }`}
                >
                  Live Firestore Products ({firestoreProducts.length})
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeTab === 'logs'}
                  onClick={() => setActiveTab('logs')}
                  className={`px-4 py-2 text-xs font-medium uppercase tracking-wider transition-colors tabular-nums cursor-pointer ${
                    activeTab === 'logs'
                      ? 'bg-charcoal text-cream'
                      : 'border border-beige bg-cream text-charcoal-soft hover:border-taupe'
                  }`}
                >
                  Import Logs ({importLogs.length})
                </button>
              </div>

              {user && isAdmin && (
                <p className="text-xs text-taupe">
                  Signed in as <span className="text-charcoal">{user.email}</span>
                </p>
              )}
            </div>

            {/* TAB 1: CSV BULK IMPORT */}
            {activeTab === 'import' && (
              <div className="space-y-8">
                {/* Action Toolbar */}
                <div className="flex flex-wrap items-center gap-3">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv,text/csv"
                    onChange={(e) => handleFileSelected(e.target.files?.[0])}
                    className="sr-only"
                    id="csv-file-upload"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isImporting}
                    className="inline-flex items-center gap-2 bg-charcoal px-5 py-2.5 text-xs font-medium uppercase tracking-wider text-cream transition-colors hover:bg-charcoal-soft disabled:opacity-50 cursor-pointer"
                  >
                    <Upload className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Upload CSV File</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleDownloadTemplate}
                    className="inline-flex items-center gap-2 border border-taupe-light bg-cream px-4 py-2.5 text-xs font-medium uppercase tracking-wider text-charcoal transition-colors hover:border-charcoal hover:bg-cream-dark cursor-pointer"
                  >
                    <Download className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Download CSV Template</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleDownloadCurrentProducts}
                    className="inline-flex items-center gap-2 border border-taupe-light bg-cream px-4 py-2.5 text-xs font-medium uppercase tracking-wider text-charcoal transition-colors hover:border-charcoal hover:bg-cream-dark cursor-pointer"
                  >
                    <FileSpreadsheet className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Download Current Products as CSV</span>
                  </button>

                  {validatedRows.length > 0 && (
                    <>
                      <button
                        type="button"
                        onClick={handleRunImport}
                        disabled={isImporting || summary.validCount === 0 || !isFirebaseReady}
                        className="inline-flex items-center gap-2 bg-charcoal px-5 py-2.5 text-xs font-medium uppercase tracking-wider text-cream transition-colors hover:bg-charcoal-soft disabled:cursor-not-allowed disabled:opacity-45 cursor-pointer"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>Import Products ({summary.validCount})</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleClearPreview}
                        disabled={isImporting}
                        className="inline-flex items-center gap-2 border border-beige px-4 py-2.5 text-xs font-medium uppercase tracking-wider text-charcoal-soft hover:border-charcoal hover:text-charcoal disabled:opacity-50 cursor-pointer"
                      >
                        <X className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>Clear Import Preview</span>
                      </button>
                    </>
                  )}
                </div>

                {/* Drag-and-Drop CSV Upload Zone (when no preview loaded yet) */}
                {validatedRows.length === 0 && (
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragging(true);
                    }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDragging(false);
                      handleFileSelected(e.dataTransfer.files?.[0]);
                    }}
                    className={`border border-dashed p-10 text-center transition-colors ${
                      isDragging
                        ? 'border-charcoal bg-cream-dark'
                        : 'border-taupe-light bg-cream-dark/35'
                    }`}
                  >
                    <FileSpreadsheet className="mx-auto h-8 w-8 text-taupe" aria-hidden="true" />
                    <h2 className="mt-3 font-editorial text-2xl font-medium text-charcoal">
                      Drop Your CSV File Here
                    </h2>
                    <p className="mx-auto mt-2 max-w-xl text-xs leading-relaxed text-charcoal-soft">
                      Supports 1 to {MAX_CSV_ROWS.toLocaleString()} rows in UTF-8 CSV format with columns:{' '}
                      <code className="bg-beige px-1.5 py-0.5 text-[11px]">
                        {CSV_COLUMNS.join(', ')}
                      </code>
                    </p>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="mt-5 border border-charcoal px-5 py-2.5 text-xs font-medium uppercase tracking-wider text-charcoal hover:bg-charcoal hover:text-cream transition-colors cursor-pointer"
                    >
                      Select CSV File
                    </button>
                  </div>
                )}

                {/* File-Level Parse Errors */}
                {fileErrors.length > 0 && (
                  <div role="alert" className="border border-charcoal bg-cream-dark p-5">
                    <p className="text-xs font-semibold uppercase tracking-wider text-charcoal">
                      CSV File Validation Error
                    </p>
                    <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-charcoal-soft">
                      {fileErrors.map((err, i) => (
                        <li key={i}>{err}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Import Error Alert */}
                {importError && (
                  <div role="alert" className="border border-charcoal bg-cream-dark p-5 text-sm text-charcoal">
                    <strong className="font-semibold">Import Error:</strong> {importError}
                  </div>
                )}

                {/* Import Progress Indicator */}
                {isImporting && importProgress && (
                  <div
                    role="status"
                    aria-live="polite"
                    className="border border-beige bg-cream-dark/60 p-6"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-medium text-charcoal">
                      <span className="uppercase tracking-wider">
                        {importProgress.phase === 'writing'
                          ? `Writing Batch ${importProgress.currentBatch} of ${importProgress.totalBatches} to Cloud Firestore`
                          : importProgress.phase === 'logging'
                            ? 'Recording Audit Log...'
                            : 'Preparing Batch Import...'}
                      </span>
                      <span className="tabular-nums">
                        {importProgress.processedRows} / {importProgress.totalToWrite} products ({progressPercent}%)
                      </span>
                    </div>
                    <div className="mt-3 h-2 w-full overflow-hidden bg-beige">
                      <div
                        className="h-full bg-charcoal transition-transform duration-200 origin-left"
                        style={{ transform: `scaleX(${Math.max(0.05, progressPercent / 100)})` }}
                      />
                    </div>
                  </div>
                )}

                {/* Post-Import Report */}
                {importReport && (
                  <div className="border border-beige bg-cream-dark/50 p-6 sm:p-8">
                    <div className="flex flex-col justify-between gap-4 border-b border-beige pb-5 sm:flex-row sm:items-center">
                      <div>
                        <p className="text-xs uppercase tracking-[0.16em] text-taupe">
                          Import Complete · {importReport.fileName}
                        </p>
                        <h2 className="mt-1 font-editorial text-3xl font-medium text-charcoal">
                          Import Summary Report
                        </h2>
                      </div>
                      <div className="flex flex-wrap gap-3">
                        {importReport.issues.length > 0 && (
                          <button
                            type="button"
                            onClick={handleDownloadErrorReport}
                            className="inline-flex items-center gap-2 border border-charcoal px-4 py-2 text-xs font-medium uppercase tracking-wider text-charcoal hover:bg-charcoal hover:text-cream cursor-pointer"
                          >
                            <Download className="h-3.5 w-3.5" aria-hidden="true" />
                            <span>Download CSV Error Report</span>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => onNavigate('catalog')}
                          className="inline-flex items-center gap-2 bg-charcoal px-4 py-2 text-xs font-medium uppercase tracking-wider text-cream hover:bg-charcoal-soft cursor-pointer"
                        >
                          <span>View Live Storefront</span>
                        </button>
                      </div>
                    </div>

                    <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
                      <div className="border border-beige bg-cream p-4">
                        <p className="text-xs uppercase tracking-wider text-taupe">Imported</p>
                        <p className="mt-1 font-editorial text-3xl font-medium text-charcoal tabular-nums">
                          {importReport.importedCount}
                        </p>
                      </div>
                      <div className="border border-beige bg-cream p-4">
                        <p className="text-xs uppercase tracking-wider text-taupe">Skipped</p>
                        <p className="mt-1 font-editorial text-3xl font-medium text-charcoal tabular-nums">
                          {importReport.skippedCount}
                        </p>
                      </div>
                      <div className="border border-beige bg-cream p-4">
                        <p className="text-xs uppercase tracking-wider text-taupe">Duplicates</p>
                        <p className="mt-1 font-editorial text-3xl font-medium text-charcoal tabular-nums">
                          {importReport.duplicateCount}
                        </p>
                      </div>
                      <div className="border border-beige bg-cream p-4">
                        <p className="text-xs uppercase tracking-wider text-taupe">Failed</p>
                        <p className="mt-1 font-editorial text-3xl font-medium text-charcoal tabular-nums">
                          {importReport.failedCount}
                        </p>
                      </div>
                    </div>

                    {importReport.issues.length > 0 && (
                      <div className="mt-6">
                        <h3 className="font-sans text-xs font-semibold uppercase tracking-wider text-taupe">
                          Skipped / Duplicate / Failed Rows ({importReport.issues.length})
                        </h3>
                        <div className="mt-3 max-h-60 overflow-y-auto border border-beige bg-cream">
                          <table className="w-full text-left text-xs">
                            <thead className="border-b border-beige bg-cream-dark/60 text-taupe">
                              <tr>
                                <th className="px-4 py-2.5 font-medium">Row</th>
                                <th className="px-4 py-2.5 font-medium">ID</th>
                                <th className="px-4 py-2.5 font-medium">Product</th>
                                <th className="px-4 py-2.5 font-medium">Status</th>
                                <th className="px-4 py-2.5 font-medium">Reason</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-beige">
                              {importReport.issues.map((issue, idx) => (
                                <tr key={idx}>
                                  <td className="px-4 py-2.5 tabular-nums text-taupe">
                                    {issue.rowNumber}
                                  </td>
                                  <td className="px-4 py-2.5 font-mono text-[11px] text-charcoal">
                                    {issue.id}
                                  </td>
                                  <td className="px-4 py-2.5 text-charcoal">{issue.name}</td>
                                  <td className="px-4 py-2.5 uppercase tracking-wider text-charcoal-soft">
                                    {issue.status}
                                  </td>
                                  <td className="px-4 py-2.5 text-charcoal-soft">{issue.reason}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Product Preview & Inline Correction Table */}
                {validatedRows.length > 0 && (
                  <div className="space-y-6">
                    {/* Preview Summary Counters */}
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
                      <div className="border border-beige bg-cream-dark/40 p-4">
                        <p className="text-[11px] uppercase tracking-wider text-taupe">File</p>
                        <p className="mt-1 truncate text-sm font-medium text-charcoal" title={uploadedFileName}>
                          {uploadedFileName}
                        </p>
                        <p className="mt-0.5 text-xs text-taupe tabular-nums">
                          {summary.totalRows} total rows
                        </p>
                      </div>
                      <div className="border border-beige bg-cream p-4">
                        <p className="text-[11px] uppercase tracking-wider text-taupe">Valid Products</p>
                        <p className="mt-1 font-editorial text-3xl font-medium text-charcoal tabular-nums">
                          {summary.validCount}
                        </p>
                      </div>
                      <div className="border border-beige bg-cream p-4">
                        <p className="text-[11px] uppercase tracking-wider text-taupe">Invalid Products</p>
                        <p className="mt-1 font-editorial text-3xl font-medium text-charcoal tabular-nums">
                          {summary.invalidCount}
                        </p>
                      </div>
                      <div className="border border-beige bg-cream p-4">
                        <p className="text-[11px] uppercase tracking-wider text-taupe">Duplicate Products</p>
                        <p className="mt-1 font-editorial text-3xl font-medium text-charcoal tabular-nums">
                          {summary.duplicateCount}
                        </p>
                      </div>
                      <div className="border border-beige bg-cream p-4">
                        <p className="text-[11px] uppercase tracking-wider text-taupe">Skipped</p>
                        <p className="mt-1 font-editorial text-3xl font-medium text-charcoal tabular-nums">
                          {summary.skippedCount}
                        </p>
                      </div>
                    </div>

                    {/* Preview Filter & Bulk Skip Toolbar */}
                    <div className="flex flex-wrap items-center justify-between gap-4 border-y border-beige py-4">
                      <div className="flex flex-wrap items-center gap-2">
                        {(
                          [
                            ['all', `All (${summary.totalRows})`],
                            ['valid', `Valid (${summary.validCount})`],
                            ['invalid', `Invalid (${summary.invalidCount})`],
                            ['duplicate', `Duplicates (${summary.duplicateCount})`],
                            ['skipped', `Skipped (${summary.skippedCount})`],
                          ] as [PreviewFilter, string][]
                        ).map(([key, label]) => (
                          <button
                            key={key}
                            type="button"
                            onClick={() => setPreviewFilter(key)}
                            className={`px-3 py-1.5 text-xs font-medium transition-colors tabular-nums cursor-pointer ${
                              previewFilter === key
                                ? 'bg-charcoal text-cream'
                                : 'border border-beige bg-cream text-charcoal-soft hover:border-taupe'
                            }`}
                          >
                            {label}
                          </button>
                        ))}
                      </div>

                      {(summary.invalidCount > 0 || summary.duplicateCount > 0) && (
                        <button
                          type="button"
                          onClick={handleSkipAllProblemRows}
                          className="border border-taupe-light px-3.5 py-1.5 text-xs font-medium text-charcoal hover:border-charcoal hover:bg-cream-dark cursor-pointer"
                        >
                          Skip All Invalid &amp; Duplicates
                        </button>
                      )}
                    </div>

                    {/* Preview Table */}
                    <div className="overflow-x-auto border border-beige bg-cream">
                      <table className="w-full min-w-[960px] text-left text-xs">
                        <thead className="border-b border-beige bg-cream-dark/60 uppercase tracking-wider text-taupe">
                          <tr>
                            <th className="px-4 py-3 font-medium">Row</th>
                            <th className="px-4 py-3 font-medium">Thumbnail</th>
                            <th className="px-4 py-3 font-medium">Product Name</th>
                            <th className="px-4 py-3 font-medium">Category</th>
                            <th className="px-4 py-3 font-medium">Price &amp; Currency</th>
                            <th className="px-4 py-3 font-medium">Affiliate URL</th>
                            <th className="px-4 py-3 font-medium">Validation Status</th>
                            <th className="px-4 py-3 text-right font-medium">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-beige">
                          {filteredPreviewRows.map((row) => {
                            const isEditing = editingRowNumber === row.rowNumber;
                            const issuesList = [...row.errors, ...row.duplicateReasons];
                            return (
                              <React.Fragment key={row.rowNumber}>
                                <tr className={row.skipped ? 'bg-cream-dark/30 opacity-65' : ''}>
                                  <td className="px-4 py-3.5 align-top tabular-nums text-taupe">
                                    #{row.rowNumber}
                                    <div className="mt-1 font-mono text-[10px] text-charcoal-soft">
                                      {row.normalized.id || '(no id)'}
                                    </div>
                                  </td>
                                  <td className="px-4 py-3.5 align-top">
                                    <PreviewThumb
                                      src={row.normalized.imageUrl}
                                      alt={row.normalized.name || 'Preview thumbnail'}
                                    />
                                  </td>
                                  <td className="max-w-[220px] px-4 py-3.5 align-top">
                                    <p className="font-medium text-charcoal">
                                      {row.normalized.name || '(Missing product name)'}
                                    </p>
                                    {row.normalized.description && (
                                      <p className="mt-1 line-clamp-2 text-[11px] text-taupe">
                                        {row.normalized.description}
                                      </p>
                                    )}
                                  </td>
                                  <td className="px-4 py-3.5 align-top text-charcoal-soft">
                                    {row.normalized.categoryLabel || row.raw.category || '(Missing)'}
                                  </td>
                                  <td className="px-4 py-3.5 align-top tabular-nums text-charcoal">
                                    {row.normalized.price
                                      ? `${row.normalized.currency ? `${row.normalized.currency} ` : ''}${row.normalized.price}`
                                      : 'Not set'}
                                  </td>
                                  <td className="max-w-[210px] px-4 py-3.5 align-top">
                                    <span className="block truncate font-mono text-[11px] text-charcoal-soft" title={row.normalized.affiliateUrl}>
                                      {row.normalized.affiliateUrl || '(Missing URL)'}
                                    </span>
                                  </td>
                                  <td className="max-w-[250px] px-4 py-3.5 align-top">
                                    <div className="font-medium uppercase tracking-wider">
                                      {row.skipped ? (
                                        <span className="text-taupe">Skipped</span>
                                      ) : row.status === 'valid' ? (
                                        <span className="text-charcoal">Valid</span>
                                      ) : row.status === 'duplicate' ? (
                                        <span className="text-charcoal-soft">Duplicate</span>
                                      ) : (
                                        <span className="text-charcoal">Invalid</span>
                                      )}
                                    </div>
                                    {issuesList.length > 0 && (
                                      <ul className="mt-1 space-y-0.5 text-[11px] leading-snug text-charcoal-soft">
                                        {issuesList.map((msg, i) => (
                                          <li key={i}>· {msg}</li>
                                        ))}
                                      </ul>
                                    )}
                                  </td>
                                  <td className="px-4 py-3.5 align-top text-right whitespace-nowrap">
                                    <div className="inline-flex items-center gap-2">
                                      <button
                                        type="button"
                                        onClick={() =>
                                          setEditingRowNumber(isEditing ? null : row.rowNumber)
                                        }
                                        className="inline-flex items-center gap-1 border border-beige px-2.5 py-1.5 text-[11px] font-medium text-charcoal hover:border-charcoal cursor-pointer"
                                      >
                                        <Pencil className="h-3 w-3" aria-hidden="true" />
                                        <span>{isEditing ? 'Close' : 'Edit'}</span>
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleToggleSkipRow(row.rowNumber)}
                                        className="border border-beige px-2.5 py-1.5 text-[11px] font-medium text-charcoal-soft hover:border-charcoal hover:text-charcoal cursor-pointer"
                                      >
                                        {row.skipped ? 'Include' : 'Skip'}
                                      </button>
                                    </div>
                                  </td>
                                </tr>

                                {/* Inline Row Correction Drawer */}
                                {isEditing && (
                                  <tr className="bg-cream-dark/50">
                                    <td colSpan={8} className="p-5">
                                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                        <div>
                                          <label className="block text-[11px] uppercase tracking-wider text-taupe">
                                            Product ID (required)
                                          </label>
                                          <input
                                            type="text"
                                            value={row.raw.id}
                                            onChange={(e) =>
                                              handleUpdateRawField(row.rowNumber, 'id', e.target.value)
                                            }
                                            className="mt-1 w-full border border-beige bg-cream px-3 py-2 text-xs text-charcoal focus:border-charcoal focus:outline-none"
                                          />
                                        </div>
                                        <div>
                                          <label className="block text-[11px] uppercase tracking-wider text-taupe">
                                            Product Name (required)
                                          </label>
                                          <input
                                            type="text"
                                            value={row.raw.name}
                                            onChange={(e) =>
                                              handleUpdateRawField(row.rowNumber, 'name', e.target.value)
                                            }
                                            className="mt-1 w-full border border-beige bg-cream px-3 py-2 text-xs text-charcoal focus:border-charcoal focus:outline-none"
                                          />
                                        </div>
                                        <div>
                                          <label className="block text-[11px] uppercase tracking-wider text-taupe">
                                            Category (required)
                                          </label>
                                          <select
                                            value={row.normalized.category || row.raw.category}
                                            onChange={(e) =>
                                              handleUpdateRawField(row.rowNumber, 'category', e.target.value)
                                            }
                                            className="mt-1 w-full border border-beige bg-cream px-3 py-2 text-xs text-charcoal focus:border-charcoal focus:outline-none"
                                          >
                                            <option value="">Select category...</option>
                                            {CATEGORIES.map((c) => (
                                              <option key={c.slug} value={c.slug}>
                                                {c.name}
                                              </option>
                                            ))}
                                          </select>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
                                          <div>
                                            <label className="block text-[11px] uppercase tracking-wider text-taupe">
                                              Price
                                            </label>
                                            <input
                                              type="text"
                                              value={row.raw.price}
                                              onChange={(e) =>
                                                handleUpdateRawField(row.rowNumber, 'price', e.target.value)
                                              }
                                              placeholder="48.00"
                                              className="mt-1 w-full border border-beige bg-cream px-3 py-2 text-xs text-charcoal focus:border-charcoal focus:outline-none"
                                            />
                                          </div>
                                          <div>
                                            <label className="block text-[11px] uppercase tracking-wider text-taupe">
                                              Currency
                                            </label>
                                            <input
                                              type="text"
                                              value={row.raw.currency}
                                              onChange={(e) =>
                                                handleUpdateRawField(row.rowNumber, 'currency', e.target.value)
                                              }
                                              placeholder="USD"
                                              className="mt-1 w-full border border-beige bg-cream px-3 py-2 text-xs text-charcoal focus:border-charcoal focus:outline-none"
                                            />
                                          </div>
                                        </div>
                                        <div className="sm:col-span-2">
                                          <label className="block text-[11px] uppercase tracking-wider text-taupe">
                                            Image URL (required)
                                          </label>
                                          <input
                                            type="url"
                                            value={row.raw.image_url}
                                            onChange={(e) =>
                                              handleUpdateRawField(row.rowNumber, 'image_url', e.target.value)
                                            }
                                            className="mt-1 w-full border border-beige bg-cream px-3 py-2 text-xs text-charcoal focus:border-charcoal focus:outline-none"
                                          />
                                        </div>
                                        <div className="sm:col-span-2">
                                          <label className="block text-[11px] uppercase tracking-wider text-taupe">
                                            Affiliate URL (required)
                                          </label>
                                          <input
                                            type="url"
                                            value={row.raw.affiliate_url}
                                            onChange={(e) =>
                                              handleUpdateRawField(row.rowNumber, 'affiliate_url', e.target.value)
                                            }
                                            className="mt-1 w-full border border-beige bg-cream px-3 py-2 text-xs text-charcoal focus:border-charcoal focus:outline-none"
                                          />
                                        </div>
                                        <div className="sm:col-span-2 lg:col-span-4">
                                          <label className="block text-[11px] uppercase tracking-wider text-taupe">
                                            Description (optional)
                                          </label>
                                          <input
                                            type="text"
                                            value={row.raw.description}
                                            onChange={(e) =>
                                              handleUpdateRawField(row.rowNumber, 'description', e.target.value)
                                            }
                                            className="mt-1 w-full border border-beige bg-cream px-3 py-2 text-xs text-charcoal focus:border-charcoal focus:outline-none"
                                          />
                                        </div>
                                      </div>
                                    </td>
                                  </tr>
                                )}
                              </React.Fragment>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: LIVE FIRESTORE CATALOG MANAGER */}
            {activeTab === 'catalog' && (
              <div className="space-y-6">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                  <input
                    type="search"
                    value={catalogSearch}
                    onChange={(e) => setCatalogSearch(e.target.value)}
                    placeholder="Filter live Firestore products by ID, name, or category..."
                    className="w-full max-w-md border border-beige bg-cream-dark/50 px-4 py-2.5 text-sm text-charcoal placeholder:text-taupe focus:border-charcoal focus:bg-cream focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleDownloadCurrentProducts}
                    className="inline-flex items-center gap-2 border border-taupe-light px-4 py-2.5 text-xs font-medium uppercase tracking-wider text-charcoal hover:border-charcoal cursor-pointer"
                  >
                    <Download className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Export CSV</span>
                  </button>
                </div>

                {filteredLiveCatalog.length === 0 ? (
                  <div className="border border-beige bg-cream-dark/40 p-12 text-center">
                    <h2 className="font-editorial text-2xl font-medium text-charcoal">
                      No Live Products in Cloud Firestore Yet
                    </h2>
                    <p className="mt-2 text-sm text-charcoal-soft">
                      Use the CSV Bulk Import tab to upload and publish products. Until then, the public storefront displays clearly labeled demo listings.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto border border-beige bg-cream">
                    <table className="w-full min-w-[820px] text-left text-xs">
                      <thead className="border-b border-beige bg-cream-dark/60 uppercase tracking-wider text-taupe">
                        <tr>
                          <th className="px-4 py-3 font-medium">ID</th>
                          <th className="px-4 py-3 font-medium">Product</th>
                          <th className="px-4 py-3 font-medium">Category</th>
                          <th className="px-4 py-3 font-medium">Price</th>
                          <th className="px-4 py-3 font-medium">Flags</th>
                          <th className="px-4 py-3 text-right font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-beige">
                        {filteredLiveCatalog.map((item) => (
                          <tr key={item.id}>
                            <td className="px-4 py-3 font-mono text-[11px] text-taupe">
                              {item.id}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                <PreviewThumb src={item.image} alt={item.name} />
                                <div>
                                  <p className="font-medium text-charcoal">{item.name}</p>
                                  <a
                                    href={item.affiliateUrl}
                                    target="_blank"
                                    rel="noopener noreferrer nofollow sponsored"
                                    className="text-[11px] text-taupe underline underline-offset-2 hover:text-charcoal"
                                  >
                                    Affiliate Link
                                  </a>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-charcoal-soft">{item.categoryLabel}</td>
                            <td className="px-4 py-3 tabular-nums text-charcoal">
                              {item.price
                                ? `${item.currency ? `${item.currency} ` : ''}${item.price}`
                                : 'Not set'}
                            </td>
                            <td className="px-4 py-3 text-charcoal-soft">
                              {[
                                item.isFeatured ? 'Featured' : null,
                                item.isTrending ? 'Trending' : null,
                              ]
                                .filter(Boolean)
                                .join(' · ') || 'Standard'}
                            </td>
                            <td className="px-4 py-3 text-right whitespace-nowrap">
                              {pendingDeleteId === item.id ? (
                                <div className="inline-flex items-center gap-2">
                                  <button
                                    type="button"
                                    disabled={deletingId === item.id}
                                    onClick={() => handleDeleteLiveProduct(item.id)}
                                    className="bg-charcoal px-2.5 py-1 text-[11px] font-medium text-cream hover:bg-charcoal-soft cursor-pointer"
                                  >
                                    {deletingId === item.id ? 'Removing...' : 'Confirm Delete'}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setPendingDeleteId(null)}
                                    className="border border-beige px-2.5 py-1 text-[11px] text-taupe hover:text-charcoal cursor-pointer"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => setPendingDeleteId(item.id)}
                                  className="inline-flex items-center gap-1 border border-beige px-2.5 py-1.5 text-[11px] text-charcoal-soft hover:border-charcoal hover:text-charcoal cursor-pointer"
                                >
                                  <Trash2 className="h-3 w-3" aria-hidden="true" />
                                  <span>Remove</span>
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: IMPORT AUDIT LOGS */}
            {activeTab === 'logs' && (
              <div>
                {importLogs.length === 0 ? (
                  <div className="border border-beige bg-cream-dark/40 p-12 text-center">
                    <h2 className="font-editorial text-2xl font-medium text-charcoal">
                      No Import Runs Recorded Yet
                    </h2>
                    <p className="mt-2 text-sm text-charcoal-soft">
                      Completed CSV bulk imports will automatically appear here with counts and timestamps.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto border border-beige bg-cream">
                    <table className="w-full min-w-[720px] text-left text-xs">
                      <thead className="border-b border-beige bg-cream-dark/60 uppercase tracking-wider text-taupe">
                        <tr>
                          <th className="px-4 py-3 font-medium">File</th>
                          <th className="px-4 py-3 font-medium">Total Rows</th>
                          <th className="px-4 py-3 font-medium">Imported</th>
                          <th className="px-4 py-3 font-medium">Skipped</th>
                          <th className="px-4 py-3 font-medium">Duplicates</th>
                          <th className="px-4 py-3 font-medium">Failed</th>
                          <th className="px-4 py-3 font-medium">Completed</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-beige tabular-nums">
                        {importLogs.map((log) => (
                          <tr key={log.id}>
                            <td className="px-4 py-3 font-medium text-charcoal">{log.fileName}</td>
                            <td className="px-4 py-3 text-charcoal-soft">{log.totalRows}</td>
                            <td className="px-4 py-3 font-medium text-charcoal">{log.importedCount}</td>
                            <td className="px-4 py-3 text-charcoal-soft">{log.skippedCount}</td>
                            <td className="px-4 py-3 text-charcoal-soft">{log.duplicateCount}</td>
                            <td className="px-4 py-3 text-charcoal-soft">{log.failedCount}</td>
                            <td className="px-4 py-3 text-taupe">
                              {log.createdAtMs ? new Date(log.createdAtMs).toLocaleString() : 'Just now'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

const PreviewThumb: React.FC<{ src: string; alt: string }> = ({ src, alt }) => {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div className="flex h-10 w-14 shrink-0 items-center justify-center border border-beige bg-cream-dark text-taupe">
        <ImageOff className="h-3.5 w-3.5" aria-hidden="true" />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className="h-10 w-14 shrink-0 border border-beige bg-cream-dark object-cover"
    />
  );
};

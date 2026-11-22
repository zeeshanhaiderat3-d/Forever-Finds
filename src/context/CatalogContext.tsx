import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  User,
} from 'firebase/auth';
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  query,
  Timestamp,
  where,
} from 'firebase/firestore';
import { PRODUCTS as DEMO_PRODUCTS } from '../data/products';
import {
  auth,
  BOOTSTRAPPED_ADMIN_EMAILS,
  db,
  handleFirestoreError,
  isFirebaseConfigured,
  OperationType,
  testConnection,
} from '../lib/firebase';
import {
  CategorySlug,
  FirebaseConnectionState,
  ImportLogEntry,
  Product,
} from '../types';

interface CatalogContextValue {
  products: Product[];
  firestoreProducts: Product[];
  importLogs: ImportLogEntry[];
  isUsingDemoCatalog: boolean;
  catalogLoading: boolean;
  connectionState: FirebaseConnectionState;
  user: User | null;
  authLoading: boolean;
  isAdmin: boolean;
  authError: string;
  signInWithGoogle: () => Promise<void>;
  signOutAdmin: () => Promise<void>;
}

const CatalogContext = createContext<CatalogContextValue | undefined>(undefined);

function timestampToMs(ts: unknown): number {
  if (ts instanceof Timestamp) return ts.toMillis();
  if (ts && typeof ts === 'object' && 'toMillis' in ts && typeof (ts as { toMillis: unknown }).toMillis === 'function') {
    return (ts as { toMillis: () => number }).toMillis();
  }
  return 0;
}

export const CatalogProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [connectionState, setConnectionState] = useState<FirebaseConnectionState>('checking');
  const [firestoreProducts, setFirestoreProducts] = useState<Product[]>([]);
  const [importLogs, setImportLogs] = useState<ImportLogEntry[]>([]);
  const [catalogLoading, setCatalogLoading] = useState<boolean>(isFirebaseConfigured());
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(isFirebaseConfigured());
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string>('');

  // Verify Firestore connection on initial mount
  useEffect(() => {
    let active = true;
    testConnection().then((status) => {
      if (!active) return;
      if (status === 'not-configured') {
        setConnectionState('not-configured');
        setCatalogLoading(false);
        setAuthLoading(false);
      } else if (status === 'offline') {
        setConnectionState('configured-offline');
        setCatalogLoading(false);
      } else {
        setConnectionState('configured-online');
      }
    });
    return () => {
      active = false;
    };
  }, []);

  // Listen to Firebase Auth state and verify administrator authorization
  useEffect(() => {
    if (!isFirebaseConfigured() || !auth) {
      setAuthLoading(false);
      setIsAdmin(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (!firebaseUser) {
        setIsAdmin(false);
        setAuthLoading(false);
        return;
      }

      const email = (firebaseUser.email ?? '').toLowerCase();
      const verified = firebaseUser.emailVerified;

      if (verified && BOOTSTRAPPED_ADMIN_EMAILS.includes(email)) {
        setIsAdmin(true);
        setAuthLoading(false);
        return;
      }

      if (verified && db) {
        try {
          const adminDoc = await getDoc(doc(db, 'admins', firebaseUser.uid));
          setIsAdmin(adminDoc.exists());
        } catch {
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Subscribe to published products from Cloud Firestore
  useEffect(() => {
    if (!isFirebaseConfigured() || !db) {
      setCatalogLoading(false);
      return;
    }

    const productsQuery = query(
      collection(db, 'products'),
      where('status', '==', 'published')
    );

    const unsubscribe = onSnapshot(
      productsQuery,
      (snapshot) => {
        const loaded: Product[] = snapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          const price = typeof data.price === 'string' ? data.price : '';
          const currency = typeof data.currency === 'string' ? data.currency : '';
          const formattedPrice = price
            ? `${currency ? `${currency} ` : ''}${price}`
            : 'Check Retailer for Price';

          return {
            id: String(data.id ?? docSnap.id),
            name: String(data.name ?? ''),
            category: String(data.category ?? 'home-kitchen') as CategorySlug,
            categoryLabel: String(data.categoryLabel ?? ''),
            shortDescription: String(data.description ?? ''),
            pricePlaceholder: formattedPrice,
            price,
            currency,
            affiliateUrl: String(data.affiliateUrl ?? ''),
            originalUrl: typeof data.originalUrl === 'string' ? data.originalUrl : '',
            image: String(data.imageUrl ?? ''),
            imageAlt: `${String(data.name ?? 'Product')} — ${String(data.categoryLabel ?? '')}`,
            isDemo: false,
            isFeatured: Boolean(data.featured),
            isTrending: Boolean(data.trending),
            isEditorPick: Boolean(data.featured && data.trending),
            createdAtMs: timestampToMs(data.createdAt),
          };
        });

        loaded.sort((a, b) => (b.createdAtMs ?? 0) - (a.createdAtMs ?? 0));
        setFirestoreProducts(loaded);
        setCatalogLoading(false);
      },
      (error) => {
        setCatalogLoading(false);
        handleFirestoreError(error, OperationType.LIST, 'products');
      }
    );

    return () => unsubscribe();
  }, []);

  // Subscribe to import logs only when auth is ready and user is an authorized admin
  useEffect(() => {
    if (!isFirebaseConfigured() || !db || authLoading || !user || !isAdmin) {
      setImportLogs([]);
      return;
    }

    const unsubscribe = onSnapshot(
      collection(db, 'import_logs'),
      (snapshot) => {
        const logs: ImportLogEntry[] = snapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          return {
            id: String(data.id ?? docSnap.id),
            fileName: String(data.fileName ?? ''),
            totalRows: Number(data.totalRows ?? 0),
            importedCount: Number(data.importedCount ?? 0),
            skippedCount: Number(data.skippedCount ?? 0),
            duplicateCount: Number(data.duplicateCount ?? 0),
            failedCount: Number(data.failedCount ?? 0),
            importedBy: String(data.importedBy ?? ''),
            createdAtMs: timestampToMs(data.createdAt),
          };
        });
        logs.sort((a, b) => b.createdAtMs - a.createdAtMs);
        setImportLogs(logs);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'import_logs');
      }
    );

    return () => unsubscribe();
  }, [authLoading, user, isAdmin]);

  const signInWithGoogle = useCallback(async () => {
    setAuthError('');
    if (!auth) {
      setAuthError('Firebase Authentication is not configured in this environment.');
      return;
    }
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      await signInWithPopup(auth, provider);
    } catch (error) {
      const msg =
        error instanceof Error ? error.message : 'Unable to complete Google sign-in.';
      setAuthError(msg);
    }
  }, []);

  const signOutAdmin = useCallback(async () => {
    if (!auth) return;
    setAuthError('');
    await signOut(auth);
  }, []);

  const isUsingDemoCatalog = firestoreProducts.length === 0;
  const products = isUsingDemoCatalog ? DEMO_PRODUCTS : firestoreProducts;

  return (
    <CatalogContext.Provider
      value={{
        products,
        firestoreProducts,
        importLogs,
        isUsingDemoCatalog,
        catalogLoading,
        connectionState,
        user,
        authLoading,
        isAdmin,
        authError,
        signInWithGoogle,
        signOutAdmin,
      }}
    >
      {children}
    </CatalogContext.Provider>
  );
};

export function useCatalog(): CatalogContextValue {
  const ctx = useContext(CatalogContext);
  if (!ctx) {
    throw new Error('useCatalog must be used within a CatalogProvider');
  }
  return ctx;
}

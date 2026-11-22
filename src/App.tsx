import { useCallback, useEffect, useState } from 'react';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Footer } from './components/Footer';
import { Navbar } from './components/Navbar';
import { CatalogProvider } from './context/CatalogContext';
import { getPageIdFromPath, PAGE_METADATA } from './data/pages';
import { AboutPage } from './pages/AboutPage';
import { AdminImportPage } from './pages/AdminImportPage';
import { CatalogPage } from './pages/CatalogPage';
import { ContactPage } from './pages/ContactPage';
import { HomePage } from './pages/HomePage';
import { LegalPage } from './pages/LegalPage';
import { PageId } from './types';

export default function App() {
  const [currentPage, setCurrentPage] = useState<PageId>(() =>
    getPageIdFromPath(window.location.pathname)
  );

  // Sync browser back/forward navigation
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPage(getPageIdFromPath(window.location.pathname));
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Update document title and meta description dynamically for SEO
  useEffect(() => {
    const meta = PAGE_METADATA[currentPage];
    document.title = meta.title;

    const descriptionTag = document.querySelector('meta[name="description"]');
    if (descriptionTag) {
      descriptionTag.setAttribute('content', meta.metaDescription);
    }
    const ogTitleTag = document.querySelector('meta[property="og:title"]');
    if (ogTitleTag) {
      ogTitleTag.setAttribute('content', meta.title);
    }
    const ogDescTag = document.querySelector('meta[property="og:description"]');
    if (ogDescTag) {
      ogDescTag.setAttribute('content', meta.metaDescription);
    }
  }, [currentPage]);

  const navigate = useCallback((page: PageId) => {
    const targetPath = PAGE_METADATA[page].path;
    if (window.location.pathname !== targetPath) {
      window.history.pushState({}, '', targetPath);
    }
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage onNavigate={navigate} />;
      case 'catalog':
        return <CatalogPage mode="catalog" onNavigate={navigate} />;
      case 'trending':
        return <CatalogPage mode="trending" onNavigate={navigate} />;
      case 'beauty-personal-care':
      case 'fashion-accessories':
      case 'home-kitchen':
      case 'electronics-gadgets':
      case 'lifestyle-wellness':
        return <CatalogPage mode={currentPage} onNavigate={navigate} />;
      case 'about':
        return <AboutPage onNavigate={navigate} />;
      case 'contact':
        return <ContactPage onNavigate={navigate} />;
      case 'affiliate-disclosure':
      case 'privacy-policy':
      case 'terms-conditions':
        return <LegalPage page={currentPage} onNavigate={navigate} />;
      case 'admin-import':
        return <AdminImportPage onNavigate={navigate} />;
      default:
        return <HomePage onNavigate={navigate} />;
    }
  };

  return (
    <ErrorBoundary>
      <CatalogProvider>
        <div className="flex min-h-screen flex-col bg-cream text-charcoal">
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:bg-charcoal focus:px-4 focus:py-2 focus:text-xs focus:font-medium focus:text-cream"
          >
            Skip to content
          </a>

          <Navbar currentPage={currentPage} onNavigate={navigate} />

          <main id="main-content" className="flex-1">
            {renderPage()}
          </main>

          <Footer onNavigate={navigate} />
        </div>
      </CatalogProvider>
    </ErrorBoundary>
  );
}

import { PageId, PageMeta } from '../types';

export const PAGE_METADATA: Record<PageId, PageMeta> = {
  home: {
    id: 'home',
    path: '/',
    title: 'Forever Finds — Your Everyday Finds, All in One Place',
    metaDescription:
      'Discover your next favorite find with Forever Finds. Thoughtfully curated minimalist products across beauty, fashion, home, electronics, and wellness.',
  },
  catalog: {
    id: 'catalog',
    path: '/finds',
    title: 'All Curated Finds | Forever Finds',
    metaDescription:
      'Browse all curated finds across Beauty, Fashion, Home & Kitchen, Electronics, and Lifestyle & Wellness for USA, UK, and Canada.',
  },
  trending: {
    id: 'trending',
    path: '/trending-finds',
    title: 'Trending Finds | Forever Finds',
    metaDescription:
      'Explore the latest trending finds and editor selections curated by Forever Finds for everyday modern living.',
  },
  'beauty-personal-care': {
    id: 'beauty-personal-care',
    path: '/beauty-personal-care',
    title: 'Beauty & Personal Care | Forever Finds',
    metaDescription:
      'Explore curated minimalist skincare, botanical serums, and daily personal care finds selected for USA, UK, and Canada shoppers.',
  },
  'fashion-accessories': {
    id: 'fashion-accessories',
    path: '/fashion-accessories',
    title: 'Fashion & Accessories | Forever Finds',
    metaDescription:
      'Discover timeless wardrobe staples, leather carryalls, cashmere layers, and classic eyewear curated by Forever Finds.',
  },
  'home-kitchen': {
    id: 'home-kitchen',
    path: '/home-kitchen',
    title: 'Home & Kitchen | Forever Finds',
    metaDescription:
      'Shop thoughtfully curated stoneware, ambient lighting, and minimalist home essentials from Forever Finds.',
  },
  'electronics-gadgets': {
    id: 'electronics-gadgets',
    path: '/electronics-gadgets',
    title: 'Electronics & Gadgets | Forever Finds',
    metaDescription:
      'Browse refined audio gear, wireless chargers, and modern workspace accessories curated by Forever Finds.',
  },
  'lifestyle-wellness': {
    id: 'lifestyle-wellness',
    path: '/lifestyle-wellness',
    title: 'Lifestyle & Wellness | Forever Finds',
    metaDescription:
      'Curated journals, ceramic diffusers, and calm daily wellness essentials from Forever Finds.',
  },
  about: {
    id: 'about',
    path: '/about-us',
    title: 'About Us | Forever Finds',
    metaDescription:
      'Learn about Forever Finds, our luxury minimalist curation philosophy, and how we serve readers in the USA, UK, and Canada.',
  },
  contact: {
    id: 'contact',
    path: '/contact-us',
    title: 'Contact Us | Forever Finds',
    metaDescription:
      'Get in touch with the Forever Finds editorial and partnerships team for inquiries across the USA, UK, and Canada.',
  },
  'affiliate-disclosure': {
    id: 'affiliate-disclosure',
    path: '/affiliate-disclosure',
    title: 'Affiliate Disclosure | Forever Finds',
    metaDescription:
      'Read our transparent affiliate disclosure explaining how Forever Finds earns commissions on qualifying purchases.',
  },
  'privacy-policy': {
    id: 'privacy-policy',
    path: '/privacy-policy',
    title: 'Privacy Policy | Forever Finds',
    metaDescription:
      'Review how Forever Finds handles newsletter subscriptions, contact inquiries, cookies, and outbound partner links.',
  },
  'terms-conditions': {
    id: 'terms-conditions',
    path: '/terms-conditions',
    title: 'Terms & Conditions | Forever Finds',
    metaDescription:
      'Read the Forever Finds terms and conditions governing editorial content, affiliate links, and merchant listings.',
  },
  'admin-import': {
    id: 'admin-import',
    path: '/admin/import',
    title: 'Admin Bulk Product Import | Forever Finds',
    metaDescription:
      'Protected administrator console for bulk CSV product validation, preview, and Cloud Firestore catalog management.',
  },
};

export function getPageIdFromPath(pathname: string): PageId {
  const normalized = pathname.replace(/\/+$/, '') || '/';
  if (normalized === '/admin') {
    return 'admin-import';
  }
  const match = (Object.values(PAGE_METADATA) as PageMeta[]).find(
    (meta) => meta.path === normalized
  );
  return match ? match.id : 'home';
}

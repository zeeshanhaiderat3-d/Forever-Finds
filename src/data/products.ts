import { CategoryInfo, Product } from '../types';

/**
 * ============================================================================
 * FOREVER FINDS — PRODUCT & CATEGORY DATA
 * ============================================================================
 * How to update products:
 * 1. Replace `affiliateUrl` with your verified affiliate tracking URL.
 * 2. Update `name`, `shortDescription`, and `image` as needed.
 * 3. Replace `pricePlaceholder` with verified partner pricing or dynamic feed copy.
 * 4. Set `isDemo: false` once real affiliate links and verified product details
 *    are in place.
 * ============================================================================
 */

export const HERO_IMAGE = '/src/assets/images/hero_editorial_living_1795267676410.jpg';

export const CATEGORIES: CategoryInfo[] = [
  {
    slug: 'beauty-personal-care',
    name: 'Beauty & Personal Care',
    shortName: 'Beauty',
    kicker: '01. Ritual & Radiance',
    description:
      'Refined botanical formulations, minimalist skincare vessels, and gentle daily grooming essentials curated for calm morning routines.',
    image: '/src/assets/images/cat_beauty_skincare_1795267676840.jpg',
    imageAlt: 'Minimalist amber and frosted glass skincare dropper bottles on natural travertine stone',
  },
  {
    slug: 'fashion-accessories',
    name: 'Fashion & Accessories',
    shortName: 'Fashion',
    kicker: '02. Wardrobe Foundations',
    description:
      'Timeless silhouettes, supple neutral leather carryalls, fine knitwear, and understated accents designed to outlast seasonal trends.',
    image: '/src/assets/images/cat_fashion_accessories_1795267678221.jpg',
    imageAlt: 'Structured taupe pebbled leather tote bag, tortoiseshell sunglasses, and ivory silk scarf on linen',
  },
  {
    slug: 'home-kitchen',
    name: 'Home & Kitchen',
    shortName: 'Home & Kitchen',
    kicker: '03. Tactile Spaces',
    description:
      'Sculptural lighting, stoneware dining pieces, and quiet architectural objects crafted to bring warmth and utility to modern interiors.',
    image: '/src/assets/images/cat_home_kitchen_1795267676119.jpg',
    imageAlt: 'Matte stoneware pour-over coffee carafe, ceramic cups, and brushed bronze spoons on limestone',
  },
  {
    slug: 'electronics-gadgets',
    name: 'Electronics & Gadgets',
    shortName: 'Electronics',
    kicker: '04. Considered Tech',
    description:
      'Quietly engineered audio, desk accessories, and everyday wireless hardware finished in restrained matte metals and natural stone.',
    image: '/src/assets/images/cat_electronics_gadgets_1795267677274.jpg',
    imageAlt: 'Matte charcoal wireless over-ear headphones beside a circular travertine wireless charger',
  },
  {
    slug: 'lifestyle-wellness',
    name: 'Lifestyle & Wellness',
    shortName: 'Wellness',
    kicker: '05. Slow Living',
    description:
      'Mindful stationery, stone aroma diffusers, and restorative textiles selected to support unhurried focus and everyday balance.',
    image: '/src/assets/images/cat_lifestyle_wellness_1795267677933.jpg',
    imageAlt: 'Linen-bound journal, solid brass pen, ceramic diffuser, and dried botanical branch on plaster',
  },
];

export const PRODUCTS: Product[] = [
  // Beauty & Personal Care
  {
    id: 'ff-beauty-01',
    name: 'Botanical Glass Facial Serum Set',
    category: 'beauty-personal-care',
    categoryLabel: 'Beauty & Personal Care',
    shortDescription:
      'Placeholder demo entry showcasing minimalist apothecary dropper bottles for daily hydration routines.',
    pricePlaceholder: 'Price Placeholder · View at Retailer',
    ratingPlaceholder: 'Demo Listing · Unrated',
    affiliateUrl: 'https://example.com/affiliate-demo/botanical-facial-serum-set',
    image: '/src/assets/images/cat_beauty_skincare_1795267676840.jpg',
    imageAlt: 'Amber and frosted glass dropper bottles arranged on a travertine block',
    isDemo: true,
    isFeatured: true,
    isTrending: true,
    isEditorPick: true,
  },
  {
    id: 'ff-beauty-02',
    name: 'Restorative Barrier Night Balm',
    category: 'beauty-personal-care',
    categoryLabel: 'Beauty & Personal Care',
    shortDescription:
      'Placeholder demo product slot for a rich, fragrance-free evening moisturizer suited for sensitive skin.',
    pricePlaceholder: 'Price Placeholder · View at Retailer',
    ratingPlaceholder: 'Demo Listing · Unrated',
    affiliateUrl: 'https://example.com/affiliate-demo/restorative-barrier-balm',
    image: '/src/assets/images/cat_beauty_skincare_1795267676840.jpg',
    imageAlt: 'Minimalist glass skincare vessel on warm travertine surface',
    isDemo: true,
    isFeatured: false,
    isTrending: false,
    isEditorPick: true,
  },
  {
    id: 'ff-beauty-03',
    name: 'Cold-Pressed Rosehip Renewal Oil',
    category: 'beauty-personal-care',
    categoryLabel: 'Beauty & Personal Care',
    shortDescription:
      'Placeholder demo entry for lightweight botanical facial oil packaged in UV-protective amber glass.',
    pricePlaceholder: 'Price Placeholder · View at Retailer',
    affiliateUrl: 'https://example.com/affiliate-demo/rosehip-renewal-oil',
    image: '/src/assets/images/cat_beauty_skincare_1795267676840.jpg',
    imageAlt: 'Amber glass facial oil dropper bottle in soft morning daylight',
    isDemo: true,
    isTrending: true,
  },

  // Fashion & Accessories
  {
    id: 'ff-fashion-01',
    name: 'Structured Pebbled Leather Carryall Tote',
    category: 'fashion-accessories',
    categoryLabel: 'Fashion & Accessories',
    shortDescription:
      'Placeholder demo entry for an everyday architectural tote in warm taupe with subtle brushed hardware.',
    pricePlaceholder: 'Price Placeholder · View at Retailer',
    ratingPlaceholder: 'Demo Listing · Unrated',
    affiliateUrl: 'https://example.com/affiliate-demo/pebbled-leather-carryall',
    image: '/src/assets/images/cat_fashion_accessories_1795267678221.jpg',
    imageAlt: 'Warm taupe pebbled leather tote bag beside sunglasses and silk scarf',
    isDemo: true,
    isFeatured: true,
    isTrending: true,
    isEditorPick: true,
  },
  {
    id: 'ff-fashion-02',
    name: 'Oatmeal Ribbed Cashmere Travel Wrap',
    category: 'fashion-accessories',
    categoryLabel: 'Fashion & Accessories',
    shortDescription:
      'Placeholder demo entry for an oversized neutral knit wrap suited for transitional layering and travel.',
    pricePlaceholder: 'Price Placeholder · View at Retailer',
    ratingPlaceholder: 'Demo Listing · Unrated',
    affiliateUrl: 'https://example.com/affiliate-demo/oatmeal-cashmere-wrap',
    image: '/src/assets/images/prod_cashmere_wrap_1795267677359.jpg',
    imageAlt: 'Folded oatmeal beige cashmere knit wrap with fringe on travertine',
    isDemo: true,
    isFeatured: true,
    isTrending: true,
    isEditorPick: false,
  },
  {
    id: 'ff-fashion-03',
    name: 'Classic Tortoiseshell Acetate Frames',
    category: 'fashion-accessories',
    categoryLabel: 'Fashion & Accessories',
    shortDescription:
      'Placeholder demo slot for lightweight warm-toned sunglasses with understated keyhole bridge styling.',
    pricePlaceholder: 'Price Placeholder · View at Retailer',
    affiliateUrl: 'https://example.com/affiliate-demo/tortoiseshell-acetate-frames',
    image: '/src/assets/images/cat_fashion_accessories_1795267678221.jpg',
    imageAlt: 'Classic tortoiseshell sunglasses folded on natural woven linen',
    isDemo: true,
    isFeatured: false,
    isTrending: false,
  },

  // Home & Kitchen
  {
    id: 'ff-home-01',
    name: 'Artisanal Stoneware Pour-Over Carafe Set',
    category: 'home-kitchen',
    categoryLabel: 'Home & Kitchen',
    shortDescription:
      'Placeholder demo entry for a hand-thrown matte ceramic coffee dripper, carafe, and matching espresso cups.',
    pricePlaceholder: 'Price Placeholder · View at Retailer',
    ratingPlaceholder: 'Demo Listing · Unrated',
    affiliateUrl: 'https://example.com/affiliate-demo/stoneware-pourover-set',
    image: '/src/assets/images/cat_home_kitchen_1795267676119.jpg',
    imageAlt: 'Matte ceramic pour-over coffee maker and cups on limestone counter',
    isDemo: true,
    isFeatured: true,
    isTrending: true,
    isEditorPick: true,
  },
  {
    id: 'ff-home-02',
    name: 'Alabaster & Matte Charcoal Table Lamp',
    category: 'home-kitchen',
    categoryLabel: 'Home & Kitchen',
    shortDescription:
      'Placeholder demo entry for a sculpted stone-base bedside lamp engineered for soft warm ambient light.',
    pricePlaceholder: 'Price Placeholder · View at Retailer',
    ratingPlaceholder: 'Demo Listing · Unrated',
    affiliateUrl: 'https://example.com/affiliate-demo/alabaster-table-lamp',
    image: '/src/assets/images/prod_table_lamp_1795267676905.jpg',
    imageAlt: 'Sculptural alabaster stone and matte black shade table lamp on warm plinth',
    isDemo: true,
    isFeatured: true,
    isTrending: false,
    isEditorPick: true,
  },
  {
    id: 'ff-home-03',
    name: 'Hand-Built Travertine Console Vessel',
    category: 'home-kitchen',
    categoryLabel: 'Home & Kitchen',
    shortDescription:
      'Placeholder demo slot for a matte ceramic centerpiece vase and woven fringe throw pairing.',
    pricePlaceholder: 'Price Placeholder · View at Retailer',
    affiliateUrl: 'https://example.com/affiliate-demo/travertine-console-vessel',
    image: '/src/assets/images/hero_editorial_living_1795267676410.jpg',
    imageAlt: 'Matte beige ceramic vessel and folded throw on travertine console table',
    isDemo: true,
    isTrending: false,
  },

  // Electronics & Gadgets
  {
    id: 'ff-tech-01',
    name: 'Anodized Charcoal Wireless Headphones',
    category: 'electronics-gadgets',
    categoryLabel: 'Electronics & Gadgets',
    shortDescription:
      'Placeholder demo entry for closed-back acoustic over-ear headphones in brushed charcoal aluminum.',
    pricePlaceholder: 'Price Placeholder · View at Retailer',
    ratingPlaceholder: 'Demo Listing · Unrated',
    affiliateUrl: 'https://example.com/affiliate-demo/charcoal-wireless-headphones',
    image: '/src/assets/images/cat_electronics_gadgets_1795267677274.jpg',
    imageAlt: 'Matte charcoal wireless over-ear headphones on a beige desk surface',
    isDemo: true,
    isFeatured: true,
    isTrending: true,
    isEditorPick: true,
  },
  {
    id: 'ff-tech-02',
    name: 'Honed Travertine Wireless Charging Pad',
    category: 'electronics-gadgets',
    categoryLabel: 'Electronics & Gadgets',
    shortDescription:
      'Placeholder demo entry for a weighted natural stone desk charging pad with braided neutral cable.',
    pricePlaceholder: 'Price Placeholder · View at Retailer',
    ratingPlaceholder: 'Demo Listing · Unrated',
    affiliateUrl: 'https://example.com/affiliate-demo/travertine-charging-pad',
    image: '/src/assets/images/cat_electronics_gadgets_1795267677274.jpg',
    imageAlt: 'Circular travertine stone wireless charging pad next to matte headphones',
    isDemo: true,
    isFeatured: false,
    isTrending: true,
  },
  {
    id: 'ff-tech-03',
    name: 'Minimalist Brushed Aluminum Desk Dock',
    category: 'electronics-gadgets',
    categoryLabel: 'Electronics & Gadgets',
    shortDescription:
      'Placeholder demo slot for a compact USB-C hub designed to keep workspaces clutter-free and organized.',
    pricePlaceholder: 'Price Placeholder · View at Retailer',
    affiliateUrl: 'https://example.com/affiliate-demo/aluminum-desk-dock',
    image: '/src/assets/images/cat_electronics_gadgets_1795267677274.jpg',
    imageAlt: 'Minimalist workspace tech setup in neutral tones',
    isDemo: true,
    isFeatured: false,
    isTrending: false,
  },

  // Lifestyle & Wellness
  {
    id: 'ff-wellness-01',
    name: 'Linen Hardcover Daily Reflection Journal',
    category: 'lifestyle-wellness',
    categoryLabel: 'Lifestyle & Wellness',
    shortDescription:
      'Placeholder demo entry for an archival-paper lay-flat notebook bound in natural oatmeal linen.',
    pricePlaceholder: 'Price Placeholder · View at Retailer',
    ratingPlaceholder: 'Demo Listing · Unrated',
    affiliateUrl: 'https://example.com/affiliate-demo/linen-reflection-journal',
    image: '/src/assets/images/cat_lifestyle_wellness_1795267677933.jpg',
    imageAlt: 'Linen-bound hardcover journal open beside a brass pen and ceramic diffuser',
    isDemo: true,
    isFeatured: false,
    isTrending: true,
    isEditorPick: true,
  },
  {
    id: 'ff-wellness-02',
    name: 'Matte Ceramic Ultrasonic Aroma Diffuser',
    category: 'lifestyle-wellness',
    categoryLabel: 'Lifestyle & Wellness',
    shortDescription:
      'Placeholder demo entry for a whisper-quiet stone-textured diffuser created for calm living spaces.',
    pricePlaceholder: 'Price Placeholder · View at Retailer',
    ratingPlaceholder: 'Demo Listing · Unrated',
    affiliateUrl: 'https://example.com/affiliate-demo/ceramic-aroma-diffuser',
    image: '/src/assets/images/cat_lifestyle_wellness_1795267677933.jpg',
    imageAlt: 'Matte stone ceramic essential oil diffuser on cream plaster surface',
    isDemo: true,
    isFeatured: false,
    isTrending: true,
  },
  {
    id: 'ff-wellness-03',
    name: 'Machined Solid Brass Pocket Fountain Pen',
    category: 'lifestyle-wellness',
    categoryLabel: 'Lifestyle & Wellness',
    shortDescription:
      'Placeholder demo slot for a balanced solid brass writing instrument that develops a natural patina over time.',
    pricePlaceholder: 'Price Placeholder · View at Retailer',
    affiliateUrl: 'https://example.com/affiliate-demo/solid-brass-fountain-pen',
    image: '/src/assets/images/cat_lifestyle_wellness_1795267677933.jpg',
    imageAlt: 'Solid brass fountain pen resting on cream archival journal pages',
    isDemo: true,
    isFeatured: false,
    isTrending: false,
  },
];

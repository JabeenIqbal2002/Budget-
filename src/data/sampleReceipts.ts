export interface SampleReceipt {
  id: string;
  name: string;
  merchant: string;
  amount: number;
  imageAlt: string;
  imageUrl: string;
  date: string;
  classificationHint: 'Essential' | 'Luxury' | 'Split';
  items: Array<{
    name: string;
    description: string;
    price: number;
    category: 'Essential' | 'Luxury';
  }>;
}

export const SAMPLE_RECEIPTS: SampleReceipt[] = [
  {
    id: 'sample-whole-foods',
    name: 'Whole Foods Market',
    merchant: 'Whole Foods Market',
    amount: 68.45,
    date: 'Oct 23, 2024',
    classificationHint: 'Split',
    imageAlt: 'A clean paper grocery store receipt from Whole Foods Market on a warm minimalist wooden countertop',
    imageUrl: 'https://images.unsplash.com/photo-1554415707-9e4966779435?q=80&w=800&auto=format&fit=crop',
    items: [
      { name: 'Organic Produce & Greens', description: 'Kale, Avocado, Gala Apples', price: 34.20, category: 'Essential' },
      { name: 'Pinot Noir Reserve', description: 'Specialty beverage selection', price: 22.00, category: 'Luxury' },
      { name: 'Artisan Sourdough & Oats', description: 'Pantry & staple grocery', price: 12.25, category: 'Essential' },
    ],
  },
  {
    id: 'sample-blue-bottle',
    name: 'Blue Bottle Cafe',
    merchant: 'Blue Bottle Coffee',
    amount: 14.80,
    date: 'Oct 24, 2024',
    classificationHint: 'Luxury',
    imageAlt: 'Coffee receipt with espresso and pastry',
    imageUrl: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?q=80&w=800&auto=format&fit=crop',
    items: [
      { name: 'Bella Donovan Drip Coffee', description: 'Specialty blend', price: 5.80, category: 'Luxury' },
      { name: 'Almond Croissant', description: 'Bakery treat', price: 9.00, category: 'Luxury' },
    ],
  },
  {
    id: 'sample-cvs',
    name: 'CVS Pharmacy',
    merchant: 'CVS Pharmacy',
    amount: 31.50,
    date: 'Oct 22, 2024',
    classificationHint: 'Essential',
    imageAlt: 'Pharmacy healthcare receipt with medicine and wellness goods',
    imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=800&auto=format&fit=crop',
    items: [
      { name: 'Multivitamin Complex 90ct', description: 'Daily wellness staple', price: 18.50, category: 'Essential' },
      { name: 'Electrolyte Hydration Pack', description: 'Health aid', price: 13.00, category: 'Essential' },
    ],
  },
  {
    id: 'sample-nobu',
    name: 'Nobu Japanese Dining',
    merchant: 'Nobu Restaurant',
    amount: 142.00,
    date: 'Oct 20, 2024',
    classificationHint: 'Luxury',
    imageAlt: 'High-end restaurant dinner bill with itemized course breakdown',
    imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=800&auto=format&fit=crop',
    items: [
      { name: 'Black Cod with Miso', description: 'Signature dinner course', price: 68.00, category: 'Luxury' },
      { name: 'Yellowtail Jalapeno Sashimi', description: 'Appetizer course', price: 38.00, category: 'Luxury' },
      { name: 'Premium Junmai Daiginjo Sake', description: 'Specialty drink', price: 36.00, category: 'Luxury' },
    ],
  },
];

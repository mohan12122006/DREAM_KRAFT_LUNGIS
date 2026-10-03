import bcrypt from 'bcryptjs';
import { v4 as uuid } from 'uuid';

const localImage = path => `/images/${path}`;

export const categories = [
  { id: 1, name: 'Cotton Lungis', slug: 'cotton-lungis', description: 'Soft everyday cotton styles for all-season comfort.', imageUrl: localImage('categories/category-cotton-lungis.jpg') },
  { id: 2, name: 'Premium Lungis', slug: 'premium-lungis', description: 'Fine cotton, richer borders and refined finishes.', imageUrl: localImage('categories/category-premium-lungis.jpg') },
  { id: 3, name: 'Checked Lungis', slug: 'checked-lungis', description: 'Classic checks in breathable cotton colourways.', imageUrl: localImage('categories/category-checked-lungis.jpg') },
  { id: 4, name: 'Plain Lungis', slug: 'plain-lungis', description: 'Minimal traditional solids for relaxed daily wear.', imageUrl: localImage('categories/category-plain-lungis.jpg') },
  { id: 5, name: 'Traditional Collection', slug: 'traditional-collection', description: 'Heritage-inspired patterns and trusted comfort.', imageUrl: localImage('categories/category-traditional.jpg') },
  { id: 6, name: 'New Arrivals', slug: 'new-arrivals', description: 'Fresh colours, borders and seasonal picks.', imageUrl: localImage('categories/category-new-arrivals.jpg') },
  { id: 7, name: 'Best Sellers', slug: 'best-sellers', description: 'Customer-loved lungis chosen again and again.', imageUrl: localImage('categories/category-best-sellers.jpg') },
  { id: 8, name: 'Festival Collection', slug: 'festival-collection', description: 'Dressier traditional styles for festive moments.', imageUrl: localImage('categories/category-festival.jpg') }
];

const productBase = [
  ['Premium Blue Cotton Lungi', 'premium-blue-cotton-lungi', 1, 699, 499, 29, 4.8, 128, ['Blue', 'White'], true, true, true],
  ['Classic Checked Cotton Lungi', 'classic-checked-cotton-lungi', 3, 549, 399, 27, 4.6, 94, ['Blue', 'Green'], true, false, true],
  ['Premium Green Cotton Lungi', 'premium-green-cotton-lungi', 2, 749, 549, 27, 4.7, 82, ['Green', 'Gold'], true, true, false],
  ['Traditional White Lungi', 'traditional-white-lungi', 5, 599, 449, 25, 4.5, 76, ['White', 'Gold'], true, false, false],
  ['Soft Comfort Cotton Lungi', 'soft-comfort-cotton-lungi', 1, 649, 499, 23, 4.8, 116, ['Maroon', 'Blue'], true, false, true],
  ['Premium Border Lungi', 'premium-border-lungi', 2, 799, 599, 25, 4.9, 143, ['White', 'Maroon'], true, true, true],
  ['Festival Maroon Lungi', 'festival-maroon-lungi', 8, 899, 649, 28, 4.6, 51, ['Maroon', 'Gold'], false, true, false],
  ['Daily Plain Navy Lungi', 'daily-plain-navy-lungi', 4, 529, 379, 28, 4.4, 39, ['Navy', 'Blue'], false, false, false],
  ['Heritage Checked Green Lungi', 'heritage-checked-green-lungi', 3, 679, 479, 29, 4.7, 67, ['Green', 'White'], false, false, true],
  ['Temple Border White Lungi', 'temple-border-white-lungi', 5, 829, 599, 28, 4.8, 88, ['White', 'Red'], false, true, false]
];

export const products = productBase.map(([name, slug, categoryId, originalPrice, salePrice, discountPercentage, rating, reviewCount, colours, isFeatured, isNewArrival, isBestSeller], index) => ({
  id: index + 1,
  categoryId,
  categoryName: categories.find(category => category.id === categoryId).name,
  name,
  slug,
  description: `${name} is made with premium cotton fabric that stays soft, breathable and durable for daily traditional wear.`,
  fabric: 'Premium cotton',
  originalPrice,
  salePrice,
  discountPercentage,
  stockQuantity: index === 7 ? 0 : 34 + index * 7,
  rating,
  reviewCount,
  colours,
  isFeatured,
  isNewArrival,
  isBestSeller,
  createdAt: new Date(Date.now() - index * 86400000).toISOString(),
  images: (() => {
    const productImages = [
      ['blue-lungi-1.jpg', 'detail-blue-lungi.jpg', 'blue-lungi-2.jpg'],
      ['checked-lungi-1.jpg', 'detail-checked-lungi.jpg', 'green-lungi-1.jpg'],
      ['green-lungi-1.jpg', 'detail-blue-lungi.jpg', 'blue-lungi-2.jpg'],
      ['white-lungi-1.jpg', 'detail-border.jpg', 'premium-border-lungi.jpg'],
      ['blue-lungi-2.jpg', 'detail-blue-lungi.jpg', 'blue-lungi-1.jpg'],
      ['premium-border-lungi.jpg', 'detail-border.jpg', 'white-lungi-1.jpg'],
      ['brown-lungi.jpg', 'detail-border.jpg', 'premium-border-lungi.jpg'],
      ['black-lungi.jpg', 'detail-blue-lungi.jpg', 'brown-lungi.jpg'],
      ['green-lungi-1.jpg', 'detail-checked-lungi.jpg', 'checked-lungi-1.jpg'],
      ['white-lungi-1.jpg', 'detail-border.jpg', 'premium-border-lungi.jpg']
    ][index];
    return productImages.map((image, imageIndex) => ({
      imageUrl: localImage(`products/${image}`),
      altText: `${name} product image ${imageIndex + 1}`,
      sortOrder: imageIndex + 1
    }));
  })(),
  variants: colours.flatMap((colour, colourIndex) => ['2.0 m', '2.2 m'].map((sizeOrLength, sizeIndex) => ({
    id: `${index + 1}-${colourIndex}-${sizeIndex}`,
    productId: index + 1,
    colour,
    sizeOrLength,
    stockQuantity: 12 + sizeIndex,
    sku: `DKL-${index + 1}${colourIndex}${sizeIndex}`
  })))
}));

export const coupons = [
  { id: 1, code: 'FESTIVE30', description: 'Special Festival Offers', discountType: 'percentage', discountValue: 30, minimumOrderValue: 999, maximumDiscount: 300, isActive: true },
  { id: 2, code: 'FREEDEL', description: 'Free Delivery on Selected Orders', discountType: 'delivery', discountValue: 49, minimumOrderValue: 499, maximumDiscount: 49, isActive: true }
];

export const reviews = [
  { id: 1, userId: 1, productId: 1, orderItemId: 1, rating: 5, reviewText: 'Excellent quality and very comfortable for everyday use.', createdAt: '2026-08-10' },
  { id: 2, userId: 1, productId: 2, orderItemId: 2, rating: 4, reviewText: 'Soft cotton and neatly finished checks.', createdAt: '2026-08-12' }
];

export const users = [
  { id: 1, name: 'Demo Customer', email: 'demo@dreamkraftlungis.in', passwordHash: bcrypt.hashSync('Password123', 10), phone: '9876543210', role: 'customer', createdAt: new Date().toISOString() }
];
export const cartItems = [];
export const wishlists = [];
export const orders = [];
export const newsletterSubscribers = [];

export const createId = () => uuid();



export interface ToastNotification {
  message: string;
  link?: string;
  visible: boolean;
}

export type SortOption = 'price-low' | 'price-high' | 'name-asc' | 'name-desc';

export interface Product {
  id: string;
  title: string;
  description: string;
  category: string;
  originalCost: number;
  currentCost: number;
  imageUrl: string;
  tags: string[];
  inStock: boolean;
  featured?: boolean;
  createdAt?: any; // Firestore timestamp
}
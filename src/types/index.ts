export interface Product {
  id: number;
  title: string;
  description: string;
  originalCost: number;
  currentCost: number;
  category: string;
  tags: string[];
  imageUrl: string;
}

export interface ToastNotification {
  message: string;
  link?: string;
  visible: boolean;
}

export type SortOption = 'price-low' | 'price-high' | 'name-asc' | 'name-desc';
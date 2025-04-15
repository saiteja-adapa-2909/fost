// CartContext.tsx
import React, { createContext, useState, useContext, ReactNode } from 'react';
import { Product } from '../types';

// Define the CartItem type
export interface CartItem {
  product: Product;
  quantity: number;
  addons: Array<{name: string, price: number}>;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: Product, quantity: number, addons: Array<{name: string, price: number}>) => void;
  removeFromCart: (index: number) => void;
  updateQuantity: (index: number, newQuantity: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const addToCart = (product: Product, quantity: number, addons: Array<{name: string, price: number}>) => {
    // Check if product already exists in cart (with same addons)
    const existingItemIndex = cartItems.findIndex(item => {
      // Same product id
      if (item.product.id !== product.id) return false;
      
      // Same number of addons
      if (item.addons.length !== addons.length) return false;
      
      // Same addons
      for (const addon of addons) {
        if (!item.addons.some(a => a.name === addon.name)) {
          return false;
        }
      }
      
      return true;
    });

    if (existingItemIndex !== -1) {
      // Update existing item quantity
      const updatedCart = [...cartItems];
      updatedCart[existingItemIndex].quantity += quantity;
      setCartItems(updatedCart);
    } else {
      // Add new item
      setCartItems([...cartItems, { product, quantity, addons }]);
    }
  };

  const removeFromCart = (index: number) => {
    const updatedCart = [...cartItems];
    updatedCart.splice(index, 1);
    setCartItems(updatedCart);
  };

  const updateQuantity = (index: number, newQuantity: number) => {
    const updatedCart = [...cartItems];
    updatedCart[index].quantity = newQuantity;
    setCartItems(updatedCart);
  };

  const clearCart = () => {
    setCartItems([]);
  };

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, updateQuantity, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};
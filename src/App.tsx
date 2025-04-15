import React, { useState, useCallback } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navigation from './components/Navigation';
import Hero from './components/Hero';
import FeaturedProducts from './components/FeaturedProps'; // Import the new component
import ProductModal from './components/ProductModal';
import Toast from './components/Toast';
import Products from './pages/Products';
import ProductInput from './pages/Vendor/ProductInputForm';
import { Product, ToastNotification } from './types';
import CartPage from './pages/CartPage';

const App: React.FC = () => {
  const [activeSlide, setActiveSlide] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState<null | Product>(null);
  const [cartCount, setCartCount] = useState(3);
  const [toast, setToast] = useState<ToastNotification>({ message: '', visible: false });
  const [currentPage, setCurrentPage] = useState<'home' | 'products' | 'input'>('home');

  const showToast = useCallback((message: string, link?: string) => {
    setToast({ message, link, visible: true });
    setTimeout(() => {
      setToast(prev => ({ ...prev, visible: false }));
    }, 3000);
  }, []);

  const handleAddToCart = useCallback((product: Product, qty: number) => {
    setCartCount(prev => prev + qty);
    const total = (product.currentCost * qty).toFixed(2);
    showToast(
      `Added ${qty} ${qty === 1 ? 'unit' : 'units'} of ${product.title} - $${total}`,
      'View Cart'
    );
  }, [showToast]);

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setQuantity(1);
  };

  const closeModal = () => {
    setSelectedProduct(null);
  };

  const calculateOffer = (original: number, current: number) => {
    return Math.round(((original - current) / original) * 100);
  };

  const handleQuantityChange = (action: 'increase' | 'decrease') => {
    if (action === 'increase') {
      setQuantity(prev => prev + 1);
    } else if (action === 'decrease' && quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  const handleNavigationClick = (page: 'home' | 'products' | 'input') => {
    setCurrentPage(page);
  };

  // Home page component
  const HomePage = () => (
    <>
      <Hero />
      <FeaturedProducts 
        onProductClick={handleProductClick}
        calculateOffer={calculateOffer}
      />
    </>
  );

  return (
    <BrowserRouter>
      <div className="min-h-screen font-['Montserrat'] bg-gradient-to-br from-rose-50 via-white to-amber-50">
        <Navigation cartCount={cartCount} onNavigate={handleNavigationClick} currentPage={currentPage} />
        
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/products" element={<Products />} />
          <Route path="/input" element={<ProductInput />} />
          <Route path="/cart" element={<CartPage/>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        {selectedProduct && (
          <ProductModal
            product={selectedProduct}
            quantity={quantity}
            onClose={closeModal}
            onQuantityChange={handleQuantityChange}
            onAddToCart={handleAddToCart}
            calculateOffer={calculateOffer}
          />
        )}

        <Toast
          toast={toast}
          onClose={() => setToast(prev => ({ ...prev, visible: false }))}
        />
      </div>
    </BrowserRouter>
  );
};

export default App;
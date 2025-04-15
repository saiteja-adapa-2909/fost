import React, { useState, useCallback } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Navigation from './components/Navigation';
import Hero from './components/Hero';
import FeaturedProducts from './components/FeaturedProps'; // Import the new component
import ProductModal from './components/ProductModal';
import Toast from './components/Toast';
import Products from './pages/Products';
import ProductInput from './pages/Vendor/ProductInputForm';
import { Product, ToastNotification } from './types';
import CartPage from './pages/CartPage';
import { CartProvider, useCart } from './context/CartContext'; // Import the CartProvider and useCart hook
import Login from './auth/Login';
import Register from './auth/Register';
import ForgotPassword from './auth/forgot';
import { AuthProvider } from './context/AuthContext';

// Create a wrapper component that uses the cart context
const AppContent: React.FC = () => {
  const [activeSlide, setActiveSlide] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState<null | Product>(null);
  const [toast, setToast] = useState<ToastNotification>({ message: '', visible: false });
  const [currentPage, setCurrentPage] = useState<'home' | 'products' | 'input'>('home');
  const navigate = useNavigate();
  
  // Use the cart context
  const { cartItems, addToCart } = useCart();
  
  // Get cart count from cart items
  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  const showToast = useCallback((message: string, link?: string) => {
    setToast({ message, link, visible: true });
    setTimeout(() => {
      setToast(prev => ({ ...prev, visible: false }));
    }, 3000);
  }, []);

  const handleAddToCart = useCallback((product: Product, qty: number, addons: Array<{name: string, price: number}> = []) => {
    // Use the addToCart function from the context
    addToCart(product, qty, addons);
    
    // Calculate total including addons
    const addonTotal = addons.reduce((sum, addon) => sum + addon.price, 0);
    const unitPrice = product.currentCost + addonTotal;
    const total = (unitPrice * qty).toFixed(2);
    
    showToast(
      `Added ${qty} ${qty === 1 ? 'unit' : 'units'} of ${product.title} - $${total}`,
      'View Cart'
    );
  }, [showToast, addToCart]);

  const handleToastLinkClick = useCallback(() => {
    navigate('/cart');
    setToast(prev => ({ ...prev, visible: false }));
  }, [navigate]);

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
    <div className="min-h-screen font-['Montserrat'] bg-gradient-to-br from-rose-50 via-white to-amber-50">
      <Navigation cartCount={cartCount} onNavigate={handleNavigationClick} currentPage={currentPage} />
      
      <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot" element={<ForgotPassword />} />

        <Route path="/" element={<HomePage />} />
        <Route path="/products" element={<Products onProductClick={handleProductClick} />} />
        <Route path="/input" element={<ProductInput />} />
        <Route path="/cart" element={<CartPage />} />
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
        onLinkClick={handleToastLinkClick}
      />
    </div>
  );
};

// Main App component that wraps everything with the CartProvider
const App: React.FC = () => {
  return (
    <AuthProvider>
    <BrowserRouter>
      <CartProvider>
        <AppContent />
      </CartProvider>
    </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
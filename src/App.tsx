import React, { useState, useCallback, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import Navigation from './components/Navigation';
import Hero from './components/Hero';
import FeaturedProducts from './components/FeaturedProps';
import ProductModal from './components/ProductModal';
import Toast from './components/Toast';
import Products from './pages/Products';
import ProductInput from './pages/Vendor/ProductInputForm';
import { Product, ToastNotification } from './types';
import CartPage from './pages/CartPage';
import { CartProvider, useCart } from './context/CartContext';
import Login from './auth/Login';
import Register from './auth/Register';
import ForgotPassword from './auth/forgot';
import { AuthProvider, useAuth } from './context/AuthContext';
import OrderDashboard from './pages/Vendor/OrderDashboard';

// Admin Protected Route Component
const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { currentUser, loading } = useAuth();
  const location = useLocation();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(true);
  
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (loading) return;
      
      if (!currentUser) {
        setCheckingAdmin(false);
        return;
      }
      
      try {
        // Check if the user's email is the admin email
        if (currentUser.email === 'tejvellank@gmail.com') {
          console.log("Admin authenticated:", currentUser.email);
          setIsAdmin(true);
        } else {
          console.log("User not admin:", currentUser.email);
          setIsAdmin(false);
        }
      } catch (error) {
        console.error("Error checking admin status:", error);
        setIsAdmin(false);
      } finally {
        setCheckingAdmin(false);
      }
    };
    
    checkAdminStatus();
  }, [currentUser, loading]);
  
  if (loading || checkingAdmin) {
    // Show loading indicator while checking authentication
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <p className="text-lg font-medium mb-2">Loading...</p>
          <p className="text-sm text-gray-500">Verifying admin permissions</p>
        </div>
      </div>
    );
  }
  
  if (!currentUser) {
    console.log("User not logged in, redirecting to login");
    // Redirect to login if not logged in
    return <Navigate to="/login" state={{ from: location, adminRequired: true }} replace />;
  }
  
  if (!isAdmin) {
    console.log("User not admin, access denied:", currentUser.email);
    // Redirect to home if logged in but not admin
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="mb-6">
            You don't have administrator privileges to access this page. 
            Only admin users can access the vendor dashboard.
          </p>
          <button
            onClick={() => window.location.href = '/'}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Go to Homepage
          </button>
        </div>
      </div>
    );
  }
  
  // User is admin, render children
  return <>{children}</>;
};

// Modify Login component to handle admin redirect
// This is a wrapper for your existing Login component
const LoginWithRedirect = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  // After login, check if user should be redirected to admin page
  useEffect(() => {
    if (currentUser) {
      const state = location.state as { from?: Location, adminRequired?: boolean };
      const adminRequired = state?.adminRequired;
      
      if (adminRequired && currentUser.email === 'tejvellank@gmail.com') {
        navigate('/vendoradmin');
      } else if (state?.from) {
        navigate(state.from.pathname);
      } else {
        navigate('/');
      }
    }
  }, [currentUser, location, navigate]);
  
  return <Login />;
};

// Create a wrapper component that uses the cart context
const AppContent: React.FC = () => {
  const [activeSlide, setActiveSlide] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState<null | Product>(null);
  const [toast, setToast] = useState<ToastNotification>({ message: '', visible: false });
  const [currentPage, setCurrentPage] = useState<'home' | 'products' | 'input'>('home');
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  // Use the cart context
  const { cartItems, addToCart } = useCart();
  
  // Get cart count from cart items
  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  // Add admin link to navigation if user is admin
  useEffect(() => {
    if (currentUser?.email === 'tejvellank@gmail.com') {
      console.log("Admin user detected in main component");
    }
  }, [currentUser]);

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

  // Admin navigation option for admin user
  const AdminNav = () => {
    if (currentUser?.email === 'tejvellank@gmail.com') {
      return (
        <div className="fixed bottom-4 right-4 z-50">
          <button 
            onClick={() => navigate('/vendoradmin')}
            className="bg-blue-600 text-white px-4 py-2 rounded-full shadow-lg hover:bg-blue-700 flex items-center"
          >
            Admin Dashboard
          </button>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen font-['Montserrat'] bg-gradient-to-br from-rose-50 via-white to-amber-50">
      <Navigation cartCount={cartCount} onNavigate={handleNavigationClick} currentPage={currentPage} />
      
      <Routes>
        <Route path="/login" element={<LoginWithRedirect />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot" element={<ForgotPassword />} />
        
        {/* Protected Admin Route */}
        <Route 
          path="/vendoradmin" 
          element={
            <AdminRoute>
              <OrderDashboard />
            </AdminRoute>
          } 
        />

        <Route path="/" element={<HomePage />} />
        <Route path="/products" element={<Products onProductClick={handleProductClick} />} />
        <Route path="/input" element={<ProductInput />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Added Admin navigation button */}
      <AdminNav />

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
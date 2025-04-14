import React, { useState, useEffect, useCallback } from 'react';
import * as echarts from 'echarts';
import Navigation from './components/Navigation';
import Hero from './components/Hero';
import ProductCard from './components/ProductCard';
import ProductModal from './components/ProductModal';
import Toast from './components/Toast';
import Products from './pages/Products';
import { featuredProducts } from './data/products';
import { Product, ToastNotification } from './types';

const App: React.FC = () => {
  const [activeSlide, setActiveSlide] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState<null | Product>(null);
  const [cartCount, setCartCount] = useState(3);
  const [toast, setToast] = useState<ToastNotification>({ message: '', visible: false });
  const [currentPage, setCurrentPage] = useState<'home' | 'products'>('home');

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

  const handleNavigationClick = (page: 'home' | 'products') => {
    setCurrentPage(page);
  };

  useEffect(() => {
    const chartDom = document.getElementById('sales-chart');
    if (chartDom) {
      const myChart = echarts.init(chartDom);
      const option = {
        animation: false,
        title: {
          text: 'Monthly Sales 2025',
          left: 'center',
          textStyle: {
            fontFamily: 'Montserrat, sans-serif'
          }
        },
        tooltip: {
          trigger: 'axis'
        },
        xAxis: {
          type: 'category',
          data: ['Jan', 'Feb', 'Mar', 'Apr']
        },
        yAxis: {
          type: 'value'
        },
        series: [
          {
            name: 'Sales',
            type: 'bar',
            data: [1200, 1500, 1800, 2200],
            itemStyle: {
              color: '#FFD66B'
            }
          },
          {
            name: 'Growth',
            type: 'line',
            data: [1000, 1300, 1600, 2000],
            itemStyle: {
              color: '#FF9EAA'
            }
          }
        ],
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        }
      };
      myChart.setOption(option);

      const handleResize = () => {
        myChart.resize();
      };

      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
        myChart.dispose();
      };
    }
  }, []);

  return (
    <div className="min-h-screen font-['Montserrat'] bg-gradient-to-br from-rose-50 via-white to-amber-50">
      <Navigation cartCount={cartCount} onNavigate={handleNavigationClick} currentPage={currentPage} />
      
      {currentPage === 'home' ? (
        <>
          <Hero />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 bg-gradient-to-br from-white via-rose-50 to-white">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-800">Featured Products</h2>
              <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
                Discover our most popular juice varieties, made with premium fruits and no added sugar.
              </p>
            </div>
            <div className="mt-12 grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-8">
              {featuredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onProductClick={handleProductClick}
                  calculateOffer={calculateOffer}
                />
              ))}
            </div>
          </div>
        </>
      ) : (
        <Products />
      )}

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
  );
};

export default App;
import React from 'react';

interface NavigationProps {
  cartCount: number;
  onNavigate: (page: 'home' | 'products') => void;
  currentPage: 'home' | 'products';
}

const Navigation: React.FC<NavigationProps> = ({ cartCount, onNavigate, currentPage }) => {
  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center cursor-pointer" onClick={() => onNavigate('home')}>
              <span className="text-2xl font-bold text-[#FF9EAA]">Teja's</span>
              <span className="text-2xl font-bold text-[#FFD66B]">Juice</span>
            </div>
          </div>
          <div className="hidden md:flex items-center space-x-8">
            <button 
              onClick={() => onNavigate('home')}
              className={`text-gray-700 hover:text-[#FF9EAA] transition duration-300 font-medium ${
                currentPage === 'home' ? 'text-[#FF9EAA]' : ''
              }`}
            >
              Home
            </button>
            <button 
              onClick={() => onNavigate('products')}
              className={`text-gray-700 hover:text-[#FF9EAA] transition duration-300 font-medium ${
                currentPage === 'products' ? 'text-[#FF9EAA]' : ''
              }`}
            >
              Products
            </button>
            <a href="#" className="text-gray-700 hover:text-[#FF9EAA] transition duration-300 font-medium">About</a>
            <a href="#" className="text-gray-700 hover:text-[#FF9EAA] transition duration-300 font-medium">Contact</a>
          </div>
          <div className="flex items-center">
            <button className="p-2 rounded-full hover:bg-gray-100 transition duration-300 relative">
              <i className="fas fa-shopping-cart text-gray-700"></i>
              <span className="absolute -top-1 -right-1 bg-[#FF9EAA] text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {cartCount}
              </span>
            </button>
            <div className="ml-3 md:hidden">
              <button className="p-2 rounded-full hover:bg-gray-100 transition duration-300">
                <i className="fas fa-bars text-gray-700"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
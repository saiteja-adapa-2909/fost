import React from 'react';
import { Product } from '../types';

interface ProductModalProps {
  product: Product;
  quantity: number;
  onClose: () => void;
  onQuantityChange: (action: 'increase' | 'decrease') => void;
  onAddToCart: (product: Product, quantity: number) => void;
  calculateOffer: (original: number, current: number) => number;
}

const ProductModal: React.FC<ProductModalProps> = ({
  product,
  quantity,
  onClose,
  onQuantityChange,
  onAddToCart,
  calculateOffer,
}) => {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={onClose}
          className="mb-6 flex items-center text-gray-600 hover:text-gray-900"
        >
          <i className="fas fa-arrow-left mr-2"></i>
          Back to Products
        </button>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="aspect-square overflow-hidden rounded-lg bg-gray-100">
            <img
              src={product.imageUrl}
              alt={product.title}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex flex-col">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.title}</h1>
            <div className="flex items-center mb-4">
              <span className="text-3xl font-bold text-gray-900">${product.currentCost.toFixed(2)}</span>
              <span className="ml-3 text-xl text-gray-500 line-through">${product.originalCost.toFixed(2)}</span>
              <span className="ml-3 bg-[#FF9EAA] text-white px-3 py-1 rounded-full text-sm">
                {calculateOffer(product.originalCost, product.currentCost)}% OFF
              </span>
            </div>
            <p className="text-gray-600 text-lg mb-8">{product.description}</p>
            
            <div className="mb-8">
              <h3 className="text-xl font-semibold mb-4">Add-ons</h3>
              <div className="space-y-4 bg-gray-50 p-6 rounded-lg">
                <label className="flex items-center space-x-3">
                  <input type="checkbox" className="form-checkbox h-5 w-5 text-[#FF9EAA]" />
                  <span className="text-gray-700">Extra Vitamin Boost (+$1.99)</span>
                </label>
                <label className="flex items-center space-x-3">
                  <input type="checkbox" className="form-checkbox h-5 w-5 text-[#FF9EAA]" />
                  <span className="text-gray-700">Protein Powder (+$2.99)</span>
                </label>
                <label className="flex items-center space-x-3">
                  <input type="checkbox" className="form-checkbox h-5 w-5 text-[#FF9EAA]" />
                  <span className="text-gray-700">Chia Seeds (+$0.99)</span>
                </label>
                <label className="flex items-center space-x-3">
                  <input type="checkbox" className="form-checkbox h-5 w-5 text-[#FF9EAA]" />
                  <span className="text-gray-700">Honey (+$0.99)</span>
                </label>
              </div>
            </div>

            <div className="flex items-center mb-8">
              <span className="mr-4 text-gray-700">Quantity:</span>
              <div className="flex items-center border border-gray-300 rounded-md">
                <button
                  onClick={() => onQuantityChange('decrease')}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100"
                >
                  <i className="fas fa-minus"></i>
                </button>
                <span className="px-6 py-2 text-gray-700">{quantity}</span>
                <button
                  onClick={() => onQuantityChange('increase')}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100"
                >
                  <i className="fas fa-plus"></i>
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <button
                onClick={() => onAddToCart(product, quantity)}
                className="w-full bg-[#FF9EAA] text-white py-4 px-6 rounded-md hover:bg-[#ff8a9a] transition duration-300 text-lg font-semibold"
              >
                Add to Cart
              </button>
              <button 
                className="w-full bg-[#FFD66B] text-white py-4 px-6 rounded-md hover:bg-[#ffc038] transition duration-300 text-lg font-semibold"
              >
                Buy Now
              </button>
            </div>

            <div className="mt-8 space-y-3">
              <div className="flex items-center text-gray-600">
                <i className="fas fa-truck mr-3"></i>
                <span>Free shipping on orders over $50</span>
              </div>
              <div className="flex items-center text-gray-600">
                <i className="fas fa-undo mr-3"></i>
                <span>30-day money-back guarantee</span>
              </div>
            </div>

            <div className="mt-8">
              <h3 className="text-xl font-semibold mb-4">Product Details</h3>
              <div className="bg-gray-50 p-6 rounded-lg">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-gray-700">Category</h4>
                    <p className="text-gray-600 capitalize">{product.category}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-700">Tags</h4>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {product.tags.map(tag => (
                        <span 
                          key={tag}
                          className="px-2 py-1 bg-gray-200 text-gray-700 rounded-full text-sm"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductModal;
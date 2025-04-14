import React from 'react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onProductClick: (product: Product) => void;
  calculateOffer: (original: number, current: number) => number;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onProductClick, calculateOffer }) => {
  return (
    <div
      onClick={() => onProductClick(product)}
      className="group relative bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition duration-300 transform hover:scale-[1.02] cursor-pointer"
    >
      <div className="w-full min-h-80 aspect-square bg-gray-200 overflow-hidden">
        <img
          src={product.imageUrl}
          alt={product.title}
          className="w-full h-full object-center object-cover"
        />
      </div>
      <div className="p-4">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-medium text-gray-900">{product.title}</h3>
          <div className="bg-[#FF9EAA] text-white text-xs font-bold px-2 py-1 rounded-full">
            {calculateOffer(product.originalCost, product.currentCost)}% OFF
          </div>
        </div>
        <p className="mt-1 text-sm text-gray-500">{product.description}</p>
        <div className="mt-2 flex justify-between items-center">
          <div>
            <span className="text-lg font-bold text-gray-900">${product.currentCost.toFixed(2)}</span>
            <span className="ml-2 text-sm text-gray-500 line-through">${product.originalCost.toFixed(2)}</span>
          </div>
          <button className="p-2 rounded-full bg-[#FFD66B] text-white hover:bg-[#ffc038] transition duration-300">
            <i className="fas fa-shopping-cart"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
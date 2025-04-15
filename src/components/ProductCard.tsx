import React from "react";
import { Product } from "../types";

interface ProductCardProps {
  product: Product;
  onProductClick: (product: Product) => void;
  calculateOffer: (original: number, current: number) => number;
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onProductClick,
  calculateOffer,
}) => {
  return (
    <div
      onClick={() => onProductClick(product)}
      className="group relative bg-white rounded-lg overflow-hidden hover:shadow-lg transition duration-300 transform hover:scale-[1.02] cursor-pointer"
    >
      {/* Discount badge positioned at top right */}
      <div className="absolute top-2 right-2 z-10">
        <div className="bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
          {calculateOffer(product.originalCost, product.currentCost)}% OFF
        </div>
      </div>

      <div className="w-full min-h-80 aspect-square bg-white overflow-hidden flex items-center justify-center p-4">
        {/* Use mix-blend-mode for basic background removal effect */}
        <div className="relative w-3/4 h-full flex items-center justify-center">
          <img
            src={product.imageUrl}
            alt={product.title}
            className="object-contain max-h-full mix-blend-multiply"
            style={{
              filter: "contrast(1.1)",
              maxWidth: "100%",
            }}
          />
        </div>
      </div>

      <div className="p-4">
        {/* Title centered */}
        <h3 className="text-lg font-medium text-gray-900 text-left mb-3">
          {product.title}
        </h3>

        {/* Price and cart icon in a balanced layout */}
        <div className="mt-2 flex justify-between items-center">
          <div className="flex flex-col">
            <span className="text-lg font-bold text-gray-900">
              ${product.currentCost.toFixed(2)}
            </span>
            <span className="text-sm text-gray-500 line-through">
              ${product.originalCost.toFixed(2)}
            </span>
          </div>

          <button className="p-2 bg-gray-100 rounded-full hover:bg-green-100 transition duration-300 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;

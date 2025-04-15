import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase/config'; // Assuming you have a firebase config file
import ProductCard from '../components/ProductCard';
import { Product } from '../types';

interface FeaturedProductsProps {
  onProductClick: (product: Product) => void;
  calculateOffer: (original: number, current: number) => number;
}

const FeaturedProducts: React.FC<FeaturedProductsProps> = ({ onProductClick, calculateOffer }) => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      setLoading(true);
      try {
        // Create a query against the products collection where featured = true
        const q = query(collection(db, 'products'), where('featured', '==', true));
        const querySnapshot = await getDocs(q);
        
        const products: Product[] = [];
        querySnapshot.forEach((doc) => {
          // Convert Firestore document to Product type
          products.push({ 
            id: doc.id,
            title: doc.data().title,
            description: doc.data().description,
            imageUrl: doc.data().imageUrl,
            currentCost: doc.data().currentCost,
            originalCost: doc.data().originalCost,
            category: doc.data().category,
            tags: doc.data().tags || [],
            featured: doc.data().featured,
            inStock: doc.data().inStock
          });
        });
        
        setFeaturedProducts(products);
      } catch (err) {
        console.error("Error fetching featured products:", err);
        setError("Failed to load featured products. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 bg-gradient-to-br from-white via-rose-50 to-white">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-800">Featured Products</h2>
        <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
          Discover our most popular juice varieties, made with premium fruits and no added sugar.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-rose-500"></div>
        </div>
      ) : error ? (
        <div className="text-center py-10">
          <p className="text-red-500">{error}</p>
        </div>
      ) : featuredProducts.length > 0 ? (
        <div className="mt-12 grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
          {featuredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onProductClick={onProductClick}
              calculateOffer={calculateOffer}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-10">
          <p className="text-gray-500">No featured products found.</p>
        </div>
      )}
    </div>
  );
};

export default FeaturedProducts;
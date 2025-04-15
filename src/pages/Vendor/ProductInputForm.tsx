import React, { useState, useEffect } from 'react';
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAMPZ6IfJqYGNZD5GEud3yQNPOLUaxLDUk",
  authDomain: "fostweb.firebaseapp.com",
  projectId: "fostweb",
  storageBucket: "fostweb.firebasestorage.app",
  messagingSenderId: "563759291246",
  appId: "1:563759291246:web:9c273742aecd507eb6ff7f"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

const ProductInputForm = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    originalCost: 0,
    currentCost: 0,
    tags: '',
    inStock: true,
    featured: false
  });
  
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [categories, setCategories] = useState(['juice', 'smoothie', 'combo', 'seasonal']);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      const selectedImage = e.target.files[0];
      setImage(selectedImage);
      setImagePreview(URL.createObjectURL(selectedImage));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage({ text: '', type: '' });

    try {
      // Process tags
      const tagsList = formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag !== '');
      
      // Upload image to Firebase Storage
      let imageUrl = '';
      if (image) {
        const storageRef = ref(storage, `products/${Date.now()}_${image.name}`);
        const uploadResult = await uploadBytes(storageRef, image);
        imageUrl = await getDownloadURL(uploadResult.ref);
      }

      // Add document to Firestore
      const productData = {
        ...formData,
        tags: tagsList,
        originalCost: Number(formData.originalCost),
        currentCost: Number(formData.currentCost),
        imageUrl,
        createdAt: new Date(),
      };

      await addDoc(collection(db, "products"), productData);
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        category: '',
        originalCost: 0,
        currentCost: 0,
        tags: '',
        inStock: true,
        featured: false
      });
      setImage(null);
      setImagePreview('');
      setMessage({ text: 'Product added successfully!', type: 'success' });
    } catch (error) {
      console.error("Error adding product: ", error);
      setMessage({ text: `Error: ${error.message}`, type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <h2 className="text-2xl font-bold mb-6 text-gray-900">Add New Product</h2>
      
      {message.text && (
        <div className={`mb-4 p-3 rounded ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {message.text}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Product Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-[#FF9EAA] focus:border-[#FF9EAA]"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-[#FF9EAA] focus:border-[#FF9EAA]"
              required
            >
              <option value="">Select Category</option>
              {categories.map(category => (
                <option key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Original Price</label>
            <input
              type="number"
              name="originalCost"
              value={formData.originalCost}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-[#FF9EAA] focus:border-[#FF9EAA]"
              min="0"
              step="0.01"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Current Price</label>
            <input
              type="number"
              name="currentCost"
              value={formData.currentCost} 
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-[#FF9EAA] focus:border-[#FF9EAA]"
              min="0"
              step="0.01"
              required
            />
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-[#FF9EAA] focus:border-[#FF9EAA]"
              required
            ></textarea>
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma separated)</label>
            <input
              type="text"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              placeholder="fresh, organic, vegan"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-[#FF9EAA] focus:border-[#FF9EAA]"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Product Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-[#FF9EAA] focus:border-[#FF9EAA]"
              required
            />
            {imagePreview && (
              <div className="mt-2">
                <img src={imagePreview} alt="Preview" className="h-32 w-auto object-cover rounded" />
              </div>
            )}
          </div>
          
          <div className="flex space-x-6 items-center">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="inStock"
                name="inStock"
                checked={formData.inStock}
                onChange={handleChange}
                className="h-4 w-4 text-[#FF9EAA] focus:ring-[#FF9EAA] border-gray-300 rounded"
              />
              <label htmlFor="inStock" className="ml-2 text-sm text-gray-700">In Stock</label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="featured"
                name="featured"
                checked={formData.featured}
                onChange={handleChange}
                className="h-4 w-4 text-[#FF9EAA] focus:ring-[#FF9EAA] border-gray-300 rounded"
              />
              <label htmlFor="featured" className="ml-2 text-sm text-gray-700">Featured Product</label>
            </div>
          </div>
        </div>
        
        <div className="mt-6">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full md:w-auto px-6 py-2 bg-[#FF9EAA] hover:bg-[#ff8a9a] text-white font-medium rounded-md transition-colors duration-200 disabled:opacity-50"
          >
            {isSubmitting ? 'Adding Product...' : 'Add Product'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductInputForm;
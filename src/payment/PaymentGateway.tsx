import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import axios from 'axios';

interface PaymentGatewayProps {
  onCancel: () => void;
  onSuccess: (orderId: string) => void;
}

// Set the base URL for API requests
const API_BASE_URL = 'http://localhost:5000';

const PaymentGateway: React.FC<PaymentGatewayProps> = ({ onCancel, onSuccess }) => {
  const { cartItems, clearCart } = useCart();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Function to initiate payment
  const initiatePayment = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      // Get user data (could be from context, props, or localStorage)
      const userData = JSON.parse(localStorage.getItem('userData') || '{}');
      
      if (!userData.email) {
        throw new Error('User information is missing. Please login or provide your email.');
      }
      
      // Make API call to your backend to initiate payment
      const response = await axios.post(`${API_BASE_URL}/api/initiate-payment`, {
        cartItems,
        userData
      });
      
      // Create a form and submit it to PayU
      const form = document.createElement('form');
      form.setAttribute('method', 'post');
      form.setAttribute('action', response.data.payuBaseUrl);
      form.setAttribute('target', '_self');
      
      // Add all parameters as hidden fields
      Object.entries(response.data).forEach(([key, value]) => {
        if (key !== 'payuBaseUrl') {
          const hiddenField = document.createElement('input');
          hiddenField.setAttribute('type', 'hidden');
          hiddenField.setAttribute('name', key);
          hiddenField.setAttribute('value', value as string);
          form.appendChild(hiddenField);
        }
      });
      
      // Append form to body and submit
      document.body.appendChild(form);
      form.submit();
      
      // Note: The onSuccess callback will be triggered when redirected back 
      // from PayU to your success URL with a valid order ID
      
    } catch (err) {
      console.error('Payment initiation failed:', err);
      setError(err instanceof Error ? err.message : 'Payment initiation failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">Payment Gateway</h2>
          <p className="text-gray-600 mt-1">Secure payment via PayU</p>
        </div>
        
        {/* Payment Summary */}
        <div className="bg-gray-50 p-4 rounded-md mb-6">
          <h3 className="text-lg font-medium text-gray-800 mb-2">Order Summary</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Items ({cartItems.length}):</span>
              <span>${cartItems.reduce((sum, item) => {
                const itemPrice = item.product.currentCost;
                const addonPrice = item.addons.reduce((total, addon) => total + addon.price, 0);
                return sum + ((itemPrice + addonPrice) * item.quantity);
              }, 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping:</span>
              <span>
                {cartItems.reduce((sum, item) => {
                  const itemPrice = item.product.currentCost;
                  const addonPrice = item.addons.reduce((total, addon) => total + addon.price, 0);
                  return sum + ((itemPrice + addonPrice) * item.quantity);
                }, 0) >= 50 ? 'Free' : 'Free'}
              </span>
            </div>
            <div className="border-t pt-2 mt-2">
              <div className="flex justify-between font-semibold">
                <span>Total:</span>
                <span>${(
                  cartItems.reduce((sum, item) => {
                    const itemPrice = item.product.currentCost;
                    const addonPrice = item.addons.reduce((total, addon) => total + addon.price, 0);
                    return sum + ((itemPrice + addonPrice) * item.quantity);
                  }, 0) + 
                  (cartItems.reduce((sum, item) => {
                    const itemPrice = item.product.currentCost;
                    const addonPrice = item.addons.reduce((total, addon) => total + addon.price, 0);
                    return sum + ((itemPrice + addonPrice) * item.quantity);
                  }, 0) >= 50 ? 0 : 0)
                ).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Payment Instructions */}
        <div className="mb-6">
          <p className="text-gray-600 text-sm">
            You will be redirected to PayU's secure payment gateway to complete your payment. After successful payment, you will be redirected back to our website.
          </p>
        </div>
        
        {/* Error Message */}
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4">
            {error}
          </div>
        )}
        
        {/* Action Buttons */}
        <div className="flex space-x-4">
          <button
            onClick={onCancel}
            className="flex-1 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            onClick={initiatePayment}
            className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-pink-500 hover:bg-pink-600 focus:outline-none"
            disabled={isLoading}
          >
            {isLoading ? 'Processing...' : 'Pay Now'}
          </button>
        </div>
        
        {/* Payment Methods */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500 mb-2">We accept:</p>
          <div className="flex justify-center space-x-2">
            <i className="fab fa-cc-visa text-2xl text-gray-400"></i>
            <i className="fab fa-cc-mastercard text-2xl text-gray-400"></i>
            <i className="fab fa-cc-amex text-2xl text-gray-400"></i>
            <i className="fab fa-cc-paypal text-2xl text-gray-400"></i>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentGateway;
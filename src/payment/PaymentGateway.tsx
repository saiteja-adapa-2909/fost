import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import axios from 'axios';

interface PaymentGatewayProps {
  onCancel: () => void;
  onSuccess: (orderId: string) => void;
}

interface AddressData {
  fullName: string;
  addressLine1: string;
  addressLine2: string;
  area: string;
  landmark: string;
  pinCode: string;
  phoneNumber: string;
}

// Set the base URL for API requests
const API_BASE_URL = 'http://localhost:5000';

const PaymentGateway: React.FC<PaymentGatewayProps> = ({ onCancel, onSuccess }) => {
  const { cartItems, clearCart } = useCart();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [addressData, setAddressData] = useState<AddressData>({
    fullName: '',
    addressLine1: '',
    addressLine2: '',
    area: '',
    landmark: '',
    pinCode: '',
    phoneNumber: ''
  });
  const [currentStep, setCurrentStep] = useState<'address' | 'payment'>('address');
  
  // Function to handle address input changes
  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setAddressData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Function to validate address before proceeding to payment
  const validateAddress = () => {
    const requiredFields = ['fullName', 'addressLine1', 'area', 'pinCode', 'phoneNumber'];
    const missingFields = requiredFields.filter(field => !addressData[field as keyof AddressData]);
    
    if (missingFields.length > 0) {
      setError(`Please fill in the following required fields: ${missingFields.join(', ')}`);
      return false;
    }
    
    // Basic phone number validation for India (10 digits)
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(addressData.phoneNumber.replace(/[-()\s]/g, ''))) {
      setError('Please enter a valid 10-digit Indian phone number');
      return false;
    }
    
    // Hyderabad PIN code validation (common Hyderabad PIN codes start with 50)
    const pinRegex = /^50\d{4}$/;
    if (!pinRegex.test(addressData.pinCode)) {
      setError('Please enter a valid Hyderabad PIN code (starting with 50)');
      return false;
    }
    
    setError('');
    return true;
  };

  // Function to proceed to payment after address validation
  const proceedToPayment = () => {
    if (validateAddress()) {
      setCurrentStep('payment');
    }
  };
  
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
        userData,
        shippingAddress: {
          ...addressData,
          city: 'Hyderabad',
          state: 'Telangana',
          country: 'India'
        }
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
      
    } catch (err) {
      console.error('Payment initiation failed:', err);
      setError(err instanceof Error ? err.message : 'Payment initiation failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Hyderabad areas for dropdown
  const hyderabadAreas = [
    'Banjara Hills', 'Jubilee Hills', 'Madhapur', 'Hitech City', 'Gachibowli', 
    'Kukatpally', 'Ameerpet', 'Begumpet', 'Secunderabad', 'Mehdipatnam',
    'Dilsukhnagar', 'Abids', 'Somajiguda', 'Himayatnagar', 'Toli Chowki',
    'KPHB', 'Miyapur', 'Manikonda', 'Uppal', 'LB Nagar'
  ];
  
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md max-h-screen overflow-y-auto">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">
            {currentStep === 'address' ? 'Shipping Address' : 'Payment Gateway'}
          </h2>
          <p className="text-gray-600 mt-1">
            {currentStep === 'address' ? 'Delivery in Hyderabad only' : 'Secure payment via PayU'}
          </p>
        </div>
        
        {currentStep === 'address' ? (
          <div className="space-y-4">
            {/* Full Name */}
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">Full Name *</label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={addressData.fullName}
                onChange={handleAddressChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500 sm:text-sm"
                required
              />
            </div>
            
            {/* Address Line 1 */}
            <div>
              <label htmlFor="addressLine1" className="block text-sm font-medium text-gray-700">Address Line 1 *</label>
              <input
                type="text"
                id="addressLine1"
                name="addressLine1"
                value={addressData.addressLine1}
                onChange={handleAddressChange}
                placeholder="House/Flat No., Building Name"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500 sm:text-sm"
                required
              />
            </div>
            
            {/* Address Line 2 */}
            <div>
              <label htmlFor="addressLine2" className="block text-sm font-medium text-gray-700">Address Line 2</label>
              <input
                type="text"
                id="addressLine2"
                name="addressLine2"
                value={addressData.addressLine2}
                onChange={handleAddressChange}
                placeholder="Street, Colony"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500 sm:text-sm"
              />
            </div>
            
            {/* Area */}
            <div>
              <label htmlFor="area" className="block text-sm font-medium text-gray-700">Area *</label>
              <select
                id="area"
                name="area"
                value={addressData.area}
                onChange={handleAddressChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500 sm:text-sm"
                required
              >
                <option value="">Select Area</option>
                {hyderabadAreas.map(area => (
                  <option key={area} value={area}>{area}</option>
                ))}
              </select>
            </div>
            
            {/* Landmark */}
            <div>
              <label htmlFor="landmark" className="block text-sm font-medium text-gray-700">Landmark</label>
              <input
                type="text"
                id="landmark"
                name="landmark"
                value={addressData.landmark}
                onChange={handleAddressChange}
                placeholder="Near..."
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500 sm:text-sm"
              />
            </div>
            
            {/* City, State and Country - Fixed for Hyderabad */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">City</label>
                <input
                  type="text"
                  value="Hyderabad"
                  className="mt-1 block w-full rounded-md border-gray-300 bg-gray-100 shadow-sm sm:text-sm"
                  disabled
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">State</label>
                <input
                  type="text"
                  value="Telangana"
                  className="mt-1 block w-full rounded-md border-gray-300 bg-gray-100 shadow-sm sm:text-sm"
                  disabled
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Country</label>
                <input
                  type="text"
                  value="India"
                  className="mt-1 block w-full rounded-md border-gray-300 bg-gray-100 shadow-sm sm:text-sm"
                  disabled
                />
              </div>
            </div>
            
            {/* PIN Code */}
            <div>
              <label htmlFor="pinCode" className="block text-sm font-medium text-gray-700">PIN Code *</label>
              <input
                type="text"
                id="pinCode"
                name="pinCode"
                value={addressData.pinCode}
                onChange={handleAddressChange}
                placeholder="e.g., 500032"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500 sm:text-sm"
                required
              />
            </div>
            
            {/* Phone Number */}
            <div>
              <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">Phone Number *</label>
              <input
                type="tel"
                id="phoneNumber"
                name="phoneNumber"
                value={addressData.phoneNumber}
                onChange={handleAddressChange}
                placeholder="10-digit mobile number"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500 sm:text-sm"
                required
              />
            </div>
            
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-md mt-4">
                {error}
              </div>
            )}
            
            {/* Action Buttons */}
            <div className="flex space-x-4 mt-6">
              <button
                onClick={onCancel}
                className="flex-1 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
              >
                Cancel
              </button>
              <button
                onClick={proceedToPayment}
                className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-pink-500 hover:bg-pink-600 focus:outline-none"
              >
                Continue to Payment
              </button>
            </div>
          </div>
        ) : (
          <>
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
            
            {/* Shipping Address Summary */}
            <div className="bg-gray-50 p-4 rounded-md mb-6">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-medium text-gray-800">Shipping Address</h3>
                <button 
                  onClick={() => setCurrentStep('address')} 
                  className="text-sm text-pink-600 hover:text-pink-800"
                >
                  Edit
                </button>
              </div>
              <div className="text-sm text-gray-700">
                <p className="font-semibold">{addressData.fullName}</p>
                <p>{addressData.addressLine1}</p>
                {addressData.addressLine2 && <p>{addressData.addressLine2}</p>}
                <p>{addressData.area}, Hyderabad, Telangana</p>
                {addressData.landmark && <p>Landmark: {addressData.landmark}</p>}
                <p>PIN: {addressData.pinCode}</p>
                <p>Phone: {addressData.phoneNumber}</p>
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
                onClick={() => setCurrentStep('address')}
                className="flex-1 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                disabled={isLoading}
              >
                Back
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
          </>
        )}
      </div>
    </div>
  );
};

export default PaymentGateway;
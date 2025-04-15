// CartPage.tsx
import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import PaymentGateway from '../payment/PaymentGateway'; // Import the PaymentGateway component

interface CartPageProps {
  onContinueShopping: () => void;
}

const CartPage: React.FC<CartPageProps> = ({
  onContinueShopping,
}) => {
  const { cartItems, removeFromCart, updateQuantity, clearCart } = useCart();
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [showPaymentGateway, setShowPaymentGateway] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [orderId, setOrderId] = useState('');

  // Calculate item total price including add-ons
  const calculateItemPrice = (index: number) => {
    const item = cartItems[index];
    const addonTotal = item.addons.reduce((sum, addon) => sum + addon.price, 0);
    return (item.product.currentCost + addonTotal) * item.quantity;
  };

  // Calculate subtotal
  const calculateSubtotal = () => {
    return cartItems.reduce((total, item, index) => total + calculateItemPrice(index), 0);
  };

  // Calculate discount amount
  const calculateDiscount = () => {
    return promoApplied ? (calculateSubtotal() * discountPercent / 100) : 0;
  };

  // Calculate shipping cost (free over $50)
  const calculateShipping = () => {
    const subtotal = calculateSubtotal();
    return subtotal >= 50 ? 0 : 0;
  };

  // Calculate total cost
  const calculateTotal = () => {
    return calculateSubtotal() - calculateDiscount() + calculateShipping();
  };

  // Handle promo code application
  const handleApplyPromo = () => {
    // Simple promo code validation
    if (promoCode.toUpperCase() === 'WELCOME10') {
      setPromoApplied(true);
      setDiscountPercent(10);
    } else if (promoCode.toUpperCase() === 'SAVE20') {
      setPromoApplied(true);
      setDiscountPercent(20);
    } else {
      alert('Invalid promo code');
    }
  };

  // Handle quantity change
  const handleQuantityChange = (index: number, action: 'increase' | 'decrease') => {
    const currentQty = cartItems[index].quantity;
    const newQty = action === 'increase' ? currentQty + 1 : Math.max(1, currentQty - 1);
    updateQuantity(index, newQty);
  };

  // Handle checkout button click
  const handleCheckout = () => {
    // Check if user is logged in
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    if (!userData.email) {
      alert('Please login before proceeding to checkout');
      return;
    }
    
    // Show payment gateway
    setShowPaymentGateway(true);
  };

  // Handle payment cancellation
  const handlePaymentCancel = () => {
    setShowPaymentGateway(false);
  };

  // Handle payment success
  const handlePaymentSuccess = (newOrderId: string) => {
    setShowPaymentGateway(false);
    setPaymentSuccess(true);
    setOrderId(newOrderId);
    clearCart(); // Clear the cart after successful payment
  };

  return (
    <div className="bg-white">
      {showPaymentGateway && (
        <PaymentGateway 
          onCancel={handlePaymentCancel}
          onSuccess={handlePaymentSuccess}
        />
      )}
      
      {paymentSuccess ? (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <div className="bg-green-50 rounded-lg p-8">
            <i className="fas fa-check-circle text-6xl text-green-500 mb-4"></i>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Payment Successful!</h1>
            <p className="text-gray-600 mb-4">Thank you for your purchase. Your order has been placed successfully.</p>
            <p className="text-gray-600 mb-6">Order ID: <span className="font-semibold">{orderId}</span></p>
            <button 
              onClick={onContinueShopping}
              className="bg-pink-500 text-white py-3 px-8 rounded-md hover:bg-pink-600 transition duration-300"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Your Cart</h1>
          
          {cartItems.length === 0 ? (
            <div className="text-center py-16">
              <i className="fas fa-shopping-cart text-6xl text-gray-300 mb-4"></i>
              <h2 className="text-2xl font-medium text-gray-600 mb-4">Your cart is empty</h2>
              <p className="text-gray-500 mb-8">Looks like you haven't added any products to your cart yet.</p>
              <button 
                onClick={onContinueShopping}
                className="bg-pink-500 text-white py-3 px-8 rounded-md hover:bg-pink-600 transition duration-300"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              <div className="lg:col-span-2">
                {/* Cart Items */}
                <div className="border rounded-lg overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Product
                        </th>
                        <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Quantity
                        </th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Price
                        </th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Total
                        </th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {cartItems.map((item, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                                <img 
                                  src={item.product.imageUrl} 
                                  alt={item.product.title}
                                  className="h-full w-full object-cover object-center" 
                                />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {item.product.title}
                                </div>
                                {item.addons && item.addons.length > 0 && (
                                  <div className="mt-1 text-xs text-gray-500">
                                    <p>Add-ons:</p>
                                    <ul className="list-disc list-inside">
                                      {item.addons.map((addon, idx) => (
                                        <li key={idx}>{addon.name} (+${addon.price.toFixed(2)})</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center justify-center">
                              <button
                                onClick={() => handleQuantityChange(index, 'decrease')}
                                className="p-1 rounded-md text-gray-500 hover:bg-gray-100"
                              >
                                <i className="fas fa-minus"></i>
                              </button>
                              <span className="mx-4 text-gray-700">{item.quantity}</span>
                              <button
                                onClick={() => handleQuantityChange(index, 'increase')}
                                className="p-1 rounded-md text-gray-500 hover:bg-gray-100"
                              >
                                <i className="fas fa-plus"></i>
                              </button>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                            ${item.product.currentCost.toFixed(2)}
                            {item.addons && item.addons.length > 0 && (
                              <span className="text-xs text-gray-500 block">
                                + ${item.addons.reduce((sum, addon) => sum + addon.price, 0).toFixed(2)} add-ons
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            ${calculateItemPrice(index).toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              onClick={() => removeFromCart(index)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <i className="fas fa-trash"></i>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                <div className="mt-6 flex justify-between">
                  <button
                    onClick={onContinueShopping}
                    className="flex items-center text-pink-600 hover:text-pink-800"
                  >
                    <i className="fas fa-arrow-left mr-2"></i>
                    Continue Shopping
                  </button>
                  <button
                    onClick={clearCart}
                    className="text-gray-600 hover:text-gray-800"
                  >
                    Clear Cart
                  </button>
                </div>
              </div>
              
              {/* Order Summary */}
              <div className="lg:col-span-1">
                <div className="bg-gray-50 rounded-lg p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="text-gray-900">${calculateSubtotal().toFixed(2)}</span>
                    </div>
                    
                    {promoApplied && (
                      <div className="flex justify-between text-green-600">
                        <span>Discount ({discountPercent}%)</span>
                        <span>-${calculateDiscount().toFixed(2)}</span>
                      </div>
                    )}
                    
                    <div className="flex justify-between">
                      <span className="text-gray-600">Shipping</span>
                      <span className="text-gray-900">
                        {calculateShipping() === 0 ? 'Free' : `$${calculateShipping().toFixed(2)}`}
                      </span>
                    </div>
                    
                    <div className="pt-4 border-t border-gray-200">
                      <div className="flex justify-between font-semibold">
                        <span className="text-gray-900">Total</span>
                        <span className="text-xl text-gray-900">${calculateTotal().toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Promo Code Input */}
                  <div className="mt-6">
                    <label htmlFor="promo-code" className="block text-sm font-medium text-gray-700 mb-2">
                      Promo Code
                    </label>
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        id="promo-code"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value)}
                        className="shadow-sm focus:ring-pink-500 focus:border-pink-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        placeholder="Enter promo code"
                        disabled={promoApplied}
                      />
                      <button
                        onClick={handleApplyPromo}
                        disabled={promoApplied || !promoCode}
                        className="bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300 disabled:opacity-50"
                      >
                        Apply
                      </button>
                    </div>
                    {promoApplied && (
                      <p className="mt-2 text-sm text-green-600">
                        <i className="fas fa-check mr-1"></i>
                        Promo code applied successfully!
                      </p>
                    )}
                  </div>
                  
                  {/* Checkout Button */}
                  <button
                    onClick={handleCheckout}
                    className="w-full bg-pink-500 text-white py-3 px-4 rounded-md hover:bg-pink-600 transition duration-300 mt-6"
                    disabled={cartItems.length === 0}
                  >
                    Proceed to Checkout
                  </button>
                  
                  {/* Payment Icons */}
                  <div className="mt-6">
                    <p className="text-xs text-gray-500 mb-2">We accept:</p>
                    <div className="flex space-x-2">
                      <i className="fab fa-cc-visa text-2xl text-gray-400"></i>
                      <i className="fab fa-cc-mastercard text-2xl text-gray-400"></i>
                      <i className="fab fa-cc-amex text-2xl text-gray-400"></i>
                      <i className="fab fa-cc-paypal text-2xl text-gray-400"></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CartPage;
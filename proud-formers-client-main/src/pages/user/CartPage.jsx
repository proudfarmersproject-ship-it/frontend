import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Trash2, Plus, Minus, ArrowLeft, Package, Truck, CreditCard, Shield } from 'lucide-react';

export default function CartPage() {
  const [cartItems, setCartItems] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = () => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    setCartItems(cart);
  };

  const updateQuantity = (index, change) => {
    const newCart = [...cartItems];
    const newQuantity = newCart[index].quantity + change;
    
    if (newQuantity >= 1 && newQuantity <= newCart[index].stock) {
      newCart[index].quantity = newQuantity;
      setCartItems(newCart);
      localStorage.setItem('cart', JSON.stringify(newCart));
    }
  };

  const removeItem = (index) => {
    if (window.confirm('Are you sure you want to remove this item?')) {
      const newCart = cartItems.filter((_, i) => i !== index);
      setCartItems(newCart);
      localStorage.setItem('cart', JSON.stringify(newCart));
    }
  };

  const clearCart = () => {
    if (window.confirm('Are you sure you want to clear your cart?')) {
      setCartItems([]);
      localStorage.removeItem('cart');
    }
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const delivery = subtotal > 500 ? 0 : 50;
    const tax = subtotal * 0.18; // 18% GST
    return subtotal + delivery + tax;
  };

  const proceedToCheckout = () => {
    if (cartItems.length === 0) {
      alert('Your cart is empty!');
      return;
    }
    alert('Proceeding to checkout!');
    // In real app, navigate to checkout page
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50/50 to-emerald-50/30 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingCart className="w-12 h-12 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">Your cart is empty</h2>
          <p className="text-gray-600 mb-8">Looks like you haven't added any products to your cart yet.</p>
          <div className="space-y-4">
            <button
              onClick={() => navigate('/products')}
              className="w-full py-3.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300"
            >
              Start Shopping
            </button>
            <button
              onClick={() => navigate('/')}
              className="w-full py-3.5 bg-white border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:border-green-300 transition-all duration-300"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50/50 to-emerald-50/30 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate('/products')}
            className="flex items-center gap-2 text-gray-600 hover:text-green-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Continue Shopping
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
          <button
            onClick={clearCart}
            className="text-red-600 hover:text-red-700 text-sm font-medium"
          >
            Clear Cart
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item, index) => (
              <div key={`${item.productId}-${item.variantId}`} className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex flex-col sm:flex-row gap-6">
                  {/* Product Image */}
                  <div className="flex-shrink-0">
                    <div className="w-32 h-32 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl flex items-center justify-center">
                      {item.image && !item.image.includes('blob:') ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover rounded-xl"
                        />
                      ) : (
                        <div className="text-4xl opacity-30">
                          {item.category === 'Organic Grains' ? '🌾' :
                           item.category === 'Cold-Pressed Oils' ? '🫒' :
                           item.category === 'Farm Fresh Spices' ? '🌶️' :
                           item.category === 'Natural Sweeteners' ? '🍯' :
                           item.category === 'Dry Fruits & Nuts' ? '🥜' : '📦'}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Product Details */}
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">{item.name}</h3>
                        <p className="text-sm text-gray-600 mb-2">{item.variantName}</p>
                        <div className="flex items-center gap-2 mb-4">
                          <span className="text-xs font-semibold text-green-600 bg-green-100 px-2 py-1 rounded">
                            {item.category}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => removeItem(index)}
                        className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                      <div className="mb-4 sm:mb-0">
                        <div className="text-2xl font-bold text-green-600 mb-1">
                          ₹{(item.price * item.quantity).toFixed(2)}
                        </div>
                        <div className="text-sm text-gray-500">
                          ₹{item.price.toFixed(2)} each
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        {/* Quantity Controls */}
                        <div className="flex items-center gap-3 border-2 border-gray-200 rounded-xl px-4 py-2">
                          <button
                            onClick={() => updateQuantity(index, -1)}
                            disabled={item.quantity <= 1}
                            className="p-1 rounded-lg hover:bg-gray-100 disabled:opacity-50"
                          >
                            <Minus className="w-5 h-5" />
                          </button>
                          <span className="text-xl font-bold w-12 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(index, 1)}
                            disabled={item.quantity >= item.stock}
                            className="p-1 rounded-lg hover:bg-gray-100 disabled:opacity-50"
                          >
                            <Plus className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>

              {/* Order Details */}
              <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-semibold">₹{calculateSubtotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Delivery</span>
                  <span className={calculateSubtotal() > 500 ? 'text-green-600 font-semibold' : 'font-semibold'}>
                    {calculateSubtotal() > 500 ? 'FREE' : '₹50.00'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax (18% GST)</span>
                  <span className="font-semibold">₹{(calculateSubtotal() * 0.18).toFixed(2)}</span>
                </div>
                <div className="border-t pt-4">
                  <div className="flex justify-between text-lg">
                    <span className="font-bold">Total</span>
                    <span className="font-bold text-green-600">₹{calculateTotal().toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Delivery Info */}
              {calculateSubtotal() < 500 && (
                <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                  <div className="flex items-center gap-2 text-amber-700">
                    <Package className="w-5 h-5" />
                    <span className="font-medium">Add ₹{(500 - calculateSubtotal()).toFixed(2)} more for FREE delivery!</span>
                  </div>
                </div>
              )}

              {/* Checkout Button */}
              <button
                onClick={proceedToCheckout}
                className="w-full py-4 mb-6 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 active:scale-95 shadow-lg"
              >
                <div className="flex items-center justify-center gap-3">
                  <CreditCard className="w-6 h-6" />
                  <span className="text-lg">Proceed to Checkout</span>
                </div>
              </button>

              {/* Features */}
              <div className="space-y-3 border-t pt-6">
                <div className="flex items-center gap-3">
                  <div className="bg-green-100 p-2 rounded-lg">
                    <Truck className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <div className="font-medium text-sm">Fast Delivery</div>
                    <div className="text-xs text-gray-500">Same day delivery in metro cities</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="bg-green-100 p-2 rounded-lg">
                    <Shield className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <div className="font-medium text-sm">Secure Payment</div>
                    <div className="text-xs text-gray-500">100% secure payment processing</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Continue Shopping */}
            <div className="mt-6">
              <Link
                to="/products"
                className="block w-full py-3.5 bg-white border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:border-green-300 transition-all duration-300 text-center"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
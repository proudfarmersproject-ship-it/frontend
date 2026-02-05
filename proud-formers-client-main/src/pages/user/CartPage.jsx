import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ShoppingCart, 
  Trash2, 
  Plus, 
  Minus, 
  ArrowLeft, 
  Package, 
  Truck, 
  CreditCard, 
  Shield,
  LogIn,
  User,
  Tag,
  X,
  Check,
  AlertCircle,
  Calendar
} from 'lucide-react';
import { useCartStore } from '../../services/cartService'; // CORRECTED IMPORT - from store not services

export default function CartPage() {
  const navigate = useNavigate();
  
  // State for coupons (not managed by cart store)
  const [coupons, setCoupons] = useState([]);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');
  const [showCouponInput, setShowCouponInput] = useState(false);
  
  // Use Zustand store for cart and user
  const { 
    cart: cartItems, 
    user, 
    loading, 
    updateQuantity, 
    removeFromCart, 
    clearCart,
    loadCart,
    getCartCount,
    getCartTotal
  } = useCartStore();

  // Debug logging
  useEffect(() => {
    console.log('🛒 CartPage: Cart items:', cartItems.length);
    console.log('👤 CartPage: User:', user ? user.email : 'Guest');
    console.log('🔄 CartPage: Loading:', loading);
  }, [cartItems, user, loading]);

  useEffect(() => {
    // Load coupons
    loadCoupons();
    
    // Load cart from store on component mount
    if (!loading) {
      console.log('🔄 CartPage: Loading cart from store...');
      loadCart();
    }
  }, []);

  const loadCoupons = async () => {
    try {
      const response = await fetch('http://localhost:4000/coupons');
      if (response.ok) {
        const couponsData = await response.json();
        setCoupons(couponsData);
      }
    } catch (error) {
      console.error('Error loading coupons:', error);
    }
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const calculateDiscount = () => {
    if (!appliedCoupon || cartItems.length === 0) return 0;
    
    const subtotal = calculateSubtotal();
    
    if (subtotal < appliedCoupon.min_order_value) {
      removeCoupon();
      return 0;
    }
    
    if (appliedCoupon.discount_type === 'PERCENTAGE') {
      const discount = (subtotal * appliedCoupon.discount_value) / 100;
      // Apply maximum discount limit if exists
      if (appliedCoupon.max_discount_value) {
        return Math.min(discount, appliedCoupon.max_discount_value);
      }
      return discount;
    } else {
      return parseFloat(appliedCoupon.discount_value);
    }
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const discount = calculateDiscount();
    const delivery = subtotal > 500 ? 0 : 50;
    const tax = (subtotal - discount) * 0.18; // 18% GST on discounted amount
    return (subtotal - discount) + delivery + tax;
  };

  const applyCoupon = async () => {
    setCouponError('');
    setCouponSuccess('');
    
    if (!couponCode.trim()) {
      setCouponError('Please enter a coupon code');
      return;
    }
    
    const subtotal = calculateSubtotal();
    if (subtotal === 0) {
      setCouponError('Add items to cart to apply coupon');
      return;
    }
    
    try {
      // Fetch coupon from API
      const response = await fetch(`http://localhost:4000/coupons?code=${couponCode.toUpperCase()}`);
      
      if (!response.ok) {
        throw new Error('Failed to validate coupon');
      }
      
      const couponData = await response.json();
      
      if (couponData.length === 0) {
        setCouponError('Invalid coupon code');
        return;
      }
      
      const coupon = couponData[0];
      
      // Validate coupon
      const validation = validateCoupon(coupon);
      
      if (!validation.isValid) {
        setCouponError(validation.message);
        return;
      }
      
      // Apply coupon
      setAppliedCoupon(coupon);
      setCouponSuccess(`Coupon "${coupon.code}" applied successfully!`);
      setCouponCode('');
      setShowCouponInput(false);
      
      // Save applied coupon for logged-in users
      if (user) {
        await updateUserAppliedCoupon(user.id, coupon);
      }
      
    } catch (error) {
      console.error('Error applying coupon:', error);
      setCouponError('Failed to apply coupon. Please try again.');
    }
  };

  const updateUserAppliedCoupon = async (userId, coupon) => {
    try {
      const response = await fetch(`http://localhost:4000/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          appliedCoupon: coupon ? {
            code: coupon.code,
            appliedAt: new Date().toISOString()
          } : null
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to save coupon to user');
      }
      
      console.log('✅ Coupon saved to user account');
    } catch (error) {
      console.error('Error updating user coupon:', error);
    }
  };

  const validateCoupon = (coupon) => {
    const now = new Date();
    const subtotal = calculateSubtotal();
    
    // Check if coupon is active
    if (!coupon.is_active) {
      return { isValid: false, message: 'This coupon is not active' };
    }
    
    // Check validity dates
    const startDate = new Date(coupon.validity.start_date);
    const endDate = new Date(coupon.validity.end_date);
    
    if (now < startDate) {
      return { isValid: false, message: 'This coupon is not yet valid' };
    }
    
    if (now > endDate) {
      return { isValid: false, message: 'This coupon has expired' };
    }
    
    // Check minimum order value
    if (subtotal < coupon.min_order_value) {
      const needed = coupon.min_order_value - subtotal;
      return { 
        isValid: false, 
        message: `Add ₹${needed.toFixed(2)} more to apply this coupon` 
      };
    }
    
    // Check usage limit
    if (coupon.usage_stats.remaining <= 0) {
      return { isValid: false, message: 'This coupon has been fully redeemed' };
    }
    
    // Check if user has already used this coupon
    // Note: You might want to track this in user data in a real app
    if (user && user.usedCoupons && user.usedCoupons.includes(coupon.code)) {
      return { isValid: false, message: 'You have already used this coupon' };
    }
    
    return { isValid: true, message: 'Coupon is valid' };
  };

  const removeCoupon = async () => {
    setAppliedCoupon(null);
    setCouponSuccess('');
    setCouponError('');
    
    // Remove applied coupon for logged-in users
    if (user) {
      try {
        await fetch(`http://localhost:4000/users/${user.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            appliedCoupon: null
          })
        });
        console.log('✅ Coupon removed from user account');
      } catch (error) {
        console.error('Error removing user coupon:', error);
      }
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const proceedToCheckout = () => {
    if (cartItems.length === 0) {
      alert('Your cart is empty!');
      return;
    }
    
    if (!user) {
      // Save current cart to localStorage temporarily
      // Note: Zustand already saves guest cart to localStorage
      localStorage.setItem('pendingCheckout', 'true');
      navigate('/login', { 
        state: { 
          from: '/cart',
          message: 'Please login to proceed with checkout' 
        } 
      });
      return;
    }
    
    // Prepare checkout data
    const checkoutData = {
      cartItems,
      subtotal: calculateSubtotal(),
      discount: calculateDiscount(),
      delivery: calculateSubtotal() > 500 ? 0 : 50,
      tax: (calculateSubtotal() - calculateDiscount()) * 0.18,
      total: calculateTotal(),
      appliedCoupon: appliedCoupon ? {
        code: appliedCoupon.code,
        discount: calculateDiscount()
      } : null,
      user: {
        id: user.id,
        email: user.email,
        name: user.name || user.email
      }
    };
    
    // Save checkout data to localStorage for checkout page
    localStorage.setItem('checkoutData', JSON.stringify(checkoutData));
    navigate('/checkout');
  };

  const handleLogin = () => {
    // Note: Cart is already saved by Zustand store
    navigate('/login', { 
      state: { 
        from: '/cart',
        message: 'Login to save your cart items' 
      } 
    });
  };

  // Handle quantity update
  const handleUpdateQuantity = async (index, change) => {
    console.log(`🔄 Updating quantity for item ${index} by ${change}`);
    await updateQuantity(index, change);
    
    // Revalidate coupon after quantity change
    if (appliedCoupon) {
      const subtotal = calculateSubtotal();
      if (subtotal < appliedCoupon.min_order_value) {
        removeCoupon();
        alert('Coupon removed because order value is now below minimum');
      }
    }
  };

  // Handle item removal
  const handleRemoveItem = async (index) => {
    if (window.confirm('Are you sure you want to remove this item?')) {
      console.log(`🗑️ Removing item at index ${index}`);
      await removeFromCart(index);
      
      // Remove coupon if cart becomes empty or subtotal below minimum
      if (appliedCoupon) {
        if (cartItems.length === 1) {
          removeCoupon();
          alert('Coupon removed because cart is now empty');
        } else {
          const subtotal = calculateSubtotal();
          if (subtotal < appliedCoupon.min_order_value) {
            removeCoupon();
            alert('Coupon removed because order value is now below minimum');
          }
        }
      }
    }
  };

  // Handle clear cart
  const handleClearCart = async () => {
    if (window.confirm('Are you sure you want to clear your cart?')) {
      console.log('🗑️ Clearing entire cart');
      await clearCart();
      removeCoupon();
      alert('Cart cleared successfully!');
    }
  };

  // Load applied coupon from user data if exists
  useEffect(() => {
    const loadUserCoupon = async () => {
      if (user && user.id) {
        try {
          const response = await fetch(`http://localhost:4000/users/${user.id}`);
          if (response.ok) {
            const userData = await response.json();
            if (userData.appliedCoupon) {
              // Fetch coupon details
              const couponResponse = await fetch(`http://localhost:4000/coupons?code=${userData.appliedCoupon.code}`);
              if (couponResponse.ok) {
                const couponData = await couponResponse.json();
                if (couponData.length > 0) {
                  setAppliedCoupon({ ...couponData[0], code: userData.appliedCoupon.code });
                  setCouponSuccess(`Coupon "${userData.appliedCoupon.code}" loaded from your account!`);
                }
              }
            }
          }
        } catch (error) {
          console.error('Error loading user coupon:', error);
        }
      }
    };
    
    if (user) {
      loadUserCoupon();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50/50 to-emerald-50/30 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">
            {user ? 'Loading your cart from account...' : 'Loading cart...'}
          </p>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50/50 to-emerald-50/30 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingCart className="w-12 h-12 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">Your cart is empty</h2>
          <p className="text-gray-600 mb-8">
            {user ? 'Your cart is empty. Start shopping!' : 'Looks like you haven\'t added any products to your cart yet.'}
          </p>
          <div className="space-y-4">
            <button
              onClick={() => navigate('/products')}
              className="w-full py-3.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300"
            >
              Start Shopping
            </button>
            {!user && (
              <button
                onClick={handleLogin}
                className="w-full py-3.5 bg-white border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:border-green-300 transition-all duration-300 flex items-center justify-center gap-2"
              >
                <LogIn className="w-5 h-5" />
                Login to see saved items
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50/50 to-emerald-50/30 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/products')}
              className="flex items-center gap-2 text-gray-600 hover:text-green-700 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Continue Shopping
            </button>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
          </div>
          
          <div className="flex items-center gap-4">
            {!user && (
              <button
                onClick={handleLogin}
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium rounded-lg hover:shadow-md transition-all duration-300 flex items-center gap-2"
              >
                <LogIn className="w-4 h-4" />
                Login
              </button>
            )}
            <button
              onClick={handleClearCart}
              className="text-red-600 hover:text-red-700 text-sm font-medium"
            >
              Clear Cart
            </button>
          </div>
        </div>

       

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item, index) => (
              <div key={`${item.productId}-${item.variantId}-${index}`} className="bg-white rounded-2xl shadow-lg p-6">
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
                          📦
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
                          
                          {item.stock <= 10 && (
                            <span className="text-xs font-semibold text-amber-600 bg-amber-100 px-2 py-1 rounded">
                              Only {item.stock} left
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveItem(index)}
                        className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-colors"
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
                            onClick={() => handleUpdateQuantity(index, -1)}
                            disabled={item.quantity <= 1}
                            className="p-1 rounded-lg hover:bg-gray-100 disabled:opacity-50 transition-colors"
                          >
                            <Minus className="w-5 h-5" />
                          </button>
                          <span className="text-xl font-bold w-12 text-center">{item.quantity}</span>
                          <button
                            onClick={() => handleUpdateQuantity(index, 1)}
                            disabled={item.quantity >= item.stock}
                            className="p-1 rounded-lg hover:bg-gray-100 disabled:opacity-50 transition-colors"
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

              {/* Coupon Section */}
              <div className="mb-6">
                {appliedCoupon ? (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Tag className="w-5 h-5 text-green-600" />
                        <span className="font-medium text-green-800">Coupon Applied</span>
                      </div>
                      <button
                        onClick={removeCoupon}
                        className="text-red-500 hover:text-red-700 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-bold text-green-700">{appliedCoupon.code}</span>
                        <span className="text-sm text-green-600 ml-2">
                          {appliedCoupon.discount_type === 'PERCENTAGE' 
                            ? `${appliedCoupon.discount_value}% OFF`
                            : `₹${appliedCoupon.discount_value} OFF`}
                        </span>
                      </div>
                      <div className="text-green-700 font-bold">
                        -₹{calculateDiscount().toFixed(2)}
                      </div>
                    </div>
                    {appliedCoupon.validity && (
                      <div className="text-xs text-green-600 mt-2 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Valid till {formatDate(appliedCoupon.validity.end_date)}
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    {!showCouponInput ? (
                      <button
                        onClick={() => setShowCouponInput(true)}
                        className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 hover:border-green-400 hover:text-green-600 transition-all duration-300 flex items-center justify-center gap-2"
                      >
                        <Tag className="w-5 h-5" />
                        Have a coupon code?
                      </button>
                    ) : (
                      <div className="border border-gray-300 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Tag className="w-5 h-5 text-green-600" />
                            <span className="font-medium">Apply Coupon</span>
                          </div>
                          <button
                            onClick={() => {
                              setShowCouponInput(false);
                              setCouponError('');
                              setCouponCode('');
                            }}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="space-y-3">
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={couponCode}
                              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                              placeholder="Enter coupon code"
                              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                            />
                            <button
                              onClick={applyCoupon}
                              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                            >
                              Apply
                            </button>
                          </div>
                          {couponError && (
                            <div className="text-red-600 text-sm flex items-center gap-2">
                              <AlertCircle className="w-4 h-4" />
                              {couponError}
                            </div>
                          )}
                          {couponSuccess && (
                            <div className="text-green-600 text-sm flex items-center gap-2">
                              <Check className="w-4 h-4" />
                              {couponSuccess}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </>
                )}

                {/* Available Coupons */}
                {!appliedCoupon && coupons.length > 0 && (
                  <div className="mt-4">
                    <div className="text-sm font-medium text-gray-700 mb-2">Available Coupons:</div>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {coupons
                        .filter(coupon => coupon.is_active)
                        .map(coupon => {
                          const now = new Date();
                          const endDate = new Date(coupon.validity.end_date);
                          const isExpired = now > endDate;
                          
                          return (
                            <div 
                              key={coupon.id}
                              className={`text-xs p-2 rounded-lg border ${isExpired ? 'bg-gray-50 border-gray-200' : 'bg-green-50 border-green-200'}`}
                            >
                              <div className="flex justify-between items-center">
                                <div>
                                  <span className="font-bold">{coupon.code}</span>
                                  <span className="ml-2">
                                    {coupon.discount_type === 'PERCENTAGE' 
                                      ? `${coupon.discount_value}% OFF`
                                      : `₹${coupon.discount_value} OFF`}
                                  </span>
                                </div>
                                <button
                                  onClick={() => {
                                    setCouponCode(coupon.code);
                                    setShowCouponInput(true);
                                  }}
                                  disabled={isExpired}
                                  className={`text-xs px-2 py-1 rounded transition-colors ${isExpired 
                                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                                    : 'bg-green-100 text-green-700 hover:bg-green-200'}`}
                                >
                                  Apply
                                </button>
                              </div>
                              <div className="text-gray-500 mt-1">
                                Min. order: ₹{coupon.min_order_value}
                                {isExpired && (
                                  <span className="text-red-500 ml-2">• Expired</span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                )}
              </div>

              {/* Order Details */}
              <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Items ({cartItems.length})</span>
                  <span className="font-semibold">₹{calculateSubtotal().toFixed(2)}</span>
                </div>
                
                {appliedCoupon && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Discount</span>
                    <span className="text-green-600 font-semibold">
                      -₹{calculateDiscount().toFixed(2)}
                    </span>
                  </div>
                )}
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Delivery</span>
                  <span className={calculateSubtotal() > 500 ? 'text-green-600 font-semibold' : 'font-semibold'}>
                    {calculateSubtotal() > 500 ? 'FREE' : '₹50.00'}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax (18% GST)</span>
                  <span className="font-semibold">₹{((calculateSubtotal() - calculateDiscount()) * 0.18).toFixed(2)}</span>
                </div>
                
                <div className="border-t pt-4">
                  <div className="flex justify-between text-lg">
                    <span className="font-bold">Total</span>
                    <span className="font-bold text-green-600">₹{calculateTotal().toFixed(2)}</span>
                  </div>
                  {appliedCoupon && (
                    <div className="text-sm text-gray-500 mt-1">
                      You saved ₹{calculateDiscount().toFixed(2)} with {appliedCoupon.code}
                    </div>
                  )}
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
                  <span className="text-lg">
                    {user ? 'Proceed to Checkout' : 'Login to Checkout'}
                  </span>
                </div>
              </button>

              {/* Login Prompt for Guests */}
              {!user && (
                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                  <div className="flex items-center gap-2 text-blue-700 mb-2">
                    <User className="w-5 h-5" />
                    <span className="font-medium">Benefits of logging in:</span>
                  </div>
                  <ul className="text-sm text-blue-600 space-y-1">
                    <li>• Save cart across devices</li>
                    <li>• Faster checkout experience</li>
                    <li>• Track your orders</li>
                    <li>• Access order history</li>
                    <li>• Apply coupons that sync with account</li>
                  </ul>
                </div>
              )}

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
              <button
                onClick={() => navigate('/products')}
                className="block w-full py-3.5 bg-white border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:border-green-300 transition-all duration-300 text-center"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
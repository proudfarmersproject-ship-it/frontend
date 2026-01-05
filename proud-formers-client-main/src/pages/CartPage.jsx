// src/pages/CartPage.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, ArrowRight, Tag, Shield, Truck, RefreshCw } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useUser } from '../context/UserContext';
import CartItem from '../components/CartItem';
import { validateCoupon } from '../utils/api';
import toast from 'react-hot-toast';

const CartPage = () => {
  const { cart, getCartTotal, clearCart } = useCart();
  const { user } = useUser();
  const navigate = useNavigate();
  
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [discount, setDiscount] = useState(0);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  const subtotal = getCartTotal();
  const shipping = subtotal > 100 ? 0 : 9.99;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax - discount;

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error('Please enter a coupon code');
      return;
    }

    setIsApplyingCoupon(true);
    try {
      const coupon = await validateCoupon(couponCode);
      if (coupon) {
        const discountAmount = coupon.discount_type === 'percentage' 
          ? (subtotal * coupon.discount_value) / 100
          : coupon.discount_value;
        
        setAppliedCoupon(coupon);
        setDiscount(discountAmount);
        toast.success(`Coupon applied! Discount: $${discountAmount.toFixed(2)}`);
      } else {
        toast.error('Invalid coupon code');
      }
    } catch (error) {
      toast.error('Error applying coupon');
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setDiscount(0);
    setCouponCode('');
    toast.success('Coupon removed');
  };

  const handleCheckout = () => {
    if (!user) {
      if (confirm('Please login or register to proceed with payment. Would you like to login now?')) {
        navigate('/login');
      }
      return;
    }

    if (cart.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    // Proceed to checkout
    toast.success('Proceeding to payment...');
    // Here you would integrate with payment gateway
  };

  if (cart.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-md mx-auto">
          <ShoppingBag className="h-24 w-24 text-gray-400 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
          <p className="text-gray-600 mb-8">
            Looks like you haven't added any products to your cart yet.
          </p>
          <Link
            to="/"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            Continue Shopping
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Shopping Cart</h1>
      <p className="text-gray-600 mb-8">
        {cart.length} {cart.length === 1 ? 'item' : 'items'} in your cart
      </p>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Cart Items */}
        <div className="lg:w-2/3">
          <div className="space-y-4">
            {cart.map((item) => (
              <CartItem key={`${item.productId}-${item.variant}`} item={item} />
            ))}
          </div>

          <div className="mt-8 flex justify-between">
            <Link
              to="/"
              className="flex items-center text-blue-600 hover:text-blue-700 font-medium"
            >
              <ArrowRight className="h-5 w-5 rotate-180 mr-2" />
              Continue Shopping
            </Link>
            <button
              onClick={clearCart}
              className="flex items-center text-red-600 hover:text-red-700 font-medium"
            >
              <RefreshCw className="h-5 w-5 mr-2" />
              Clear Cart
            </button>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:w-1/3">
          <div className="bg-white rounded-xl shadow-md p-6 sticky top-24">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Order Summary</h3>

            {/* Coupon Section */}
            <div className="mb-6">
              <div className="flex items-center mb-3">
                <Tag className="h-5 w-5 text-blue-600 mr-2" />
                <label className="font-medium text-gray-900">Coupon Code</label>
              </div>
              
              {appliedCoupon ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-green-800">
                        {appliedCoupon.code} Applied
                      </p>
                      <p className="text-sm text-green-600">
                        Discount: ${discount.toFixed(2)}
                      </p>
                    </div>
                    <button
                      onClick={handleRemoveCoupon}
                      className="text-sm text-red-600 hover:text-red-700"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex">
                  <input
                    type="text"
                    placeholder="Enter coupon code"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="flex-1 border border-gray-300 rounded-l-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={handleApplyCoupon}
                    disabled={isApplyingCoupon}
                    className="px-4 py-2 bg-blue-600 text-white rounded-r-lg hover:bg-blue-700 disabled:bg-gray-400"
                  >
                    {isApplyingCoupon ? 'Applying...' : 'Apply'}
                  </button>
                </div>
              )}
            </div>

            {/* Pricing Details */}
            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">${subtotal.toFixed(2)}</span>
              </div>
              
              {discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>-${discount.toFixed(2)}</span>
                </div>
              )}
              
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span className="font-medium">
                  {shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Tax</span>
                <span className="font-medium">${tax.toFixed(2)}</span>
              </div>
              
              <div className="border-t pt-3">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="mb-6 space-y-3">
              <div className="flex items-center text-sm text-gray-600">
                <Shield className="h-5 w-5 text-green-600 mr-2" />
                Secure checkout
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Truck className="h-5 w-5 text-blue-600 mr-2" />
                Free shipping on orders over $100
              </div>
            </div>

            {/* Checkout Button */}
            <button
              onClick={handleCheckout}
              className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold text-lg flex items-center justify-center"
            >
              {user ? 'Proceed to Checkout' : 'Login to Checkout'}
              <ArrowRight className="ml-2 h-5 w-5" />
            </button>

            {!user && (
              <p className="text-sm text-gray-600 text-center mt-3">
                Have an account?{' '}
                <Link to="/login" className="text-blue-600 hover:text-blue-700 font-medium">
                  Sign in
                </Link>{' '}
                for faster checkout
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
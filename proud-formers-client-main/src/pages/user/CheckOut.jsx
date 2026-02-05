// CheckoutPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  MapPin, 
  CreditCard, 
  Shield, 
  CheckCircle, 
  PlusCircle,
  Home,
  User,
  Phone,
  Mail,
  Lock,
  Package,
  Truck,
  AlertCircle,
  Check
} from 'lucide-react';
import { getCurrentUser } from '../../services/authService';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [user, setUser] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [orderSummary, setOrderSummary] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [errors, setErrors] = useState({});
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [saveNewAddress, setSaveNewAddress] = useState(false);
  const [couponApplied, setCouponApplied] = useState(null);

  // New address form state
  const [newAddress, setNewAddress] = useState({
    full_name: '',
    phone: '',
    email: '',
    address_line1: '',
    address_line2: '',
    city: '',
    pincode: '',
    is_default: false
  });

  useEffect(() => {
    loadCheckoutData();
  }, []);

  const loadCheckoutData = async () => {
    try {
      setLoading(true);
      
      // Get user
      const currentUser = getCurrentUser();
      if (!currentUser) {
        navigate('/login', { 
          state: { from: '/checkout', message: 'Please login to checkout' } 
        });
        return;
      }
      setUser(currentUser);

      // Load cart data from localStorage or fetch from API
      const checkoutData = JSON.parse(localStorage.getItem('checkoutData') || '{}');
      
      if (!checkoutData.cartItems || checkoutData.cartItems.length === 0) {
        navigate('/cart');
        return;
      }

      setCartItems(checkoutData.cartItems);
      setOrderSummary({
        subtotal: checkoutData.subtotal || 0,
        discount: checkoutData.discount || 0,
        delivery: checkoutData.delivery || 0,
        tax: checkoutData.tax || 0,
        total: checkoutData.total || 0
      });

      if (checkoutData.appliedCoupon) {
        setCouponApplied(checkoutData.appliedCoupon);
      }

      // Fetch user addresses
      await fetchUserAddresses(currentUser.id);

    } catch (error) {
      console.error('Error loading checkout data:', error);
      navigate('/cart');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserAddresses = async (userId) => {
    try {
      const response = await fetch(`http://localhost:4000/users/${userId}`);
      if (response.ok) {
        const userData = await response.json();
        const userAddresses = userData.addresses || [];
        
        if (userAddresses.length > 0) {
          setAddresses(userAddresses);
          const defaultAddress = userAddresses.find(addr => addr.is_default);
          setSelectedAddress(defaultAddress || userAddresses[0]);
        } else {
          // Create a default address from user info
          const defaultAddress = {
            id: `temp-${Date.now()}`,
            full_name: `${userData.first_name} ${userData.last_name}`,
            phone: userData.phone || '',
            email: userData.email,
            address_line1: '',
            address_line2: '',
            city: '',
            pincode: '',
            is_default: true
          };
          setAddresses([defaultAddress]);
          setSelectedAddress(defaultAddress);
        }
      }
    } catch (error) {
      console.error('Error fetching addresses:', error);
    }
  };

  const validateAddress = (address) => {
    const errors = {};
    if (!address.full_name.trim()) errors.full_name = 'Full name is required';
    if (!address.phone.trim() || address.phone.length < 10) errors.phone = 'Valid phone number is required';
    if (!address.email.trim()) errors.email = 'Email is required';
    if (!address.address_line1.trim()) errors.address_line1 = 'Address line 1 is required';
    if (!address.city.trim()) errors.city = 'City is required';
    if (!address.pincode.trim() || address.pincode.length !== 6) errors.pincode = 'Valid 6-digit pincode is required';
    return errors;
  };

  const handleNewAddressChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewAddress(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleAddNewAddress = () => {
    const validationErrors = validateAddress(newAddress);
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const newAddressWithId = {
      ...newAddress,
      id: `addr-${Date.now()}`,
      is_default: addresses.length === 0 || newAddress.is_default
    };

    const updatedAddresses = [...addresses];
    
    if (newAddressWithId.is_default) {
      updatedAddresses.forEach(addr => addr.is_default = false);
    }
    
    updatedAddresses.push(newAddressWithId);
    setAddresses(updatedAddresses);
    setSelectedAddress(newAddressWithId);
    setShowNewAddressForm(false);
    setErrors({});

    // Reset form
    setNewAddress({
      full_name: '',
      phone: '',
      email: '',
      address_line1: '',
      address_line2: '',
      city: '',
      pincode: '',
      is_default: false
    });

    // Save to database if user chose to save
    if (saveNewAddress && user) {
      saveAddressToDatabase(updatedAddresses);
    }
  };

  const saveAddressToDatabase = async (addressList) => {
    try {
      await fetch(`http://localhost:4000/users/${user.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ addresses: addressList })
      });
    } catch (error) {
      console.error('Error saving address:', error);
    }
  };

  const handleAddressSelect = (address) => {
    setSelectedAddress(address);
  };

  const handlePaymentMethodSelect = (method) => {
    setPaymentMethod(method);
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      alert('Please select a delivery address');
      return;
    }

    if (!paymentMethod) {
      alert('Please select a payment method');
      return;
    }

    setProcessing(true);

    try {
      // Create order object
      const orderData = {
        id: `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        created_at: new Date().toISOString(),
        actual_amount: orderSummary.total,
        sub_total: orderSummary.subtotal,
        discount_amount: orderSummary.discount,
        discount_source: couponApplied?.code || null,
        order_status: 'pending',
        payment_status: 'pending',
        stripe_payment_id: null,
        customer: {
          id: user.id || `CUS-${Date.now()}`,
          first_name: user.name?.split(' ')[0] || '',
          last_name: user.name?.split(' ').slice(1).join(' ') || '',
          email: user.email,
          phone: selectedAddress.phone
        },
        shipping_address: {
          ...selectedAddress
        },
        order_items: cartItems.map(item => ({
          order_item_id: `OITM-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
          product_id: item.productId,
          product_name: item.name,
          variant_id: item.variantId,
          variant_name: item.variantName,
          stock_quantity: item.stock,
          quantity_unit: item.unit || 'pcs',
          quantity: item.quantity,
          price_per_unit: item.price,
          total_price: item.price * item.quantity
        }))
      };

      // Save order to database
      const response = await fetch('http://localhost:4000/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData)
      });

      if (response.ok) {
        // Clear cart
        if (user) {
          await fetch(`http://localhost:4000/users/${user.id}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ cart: [] })
          });
        }
        localStorage.removeItem('cart');
        localStorage.removeItem('checkoutData');

        // Navigate to success page
        navigate('/order-success', { 
          state: { 
            orderId: orderData.id,
            orderTotal: orderData.actual_amount,
            paymentMethod: paymentMethod
          }
        });
      } else {
        throw new Error('Failed to create order');
      }

    } catch (error) {
      console.error('Error placing order:', error);
      alert('Failed to place order. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50/50 to-emerald-50/30 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        <p className="ml-4 text-gray-600">Loading checkout...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50/50 to-emerald-50/30 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate('/cart')}
            className="flex items-center gap-2 text-gray-600 hover:text-green-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Cart
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
          <div className="w-24"></div> {/* Spacer for alignment */}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Delivery & Payment */}
          <div className="lg:col-span-2 space-y-8">
            {/* Delivery Address Section */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Delivery Address</h2>
                    <p className="text-sm text-gray-600">Where should we deliver your order?</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowNewAddressForm(!showNewAddressForm)}
                  className="flex items-center gap-2 text-green-600 hover:text-green-700 font-medium"
                >
                  <PlusCircle className="w-5 h-5" />
                  Add New Address
                </button>
              </div>

              {/* New Address Form */}
              {showNewAddressForm && (
                <div className="mb-6 p-6 border-2 border-dashed border-green-300 rounded-xl bg-green-50/50">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Address</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="full_name"
                        value={newAddress.full_name}
                        onChange={handleNewAddressChange}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                          errors.full_name ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="Enter full name"
                      />
                      {errors.full_name && (
                        <p className="mt-1 text-sm text-red-600">{errors.full_name}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={newAddress.phone}
                        onChange={handleNewAddressChange}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                          errors.phone ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="10-digit phone number"
                      />
                      {errors.phone && (
                        <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                      )}
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={newAddress.email}
                        onChange={handleNewAddressChange}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                          errors.email ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="email@example.com"
                      />
                      {errors.email && (
                        <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                      )}
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Address Line 1 <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="address_line1"
                        value={newAddress.address_line1}
                        onChange={handleNewAddressChange}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                          errors.address_line1 ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="House no., Building, Street"
                      />
                      {errors.address_line1 && (
                        <p className="mt-1 text-sm text-red-600">{errors.address_line1}</p>
                      )}
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Address Line 2 (Optional)
                      </label>
                      <input
                        type="text"
                        name="address_line2"
                        value={newAddress.address_line2}
                        onChange={handleNewAddressChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        placeholder="Area, Landmark, etc."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        City <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={newAddress.city}
                        onChange={handleNewAddressChange}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                          errors.city ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="Enter city"
                      />
                      {errors.city && (
                        <p className="mt-1 text-sm text-red-600">{errors.city}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Pincode <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="pincode"
                        value={newAddress.pincode}
                        onChange={handleNewAddressChange}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                          errors.pincode ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="6-digit pincode"
                        maxLength={6}
                      />
                      {errors.pincode && (
                        <p className="mt-1 text-sm text-red-600">{errors.pincode}</p>
                      )}
                    </div>

                    <div className="md:col-span-2 flex items-center justify-between pt-4 border-t border-gray-200">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="saveAddress"
                          checked={saveNewAddress}
                          onChange={(e) => setSaveNewAddress(e.target.checked)}
                          className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                        />
                        <label htmlFor="saveAddress" className="ml-2 text-sm text-gray-700">
                          Save this address for future orders
                        </label>
                      </div>
                      
                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            setShowNewAddressForm(false);
                            setErrors({});
                          }}
                          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={handleAddNewAddress}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                        >
                          Add Address
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Address Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {addresses.map((address) => (
                  <div
                    key={address.id}
                    onClick={() => handleAddressSelect(address)}
                    className={`border-2 rounded-xl p-4 cursor-pointer transition-all duration-200 ${
                      selectedAddress?.id === address.id
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-green-300'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Home className="w-4 h-4 text-gray-500" />
                          <span className="font-medium text-gray-900">{address.full_name}</span>
                          {address.is_default && (
                            <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">
                              Default
                            </span>
                          )}
                        </div>
                        
                        <div className="space-y-1 text-sm text-gray-600">
                          <p>{address.address_line1}</p>
                          {address.address_line2 && <p>{address.address_line2}</p>}
                          <p>{address.city} - {address.pincode}</p>
                          <p className="flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {address.phone}
                          </p>
                          <p className="flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {address.email}
                          </p>
                        </div>
                      </div>
                      
                      {selectedAddress?.id === address.id && (
                        <div className="text-green-600">
                          <CheckCircle className="w-5 h-5" />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {addresses.length === 0 && !showNewAddressForm && (
                <div className="text-center py-8">
                  <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No addresses saved. Add a new address to continue.</p>
                </div>
              )}
            </div>

            {/* Payment Method Section */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Payment Method</h2>
                  <p className="text-sm text-gray-600">Choose how you want to pay</p>
                </div>
              </div>

              <div className="space-y-4">
                {/* Credit/Debit Card */}
                <div
                  onClick={() => handlePaymentMethodSelect('card')}
                  className={`border-2 rounded-xl p-4 cursor-pointer transition-all duration-200 ${
                    paymentMethod === 'card'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-8 bg-gray-100 rounded flex items-center justify-center">
                        <CreditCard className="w-6 h-6 text-gray-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Credit / Debit Card</h3>
                        <p className="text-sm text-gray-600">Pay with your card securely</p>
                      </div>
                    </div>
                    {paymentMethod === 'card' && (
                      <div className="text-blue-600">
                        <CheckCircle className="w-5 h-5" />
                      </div>
                    )}
                  </div>
                  
                  {paymentMethod === 'card' && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Card Number
                          </label>
                          <input
                            type="text"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="1234 5678 9012 3456"
                            maxLength={19}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Expiry Date
                          </label>
                          <input
                            type="text"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="MM/YY"
                            maxLength={5}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            CVV
                          </label>
                          <input
                            type="text"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="123"
                            maxLength={3}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Name on Card
                          </label>
                          <input
                            type="text"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="John Doe"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* UPI */}
                <div
                  onClick={() => handlePaymentMethodSelect('upi')}
                  className={`border-2 rounded-xl p-4 cursor-pointer transition-all duration-200 ${
                    paymentMethod === 'upi'
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-purple-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-8 bg-purple-100 rounded flex items-center justify-center">
                        <div className="font-bold text-purple-600">UPI</div>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">UPI Payment</h3>
                        <p className="text-sm text-gray-600">Pay using UPI apps</p>
                      </div>
                    </div>
                    {paymentMethod === 'upi' && (
                      <div className="text-purple-600">
                        <CheckCircle className="w-5 h-5" />
                      </div>
                    )}
                  </div>
                  
                  {paymentMethod === 'upi' && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex gap-3">
                        <input
                          type="text"
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                          placeholder="Enter UPI ID (e.g., name@upi)"
                        />
                        <button className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                          Verify
                        </button>
                      </div>
                      <p className="text-sm text-gray-500 mt-2">
                        Supported: Google Pay, PhonePe, Paytm, BHIM UPI
                      </p>
                    </div>
                  )}
                </div>

                {/* Net Banking */}
                <div
                  onClick={() => handlePaymentMethodSelect('netbanking')}
                  className={`border-2 rounded-xl p-4 cursor-pointer transition-all duration-200 ${
                    paymentMethod === 'netbanking'
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-200 hover:border-indigo-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-8 bg-indigo-100 rounded flex items-center justify-center">
                        <div className="font-bold text-indigo-600">NB</div>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Net Banking</h3>
                        <p className="text-sm text-gray-600">Pay using your bank account</p>
                      </div>
                    </div>
                    {paymentMethod === 'netbanking' && (
                      <div className="text-indigo-600">
                        <CheckCircle className="w-5 h-5" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Cash on Delivery */}
                <div
                  onClick={() => handlePaymentMethodSelect('cod')}
                  className={`border-2 rounded-xl p-4 cursor-pointer transition-all duration-200 ${
                    paymentMethod === 'cod'
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-green-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-8 bg-green-100 rounded flex items-center justify-center">
                        <Package className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Cash on Delivery</h3>
                        <p className="text-sm text-gray-600">Pay when you receive your order</p>
                      </div>
                    </div>
                    {paymentMethod === 'cod' && (
                      <div className="text-green-600">
                        <CheckCircle className="w-5 h-5" />
                      </div>
                    )}
                  </div>
                  
                  {paymentMethod === 'cod' && (
                    <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-center gap-2 text-yellow-700">
                        <AlertCircle className="w-4 h-4" />
                        <p className="text-sm">Additional ₹30 charge may apply for COD orders</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Secure Payment Info */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center gap-3 text-gray-600">
                  <Shield className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="text-sm font-medium">Secure Payment</p>
                    <p className="text-xs">Your payment information is encrypted and secure</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>

              {/* Order Items Preview */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium text-gray-900">Items ({cartItems.length})</h3>
                  <button
                    onClick={() => navigate('/cart')}
                    className="text-sm text-green-600 hover:text-green-700"
                  >
                    Edit
                  </button>
                </div>
                
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {cartItems.map((item, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                        <p className="text-xs text-gray-500">{item.variantName}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-gray-900">
                          ₹{(item.price * item.quantity).toFixed(2)}
                        </p>
                        <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">₹{orderSummary.subtotal.toFixed(2)}</span>
                </div>
                
                {orderSummary.discount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Discount</span>
                    <span className="text-green-600 font-medium">
                      -₹{orderSummary.discount.toFixed(2)}
                      {couponApplied && (
                        <span className="text-xs ml-2">({couponApplied.code})</span>
                      )}
                    </span>
                  </div>
                )}
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Delivery</span>
                  <span className={`font-medium ${orderSummary.delivery === 0 ? 'text-green-600' : ''}`}>
                    {orderSummary.delivery === 0 ? 'FREE' : `₹${orderSummary.delivery.toFixed(2)}`}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax (18% GST)</span>
                  <span className="font-medium">₹{orderSummary.tax.toFixed(2)}</span>
                </div>
                
                <div className="border-t pt-3">
                  <div className="flex justify-between text-lg">
                    <span className="font-bold">Total Amount</span>
                    <span className="font-bold text-green-600">₹{orderSummary.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Delivery Info */}
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <div className="flex items-center gap-3">
                  <Truck className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="font-medium text-blue-800">Estimated Delivery</p>
                    <p className="text-sm text-blue-600">
                      {selectedAddress?.city === 'Bengaluru' || 
                       selectedAddress?.city === 'Mumbai' ||
                       selectedAddress?.city === 'Delhi' ||
                       selectedAddress?.city === 'Chennai' ||
                       selectedAddress?.city === 'Kolkata' ||
                       selectedAddress?.city === 'Hyderabad' ? 'Same Day' : '2-3 Business Days'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Place Order Button */}
              <button
                onClick={handlePlaceOrder}
                disabled={processing || !selectedAddress}
                className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 active:scale-95 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {processing ? (
                  <div className="flex items-center justify-center gap-3">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Processing Order...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-3">
                    <Lock className="w-5 h-5" />
                    <span>
                      {paymentMethod === 'cod' ? 'Place Order (COD)' : `Pay ${formatCurrency(orderSummary.total)}`}
                    </span>
                  </div>
                )}
              </button>

              {/* Terms and Conditions */}
              <div className="mt-6 text-center">
                <p className="text-xs text-gray-500">
                  By placing your order, you agree to our{' '}
                  <a href="/terms" className="text-green-600 hover:underline">Terms & Conditions</a>
                  {' '}and{' '}
                  <a href="/privacy" className="text-green-600 hover:underline">Privacy Policy</a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
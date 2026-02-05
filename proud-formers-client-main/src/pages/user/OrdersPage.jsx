// MyOrdersPage.jsx or OrdersPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Package, 
  Calendar, 
  DollarSign, 
  Truck, 
  CheckCircle, 
  Clock, 
  XCircle, 
  AlertCircle,
  Eye,
  Filter,
  Search,
  ChevronDown,
  ChevronUp,
  User,
  MapPin,
  ShoppingBag,
  RefreshCw,
  Home
} from 'lucide-react';
import { getCurrentUser } from '../../services/authService'; // Import your auth service

const OrdersPage = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  // Fetch user data and orders on component mount
  useEffect(() => {
    const user = getCurrentUser();
    if (!user) {
      navigate('/login');
      return;
    }
    setCurrentUser(user);
    fetchUserOrders(user.email);
  }, [navigate]);

  const fetchUserOrders = async (userEmail) => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:4000/orders');
      
      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }
      
      const allOrders = await response.json();
      
      // Filter orders to show only current user's orders
      const userOrders = allOrders.filter(order => 
        order.customer.email.toLowerCase() === userEmail.toLowerCase()
      );
      
      setOrders(userOrders);
      
      if (userOrders.length === 0) {
        setError('No orders found for your account.');
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Failed to load your orders. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Filter orders based on search term and status
  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.order_items.some(item => 
        item.product_name.toLowerCase().includes(searchTerm.toLowerCase())
      );

    const matchesStatus = 
      statusFilter === 'all' || 
      order.order_status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Toggle order details
  const toggleOrderDetails = (orderId) => {
    if (expandedOrder === orderId) {
      setExpandedOrder(null);
    } else {
      setExpandedOrder(orderId);
    }
  };

  // Get status badge style
  const getStatusBadge = (status) => {
    switch (status) {
      case 'delivered':
        return {
          bg: 'bg-green-100',
          text: 'text-green-800',
          icon: <CheckCircle className="w-4 h-4" />,
          label: 'Delivered'
        };
      case 'pending':
        return {
          bg: 'bg-yellow-100',
          text: 'text-yellow-800',
          icon: <Clock className="w-4 h-4" />,
          label: 'Pending'
        };
      case 'confirmed':
        return {
          bg: 'bg-blue-100',
          text: 'text-blue-800',
          icon: <Package className="w-4 h-4" />,
          label: 'Confirmed'
        };
      case 'cancelled':
        return {
          bg: 'bg-red-100',
          text: 'text-red-800',
          icon: <XCircle className="w-4 h-4" />,
          label: 'Cancelled'
        };
      default:
        return {
          bg: 'bg-gray-100',
          text: 'text-gray-800',
          icon: <AlertCircle className="w-4 h-4" />,
          label: status
        };
    }
  };

  // Get payment status badge style
  const getPaymentBadge = (status) => {
    switch (status) {
      case 'paid':
        return {
          bg: 'bg-green-100',
          text: 'text-green-800',
          label: 'Paid'
        };
      case 'pending':
        return {
          bg: 'bg-yellow-100',
          text: 'text-yellow-800',
          label: 'Pending'
        };
      case 'failed':
        return {
          bg: 'bg-red-100',
          text: 'text-red-800',
          label: 'Failed'
        };
      default:
        return {
          bg: 'bg-gray-100',
          text: 'text-gray-800',
          label: status
        };
    }
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  // Handle refresh
  const handleRefresh = () => {
    if (currentUser) {
      fetchUserOrders(currentUser.email);
    }
  };

  // Go to homepage
  const goToHomepage = () => {
    navigate('/');
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="mt-4 text-gray-600">Loading your orders...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
              <p className="mt-2 text-gray-600">
                View all your past and current orders
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={goToHomepage}
                className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                <Home className="w-4 h-4 mr-2" />
                Home
              </button>
              <button
                onClick={handleRefresh}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </button>
            </div>
          </div>
          
          {/* User Info */}
          {currentUser && (
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                  <User className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {currentUser.name || currentUser.email}
                  </h3>
                  <p className="text-gray-600">{currentUser.email}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{orders.length}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <ShoppingBag className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Spent</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {formatCurrency(orders.reduce((sum, order) => sum + order.actual_amount, 0))}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Orders</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {orders.filter(o => o.order_status === 'pending' || o.order_status === 'confirmed').length}
                </p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search your orders by ID or product name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <Filter className="w-5 h-5 text-gray-400 mr-2" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Orders</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-500 mr-3" />
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Orders List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {filteredOrders.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">
                {searchTerm || statusFilter !== 'all' 
                  ? 'No orders match your search' 
                  : 'You have no orders yet'}
              </p>
              {!searchTerm && statusFilter === 'all' && (
                <button
                  onClick={goToHomepage}
                  className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Start Shopping
                </button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredOrders.map((order) => {
                const statusBadge = getStatusBadge(order.order_status);
                const paymentBadge = getPaymentBadge(order.payment_status);
                
                return (
                  <div key={order.id} className="p-6 hover:bg-gray-50">
                    {/* Order Header */}
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
                      <div>
                        <div className="flex items-center mb-2">
                          <h3 className="text-lg font-semibold text-gray-900 mr-3">{order.id}</h3>
                          <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusBadge.bg} ${statusBadge.text}`}>
                            {statusBadge.icon}
                            <span className="ml-2">{statusBadge.label}</span>
                          </div>
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <Calendar className="w-4 h-4 mr-1" />
                          {formatDate(order.created_at)}
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-end">
                        <div className="text-xl font-bold text-gray-900">
                          {formatCurrency(order.actual_amount)}
                        </div>
                        {order.discount_amount > 0 && (
                          <div className="text-sm text-green-600">
                            Saved {formatCurrency(order.discount_amount)}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Order Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center text-sm text-gray-600 mb-1">
                          <ShoppingBag className="w-4 h-4 mr-2" />
                          Items
                        </div>
                        <div className="font-medium">
                          {order.order_items.length} item{order.order_items.length !== 1 ? 's' : ''}
                        </div>
                        <div className="text-sm text-gray-500 truncate">
                          {order.order_items.map(item => item.product_name).join(', ')}
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center text-sm text-gray-600 mb-1">
                          <Truck className="w-4 h-4 mr-2" />
                          Delivery
                        </div>
                        <div className="font-medium">
                          {order.shipping_address.city}
                        </div>
                        <div className="text-sm text-gray-500">
                          {order.shipping_address.pincode}
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center text-sm text-gray-600 mb-1">
                          <DollarSign className="w-4 h-4 mr-2" />
                          Payment
                        </div>
                        <div className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${paymentBadge.bg} ${paymentBadge.text}`}>
                          {paymentBadge.label}
                        </div>
                        {order.stripe_payment_id && (
                          <div className="text-xs text-gray-500 mt-1 truncate">
                            ID: {order.stripe_payment_id}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Toggle Details Button */}
                    <button
                      onClick={() => toggleOrderDetails(order.id)}
                      className="flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      {expandedOrder === order.id ? 'Hide' : 'View'} Order Details
                      {expandedOrder === order.id ? (
                        <ChevronUp className="w-4 h-4 ml-1" />
                      ) : (
                        <ChevronDown className="w-4 h-4 ml-1" />
                      )}
                    </button>

                    {/* Expanded Order Details */}
                    {expandedOrder === order.id && (
                      <div className="mt-6 pt-6 border-t border-gray-200">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          {/* Order Items Details */}
                          <div>
                            <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                              <ShoppingBag className="w-5 h-5 mr-2" />
                              Order Items
                            </h4>
                            <div className="space-y-3">
                              {order.order_items.map((item) => (
                                <div key={item.order_item_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                  <div className="flex-1">
                                    <div className="font-medium text-gray-900">{item.product_name}</div>
                                    <div className="text-sm text-gray-500">
                                      {item.variant_name} • {item.quantity} {item.quantity_unit}
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <div className="font-medium text-gray-900">
                                      {formatCurrency(item.total_price)}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                      {formatCurrency(item.price_per_unit)}/{item.quantity_unit}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Shipping Address Details */}
                          <div>
                            <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                              <MapPin className="w-5 h-5 mr-2" />
                              Shipping Address
                            </h4>
                            <div className="bg-gray-50 rounded-lg p-4">
                              <div className="space-y-2">
                                <p className="font-medium">{order.shipping_address.full_name}</p>
                                <p className="text-gray-600">{order.shipping_address.address_line1}</p>
                                {order.shipping_address.address_line2 && (
                                  <p className="text-gray-600">{order.shipping_address.address_line2}</p>
                                )}
                                <p className="text-gray-600">
                                  {order.shipping_address.city} - {order.shipping_address.pincode}
                                </p>
                                <p className="text-gray-600">Phone: {order.shipping_address.phone}</p>
                                <p className="text-gray-600">Email: {order.shipping_address.email}</p>
                              </div>
                            </div>

                            {/* Order Summary */}
                            <div className="mt-6">
                              <h4 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h4>
                              <div className="space-y-2 bg-gray-50 rounded-lg p-4">
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Subtotal</span>
                                  <span className="font-medium">{formatCurrency(order.sub_total)}</span>
                                </div>
                                {order.discount_amount > 0 && (
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">Discount</span>
                                    <span className="text-green-600 font-medium">
                                      -{formatCurrency(order.discount_amount)}
                                      {order.discount_source && (
                                        <span className="text-xs ml-2">({order.discount_source})</span>
                                      )}
                                    </span>
                                  </div>
                                )}
                                <div className="flex justify-between pt-2 border-t border-gray-300">
                                  <span className="font-semibold text-gray-900">Total Amount</span>
                                  <span className="font-bold text-gray-900">{formatCurrency(order.actual_amount)}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrdersPage;
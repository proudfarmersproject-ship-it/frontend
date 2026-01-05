import { useState, useEffect, useRef } from 'react';
import { Search, User, ShoppingCart, Menu, X, ChevronDown, Package, MapPin, LogOut, Edit, Truck, Star, Shield, Gift } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { logoutUser, getCurrentUser, isAuthenticated } from '../../services/authService';

const Navbar = () => {
  const navigate = useNavigate();
  const [currentAnnouncementIndex, setCurrentAnnouncementIndex] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const searchRef = useRef(null);
  const userRef = useRef(null);
  const announcementIntervalRef = useRef(null);

  const announcements = [
    { text: "Free shipping on orders over £50", icon: Truck },
    { text: "4.8/5 Customer Satisfaction", icon: Star },
    { text: "100% Quality Guarantee", icon: Shield },
    { text: "New User? Get 20% OFF", icon: Gift }
  ];

  // Fetch logged-in user from API
  useEffect(() => {
    const fetchLoggedInUser = async () => {
      try {
        setLoading(true);
        
        // First check localStorage for logged-in user
        const storedUser = getCurrentUser();
        
        if (storedUser) {
          // User is logged in, fetch full user details from API
          const usersRes = await fetch('http://localhost:4000/users');
          const usersData = await usersRes.json();
          
          // Find the user in database by email (from localStorage)
          const loggedInUser = usersData.find(user => 
            user && user.email && user.email === storedUser.email
          );
          
          if (loggedInUser) {
            console.log('Logged in user found:', loggedInUser); // Debug
            setCurrentUser(loggedInUser);
          } else {
            console.log('User not found in database, clearing storage');
            await logoutUser();
            setCurrentUser(null);
          }
        } else {
          // No user in localStorage
          setCurrentUser(null);
        }
        
      } catch (error) {
        console.error('Error fetching user:', error);
        setCurrentUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchLoggedInUser();
  }, []);

  // Also listen for auth state changes
  useEffect(() => {
    const checkAuthState = () => {
      const storedUser = getCurrentUser();
      if (!storedUser) {
        setCurrentUser(null);
      }
    };

    // Listen for storage events
    const handleStorageChange = (e) => {
      if (e.key === 'user' || e.key === null) {
        checkAuthState();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Check every 2 seconds
    const interval = setInterval(checkAuthState, 2000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  // Fetch products for search
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const productsRes = await fetch('http://localhost:4000/products');
        const productsData = await productsRes.json();
        setProducts(productsData);
      } catch (err) {
        console.error('Error fetching products:', err);
      }
    };
    fetchProducts();
  }, []);

  // Announcement auto-slide
  useEffect(() => {
    announcementIntervalRef.current = setInterval(() => {
      setCurrentAnnouncementIndex((prev) => (prev + 1) % announcements.length);
    }, 4000);

    return () => {
      if (announcementIntervalRef.current) {
        clearInterval(announcementIntervalRef.current);
      }
    };
  }, []);

  const pauseAnnouncement = () => {
    if (announcementIntervalRef.current) {
      clearInterval(announcementIntervalRef.current);
    }
  };

  const resumeAnnouncement = () => {
    if (announcementIntervalRef.current) {
      clearInterval(announcementIntervalRef.current);
    }
    announcementIntervalRef.current = setInterval(() => {
      setCurrentAnnouncementIndex((prev) => (prev + 1) % announcements.length);
    }, 4000);
  };

  // Search logic
  useEffect(() => {
    if (searchQuery.length >= 2) {
      const filtered = products.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 6);
      setSearchResults(filtered);
      setShowSearchDropdown(true);
    } else {
      setSearchResults([]);
      setShowSearchDropdown(false);
    }
  }, [searchQuery, products]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchDropdown(false);
      }
      if (userRef.current && !userRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setShowSearchDropdown(false);
    }
  };

  const handleSearchResultClick = (product) => {
    navigate(`/product/${product.id}`);
    setSearchQuery('');
    setShowSearchDropdown(false);
  };

  // Logout function
  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logoutUser();
      setCurrentUser(null);
      setUserMenuOpen(false);
      setMobileMenuOpen(false);
      navigate('/');
      console.log('Logged out successfully');
    } catch (error) {
      console.error('Logout failed:', error);
      alert('Logout failed. Please try again.');
    } finally {
      setIsLoggingOut(false);
    }
  };

  // Helper function to get user's display name
  const getUserDisplayName = () => {
    if (!currentUser) return '';
    
    if (currentUser.first_name && currentUser.last_name) {
      return `${currentUser.first_name} ${currentUser.last_name}`;
    }
    if (currentUser.first_name) {
      return currentUser.first_name;
    }
    return currentUser.email || 'User';
  };

  // Helper function to get user's first name for greeting
  const getUserFirstName = () => {
    if (!currentUser) return '';
    
    if (currentUser.first_name) return currentUser.first_name;
    return currentUser.email?.split('@')[0] || 'User';
  };

  // Helper function to get default address
  const getDefaultAddress = () => {
    if (!currentUser || !currentUser.addresses) return null;
    
    if (Array.isArray(currentUser.addresses)) {
      return currentUser.addresses.find(addr => addr.is_default);
    }
    return currentUser.addresses;
  };

  // Refresh user data
  const refreshUserData = async () => {
    try {
      const storedUser = getCurrentUser();
      if (storedUser) {
        const usersRes = await fetch('http://localhost:4000/users');
        const usersData = await usersRes.json();
        const loggedInUser = usersData.find(user => 
          user && user.email && user.email === storedUser.email
        );
        if (loggedInUser) {
          setCurrentUser(loggedInUser);
        }
      }
    } catch (error) {
      console.error('Error refreshing user data:', error);
    }
  };

  const CurrentAnnouncementIcon = announcements[currentAnnouncementIndex]?.icon || Truck;

  return (
    <div className="w-full bg-white shadow-sm sticky top-0 z-50">
      {/* Top Announcement Bar */}
      <div 
        className="bg-gradient-to-r from-green-50 via-emerald-50 to-teal-50 border-b border-green-100"
        onMouseEnter={pauseAnnouncement}
        onMouseLeave={resumeAnnouncement}
      >
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-center py-2">
            <div className="flex items-center gap-2">
              <CurrentAnnouncementIcon className="w-4 h-4 text-green-600 flex-shrink-0" />
              <p className="text-sm font-medium text-gray-800">
                {announcements[currentAnnouncementIndex].text}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4">
          {/* Top Row */}
          <div className="flex items-center justify-between py-4">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className="relative">
                <div className="w-11 h-11 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                  <div className="w-7 h-7 bg-white rounded-lg flex items-center justify-center">
                    <div className="w-4 h-4 bg-green-500 rounded-md"></div>
                  </div>
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                  Fresh<span className="text-green-600">Mart</span>
                </h1>
                <p className="text-xs text-gray-500 -mt-1 font-medium">Quality Groceries Delivered</p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-8">
              <div className="h-6 w-px bg-gray-200"></div>
              
              <div className="flex items-center gap-4">
                {/* User Menu */}
                <div className="relative" ref={userRef}>
                  {currentUser ? (
                    <>
                      <button
                        onClick={() => setUserMenuOpen(!userMenuOpen)}
                        className="flex items-center gap-3 p-2 rounded-xl hover:bg-green-50 transition-all duration-200 border border-transparent hover:border-green-200"
                      >
                        <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-md">
                          <User className="w-5 h-5 text-white" />
                        </div>
                        <div className="text-left">
                          <div className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                            Hi, {getUserFirstName()}
                            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                          </div>
                          <div className="text-xs text-gray-500">
                            {getDefaultAddress()?.city || 'Add your address'}
                          </div>
                        </div>
                      </button>

                      {userMenuOpen && (
                        <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 animate-in slide-in-from-top-2 backdrop-blur-sm">
                          <div className="px-4 py-3 border-b border-gray-100">
                            <div className="font-semibold text-lg text-gray-900">
                              {getUserDisplayName()}
                            </div>
                            <div className="text-sm text-gray-600 mt-1">{currentUser.email}</div>
                            <div className="text-sm text-gray-500 mt-1">{currentUser.phone}</div>
                            {getDefaultAddress() && (
                              <div className="flex items-center gap-2 mt-2 text-sm text-gray-500 bg-gray-50 p-2 rounded-lg">
                                <MapPin className="w-3 h-3" />
                                <span className="truncate">
                                  {getDefaultAddress().city}, {getDefaultAddress().pincode}
                                </span>
                              </div>
                            )}
                          </div>
                          
                          <div className="py-2">
                            <Link
                              to="/profile"
                              className="flex items-center gap-3 px-4 py-3 hover:bg-green-50 text-gray-700 transition-colors hover:text-green-700 rounded-lg mx-2"
                              onClick={() => setUserMenuOpen(false)}
                            >
                              <Edit className="w-4 h-4" />
                              <span className="font-medium">Edit Profile</span>
                            </Link>
                            <Link
                              to="/orders"
                              className="flex items-center gap-3 px-4 py-3 hover:bg-green-50 text-gray-700 transition-colors hover:text-green-700 rounded-lg mx-2"
                              onClick={() => setUserMenuOpen(false)}
                            >
                              <Package className="w-4 h-4" />
                              <span className="font-medium">My Orders</span>
                              <span className="ml-auto bg-green-100 text-green-600 text-xs font-semibold px-2 py-1 rounded-full">3</span>
                            </Link>
                          </div>
                          
                          <div className="border-t border-gray-100 pt-2">
                            <button
                              onClick={handleLogout}
                              disabled={isLoggingOut}
                              className="flex items-center gap-3 w-full px-4 py-3 hover:bg-red-50 text-gray-700 transition-colors hover:text-red-600 rounded-lg mx-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {isLoggingOut ? (
                                <>
                                  <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                                  <span className="font-medium">Logging out...</span>
                                </>
                              ) : (
                                <>
                                  <LogOut className="w-4 h-4" />
                                  <span className="font-medium">Logout</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <Link
                      to="/login"
                      className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-300 font-medium shadow-md hover:shadow-lg"
                    >
                      <User className="w-4 h-4" />
                      Sign In
                    </Link>
                  )}
                </div>

                {/* Cart */}
                <Link to="/cart" className="relative">
                  <button className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 rounded-xl hover:bg-gradient-to-r hover:from-green-100 hover:to-emerald-100 transition-all duration-300 font-medium border border-green-200 hover:border-green-300 shadow-sm hover:shadow">
                    <ShoppingCart className="w-5 h-5" />
                    <span>Cart</span>
                    <span className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-br from-green-500 to-emerald-600 text-white text-xs rounded-full flex items-center justify-center font-bold shadow-lg">
                      3
                    </span>
                  </button>
                </Link>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <div className="lg:hidden flex items-center gap-3">
              <Link to="/cart" className="relative p-2">
                <ShoppingCart className="w-6 h-6 text-gray-700" />
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-green-500 to-emerald-600 text-white text-xs rounded-full flex items-center justify-center font-bold shadow">
                  3
                </span>
              </Link>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="pb-4" ref={searchRef}>
            <form onSubmit={handleSearch} className="relative">
              <div className="relative group">
                <input
                  type="text"
                  placeholder="Search for fruits, vegetables, dairy, meat..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-14 pr-24 py-3.5 bg-gray-50 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all duration-300 placeholder-gray-500 text-gray-900 font-medium"
                />
                <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-green-500 transition-colors" />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 px-5 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-sm font-semibold rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-300 shadow-md hover:shadow-lg active:scale-95"
                >
                  Search
                </button>
              </div>

              {/* Search Results Dropdown */}
              {showSearchDropdown && searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 max-h-96 overflow-auto z-50 animate-in slide-in-from-top-3">
                  <div className="p-3 border-b border-gray-100">
                    <div className="text-sm font-semibold text-gray-700">
                      Found {searchResults.length} results for "{searchQuery}"
                    </div>
                  </div>
                  
                  {searchResults.map((product) => (
                    <div
                      key={product.id}
                      onClick={() => handleSearchResultClick(product)}
                      className="flex items-center gap-4 px-4 py-3 hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 cursor-pointer transition-all duration-200 border-b border-gray-50 last:border-b-0 group"
                    >
                      <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
                        <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg"></div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-gray-900 truncate group-hover:text-green-700">
                          {product.name}
                        </div>
                        <div className="text-sm text-gray-600 mt-1 line-clamp-1">
                          {product.description}
                        </div>
                        {product.product_variants?.[0] && (
                          <div className="flex items-center gap-3 mt-2">
                            <span className="text-lg font-bold text-green-600">
                              ₹{product.product_variants[0].variant_price}
                            </span>
                            <span className="text-sm text-gray-500 line-through">
                              ₹{(product.product_variants[0].variant_price * 1.2).toFixed(0)}
                            </span>
                            <span className="text-xs font-semibold bg-red-100 text-red-600 px-2 py-0.5 rounded-full">
                              Save 20%
                            </span>
                          </div>
                        )}
                      </div>
                      <ChevronDown className="w-4 h-4 text-gray-400 transform -rotate-90" />
                    </div>
                  ))}
                  
                  <div className="p-4 border-t border-gray-100 bg-gradient-to-r from-green-50 to-emerald-50">
                    <Link
                      to={`/search?q=${encodeURIComponent(searchQuery)}`}
                      className="block text-center px-4 py-3 bg-white border-2 border-green-500 text-green-600 font-semibold rounded-xl hover:bg-green-50 transition-all duration-300"
                    >
                      View All Search Results →
                    </Link>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-white animate-in slide-in-from-right-2">
          <div className="h-full flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-green-50 to-emerald-50">
              <div className="flex items-center justify-between mb-4">
                <Link to="/" className="flex items-center gap-3" onClick={() => setMobileMenuOpen(false)}>
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                    <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                      <div className="w-5 h-5 bg-green-500 rounded-md"></div>
                    </div>
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-gray-900">FreshMart</h1>
                    <p className="text-xs text-gray-600 font-medium">Quality Groceries</p>
                  </div>
                </Link>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded-xl hover:bg-white transition-colors shadow-sm"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* User Section */}
            <div className="p-4 border-b border-gray-100">
              {currentUser ? (
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <User className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-lg text-gray-900">
                      {getUserDisplayName()}
                    </div>
                    <div className="text-sm text-gray-600">{currentUser.email}</div>
                    <div className="text-sm text-gray-500">{currentUser.phone}</div>
                    {getDefaultAddress() && (
                      <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                        <MapPin className="w-3 h-3" />
                        {getDefaultAddress().city}, {getDefaultAddress().pincode}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="mb-4">
                  <Link
                    to="/login"
                    className="block w-full text-center py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl font-bold text-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-300 shadow-lg"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign In / Register
                  </Link>
                </div>
              )}
            </div>

            {/* Navigation Links */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-1">
                <Link
                  to="/profile"
                  className="flex items-center gap-3 p-4 rounded-xl hover:bg-green-50 transition-colors text-gray-700"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Edit className="w-5 h-5 text-gray-500" />
                  <span className="font-medium">My Profile</span>
                </Link>
                <Link
                  to="/orders"
                  className="flex items-center gap-3 p-4 rounded-xl hover:bg-green-50 transition-colors text-gray-700"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Package className="w-5 h-5 text-gray-500" />
                  <span className="font-medium">My Orders</span>
                  <span className="ml-auto bg-green-100 text-green-600 text-xs font-semibold px-2 py-1 rounded-full">3</span>
                </Link>
                <a href="#" className="flex items-center gap-3 p-4 rounded-xl hover:bg-green-50 transition-colors text-gray-700">
                  <Truck className="w-5 h-5 text-gray-500" />
                  <span className="font-medium">Track Order</span>
                </a>
                <a href="#" className="flex items-center gap-3 p-4 rounded-xl hover:bg-green-50 transition-colors text-gray-700">
                  <Shield className="w-5 h-5 text-gray-500" />
                  <span className="font-medium">Help Center</span>
                </a>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-100">
              {currentUser && (
                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="flex items-center justify-center gap-2 w-full py-3.5 bg-gradient-to-r from-red-50 to-red-100 text-red-600 rounded-xl font-semibold hover:from-red-100 hover:to-red-200 transition-all duration-300 mb-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoggingOut ? (
                    <>
                      <div className="w-5 h-5 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                      <span>Logging out...</span>
                    </>
                  ) : (
                    <>
                      <LogOut className="w-5 h-5" />
                      <span>Logout</span>
                    </>
                  )}
                </button>
              )}
              <div className="text-center text-xs text-gray-500">
                © 2024 FreshMart. All rights reserved.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Navbar;
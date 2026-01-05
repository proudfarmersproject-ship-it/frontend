import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Filter, Star, Package, ShoppingCart, X, ChevronDown, Sliders } from 'lucide-react';

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('featured');
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [expandedFilter, setExpandedFilter] = useState(null);
  
  // New state to track selected variant for each product
  const [selectedVariants, setSelectedVariants] = useState({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        fetch('http://localhost:4000/products'),
        fetch('http://localhost:4000/categories')
      ]);

      const productsData = await productsRes.json();
      const categoriesData = await categoriesRes.json();

      setProducts(productsData);
      setCategories(categoriesData);
      
      // Initialize selected variants - default to first variant for each product
      const initialVariants = {};
      productsData.forEach(product => {
        if (product.product_variants && product.product_variants.length > 0) {
          initialVariants[product.id] = product.product_variants[0].id;
        }
      });
      setSelectedVariants(initialVariants);
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  // Select variant for a product
  const selectVariant = (productId, variantId) => {
    setSelectedVariants(prev => ({
      ...prev,
      [productId]: variantId
    }));
  };

  // Add to Cart Function
  const addToCart = (product) => {
    // Get the selected variant ID for this product
    const selectedVariantId = selectedVariants[product.id];
    
    // Find the variant object
    const selectedVariant = product.product_variants.find(
      variant => variant.id === selectedVariantId
    );

    if (!selectedVariant) {
      alert('Please select a variant first!');
      return;
    }

    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    
    // Find if product already exists in cart
    const existingItemIndex = cart.findIndex(item => 
      item.productId === product.id && 
      item.variantId === selectedVariant.id
    );

    if (existingItemIndex >= 0) {
      // Update quantity
      cart[existingItemIndex].quantity += 1;
    } else {
      // Add new item
      cart.push({
        productId: product.id,
        variantId: selectedVariant.id,
        name: product.name,
        variantName: `${selectedVariant.variant_quantity} ${selectedVariant.quantity_unit}`,
        price: selectedVariant.variant_price || 0,
        image: product.product_images?.find(img => img.is_primary)?.image_path || '',
        quantity: 1,
        stock: product.stock_quantity
      });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Show notification
    alert(`${product.name} (${selectedVariant.variant_quantity} ${selectedVariant.quantity_unit}) added to cart!`);
  };

  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'all' || product.category_id === selectedCategory;
    const minPrice = Math.min(...product.product_variants.map(v => v.variant_price));
    const matchesPrice = minPrice >= priceRange[0] && minPrice <= priceRange[1];
    
    return matchesCategory && matchesPrice && product.is_active;
  });

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    const priceA = Math.min(...a.product_variants.map(v => v.variant_price));
    const priceB = Math.min(...b.product_variants.map(v => v.variant_price));
    
    switch(sortBy) {
      case 'price-low':
        return priceA - priceB;
      case 'price-high':
        return priceB - priceA;
      case 'name':
        return a.name.localeCompare(b.name);
      case 'featured':
      default:
        return (b.is_featured || false) - (a.is_featured || false);
    }
  });

  const getCategoryIcon = (categoryName) => {
    const iconMap = {
      'Organic Grains': '🌾',
      'Cold-Pressed Oils': '🫒',
      'Farm Fresh Spices': '🌶️',
      'Natural Sweeteners': '🍯',
      'Dry Fruits & Nuts': '🥜',
    };
    return iconMap[categoryName] || '📦';
  };

  const clearAllFilters = () => {
    setSelectedCategory('all');
    setPriceRange([0, 10000]);
    setSortBy('featured');
    setShowMobileFilters(false);
  };

  const hasActiveFilters = selectedCategory !== 'all' || priceRange[1] < 10000 || sortBy !== 'featured';

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50/50 to-emerald-50/30 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading fresh products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50/50 to-emerald-50/30">
      {/* Mobile Filter Button */}
      <div className="lg:hidden sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-800">
                {selectedCategory === 'all' 
                  ? 'All Products' 
                  : categories.find(c => c.id === selectedCategory)?.name}
              </h2>
              <p className="text-sm text-gray-500">
                {sortedProducts.length} {sortedProducts.length === 1 ? 'item' : 'items'}
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              {hasActiveFilters && (
                <button
                  onClick={clearAllFilters}
                  className="text-sm text-green-600 hover:text-green-700 font-medium px-3 py-1.5 bg-green-50 rounded-lg"
                >
                  Clear
                </button>
              )}
              <button
                onClick={() => setShowMobileFilters(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-medium"
              >
                <Sliders className="w-4 h-4" />
                Filters
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Filters Sidebar */}
      {showMobileFilters && (
        <div className="lg:hidden fixed inset-0 z-50 bg-white">
          <div className="h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-green-50 to-emerald-50">
              <h2 className="text-xl font-bold text-gray-800">Filters</h2>
              <button
                onClick={() => setShowMobileFilters(false)}
                className="p-2 rounded-lg hover:bg-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Filter Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              {/* Categories */}
              <div className="bg-white rounded-xl shadow-sm p-4">
                <button
                  onClick={() => setExpandedFilter(expandedFilter === 'categories' ? null : 'categories')}
                  className="w-full flex items-center justify-between mb-3"
                >
                  <h3 className="font-semibold text-gray-800">Categories</h3>
                  <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform ${
                    expandedFilter === 'categories' ? 'rotate-180' : ''
                  }`} />
                </button>
                
                {(expandedFilter === 'categories' || window.innerWidth > 768) && (
                  <div className="space-y-2">
                    <button
                      onClick={() => setSelectedCategory('all')}
                      className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-200 flex items-center gap-3 ${
                        selectedCategory === 'all'
                          ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg'
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-700 hover:shadow-md'
                      }`}
                    >
                      <span className="text-lg">📦</span>
                      <div>
                        <div className="font-medium">All Products</div>
                        <div className="text-xs opacity-75 mt-1">{products.filter(p => p.is_active).length} items</div>
                      </div>
                    </button>
                    
                    {categories.map(category => (
                      <button
                        key={category.id}
                        onClick={() => setSelectedCategory(category.id)}
                        className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-200 flex items-center gap-3 ${
                          selectedCategory === category.id
                            ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg'
                            : 'bg-gray-100 hover:bg-gray-200 text-gray-700 hover:shadow-md'
                        }`}
                      >
                        <span className="text-xl">{getCategoryIcon(category.name)}</span>
                        <div className="flex-1">
                          <div className="font-medium">{category.name}</div>
                          <div className="text-xs opacity-75 mt-1">
                            {category.meta_info?.product_count || 0} products
                          </div>
                        </div>
                        {category.meta_info?.is_featured && (
                          <span className="text-xs bg-gradient-to-r from-amber-500 to-orange-500 text-white px-2 py-1 rounded-full">
                            Hot
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Price Range */}
              <div className="bg-white rounded-xl shadow-sm p-4">
                <button
                  onClick={() => setExpandedFilter(expandedFilter === 'price' ? null : 'price')}
                  className="w-full flex items-center justify-between mb-3"
                >
                  <h3 className="font-semibold text-gray-800">Price Range</h3>
                  <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform ${
                    expandedFilter === 'price' ? 'rotate-180' : ''
                  }`} />
                </button>
                
                {(expandedFilter === 'price' || window.innerWidth > 768) && (
                  <div className="space-y-4">
                    <input
                      type="range"
                      min="0"
                      max="10000"
                      step="100"
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                      className="w-full h-2 bg-green-100 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex items-center justify-between text-sm">
                      <span className="bg-gray-100 px-3 py-1 rounded-lg">₹{priceRange[0]}</span>
                      <span className="text-gray-500">to</span>
                      <span className="bg-green-100 text-green-700 font-medium px-3 py-1 rounded-lg">₹{priceRange[1]}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Sort Options */}
              <div className="bg-white rounded-xl shadow-sm p-4">
                <button
                  onClick={() => setExpandedFilter(expandedFilter === 'sort' ? null : 'sort')}
                  className="w-full flex items-center justify-between mb-3"
                >
                  <h3 className="font-semibold text-gray-800">Sort By</h3>
                  <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform ${
                    expandedFilter === 'sort' ? 'rotate-180' : ''
                  }`} />
                </button>
                
                {(expandedFilter === 'sort' || window.innerWidth > 768) && (
                  <div className="space-y-2">
                    {[
                      { id: 'featured', label: 'Featured', icon: '⭐' },
                      { id: 'price-low', label: 'Price: Low to High', icon: '⬆️' },
                      { id: 'price-high', label: 'Price: High to Low', icon: '⬇️' },
                      { id: 'name', label: 'Name: A to Z', icon: '🔤' }
                    ].map(option => (
                      <button
                        key={option.id}
                        onClick={() => setSortBy(option.id)}
                        className={`w-full text-left px-3 py-2.5 rounded-lg transition-colors flex items-center gap-3 ${
                          sortBy === option.id
                            ? 'bg-green-50 text-green-700 border border-green-200'
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        <span>{option.icon}</span>
                        <span>{option.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Footer Actions */}
            <div className="p-4 border-t bg-white">
              <div className="flex gap-3">
                <button
                  onClick={clearAllFilters}
                  className="flex-1 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-medium hover:border-gray-400 transition-colors"
                >
                  Clear All
                </button>
                <button
                  onClick={() => setShowMobileFilters(false)}
                  className="flex-1 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-medium hover:shadow-lg transition-all duration-300"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Desktop Sidebar - Filters */}
          <aside className="hidden lg:block lg:w-72 flex-shrink-0">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24 space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-3">
                  <div className="bg-green-100 p-2 rounded-lg">
                    <Filter className="w-5 h-5 text-green-600" />
                  </div>
                  Filters
                </h2>
                {hasActiveFilters && (
                  <button
                    onClick={clearAllFilters}
                    className="text-sm text-green-600 hover:text-green-700 font-medium"
                  >
                    Clear All
                  </button>
                )}
              </div>

              {/* Categories */}
              <div>
                <h3 className="font-semibold text-gray-700 mb-3">Categories</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-200 flex items-center gap-3 ${
                      selectedCategory === 'all'
                        ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700 hover:shadow-md'
                    }`}
                  >
                    <span className="text-lg">📦</span>
                    <div>
                      <div className="font-medium">All Products</div>
                      <div className="text-xs opacity-75 mt-1">{products.filter(p => p.is_active).length} items</div>
                    </div>
                  </button>
                  
                  {categories.map(category => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-200 flex items-center gap-3 ${
                        selectedCategory === category.id
                          ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg'
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-700 hover:shadow-md'
                      }`}
                    >
                      <span className="text-xl">{getCategoryIcon(category.name)}</span>
                      <div className="flex-1">
                        <div className="font-medium">{category.name}</div>
                        <div className="text-xs opacity-75 mt-1">
                          {category.meta_info?.product_count || 0} products
                        </div>
                      </div>
                      {category.meta_info?.is_featured && (
                        <span className="text-xs bg-gradient-to-r from-amber-500 to-orange-500 text-white px-2 py-1 rounded-full">
                          Hot
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div>
                <h3 className="font-semibold text-gray-700 mb-3">Price Range</h3>
                <div className="space-y-4">
                  <input
                    type="range"
                    min="0"
                    max="10000"
                    step="100"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                    className="w-full h-2 bg-green-100 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex items-center justify-between text-sm">
                    <span className="bg-gray-100 px-3 py-1 rounded-lg">₹{priceRange[0]}</span>
                    <span className="text-gray-500">to</span>
                    <span className="bg-green-100 text-green-700 font-medium px-3 py-1 rounded-lg">₹{priceRange[1]}</span>
                  </div>
                </div>
              </div>

              {/* Sort Options */}
              <div>
                <h3 className="font-semibold text-gray-700 mb-3">Sort By</h3>
                <div className="space-y-2">
                  {[
                    { id: 'featured', label: 'Featured', icon: '⭐' },
                    { id: 'price-low', label: 'Price: Low to High', icon: '⬆️' },
                    { id: 'price-high', label: 'Price: High to Low', icon: '⬇️' },
                    { id: 'name', label: 'Name: A to Z', icon: '🔤' }
                  ].map(option => (
                    <button
                      key={option.id}
                      onClick={() => setSortBy(option.id)}
                      className={`w-full text-left px-3 py-2.5 rounded-lg transition-colors flex items-center gap-3 ${
                        sortBy === option.id
                          ? 'bg-green-50 text-green-700 border border-green-200'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <span>{option.icon}</span>
                      <span>{option.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Products Grid */}
          <main className="flex-1">
            {/* Desktop Header */}
            <div className="hidden lg:block mb-6 p-4 bg-white rounded-2xl shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">
                    {selectedCategory === 'all' 
                      ? 'All Products' 
                      : categories.find(c => c.id === selectedCategory)?.name}
                  </h2>
                  <p className="text-gray-600 mt-1 flex items-center gap-2">
                    <Package className="w-4 h-4" />
                    {sortedProducts.length} {sortedProducts.length === 1 ? 'item' : 'items'} found
                    {hasActiveFilters && (
                      <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                        Filters Active
                      </span>
                    )}
                  </p>
                </div>
                
                <div className="flex items-center gap-4">
                  {hasActiveFilters && (
                    <button
                      onClick={clearAllFilters}
                      className="text-sm text-green-600 hover:text-green-700 font-medium px-4 py-2 bg-green-50 rounded-xl hover:bg-green-100 transition-colors"
                    >
                      Clear All Filters
                    </button>
                  )}
                </div>
              </div>
            </div>

            {sortedProducts.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-md p-12 text-center">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">🔍</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No products found</h3>
                <p className="text-gray-500 mb-6">Try adjusting your filter criteria</p>
                <button
                  onClick={clearAllFilters}
                  className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-medium hover:shadow-lg transition-all duration-300"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedProducts.map(product => {
                  const primaryImage = product.product_images?.find(img => img.is_primary);
                  const minPrice = Math.min(...product.product_variants.map(v => v.variant_price));
                  const maxPrice = Math.max(...product.product_variants.map(v => v.variant_price));
                  
                  // Get the selected variant for this product
                  const selectedVariantId = selectedVariants[product.id];
                  const selectedVariant = product.product_variants.find(v => v.id === selectedVariantId);

                  return (
                    <div key={product.id} className="group">
                      <div className="bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden h-full border border-gray-100 hover:border-green-200">
                        {/* Product Image */}
                        <Link to={`/product/${product.id}`}>
                          <div className="relative h-56 bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center overflow-hidden cursor-pointer">
                            {primaryImage && !primaryImage.image_path.includes('blob:') ? (
                              <img
                                src={primaryImage.image_path}
                                alt={primaryImage.alt_text || product.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                loading="lazy"
                              />
                            ) : (
                              <div className="text-7xl opacity-30 group-hover:scale-110 transition-transform duration-500">
                                {getCategoryIcon(product.categorie_details?.name)}
                              </div>
                            )}
                            
                            {/* Featured Badge */}
                            {product.is_featured && (
                              <div className="absolute top-3 left-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                                ⭐ Featured
                              </div>
                            )}
                          </div>
                        </Link>

                        {/* Product Info */}
                        <div className="p-5">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-semibold text-green-600 bg-green-100 px-3 py-1 rounded-full">
                              {product.categorie_details?.name || 'Uncategorized'}
                            </span>
                          </div>
                          
                          <Link to={`/product/${product.id}`}>
                            <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-1 group-hover:text-green-700 transition-colors cursor-pointer">
                              {product.name}
                            </h3>
                          </Link>
                          
                          <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                            {product.description}
                          </p>

                          {/* Selected Variant Price */}
                          <div className="mb-4">
                            {selectedVariant && (
                              <div className="mb-2">
                                <div className="text-xs text-gray-500 mb-1">Selected:</div>
                                <div className="bg-green-50 text-green-700 px-3 py-2 rounded-lg">
                                  <div className="font-medium">
                                    {selectedVariant.variant_quantity} {selectedVariant.quantity_unit}
                                  </div>
                                  <div className="text-xl font-bold">
                                    ₹{selectedVariant.variant_price.toFixed(2)}
                                  </div>
                                </div>
                              </div>
                            )}
                            
                            <div className="flex items-center justify-between text-sm text-gray-500">
                              <div className="flex items-center gap-1">
                                <Package className="w-4 h-4" />
                                Stock: {product.stock_quantity} {product.stock_unit}
                              </div>
                              <div>
                                <span className="text-gray-400">From </span>
                                <span className="font-medium">₹{minPrice.toFixed(2)}</span>
                              </div>
                            </div>
                          </div>

                          {/* Variants Selection */}
                          <div className="mb-5">
                            <div className="text-xs text-gray-500 mb-2">Available sizes:</div>
                            <div className="flex flex-wrap gap-2">
                              {product.product_variants.slice(0, 3).map((variant) => (
                                <button
                                  key={variant.id}
                                  onClick={() => selectVariant(product.id, variant.id)}
                                  className={`text-xs px-3 py-1.5 rounded-lg transition-all ${
                                    selectedVariantId === variant.id
                                      ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-md'
                                      : 'bg-gray-100 hover:bg-green-100 text-gray-700 hover:text-green-700 hover:shadow-sm'
                                  }`}
                                >
                                  {variant.variant_quantity} {variant.quantity_unit}
                                </button>
                              ))}
                              {product.product_variants.length > 3 && (
                                <span className="text-xs text-gray-500 self-center">
                                  +{product.product_variants.length - 3} more
                                </span>
                              )}
                            </div>
                          </div>

                          <button 
                            onClick={() => addToCart(product)}
                            disabled={!selectedVariant}
                            className={`w-full font-semibold py-3 rounded-xl transition-all duration-300 transform hover:-translate-y-0.5 active:scale-95 shadow-md hover:shadow-lg flex items-center justify-center gap-2 ${
                              selectedVariant
                                ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white'
                                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            }`}
                          >
                            <ShoppingCart className="w-5 h-5" />
                            <span>
                              {selectedVariant 
                                ? `Add to Cart - ₹${selectedVariant.variant_price.toFixed(2)}`
                                : 'Select a size first'
                              }
                            </span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
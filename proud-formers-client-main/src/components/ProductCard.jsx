// src/components/ProductCard.jsx
import { useState } from 'react';
import { ShoppingBag, Star } from 'lucide-react';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';

const ProductCard = ({ product }) => {
  const [selectedVariant, setSelectedVariant] = useState(product.variants?.[0] || null);
  const [imageError, setImageError] = useState(false);
  const { addItemToCart } = useCart();

  const handleAddToCart = () => {
    addItemToCart(product, selectedVariant, 1);
    toast.success('Added to cart!');
  };

  const handleImageError = () => {
    setImageError(true);
  };

  const displayPrice = selectedVariant?.price || product.price;

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300">
      {/* Product Image */}
      <div className="relative h-48 bg-gray-100">
        {imageError ? (
          <div className="w-full h-full flex items-center justify-center bg-gray-200">
            <ShoppingBag className="h-12 w-12 text-gray-400" />
          </div>
        ) : (
          <img
            src={product.image || product.images?.[0]}
            alt={product.name}
            className="w-full h-full object-cover"
            onError={handleImageError}
          />
        )}
        <button
          onClick={handleAddToCart}
          className="absolute bottom-3 right-3 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors shadow-lg"
        >
          <ShoppingBag className="h-5 w-5" />
        </button>
      </div>

      {/* Product Info */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 truncate">{product.name}</h3>
        <p className="text-sm text-gray-600 mt-1 line-clamp-2">{product.description}</p>
        
        {/* Category */}
        {product.category && (
          <span className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full mt-2">
            {product.category}
          </span>
        )}
        
        {/* Rating */}
        <div className="flex items-center mt-2">
          <div className="flex text-yellow-400">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star key={star} className="h-4 w-4 fill-current" />
            ))}
          </div>
          <span className="text-sm text-gray-500 ml-2">({product.rating || '4.5'})</span>
        </div>

        {/* Variants */}
        {product.variants && product.variants.length > 0 && (
          <div className="mt-3">
            <select
              value={selectedVariant?.name}
              onChange={(e) => {
                const variant = product.variants.find(v => v.name === e.target.value);
                setSelectedVariant(variant);
              }}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {product.variants.map((variant) => (
                <option key={variant.name} value={variant.name}>
                  {variant.name} - ${variant.price}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Price and Action */}
        <div className="flex items-center justify-between mt-4">
          <div>
            <span className="text-lg font-bold text-gray-900">${displayPrice}</span>
            {product.originalPrice && (
              <span className="text-sm text-gray-500 line-through ml-2">
                ${product.originalPrice}
              </span>
            )}
          </div>
          <button
            onClick={handleAddToCart}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
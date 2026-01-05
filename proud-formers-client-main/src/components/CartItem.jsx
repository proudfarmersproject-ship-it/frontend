// src/components/CartItem.jsx
import { Minus, Plus, Trash2 } from 'lucide-react';
import { useCart } from '../context/CartContext';

const CartItem = ({ item }) => {
  const { updateItemQuantity, removeItemFromCart } = useCart();

  const handleIncrement = () => {
    updateItemQuantity(item.productId, item.variant, item.quantity + 1);
  };

  const handleDecrement = () => {
    if (item.quantity > 1) {
      updateItemQuantity(item.productId, item.variant, item.quantity - 1);
    } else {
      removeItemFromCart(item.productId, item.variant);
    }
  };

  const handleRemove = () => {
    removeItemFromCart(item.productId, item.variant);
  };

  return (
    <div className="flex items-center space-x-4 p-4 bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Product Image */}
      <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/80';
          }}
        />
      </div>

      {/* Product Info */}
      <div className="flex-1">
        <h4 className="font-medium text-gray-900">{item.name}</h4>
        <p className="text-sm text-gray-600">Variant: {item.variant}</p>
        <p className="font-semibold text-gray-900">${item.price}</p>
      </div>

      {/* Quantity Controls */}
      <div className="flex items-center space-x-3">
        <button
          onClick={handleDecrement}
          className="p-1 rounded-full hover:bg-gray-100"
        >
          <Minus className="h-4 w-4 text-gray-600" />
        </button>
        
        <span className="w-8 text-center font-medium">{item.quantity}</span>
        
        <button
          onClick={handleIncrement}
          className="p-1 rounded-full hover:bg-gray-100"
        >
          <Plus className="h-4 w-4 text-gray-600" />
        </button>

        <button
          onClick={handleRemove}
          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
        >
          <Trash2 className="h-5 w-5" />
        </button>
      </div>

      {/* Total */}
      <div className="text-right">
        <p className="font-bold text-gray-900">
          ${(item.price * item.quantity).toFixed(2)}
        </p>
      </div>
    </div>
  );
};

export default CartItem;
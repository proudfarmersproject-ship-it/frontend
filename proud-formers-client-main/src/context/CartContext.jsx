// src/contexts/CartContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import { useUser } from './UserContext';
import * as api from '../utils/api';
import { getGuestCart, saveGuestCart } from '../utils/cartStorage';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const { user } = useUser();
  const [cart, setCart] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadCart();
  }, [user]);

  const loadCart = async () => {
    if (user) {
      // Load user cart from API
      try {
        setIsLoading(true);
        const userCart = await api.getCart(user.id);
        setCart(userCart.items || []);
      } catch (error) {
        console.error('Error loading cart:', error);
        setCart([]);
      } finally {
        setIsLoading(false);
      }
    } else {
      // Load guest cart from localStorage
      const guestCart = getGuestCart();
      setCart(guestCart);
    }
  };

  const addItemToCart = async (product, variant = null, quantity = 1) => {
    const cartItem = {
      productId: product.id,
      name: product.name,
      price: variant?.price || product.price,
      image: product.images?.[0] || product.image,
      variant: variant?.name || 'Default',
      quantity
    };

    if (user) {
      try {
        await api.addToCartAPI(user.id, cartItem);
        await loadCart(); // Reload cart
      } catch (error) {
        console.error('Error adding to cart:', error);
      }
    } else {
      const guestCart = getGuestCart();
      const existingItemIndex = guestCart.findIndex(item => 
        item.productId === cartItem.productId && item.variant === cartItem.variant
      );

      if (existingItemIndex > -1) {
        guestCart[existingItemIndex].quantity += quantity;
      } else {
        guestCart.push(cartItem);
      }

      saveGuestCart(guestCart);
      setCart(guestCart);
    }
  };

  const updateItemQuantity = async (productId, variant, quantity) => {
    if (user) {
      try {
        await api.updateCartItemAPI(user.id, productId, variant, quantity);
        await loadCart();
      } catch (error) {
        console.error('Error updating cart:', error);
      }
    } else {
      const guestCart = getGuestCart();
      const itemIndex = guestCart.findIndex(item => 
        item.productId === productId && item.variant === variant
      );

      if (itemIndex !== -1) {
        if (quantity <= 0) {
          guestCart.splice(itemIndex, 1);
        } else {
          guestCart[itemIndex].quantity = quantity;
        }
        saveGuestCart(guestCart);
        setCart(guestCart);
      }
    }
  };

  const removeItemFromCart = async (productId, variant) => {
    if (user) {
      try {
        await api.removeFromCartAPI(user.id, productId, variant);
        await loadCart();
      } catch (error) {
        console.error('Error removing from cart:', error);
      }
    } else {
      const guestCart = getGuestCart();
      const filteredCart = guestCart.filter(item => 
        !(item.productId === productId && item.variant === variant)
      );
      saveGuestCart(filteredCart);
      setCart(filteredCart);
    }
  };

  const clearCart = () => {
    if (user) {
      // Implement clear cart API call
      api.createOrUpdateCart(user.id, { items: [] })
        .then(() => loadCart())
        .catch(error => console.error('Error clearing cart:', error));
    } else {
      saveGuestCart([]);
      setCart([]);
    }
  };

  const transferCartToUser = async (userId) => {
    const guestCart = getGuestCart();
    if (guestCart.length > 0) {
      try {
        // Add all guest cart items to user cart
        for (const item of guestCart) {
          await api.addToCartAPI(userId, item);
        }
        saveGuestCart([]); // Clear guest cart after transfer
        await loadCart(); // Reload user cart
      } catch (error) {
        console.error('Error transferring cart:', error);
      }
    }
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => {
      const price = parseFloat(item.price) || 0;
      const quantity = parseInt(item.quantity) || 0;
      return total + (price * quantity);
    }, 0);
  };

  const getCartCount = () => {
    return cart.reduce((count, item) => count + (parseInt(item.quantity) || 0), 0);
  };

  return (
    <CartContext.Provider value={{
      cart,
      addItemToCart,
      updateItemQuantity,
      removeItemFromCart,
      clearCart,
      transferCartToUser,
      getCartTotal,
      getCartCount,
      isLoading
    }}>
      {children}
    </CartContext.Provider>
  );
};
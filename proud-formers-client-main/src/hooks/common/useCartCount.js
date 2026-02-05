// hooks/useCartCount.js
import { useState, useEffect, useCallback } from 'react';
import { getCurrentUser } from '../../services/authService';

export function useCartCount() {
  const [cartCount, setCartCount] = useState(0);
  const [user, setUser] = useState(null);

  const fetchCartCount = useCallback(async () => {
    try {
      const currentUser = getCurrentUser();
      setUser(currentUser);
      
      let count = 0;
      
      if (currentUser) {
        const response = await fetch(`http://localhost:4000/users/${currentUser.id}`);
        if (response.ok) {
          const userData = await response.json();
          count = userData.cart?.length || 0;
        }
      } else {
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        count = cart.length;
      }
      
      setCartCount(count);
    } catch (error) {
      console.error('Error fetching cart count:', error);
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
      setCartCount(cart.length);
    }
  }, []);

  useEffect(() => {
    fetchCartCount();

    const handleCartUpdate = () => {
      fetchCartCount();
    };

    window.addEventListener('storage', handleCartUpdate);
    window.addEventListener('cartUpdated', handleCartUpdate);

    return () => {
      window.removeEventListener('storage', handleCartUpdate);
      window.removeEventListener('cartUpdated', handleCartUpdate);
    };
  }, [fetchCartCount]);

  return { cartCount, refreshCartCount: fetchCartCount };
}
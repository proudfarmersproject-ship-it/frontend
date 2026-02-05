// CartCountBadge.jsx
import React, { useState, useEffect } from 'react';
import { ShoppingCart } from 'lucide-react';
import { getCurrentUser } from '../../services/authService';

export default function CartCountBadge() {
  const [cartCount, setCartCount] = useState(0);
  const [user, setUser] = useState(null);

  const fetchCartCount = async () => {
    try {
      const currentUser = getCurrentUser();
      setUser(currentUser);
      
      let count = 0;
      
      if (currentUser) {
        // Fetch from database for logged-in users
        const response = await fetch(`http://localhost:4000/users/${currentUser.id}`);
        if (response.ok) {
          const userData = await response.json();
          count = userData.cart?.length || 0;
        }
      } else {
        // Fetch from localStorage for guests
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        count = cart.length;
      }
      
      setCartCount(count);
    } catch (error) {
      console.error('Error fetching cart count:', error);
      // Fallback to localStorage
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
      setCartCount(cart.length);
    }
  };

  useEffect(() => {
    // Initial load
    fetchCartCount();

    // Listen for custom event when cart is updated
    const handleCartUpdate = () => {
      fetchCartCount();
    };

    // Listen for localStorage changes (from other tabs)
    window.addEventListener('storage', handleCartUpdate);
    
    // Listen for custom event (from same tab)
    window.addEventListener('cartUpdated', handleCartUpdate);
    
    // Poll for changes every 2 seconds (fallback)
    const pollInterval = setInterval(fetchCartCount, 2000);

    return () => {
      window.removeEventListener('storage', handleCartUpdate);
      window.removeEventListener('cartUpdated', handleCartUpdate);
      clearInterval(pollInterval);
    };
  }, []);

  return (
    <div className="relative inline-block">
      <ShoppingCart className="w-6 h-6 text-gray-700 hover:text-green-600 transition-colors duration-200" />
      {cartCount > 0 && (
        <span className="absolute -top-2 -right-2 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
          {cartCount > 99 ? '99+' : cartCount}
        </span>
      )}
    </div>
  );
}
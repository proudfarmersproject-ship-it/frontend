// src/components/AppInitializer.jsx
import { useEffect } from 'react';
import { useCartStore } from '../store/cartStore';

export default function AppInitializer() {
  const loadCart = useCartStore((state) => state.loadCart);
  
  useEffect(() => {
    // Load cart when app starts
    console.log('AppInitializer: Loading cart...');
    loadCart();
  }, [loadCart]);
  
  return null; // This component doesn't render anything
}
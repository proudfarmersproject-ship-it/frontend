// src/store/cartStore.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getCurrentUser } from '../services/authService';

export const useCartStore = create(
  persist(
    (set, get) => ({
      // Initial state
      cart: [],
      user: null,
      loading: false,
      
      // Set user from auth service
      setUser: (user) => {
        console.log('👤 CartStore: Setting user:', user?.email || 'null');
        set({ user });
      },
      
      // Load cart based on user status
      loadCart: async () => {
        try {
          set({ loading: true });
          const currentUser = getCurrentUser();
          
          console.log('🔄 CartStore: Loading cart for:', currentUser?.email || 'guest');
          
          let cartItems = [];
          
          if (currentUser) {
            // REGISTERED USER: Load from database
            console.log(`📡 Loading from database for user ID: ${currentUser.id}`);
            
            const response = await fetch(`http://localhost:4000/users/${currentUser.id}`);
            if (!response.ok) {
              throw new Error(`Failed to fetch user: ${response.status}`);
            }
            
            const userData = await response.json();
            cartItems = userData.cart || [];
            
            console.log(`✅ Loaded ${cartItems.length} items from database`);
            
            // Set both user and cart
            set({ 
              cart: cartItems, 
              user: currentUser,
              loading: false 
            });
            
          } else {
            // GUEST USER: Load from localStorage (Zustand persist handles this)
            console.log('👤 Guest user, using localStorage cart');
            
            // Get current cart from Zustand persist
            const currentCart = get().cart || [];
            
            set({ 
              cart: currentCart, 
              user: null,
              loading: false 
            });
          }
          
          return cartItems;
          
        } catch (error) {
          console.error('❌ CartStore: Error loading cart:', error);
          set({ loading: false });
          
          // Fallback: Use localStorage cart
          const fallbackCart = get().cart || [];
          console.log(`🔄 Fallback to ${fallbackCart.length} items from localStorage`);
          set({ cart: fallbackCart });
          
          return fallbackCart;
        }
      },
      
      // Add to cart - handles both guest and registered users
      addToCart: async (product, selectedVariant, quantity = 1) => {
        try {
          const { cart, user } = get();
          
          console.log('➕ Adding to cart for:', user ? `User ${user.email}` : 'Guest');
          
          // Create cart item
          const primaryImage = product.product_images?.find(img => img.is_primary);
          const newItem = {
            productId: product.id,
            variantId: selectedVariant.id,
            name: product.name,
            variantName: `${selectedVariant.variant_quantity} ${selectedVariant.quantity_unit}`,
            price: selectedVariant.variant_price,
            image: primaryImage?.image_path || '',
            quantity: quantity,
            stock: product.stock_quantity,
            category: product.categorie_details?.name || 'Uncategorized'
          };
          
          // Find if item exists
          const existingIndex = cart.findIndex(item => 
            item.productId === newItem.productId && 
            item.variantId === newItem.variantId
          );
          
          let updatedCart;
          if (existingIndex >= 0) {
            updatedCart = [...cart];
            updatedCart[existingIndex].quantity += quantity;
          } else {
            updatedCart = [...cart, newItem];
          }
          
          // Update local state immediately
          set({ cart: updatedCart });
          console.log(`✅ Local cart updated: ${updatedCart.length} items`);
          
          // SYNC WITH DATABASE IF REGISTERED USER
          if (user) {
            console.log(`📡 Syncing to database for user: ${user.email}`);
            
            const response = await fetch(`http://localhost:4000/users/${user.id}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ cart: updatedCart })
            });
            
            if (!response.ok) {
              throw new Error('Database sync failed');
            }
            
            console.log('✅ Database sync successful');
          } else {
            console.log('💾 Saved to localStorage (guest)');
            // Zustand persist will automatically save to localStorage
          }
          
          return updatedCart;
          
        } catch (error) {
          console.error('❌ Error adding to cart:', error);
          
          // Revert local changes on error
          if (user) {
            const originalCart = get().cart;
            set({ cart: originalCart });
            console.log('🔄 Reverted local changes due to sync error');
          }
          
          throw error;
        }
      },
      
      // Other methods...
      updateQuantity: async (index, change) => {
        const { cart, user } = get();
        
        if (index >= 0 && index < cart.length) {
          const updatedCart = [...cart];
          const newQuantity = updatedCart[index].quantity + change;
          
          if (newQuantity >= 1 && newQuantity <= updatedCart[index].stock) {
            updatedCart[index].quantity = newQuantity;
            
            set({ cart: updatedCart });
            
            // Sync with database if registered user
            if (user) {
              await fetch(`http://localhost:4000/users/${user.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ cart: updatedCart })
              });
            }
          }
        }
      },
      
      removeFromCart: async (index) => {
        const { cart, user } = get();
        
        if (index >= 0 && index < cart.length) {
          const updatedCart = cart.filter((_, i) => i !== index);
          
          set({ cart: updatedCart });
          
          if (user) {
            await fetch(`http://localhost:4000/users/${user.id}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ cart: updatedCart })
            });
          }
        }
      },
      
      clearCart: async () => {
        const { user } = get();
        
        set({ cart: [] });
        
        if (user) {
          await fetch(`http://localhost:4000/users/${user.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ cart: [] })
          });
        }
      },
      
      getCartCount: () => {
        const { cart } = get();
        return cart.length;
      },
      
      getCartTotal: () => {
        const { cart } = get();
        return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
      }
    }),
    {
      name: 'cart-storage',
      // Only persist cart for guests, not for registered users
      partialize: (state) => ({
        cart: state.user ? [] : state.cart, // Empty cart for users (they use database)
        user: null // Never persist user
      })
    }
  )
);

// Auto-initialize
if (typeof window !== 'undefined') {
  setTimeout(() => {
    console.log('🚀 CartStore: Auto-initializing...');
    useCartStore.getState().loadCart();
  }, 100);
}
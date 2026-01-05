// src/utils/api.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:4000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Products API
export const getProducts = async (filters = {}) => {
  try {
    const response = await api.get('/products');
    let products = response.data;
    
    // Apply filters
    if (filters.category) {
      products = products.filter(product => 
        product.category.toLowerCase().includes(filters.category.toLowerCase())
      );
    }
    
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      products = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm) ||
        product.description.toLowerCase().includes(searchTerm)
      );
    }
    
    if (filters.minPrice) {
      products = products.filter(product => product.price >= parseFloat(filters.minPrice));
    }
    
    if (filters.maxPrice) {
      products = products.filter(product => product.price <= parseFloat(filters.maxPrice));
    }
    
    return products;
  } catch (error) {
    console.error('Error fetching products:', error);
    // Return empty array as fallback
    return [];
  }
};

// Categories API
export const getCategories = async () => {
  try {
    const response = await api.get('/categories');
    return response.data;
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
};

// Cart API (for registered users)
export const getCart = async (userId) => {
  try {
    const response = await api.get(`/carts?userId=${userId}`);
    return response.data[0] || { items: [] };
  } catch (error) {
    console.error('Error fetching cart:', error);
    return { items: [] };
  }
};

export const createOrUpdateCart = async (userId, cartData) => {
  try {
    // Check if cart exists
    const existingCart = await getCart(userId);
    
    if (existingCart.id) {
      // Update existing cart
      const response = await api.put(`/carts/${existingCart.id}`, cartData);
      return response.data;
    } else {
      // Create new cart
      const response = await api.post('/carts', {
        ...cartData,
        userId
      });
      return response.data;
    }
  } catch (error) {
    console.error('Error saving cart:', error);
    throw error;
  }
};

export const addToCartAPI = async (userId, item) => {
  try {
    const cart = await getCart(userId);
    const cartItems = cart.items || [];
    
    const existingItemIndex = cartItems.findIndex(cartItem => 
      cartItem.productId === item.productId && cartItem.variant === item.variant
    );
    
    if (existingItemIndex > -1) {
      // Update quantity
      cartItems[existingItemIndex].quantity += item.quantity;
    } else {
      // Add new item
      cartItems.push(item);
    }
    
    const cartData = {
      items: cartItems,
      updatedAt: new Date().toISOString()
    };
    
    if (cart.id) {
      cartData.id = cart.id;
    }
    
    return await createOrUpdateCart(userId, cartData);
  } catch (error) {
    console.error('Error adding to cart via API:', error);
    throw error;
  }
};

export const updateCartItemAPI = async (userId, productId, variant, quantity) => {
  try {
    const cart = await getCart(userId);
    const cartItems = cart.items || [];
    
    const itemIndex = cartItems.findIndex(item => 
      item.productId === productId && item.variant === variant
    );
    
    if (itemIndex > -1) {
      if (quantity <= 0) {
        // Remove item
        cartItems.splice(itemIndex, 1);
      } else {
        // Update quantity
        cartItems[itemIndex].quantity = quantity;
      }
      
      const cartData = {
        items: cartItems,
        updatedAt: new Date().toISOString()
      };
      
      if (cart.id) {
        cartData.id = cart.id;
      }
      
      return await createOrUpdateCart(userId, cartData);
    }
  } catch (error) {
    console.error('Error updating cart item:', error);
    throw error;
  }
};

export const removeFromCartAPI = async (userId, productId, variant) => {
  try {
    const cart = await getCart(userId);
    const cartItems = cart.items || [];
    
    const filteredItems = cartItems.filter(item => 
      !(item.productId === productId && item.variant === variant)
    );
    
    const cartData = {
      items: filteredItems,
      updatedAt: new Date().toISOString()
    };
    
    if (cart.id) {
      cartData.id = cart.id;
    }
    
    return await createOrUpdateCart(userId, cartData);
  } catch (error) {
    console.error('Error removing from cart:', error);
    throw error;
  }
};

// Coupons API
export const validateCoupon = async (code) => {
  try {
    const response = await api.get(`/coupons?code=${code}`);
    return response.data[0] || null;
  } catch (error) {
    console.error('Error validating coupon:', error);
    return null;
  }
};

// User registration API (from your existing auth service)
export const registerUser = async (userData) => {
  try {
    const response = await api.post('/users', userData);
    return response.data;
  } catch (error) {
    console.error('Error registering user:', error);
    throw error;
  }
};

// User login API (from your existing auth service)
export const loginUser = async (credentials) => {
  try {
    const response = await api.get(`/users?email=${credentials.email}&password=${credentials.password}`);
    const user = response.data[0];
    
    if (!user) {
      throw new Error('Invalid credentials');
    }
    
    return user;
  } catch (error) {
    console.error('Error logging in:', error);
    throw error;
  }
};

export default api;
// utils/cartUtils.js

/**
 * Merge two carts, combining quantities for same items
 * @param {Array} userCart - Cart from database
 * @param {Array} guestCart - Cart from localStorage
 * @returns {Array} Merged cart
 */
export const mergeCarts = (userCart, guestCart) => {
  const merged = [...userCart];
  
  guestCart.forEach(guestItem => {
    // Find if same item exists in user cart
    const existingIndex = merged.findIndex(userItem => 
      userItem.productId === guestItem.productId && 
      userItem.variantId === guestItem.variantId
    );
    
    if (existingIndex > -1) {
      // Item exists, update quantity (don't exceed stock)
      const maxQuantity = Math.min(
        merged[existingIndex].stock,
        merged[existingIndex].quantity + guestItem.quantity
      );
      merged[existingIndex].quantity = maxQuantity;
    } else {
      // New item, add to merged cart
      merged.push(guestItem);
    }
  });
  
  return merged;
};

/**
 * Validate cart item structure
 */
export const validateCartItem = (item) => {
  return item && 
         item.productId && 
         item.variantId && 
         item.quantity > 0 && 
         item.price > 0;
};

/**
 * Check if cart item is in stock
 */
export const isInStock = (item, availableStock) => {
  return item.quantity <= availableStock;
};
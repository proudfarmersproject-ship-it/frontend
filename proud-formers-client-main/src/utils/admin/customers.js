import { dbData } from "./DBData";

export const fetchAllCustomers = () => {
  return new Promise((resolve, reject) => {
    try {
      setTimeout(() => {
        // 1. Filter to get only customers (excluding admins if necessary)
        // 2. Map to the specific format needed for your table/form
        const customers = dbData.users
          .filter((user) => user.role === "customer")
          .map((user) => ({
            id: user.id,
            name: `${user.first_name} ${user.last_name}`, // Concatenated Name
            email: user.email,
            phone: user.phone,
            role: user.role,
            created: user.created_at, // Mapping created_at to 'created'
          }));

        resolve(customers);
      }, 500); // 500ms simulated network delay
    } catch (error) {
      reject("Failed to fetch customers: " + error);
    }
  });
};

export const fetchCustomerById = (userId) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // 1. Find User Info
      const user = dbData.users.find((u) => u.id === userId);
      if (!user) {
        reject(`Customer with ID ${userId} not found.`);
        return;
      }

      // 2. Fetch all Addresses for this user
      const userAddresses = dbData.addresses.filter(
        (addr) => addr.user_id === userId
      );
      console.log("userAddress :", userAddresses);

      // 3. Fetch Cart and Cart Items
      const userCart = dbData.carts.find((c) => c.user_id === userId);
      let cartDetails = null;

      if (userCart) {
        // Find items and join with variant/product info for UI display
        const items = dbData.cart_items
          .filter((item) => item.cart_id === userCart.id)
          .map((item) => {
            const variant = dbData.product_variants.find(
              (v) => v.id === item.product_variant_id
            );
            const product = variant
              ? dbData.products.find((p) => p.id === variant.product_id)
              : null;

            return {
              id: item.id,
              product_name: product ? product.name : "Unknown Product",
              variant_name: variant ? variant.variant_name : "Unknown Variant",
              sku: variant ? variant.sku : "N/A",
              price: variant ? variant.discounted_price : 0,
              quantity: item.quantity,
              total_price: variant
                ? variant.discounted_price * item.quantity
                : 0,
            };
          });

        cartDetails = {
          id: userCart.id,
          items: items,
          total_items: items.length,
          cart_subtotal: items.reduce((sum, item) => sum + item.total_price, 0),
        };
      }

      // 4. Final Data Structure
      const response = {
        profile: {
          id: user.id,
          first_name: user.first_name,
          last_name: user.last_name,
          full_name: `${user.first_name} ${user.last_name}`,
          email: user.email,
          phone: user.phone,
          role: user.role,
          created_at: user.created_at,
        },
        addresses: userAddresses, // Array of address objects
        cart: cartDetails, // Cart object with items array
      };

      resolve(response);
    }, 450); // Simulated delay
  });
};

export const fetchCartItemsByUserId = (userId) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // 1. Find the cart for the user
      const cart = dbData.carts.find(c => c.user_id === userId);
      
      if (!cart) {
        return resolve([]); 
      }

      // 2. Map items with full details
      const items = dbData.cart_items
        .filter(item => item.cart_id === cart.id)
        .map(item => {
          const variant = dbData.product_variants.find(v => v.id === item.product_variant_id);
          const product = variant ? dbData.products.find(p => p.id === variant.product_id) : null;

          // Determine current price (uses discounted_price if available, else regular_price)
          const currentUnitPrice = variant?.discounted_price || variant?.regular_price || 0;
          const subtotal = currentUnitPrice * item.quantity;

          // Determine Status logic
          let stockStatus = "Available";
          if (!product?.is_active) {
            stockStatus = "Product Disabled";
          } else if (variant?.stock_quantity <= 0) {
            stockStatus = "Out of Stock";
          } else if (variant?.stock_quantity < item.quantity) {
            stockStatus = "Insufficient Stock";
          }

          return {
            id: item.id,
            product_name: product?.name || "Unknown",
            variant_name: variant?.variant_name || "N/A", // Variant
            sku: variant?.sku || "N/A",                   // SKU
            unit: variant?.unit || "pcs",                 // Unit
            price: currentUnitPrice,                      // Price
            quantity: item.quantity,                      // Qty
            subtotal: subtotal,                           // Subtotal
            status: stockStatus                           // Status
          };
        });

      resolve(items);
    }, 400);
  });
};

/**
 * 2. fetchOrderItemsByOrderId
 * Fetches the specific products/variants that were locked in for a specific order.
 */
export const fetchOrderItemsByOrderId = (orderId) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const items = dbData.order_items
        .filter((item) => item.order_id === orderId)
        .map((item) => {
          const variant = dbData.product_variants.find(
            (v) => v.id === item.product_variant_id
          );
          const product = dbData.products.find((p) => p.id === item.product_id);
          const image = product
            ? dbData.product_images.find(
                (img) => img.product_id === product.id && img.is_primary
              )
            : null;

          return {
            id: item.id,
            name: product?.name || "Unknown Product",
            variant_name: variant?.variant_name || "Unknown Variant",
            sku: variant?.sku || "N/A",
            image: image?.image_path || "https://via.placeholder.com/50",
            price: item.price, // Using the price stored in order_items (historical price)
            quantity: item.quantity,
            subtotal: item.price * item.quantity,
          };
        });

      if (items.length === 0) {
        reject(`No items found for Order ID: ${orderId}`);
      } else {
        resolve(items);
      }
    }, 400);
  });
};

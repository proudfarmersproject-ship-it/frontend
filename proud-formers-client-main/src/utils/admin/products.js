import { dbData } from "./DBData";

export const fetchAllProducts = () => {
  return new Promise((resolve, reject) => {
    try {
      setTimeout(() => {
        const formattedProducts = dbData.products.map((product) => {
          // 1. Find the primary image for this product
          const primaryImage = dbData.product_images.find(
            (img) => img.product_id === product.id && img.is_primary === true
          );

          // 2. Find the category name using the category_id
          const category = dbData.categories.find(
            (cat) => cat.id === product.category_id
          );

          return {
            id: product.id,
            name: product.name,
            image: primaryImage
              ? primaryImage.image_path
              : "https://via.placeholder.com/150?text=No+Image", // Fallback placeholder
            category: category ? category.name : "Uncategorized",
            stock_quantity: product.stock_quantity,
            stock_unit: product.stock_unit,
            status: product.is_active ? "Active" : "Inactive",
          };
        });

        resolve(formattedProducts);
      }, 500); // 500ms simulated network delay
    } catch (error) {
      reject("Failed to fetch products: " + error);
    }
  });
};
export const fetchProductById = (productId) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // 1. Find the base product
      const product = dbData.products.find((p) => p.id === productId);

      if (!product) {
        reject(`Product with ID ${productId} not found.`);
        return;
      }

      // 2. Fetch all images for this product
      const productImages = dbData.product_images
        .filter((img) => img.product_id === productId)
        .map((img) => ({
          id: img.id,
          image_path: img.image_path,
          alt_text: img.alt_text,
          is_primary: img.is_primary,
        }));

      // 3. Fetch and format all variants for this product
      const productVariants = dbData.product_variants
        .filter((v) => v.product_id === productId)
        .map((v) => ({
          id: v.id, // helpful for React keys
          variant_name: v.variant_name,
          regular_price: v.regular_price,
          stock_quantity: v.stock_quantity,
          unit: v.unit,
          // sku: v.sku,
          // Derive status based on stock quantity
          // status: v.stock_quantity > 0 ? "available" : "out of stock",
        }));

      // 4. Construct the final object as requested for initialFormData
      const response = {
        id: product.id,
        name: product.name,
        description: product.description,
        category_id: product.category_id,
        stock_quantity: product.stock_quantity,
        stock_unit: product.stock_unit,
        is_active: product.is_active,
        images: productImages, // Array of objects
        variants: productVariants, // Array of objects
      };

      resolve(response);
    }, 400); // 400ms simulated delay
  });
};

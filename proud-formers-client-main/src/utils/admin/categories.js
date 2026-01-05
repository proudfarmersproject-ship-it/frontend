import { dbData } from "./DBData"; // Assuming the data is in this file

export const fetchAllCategories = () => {
  return new Promise((resolve, reject) => {
    try {
      // Simulate a network delay of 500ms
      setTimeout(() => {
        const formattedCategories = dbData.categories.map((cat) => {
          // Find the primary image for this category from the categorie_images table
          const categoryImage = dbData.categorie_images.find(
            (img) => img.categories_id === cat.id && img.is_primary === true
          );

          return {
            id: cat.id,
            name: cat.name,
            description: cat.description,
            // If image is found, use its path, otherwise use the Icons8 placeholder
            image: categoryImage ? categoryImage.image_path : "",
          };
        });

        resolve(formattedCategories);
      }, 500);
    } catch (error) {
      reject("Failed to fetch categories: " + error);
    }
  });
};

export const fetchCategoryDetailsById = (categoryId) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // 1. Find the specific category record
      const category = dbData.categories.find((cat) => cat.id === categoryId);

      if (!category) {
        reject(`Category with ID ${categoryId} not found.`);
        return;
      }

      // 2. Filter the images table for ALL images belonging to this category
      const categoryImages = dbData.categorie_images
        .filter((img) => img.categories_id === categoryId)
        .map((img) => ({
          id: img.id,
          image_path: img.image_path,
          alt_text: img.alt_text,
          is_primary: img.is_primary,
        }));

      // 3. Construct the final object
      const result = {
        id: category.id,
        name: category.name,
        description: category.description,
        created_at: category.created_at,
        updated_at: category.updated_at || category.created_at, // Fallback if updated_at is missing
        // images: categoryImages, // This is the array of image objects
      };

      resolve(result);
    }, 300); // 300ms simulated delay
  });
};

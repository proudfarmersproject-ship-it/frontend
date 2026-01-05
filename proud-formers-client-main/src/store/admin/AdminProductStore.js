import { create } from "zustand";
import axios from "axios";
// const baseUrl = "https://694ee81eb5bc648a93c1931d.mockapi.io/proudformers/v1";
const baseUrl = "http://localhost:4000";

export const useAdminProductStore = create((set, get) => ({
  categoriesData: [],
  selectedCategory: null, // For "Get by ID"
  productsData: [],
  selectedProduct: null, // For single product view/edit
  loading: false,
  error: null,
  successMessage: null,

  //////////////////////////////////// Categories Section ////////////////////////////////

  // 1. GET ALL CATEGORIES
  fetchCategories: async () => {
    set({ loading: true, error: null });
    try {
      const res = await axios.get(`${baseUrl}/categories`);

      if (res.status === 200) {
        set({ categoriesData: res.data, loading: false });
      } else {
        set({ error: res.data.message, loading: false });
      }
    } catch (err) {
      set({ error: "Failed to load categories", loading: false });
    }
  },

  // 2. GET CATEGORY BY ID
  fetchCategoryById: async (id) => {
    set({ loading: true, error: null, selectedCategory: null });
    try {
      const res = await axios.get(`${baseUrl}/categories/${id}`);
      if (res.status === 200) {
        set({ selectedCategory: res.data, loading: false });
      }
    } catch (err) {
      set({ error: "Category not found", loading: false });
    }
  },
  // 3. POST (CREATE) CATEGORY
  addCategory: async (categoryForm) => {
    set({ loading: true, error: null, successMessage: null });
    try {
      const res = await axios.post(`${baseUrl}/categories`, categoryForm);
      if (res.status === 200) {
        set((state) => ({
          categoriesData: [...state.categoriesData, res.data],
          successMessage: "Category created successfully!",
          loading: false,
        }));
      }
    } catch (err) {
      set({
        error: err.response?.data?.message || "Creation failed",
        loading: false,
      });
    }
  },
  // 4. UPDATE CATEGORY
  updateCategory: async (id, updatedData) => {
    set({ loading: true, error: null, successMessage: null });
    try {
      const res = await axios.put(`${baseUrl}/categories/${id}`, updatedData);
      if (res.status === 200) {
        set((state) => ({
          categoriesData: state.categoriesData.map((cat) =>
            cat.id === id ? res.data.data : cat
          ),
          successMessage: "Category updated successfully!",
          loading: false,
        }));
      }
    } catch (err) {
      set({ error: "Update failed", loading: false });
    }
  },
  // 5. DELETE CATEGORY
  deleteCategory: async (id) => {
    set({ loading: true, error: null });
    try {
      const res = await axios.delete(`${baseUrl}/categories/${id}`);
      if (res.status === 200) {
        set((state) => ({
          categoriesData: state.categoriesData.filter((cat) => cat.id !== id),
          successMessage: "Category deleted",
          loading: false,
        }));
      }
    } catch (err) {
      set({ error: "Delete failed", loading: false });
    }
  },

  //////////////////////////////////// Products Section ////////////////////////////////

  // 1. GET ALL PRODUCTS (Includes stock_unit and category info)
  fetchProducts: async () => {
    set({ loading: true, error: null });
    try {
      const res = await axios.get(`${baseUrl}/products`);

      if (res.status === 200) {
        console.log("res :", res);
        set({ productsData: res.data, loading: false });
      } else {
        set({ error: res.data.message, loading: false });
      }
    } catch (err) {
      set({ error: "Failed to fetch products", loading: false });
    }
  },
  // 2. GET PRODUCT BY ID (Fetches variants and images too)
  fetchProductById: async (id) => {
    set({ loading: true, error: null, selectedProduct: null });
    try {
      const res = await axios.get(`${baseUrl}/products/${id}`);
      if (res.status === 200) {
        set({ selectedProduct: res.data, loading: false });
      }
    } catch (err) {
      set({ error: "Product details not found", loading: false });
    }
  },
  // 3. POST (CREATE) PRODUCT
  addProduct: async (productForm) => {
    set({ loading: true, error: null, successMessage: null });
    try {
      // productForm should contain name, category_id, stock_quantity, etc.
      const res = await axios.post(`${baseUrl}/products`, productForm);
      console.log("addProduct function working normally", res);
      if (res.status === 201) {
        set((state) => ({
          productsData: [res.data, ...state.productsData],
          successMessage: "Product added to inventory!",
          loading: false,
        }));
      }
    } catch (err) {
      set({
        error: err.response?.data?.message || "Failed to add product",
        loading: false,
      });
    }
  },
  // 4. UPDATE PRODUCT
  updateProduct: async (id, updatedData) => {
    set({ loading: true, error: null, successMessage: null });
    try {
      const res = await axios.put(`${baseUrl}/products/${id}`, updatedData);
      if (res.status === 200) {
        set((state) => ({
          productsData: state.productsData.map((p) =>
            p.id === id ? res.data : p
          ),
          successMessage: "Product updated successfully!",
          loading: false,
          selectedProduct: res.data, // Sync the detail view
        }));
      }
    } catch (err) {
      set({ error: "Update failed", loading: false });
    }
  },
  // 5. DELETE PRODUCT
  deleteProduct: async (id) => {
    set({ loading: true, error: null });
    try {
      const res = await axios.delete(`${baseUrl}/products/${id}`);
      if (res.status === 200) {
        set((state) => ({
          productsData: state.productsData.filter((p) => p.id !== id),
          successMessage: "Product removed",
          loading: false,
        }));
      }
    } catch (err) {
      set({
        error: "Could not delete product. It might be linked to an order.",
        loading: false,
      });
    }
  },
  // Helper to clear alerts in the UI
  clearStatus: () => set({ error: null, successMessage: null }),
}));

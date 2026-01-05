import { create } from "zustand";
import axios from "axios";

const baseUrl = "http://localhost:4000";

export const useAdminPromotionStore = create((set) => ({
  promotionsData: [],
  selectedPromotion: null,
  loading: false,
  error: null,
  successMessage: null,

  // 1. FETCH ALL
  fetchPromotions: async () => {
    set({ loading: true, error: null });
    try {
      const res = await axios.get(`${baseUrl}/promotions`);
      set({ promotionsData: res.data, loading: false });
    } catch (err) {
      set({ error: "Failed to load promotions", loading: false });
    }
  },

  // 2. FETCH BY ID
  fetchPromotionById: async (id) => {
    set({ loading: true, error: null, selectedPromotion: null });
    try {
      const res = await axios.get(`${baseUrl}/promotions/${id}`);
      set({ selectedPromotion: res.data, loading: false });
    } catch (err) {
      set({ error: "Promotion not found", loading: false });
    }
  },

  // 3. ADD PROMOTION
  addPromotion: async (promotionForm) => {
    set({ loading: true, error: null, successMessage: null });
    try {
      // Ensure logic: If type is PRODUCT, category_ids must be null/empty
      const res = await axios.post(`${baseUrl}/promotions`, promotionForm);
      set((state) => ({
        promotionsData: [res.data, ...state.promotionsData],
        successMessage: "Promotion created successfully!",
        loading: false,
      }));
      return true;
    } catch (err) {
      set({
        error: err.response?.data?.message || "Creation failed",
        loading: false,
      });
      return false;
    }
  },

  // 4. UPDATE PROMOTION
  updatePromotion: async (id, updatedData) => {
    set({ loading: true, error: null, successMessage: null });
    try {
      const res = await axios.put(`${baseUrl}/promotions/${id}`, updatedData);
      set((state) => ({
        promotionsData: state.promotionsData.map((p) =>
          p.id === id ? res.data : p
        ),
        selectedPromotion: res.data,
        successMessage: "Promotion updated successfully!",
        loading: false,
      }));
      return true;
    } catch (err) {
      set({ error: "Update failed", loading: false });
      return false;
    }
  },

  // 5. DELETE PROMOTION
  deletePromotion: async (id) => {
    set({ loading: true, error: null });
    try {
      await axios.delete(`${baseUrl}/promotions/${id}`);
      set((state) => ({
        promotionsData: state.promotionsData.filter((p) => p.id !== id),
        successMessage: "Promotion deleted",
        loading: false,
      }));
      return true;
    } catch (err) {
      set({ error: "Delete failed", loading: false });
      return false;
    }
  },

  clearStatus: () => set({ error: null, successMessage: null }),
}));

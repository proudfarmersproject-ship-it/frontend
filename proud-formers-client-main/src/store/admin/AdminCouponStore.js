import { create } from "zustand";
import axios from "axios";

const baseUrl = "http://localhost:4000";

export const useAdminCouponStore = create((set, get) => ({
  couponsData: [],
  selectedCoupon: null,
  loading: false,
  error: null,
  successMessage: null,

  //////////////////////////////////// Coupons Section ////////////////////////////////

  // 1. GET ALL COUPONS
  fetchCoupons: async () => {
    set({ loading: true, error: null });
    try {
      const res = await axios.get(`${baseUrl}/coupons`);
      if (res.status === 200) {
        const data = Array.isArray(res.data)
          ? res.data
          : res.data.coupons || [];
        set({ couponsData: data, loading: false });
      }
    } catch (err) {
      set({ error: "Failed to load coupons", loading: false });
    }
  },

  // 2. GET COUPON BY ID (To see specific usage or details)
  fetchCouponById: async (id) => {
    set({ loading: true, error: null, selectedCoupon: null });
    try {
      const res = await axios.get(`${baseUrl}/coupons/${id}`);
      if (res.status === 200) {
        set({ selectedCoupon: res.data, loading: false });
      }
    } catch (err) {
      set({ error: "Coupon not found", loading: false });
    }
  },

  // 3. CREATE NEW COUPON
  addCoupon: async (couponForm) => {
    set({ loading: true, error: null, successMessage: null });
    try {
      const res = await axios.post(`${baseUrl}/coupons`, couponForm);
      if (res.status === 201) {
        set((state) => ({
          couponsData: [res.data, ...state.couponsData],
          successMessage: "New coupon created successfully!",
          loading: false,
        }));
      }
    } catch (err) {
      set({
        error: err.response?.data?.message || "Failed to create coupon",
        loading: false,
      });
    }
  },

  // 4. UPDATE COUPON (Change values, limits, or dates)
  updateCoupon: async (id, updatedData) => {
    set({ loading: true, error: null, successMessage: null });
    try {
      const res = await axios.put(`${baseUrl}/coupons/${id}`, updatedData);
      if (res.status === 200) {
        set((state) => ({
          couponsData: state.couponsData.map((c) =>
            c.id === id ? res.data : c
          ),
          selectedCoupon: res.data,
          successMessage: "Coupon updated successfully!",
          loading: false,
        }));
      }
    } catch (err) {
      set({ error: "Failed to update coupon", loading: false });
    }
  },

  // 5. TOGGLE COUPON STATUS (Quickly enable/disable)
  toggleCouponStatus: async (id, isActive) => {
    set({ loading: true, error: null });
    try {
      const res = await axios.patch(`${baseUrl}/coupons/${id}/status`, {
        is_active: isActive,
      });
      if (res.status === 200) {
        set((state) => ({
          couponsData: state.couponsData.map((c) =>
            c.id === id
              ? { ...c, validity: { ...c.validity, is_active: isActive } }
              : c
          ),
          loading: false,
        }));
      }
    } catch (err) {
      set({ error: "Status update failed", loading: false });
    }
  },

  // 6. DELETE COUPON
  deleteCoupon: async (id) => {
    set({ loading: true, error: null });
    try {
      const res = await axios.delete(`${baseUrl}/coupons/${id}`);
      if (res.status === 200) {
        set((state) => ({
          couponsData: state.couponsData.filter((c) => c.id !== id),
          successMessage: "Coupon removed permanently",
          loading: false,
        }));
      }
    } catch (err) {
      set({ error: "Failed to delete coupon", loading: false });
    }
  },

  // Helper to clear alerts
  clearStatus: () => set({ error: null, successMessage: null }),
}));

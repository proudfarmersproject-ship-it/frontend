import { create } from "zustand";
import axios from "axios";

const baseUrl = "http://localhost:4000";

export const useAdminOrderStore = create((set, get) => ({
  ordersData: [],        // For the list view
  selectedOrder: null,   // For the details view (including customer & items)
  loading: false,
  error: null,
  successMessage: null,

  //////////////////////////////////// Orders Section ////////////////////////////////

  // 1. GET ALL ORDERS (List view)
  fetchOrders: async () => {
    set({ loading: true, error: null });
    try {
      const res = await axios.get(`${baseUrl}/orders`);
      if (res.status === 200) {
        // Handle cases where API might return { orders: [], total: 0 } or just []
        const data = Array.isArray(res.data) ? res.data : res.data.orders || [];
        set({ ordersData: data, loading: false });
      }
    } catch (err) {
      set({ error: "Failed to load orders list", loading: false });
    }
  },

  // 2. GET ORDER BY ID (Detailed view with items, address, and customer)
  fetchOrderById: async (id) => {
    set({ loading: true, error: null, selectedOrder: null });
    try {
      const res = await axios.get(`${baseUrl}/orders/${id}`);
      if (res.status === 200) {
        // res.data will match the nested JSON structure we discussed
        set({ selectedOrder: res.data, loading: false });
      }
    } catch (err) {
      set({ error: "Order details not found", loading: false });
    }
  },

  // 3. UPDATE ORDER STATUS (e.g., Pending -> Delivered)
  updateOrderStatus: async (id, newStatus) => {
    set({ loading: true, error: null, successMessage: null });
    try {
      // Sending only the status field as per typical admin requirements
      const res = await axios.patch(`${baseUrl}/orders/${id}`, { order_status: newStatus });
      
      if (res.status === 200) {
        set((state) => ({
          // Update the item in the list
          ordersData: state.ordersData.map((o) =>
            o.id === id ? { ...o, order_status: newStatus } : o
          ),
          // Update the item if it's currently being viewed in details
          selectedOrder: state.selectedOrder?.id === id 
            ? { ...state.selectedOrder, order_status: newStatus } 
            : state.selectedOrder,
          successMessage: `Order status updated to ${newStatus}`,
          loading: false,
        }));
      }
    } catch (err) {
      set({ error: "Failed to update status", loading: false });
    }
  },

  // 4. DELETE / CANCEL ORDER
  // In E-commerce, we usually don't delete orders, but we might provide a delete for admins
  deleteOrder: async (id) => {
    set({ loading: true, error: null });
    try {
      const res = await axios.delete(`${baseUrl}/orders/${id}`);
      if (res.status === 200) {
        set((state) => ({
          ordersData: state.ordersData.filter((o) => o.id !== id),
          successMessage: "Order record removed successfully",
          loading: false,
        }));
      }
    } catch (err) {
      set({ error: "Delete operation failed", loading: false });
    }
  },

  // 5. HELPER: FETCH ORDERS BY USER ID (For Customer Profile page)
  fetchOrdersByUserId: async (userId) => {
    set({ loading: true, error: null });
    try {
      const res = await axios.get(`${baseUrl}/orders/user/${userId}`);
      if (res.status === 200) {
        return res.data; // Return directly for local component usage
      }
    } catch (err) {
      set({ error: "Failed to load customer orders", loading: false });
    } finally {
      set({ loading: false });
    }
  },

  // Helper to clear alerts
  clearStatus: () => set({ error: null, successMessage: null }),
}));
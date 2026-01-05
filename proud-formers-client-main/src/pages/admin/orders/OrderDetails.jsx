// import { useParams } from "react-router-dom";
// import { useState, useEffect } from "react";
// import {
//   Loader2,
//   AlertCircle,
//   Package,
//   Truck,
//   CheckCircle,
//   Clock,
//   User,
//   MapPin,
//   CreditCard,
//   Hash,
// } from "lucide-react";
// import AdminHeaderWrapper from "../../../components/admin/AdminHeaderWrapper";
// import { useAdminOrderStore } from "../../../store/admin/AdminOrderStore";

// export default function OrderDetails() {
//   const { id } = useParams();

//   const {
//     selectedOrder,
//     loading,
//     error,
//     fetchOrderById,
//     updateOrderStatus,
//     successMessage,
//     clearStatus,
//   } = useAdminOrderStore();

//   const [status, setStatus] = useState("");

//   useEffect(() => {
//     fetchOrderById(id);
//     return () => clearStatus();
//   }, [id, fetchOrderById, clearStatus]);

//   useEffect(() => {
//     if (selectedOrder) {
//       setStatus(selectedOrder.order_status);
//     }
//   }, [selectedOrder]);

//   const handleUpdateStatus = async () => {
//     await updateOrderStatus(id, status);
//   };

//   if (loading && !selectedOrder) {
//     return (
//       <div className="flex flex-col items-center justify-center min-h-[500px]">
//         <Loader2 className="animate-spin text-primary" size={48} />
//         <p className="text-gray-500 mt-4 font-medium italic">
//           Retrieving order dossier...
//         </p>
//       </div>
//     );
//   }

//   if (error || !selectedOrder) {
//     return (
//       <div className="p-10 text-center bg-white rounded-3xl border border-gray-100 mt-10 shadow-sm">
//         <AlertCircle className="mx-auto text-red-500 mb-4" size={56} />
//         <h2 className="text-2xl font-black text-gray-800">Order Not Found</h2>
//         <p className="text-gray-500 max-w-xs mx-auto mt-2">
//           {error || "The requested order does not exist or has been archived."}
//         </p>
//       </div>
//     );
//   }

//   const { customer, shipping_address, order_items } = selectedOrder;

//   return (
//     <div className="pb-20 space-y-6">
//       <AdminHeaderWrapper
//         title={`Order Tracking #${selectedOrder.id}`}
//         description="View customer details, shipping progress, and financial summary."
//         breadcrumb={[
//           { label: "Dashboard", to: "/admin" },
//           { label: "Orders", to: "/admin/orders" },
//           { label: `ID: ${selectedOrder.id}` },
//         ]}
//       />

//       {successMessage && (
//         <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
//           <CheckCircle size={20} className="shrink-0" />
//           <span className="font-bold text-sm">{successMessage}</span>
//         </div>
//       )}

//       <div className="grid lg:grid-cols-3 gap-6">
//         {/* LEFT COLUMN: Main Information */}
//         <div className="lg:col-span-2 space-y-6">
//           {/* Section 1: Contacts & Shipping */}
//           <div className="grid md:grid-cols-2 gap-6">
//             <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:border-primary/20 transition-colors">
//               <h3 className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-4 flex items-center gap-2">
//                 <User size={14} /> Customer Identity
//               </h3>
//               <p className="font-black text-gray-800 text-lg">
//                 {customer?.first_name} {customer?.last_name}
//               </p>
//               <div className="mt-2 space-y-1">
//                 <p className="text-sm text-gray-500 font-medium">
//                   {customer?.email}
//                 </p>
//                 <p className="text-sm text-gray-500 font-medium">
//                   {customer?.phone}
//                 </p>
//               </div>
//             </div>

//             <div className="bg-blue-50/50 p-6 rounded-3xl shadow-sm border border-blue-100">
//               <h3 className="text-blue-400 text-[10px] font-black uppercase tracking-widest mb-4 flex items-center gap-2">
//                 <MapPin size={14} /> Delivery Logistics
//               </h3>
//               <p className="font-bold text-blue-900">
//                 {shipping_address?.full_name}
//               </p>
//               <div className="mt-1 text-sm text-blue-800/80 leading-relaxed font-medium">
//                 <p>{shipping_address?.address_line1}</p>
//                 {shipping_address?.address_line2 && (
//                   <p>{shipping_address?.address_line2}</p>
//                 )}
//                 <p className="mt-1 font-bold">
//                   {shipping_address?.city}, {shipping_address?.state || ""} -{" "}
//                   {shipping_address?.pincode}
//                 </p>
//               </div>
//             </div>
//           </div>

//           {/* Section 2: Line Items */}
//           <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
//             <h3 className="font-black text-gray-800 text-lg mb-6 flex items-center gap-2">
//               <Package size={22} className="text-primary" />
//               Purchased Items
//               <span className="ml-auto text-[10px] bg-gray-100 text-gray-500 px-2 py-1 rounded-lg">
//                 {order_items?.length} SKUs
//               </span>
//             </h3>
//             <div className="divide-y divide-gray-50">
//               {order_items?.map((item) => (
//                 <div
//                   key={item.order_item_id}
//                   className="py-5 flex items-center justify-between group"
//                 >
//                   <div className="flex gap-4">
//                     <div className="w-14 h-14 bg-gray-50 rounded-2xl flex flex-col items-center justify-center border border-gray-100 group-hover:bg-white transition-colors">
//                       <span className="text-xs font-black text-primary">
//                         {item.quantity}
//                       </span>
//                       <span className="text-[8px] font-bold text-gray-400 uppercase">
//                         {item.quantity_unit}
//                       </span>
//                     </div>
//                     <div>
//                       <p className="font-bold text-gray-900 group-hover:text-primary transition-colors">
//                         {item.product_name}
//                       </p>
//                       <p className="text-xs text-gray-400 font-bold uppercase mt-1">
//                         Variant:{" "}
//                         <span className="text-gray-600">
//                           {item.variant_name}
//                         </span>
//                       </p>
//                     </div>
//                   </div>
//                   <div className="text-right">
//                     <p className="font-black text-gray-900 text-base">
//                       ₹{Number(item.total_price).toLocaleString()}
//                     </p>
//                     <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">
//                       ₹{item.price_per_unit} / Unit
//                     </p>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>

//           {/* Section 3: Financials */}
//           <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 overflow-hidden relative">
//             <div className="absolute top-0 right-0 p-4 opacity-5">
//               <CreditCard size={100} />
//             </div>
//             <div className="space-y-4 relative z-10">
//               <div className="flex justify-between text-sm font-bold text-gray-500">
//                 <span>Gross Subtotal</span>
//                 <span>₹{Number(selectedOrder.sub_total).toLocaleString()}</span>
//               </div>
//               <div className="flex justify-between text-sm font-bold text-red-500 bg-red-50/50 p-2 rounded-xl border border-red-100/50">
//                 <span>
//                   Discount Applied ({selectedOrder.discount_source || "N/A"})
//                 </span>
//                 <span>
//                   - ₹{Number(selectedOrder.discount_amount).toLocaleString()}
//                 </span>
//               </div>
//               <div className="border-t border-gray-100 pt-4 flex justify-between items-center">
//                 <div className="flex flex-col">
//                   <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
//                     Grand Total
//                   </span>
//                   <span className="text-3xl font-black text-primary tracking-tighter">
//                     ₹{Number(selectedOrder.actual_amount).toLocaleString()}
//                   </span>
//                 </div>
//                 <div className="text-right">
//                   <span
//                     className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
//                       selectedOrder.payment_status === "paid"
//                         ? "bg-green-500 text-white"
//                         : "bg-orange-400 text-white"
//                     }`}
//                   >
//                     {selectedOrder.payment_status}
//                   </span>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* RIGHT COLUMN: Management Sidebar */}
//         <div className="space-y-6">
//           <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 sticky top-6">
//             <h3 className="font-black text-gray-800 text-lg mb-6 flex items-center gap-2">
//               <Clock size={20} className="text-primary" /> Workflow Status
//             </h3>

//             <div className="space-y-5">
//               <div>
//                 <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block ml-1">
//                   Lifecycle Stage
//                 </label>
//                 <select
//                   value={status}
//                   onChange={(e) => setStatus(e.target.value)}
//                   className="w-full p-3.5 bg-gray-50 border-none rounded-2xl text-sm font-bold text-gray-700 focus:ring-2 focus:ring-primary/20 outline-none transition-all appearance-none cursor-pointer"
//                 >
//                   <option value="pending">⏳ Pending Review</option>
//                   <option value="confirmed">✅ Confirmed Order</option>
//                   <option value="shipped">🚚 In Transit / Shipped</option>
//                   <option value="delivered">🏠 Successfully Delivered</option>
//                   <option value="cancelled">❌ Cancelled / Voided</option>
//                 </select>
//               </div>

//               <button
//                 onClick={handleUpdateStatus}
//                 disabled={loading || status === selectedOrder.order_status}
//                 className="w-full bg-primary hover:bg-primary-dark text-white font-black py-4 rounded-2xl shadow-xl shadow-primary/20 transition-all disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-2 group"
//               >
//                 {loading ? (
//                   <Loader2 className="animate-spin" size={20} />
//                 ) : (
//                   <Truck
//                     size={20}
//                     className="group-hover:translate-x-1 transition-transform"
//                   />
//                 )}
//                 Commit Changes
//               </button>
//             </div>

//             <div className="mt-8 pt-8 border-t border-gray-50">
//               <div className="flex items-center gap-2 text-gray-400 mb-2">
//                 <Hash size={14} />
//                 <span className="text-[10px] font-black uppercase tracking-widest">
//                   Gateway Reference
//                 </span>
//               </div>
//               <div className="bg-gray-50 p-4 rounded-2xl border border-dashed border-gray-200 group">
//                 <code className="text-[10px] text-gray-500 font-bold break-all leading-relaxed block group-hover:text-primary transition-colors">
//                   {selectedOrder.stripe_payment_id || "LOCAL_BYPASS_TRANS_ID"}
//                 </code>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  Loader2,
  AlertCircle,
  Package,
  Truck,
  CheckCircle,
  Clock,
} from "lucide-react";
import AdminHeaderWrapper from "../../../components/admin/AdminHeaderWrapper";
import { useAdminOrderStore } from "../../../store/admin/AdminOrderStore";

export default function OrderDetails() {
  const { id } = useParams();

  // 1. Extract from Store
  const {
    selectedOrder,
    loading,
    error,
    fetchOrderById,
    updateOrderStatus,
    successMessage,
    clearStatus,
  } = useAdminOrderStore();

  const [status, setStatus] = useState("");

  // 2. Fetch data on mount
  useEffect(() => {
    fetchOrderById(id);
    return () => clearStatus(); // Cleanup alerts on unmount
  }, [id, fetchOrderById, clearStatus]);

  // 3. Sync local status state when order data arrives
  useEffect(() => {
    if (selectedOrder) {
      setStatus(selectedOrder.order_status);
    }
  }, [selectedOrder]);

  const handleUpdateStatus = async () => {
    await updateOrderStatus(id, status);
  };

  // --- LOADING STATE ---
  if (loading && !selectedOrder) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-primary" size={40} />
        <p className="text-gray-500 mt-4">Retrieving order dossier...</p>
      </div>
    );
  }

  // --- ERROR STATE ---
  if (error || !selectedOrder) {
    return (
      <div className="p-10 text-center">
        <AlertCircle className="mx-auto text-red-500 mb-4" size={48} />
        <h2 className="text-xl font-bold">Order Not Found</h2>
        <p className="text-gray-500">
          {error || "The requested order does not exist."}
        </p>
      </div>
    );
  }

  // Data helpers from the new API structure
  const { customer, shipping_address, order_items } = selectedOrder;

  return (
    <div className="space-y-6">
      <AdminHeaderWrapper
        title={`Order #${selectedOrder.id}`}
        description="Complete order information and tracking"
        breadcrumb={[
          { label: "Orders", to: "/admin/orders" },
          { label: selectedOrder.id },
        ]}
      />

      {successMessage && (
        <div className="bg-green-100 text-green-700 p-4 rounded-xl flex items-center gap-2 animate-pulse">
          <CheckCircle size={20} /> {successMessage}
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* LEFT SECTION: Items and Summary */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer & Address Overview */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-3">
                Customer Info
              </h3>
              <p className="font-semibold text-lg">
                {customer?.first_name} {customer?.last_name}
              </p>
              <p className="text-sm text-gray-600">{customer?.email}</p>
              <p className="text-sm text-gray-600">{customer?.phone}</p>
            </div>

            <div className="bg-blue-50 p-6 rounded-2xl shadow-sm border border-blue-100">
              <h3 className="text-blue-400 text-xs font-bold uppercase tracking-wider mb-3">
                Shipping Address
              </h3>
              <p className="font-semibold">{shipping_address?.full_name}</p>
              <p className="text-sm text-blue-800">
                {shipping_address?.address_line1},{" "}
                {shipping_address?.address_line2}
              </p>
              <p className="text-sm text-blue-800">
                {shipping_address?.city} - {shipping_address?.pincode}
              </p>
            </div>
          </div>

          {/* Order Items */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Package size={20} className="text-gray-400" /> Order Items
            </h3>
            <div className="divide-y divide-gray-100">
              {order_items?.map((item) => (
                <div
                  key={item.order_item_id}
                  className="py-4 flex items-center justify-between"
                >
                  <div className="flex gap-4">
                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 font-bold">
                      {item.quantity_unit}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {item.product_name}
                      </p>
                      <p className="text-sm text-gray-500">
                        Variant: {item.variant_name} | Qty: {item.quantity}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">
                      ₹{item.total_price}
                    </p>
                    <p className="text-xs text-gray-400">
                      ₹{item.price_per_unit} / unit
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Price Summary */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-3">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>₹{selectedOrder.sub_total}</span>
            </div>
            <div className="flex justify-between text-red-500">
              <span>Discount ({selectedOrder.discount_source || "None"})</span>
              <span>- ₹{selectedOrder.discount_amount}</span>
            </div>
            <div className="border-t pt-3 flex justify-between items-center">
              <span className="font-bold text-lg">Total Amount</span>
              <span className="font-bold text-2xl text-primary">
                ₹{selectedOrder.actual_amount}
              </span>
            </div>
          </div>
        </div>

        {/* RIGHT SECTION: Status Management */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Clock size={20} className="text-gray-400" /> Order Status
            </h3>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">Payment Status</p>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                    selectedOrder.payment_status === "paid"
                      ? "bg-green-100 text-green-700"
                      : "bg-orange-100 text-orange-700"
                  }`}
                >
                  {selectedOrder.payment_status}
                </span>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">
                  Update Progression
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full mt-2 p-3 border-2 border-gray-100 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                >
                  <option value="pending">⏳ Pending</option>
                  <option value="confirmed">✅ Confirmed</option>
                  <option value="shipped">🚚 Shipped</option>
                  <option value="delivered">🏠 Delivered</option>
                  <option value="cancelled">❌ Cancelled</option>
                </select>
              </div>

              <button
                onClick={handleUpdateStatus}
                disabled={loading}
                className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3 rounded-xl shadow-lg shadow-primary/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  <Truck size={18} />
                )}
                Update Status
              </button>
            </div>
          </div>

          <div className="bg-gray-50 p-6 rounded-2xl border border-dashed border-gray-300 text-center">
            <p className="text-xs text-gray-500">Stripe Transaction ID</p>
            <code className="text-[10px] text-gray-400 break-all">
              {selectedOrder.stripe_payment_id || "N/A"}
            </code>
          </div>
        </div>
      </div>
    </div>
  );
}

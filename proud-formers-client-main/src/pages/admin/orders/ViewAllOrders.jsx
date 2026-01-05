import { useState, useMemo, useEffect } from "react";
import {
  Eye,
  Loader2,
  AlertCircle,
  Search,
  Filter,
  ShoppingBag,
  Clock,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { Link } from "react-router-dom";
import AdminHeaderWrapper from "../../../components/admin/AdminHeaderWrapper";
import Pagination from "../../../components/admin/Pagination";
import { useAdminOrderStore } from "../../../store/admin/AdminOrderStore";

const wrapperData = {
  title: "Order Management",
  description: "Track, manage, and process customer orders across all channels",
  breadcrumb: [
    { label: "Dashboard", to: "/admin" },
    { label: "Orders", to: "/admin/orders" },
  ],
};

export default function ViewAllOrders() {
  const [status, setStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [perPage, setPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const { fetchOrders, ordersData, loading, error } = useAdminOrderStore();

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Combined Search and Filter Logic
  const filtered = useMemo(() => {
    return ordersData.filter((o) => {
      const matchesStatus = status === "all" || o.order_status === status;

      const customerName = `${o.customer?.first_name || ""} ${
        o.customer?.last_name || ""
      }`.toLowerCase();
      const customerEmail = (o.customer?.email || "").toLowerCase();
      const orderId = o.id.toString();
      const query = searchQuery.toLowerCase();

      const matchesSearch =
        orderId.includes(query) ||
        customerName.includes(query) ||
        customerEmail.includes(query);

      return matchesStatus && matchesSearch;
    });
  }, [status, searchQuery, ordersData]);

  const start = (currentPage - 1) * perPage;
  const paginated = filtered.slice(start, start + perPage);

  const stats = useMemo(
    () => ({
      total: ordersData.length,
      pending: ordersData.filter((o) => o.order_status === "pending").length,
      confirmed: ordersData.filter((o) => o.order_status === "confirmed")
        .length,
      delivered: ordersData.filter((o) => o.order_status === "delivered")
        .length,
    }),
    [ordersData]
  );

  if (loading && ordersData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] bg-white rounded-3xl mt-6 border border-gray-100 shadow-sm">
        <Loader2 className="animate-spin text-primary" size={48} />
        <p className="text-gray-500 mt-4 font-medium italic">
          Synchronizing orders...
        </p>
      </div>
    );
  }

  return (
    <div className="pb-10">
      <AdminHeaderWrapper {...wrapperData} />

      {/* Analytics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pb-8 mt-6">
        <StatCard
          title="Total Orders"
          count={stats.total}
          icon={<ShoppingBag size={20} />}
          color="text-gray-600"
          bg="bg-gray-50"
          border="border-gray-200"
        />
        <StatCard
          title="Pending"
          count={stats.pending}
          icon={<Clock size={20} />}
          color="text-yellow-600"
          bg="bg-yellow-50"
          border="border-yellow-200"
        />
        <StatCard
          title="Confirmed"
          count={stats.confirmed}
          icon={<Filter size={20} />}
          color="text-blue-600"
          bg="bg-blue-50"
          border="border-blue-200"
        />
        <StatCard
          title="Delivered"
          count={stats.delivered}
          icon={<CheckCircle2 size={20} />}
          color="text-green-600"
          bg="bg-green-50"
          border="border-green-200"
        />
      </div>

      <div className="space-y-6">
        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-2xl flex items-center gap-3 border border-red-100 shadow-sm">
            <AlertCircle size={20} />
            <p className="font-medium">{error}</p>
          </div>
        )}

        {/* Search and Control Bar */}
        <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-1 flex-wrap items-center gap-4">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[280px] lg:max-w-md">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Search by Order ID, Name, or Email..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border-2 border-gray-200 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-primary/20 transition-all outline-none"
              />
            </div>

            {/* Status Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-2">
                Status:
              </span>
              <select
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-gray-50 border-2 border-gray-200 px-4 py-2.5 rounded-2xl text-sm font-bold text-gray-700 focus:ring-2 focus:ring-primary/20 cursor-pointer outline-none"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <div className="hidden lg:block text-right">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-tighter">
              Results
            </p>
            <p className="text-sm font-black text-gray-700">
              {filtered.length} Orders
            </p>
          </div>
        </div>

        {/* Table Container */}
        <div className="bg-white p-4 rounded-3xl shadow">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-left text-gray-600 text-sm uppercase tracking-wider border-b">
                  <th className="p-4 font-bold">Order ID</th>
                  <th className="p-4 font-bold">Placed On</th>
                  <th className="p-4 font-bold">Customer Info</th>
                  <th className="p-4 font-bold">Total Amount</th>
                  <th className="p-4 font-bold">Payment</th>
                  <th className="p-4 font-bold">Order Status</th>
                  <th className="p-4 font-bold text-center">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-300">
                {paginated.length > 0 ? (
                  paginated.map((o) => (
                    <tr
                      key={o.id}
                      className="group hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="p-5 font-bold text-primary text-sm tracking-tight">
                        #{o.id}
                      </td>
                      <td className="p-5">
                        <p className="text-sm font-semibold text-gray-700">
                          {new Date(o.created_at).toLocaleDateString(
                            undefined,
                            { month: "short", day: "numeric", year: "numeric" }
                          )}
                        </p>
                        <p className="text-[10px] text-gray-400 uppercase">
                          {new Date(o.created_at).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </td>
                      <td className="p-5">
                        <div className="text-sm font-bold text-gray-800">
                          {o.customer
                            ? `${o.customer.first_name} ${o.customer.last_name}`
                            : "Guest User"}
                        </div>
                        <div className="text-xs text-gray-400 font-medium lowercase">
                          {o.customer?.email || "No email provided"}
                        </div>
                      </td>
                      <td className="p-5 font-black text-gray-900 text-sm">
                        ₹{Number(o.actual_amount).toLocaleString("en-IN")}
                      </td>
                      <td className="p-5 text-center">
                        <span
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter border ${
                            o.payment_status === "paid"
                              ? "bg-green-50 text-green-600 border-green-100"
                              : "bg-gray-50 text-gray-500 border-gray-100"
                          }`}
                        >
                          {o.payment_status}
                        </span>
                      </td>
                      <td className="p-5 text-center">
                        <div
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tighter border ${getStatusStyles(
                            o.order_status
                          )}`}
                        >
                          <div
                            className={`w-1.5 h-1.5 rounded-full ${getStatusDot(
                              o.order_status
                            )}`}
                          />
                          {o.order_status}
                        </div>
                      </td>
                      <td className="p-5 text-center">
                        <div className="flex justify-end gap-2">
                          <Link
                            to={`/admin/orders/${o.id}`}
                            className="text-blue-600 hover:bg-blue-50 p-2 rounded-lg border border-blue-100"
                            title="View Details"
                          >
                            <Eye size={20} />
                          </Link>
                          {/* <button
                            onClick={() => handleDelete(p.id, p.title)}
                            className="text-red-600 hover:bg-red-50 p-2 rounded-lg border border-red-100 cursor-pointer"
                            title="Delete Promotion"
                          >
                            <Trash2 size={20} />
                          </button> */}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="p-20 text-center">
                      <div className="flex flex-col items-center justify-center text-gray-400">
                        <XCircle size={40} strokeWidth={1} />
                        <p className="mt-2 font-medium">
                          No orders match your current search criteria.
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Component */}
          <Pagination
            totalItems={filtered.length}
            currentPage={currentPage}
            perPage={perPage}
            onPageChange={setCurrentPage}
            onPerPageChange={setPerPage}
          />
        </div>
      </div>
    </div>
  );
}

// --- Helper Components & Functions ---

function StatCard({ title, count, icon, color, bg, border }) {
  return (
    <div
      className={`bg-white p-5 rounded-3xl shadow-sm border ${border} flex items-center justify-between transition-transform hover:scale-[1.02]`}
    >
      <div>
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
          {title}
        </p>
        <p className="text-2xl font-black text-gray-800">{count}</p>
      </div>
      <div className={`p-3 rounded-2xl ${bg} ${color}`}>{icon}</div>
    </div>
  );
}

function getStatusStyles(status) {
  switch (status) {
    case "delivered":
      return "bg-green-50 text-green-600 border-green-100";
    case "pending":
      return "bg-yellow-50 text-yellow-600 border-yellow-100";
    case "confirmed":
      return "bg-blue-50 text-blue-600 border-blue-100";
    case "cancelled":
      return "bg-red-50 text-red-600 border-red-100";
    default:
      return "bg-gray-50 text-gray-600 border-gray-100";
  }
}

function getStatusDot(status) {
  switch (status) {
    case "delivered":
      return "bg-green-500";
    case "pending":
      return "bg-yellow-500";
    case "confirmed":
      return "bg-blue-500";
    case "cancelled":
      return "bg-red-500";
    default:
      return "bg-gray-400";
  }
}

// import { useState, useMemo, useEffect } from "react";
// import { Eye, Loader2, AlertCircle } from "lucide-react";
// import { Link } from "react-router-dom";
// import AdminHeaderWrapper from "../../../components/admin/AdminHeaderWrapper";
// import Pagination from "../../../components/admin/Pagination";
// import { useAdminOrderStore } from "../../../store/admin/AdminOrderStore";

// const wrapperData = {
//   title: "Orders",
//   description: "Manage all customer orders",
//   breadcrumb: [
//     { label: "Dashboard", to: "/admin" },
//     { label: "View All Orders", to: "/admin/orders" },
//   ],
// };

// export default function ViewAllOrders() {
//   const [status, setStatus] = useState("all");
//   const [perPage, setPerPage] = useState(10);
//   const [currentPage, setCurrentPage] = useState(1);

//   // 1. Fetch from Store
//   const { fetchOrders, ordersData, loading, error } = useAdminOrderStore();

//   useEffect(() => {
//     fetchOrders();
//   }, [fetchOrders]);

//   // 2. Filter Logic (Note: Customer data is now nested in the Order object from the API)
//   const filtered = useMemo(() => {
//     if (status === "all") return ordersData;
//     return ordersData.filter((o) => o.order_status === status);
//   }, [status, ordersData]);

//   // 3. Pagination Logic
//   const start = (currentPage - 1) * perPage;
//   const paginated = filtered.slice(start, start + perPage);

//   // 4. Analytics (calculated from all orders)
//   const stats = useMemo(
//     () => ({
//       total: ordersData.length,
//       pending: ordersData.filter((o) => o.order_status === "pending").length,
//       confirmed: ordersData.filter((o) => o.order_status === "confirmed")
//         .length,
//       delivered: ordersData.filter((o) => o.order_status === "delivered")
//         .length,
//     }),
//     [ordersData]
//   );

//   // Loading State
//   if (loading && ordersData.length === 0) {
//     return (
//       <div className="flex flex-col items-center justify-center min-h-[400px]">
//         <Loader2 className="animate-spin text-primary" size={40} />
//         <p className="text-gray-500 mt-4">Loading orders...</p>
//       </div>
//     );
//   }

//   return (
//     <>
//       <AdminHeaderWrapper {...wrapperData} />

//       {/* Order Analytics */}
//       <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 pb-6">
//         <div className="bg-white p-4 rounded-2xl shadow border-l-4 border-gray-400">
//           <p className="text-sm text-gray-500">Total Orders</p>
//           <p className="text-2xl font-semibold">{stats.total}</p>
//         </div>

//         <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-2xl shadow border-l-4 border-yellow-400">
//           <p className="text-sm text-yellow-700">Pending</p>
//           <p className="text-2xl font-semibold text-yellow-800">
//             {stats.pending}
//           </p>
//         </div>

//         <div className="bg-blue-50 border border-blue-200 p-4 rounded-2xl shadow border-l-4 border-blue-400">
//           <p className="text-sm text-blue-700">Confirmed</p>
//           <p className="text-2xl font-semibold text-blue-800">
//             {stats.confirmed}
//           </p>
//         </div>

//         <div className="bg-green-50 border border-green-200 p-4 rounded-2xl shadow border-l-4 border-green-400">
//           <p className="text-sm text-green-700">Delivered</p>
//           <p className="text-2xl font-semibold text-green-800">
//             {stats.delivered}
//           </p>
//         </div>
//       </div>

//       <div className="space-y-6">
//         {/* Error Handling */}
//         {error && (
//           <div className="bg-red-50 text-red-700 p-4 rounded-xl flex items-center gap-2">
//             <AlertCircle size={20} />
//             <p>{error}</p>
//           </div>
//         )}

//         {/* Filters */}
//         <div className="bg-white p-4 rounded-2xl shadow flex items-center justify-between">
//           <div className="flex gap-4">
//             <select
//               value={status}
//               onChange={(e) => {
//                 setStatus(e.target.value);
//                 setCurrentPage(1);
//               }}
//               className="border-2 px-3 py-2 rounded-xl focus:ring-2 focus:ring-primary bg-white focus:outline-none border-[var(--color-border-color)]"
//             >
//               <option value="all">All Status</option>
//               <option value="pending">Pending</option>
//               <option value="confirmed">Confirmed</option>
//               <option value="delivered">Delivered</option>
//               <option value="cancelled">Cancelled</option>
//             </select>
//           </div>
//           <p className="text-sm text-gray-500">
//             Showing {paginated.length} of {filtered.length} orders
//           </p>
//         </div>

//         {/* Orders Table */}
//         <div className="bg-white p-4 rounded-2xl shadow">
//           <div className="overflow-x-auto">
//             <table className="w-full min-w-[800px]">
//               <thead>
//                 <tr className="bg-gray-50 text-left border-b">
//                   <th className="p-4 text-sm font-semibold text-gray-600">
//                     Order ID
//                   </th>
//                   <th className="p-4 text-sm font-semibold text-gray-600">
//                     Date
//                   </th>
//                   <th className="p-4 text-sm font-semibold text-gray-600">
//                     Customer
//                   </th>
//                   <th className="p-4 text-sm font-semibold text-gray-600">
//                     Total
//                   </th>
//                   <th className="p-4 text-sm font-semibold text-gray-600">
//                     Payment
//                   </th>
//                   <th className="p-4 text-sm font-semibold text-gray-600">
//                     Status
//                   </th>
//                   <th className="p-4 text-sm font-semibold text-gray-600 text-center">
//                     Action
//                   </th>
//                 </tr>
//               </thead>
//               <tbody className="divide-y">
//                 {paginated.length > 0 ? (
//                   paginated.map((o) => (
//                     <tr
//                       key={o.id}
//                       className="hover:bg-gray-50 transition-colors"
//                     >
//                       <td className="p-4 font-medium text-blue-600">#{o.id}</td>
//                       <td className="p-4 text-sm text-gray-600">
//                         {new Date(o.created_at).toLocaleDateString()}
//                       </td>
//                       <td className="p-4">
//                         <div className="text-sm font-medium text-gray-900">
//                           {o.customer
//                             ? `${o.customer.first_name} ${o.customer.last_name}`
//                             : "N/A"}
//                         </div>
//                         <div className="text-xs text-gray-500">
//                           {o.customer?.email}
//                         </div>
//                       </td>
//                       <td className="p-4 font-semibold text-gray-900">
//                         ₹{Number(o.actual_amount).toLocaleString()}
//                       </td>
//                       <td className="p-4">
//                         <span className="text-xs px-2 py-1 rounded-md bg-gray-100 font-medium uppercase">
//                           {o.payment_status}
//                         </span>
//                       </td>
//                       <td className="p-4">
//                         <span
//                           className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
//                             o.order_status === "delivered"
//                               ? "bg-green-100 text-green-700"
//                               : o.order_status === "pending"
//                               ? "bg-yellow-100 text-yellow-700"
//                               : o.order_status === "cancelled"
//                               ? "bg-red-100 text-red-700"
//                               : "bg-blue-100 text-blue-700"
//                           }`}
//                         >
//                           {o.order_status}
//                         </span>
//                       </td>
//                       <td className="p-4 text-center">
//                         <Link
//                           to={`/admin/orders/${o.id}`}
//                           className="inline-flex items-center justify-center w-9 h-9 border border-blue-400 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
//                         >
//                           <Eye size={18} />
//                         </Link>
//                       </td>
//                     </tr>
//                   ))
//                 ) : (
//                   <tr>
//                     <td colSpan="7" className="p-10 text-center text-gray-400">
//                       No orders found matching the criteria.
//                     </td>
//                   </tr>
//                 )}
//               </tbody>
//             </table>
//           </div>

//           <Pagination
//             totalItems={filtered.length}
//             currentPage={currentPage}
//             perPage={perPage}
//             onPageChange={setCurrentPage}
//             onPerPageChange={setPerPage}
//           />
//         </div>
//       </div>
//     </>
//   );
// }

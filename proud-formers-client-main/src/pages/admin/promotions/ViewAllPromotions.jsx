import { useEffect, useState, useMemo } from "react";
import {
  Eye,
  Plus,
  Trash2,
  Tag,
  ShoppingCart,
  Truck,
  Package,
  Loader2,
  AlertCircle,
  Search,
} from "lucide-react";
import { Link } from "react-router-dom";
import AdminHeaderWrapper from "../../../components/admin/AdminHeaderWrapper";
import Pagination from "../../../components/admin/Pagination";
import { useAdminPromotionStore } from "../../../store/admin/AdminPromotionStore";

const wrapperData = {
  title: "Promotions & Campaigns",
  description:
    "Monitor and manage your active marketing campaigns and category discounts.",
  breadcrumb: [
    { label: "Dashboard", to: "/admin" },
    { label: "Promotions", to: "/admin/promotions" },
  ],
};

export default function ViewAllPromotions() {
  const { promotionsData, fetchPromotions, deletePromotion, loading, error } =
    useAdminPromotionStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [type, setType] = useState("all");
  const [perPage, setPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchPromotions();
  }, [fetchPromotions]);

  // Analytics helper for stat cards
  const getStat = (t) =>
    promotionsData.filter((p) => p.targets.type === t).length;

  // Filter logic based on the dropdown
  const filtered = useMemo(() => {
    return promotionsData.filter((p) => {
      const matchesType = type === "all" || p.targets.type === type;
      const matchesSearch =
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesType && matchesSearch;
    });
  }, [type, searchQuery, promotionsData]);
  const start = (currentPage - 1) * perPage;
  const paginated = filtered.slice(start, start + perPage);

  const handleDelete = async (id, title) => {
    if (
      window.confirm(
        `Are you sure you want to delete "${title}"? This cannot be undone.`
      )
    ) {
      await deletePromotion(id);
    }
  };

  return (
    <div className="pb-10">
      <AdminHeaderWrapper {...wrapperData} />

      {/* Analytics Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pb-6 mt-6">
        <StatCard
          title="Product"
          count={getStat("PRODUCT")}
          icon={<Package className="text-blue-500" size={20} />}
          color="bg-blue-50"
        />
        <StatCard
          title="Category"
          count={getStat("CATEGORY")}
          icon={<Tag className="text-orange-500" size={20} />}
          color="bg-orange-50"
        />
        <StatCard
          title="Cart"
          count={getStat("CART")}
          icon={<ShoppingCart className="text-purple-500" size={20} />}
          color="bg-purple-50"
        />
        <StatCard
          title="Shipping"
          count={getStat("SHIPPING")}
          icon={<Truck className="text-green-500" size={20} />}
          color="bg-green-50"
        />
      </div>

      {/* Control Bar */}
      <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 flex flex-wrap justify-between items-center gap-4 mt-6">
        <div className="flex flex-wrap items-center gap-4 flex-1">
          {/* Search Input Field */}
          <div className="relative min-w-[300px] flex-1 lg:flex-none">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Search promotion title or description..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1); // Reset to page 1 on search
              }}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border-2 border-gray-200 rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-primary/20 outline-none transition-all"
            />
          </div>

          {/* Type Filter Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider hidden sm:block">
              Scope:
            </span>
            <select
              value={type}
              onChange={(e) => {
                setType(e.target.value);
                setCurrentPage(1); // Reset to page 1 on filter change
              }}
              className="bg-gray-50 border-2 border-gray-200 px-4 py-2.5 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-primary/20 outline-none cursor-pointer"
            >
              <option value="all">All Types</option>
              <option value="PRODUCT">Products</option>
              <option value="CATEGORY">Categories</option>
              {/* <option value="CART">Cart</option>
              <option value="SHIPPING">Shipping</option> */}
            </select>
          </div>
        </div>

        <Link
          to="/admin/promotions/new"
          className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-2xl font-bold hover:bg-primary-dark transition-all shadow-lg shadow-primary/20 shrink-0"
        >
          <Plus size={20} /> Create New
        </Link>
      </div>

      {/* Content Area */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl mt-6 border border-gray-100 shadow-sm">
          <Loader2 className="animate-spin text-primary mb-2" size={40} />
          <p className="text-gray-500 font-medium">Fetching promotions...</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-20 bg-red-50 text-red-500 rounded-3xl mt-6 border border-red-100">
          <AlertCircle size={40} className="mb-2" />
          <p className="font-bold">{error}</p>
        </div>
      ) : (
        <div className="bg-white p-4 rounded-3xl shadow mt-6">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-left text-gray-600 text-sm uppercase tracking-wider border-b">
                  <th className="p-4 font-bold"> Promotion Details</th>
                  <th className="p-4 font-bold">Scope</th>
                  <th className="p-4 font-bold">Discount</th>
                  <th className="p-4 font-bold">Validity</th>
                  <th className="p-4 font-bold">Status</th>
                  <th className="p-4 font-bold text-center">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-300">
                {paginated.length > 0 ? (
                  paginated.map((p) => (
                    <tr
                      key={p.id}
                      className="hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="p-5">
                        <p className="font-bold text-gray-800 text-sm">
                          {p.title}
                        </p>
                        <p className="text-xs text-gray-400 truncate max-w-[200px]">
                          {p.description}
                        </p>
                      </td>
                      <td className="p-5">
                        <span className="text-xs font-bold px-2 py-1 bg-gray-100 text-gray-500 rounded-lg">
                          {p.targets.type}
                        </span>
                      </td>
                      <td className="p-5">
                        <span className="font-mono font-bold text-primary">
                          {p.discount_type === "PERCENTAGE"
                            ? `${p.discount_value}%`
                            : `₹${p.discount_value}`}
                        </span>
                      </td>
                      <td className="p-5 text-xs text-gray-500 font-medium">
                        <div className="flex flex-col">
                          <span>
                            Start:{" "}
                            {new Date(p.config.start_date).toLocaleDateString()}
                          </span>
                          <span className="text-[10px] text-gray-400">
                            End:{" "}
                            {new Date(p.config.end_date).toLocaleDateString()}
                          </span>
                        </div>
                      </td>
                      <td className="p-5 text-center">
                        <div
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${
                            p.config.is_active
                              ? "bg-green-100 text-green-600"
                              : "bg-red-100 text-red-600"
                          }`}
                        >
                          <div
                            className={`w-1.5 h-1.5 rounded-full ${
                              p.config.is_active ? "bg-green-500" : "bg-red-500"
                            }`}
                          />
                          {p.config.is_active ? "Live" : "Ended"}
                        </div>
                      </td>
                      <td className="p-5 text-right">
                        <div className="flex justify-end gap-2">
                          <Link
                            to={`/admin/promotions/${p.id}`}
                            className="text-blue-600 hover:bg-blue-50 p-2 rounded-lg border border-blue-100"
                            title="View Details"
                          >
                            <Eye size={20} />
                          </Link>
                          <button
                            onClick={() => handleDelete(p.id, p.title)}
                            className="text-red-600 hover:bg-red-50 p-2 rounded-lg border border-red-100 cursor-pointer"
                            title="Delete Promotion"
                          >
                            <Trash2 size={20} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="6"
                      className="p-20 text-center text-gray-400 font-medium text-sm"
                    >
                      No promotions found matching your criteria.
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
      )}
    </div>
  );
}

// Sub-component for Analytics cards
function StatCard({ title, count, icon, color }) {
  return (
    <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 flex items-center justify-between">
      <div>
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
          {title}
        </p>
        <p className="text-2xl font-bold text-gray-800">{count}</p>
      </div>
      <div className={`p-3 rounded-2xl ${color}`}>{icon}</div>
    </div>
  );
}

// import { useState, useMemo } from "react";
// import { Eye, Plus } from "lucide-react";
// import { Link } from "react-router-dom";
// import AdminHeaderWrapper from "../../../components/admin/AdminHeaderWrapper";
// import Pagination from "../../../components/admin/Pagination";

// // ---- Dummy Data (based on Promo DB schema) ----
// const promotionsData = [
//   {
//     id: 1,
//     name: "Rice Festival Offer",
//     promotion_type: "CATEGORY",
//     discount_type: "PERCENTAGE",
//     discount_value: 10,
//     start_date: "2025-01-01",
//     end_date: "2025-01-10",
//     is_active: true,
//   },
//   {
//     id: 2,
//     name: "Basmati Special",
//     promotion_type: "PRODUCT",
//     discount_type: "PERCENTAGE",
//     discount_value: 20,
//     start_date: "2025-01-05",
//     end_date: "2025-01-20",
//     is_active: true,
//   },
//   {
//     id: 3,
//     name: "Cart ₹200 OFF",
//     promotion_type: "CART",
//     discount_type: "FLAT",
//     discount_value: 200,
//     start_date: "2025-01-01",
//     end_date: "2025-01-31",
//     is_active: false,
//   },
//   {
//     id: 4,
//     name: "Free Shipping Above ₹999",
//     promotion_type: "SHIPPING",
//     discount_type: "FLAT",
//     discount_value: 80,
//     start_date: "2025-01-01",
//     end_date: "2025-01-31",
//     is_active: true,
//   },
// ];

// const wrapperData = {
//   title: "Promotions & Coupons",
//   description: "View and manage all promotions and promo codes",
//   breadcrumb: [
//     { label: "Dashboard", to: "/admin" },
//     { label: "Promotions", to: "/admin/promotions" },
//   ],
// };

// export default function ViewAllPromotions() {
//   const [type, setType] = useState("all");
//   const [perPage, setPerPage] = useState(10);
//   const [currentPage, setCurrentPage] = useState(1);

//   const filtered = useMemo(() => {
//     if (type === "all") return promotionsData;
//     return promotionsData.filter((p) => p.promotion_type === type);
//   }, [type]);

//   const start = (currentPage - 1) * perPage;
//   const paginated = filtered.slice(start, start + perPage);

//   return (
//     <>
//       <AdminHeaderWrapper {...wrapperData} />

//       {/* Analytics */}
//       <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 pb-6">
//         {["PRODUCT", "CATEGORY", "CART", "SHIPPING"].map((t) => (
//           <div key={t} className="bg-white p-4 rounded-2xl shadow">
//             <p className="text-sm text-gray-500">{t} Promotions</p>
//             <p className="text-2xl font-semibold">
//               {promotionsData.filter((p) => p.promotion_type === t).length}
//             </p>
//           </div>
//         ))}
//       </div>

//       {/* Filters */}
//       <div className="bg-[var(--color-surface)] p-4 rounded-2xl shadow flex justify-between items-center">
//         <select
//           value={type}
//           onChange={(e) => setType(e.target.value)}
//           className="border px-3 py-2 rounded-xl bg-white"
//         >
//           <option value="all">All Types</option>
//           <option value="PRODUCT">Product</option>
//           <option value="CATEGORY">Category</option>
//           <option value="CART">Cart</option>
//           <option value="SHIPPING">Shipping</option>
//         </select>

//         <Link
//           to="/admin/promotions/new"
//           className="inline-flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-xl"
//         >
//           <Plus size={18} /> Create Promotion
//         </Link>
//       </div>

//       {/* Promotions Table */}
//       <div className="bg-[var(--color-surface)] p-4 rounded-2xl shadow overflow-x-auto mt-6">
//         <table className="w-full min-w-[900px]">
//           <thead>
//             <tr className="bg-[var(--color-muted-bg)] text-left">
//               <th className="p-3">Name</th>
//               <th className="p-3">Type</th>
//               <th className="p-3">Discount</th>
//               <th className="p-3">Start</th>
//               <th className="p-3">End</th>
//               <th className="p-3">Status</th>
//               <th className="p-3 text-center">Action</th>
//             </tr>
//           </thead>
//           <tbody>
//             {paginated.map((p) => (
//               <tr key={p.id} className="border-b odd:bg-white even:bg-gray-50">
//                 <td className="p-3 font-medium">{p.name}</td>
//                 <td className="p-3">{p.promotion_type}</td>
//                 <td className="p-3">
//                   {p.discount_type === "PERCENTAGE"
//                     ? `${p.discount_value}%`
//                     : `₹${p.discount_value}`}
//                 </td>
//                 <td className="p-3">{p.start_date}</td>
//                 <td className="p-3">{p.end_date}</td>
//                 <td className="p-3">
//                   <span
//                     className={`px-2 py-1 rounded-lg text-xs font-medium ${
//                       p.is_active
//                         ? "bg-green-100 text-green-700"
//                         : "bg-red-100 text-red-700"
//                     }`}
//                   >
//                     {p.is_active ? "Active" : "Inactive"}
//                   </span>
//                 </td>
//                 <td className="p-3 text-center">
//                   <Link
//                     to={`/admin/promotions/${p.id}`}
//                     className="inline-flex border border-blue-400 text-blue-600 rounded-lg p-2 hover:bg-blue-50"
//                   >
//                     <Eye size={18} />
//                   </Link>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>

//         <Pagination
//           totalItems={filtered.length}
//           currentPage={currentPage}
//           perPage={perPage}
//           onPageChange={setCurrentPage}
//           onPerPageChange={setPerPage}
//         />
//       </div>
//     </>
//   );
// }

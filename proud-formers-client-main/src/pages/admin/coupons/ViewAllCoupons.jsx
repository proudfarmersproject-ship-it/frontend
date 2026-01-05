import { useState, useMemo, useEffect } from "react";
import { Plus, Search, Eye, Trash2, Ticket, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import Pagination from "../../../components/admin/Pagination";
import AdminHeaderWrapper from "../../../components/admin/AdminHeaderWrapper";
import { useAdminCouponStore } from "../../../store/admin/AdminCouponStore";

const wrapperData = {
  title: "Coupon Management",
  description: "Create and monitor promotional discount codes",
  breadcrumb: [
    { label: "Dashboard", to: "/admin" },
    { label: "Coupons", to: "/admin/coupons" },
  ],
};

export default function ViewAllCoupons() {
  const [search, setSearch] = useState("");
  const [type, setType] = useState("all");

  // 1. Connect to Store
  const {
    fetchCoupons,
    couponsData,
    loading,
    deleteCoupon,
    toggleCouponStatus,
  } = useAdminCouponStore();

  // 2. Pagination State
  const [perPage, setPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchCoupons();
  }, [fetchCoupons]);

  // 3. Filter Logic
  const filtered = useMemo(() => {
    return couponsData.filter((c) => {
      const matchesSearch = c.code.toLowerCase().includes(search.toLowerCase());
      const matchesType = type === "all" || c.discount_type === type;
      return matchesSearch && matchesType;
    });
  }, [couponsData, search, type]);

  const start = (currentPage - 1) * perPage;
  const paginated = filtered.slice(start, start + perPage);

  const handleDelete = async (coupon) => {
    if (window.confirm(`Are you sure you want to delete ${coupon.code}?`)) {
      await deleteCoupon(coupon.id);
    }
  };

  return (
    <>
      <AdminHeaderWrapper {...wrapperData} />

      <div className="space-y-6">
        {/* Analytics Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="bg-blue-100 p-3 rounded-xl text-blue-600">
              <Ticket />
            </div>
            <div>
              <p className="text-gray-500 text-xs font-bold uppercase">
                Total Coupons
              </p>
              <p className="text-xl font-bold">{couponsData.length}</p>
            </div>
          </div>
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="bg-green-100 p-3 rounded-xl text-green-600">
              <Ticket />
            </div>
            <div>
              <p className="text-gray-500 text-xs font-bold uppercase">
                Active Codes
              </p>
              <p className="text-xl font-bold">
                {couponsData.filter((c) => c.validity.is_active).length}
              </p>
            </div>
          </div>
        </div>

        {/* Filters & Actions */}
        <div className="bg-white p-4 rounded-2xl shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="flex flex-wrap gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:flex-none">
              <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search code..."
                className=" pl-10 pr-3 py-2 bg-gray-50 border-2 border-gray-200 px-4 py-2.5 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-primary/20 outline-none cursor-pointer"
              />
            </div>

            <select
              value={type}
              onChange={(e) => {
                setType(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-gray-50 border-2 border-gray-200 px-4 py-2.5 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-primary/20 outline-none cursor-pointer"
            >
              <option value="all">All Types</option>
              <option value="PERCENTAGE">Percentage (%)</option>
              <option value="FLAT">Flat Amount (₹)</option>
            </select>
          </div>

          <Link
            to="/admin/coupons/new"
            className="w-full md:w-auto bg-primary text-white px-6 py-2 rounded-xl flex items-center justify-center gap-2 hover:bg-primary-dark transition-all shadow-lg shadow-primary/20"
          >
            <Plus size={18} /> Add New Coupon
          </Link>
        </div>

        {/* Table */}
        <div className="bg-white p-4 rounded-3xl shadow">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead>
                <tr className="bg-gray-50 text-left text-gray-600 text-sm uppercase tracking-wider border-b">
                  <th className="p-4 font-bold">Code</th>
                  <th className="p-4 font-bold">Value</th>
                  <th className="p-4 font-bold">Requirement</th>
                  <th className="p-4 font-bold">Usage Progress</th>
                  <th className="p-4 font-bold">Status</th>
                  <th className="p-4 font-bold text-center">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-300">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="text-center py-20">
                      <Loader2
                        className="animate-spin mx-auto text-primary"
                        size={32}
                      />
                      <p className="text-gray-400 mt-2">Loading coupons...</p>
                    </td>
                  </tr>
                ) : paginated.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-20 text-gray-400">
                      No matching coupons found.
                    </td>
                  </tr>
                ) : (
                  paginated.map((c) => {
                    const usagePercent =
                      (c.usage_stats.used / c.usage_stats.limit) * 100;

                    return (
                      <tr
                        key={c.id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="p-4">
                          <span className="font-mono font-bold text-primary bg-primary/5 px-2 py-1 rounded">
                            {c.code}
                          </span>
                        </td>
                        <td className="p-4 font-semibold text-gray-700">
                          {c.discount_type === "PERCENTAGE"
                            ? `${c.discount_value}%`
                            : `₹${c.discount_value}`}
                        </td>
                        <td className="p-4 text-sm text-gray-500">
                          Min Order: ₹{c.min_order_value}
                        </td>
                        <td className="p-4">
                          <div className="w-full max-w-[120px]">
                            <div className="flex justify-between text-[10px] mb-1">
                              <span>{c.usage_stats.used} used</span>
                              <span>{c.usage_stats.limit}</span>
                            </div>
                            <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                              <div
                                className={`h-full transition-all ${
                                  usagePercent > 90
                                    ? "bg-red-500"
                                    : "bg-green-500"
                                }`}
                                style={{ width: `${usagePercent}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <button
                            onClick={() =>
                              toggleCouponStatus(c.id, !c.validity.is_active)
                            }
                            className={`px-3 py-1 text-[10px] font-bold uppercase rounded-full transition-all ${
                              c.validity.is_active
                                ? "bg-green-100 text-green-700 hover:bg-green-200"
                                : "bg-red-100 text-red-700 hover:bg-red-200"
                            }`}
                          >
                            {c.validity.is_active ? "Active" : "Disabled"}
                          </button>
                        </td>
                        <td className="p-4">
                          <div className="flex justify-center gap-2">
                            <Link
                              to={`/admin/coupons/${c.id}`}
                              className="text-blue-600 hover:bg-blue-50 p-2 rounded-lg border border-blue-100"
                            >
                              <Eye size={18} />
                            </Link>
                            <button
                              type="button"
                              onClick={() => handleDelete(c)}
                              className="text-red-600 hover:bg-red-50 p-2 rounded-lg border border-red-100 cursor-pointer"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <Pagination
            totalItems={filtered.length}
            currentPage={currentPage}
            perPage={perPage}
            onPageChange={setCurrentPage}
            onPerPageChange={setPerPage}
          />
        </div>
      </div>
    </>
  );
}

import { useParams, useNavigate } from "react-router-dom";
import { useState, useMemo, useEffect } from "react";
import {
  Pencil,
  Save,
  Trash2,
  Package,
  User,
  MapPin,
  Mail,
  Phone,
  ChevronRight,
  ArrowLeft,
} from "lucide-react";
import OrderCartSection from "./OrderCartSection";
import Pagination from "../../../components/admin/Pagination";
import { useAdminCustomerStore } from "../../../store/admin/AdminCustomerStore";
import AdminHeaderWrapper from "../../../components/admin/AdminHeaderWrapper";

export default function CustomerDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const {
    selectedCustomer,
    customerOrders,
    customerCart,
    loading,
    fetchCustomerById,
    fetchCustomerOrders,
    fetchCustomerCart,
    deleteCustomer,
  } = useAdminCustomerStore();

  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    addresses: [],
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(5);

  useEffect(() => {
    fetchCustomerById(id);
    fetchCustomerOrders(id);
    fetchCustomerCart(id);
  }, [id]);

  useEffect(() => {
    if (selectedCustomer) {
      setForm({
        first_name: selectedCustomer.first_name || "",
        last_name: selectedCustomer.last_name || "",
        email: selectedCustomer.email || "",
        phone: selectedCustomer.phone || "",
        addresses: selectedCustomer.addresses || [],
      });
    }
  }, [selectedCustomer]);

  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * perPage;
    return customerOrders.slice(start, start + perPage);
  }, [customerOrders, currentPage, perPage]);

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="relative">
          <div className="h-16 w-16 border-4 border-blue-100 rounded-full"></div>
          <div className="absolute top-0 h-16 w-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
        <p className="mt-4 text-slate-500 font-bold tracking-widest text-xs uppercase">
          Assembling Dossier...
        </p>
      </div>
    );

  return (
    <div className="max-w-[1600px] mx-auto pb-20 space-y-8 animate-in fade-in duration-500">
      {/* HEADER AREA */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 px-2">
        <div className="space-y-2">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-blue-600 transition-colors mb-2 group"
          >
            <ArrowLeft
              size={14}
              className="group-hover:-translate-x-1 transition-transform"
            />{" "}
            BACK TO CUSTOMERS
          </button>
          <AdminHeaderWrapper
            title={`${form.first_name} ${form.last_name}`}
            description={`Account verified since ${new Date().toLocaleDateString(
              "en-US",
              { month: "long", year: "numeric" }
            )}`}
            breadcrumb={[
              { label: "Directory", to: "/admin/customers" },
              { label: id },
            ]}
          />
        </div>

        {/* <div className="flex items-center gap-3">
          <button
            onClick={() => setEditMode(!editMode)}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm transition-all shadow-sm ${
              editMode
                ? "bg-emerald-600 text-white shadow-emerald-200"
                : "bg-white text-slate-700 hover:bg-slate-50 border border-slate-200"
            }`}
          >
            {editMode ? (
              <>
                <Save size={18} /> Finish Editing
              </>
            ) : (
              <>
                <Pencil size={18} /> Modify Profile
              </>
            )}
          </button>
          <button
            onClick={() => deleteCustomer(id)}
            className="p-3 rounded-2xl bg-white border border-red-100 text-red-500 hover:bg-red-50 transition-all shadow-sm"
          >
            <Trash2 size={20} />
          </button>
        </div> */}
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        {/* LEFT: CUSTOMER PROFILE CARD */}
        <div className="lg:col-span-4 space-y-8">
          {/* Identity Section */}
          <section className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-[0.03]">
              <User size={120} />
            </div>

            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                  <User size={20} />
                </div>
                <h3 className="font-black text-slate-900 uppercase tracking-[0.15em] text-xs">
                  Customer Identity
                </h3>
              </div>

              <div className="space-y-6">
                {[
                  { key: "first_name", label: "First Name", icon: null },
                  { key: "last_name", label: "Last Name", icon: null },
                  {
                    key: "email",
                    label: "Email Address",
                    icon: <Mail size={14} />,
                  },
                  {
                    key: "phone",
                    label: "Phone Number",
                    icon: <Phone size={14} />,
                  },
                ].map((field) => (
                  <div key={field.key} className="group">
                    <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                      {field.icon} {field.label}
                    </label>
                    {editMode ? (
                      <input
                        className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl focus:ring-4 focus:ring-blue-50 outline-none transition-all font-medium text-slate-900"
                        value={form[field.key]}
                        onChange={(e) =>
                          setForm({ ...form, [field.key]: e.target.value })
                        }
                      />
                    ) : (
                      <p className="text-md font-bold text-slate-900 bg-white group-hover:translate-x-1 transition-transform">
                        {form[field.key] || "—"}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Address Section */}
          <section className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 p-8">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
                <MapPin size={20} />
              </div>
              <h3 className="font-black text-slate-900 uppercase tracking-[0.15em] text-xs">
                Fulfillment Addresses
              </h3>
            </div>

            <div className="space-y-4">
              {form.addresses.length > 0 ? (
                form.addresses.map((addr) => (
                  <div
                    key={addr.id}
                    className={`p-5 rounded-3xl border-2 transition-all group ${
                      addr.is_default
                        ? "border-blue-100 bg-blue-50/30"
                        : "border-slate-50 hover:border-slate-200"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs font-black text-slate-900 tracking-tight">
                        {addr.city}
                      </span>
                      {addr.is_default && (
                        <span className="text-[9px] font-black bg-blue-600 text-white px-2 py-0.5 rounded-full uppercase tracking-widest">
                          Default
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed italic">
                      {addr.address_line1}, {addr.pincode}
                    </p>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 border-2 border-dashed border-slate-100 rounded-3xl">
                  <p className="text-xs font-bold text-slate-300 uppercase">
                    No Addresses Stored
                  </p>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* RIGHT: CART & ORDERS */}
        <div className="lg:col-span-8 space-y-10">
          {/* CART COMPONENT (Already Styled) */}
          <OrderCartSection cartData={customerCart} />

          {/* ORDERS TABLE SECTION */}
          <section className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/40 border border-slate-100 overflow-hidden">
            <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
                  <Package size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">
                    Transaction History
                  </h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                    Lifetime Orders: {customerOrders.length}
                  </p>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50">
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Ref. ID
                    </th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Date
                    </th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Status
                    </th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {paginatedOrders.map((order) => (
                    <tr
                      key={order.id}
                      className="hover:bg-blue-50/30 transition-all cursor-pointer group"
                      onClick={() => navigate(`/admin/orders/${order.id}`)}
                    >
                      <td className="px-8 py-6">
                        <span className="text-sm font-black text-slate-900 group-hover:text-blue-600 transition-colors">
                          #{order.id}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <p className="text-xs font-bold text-slate-500">
                          {new Date(order.created_at).toLocaleDateString(
                            "en-GB",
                            { day: "2-digit", month: "short", year: "numeric" }
                          )}
                        </p>
                      </td>
                      <td className="px-8 py-6">
                        <span
                          className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-2 w-fit ${
                            order.order_status === "delivered"
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-orange-100 text-orange-700"
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              order.order_status === "delivered"
                                ? "bg-emerald-500"
                                : "bg-orange-500 animate-pulse"
                            }`}
                          />
                          {order.order_status}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex items-center justify-end gap-2 font-mono">
                          <span className="text-sm font-black text-slate-900">
                            ₹{order.actual_amount.toLocaleString()}
                          </span>
                          <ChevronRight
                            size={14}
                            className="text-slate-300 group-hover:text-blue-400 transition-colors"
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-6 bg-slate-50/50 border-t border-slate-50">
              <Pagination
                totalItems={customerOrders.length}
                currentPage={currentPage}
                perPage={perPage}
                onPageChange={setCurrentPage}
                onPerPageChange={setPerPage}
              />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

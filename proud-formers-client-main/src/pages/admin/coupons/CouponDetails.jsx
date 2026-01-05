import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  Pencil,
  Save,
  Trash2,
  ChevronLeft,
  Loader2,
  AlertCircle,
  Info,
  Ticket,
} from "lucide-react";
import AdminHeaderWrapper from "../../../components/admin/AdminHeaderWrapper";
import { useAdminCouponStore } from "../../../store/admin/AdminCouponStore";

export default function CouponDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const {
    selectedCoupon,
    fetchCouponById,
    updateCoupon,
    deleteCoupon,
    loading,
    error,
    clearStatus,
  } = useAdminCouponStore();

  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({});

  useEffect(() => {
    fetchCouponById(id);
    return () => clearStatus();
  }, [id, fetchCouponById, clearStatus]);

  // Sync nested API data to local flat form state
  useEffect(() => {
    if (selectedCoupon) {
      setForm({
        code: selectedCoupon.code,
        discount_type: selectedCoupon.discount_type,
        discount_value: selectedCoupon.discount_value,
        min_order_value: selectedCoupon.min_order_value,
        // Nested Mappings
        usage_limit: selectedCoupon.usage_stats.limit,
        start_date: selectedCoupon.validity.start_date.split("T")[0], // Format for date input
        end_date: selectedCoupon.validity.end_date.split("T")[0],
        is_active: selectedCoupon.validity.is_active,
      });
    }
  }, [selectedCoupon]);

  const updateField = (k, v) => setForm({ ...form, [k]: v });

  const handleSave = async () => {
    // Re-structure the data back into the API format if your backend requires it,
    // or send a flat object if your backend handles the nesting.
    const payload = {
      ...form,
      discount_value: parseFloat(form.discount_value),
      min_order_value: parseFloat(form.min_order_value),
      usage_limit: parseInt(form.usage_limit),
    };

    const success = await updateCoupon(id, payload);
    if (success) setEditMode(false);
  };

  if (loading && !selectedCoupon)
    return (
      <div className="p-10 text-center">
        <Loader2 className="animate-spin mx-auto" />
      </div>
    );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Action Header */}
      <div className="md:flex justify-between items-center">
        <AdminHeaderWrapper
          title={`Coupons #${id}`}
          description="View / Edit Coupons details"
          breadcrumb={[
            { label: "Coupons", to: "/admin/coupons" },
            { label: id },
          ]}
        />
        <div className="flex gap-2">
          {!editMode ? (
            <button
              onClick={() => setEditMode(true)}
              className="flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-xl font-bold hover:bg-primary/20 transition-all"
            >
              <Pencil size={18} /> Edit
            </button>
          ) : (
            <button
              onClick={handleSave}
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-green-700 transition-all"
            >
              <Save size={18} /> Save
            </button>
          )}
          <button
            onClick={() => deleteCoupon(id)}
            className="flex items-center gap-2 bg-red-50 text-red-600 px-4 py-2 rounded-xl font-bold hover:bg-red-100 transition-all"
          >
            <Trash2 size={18} /> Delete
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Details */}
        <div className="md:col-span-2 space-y-6">
          <section className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
            <h3 className="text-gray-400 font-bold text-xs uppercase mb-4">
              Core Configuration
            </h3>
            <div className="grid grid-cols-2 gap-6">
              <Field
                label="Discount Code"
                value={form.code}
                editMode={editMode}
                onChange={(v) => updateField("code", v.toUpperCase())}
              />
              <Field
                label="Status"
                value={form.is_active}
                editMode={editMode}
                type="select"
                options={[
                  { label: "Active", value: true },
                  { label: "Inactive", value: false },
                ]}
                onChange={(v) => updateField("is_active", v === "true")}
              />
              <Field label="Type" value={form.discount_type} editMode={false} />
              <Field
                label="Value"
                value={form.discount_value}
                editMode={editMode}
                type="number"
                onChange={(v) => updateField("discount_value", v)}
              />
            </div>
          </section>

          <section className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
            <h3 className="text-gray-400 font-bold text-xs uppercase mb-4">
              Dates & Validity
            </h3>
            <div className="grid grid-cols-2 gap-6">
              <Field
                label="Start Date"
                value={form.start_date}
                editMode={editMode}
                type="date"
                onChange={(v) => updateField("start_date", v)}
              />
              <Field
                label="End Date"
                value={form.end_date}
                editMode={editMode}
                type="date"
                onChange={(v) => updateField("end_date", v)}
              />
            </div>
          </section>
        </div>

        {/* Sidebar: Performance & Limits */}
        <div className="space-y-6">
          <div className="bg-gray-900 text-white p-6 rounded-3xl shadow-xl">
            <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-4">
              Redemption Stats
            </p>
            <div className="flex items-end justify-between mb-2">
              <h2 className="text-4xl font-bold">
                {selectedCoupon?.usage_stats.used}
              </h2>
              <p className="text-gray-400 text-sm mb-1">
                / {selectedCoupon?.usage_stats.limit} Total
              </p>
            </div>
            <div className="w-full bg-gray-700 h-2 rounded-full overflow-hidden">
              <div
                className="bg-primary h-full transition-all duration-500"
                style={{
                  width: `${
                    (selectedCoupon?.usage_stats.used /
                      selectedCoupon?.usage_stats.limit) *
                    100
                  }%`,
                }}
              />
            </div>
            <p className="text-xs text-primary mt-3 font-medium">
              {selectedCoupon?.usage_stats.remaining} coupons remaining
            </p>
          </div>

          <section className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
            <h3 className="text-gray-400 font-bold text-xs uppercase mb-4">
              Purchase Rules
            </h3>
            <div className="space-y-4">
              <Field
                label="Min Order Value"
                value={form.min_order_value}
                editMode={editMode}
                type="number"
                onChange={(v) => updateField("min_order_value", v)}
              />
              <Field
                label="Max Usage Limit"
                value={form.usage_limit}
                editMode={editMode}
                type="number"
                onChange={(v) => updateField("usage_limit", v)}
              />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

// Reuse the Field component from previous response
function Field({
  label,
  value,
  editMode,
  onChange,
  type = "text",
  options = [],
}) {
  return (
    <div>
      <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">
        {label}
      </label>
      {editMode ? (
        type === "select" ? (
          <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full p-3 rounded-xl border-2 transition-all outline-none focus:ring-2 focus:ring-primary/20 border-gray-100 bg-gray-50 focus:border-primary"
          >
            {options.map((opt) => (
              <option key={opt.label} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        ) : (
          <input
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full p-3 rounded-xl border-2 transition-all outline-none focus:ring-2 focus:ring-primary/20 border-gray-100 bg-gray-50 focus:border-primary"
          />
        )
      ) : (
        <p className="font-semibold text-gray-700">
          {typeof value === "boolean"
            ? value
              ? "✅ Active"
              : "❌ Inactive"
            : value || "—"}
        </p>
      )}
    </div>
  );
}
// import { useParams, useNavigate } from "react-router-dom";
// import { useEffect, useState } from "react";
// import { Pencil, Save, Trash2 } from "lucide-react";
// import AdminHeaderWrapper from "../../../components/admin/AdminHeaderWrapper";
// import {
//   fetchCouponById,
//   //   deleteCouponById,
// } from "../../../utils/admin/coupons";

// export default function CouponDetails() {
//   const { id } = useParams();
//   const navigate = useNavigate();

//   /* ---------------- STATE ---------------- */
//   const [loading, setLoading] = useState(true);
//   const [editMode, setEditMode] = useState(false);
//   const [coupon, setCoupon] = useState(null);

//   const [form, setForm] = useState({
//     code: "",
//     description: "",
//     discount_type: "",
//     discount_value: "",
//     min_order_value: "",
//     max_discount: "",
//     usage_limit: "",
//     per_user_limit: "",
//     start_date: "",
//     end_date: "",
//     is_active: true,
//   });

//   const update = (k, v) => setForm({ ...form, [k]: v });

//   /* ---------------- LOAD COUPON ---------------- */
//   useEffect(() => {
//     fetchCouponById(id)
//       .then((data) => {
//         setCoupon(data);
//         setForm({
//           code: data.code,
//           description: data.description,
//           discount_type: data.discount_type,
//           discount_value: data.discount_value,
//           min_order_value: data.min_order_value ?? "",
//           max_discount: data.max_discount ?? "",
//           usage_limit: data.usage_limit ?? "",
//           per_user_limit: data.per_user_limit,
//           start_date: data.start_date,
//           end_date: data.end_date,
//           is_active: data.is_active,
//         });
//       })
//       .finally(() => setLoading(false));
//   }, [id]);

//   /* ---------------- ACTIONS ---------------- */
//   const handleSave = () => {
//     console.log("Updated coupon payload:", form);
//     setEditMode(false);
//   };

//   const handleDelete = () => {
//     if (!confirm("Delete this coupon?")) return;
//     // deleteCouponById(id);
//     navigate("/admin/coupons");
//   };

//   if (loading) return <div className="p-6">Loading coupon...</div>;
//   if (!coupon) return <div className="p-6 text-red-600">Coupon not found</div>;

//   return (
//     <div className="space-y-6">
//       {/* HEADER */}
//       <div className="flex justify-between items-center">
//         <AdminHeaderWrapper
//           title={`Coupon #${coupon.code}`}
//           description="View / Edit coupon details"
//           breadcrumb={[
//             { label: "Coupons", to: "/admin/coupons" },
//             { label: coupon.code },
//           ]}
//         />

//         <div className="flex gap-3">
//           {!editMode ? (
//             <button
//               onClick={() => setEditMode(true)}
//               className="border bg-primary-light text-white px-4 py-2 rounded-lg flex items-center gap-2"
//             >
//               <Pencil size={16} /> Edit
//             </button>
//           ) : (
//             <button
//               onClick={handleSave}
//               className="bg-primary text-white px-4 py-2 rounded-lg flex items-center gap-2"
//             >
//               <Save size={16} /> Save
//             </button>
//           )}

//           <button
//             onClick={handleDelete}
//             className="border border-red-500 text-red-600 px-4 py-2 rounded-lg flex items-center gap-2"
//           >
//             <Trash2 size={16} /> Delete
//           </button>
//         </div>
//       </div>

//       {/* BASIC INFO */}
//       <div className="bg-white p-6 rounded-2xl shadow">
//         <h2 className="text-lg font-semibold mb-4">Basic Information</h2>

//         <div className="grid md:grid-cols-2 gap-4">
//           <Field
//             label="Coupon Code"
//             value={form.code}
//             editMode={editMode}
//             onChange={(v) => update("code", v)}
//           />

//           <Field
//             label="Status"
//             value={form.is_active ? "Active" : "Inactive"}
//             editMode={editMode}
//             type="select"
//             options={[
//               { label: "Active", value: true },
//               { label: "Inactive", value: false },
//             ]}
//             onChange={(v) => update("is_active", v === "true")}
//           />

//           <Field
//             label="Description"
//             value={form.description}
//             editMode={editMode}
//             onChange={(v) => update("description", v)}
//             full
//           />
//         </div>
//       </div>

//       {/* DISCOUNT INFO */}
//       <div className="bg-white p-6 rounded-2xl shadow">
//         <h2 className="text-lg font-semibold mb-4">Discount Details</h2>

//         <div className="grid md:grid-cols-3 gap-4">
//           <ReadOnly label="Type" value={form.discount_type} />
//           <ReadOnly label="Value" value={form.discount_value} />
//           {form.discount_type === "PERCENTAGE" && (
//             <ReadOnly label="Max Discount" value={form.max_discount || "—"} />
//           )}
//         </div>
//       </div>

//       {/* USAGE INFO */}
//       <div className="bg-white p-6 rounded-2xl shadow">
//         <h2 className="text-lg font-semibold mb-4">Usage Rules</h2>

//         <div className="grid md:grid-cols-3 gap-4">
//           <ReadOnly
//             label="Min Order Value"
//             value={form.min_order_value || "—"}
//           />
//           <ReadOnly label="Usage Limit" value={form.usage_limit || "∞"} />
//           <ReadOnly label="Per User Limit" value={form.per_user_limit} />
//         </div>
//       </div>

//       {/* VALIDITY */}
//       <div className="bg-white p-6 rounded-2xl shadow">
//         <h2 className="text-lg font-semibold mb-4">Validity Period</h2>

//         <div className="grid md:grid-cols-2 gap-4">
//           <ReadOnly label="Start Date" value={form.start_date} />
//           <ReadOnly label="End Date" value={form.end_date} />
//         </div>
//       </div>
//     </div>
//   );
// }

// /* ---------------- SMALL HELPERS ---------------- */

// function Field({
//   label,
//   value,
//   editMode,
//   onChange,
//   type = "text",
//   options = [],
//   full = false,
// }) {
//   return (
//     <div className={full ? "md:col-span-2" : ""}>
//       <label className="text-sm text-gray-500">{label}</label>
//       {editMode ? (
//         type === "select" ? (
//           <select
//             value={value}
//             onChange={(e) => onChange(e.target.value)}
//             className="mt-1 w-full p-3 border-2 rounded-xl"
//           >
//             {options.map((o) => (
//               <option key={o.label} value={o.value}>
//                 {o.label}
//               </option>
//             ))}
//           </select>
//         ) : (
//           <input
//             value={value}
//             onChange={(e) => onChange(e.target.value)}
//             className="mt-1 w-full p-3 border-2 rounded-xl"
//           />
//         )
//       ) : (
//         <p className="mt-2 font-medium">{value || "—"}</p>
//       )}
//     </div>
//   );
// }

// function ReadOnly({ label, value }) {
//   return (
//     <div>
//       <label className="text-sm text-gray-500">{label}</label>
//       <p className="mt-2 font-medium">{value || "-"}</p>
//     </div>
//   );
// }

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, Save, RotateCcw, AlertCircle } from "lucide-react";
import AdminHeaderWrapper from "../../../components/admin/AdminHeaderWrapper";
import { useAdminCouponStore } from "../../../store/admin/AdminCouponStore";

const wrapperData = {
  title: "New Coupon",
  description: "Create a new promo code for discounts.",
  breadcrumb: [
    { label: "Dashboard", to: "/admin" },
    { label: "Coupons", to: "/admin/coupons" },
    { label: "New Coupon", to: "/admin/coupons/new" },
  ],
};

export default function AddNewCoupon() {
  const navigate = useNavigate();

  // 1. Store Integration
  const { addCoupon, loading, error, successMessage, clearStatus } =
    useAdminCouponStore();

  const initialFormData = {
    code: "",
    description: "",
    discount_type: "PERCENTAGE",
    discount_value: "",
    min_order_value: "",
    max_discount: "",
    usage_limit: "",
    per_user_limit: 1,
    start_date: "",
    end_date: "",
    is_active: true,
  };

  const [form, setForm] = useState(initialFormData);
  const [errors, setErrors] = useState({});

  // 2. Clear alerts on unmount
  useEffect(() => {
    return () => clearStatus();
  }, [clearStatus]);

  // 3. Redirect on success
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        navigate("/admin/coupons");
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, navigate]);

  const updateField = (field, value) => {
    setForm({ ...form, [field]: value });
    if (errors[field]) setErrors({ ...errors, [field]: null });
  };

  const validate = () => {
    const e = {};
    if (!form.code.trim()) e.code = "Coupon code is required";
    if (!form.discount_value || form.discount_value <= 0)
      e.discount_value = "Discount value must be greater than 0";
    if (!form.start_date) e.start_date = "Start date required";
    if (!form.end_date) e.end_date = "End date required";

    if (
      form.start_date &&
      form.end_date &&
      new Date(form.start_date) >= new Date(form.end_date)
    ) {
      e.end_date = "End date must be after start date";
    }

    if (form.discount_type === "PERCENTAGE" && form.discount_value > 100) {
      e.discount_value = "Percentage cannot exceed 100";
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    // Format payload to match DB/API types
    const payload = {
      ...form,
      discount_value: Number(form.discount_value),
      min_order_value: form.min_order_value ? Number(form.min_order_value) : 0,
      max_discount: form.max_discount ? Number(form.max_discount) : null,
      usage_limit: form.usage_limit ? Number(form.usage_limit) : 9999,
      per_user_limit: Number(form.per_user_limit),
    };

    // await addCoupon(payload);
  };

  const handleReset = () => {
    setForm(initialFormData);
    setErrors({});
    clearStatus();
  };

  return (
    <>
      <AdminHeaderWrapper {...wrapperData} />

      <div className="max-w-7xl mx-auto space-y-4">
        {/* Status Alerts */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-xl flex items-center gap-3 text-red-700 shadow-sm">
            <AlertCircle size={20} />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        {successMessage && (
          <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-xl text-green-700 shadow-sm">
            <p className="text-sm font-medium">
              {successMessage} Redirecting...
            </p>
          </div>
        )}

        <div className="bg-white shadow-sm border border-gray-100 p-8 rounded-2xl">
          <form onSubmit={handleSubmit} className="space-y-8">
            <section className="space-y-6">
              <h2 className="text-lg font-bold text-gray-800 border-b pb-2">
                General Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Coupon Code *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. SAVE50"
                    value={form.code}
                    onChange={(e) =>
                      updateField("code", e.target.value.toUpperCase())
                    }
                    className={`w-full p-3 rounded-xl border-2 transition-all outline-none focus:ring-2 focus:ring-primary/20 ${
                      errors.code
                        ? "border-red-400 bg-red-50"
                        : "border-gray-100 bg-gray-50 focus:border-primary"
                    }`}
                  />
                  {errors.code && (
                    <p className="text-red-500 text-xs mt-1 font-medium">
                      {errors.code}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Visibility Status
                  </label>
                  <select
                    value={form.is_active}
                    onChange={(e) =>
                      updateField("is_active", e.target.value === "true")
                    }
                    className="w-full p-3 rounded-xl border-2 border-gray-100 bg-gray-50 focus:border-primary outline-none"
                  >
                    <option value="true">Active & Usable</option>
                    <option value="false">Inactive / Draft</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Marketing Description
                  </label>
                  <textarea
                    placeholder="Describe the promotion (e.g., Get 50% off on your first order)"
                    rows="2"
                    value={form.description}
                    onChange={(e) => updateField("description", e.target.value)}
                    className="w-full p-3 rounded-xl border-2 border-gray-100 bg-gray-50 focus:border-primary outline-none"
                  />
                </div>
              </div>
            </section>

            <section className="space-y-6">
              <h2 className="text-lg font-bold text-gray-800 border-b pb-2">
                Discount Settings
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Type
                  </label>
                  <select
                    value={form.discount_type}
                    onChange={(e) =>
                      updateField("discount_type", e.target.value)
                    }
                    className="w-full p-3 rounded-xl border-2 border-gray-100 bg-gray-50 focus:border-primary outline-none"
                  >
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FLAT">Flat Amount (₹)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Value *
                  </label>
                  <input
                    type="number"
                    value={form.discount_value}
                    onChange={(e) =>
                      updateField("discount_value", e.target.value)
                    }
                    className={`w-full p-3 rounded-xl border-2 transition-all outline-none ${
                      errors.discount_value
                        ? "border-red-400 bg-red-50"
                        : "border-gray-100 bg-gray-50 focus:border-primary"
                    }`}
                  />
                  {errors.discount_value && (
                    <p className="text-red-500 text-xs mt-1 font-medium">
                      {errors.discount_value}
                    </p>
                  )}
                </div>

                {form.discount_type === "PERCENTAGE" && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Capping (Max ₹)
                    </label>
                    <input
                      type="number"
                      placeholder="Optional"
                      value={form.max_discount}
                      onChange={(e) =>
                        updateField("max_discount", e.target.value)
                      }
                      className="w-full p-3 rounded-xl border-2 border-gray-100 bg-gray-50 focus:border-primary outline-none"
                    />
                  </div>
                )}
              </div>
            </section>

            <section className="space-y-6">
              <h2 className="text-lg font-bold text-gray-800 border-b pb-2">
                Restrictions & Validity
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Usage Limit
                    </label>
                    <input
                      type="number"
                      placeholder="999"
                      value={form.usage_limit}
                      onChange={(e) =>
                        updateField("usage_limit", e.target.value)
                      }
                      className="w-full p-3 rounded-xl border-2 border-gray-100 bg-gray-50 focus:border-primary outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Min Cart ₹
                    </label>
                    <input
                      type="number"
                      value={form.min_order_value}
                      onChange={(e) =>
                        updateField("min_order_value", e.target.value)
                      }
                      className="w-full p-3 rounded-xl border-2 border-gray-100 bg-gray-50 focus:border-primary outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Start Date *
                    </label>
                    <input
                      type="datetime-local"
                      value={form.start_date}
                      onChange={(e) =>
                        updateField("start_date", e.target.value)
                      }
                      className={`w-full p-3 rounded-xl border-2 outline-none ${
                        errors.start_date
                          ? "border-red-400 bg-red-50"
                          : "border-gray-100 bg-gray-50 focus:border-primary"
                      }`}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      End Date *
                    </label>
                    <input
                      type="datetime-local"
                      value={form.end_date}
                      onChange={(e) => updateField("end_date", e.target.value)}
                      className={`w-full p-3 rounded-xl border-2 outline-none ${
                        errors.end_date
                          ? "border-red-400 bg-red-50"
                          : "border-gray-100 bg-gray-50 focus:border-primary"
                      }`}
                    />
                  </div>
                </div>
              </div>
            </section>

            <div className="flex flex-col md:flex-row gap-4 pt-6 border-t border-gray-100">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-primary hover:bg-primary-dark text-white font-bold px-6 py-4 rounded-xl transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <Save size={20} />
                )}
                Publish Coupon
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="px-6 py-4 rounded-xl font-bold bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all flex items-center justify-center gap-2"
              >
                <RotateCcw size={20} />
                Reset Form
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

// import { useState } from "react";
// import AdminHeaderWrapper from "../../../components/admin/AdminHeaderWrapper";

// const wrapperData = {
//   title: "New Coupon",
//   description: "Create a new promo code for discounts.",
//   breadcrumb: [
//     { label: "Dashboard", to: "/admin" },
//     { label: "Coupons", to: "/admin/coupons" },
//     { label: "New Coupon", to: "/admin/coupons/new" },
//   ],
// };

// export default function AddNewCoupon() {
//   const initialFormData = {
//     code: "",
//     description: "",
//     discount_type: "PERCENTAGE",
//     discount_value: "",
//     min_order_value: "",
//     max_discount: "",
//     usage_limit: "",
//     per_user_limit: 1,
//     start_date: "",
//     end_date: "",
//     is_active: true,
//   };

//   const [form, setForm] = useState(initialFormData);
//   const [errors, setErrors] = useState({});

//   /* ---------------- Helpers ---------------- */
//   const updateField = (field, value) => {
//     setForm({ ...form, [field]: value });
//   };

//   /* ---------------- Validation ---------------- */
//   const validate = () => {
//     const e = {};

//     if (!form.code.trim()) e.code = "Coupon code is required";
//     if (!form.discount_value || form.discount_value <= 0)
//       e.discount_value = "Discount value must be greater than 0";

//     if (!form.start_date) e.start_date = "Start date required";
//     if (!form.end_date) e.end_date = "End date required";

//     if (
//       form.start_date &&
//       form.end_date &&
//       new Date(form.start_date) >= new Date(form.end_date)
//     ) {
//       e.end_date = "End date must be after start date";
//     }

//     if (form.discount_type === "PERCENTAGE" && form.discount_value > 100) {
//       e.discount_value = "Percentage cannot exceed 100";
//     }

//     setErrors(e);
//     return Object.keys(e).length === 0;
//   };

//   /* ---------------- Submit ---------------- */
//   const handleSubmit = (e) => {
//     e.preventDefault();
//     if (!validate()) return;

//     console.log("Final Coupon Payload:", {
//       ...form,
//       discount_value: Number(form.discount_value),
//       min_order_value: form.min_order_value
//         ? Number(form.min_order_value)
//         : null,
//       max_discount: form.max_discount ? Number(form.max_discount) : null,
//       usage_limit: form.usage_limit ? Number(form.usage_limit) : null,
//       per_user_limit: Number(form.per_user_limit),
//     });
//   };

//   const handleReset = () => {
//     setForm(initialFormData);
//     setErrors({});
//   };

//   return (
//     <>
//       <AdminHeaderWrapper {...wrapperData} />

//       <div className="w-full mx-auto bg-white shadow p-6 rounded-2xl">
//         <form onSubmit={handleSubmit} className="space-y-10">
//           <h2 className="text-xl font-semibold">Add New Coupon</h2>

//           {/* ---------------- Coupon Info ---------------- */}
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             <div>
//               <label className="block font-medium mb-1">Coupon Code *</label>
//               <input
//                 type="text"
//                 value={form.code}
//                 onChange={(e) =>
//                   updateField("code", e.target.value.toUpperCase())
//                 }
//                 className={`w-full p-3 rounded-xl border-2 ${
//                   errors.code ? "border-red-500" : "border-gray-300"
//                 }`}
//               />
//               {errors.code && (
//                 <p className="text-red-500 text-sm">{errors.code}</p>
//               )}
//             </div>

//             <div>
//               <label className="block font-medium mb-1">Status *</label>
//               <select
//                 value={form.is_active}
//                 onChange={(e) =>
//                   updateField("is_active", e.target.value === "true")
//                 }
//                 className="w-full p-3 rounded-xl border-2 border-gray-300"
//               >
//                 <option value="true">Active</option>
//                 <option value="false">Inactive</option>
//               </select>
//             </div>

//             <div className="md:col-span-2">
//               <label className="block font-medium mb-1">Description</label>
//               <textarea
//                 rows="3"
//                 value={form.description}
//                 onChange={(e) => updateField("description", e.target.value)}
//                 className="w-full p-3 rounded-xl border-2 border-gray-300"
//               />
//             </div>
//           </div>

//           {/* ---------------- Discount ---------------- */}
//           <div className="bg-gray-50 p-5 rounded-2xl space-y-4">
//             <h3 className="font-semibold">Discount Settings</h3>

//             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//               <div>
//                 <label className="block font-medium mb-1">
//                   Discount Type *
//                 </label>
//                 <select
//                   value={form.discount_type}
//                   onChange={(e) => updateField("discount_type", e.target.value)}
//                   className="w-full p-3 rounded-xl border-2 border-gray-300"
//                 >
//                   <option value="PERCENTAGE">Percentage (%)</option>
//                   <option value="FLAT">Flat Amount</option>
//                 </select>
//               </div>

//               <div>
//                 <label className="block font-medium mb-1">
//                   Discount Value *
//                 </label>
//                 <input
//                   type="number"
//                   value={form.discount_value}
//                   onChange={(e) =>
//                     updateField("discount_value", e.target.value)
//                   }
//                   className={`w-full p-3 rounded-xl border-2 ${
//                     errors.discount_value ? "border-red-500" : "border-gray-300"
//                   }`}
//                 />
//                 {errors.discount_value && (
//                   <p className="text-red-500 text-sm">
//                     {errors.discount_value}
//                   </p>
//                 )}
//               </div>

//               {form.discount_type === "PERCENTAGE" && (
//                 <div>
//                   <label className="block font-medium mb-1">Max Discount</label>
//                   <input
//                     type="number"
//                     value={form.max_discount}
//                     onChange={(e) =>
//                       updateField("max_discount", e.target.value)
//                     }
//                     className="w-full p-3 rounded-xl border-2 border-gray-300"
//                   />
//                 </div>
//               )}
//             </div>
//           </div>

//           {/* ---------------- Conditions ---------------- */}
//           <div className="bg-gray-50 p-5 rounded-2xl space-y-4">
//             <h3 className="font-semibold">Usage Conditions</h3>

//             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//               <div>
//                 <label className="block font-medium mb-1">
//                   Min Order Value
//                 </label>
//                 <input
//                   type="number"
//                   value={form.min_order_value}
//                   onChange={(e) =>
//                     updateField("min_order_value", e.target.value)
//                   }
//                   className="w-full p-3 rounded-xl border-2 border-gray-300"
//                 />
//               </div>

//               <div>
//                 <label className="block font-medium mb-1">Usage Limit</label>
//                 <input
//                   type="number"
//                   value={form.usage_limit}
//                   onChange={(e) => updateField("usage_limit", e.target.value)}
//                   className="w-full p-3 rounded-xl border-2 border-gray-300"
//                 />
//               </div>

//               <div>
//                 <label className="block font-medium mb-1">Per User Limit</label>
//                 <input
//                   type="number"
//                   value={form.per_user_limit}
//                   onChange={(e) =>
//                     updateField("per_user_limit", e.target.value)
//                   }
//                   className="w-full p-3 rounded-xl border-2 border-gray-300"
//                 />
//               </div>
//             </div>
//           </div>

//           {/* ---------------- Validity ---------------- */}
//           <div className="bg-gray-50 p-5 rounded-2xl space-y-4">
//             <h3 className="font-semibold">Validity Period</h3>

//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <div>
//                 <label className="block font-medium mb-1">Start Date *</label>
//                 <input
//                   type="datetime-local"
//                   value={form.start_date}
//                   onChange={(e) => updateField("start_date", e.target.value)}
//                   className={`w-full p-3 rounded-xl border-2 ${
//                     errors.start_date ? "border-red-500" : "border-gray-300"
//                   }`}
//                 />
//                 {errors.start_date && (
//                   <p className="text-red-500 text-sm">{errors.start_date}</p>
//                 )}
//               </div>

//               <div>
//                 <label className="block font-medium mb-1">End Date *</label>
//                 <input
//                   type="datetime-local"
//                   value={form.end_date}
//                   onChange={(e) => updateField("end_date", e.target.value)}
//                   className={`w-full p-3 rounded-xl border-2 ${
//                     errors.end_date ? "border-red-500" : "border-gray-300"
//                   }`}
//                 />
//                 {errors.end_date && (
//                   <p className="text-red-500 text-sm">{errors.end_date}</p>
//                 )}
//               </div>
//             </div>
//           </div>

//           {/* ---------------- Actions ---------------- */}
//           <div>
//             <button
//               type="submit"
//               className="bg-primary text-white px-6 py-3 rounded-xl"
//             >
//               Save Coupon
//             </button>
//             <button
//               type="reset"
//               onClick={handleReset}
//               className="ml-2 bg-gray-200 px-6 py-3 rounded-xl"
//             >
//               Reset
//             </button>
//           </div>
//         </form>
//       </div>
//     </>
//   );
// }

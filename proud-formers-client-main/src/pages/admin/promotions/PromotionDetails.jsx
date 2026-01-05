import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Pencil,
  Save,
  X,
  Trash2,
  Loader2,
  Calendar,
  Tag,
  Package,
  Info,
} from "lucide-react";
import AdminHeaderWrapper from "../../../components/admin/AdminHeaderWrapper";
import DualListBox from "./DualListBox";
import { useAdminPromotionStore } from "../../../store/admin/AdminPromotionStore";

// Utils
import allProducts from "../../../utils/admin/allProducts";
import allCategories from "../../../utils/admin/allcategories";

export default function PromotionDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Zustand Store
  const {
    selectedPromotion,
    fetchPromotionById,
    updatePromotion,
    deletePromotion,
    loading,
    error,
  } = useAdminPromotionStore();

  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState(null);
  const [errors, setErrors] = useState({});

  // 1. Fetch Data on Mount
  useEffect(() => {
    fetchPromotionById(id);
  }, [id, fetchPromotionById]);

  // 2. Map API data to Form State when selectedPromotion updates
  useEffect(() => {
    if (selectedPromotion) {
      setForm({
        title: selectedPromotion.title || "",
        description: selectedPromotion.description || "",
        promotion_type: selectedPromotion.promotion_type || "",
        discount_type: selectedPromotion.discount_type || "",
        discount_value: selectedPromotion.discount_value || 0,
        min_order_value: selectedPromotion.min_order_value || 0,
        start_date: selectedPromotion.config?.start_date
          ? selectedPromotion.config.start_date.split("T")[0]
          : "",
        end_date: selectedPromotion.config?.end_date
          ? selectedPromotion.config.end_date.split("T")[0]
          : "",
        is_active: selectedPromotion.config?.is_active ?? true,
        target_type: selectedPromotion.targets?.type || "PRODUCT",
        target_data: selectedPromotion.targets?.data || [],
      });
    }
  }, [selectedPromotion]);

  if (loading && !form)
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={48} />
      </div>
    );

  if (error)
    return (
      <div className="p-10 text-center text-red-500 font-bold">{error}</div>
    );
  if (!form) return null;

  const handleFieldChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors({ ...errors, [field]: null });
  };

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = "Title is required";
    if (!form.discount_value) e.discount_value = "Discount value is required";
    if (!form.start_date || !form.end_date)
      e.dates = "Validity dates are required";
    if (form.target_data.length === 0)
      e.target_data = "Please select at least one item";

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    // Map form state back to Nested API Format
    const payload = {
      title: form.title,
      description: form.description,
      promotion_type: form.promotion_type,
      discount_type: form.discount_type,
      discount_value: Number(form.discount_value),
      min_order_value: Number(form.min_order_value),
      config: {
        start_date: new Date(form.start_date).toISOString(),
        end_date: new Date(form.end_date).toISOString(),
        is_active: form.is_active,
      },
      targets: {
        type: form.target_type,
        data: form.target_data,
      },
    };

    const success = await updatePromotion(id, payload);
    if (success) setEditMode(false);
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this promotion?"))
      return;
    const success = await deletePromotion(id);
    if (success) navigate("/admin/promotions");
  };

  return (
    <div className="pb-20">
      {/* <AdminHeaderWrapper
        title={`Edit: ${selectedPromotion?.title}`}
        description="Modify promotion configuration and target audience."
        breadcrumb={[
          { label: "Dashboard", to: "/admin" },
          { label: "Promotions", to: "/admin/promotions" },
          { label: `ID: ${id}` },
        ]}
      /> */}

      {/* Action Toolbar */}
      {/* <div className="flex justify-between items-center mt-6 mb-6">
        <div className="flex gap-3">
          {!editMode ? (
            <button
              onClick={() => setEditMode(true)}
              className="bg-primary text-white px-6 py-2.5 rounded-2xl flex items-center gap-2 hover:bg-primary-dark transition-all font-bold shadow-lg shadow-primary/20"
            >
              <Pencil size={18} /> Edit Promotion
            </button>
          ) : (
            <>
              <button
                onClick={handleSave}
                className="bg-green-600 text-white px-6 py-2.5 rounded-2xl flex items-center gap-2 hover:bg-green-700 transition-all font-bold"
              >
                <Save size={18} /> Save Changes
              </button>
              <button
                onClick={() => {
                  setEditMode(false);
                  fetchPromotionById(id);
                }}
                className="bg-gray-100 text-gray-500 px-6 py-2.5 rounded-2xl flex items-center gap-2 hover:bg-gray-200 transition-all font-bold"
              >
                <X size={18} /> Cancel
              </button>
            </>
          )}
        </div>

        <button
          onClick={handleDelete}
          className="bg-red-50 text-red-600 px-6 py-2.5 rounded-2xl flex items-center gap-2 hover:bg-red-100 transition-all font-bold border border-red-100"
        >
          <Trash2 size={18} /> Delete
        </button>
      </div> */}

      <div className="md:flex justify-between items-center">
        <AdminHeaderWrapper
          title={`Edit: ${selectedPromotion?.title}`}
          description="Modify promotion configuration and target audience."
          breadcrumb={[
            { label: "Dashboard", to: "/admin" },
            { label: "Promotions", to: "/admin/promotions" },
            { label: `ID: ${id}` },
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Form Fields */}
        <div className="lg:col-span-2 space-y-6">
          <section className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            <h3 className="flex items-center gap-2 text-sm font-bold text-gray-400 uppercase tracking-widest mb-6">
              <Info size={16} /> Basic Details
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-500 mb-1 block">
                  Promotion Title *
                </label>
                <input
                  type="text"
                  disabled={!editMode}
                  value={form.title}
                  onChange={(e) => handleFieldChange("title", e.target.value)}
                  className={`w-full p-3 rounded-xl border-2 outline-none transition-all ${
                    editMode
                      ? "border-gray-100 bg-gray-50 focus:border-primary focus:bg-white"
                      : "border-transparent bg-transparent font-semibold text-lg"
                  }`}
                />
                {errors.title && (
                  <p className="text-red-500 text-xs mt-1">{errors.title}</p>
                )}
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 mb-1 block">
                  Description
                </label>
                <textarea
                  disabled={!editMode}
                  rows={3}
                  value={form.description}
                  onChange={(e) =>
                    handleFieldChange("description", e.target.value)
                  }
                  className={`w-full p-3 rounded-xl border-2 outline-none transition-all ${
                    editMode
                      ? "border-gray-100 bg-gray-50 focus:border-primary focus:bg-white"
                      : "border-transparent bg-transparent"
                  }`}
                />
              </div>
            </div>
          </section>

          <section className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            <h3 className="flex items-center gap-2 text-sm font-bold text-gray-400 uppercase tracking-widest mb-6">
              <Package size={16} /> Target Selection
            </h3>

            <DualListBox
              availableItems={
                form.target_type === "PRODUCT" ? allProducts : allCategories
              }
              selectedItems={(form.target_type === "PRODUCT"
                ? allProducts
                : allCategories
              ).filter((item) => form.target_data.includes(item.id))}
              setSelectedItems={(items) =>
                handleFieldChange(
                  "target_data",
                  items.map((i) => i.id)
                )
              }
              idKey="id"
              nameKey="name"
              height="400px"
              disabled={!editMode}
            />
            {errors.target_data && (
              <p className="text-red-500 text-xs mt-2 text-center font-bold">
                {errors.target_data}
              </p>
            )}
          </section>
        </div>

        {/* Right Column: Config & Status */}
        <div className="space-y-6">
          <section className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            <h3 className="flex items-center gap-2 text-sm font-bold text-gray-400 uppercase tracking-widest mb-6">
              <Tag size={16} /> Economics
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-500 mb-1 block">
                    Type
                  </label>
                  <select
                    disabled={!editMode}
                    value={form.discount_type}
                    onChange={(e) =>
                      handleFieldChange("discount_type", e.target.value)
                    }
                    className="w-full p-3 border-gray-100 border-2 rounded-xl bg-gray-50 text-sm font-bold"
                  >
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FLAT">Flat (₹)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 mb-1 block">
                    Value
                  </label>
                  <input
                    type="number"
                    disabled={!editMode}
                    value={form.discount_value}
                    onChange={(e) =>
                      handleFieldChange("discount_value", e.target.value)
                    }
                    className="w-full p-3 rounded-xl bg-gray-50 border-gray-100 border-2 text-sm font-bold"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 mb-1 block">
                  Min. Order Value
                </label>
                <input
                  type="number"
                  disabled={!editMode}
                  value={form.min_order_value}
                  onChange={(e) =>
                    handleFieldChange("min_order_value", e.target.value)
                  }
                  className="w-full p-3 rounded-xl bg-gray-50 border-gray-100 border-2 text-sm font-bold"
                />
              </div>
            </div>
          </section>

          <section className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            <h3 className="flex items-center gap-2 text-sm font-bold text-gray-400 uppercase tracking-widest mb-6">
              <Calendar size={16} /> Scheduling
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-500 mb-1 block">
                  Start Date
                </label>
                <input
                  type="date"
                  disabled={!editMode}
                  value={form.start_date}
                  onChange={(e) =>
                    handleFieldChange("start_date", e.target.value)
                  }
                  className="w-full p-3 rounded-xl bg-gray-50 border-gray-100 border-2 text-sm font-bold"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 mb-1 block">
                  End Date
                </label>
                <input
                  type="date"
                  disabled={!editMode}
                  value={form.end_date}
                  onChange={(e) =>
                    handleFieldChange("end_date", e.target.value)
                  }
                  className="w-full p-3 rounded-xl bg-gray-50 border-gray-100 border-2 text-sm font-bold"
                />
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    disabled={!editMode}
                    checked={form.is_active}
                    onChange={(e) =>
                      handleFieldChange("is_active", e.target.checked)
                    }
                    className="w-5 h-5 accent-primary"
                  />
                  <span className="text-sm font-bold text-gray-700">
                    Promotion is Active
                  </span>
                </label>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

// import { useState, useEffect, useMemo } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import { Pencil, Save, X, Trash2 } from "lucide-react";
// import AdminHeaderWrapper from "../../../components/admin/AdminHeaderWrapper";
// import DualListBox from "./DualListBox";
// import Pagination from "../../../components/admin/Pagination";

// // ------------------ Dummy Data ------------------
// import allProducts from "../../../utils/admin/allProducts";
// import allCategories from "../../../utils/admin/allcategories";
// import promotionsData from "../../../utils/admin/promotionsData";

// export default function PromotionDetails() {
//   const { id } = useParams();
//   const navigate = useNavigate();

//   const promotion = promotionsData.find((p) => p.id === Number(id));

//   if (!promotion)
//     return <div className="p-4 text-red-600">Promotion not found</div>;

//   const [editMode, setEditMode] = useState(false);
//   const [form, setForm] = useState({
//     ...promotion,
//     product_ids: [],
//     category_ids: [],
//   });
//   const [errors, setErrors] = useState({});
//   const [productSearch, setProductSearch] = useState("");
//   const [categorySearch, setCategorySearch] = useState("");

//   const availableProducts = useMemo(() => {
//     return allProducts.filter(
//       (p) =>
//         (!form.product_ids.includes(p.id) &&
//           p.name.toLowerCase().includes(productSearch.toLowerCase())) ||
//         p.id.toString().includes(productSearch)
//     );
//   }, [form.product_ids, productSearch]);

//   const availableCategories = useMemo(() => {
//     return allCategories.filter(
//       (c) =>
//         (!form.category_ids.includes(c.id) &&
//           c.name.toLowerCase().includes(categorySearch.toLowerCase())) ||
//         c.id.toString().includes(categorySearch)
//     );
//   }, [form.category_ids, categorySearch]);

//   const selectProduct = (product) => {
//     setForm((prev) => ({
//       ...prev,
//       product_ids: [...prev.product_ids, product.id],
//     }));
//   };

//   const removeProduct = (productId) => {
//     setForm((prev) => ({
//       ...prev,
//       product_ids: prev.product_ids.filter((id) => id !== productId),
//     }));
//   };

//   const selectCategory = (category) => {
//     setForm((prev) => ({
//       ...prev,
//       category_ids: [...prev.category_ids, category.id],
//     }));
//   };

//   const removeCategory = (categoryId) => {
//     setForm((prev) => ({
//       ...prev,
//       category_ids: prev.category_ids.filter((id) => id !== categoryId),
//     }));
//   };

//   const handleFieldChange = (field, value) =>
//     setForm((prev) => ({ ...prev, [field]: value }));

//   const validate = () => {
//     const e = {};
//     if (!form.name.trim()) e.name = "Promotion name required";
//     if (!form.discount_value) e.discount_value = "Discount required";
//     if (!form.start_date || !form.end_date)
//       e.date = "Start and End dates required";
//     setErrors(e);
//     return Object.keys(e).length === 0;
//   };

//   const handleSave = () => {
//     if (!validate()) return;
//     console.log("Updated Promotion:", form);
//     setEditMode(false);
//   };

//   const handleReset = () => {
//     setForm({ ...promotion, product_ids: [], category_ids: [] });
//     setErrors({});
//   };

//   const handleDelete = () => {
//     if (!confirm("Delete this promotion?")) return;
//     console.log("Deleted Promotion", id);
//     navigate("/admin/promotions");
//   };

//   return (
//     <div className="p-4 md:p-6 space-y-6">
//       <AdminHeaderWrapper
//         title={`Promotion #${promotion.id}`}
//         description="View / Edit promotion details"
//         breadcrumb={[
//           { label: "Promotions", to: "/admin/promotions" },
//           { label: promotion.id },
//         ]}
//       />

//       {/* Header Actions */}
//       <div className="flex justify-between items-center">
//         {!editMode ? (
//           <button
//             onClick={() => setEditMode(true)}
//             className="border border-primary text-primary px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-primary-light hover:text-white"
//           >
//             <Pencil size={18} /> Edit
//           </button>
//         ) : (
//           <button
//             onClick={handleSave}
//             className="bg-primary text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-primary-dark"
//           >
//             <Save size={18} /> Save
//           </button>
//         )}
//         <button
//           onClick={handleDelete}
//           className="border border-red-500 text-red-600 px-4 py-2 rounded-lg flex items-center gap-2"
//         >
//           <Trash2 size={18} /> Delete
//         </button>
//       </div>

//       <form
//         className="bg-white p-6 rounded-2xl shadow space-y-6"
//         onSubmit={(e) => {
//           e.preventDefault();
//           handleSave();
//         }}
//       >
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//           <div>
//             <label className="font-medium">Promotion Name *</label>
//             <input
//               type="text"
//               disabled={!editMode}
//               value={form.name}
//               onChange={(e) => handleFieldChange("name", e.target.value)}
//               className={`w-full p-3 rounded-xl border-2 ${
//                 errors.name ? "border-red-500" : "border-gray-300"
//               }`}
//             />
//             {errors.name && (
//               <p className="text-red-500 text-sm">{errors.name}</p>
//             )}
//           </div>
//           <div>
//             <label className="font-medium">Discount Value *</label>
//             <input
//               type="number"
//               disabled={!editMode}
//               value={form.discount_value}
//               onChange={(e) =>
//                 handleFieldChange("discount_value", e.target.value)
//               }
//               className={`w-full p-3 rounded-xl border-2 ${
//                 errors.discount_value ? "border-red-500" : "border-gray-300"
//               }`}
//             />
//             {errors.discount_value && (
//               <p className="text-red-500 text-sm">{errors.discount_value}</p>
//             )}
//           </div>
//         </div>
//         <div>
//           <label className="font-medium">Minimum Order Value</label>
//           <input
//             type="number"
//             name="minimum_order_value"
//             value={form.minimum_order_value}
//             onChange={(e) =>
//               handleFieldChange("minimum_order_value", e.target.value)
//             }
//             className="w-full p-3 rounded-xl border-2 border-gray-300"
//           />
//         </div>
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//           <div>
//             <label className="font-medium">Start Date *</label>
//             <input
//               type="date"
//               disabled={!editMode}
//               value={form.start_date}
//               onChange={(e) => handleFieldChange("start_date", e.target.value)}
//               className={`w-full p-3 rounded-xl border-2 ${
//                 errors.date ? "border-red-500" : "border-gray-300"
//               }`}
//             />
//           </div>
//           <div>
//             <label className="font-medium">End Date *</label>
//             <input
//               type="date"
//               disabled={!editMode}
//               value={form.end_date}
//               onChange={(e) => handleFieldChange("end_date", e.target.value)}
//               className={`w-full p-3 rounded-xl border-2 ${
//                 errors.date ? "border-red-500" : "border-gray-300"
//               }`}
//             />
//             {errors.date && (
//               <p className="text-red-500 text-sm">{errors.date}</p>
//             )}
//           </div>
//         </div>
//         {(form.promotion_type === "PRODUCT" ||
//           form.promotion_type === "CATEGORY") && (
//           <div className="space-y-6">
//             <h3 className="font-semibold mb-2">
//               Select{" "}
//               {form.promotion_type === "PRODUCT" ? "Products" : "Categories"}
//             </h3>
//             <DualListBox
//               availableItems={
//                 form.promotion_type === "PRODUCT" ? allProducts : allCategories
//               }
//               selectedItems={
//                 form.promotion_type === "PRODUCT"
//                   ? allProducts.filter((p) => form.product_ids.includes(p.id))
//                   : allCategories.filter((c) =>
//                       form.category_ids.includes(c.id)
//                     )
//               }
//               setSelectedItems={(items) => {
//                 if (form.promotion_type === "PRODUCT") {
//                   setForm((prev) => ({
//                     ...prev,
//                     product_ids: items.map((i) => i.id),
//                   }));
//                 } else {
//                   setForm((prev) => ({
//                     ...prev,
//                     category_ids: items.map((i) => i.id),
//                   }));
//                 }
//               }}
//               idKey="id"
//               nameKey="name"
//               imageKey="images"
//               //   skuKey="variants?.[0]?.sku"
//               height="400px"
//               disabled={!editMode}
//             />
//           </div>
//         )}

//         <div className="flex gap-4 mt-4">
//           <button
//             type="submit"
//             disabled={!editMode}
//             className="bg-primary text-white px-6 py-3 rounded-xl hover:bg-primary-dark"
//           >
//             Save
//           </button>
//           <button
//             type="button"
//             onClick={handleReset}
//             disabled={!editMode}
//             className="bg-gray-200 px-6 py-3 rounded-xl hover:bg-gray-300"
//           >
//             Reset
//           </button>
//         </div>
//       </form>
//     </div>
//   );
// }

// src/pages/admin/products/AddProductForm.jsx
import { useState, useEffect } from "react";
import {
  Upload,
  X,
  Plus,
  Trash2,
  Package,
  Layers,
  ImageIcon,
  Tag,
  Hash,
  AlertCircle,
  CheckCircle2,
  Info,
} from "lucide-react";
import StatusModal from "../../../components/admin/StatusModal";
import AdminHeaderWrapper from "../../../components/admin/AdminHeaderWrapper";
import { useAdminProductStore } from "../../../store/admin/AdminProductStore";

const wrapperData = {
  title: "New Product Listing",
  description:
    "Initialize a new inventory item with variants and media assets.",
  breadcrumb: [
    { label: "Dashboard", to: "/admin" },
    { label: "Products", to: "/admin/products" },
    { label: "New Product", to: "/admin/products/new" },
  ],
};

// Internal Helper for consistent error display
const ErrorLabel = ({ message }) => {
  if (!message) return null;
  return (
    <div className="flex items-center gap-1 mt-1.5 ml-1 animate-in fade-in slide-in-from-top-1">
      <AlertCircle size={10} className="text-red-500" strokeWidth={3} />
      <span className="text-[9px] font-black text-red-500 uppercase tracking-tighter">
        {message}
      </span>
    </div>
  );
};

export default function AddProductForm() {
  const initialFormData = {
    name: "",
    category_id: "",
    description: "",
    is_active: true,
    stock_quantity: "",
    stock_unit: "kg",
    variants: [
      { variant_name: "", regular_price: "", stock_quantity: "", unit: "" },
    ],
    images: [],
  };

  const [form, setForm] = useState(initialFormData);
  const [errors, setErrors] = useState({});

  const {
    fetchCategories,
    categoriesData,
    addProduct,
    loading,
    error,
    successMessage,
    clearStatus,
  } = useAdminProductStore();

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // --- Handlers ---
  const updateField = (field, value) => {
    setForm({ ...form, [field]: value });
    if (errors[field]) {
      const newErrors = { ...errors };
      delete newErrors[field];
      setErrors(newErrors);
    }
  };

  const updateVariant = (index, field, value) => {
    const updated = [...form.variants];
    let newValue = value;
    if (["regular_price", "stock_quantity"].includes(field)) {
      newValue = value === "" ? "" : Number(value);
    }
    updated[index][field] = newValue;
    setForm({ ...form, variants: updated });

    // Clear variant error if it exists
    if (errors.variantErrors?.[index]?.[field]) {
      const newVarErrors = [...errors.variantErrors];
      delete newVarErrors[index][field];
      setErrors({ ...errors, variantErrors: newVarErrors });
    }
  };

  const addVariant = () => {
    setForm({
      ...form,
      variants: [
        ...form.variants,
        { variant_name: "", regular_price: "", stock_quantity: "", unit: "" },
      ],
    });
  };

  const removeVariant = (index) => {
    setForm({ ...form, variants: form.variants.filter((_, i) => i !== index) });
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    const newImages = files.map((file) => ({
      file,
      url: URL.createObjectURL(file),
      isPrimary: false,
    }));
    setForm((prev) => {
      const combined = [...prev.images, ...newImages];
      if (!combined.some((img) => img.isPrimary)) combined[0].isPrimary = true;
      return { ...prev, images: combined };
    });
    if (errors.images) setErrors((prev) => ({ ...prev, images: null }));
  };

  const setPrimaryImage = (index) => {
    setForm((prev) => ({
      ...prev,
      images: prev.images.map((img, i) => ({ ...img, isPrimary: i === index })),
    }));
  };

  const removeImage = (index) => {
    setForm((prev) => {
      const updated = prev.images.filter((_, i) => i !== index);
      if (updated.length > 0 && !updated.some((img) => img.isPrimary))
        updated[0].isPrimary = true;
      return { ...prev, images: updated };
    });
  };

  const validate = () => {
    const e = {};
    const variantErrors = [];
    if (!form.name.trim()) e.name = "Identification required";
    if (!form.category_id) e.category_id = "Classification required";
    if (form.stock_quantity === "" || form.stock_quantity < 0)
      e.stock_quantity = "Valid stock required";
    if (form.images.length === 0) e.images = "Visual assets required";

    form.variants.forEach((v, i) => {
      const vErr = {};
      if (!v.variant_name.trim()) vErr.variant_name = "Name required";
      if (!v.regular_price || v.regular_price < 0)
        vErr.regular_price = "Price required";
      if (v.stock_quantity === "" || v.stock_quantity < 0)
        vErr.stock_quantity = "Stock required";
      if (!v.unit) vErr.unit = "Unit required";
      variantErrors.push(vErr);
    });

    if (variantErrors.some((obj) => Object.keys(obj).length > 0)) {
      e.variantErrors = variantErrors;
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    const selectedCategory = categoriesData.find(
      (c) => c.id === form.category_id
    );
    const payload = {
      id: `P-${Date.now()}`,
      name: form.name,
      description: form.description,
      stock_quantity: Number(form.stock_quantity),
      stock_unit: form.stock_unit,
      is_active: form.is_active,
      category_id: selectedCategory.id,
      product_variants: form.variants.map((v, i) => ({
        id: `PV-${Date.now()}-${i}`,
        variant_name: v.variant_name,
        variant_price: v.regular_price,
        variant_quantity: v.stock_quantity,
        quantity_unit: v.unit,
      })),
      product_images: form.images.map((img, i) => ({
        id: `PI-${Date.now()}-${i}`,
        image_path: img.url,
        is_primary: img.isPrimary,
      })),
      categorie_details: selectedCategory,
    };

    try {
      await addProduct(payload);
      setTimeout(() => {
        clearStatus();
        setForm(initialFormData);
        setErrors({});
      }, 2000);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="pb-12">
      {(successMessage || error) && (
        <StatusModal
          message={successMessage || error}
          type={successMessage ? "success" : "error"}
          onClose={clearStatus}
        />
      )}

      <AdminHeaderWrapper {...wrapperData} />

      <form onSubmit={handleSubmit} className="mt-8 space-y-8">
        {/* --- MAIN INFO & CATEGORY --- */}
        <div
          className={`bg-white p-8 rounded-[2.5rem] shadow-sm border transition-all ${
            errors.name || errors.category_id
              ? "border-red-100 shadow-lg shadow-red-50"
              : "border-gray-100"
          }`}
        >
          <div className="flex items-center gap-4 mb-8">
            <div
              className={`p-3 rounded-2xl ${
                errors.name || errors.category_id
                  ? "bg-red-50 text-red-500"
                  : "bg-primary/10 text-primary"
              }`}
            >
              <Package size={24} />
            </div>
            <div>
              <h3 className="text-lg font-black text-gray-800">
                Primary Product Data
              </h3>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em]">
                Essentials
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                Product Designation *
              </label>
              <div className="relative group">
                <Tag
                  className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${
                    errors.name
                      ? "text-red-400"
                      : "text-gray-300 group-focus-within:text-primary"
                  }`}
                  size={18}
                />
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  placeholder="e.g. Organic Cavendish Bananas"
                  className={`w-full pl-12 border-2 border-gray-200 pr-4 py-4 rounded-2xl text-sm font-bold focus:ring-2 transition-all outline-none ${
                    errors.name
                      ? "bg-red-50/50 ring-2 ring-red-100"
                      : "bg-gray-50 focus:ring-primary/20"
                  }`}
                />
              </div>
              <ErrorLabel message={errors.name} />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                Classification Category *
              </label>
              <div className="relative">
                <Layers
                  className={`absolute left-4 top-1/2 -translate-y-1/2 ${
                    errors.category_id ? "text-red-400" : "text-gray-300"
                  }`}
                  size={18}
                />
                <select
                  value={form.category_id}
                  onChange={(e) => updateField("category_id", e.target.value)}
                  className={`w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-2xl text-sm font-bold focus:ring-2 outline-none appearance-none transition-all ${
                    errors.category_id
                      ? "bg-red-50/50 ring-2 ring-red-100"
                      : "bg-gray-50 focus:ring-primary/20"
                  }`}
                >
                  <option value="">Select a Category</option>
                  {categoriesData.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
              <ErrorLabel message={errors.category_id} />
            </div>

            <div className="md:col-span-2 space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                Narrative / Description
              </label>
              <textarea
                rows="4"
                value={form.description}
                onChange={(e) => updateField("description", e.target.value)}
                placeholder="Detail the benefits, origins, and specs..."
                className="w-full p-5 bg-gray-50 border-2 border-gray-200 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-none resize-none"
              />
            </div>
          </div>
        </div>

        {/* --- INVENTORY & STATUS --- */}
        <div
          className={`bg-white p-8 rounded-[2.5rem] shadow-sm border transition-all ${
            errors.stock_quantity ? "border-red-100" : "border-gray-100"
          }`}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                Base Inventory Quantity
              </label>
              <div className="relative">
                <Hash
                  className={`absolute left-4 top-1/2 -translate-y-1/2 ${
                    errors.stock_quantity ? "text-red-400" : "text-gray-300"
                  }`}
                  size={18}
                />
                <input
                  type="number"
                  value={form.stock_quantity}
                  onChange={(e) =>
                    updateField("stock_quantity", e.target.value)
                  }
                  className={`w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-2xl text-sm font-bold outline-none transition-all ${
                    errors.stock_quantity
                      ? "bg-red-50/50 ring-2 ring-red-100"
                      : "bg-gray-50 focus:ring-primary/20"
                  }`}
                />
              </div>
              <ErrorLabel message={errors.stock_quantity} />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                Measurement Unit
              </label>
              <select
                value={form.stock_unit}
                onChange={(e) => updateField("stock_unit", e.target.value)}
                className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-200 rounded-2xl text-sm font-bold outline-none"
              >
                <option value="">Please Select Stock Unit</option>
                <option value="kg">Kilograms (kg)</option>
                <option value="gm">Grams (gm)</option>
                <option value="lt">Liters (lt)</option>
                <option value="ml">Milli Leter (ml)</option>
                <option value="other">others (any)</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                Visibility Status
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => updateField("is_active", true)}
                  className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                    form.is_active
                      ? "bg-primary text-white shadow-lg shadow-primary/20"
                      : "bg-gray-50 text-gray-400"
                  }`}
                >
                  Active
                </button>
                <button
                  type="button"
                  onClick={() => updateField("is_active", false)}
                  className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                    !form.is_active
                      ? "bg-gray-800 text-white shadow-lg"
                      : "bg-gray-50 text-gray-400"
                  }`}
                >
                  In Active
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* --- VARIANTS ENGINE --- */}
        <div
          className={`bg-gray-50 p-8 rounded-[2.5rem] border transition-all ${
            errors.variantErrors
              ? "border-red-100 bg-red-50/10"
              : "border-gray-200/50"
          }`}
        >
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div
                className={`p-3 rounded-2xl shadow-sm ${
                  errors.variantErrors
                    ? "bg-red-500 text-white"
                    : "bg-white text-primary"
                }`}
              >
                <Layers size={20} />
              </div>
              <div>
                <h3 className="text-lg font-black text-gray-800">
                  Inventory Variants
                </h3>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                  Define sizes, packs, or weights
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={addVariant}
              className="bg-white hover:bg-primary hover:text-white text-primary px-5 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-sm flex items-center gap-2"
            >
              <Plus size={16} /> Add Variant
            </button>
          </div>

          <div className="space-y-4">
            {form.variants.map((variant, index) => {
              const varErr = errors.variantErrors?.[index];
              return (
                <div
                  key={index}
                  className={`bg-white p-6 rounded-3xl shadow-sm border transition-all flex flex-col md:flex-row gap-4 items-end ${
                    varErr ? "border-red-200" : "border-gray-100"
                  }`}
                >
                  <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
                    <div className="space-y-1">
                      <span className="text-[9px] font-black text-gray-400 uppercase ml-1">
                        Label
                      </span>
                      <input
                        type="text"
                        placeholder="e.g. Family Pack"
                        value={variant.variant_name}
                        onChange={(e) =>
                          updateVariant(index, "variant_name", e.target.value)
                        }
                        className={`w-full px-4 border-2 border-gray-200 py-3 rounded-xl text-xs font-bold outline-none transition-all ${
                          varErr?.variant_name
                            ? "bg-red-50 ring-1 ring-red-200"
                            : "bg-gray-50 focus:ring-1 ring-primary/20"
                        }`}
                      />
                    </div>
                    <div className="space-y-1">
                      <span className="text-[9px] font-black text-gray-400 uppercase ml-1">
                        Price ($)
                      </span>
                      <input
                        type="number"
                        value={variant.regular_price}
                        onChange={(e) =>
                          updateVariant(index, "regular_price", e.target.value)
                        }
                        className={`w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-xs font-bold outline-none transition-all ${
                          varErr?.regular_price
                            ? "bg-red-50 ring-1 ring-red-200"
                            : "bg-gray-50 focus:ring-1 ring-primary/20"
                        }`}
                      />
                    </div>
                    <div className="space-y-1">
                      <span className="text-[9px] font-black text-gray-400 uppercase ml-1">
                        Stock
                      </span>
                      <input
                        type="number"
                        value={variant.stock_quantity}
                        onChange={(e) =>
                          updateVariant(index, "stock_quantity", e.target.value)
                        }
                        className={`w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-xs font-bold outline-none transition-all ${
                          varErr?.stock_quantity
                            ? "bg-red-50 ring-1 ring-red-200"
                            : "bg-gray-50 focus:ring-1 ring-primary/20"
                        }`}
                      />
                    </div>
                    <div className="space-y-1">
                      <span className="text-[9px] font-black text-gray-400 uppercase ml-1">
                        Unit
                      </span>
                      <select
                        value={variant.unit}
                        onChange={(e) =>
                          updateVariant(index, "unit", e.target.value)
                        }
                        className={`w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-xs font-bold outline-none transition-all ${
                          varErr?.unit
                            ? "bg-red-50 ring-1 ring-red-200"
                            : "bg-gray-50 focus:ring-1 ring-primary/20"
                        }`}
                      >
                        <option value="">Please Select Unit</option>
                        <option value="kg">kg</option>
                        <option value="gm">gm</option>
                        <option value="lt">lt</option>
                        <option value="ml">ml</option>
                        <option value="other">other</option>
                      </select>
                    </div>
                  </div>
                  {form.variants.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeVariant(index)}
                      className="p-3 text-red-400 hover:bg-red-50 rounded-xl transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* --- MEDIA ASSETS --- */}
        <div
          className={`bg-white p-8 rounded-[2.5rem] shadow-sm border transition-all ${
            errors.images ? "border-red-100 bg-red-50/10" : "border-gray-100"
          }`}
        >
          <div className="flex items-center gap-4 mb-8">
            <div
              className={`p-3 rounded-2xl ${
                errors.images
                  ? "bg-red-500 text-white"
                  : "bg-primary/10 text-primary"
              }`}
            >
              <ImageIcon size={24} />
            </div>
            <div>
              <h3 className="text-lg font-black text-gray-800">
                Visual Portfolio
              </h3>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em]">
                High resolution media
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
            <label
              className={`flex flex-col items-center justify-center aspect-square border-4 border-dashed rounded-[2rem] transition-all cursor-pointer group ${
                errors.images
                  ? "border-red-200 bg-red-50/50"
                  : "border-gray-100 hover:bg-gray-50 hover:border-primary/20"
              }`}
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                  errors.images
                    ? "bg-red-100 text-red-500"
                    : "bg-gray-50 text-gray-400 group-hover:text-primary group-hover:bg-primary/10"
                }`}
              >
                <Plus size={24} />
              </div>
              <span
                className={`text-[10px] font-black uppercase tracking-widest mt-3 ${
                  errors.images ? "text-red-500" : "text-gray-400"
                }`}
              >
                Upload Assets
              </span>
              <input
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />
            </label>

            {form.images.map((img, index) => (
              <div
                key={index}
                className="relative aspect-square rounded-[2rem] overflow-hidden group border border-gray-100 shadow-sm"
              >
                <img
                  src={img.url}
                  alt="preview"
                  className="w-full h-full object-cover transition-transform group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPrimaryImage(index)}
                    className="px-3 py-1.5 bg-white text-[9px] font-black uppercase tracking-widest rounded-lg"
                  >
                    {img.isPrimary ? "Main" : "Set Main"}
                  </button>
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="p-2 bg-red-500 text-white rounded-lg"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                {img.isPrimary && (
                  <div className="absolute top-2 left-2 px-2 py-1 bg-primary text-white text-[8px] font-black uppercase tracking-tighter rounded-md shadow-lg">
                    Primary
                  </div>
                )}
              </div>
            ))}
          </div>
          <ErrorLabel message={errors.images} />
        </div>

        {/* --- SUBMIT ACTIONS --- */}
        <div className="flex items-center gap-4 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-primary hover:bg-primary-dark disabled:bg-primary/50 text-white py-5 rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 transition-all active:scale-[0.98]"
          >
            {loading ? "Syncing with Cloud..." : "Commit Product Listing"}
          </button>
          <button
            type="button"
            onClick={() => {
              setForm(initialFormData);
              setErrors({});
            }}
            className="px-10 py-5 bg-gray-100 text-gray-500 hover:bg-gray-200 rounded-[2rem] font-black text-xs uppercase tracking-widest transition-all"
          >
            Reset Form
          </button>
        </div>
      </form>
    </div>
  );
}

// import { useState, useEffect } from "react";
// import { Upload, X, Plus, Trash2 } from "lucide-react";
// import StatusModal from "../../../components/admin/StatusModal";
// import AdminHeaderWrapper from "../../../components/admin/AdminHeaderWrapper";
// import { useAdminProductStore } from "../../../store/admin/AdminProductStore";
// const wrapperData = {
//   title: "New Product",
//   description: "Add a new product by filling the form below.",
//   breadcrumb: [
//     { label: "Dashboard", to: "/admin" },
//     { label: "Products", to: "/admin/products" },
//     { label: "New Product", to: "/admin/products/new" },
//   ],
// };
// export default function AddProductForm() {
//   const initialFormData = {
//     name: "",
//     category_id: "",
//     description: "",
//     is_active: true,
//     stock_quantity: "",
//     stock_unit: "kg",
//     variants: [
//       {
//         variant_name: "",
//         regular_price: "",
//         stock_quantity: "",
//         unit: "",
//       },
//     ],
//     images: [],
//   };
//   const [form, setForm] = useState(initialFormData);

//   const [errors, setErrors] = useState({});
//   const {
//     fetchCategories,
//     categoriesData,
//     addProduct,
//     loading,
//     error,
//     successMessage,
//     clearStatus,
//   } = useAdminProductStore();

//   useEffect(() => {
//     fetchCategories();
//   }, [fetchCategories]);
//   /* -------------------- Helpers -------------------- */
//   const updateField = (field, value) => {
//     setForm({ ...form, [field]: value });
//   };

//   const updateVariant = (index, field, value) => {
//     const updated = [...form.variants];
//     let newValue = value;
//     if (
//       field === "regular_price" ||
//       field === "stock_quantity" ||
//       field === "discounted_price"
//     ) {
//       if (value.trim() === "") {
//         newValue = null;
//       } else {
//         newValue = +newValue;
//         if (isNaN(newValue)) {
//           newValue = null;
//         }
//       }
//     }
//     updated[index][field] = newValue;
//     setForm({ ...form, variants: updated });
//   };
//   const addVariant = () => {
//     setForm({
//       ...form,
//       variants: [
//         ...form.variants,
//         {
//           variant_name: "",
//           regular_price: "",
//           stock_quantity: "",
//           unit: "",
//         },
//       ],
//     });
//   };

//   const removeVariant = (index) => {
//     setForm({
//       ...form,
//       variants: form.variants.filter((_, i) => i !== index),
//     });
//   };
//   const handleReset = () => {
//     console.log("Reset Button Got clicked");
//     setForm(initialFormData);
//     setErrors({});
//   };

//   const handleImageUpload = (e) => {
//     const files = Array.from(e.target.files);
//     if (!files.length) return;

//     const newImages = files.map((file) => ({
//       file,
//       url: URL.createObjectURL(file),
//       isPrimary: false,
//     }));

//     setForm((prev) => {
//       const combined = [...prev.images, ...newImages];

//       // If no primary exists, set first image as primary
//       if (!combined.some((img) => img.isPrimary)) {
//         combined[0].isPrimary = true;
//       }

//       return {
//         ...prev,
//         images: combined,
//       };
//     });
//   };

//   const setPrimaryImage = (index) => {
//     setForm((prev) => ({
//       ...prev,
//       images: prev.images.map((img, i) => ({
//         ...img,
//         isPrimary: i === index,
//       })),
//     }));
//   };

//   const removeImage = (index) => {
//     setForm((prev) => {
//       const updated = prev.images.filter((_, i) => i !== index);

//       // If primary was removed, assign first image as primary
//       if (updated.length > 0 && !updated.some((img) => img.isPrimary)) {
//         updated[0].isPrimary = true;
//       }

//       return {
//         ...prev,
//         images: updated,
//       };
//     });
//   };

//   // ------------------ Validation ------------------
//   const validate = () => {
//     const e = {};
//     const variantErrors = []; // Array to hold validation errors for each variant

//     // 1. Validate top-level fields
//     if (!form.name.trim()) e.name = "Product name required";
//     if (!form.category_id) e.category_id = "Category required";
//     if (
//       form.stock_quantity === undefined ||
//       form.stock_quantity === null ||
//       form.stock_quantity < 0 ||
//       !form.stock_quantity
//     )
//       e.stock_quantity = "Stock required (must be 0 or greater)";
//     if (form.images.length === 0) e.images = "At least one image required";

//     // 2. Validate Variants Array presence
//     if (!form.variants || form.variants.length === 0) {
//       e.variants = "At least one variant required";
//       // CRITICAL: Exit here if the array itself is missing/empty,
//       // as the map loop below would crash otherwise.
//       setErrors({ ...e });
//       return false;
//     } else {
//       // 3. Validate individual variants and populate variantErrors array
//       console.log("formm :", form);
//       form.variants.forEach((v, i) => {
//         const err = {};

//         if (!v.variant_name || !v.variant_name.trim())
//           err.variant_name = "Variant name required";
//         if (
//           v.regular_price === undefined ||
//           v.regular_price === null ||
//           v.regular_price < 0 ||
//           !v.regular_price
//         )
//           err.regular_price = "Regular price required (must be 0 or greater)";
//         if (
//           v.stock_quantity === undefined ||
//           v.stock_quantity === null ||
//           v.stock_quantity < 0 ||
//           !v.stock_quantity
//         )
//           err.stock_quantity = "Stock required (must be 0 or greater)";
//         if (!v.unit || !v.unit.trim()) err.unit = "Unit required";
//         // if (!v.sku || !v.sku.trim()) err.sku = "SKU required";
//         // if (!v.status) err.status = "Status required";
//         // Always push the error object (even if empty) to maintain index alignment
//         variantErrors.push(err);
//       });

//       // 4. Check if any variant had actual errors
//       const hasVariantErrors = variantErrors.some(
//         (err) => Object.keys(err).length > 0
//       );

//       // 5. If there are variant errors, attach them and a general message
//       if (hasVariantErrors) {
//         e.variants = "Fix errors in variants";
//         e.variantErrors = variantErrors; // Store the array only if needed
//       }
//     }

//     setErrors({ ...e });
//     console.log("errors :", e);
//     return Object.keys(e).length === 0;
//   };
//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!validate()) return;
//     const convertApiImages = form.images.map((img, index) => ({
//       id: `PIM-${Date.now()}-${index}`, // Adding index ensures uniqueness
//       image_path: img.url, // for json-server (file upload ignored)
//       alt_text: img.altText || "",
//       is_primary: img.isPrimary,
//     }));
//     const convertApiVariants = form.variants.map((v, index) => ({
//       id: `PV-${Date.now()}-${index}`, // Adding index ensures uniqueness
//       variant_name: v.variant_name,
//       variant_price: Number(v.regular_price),
//       variant_quantity: Number(v.stock_quantity),
//       quantity_unit: v.unit,
//     }));

//     const selectedCategory = categoriesData.find(
//       (c) => c.id === form.category_id
//     );
//     const convertApiCategorie = {
//       id: selectedCategory.id,
//       name: selectedCategory.name,
//       description: selectedCategory.description,
//     };

//     const payload = {
//       id: "P00" + Date.now(),
//       name: form.name,
//       description: form.description,
//       stock_quantity: Number(form.stock_quantity),
//       stock_unit: form.stock_unit,
//       created_at: "2023-12-01T12:00:00Z",
//       updated_at: "2023-12-01T12:00:00Z",
//       is_active: form.is_active,
//       category_id: selectedCategory.id,
//       product_variants: convertApiVariants,
//       product_images: convertApiImages,
//       categorie_details: convertApiCategorie,
//     };
//     try {
//       await addProduct(payload); // Added await
//       console.log("Payload added ");
//       setTimeout(() => {
//         clearStatus();
//         handleReset();
//       }, 2000);
//       // Optional: Reset form only on success
//       // handleReset();
//     } catch (err) {
//       console.error("Submission failed", err);
//     }
//   };

//   console.log("Success Message :", successMessage);
//   return (
//     <>
//       {/* Optimized Status Modal */}
//       {(successMessage || error) && (
//         <StatusModal
//           key={successMessage ? `success-${Date.now()}` : `error-${Date.now()}`}
//           message={successMessage || error}
//           type={successMessage ? "success" : "error"}
//           onClose={clearStatus}
//         />
//       )}
//       <AdminHeaderWrapper
//         title={wrapperData.title}
//         description={wrapperData.description}
//         breadcrumb={wrapperData.breadcrumb}
//       />
//       <div className="w-full mx-auto bg-white shadow p-6 rounded-2xl">
//         <form onSubmit={handleSubmit} className="space-y-10">
//           <h2 className="text-xl font-semibold">Add New Product</h2>

//           {/* ---------------- Product Info ---------------- */}
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             <div>
//               <label
//                 htmlFor="new_product_name"
//                 className="block font-medium mb-1"
//               >
//                 Product Name *
//               </label>
//               <input
//                 id="new_product_name"
//                 type="text"
//                 name="name"
//                 value={form.name}
//                 onChange={(e) => updateField("name", e.target.value)}
//                 className={`w-full p-3 rounded-xl outline-none focus:ring-2 focus:ring-primary-light border-2 ${
//                   errors.name ? "border-red-500" : "border-gray-200"
//                 }`}
//               />
//               {errors.name && (
//                 <p className="text-red-500 text-sm mt-1">{errors.name}</p>
//               )}
//             </div>

//             <div>
//               <label
//                 htmlFor="new_product_category"
//                 className="block font-medium mb-1"
//               >
//                 Category *
//               </label>
//               <select
//                 id="new_product_category"
//                 name="category_id"
//                 value={form.category_id}
//                 onChange={(e) => updateField("category_id", e.target.value)}
//                 className={`w-full p-3 rounded-xl focus:ring-2 focus:ring-primary-light focus:outline-none border-2  ${
//                   errors.category_id
//                     ? "border-red-500"
//                     : "border-[var(--color-border-color)]"
//                 }`}
//               >
//                 <option value="">Please select the categoriy</option>
//                 {categoriesData.map((itm, i) => (
//                   <option key={i} value={itm.id}>
//                     {itm.name}
//                   </option>
//                 ))}
//               </select>
//               {errors.category_id && (
//                 <p className="text-red-500 text-sm mt-1">
//                   {errors.category_id}
//                 </p>
//               )}
//             </div>

//             <div className="md:col-span-2">
//               <label
//                 htmlFor="new_product_description"
//                 className="block font-medium mb-1"
//               >
//                 Description
//               </label>
//               <textarea
//                 id="new_product_description"
//                 rows="4"
//                 name="description"
//                 value={form.description}
//                 onChange={(e) => updateField("description", e.target.value)}
//                 className="w-full p-3 rounded-xl focus:ring-2 focus:ring-primary-light focus:ring-primary focus:outline-none border-2 border-[var(--color-border-color)]"
//               />
//             </div>
//             <div>
//               <label
//                 htmlFor="new_product_quantity"
//                 className="block font-medium mb-1"
//               >
//                 Stock Unit *
//               </label>
//               <input
//                 id="new_product_quantity"
//                 type="number"
//                 name="stock_quantity"
//                 placeholder="Stock Quantity"
//                 value={form.stock_quantity ?? ""}
//                 onChange={(e) => updateField("stock_quantity", e.target.value)}
//                 className={`p-2 rounded-lg focus:ring-2 focus:ring-primary-light focus:outline-none border-2  ${
//                   errors.stock_quantity
//                     ? "border-red-500"
//                     : "border-[var(--color-border-color)]"
//                 }`}
//               />
//               {errors.stock_quantity && (
//                 <p className="text-red-500 text-xs">{errors.stock_quantity}</p>
//               )}
//             </div>
//             <div>
//               <label
//                 htmlFor="new_product_unit"
//                 className="block font-medium mb-1"
//               >
//                 Stock Unit *
//               </label>
//               <select
//                 id="new_product_unit"
//                 value={form.stock_unit}
//                 name="stock_unit"
//                 onChange={(e) => updateField("stock_unit", e.target.value)}
//                 className={`w-full p-3 rounded-xl focus:ring-2 focus:ring-primary-light focus:outline-none border-2  ${
//                   errors.is_active
//                     ? "border-red-500"
//                     : "border-[var(--color-border-color)]"
//                 }`}
//               >
//                 <option value="kg">Kg</option>
//                 <option value="gm">gm</option>
//                 <option value="lt">Lt</option>
//                 <option value="ml">ml</option>
//                 <option value="other">others</option>
//               </select>
//             </div>

//             <div>
//               <label
//                 htmlFor="new_product_status"
//                 className="block font-medium mb-1"
//               >
//                 Status *
//               </label>
//               <select
//                 id="new_product_status"
//                 value={form.is_active}
//                 name="is_active"
//                 onChange={(e) =>
//                   updateField("is_active", e.target.value === "true")
//                 }
//                 className={`w-full p-3 rounded-xl focus:ring-2 focus:ring-primary-light focus:outline-none border-2  ${
//                   errors.is_active
//                     ? "border-red-500"
//                     : "border-[var(--color-border-color)]"
//                 }`}
//               >
//                 <option value="true">Active</option>
//                 <option value="false">Inactive</option>
//               </select>
//             </div>
//           </div>

//           {/* ---------------- Variants ---------------- */}
//           <div className="bg-gray-50 p-5 rounded-2xl space-y-5">
//             <h3 className="font-semibold">Product Variants *</h3>

//             {errors.variants && (
//               <p className="text-red-500 text-sm">{errors.variants}</p>
//             )}

//             {form.variants.map((variant, index) => (
//               <div
//                 key={index}
//                 className="bg-white p-4 rounded-xl shadow-sm grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3"
//               >
//                 <div>
//                   <input
//                     type="text"
//                     placeholder="Variant Name"
//                     name="variant_name"
//                     value={variant.variant_name}
//                     onChange={(e) =>
//                       updateVariant(index, "variant_name", e.target.value)
//                     }
//                     className={`p-2 rounded-lg focus:ring-2 focus:ring-primary-light focus:outline-none border-2  ${
//                       errors.variantErrors?.[index]?.variant_name
//                         ? "border-red-500"
//                         : "border-[var(--color-border-color)]"
//                     }`}
//                   />
//                   {errors.variantErrors?.[index]?.variant_name && (
//                     <p className="text-red-500 text-xs">
//                       {errors.variantErrors[index].variant_name}
//                     </p>
//                   )}
//                 </div>
//                 <div>
//                   <input
//                     type="number"
//                     placeholder="Regular Price"
//                     name="regular_price"
//                     value={variant.regular_price ?? ""}
//                     onChange={(e) =>
//                       updateVariant(index, "regular_price", e.target.value)
//                     }
//                     className={`p-2 rounded-lg focus:ring-2 focus:ring-primary-light focus:outline-none border-2  ${
//                       errors.variantErrors?.[index]?.regular_price
//                         ? "border-red-500"
//                         : "border-[var(--color-border-color)]"
//                     }`}
//                   />
//                   {errors.variantErrors?.[index]?.regular_price && (
//                     <p className="text-red-500 text-xs">
//                       {errors.variantErrors[index].regular_price}
//                     </p>
//                   )}
//                 </div>
//                 <div>
//                   <input
//                     type="number"
//                     name="stock_quantity"
//                     placeholder="Stock Quantity"
//                     value={variant.stock_quantity ?? ""}
//                     onChange={(e) =>
//                       updateVariant(index, "stock_quantity", e.target.value)
//                     }
//                     className={`p-2 rounded-lg focus:ring-2 focus:ring-primary-light focus:outline-none border-2  ${
//                       errors.variantErrors?.[index]?.stock_quantity
//                         ? "border-red-500"
//                         : "border-[var(--color-border-color)]"
//                     }`}
//                   />
//                   {errors.variantErrors?.[index]?.stock_quantity && (
//                     <p className="text-red-500 text-xs">
//                       {errors.variantErrors[index].stock_quantity}
//                     </p>
//                   )}
//                 </div>
//                 <div>
//                   <select
//                     placeholder="Unit (kg, g, l, other)"
//                     name="unit"
//                     onChange={(e) =>
//                       updateVariant(index, "unit", e.target.value)
//                     }
//                     className={`p-2 rounded-lg focus:ring-2 focus:ring-primary-light focus:outline-none border-2  ${
//                       errors.variantErrors?.[index]?.unit
//                         ? "border-red-500"
//                         : "border-[var(--color-border-color)]"
//                     }`}
//                   >
//                     <option value="">Please select the Unit</option>
//                     <option value="kg">Kg</option>
//                     <option value="gm">gm</option>
//                     <option value="lt">Lt</option>
//                     <option value="ml">ml</option>
//                     <option value="other">others</option>
//                   </select>

//                   {errors.variantErrors?.[index]?.unit && (
//                     <p className="text-red-500 text-xs">
//                       {errors.variantErrors[index].unit}
//                     </p>
//                   )}
//                 </div>
//                 {/* <div>
//                   <select
//                     name="status"
//                     value={variant.status}
//                     onChange={(e) =>
//                       updateVariant(index, "status", e.target.value)
//                     }
//                     className="p-2 rounded-lg focus:ring-2 focus:ring-primary-light focus:outline-none border-2 border-[var(--color-border-color)]"
//                   >
//                     <option value="available">Available</option>
//                     <option value="out_of_stock">Out of Stock</option>
//                   </select>
//                 </div> */}
//                 {/* <div>
//                   <input
//                     type="text"
//                     placeholder="SKU"
//                     name="sku"
//                     value={variant.sku}
//                     onChange={(e) =>
//                       updateVariant(index, "sku", e.target.value)
//                     }
//                     className={`p-2 rounded-lg focus:ring-2 focus:ring-primary-light focus:outline-none border-2 ${
//                       errors.variantErrors?.[index]?.sku
//                         ? "border-red-500"
//                         : "border-[var(--color-border-color)]"
//                     }`}
//                   />
//                   {errors.variantErrors?.[index]?.sku && (
//                     <p className="text-red-500 text-xs">
//                       {errors.variantErrors[index].sku}
//                     </p>
//                   )}
//                 </div> */}
//                 {form.variants.length > 1 && (
//                   <div>
//                     <button
//                       type="button"
//                       onClick={() => removeVariant(index)}
//                       className="flex space-between p-3 text-red-500 hover:bg-red-100 p-1 rounded-full"
//                     >
//                       <Trash2 size={16} className="mt-1 mx-2" />{" "}
//                       <span>Remove Variant</span>
//                     </button>
//                   </div>
//                 )}
//               </div>
//             ))}

//             <button
//               type="button"
//               onClick={addVariant}
//               className="flex items-center gap-2 text-primary"
//             >
//               <Plus size={16} /> Add Variant
//             </button>
//           </div>

//           {/* ---------------- Images ---------------- */}
//           <div className="bg-gray-50 p-5 rounded-2xl space-y-4">
//             <h3 className="font-semibold">Product Images *</h3>

//             {errors.images && (
//               <p className="text-red-500 text-sm">{errors.images}</p>
//             )}

//             <label
//               htmlFor="new_product_img"
//               className={`flex flex-col items-center justify-center h-32 border-2 border-dashed hover:bg-gray-100 rounded-xl cursor-pointer ${
//                 errors.images ? "border-red-500" : "border-secondary-light"
//               }`}
//             >
//               <Upload className="w-6 h-6" />
//               <span className="text-sm">Click to upload images</span>
//               <input
//                 id="new_product_img"
//                 type="file"
//                 multiple
//                 accept="image/*"
//                 className="hidden"
//                 onChange={handleImageUpload}
//               />
//             </label>

//             {form.images.length > 0 && (
//               <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4">
//                 {form.images.map((img, index) => (
//                   <div key={index} className="relative group">
//                     <img src={img.url} alt="preview" className="rounded-xl" />

//                     {/* Primary Badge */}
//                     {img.isPrimary && (
//                       <span className="absolute top-1 left-1 bg-green-500 text-white text-xs px-2 py-0.5 rounded">
//                         Primary
//                       </span>
//                     )}

//                     {/* Remove */}
//                     <button
//                       type="button"
//                       onClick={() => removeImage(index)}
//                       className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition"
//                     >
//                       <X size={16} />
//                     </button>

//                     {/* Set Primary */}
//                     {!img.isPrimary && (
//                       <button
//                         type="button"
//                         onClick={() => setPrimaryImage(index)}
//                         className="absolute bottom-1 left-1 right-1 bg-black/60 text-white text-xs py-1 rounded opacity-0 group-hover:opacity-100 transition"
//                       >
//                         Set as Primary
//                       </button>
//                     )}
//                   </div>
//                 ))}
//               </div>
//             )}
//           </div>

//           <button
//             type="submit"
//             disabled={loading}
//             className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200
//     ${
//       loading
//         ? "bg-primary/50 text-white/90 animate-pulse cursor-wait"
//         : "bg-primary hover:bg-primary-dark text-white active:scale-95"
//     }`}
//           >
//             {loading ? "Adding Product..." : "Save Product"}
//           </button>
//           <button
//             type="reset"
//             onClick={handleReset}
//             className="bg-gray-200 hover:bg-gray-300 text-gray-800 ml-2 px-6 py-3 rounded-xl transition-colors"
//           >
//             Reset
//           </button>
//         </form>
//       </div>
//     </>
//   );
// }

// ProductDetails.jsx
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  Pencil,
  Trash2,
  Save,
  X,
  Upload,
  Plus,
  AlertCircle,
  Loader2,
} from "lucide-react";
import StatusModal from "../../../components/admin/StatusModal";
import { useAdminProductStore } from "../../../store/admin/AdminProductStore";
import AdminHeaderWrapper from "../../../components/admin/AdminHeaderWrapper";

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const initialFormData = {
    name: "",
    description: "",
    category_id: "",
    stock_quantity: "",
    stock_unit: "kg",
    is_active: true,
    images: [],
    variants: [],
  };

  const [editMode, setEditMode] = useState(false);
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState(initialFormData);

  const {
    selectedProduct,
    updateProduct,
    fetchProductById,
    fetchCategories,
    categoriesData,
    loading,
    error,
    successMessage,
    clearStatus,
  } = useAdminProductStore();

  useEffect(() => {
    fetchProductById(id);
    fetchCategories();
  }, [id, fetchProductById, fetchCategories]);

  // Sync Form with Store Data
  useEffect(() => {
    if (selectedProduct && Object.keys(selectedProduct).length !== 0) {
      mapStoreToForm(selectedProduct);
    }
  }, [selectedProduct]);

  const mapStoreToForm = (data) => {
    const apiImages =
      data.product_images?.map((img) => ({
        id: img.id,
        url: img.image_path,
        altText: img.alt_text,
        isPrimary: img.is_primary,
        isNew: false,
      })) || [];

    const variantItems =
      data.product_variants?.map((itm) => ({
        id: itm.id,
        variant_name: itm.variant_name,
        regular_price: itm.variant_price,
        stock_quantity: itm.variant_quantity,
        unit: itm.quantity_unit,
      })) || [];

    setForm({
      id: data.id,
      name: data.name || "",
      description: data.description || "",
      category_id: data.categorie_details?.id || "",
      stock_quantity: data.stock_quantity || "",
      stock_unit: data.stock_unit || "kg",
      is_active: data.is_active ?? true,
      images: [...apiImages],
      variants: [...variantItems],
    });
  };

  // ------------------ Handlers ------------------
  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: null }));
  };

  const updateVariant = (index, field, value) => {
    const updated = [...form.variants];
    let newValue = value;
    if (["regular_price", "stock_quantity"].includes(field)) {
      newValue = value === "" ? "" : Number(value);
    }
    updated[index][field] = newValue;
    setForm((prev) => ({ ...prev, variants: updated }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    const newImages = files.map((file) => ({
      file,
      url: URL.createObjectURL(file),
      isNew: true,
      isPrimary: false,
    }));

    setForm((prev) => {
      const combined = [...prev.images, ...newImages];
      if (!combined.some((img) => img.isPrimary)) combined[0].isPrimary = true;
      return { ...prev, images: combined };
    });
  };

  const handleDelete = () => {
    confirm("Delete product?") && navigate("/admin/products");
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Product name is required";
    if (!form.category_id) e.category_id = "Please select a category";
    if (form.images.length === 0)
      e.images = "At least one product image is required";

    const variantErrors = form.variants.map((v) => {
      const vErr = {};
      if (!v.variant_name?.trim()) vErr.variant_name = "Required";
      if (v.regular_price === "" || v.regular_price < 0)
        vErr.regular_price = "Invalid Price";
      if (v.stock_quantity === "" || v.stock_quantity < 0)
        vErr.stock_quantity = "Invalid Stock";
      if (!v.unit) vErr.unit = "Required";
      return vErr;
    });

    if (variantErrors.some((v) => Object.keys(v).length > 0)) {
      e.variantErrors = variantErrors;
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      ...form,
      product_variants: form.variants.map((v) => ({
        ...v,
        variant_price: Number(v.regular_price),
        variant_quantity: Number(v.stock_quantity),
        quantity_unit: v.unit,
      })),
      product_images: form.images.map((img) => ({
        image_path: img.url,
        is_primary: img.isPrimary,
        alt_text: form.name,
      })),
    };

    try {
      await updateProduct(id, payload);
      setTimeout(() => setEditMode(false), 1000);
    } catch (err) {
      console.error("Update failed", err);
    }
  };

  if (loading && !selectedProduct)
    return (
      <div className="p-10 text-center animate-pulse">
        Loading Product Details...
      </div>
    );

  return (
    <div className="p-4 max-w-7xl mx-auto space-y-6">
      <StatusModal
        successMessage={successMessage}
        error={error}
        onClose={clearStatus}
      />

      {/* HEADER SECTION */}
      <div className="md:flex justify-between items-center">
        <AdminHeaderWrapper
          title={form.name || `Product #${id}`}
          description="Manage product information, media, and variants"
          breadcrumb={[
            { label: "Products", to: "/admin/products" },
            { label: id },
          ]}
        />

        {/* <div className="flex items-center gap-3"> */}
        <div className="flex gap-2">
          {!editMode ? (
            <button
              onClick={() => setEditMode(true)}
              className="flex items-center gap-2 bg-primary/10 rounded-2xl text-primary px-4 py-2 rounded-xl cursor-pointer font-bold hover:bg-primary/20 transition-all"
            >
              <Pencil size={16} className="text-primary" /> Edit
            </button>
          ) : (
            <button
              onClick={() => {
                setErrors({});
                setEditMode(false);
                mapStoreToForm(selectedProduct);
              }}
              className="px-5 py-2.5 text-gray-600 font-medium hover:text-gray-800"
            >
              Cancel
            </button>
          )}
          <button
            onClick={handleDelete}
            className="p-2.5 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
          >
            <Trash2 size={20} /> Delete
          </button>
        </div>
      </div>

      <form
        onSubmit={handleSave}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        {/* LEFT COL: MAIN INFO */}
        <div className="lg:col-span-2 space-y-6">
          <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
            <h3 className="text-lg font-bold text-gray-800 border-b pb-3">
              General Information
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Product Name *
                </label>
                <input
                  type="text"
                  disabled={!editMode}
                  value={form.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  className={`w-full p-3 rounded-xl border-2 transition-all focus:ring-4 outline-none ${
                    errors.name
                      ? "border-red-200 ring-red-50 focus:border-red-500"
                      : "border-gray-100 focus:border-primary-light focus:ring-primary/10"
                  } disabled:bg-gray-50 disabled:text-gray-500`}
                />
                {errors.name && (
                  <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle size={12} /> {errors.name}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Description
                </label>
                <textarea
                  rows={4}
                  disabled={!editMode}
                  value={form.description}
                  onChange={(e) => updateField("description", e.target.value)}
                  className="w-full p-3 rounded-xl border-2 border-gray-100 focus:border-primary-light focus:ring-4 focus:ring-primary/10 transition-all outline-none disabled:bg-gray-50"
                />
              </div>
            </div>
          </section>

          {/* VARIANTS SECTION */}
          <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-800">
                Inventory & Variants
              </h3>
              {editMode && (
                <button
                  type="button"
                  onClick={() =>
                    setForm((prev) => ({
                      ...prev,
                      variants: [
                        ...prev.variants,
                        {
                          variant_name: "",
                          regular_price: 0,
                          stock_quantity: 0,
                          unit: "kg",
                        },
                      ],
                    }))
                  }
                  className="text-primary text-sm font-bold flex items-center gap-1 hover:underline"
                >
                  <Plus size={16} /> Add Variant
                </button>
              )}
            </div>

            <div className="space-y-3">
              {form.variants.map((v, i) => (
                <div
                  key={i}
                  className="group relative grid grid-cols-1 sm:grid-cols-4 gap-3 p-4 rounded-xl border border-gray-100 bg-gray-50/50"
                >
                  <div className="sm:col-span-1">
                    <input
                      placeholder="Size/Name"
                      disabled={!editMode}
                      value={v.variant_name}
                      onChange={(e) =>
                        updateVariant(i, "variant_name", e.target.value)
                      }
                      className="w-full p-2.5 rounded-lg border border-gray-200 text-sm focus:border-primary-light outline-none"
                    />
                  </div>
                  <div>
                    <input
                      type="number"
                      placeholder="Price"
                      disabled={!editMode}
                      value={v.regular_price}
                      onChange={(e) =>
                        updateVariant(i, "regular_price", e.target.value)
                      }
                      className="w-full p-2.5 rounded-lg border border-gray-200 text-sm focus:border-primary-light outline-none"
                    />
                  </div>
                  <div>
                    <input
                      type="number"
                      placeholder="Stock"
                      disabled={!editMode}
                      value={v.stock_quantity}
                      onChange={(e) =>
                        updateVariant(i, "stock_quantity", e.target.value)
                      }
                      className="w-full p-2.5 rounded-lg border border-gray-200 text-sm focus:border-primary-light outline-none"
                    />
                  </div>
                  <div className="flex gap-2">
                    <select
                      disabled={!editMode}
                      value={v.unit}
                      onChange={(e) => updateVariant(i, "unit", e.target.value)}
                      className="w-full p-2.5 rounded-lg border border-gray-200 text-sm focus:border-primary-light outline-none"
                    >
                      <option value="kg">kg</option>
                      <option value="gm">gm</option>
                      <option value="lt">lt</option>
                      <option value="ml">ml</option>
                    </select>
                    {editMode && form.variants.length > 1 && (
                      <button
                        type="button"
                        onClick={() =>
                          setForm((prev) => ({
                            ...prev,
                            variants: prev.variants.filter(
                              (_, idx) => idx !== i
                            ),
                          }))
                        }
                        className="text-red-400 hover:text-red-600 transition-colors"
                      >
                        <X size={20} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* RIGHT COL: MEDIA & STATUS */}
        <div className="space-y-6">
          <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
            <h3 className="text-lg font-bold text-gray-800">Organization</h3>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Category
              </label>
              <select
                disabled={!editMode}
                value={form.category_id}
                onChange={(e) => updateField("category_id", e.target.value)}
                className="w-full p-3 rounded-xl border-2 border-gray-100 focus:border-primary-light outline-none disabled:bg-gray-50"
              >
                <option value="">Select Category</option>
                {categoriesData.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Status
              </label>
              <select
                disabled={!editMode}
                value={form.is_active}
                onChange={(e) =>
                  updateField("is_active", e.target.value === "true")
                }
                className="w-full p-3 rounded-xl border-2 border-gray-100 focus:border-primary-light outline-none disabled:bg-gray-50"
              >
                <option value="true">Active / Published</option>
                <option value="false">Inactive / Draft</option>
              </select>
            </div>
          </section>

          <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
            <h3 className="text-lg font-bold text-gray-800">Product Images</h3>
            <div className="grid grid-cols-2 gap-3">
              {form.images.map((img, i) => (
                <div
                  key={i}
                  className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                    img.isPrimary ? "border-primary" : "border-transparent"
                  }`}
                >
                  <img
                    src={img.url}
                    className="w-full h-full object-cover"
                    alt="product"
                  />
                  {editMode && (
                    <button
                      type="button"
                      onClick={() =>
                        setForm((p) => ({
                          ...p,
                          images: p.images.filter((_, idx) => idx !== i),
                        }))
                      }
                      className="absolute top-1 right-1 bg-white/90 p-1 rounded-full shadow-md text-red-500 hover:bg-red-50"
                    >
                      <X size={14} />
                    </button>
                  )}
                  {img.isPrimary && (
                    <div className="absolute bottom-0 left-0 right-0 bg-primary text-white text-[10px] py-0.5 text-center font-bold">
                      PRIMARY
                    </div>
                  )}
                </div>
              ))}
              {editMode && (
                <label className="aspect-square flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                  <Upload size={24} className="text-gray-400 mb-1" />
                  <span className="text-xs font-medium text-gray-500">
                    Upload
                  </span>
                  <input
                    type="file"
                    multiple
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                </label>
              )}
            </div>
            {errors.images && (
              <p className="text-xs text-red-500">{errors.images}</p>
            )}
          </section>

          {editMode && (
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-primary hover:bg-primary-dark text-white rounded-2xl font-bold shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {loading ? (
                <Loader2 className="animate-spin" />
              ) : (
                <Save size={20} />
              )}
              {loading ? "Saving Changes..." : "Save Product Details"}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

// // ProductDetails.jsx
// import { useNavigate, useParams } from "react-router-dom";
// import { useEffect, useState } from "react";
// import { Pencil, Trash2, Save, X, Upload, Plus } from "lucide-react";
// import StatusModal from "../../../components/admin/StatusModal";
// import { useAdminProductStore } from "../../../store/admin/AdminProductStore";
// // ------------------ Dummy Products ------------------
// import AdminHeaderWrapper from "../../../components/admin/AdminHeaderWrapper";

// export default function ProductDetails() {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const initialFormData = {
//     name: "",
//     description: "",
//     category_id: "",
//     stock_quantity: "",
//     stock_unit: "kg",
//     is_active: "",
//     images: [],
//     variants: [],
//   };
//   const [editMode, setEditMode] = useState(false);
//   const [errors, setErrors] = useState({});
//   const [form, setForm] = useState(initialFormData);

//   const {
//     fetchProducts,
//     selectedProduct,
//     updateProduct,
//     fetchProductById,
//     fetchCategories,
//     productsData,
//     categoriesData,
//     loading,
//     error,
//     successMessage,
//     clearStatus,
//   } = useAdminProductStore();

//   useEffect(() => {
//     fetchProductById(id);
//     fetchCategories();
//   }, [id, fetchProductById, fetchCategories]);

//   useEffect(() => {
//     const data = { ...selectedProduct };
//     console.log("data :", data);
//     if (Object.keys(data).length !== 0) {
//       const apiImages = data.product_images.map((img) => ({
//         id: img.id,
//         url: img.image_path,
//         altText: img.alt_text,
//         isPrimary: img.is_primary,
//         isNew: false,
//       }));
//       const variantItems = data.product_variants.map((itm) => ({
//         id: itm.id,
//         variant_name: itm.variant_name,
//         regular_price: itm.variant_price,
//         stock_quantity: itm.variant_quantity,
//         unit: itm.quantity_unit,
//       }));
//       setForm(() => ({
//         id: data.id,
//         name: data.name || "",
//         description: data.description || "",
//         category_id: data.categorie_details.id || "",
//         stock_quantity: data.stock_quantity || "",
//         stock_unit: data.stock_unit || "kg",
//         is_active: data.is_active || "available",
//         images: [...apiImages], // array of objects
//         variants: [...variantItems], // array of objects
//       }));
//     }
//   }, [selectedProduct]);

//   // ✅ LOADING STATE
//   if (loading && !error) {
//     return <div className="p-6">Loading product...</div>;
//   }

//   // ✅ NOT FOUND STATE
//   if (error && !loading) {
//     return <div className="p-6 text-red-600">Product not found</div>;
//   }
//   // ------------------ Helpers ------------------
//   const updateField = (field, value) =>
//     setForm((prev) => ({ ...prev, [field]: value }));

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
//     updateField("variants", updated);
//   };

//   const removeVariant = (index) => {
//     updateField(
//       "variants",
//       form.variants.filter((_, i) => i !== index)
//     );
//   };

//   const addVariant = () => {
//     updateField("variants", [
//       ...form.variants,
//       {
//         variant_name: "",
//         regular_price: 0,
//         // discounted_price: 0,
//         stock_quantity: 0,
//         unit: "",
//         // sku: "",
//         // status: "available",
//       },
//     ]);
//   };

//   // ------------------ Images ------------------
//   const handleImageUpload = (e) => {
//     const files = Array.from(e.target.files);
//     if (!files.length) return;

//     const newImages = files.map((file) => ({
//       file,
//       url: URL.createObjectURL(file),
//       isNew: true,
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
//           v.regular_price < 0
//         )
//           err.regular_price = "Regular price required (must be 0 or greater)";
//         if (
//           v.stock_quantity === undefined ||
//           v.stock_quantity === null ||
//           v.stock_quantity < 0
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

//   const handleSave = async (e) => {
//     e.preventDefault();
//     if (!validate()) return;

//     const convertApiImages = form.images.map((img, index) => ({
//       id: img.id ?? "PIM" + Date.now(),
//       image_path: img.url, // for json-server (file upload ignored)
//       alt_text: img.altText || "",
//       is_primary: img.isPrimary,
//     }));
//     const convertApiVariants = form.variants.map((v, index) => ({
//       id: v.id ?? "PV" + Date.now(),
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
//       id: id,
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
//       await updateProduct(id, payload);
//       setTimeout(() => {
//         setEditMode(false);
//         clearStatus();
//       }, 1500);
//     } catch (err) {
//       console.log("Error While updating :", err);
//     }
//   };

//   const handleReset = () => {
//     console.log("Reset Button is Clicked");
//     const apiImages = data.images.map((img) => ({
//       id: img.id,
//       url: img.image_path,
//       isNew: false,
//       isPrimary: img.is_primary,
//     }));
//     setForm({
//       id: data.id,
//       name: data.name || "",
//       description: data.description || "",
//       category_id: data.category_id || "",
//       stock_quantity: data.stock_quantity || "",
//       stock_unit: data.stock_unit || "kg",
//       is_active: data.is_active || "available",
//       images: [...apiImages], // array of objects
//       variants: [...data.variants], // array of objects
//     });
//   };
//   const handleDelete = () => {
//     if (!confirm("Delete this product?")) return;
//     console.log("Deleted Product", id);
//     navigate("/admin/products");
//   };

//   // ------------------ UI ------------------
//   return (
//     <div className="p-1 md:p-4 space-y-6">
//       {/* Optimized Status Modal */}
//       {(successMessage || error) && (
//         <StatusModal
//           key={successMessage ? `success-${Date.now()}` : `error-${Date.now()}`}
//           message={successMessage || error}
//           type={successMessage ? "success" : "error"}
//           onClose={clearStatus}
//         />
//       )}
//       {/* HEADER */}
//       <div className="md:flex justify-between items-center">
//         <AdminHeaderWrapper
//           title={`Product #${id}`}
//           description="View / Edit Product details"
//           breadcrumb={[
//             { label: "Dashboard", to: "/admin" },
//             { label: "Products", to: "/admin/products" },
//             { label: id },
//           ]}
//         />

//         <div className="flex gap-3 justify-end mb-3 mb:mb-0">
//           {!editMode ? (
//             <button
//               onClick={() => setEditMode(true)}
//               className="border cursor-pointer border-[var(--color-primary)] text-[var(--color-primary)] px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-[var(--color-primary-light)] hover:text-white transition"
//             >
//               <Pencil size={18} /> Edit
//             </button>
//           ) : (
//             <button
//               onClick={handleSave}
//               className="bg-primary cursor-pointer hover:bg-primary-dark text-white px-4 py-2 rounded-lg flex items-center gap-2"
//             >
//               <Save size={18} /> Save
//             </button>
//           )}

//           <button
//             onClick={handleDelete}
//             className="border border-red-500 text-red-600 px-4 py-2 rounded-lg flex items-center gap-2"
//           >
//             <Trash2 size={18} /> Delete
//           </button>
//         </div>
//       </div>

//       {/* Body */}
//       <form
//         className="bg-white p-6 rounded-2xl shadow space-y-8"
//         onSubmit={handleSave}
//       >
//         {/* Basic Info */}
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//           <div>
//             <label htmlFor="product_name" className="font-medium">
//               Product Name *
//             </label>
//             <input
//               type="text"
//               id="product_name"
//               disabled={!editMode}
//               value={form.name}
//               onChange={(e) => updateField("name", e.target.value)}
//               className={`w-full p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-light focus:outline-none focus:outline-none border-2 ${
//                 errors.name
//                   ? "border-red-500"
//                   : "border-[var(--color-border-color)]"
//               }`}
//             />
//             {errors.name && <p className="text-red-500">{errors.name}</p>}
//           </div>

//           <div>
//             <label htmlFor="product_category_id" className="font-medium">
//               Category *
//             </label>
//             <select
//               id="product_category_id"
//               disabled={!editMode}
//               value={form.category_id}
//               onChange={(e) => updateField("category_id", e.target.value)}
//               className={`w-full p-3 rounded-xl focus:ring-2 focus:ring-primary-light focus:outline-none border-2 ${
//                 errors.category_id
//                   ? "border-red-500"
//                   : "border-[var(--color-border-color)]"
//               }`}
//             >
//               <option value="">Please Select the Category</option>
//               {categoriesData.map((itm, i) => (
//                 <option key={i} value={itm.id}>
//                   {itm.name}
//                 </option>
//               ))}
//             </select>
//             {errors.category_id && (
//               <p className="text-red-500 text-sm mt-1">{errors.category_id}</p>
//             )}
//           </div>
//         </div>

//         <div>
//           <label htmlFor="product_description" className="font-medium">
//             Description
//           </label>
//           <textarea
//             id="product_description"
//             disabled={!editMode}
//             value={form.description}
//             onChange={(e) => updateField("description", e.target.value)}
//             rows={3}
//             className="w-full p-3 rounded-xl focus:ring-2 focus:ring-primary-light focus:outline-none border-2 border-[var(--color-border-color)]"
//           />
//         </div>
//         <div>
//           <label
//             htmlFor="product_stock_quantity"
//             className="block font-medium mb-1"
//           >
//             Stock Quantity *
//           </label>
//           <input
//             id="product_stock_quantity"
//             type="number"
//             name="stock_quantity"
//             placeholder="Stock Quantity"
//             value={form.stock_quantity ?? ""}
//             onChange={(e) => updateField("stock_quantity", e.target.value)}
//             className={`p-2 rounded-lg focus:ring-2 focus:ring-primary-light focus:outline-none border-2  ${
//               errors.stock_quantity
//                 ? "border-red-500"
//                 : "border-[var(--color-border-color)]"
//             }`}
//           />
//           {errors.stock_quantity && (
//             <p className="text-red-500 text-xs">{errors.stock_quantity}</p>
//           )}
//         </div>
//         <div>
//           <label htmlFor="product_unit" className="block font-medium mb-1">
//             Stock Unit *
//           </label>
//           <select
//             id="product_unit"
//             value={form.stock_unit}
//             name="stock_unit"
//             onChange={(e) => updateField("stock_unit", e.target.value)}
//             className={`w-full p-3 rounded-xl focus:ring-2 focus:ring-primary-light focus:outline-none border-2  ${
//               errors.is_active
//                 ? "border-red-500"
//                 : "border-[var(--color-border-color)]"
//             }`}
//           >
//             <option value="">Please select Unit</option>
//             <option value="kg">Kg</option>
//             <option value="gm">gm</option>
//             <option value="lt">Lt</option>
//             <option value="ml">ml</option>
//             <option value="other">others</option>
//           </select>
//         </div>
//         <div>
//           <label htmlFor="product_is_active" className="block font-medium mb-1">
//             Status *
//           </label>
//           <select
//             id="product_is_active"
//             disabled={!editMode}
//             value={form.is_active}
//             onChange={(e) =>
//               updateField("is_active", e.target.value === "true")
//             }
//             className={`w-100 w-md-full p-3 rounded-xl focus:ring-2 focus:ring-primary-light focus:outline-none border-2  ${
//               errors.is_active
//                 ? "border-red-500"
//                 : "border-[var(--color-border-color)]"
//             }`}
//           >
//             <option value="true">Active</option>
//             <option value="false">Inactive</option>
//           </select>
//         </div>

//         {/* Images */}
//         <div>
//           <label className="font-medium">Images *</label>

//           <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-3">
//             {form.images.map((img, i) => (
//               <div key={i} className="relative group">
//                 <img
//                   src={img.url}
//                   alt={`preview-${i}`}
//                   className={`h-32 w-full object-cover rounded-xl border-2 ${
//                     img.isPrimary ? "border-green-500" : "border-transparent"
//                   }`}
//                 />

//                 {/* Primary badge */}
//                 {img.isPrimary && (
//                   <span className="absolute top-1 left-1 bg-green-500 text-white text-xs px-2 py-0.5 rounded">
//                     Primary
//                   </span>
//                 )}

//                 {/* Remove */}
//                 {editMode && (
//                   <button
//                     type="button"
//                     onClick={() => removeImage(i)}
//                     className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
//                   >
//                     <X size={14} />
//                   </button>
//                 )}

//                 {/* Set primary */}
//                 {editMode && !img.isPrimary && (
//                   <button
//                     type="button"
//                     onClick={() => setPrimaryImage(i)}
//                     className="absolute bottom-1 left-1 right-1 bg-black/60 text-white text-xs py-1 rounded opacity-0 group-hover:opacity-100 transition"
//                   >
//                     Set as Primary
//                   </button>
//                 )}
//               </div>
//             ))}
//           </div>

//           {editMode && (
//             <label
//               htmlFor="product_img"
//               className={`mt-4 h-28 border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer ${
//                 errors?.images ? "border-red-500" : "border-secondary-light"
//               }`}
//             >
//               <Upload /> Upload Images
//               <input
//                 id="product_img"
//                 disabled={!editMode}
//                 type="file"
//                 multiple
//                 className="hidden"
//                 onChange={handleImageUpload}
//               />
//             </label>
//           )}

//           {errors.images && <p className="text-red-500">{errors.images}</p>}
//         </div>

//         {/* <div>
//           <label className="font-medium">Images *</label>
//           <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-3">
//             {form.images.map((img, i) => (
//               <div key={i} className="relative">
//                 <img
//                   src={img.url}
//                   alt={`preview-${i}`}
//                   className="h-32 w-full object-cover rounded-xl"
//                 />
//                 {editMode && (
//                   <button
//                     type="button"
//                     onClick={() => removeImage(i)}
//                     className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
//                   >
//                     <X size={14} />
//                   </button>
//                 )}
//               </div>
//             ))}
//           </div>
//           {editMode && (
//             <label
//               htmlFor="product_img"
//               className={`mt-4 h-28 border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer ${
//                 errors?.images ? "border-red-500" : "border-secondary-light"
//               }`}
//             >
//               <Upload /> Upload Images
//               <input
//                 id="product_img"
//                 disabled={!editMode}
//                 type="file"
//                 multiple
//                 className="hidden"
//                 onChange={handleImageUpload}
//               />
//             </label>
//           )}
//           {errors.images && <p className="text-red-500">{errors.images}</p>}
//         </div> */}

//         {/* Variants */}
//         <div className="space-y-4">
//           <div className="flex justify-between items-center">
//             <h2 className="text-lg font-semibold">Variants *</h2>
//             {editMode && (
//               <button
//                 type="button"
//                 onClick={addVariant}
//                 className="text-primary flex items-center gap-1"
//               >
//                 <Plus size={18} /> Add Variant
//               </button>
//             )}
//           </div>

//           {errors.variants && <p className="text-red-500">{errors.variants}</p>}

//           {form.variants.map((v, i) => (
//             <div
//               key={i}
//               className="bg-white p-4 rounded-xl shadow-sm grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3"
//             >
//               <div>
//                 <input
//                   disabled={!editMode}
//                   type="text"
//                   placeholder="Variant Name"
//                   value={v.variant_name}
//                   name="variant_name"
//                   onChange={(e) =>
//                     updateVariant(i, "variant_name", e.target.value)
//                   }
//                   className={`p-2 rounded-lg focus:ring-2 focus:ring-primary-light focus:outline-none border-2 ${
//                     errors.variantErrors?.[i]?.variant_name
//                       ? "border-red-500"
//                       : "border-[var(--color-border-color)]"
//                   }`}
//                 />
//                 {errors.variantErrors?.[i]?.variant_name && (
//                   <p className="text-red-500 text-xs">
//                     {errors.variantErrors[i].variant_name}
//                   </p>
//                 )}
//               </div>
//               <div>
//                 <input
//                   disabled={!editMode}
//                   type="number"
//                   name="regular_price"
//                   placeholder="Regular Price"
//                   value={v.regular_price ?? ""}
//                   onChange={(e) =>
//                     updateVariant(i, "regular_price", e.target.value)
//                   }
//                   className={`p-2 rounded-lg focus:ring-2 focus:ring-primary-light focus:outline-none border-2  ${
//                     errors.variantErrors?.[i]?.regular_price
//                       ? "border-red-500"
//                       : "border-[var(--color-border-color)]"
//                   }`}
//                 />
//                 {errors.variantErrors?.[i]?.regular_price && (
//                   <p className="text-red-500 text-xs">
//                     {errors.variantErrors[i].regular_price}
//                   </p>
//                 )}
//               </div>
//               {/* <div>
//                 <input
//                   disabled={!editMode}
//                   type="number"
//                   placeholder="Discounted Price"
//                   name="discounted_price"
//                   value={v.discounted_price ?? ""}
//                   onChange={(e) =>
//                     updateVariant(i, "discounted_price", e.target.value)
//                   }
//                   className={`p-2 rounded-lg focus:ring-2 focus:ring-primary-light focus:outline-none border-2 border-[var(--color-border-color)]`}
//                 />
//               </div> */}
//               <div>
//                 <input
//                   disabled={!editMode}
//                   type="number"
//                   placeholder="Stock"
//                   name="stock_quantity"
//                   value={v.stock_quantity ?? ""}
//                   onChange={(e) =>
//                     updateVariant(i, "stock_quantity", e.target.value)
//                   }
//                   className={`p-2 rounded-lg focus:ring-2 focus:ring-primary-light focus:outline-none border-2  ${
//                     errors.variantErrors?.[i]?.stock_quantity
//                       ? "border-red-500"
//                       : "border-[var(--color-border-color)]"
//                   }`}
//                 />
//                 {errors.variantErrors?.[i]?.stock_quantity && (
//                   <p className="text-red-500 text-xs">
//                     {errors.variantErrors[i].stock_quantity}
//                   </p>
//                 )}
//               </div>
//               <div>
//                 {/* <input
//                   disabled={!editMode}
//                   type="text"
//                   placeholder="Unit (kg, g, others)"
//                   value={v.unit}
//                   name="unit"
//                   onChange={(e) => updateVariant(i, "unit", e.target.value)}
//                   className={`p-2 rounded-lg focus:ring-2 focus:ring-primary-light focus:outline-none border-2  ${
//                     errors.variantErrors?.[i]?.unit
//                       ? "border-red-500"
//                       : "border-[var(--color-border-color)]"
//                   }`}
//                 /> */}
//                 <select
//                   placeholder="Unit (kg, g, l, other)"
//                   disabled={!editMode}
//                   value={v.unit}
//                   name="unit"
//                   onChange={(e) => updateVariant(i, "unit", e.target.value)}
//                   className={`p-2 rounded-lg focus:ring-2 focus:ring-primary-light focus:outline-none border-2  ${
//                     errors.variantErrors?.[i]?.unit
//                       ? "border-red-500"
//                       : "border-[var(--color-border-color)]"
//                   }`}
//                 >
//                   <option value="">Please select the Unit</option>
//                   <option value="kg">Kg</option>
//                   <option value="gm">gm</option>
//                   <option value="lt">Lt</option>
//                   <option value="ml">ml</option>
//                   <option value="other">others</option>
//                 </select>
//                 {errors.variantErrors?.[i]?.unit && (
//                   <p className="text-red-500 text-xs">
//                     {errors.variantErrors[i].unit}
//                   </p>
//                 )}
//               </div>

//               {/* <div>
//                 <select
//                   disabled={!editMode}
//                   value={v.status}
//                   name="status"
//                   onChange={(e) => updateVariant(i, "status", e.target.value)}
//                   className={`p-2 rounded-lg focus:ring-2 focus:ring-primary-light focus:outline-none border-2  ${
//                     errors.variantErrors?.[i]?.status
//                       ? "border-red-500"
//                       : "border-[var(--color-border-color)]"
//                   }`}
//                 >
//                   <option value="available">Available</option>
//                   <option value="out_of_stock">Out of Stock</option>
//                 </select>
//                 {errors.variantErrors?.[i]?.status && (
//                   <p className="text-red-500 text-xs">
//                     {errors.variantErrors[i].status}
//                   </p>
//                 )}
//               </div> */}
//               {/* <div>
//                 <input
//                   disabled={!editMode}
//                   type="text"
//                   placeholder="SKU"
//                   name="sku"
//                   value={v.sku}
//                   onChange={(e) => updateVariant(i, "sku", e.target.value)}
//                   className={`p-2 rounded-lg focus:ring-2 focus:ring-primary-light focus:outline-none border-2 ${
//                     errors.variantErrors?.[i]?.sku
//                       ? "border-red-500"
//                       : "border-[var(--color-border-color)]"
//                   }`}
//                 />
//                 {errors.variantErrors?.[i]?.sku && (
//                   <p className="text-red-500 text-xs">
//                     {errors.variantErrors[i].sku}
//                   </p>
//                 )}
//               </div> */}
//               {editMode && form.variants.length > 1 && (
//                 <button
//                   type="button"
//                   onClick={() => removeVariant(i)}
//                   className="text-red-500 flex items-center gap-1"
//                 >
//                   <Trash2 size={16} /> Remove
//                 </button>
//               )}
//             </div>
//           ))}
//         </div>
//         <div className="Bottom Bottons">
//           {/* <button
//             disabled={!editMode}
//             type="submit"
//             className="bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-xl"
//           >
//             Save Product
//           </button> */}
//           <button
//             type="submit"
//             disabled={loading || !editMode}
//             className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200
//     ${
//       loading
//         ? "bg-primary/50 text-white/90 animate-pulse cursor-wait"
//         : "bg-primary hover:bg-primary-dark text-white active:scale-95"
//     }`}
//           >
//             {loading ? "Updating Data..." : "Save Product"}
//           </button>
//           <button
//             disabled={!editMode}
//             type="reset"
//             onClick={handleReset}
//             className="bg-gray-200 hover:bg-gray-300 text-gray-800 ml-2 px-6 py-3 rounded-xl transition-colors"
//           >
//             Reset
//           </button>
//         </div>
//       </form>
//     </div>
//   );
// }

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Save, RotateCcw, Package, Tag, Calendar, Info } from "lucide-react";
import AdminHeaderWrapper from "../../../components/admin/AdminHeaderWrapper";
import DualListBox from "./DualListBox";
import allCategories from "../../../utils/admin/allcategories";
import allProducts from "../../../utils/admin/allProducts";
import { useAdminPromotionStore } from "../../../store/admin/AdminPromotionStore";
import { useAdminProductStore } from "../../../store/admin/AdminProductStore";

const wrapperData = {
  title: "Create New Promotion",
  description:
    "Configure discounts for specific products, categories, or store-wide events.",
  breadcrumb: [
    { label: "Dashboard", to: "/admin" },
    { label: "Promotions", to: "/admin/promotions" },
    { label: "Create", to: "/admin/promotions/new" },
  ],
};

export default function CreateNewPromotion() {
  const navigate = useNavigate();
  const { addPromotion, loading, error, clearStatus } =
    useAdminPromotionStore();
  const { fetchCategories, categoriesData, productsData, fetchProducts } =
    useAdminProductStore();

  const [form, setForm] = useState({
    title: "",
    description: "",
    promotion_type: "",
    discount_type: "",
    discount_value: "",
    min_order_value: "",
    start_date: "",
    end_date: "",
    target_type: "PRODUCT", // Local state to handle UI toggle
    target_data: [],
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    const loadData = async () => {
      try {
        await fetchCategories();
        await fetchProducts();
      } catch (err) {
        console.log("error while fetching: ", err);
      }
    };
    loadData();
  }, []);
  useEffect(() => {
    console.log("categories Data :", categoriesData);
    console.log("products data :", productsData);
  }, [productsData, categoriesData]);
  // ---------------- Handlers ----------------
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors({ ...errors, [name]: null });
  };

  const validate = () => {
    const err = {};
    if (!form.title.trim()) err.title = "Promotion title is required";
    if (!form.promotion_type) err.promotion_type = "Select a promotion type";
    if (!form.discount_type) err.discount_type = "Select a discount type";
    if (!form.discount_value) err.discount_value = "Value is required";
    if (!form.start_date) err.start_date = "Start date is required";
    if (!form.end_date) err.end_date = "End date is required";

    if (
      (form.promotion_type === "PRODUCT" ||
        form.promotion_type === "CATEGORY") &&
      form.target_data.length === 0
    ) {
      err.target_data = `Please select at least one ${form.promotion_type.toLowerCase()}`;
    }

    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    console.log("form Data :", form);
    // Transform flat state to the Nested API Format
    // const payload = {
    //   title: form.title,
    //   description: form.description,
    //   promotion_type: form.promotion_type,
    //   discount_type: form.discount_type,
    //   discount_value: Number(form.discount_value),
    //   min_order_value: Number(form.min_order_value) || 0,
    //   config: {
    //     start_date: new Date(form.start_date).toISOString(),
    //     end_date: new Date(form.end_date).toISOString(),
    //     is_active: true,
    //   },
    //   targets: {
    //     type:
    //       form.promotion_type === "PRODUCT" ||
    //       form.promotion_type === "CATEGORY"
    //         ? form.promotion_type
    //         : "ALL",
    //     data: form.target_data,
    //   },
    // };

    // const success = await addPromotion(payload);
    // if (success) {
    //   navigate("/admin/promotions");
    // }
  };

  const handleReset = () => {
    setForm({
      title: "",
      description: "",
      promotion_type: "",
      discount_type: "",
      discount_value: "",
      min_order_value: "",
      start_date: "",
      end_date: "",
      target_type: "PRODUCT",
      target_data: [],
    });
    setErrors({});
    clearStatus();
  };

  return (
    <div className="pb-20">
      <AdminHeaderWrapper {...wrapperData} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {/* LEFT COLUMN: GENERAL SETTINGS */}
        <div className="lg:col-span-2 space-y-6">
          <section className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            <h3 className="flex items-center gap-2 text-sm font-bold text-gray-400 uppercase tracking-widest mb-6">
              <Info size={16} /> Basic Information
            </h3>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-500 mb-1 block">
                  Promotion Title *
                </label>
                <input
                  name="title"
                  placeholder="e.g., Summer Flash Sale"
                  value={form.title}
                  onChange={handleChange}
                  className={`w-full border-2 p-3 rounded-xl outline-none focus:border-primary transition-all ${
                    errors.title
                      ? "border-red-200 bg-red-50"
                      : "border-gray-200 bg-gray-50"
                  }`}
                />
                {errors.title && (
                  <p className="text-red-500 text-xs mt-1 font-medium">
                    {errors.title}
                  </p>
                )}
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 mb-1 block">
                  Internal Description
                </label>
                <textarea
                  name="description"
                  rows="3"
                  placeholder="Describe the promotion benefits..."
                  value={form.description}
                  onChange={handleChange}
                  className="w-full border-2 border-gray-200 bg-gray-50 p-3 rounded-xl outline-none focus:border-primary transition-all"
                />
              </div>
            </div>
          </section>

          {/* TARGETING LOGIC */}
          <section className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h3 className="flex items-center gap-2 text-sm font-bold text-gray-400 uppercase tracking-widest">
                <Package size={16} /> Target Selection
              </h3>
              <div className="flex border-gray-200 border-2 bg-gray-100 p-1 rounded-lg">
                <button
                  onClick={() =>
                    setForm({
                      ...form,
                      promotion_type: "PRODUCT",
                      target_data: [],
                    })
                  }
                  className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${
                    form.promotion_type === "PRODUCT"
                      ? "bg-white shadow-sm text-primary"
                      : "text-gray-400"
                  }`}
                >
                  Products
                </button>
                <button
                  onClick={() =>
                    setForm({
                      ...form,
                      promotion_type: "CATEGORY",
                      target_data: [],
                    })
                  }
                  className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${
                    form.promotion_type === "CATEGORY"
                      ? "bg-white shadow-sm text-primary"
                      : "text-gray-400"
                  }`}
                >
                  Categories
                </button>
              </div>
            </div>

            {form.promotion_type === "PRODUCT" ? (
              <DualListBox
                availableItems={allProducts}
                selectedItems={allProducts.filter((p) =>
                  form.target_data.includes(p.id)
                )}
                setSelectedItems={(items) =>
                  setForm({ ...form, target_data: items.map((i) => i.id) })
                }
                idKey="id"
                nameKey="name"
                height="320px"
              />
            ) : form.promotion_type === "CATEGORY" ? (
              <DualListBox
                availableItems={allCategories}
                selectedItems={allCategories.filter((c) =>
                  form.target_data.includes(c.id)
                )}
                setSelectedItems={(items) =>
                  setForm({ ...form, target_data: items.map((i) => i.id) })
                }
                idKey="id"
                nameKey="name"
                height="320px"
              />
            ) : (
              <div className="py-20 text-center border-2 border-dashed border-gray-100 rounded-2xl">
                <p className="text-gray-400 font-medium">
                  Please select a targeting type above to load items
                </p>
              </div>
            )}
            {errors.target_data && (
              <p className="text-red-500 text-xs mt-3 font-medium text-center">
                {errors.target_data}
              </p>
            )}
          </section>
        </div>

        {/* RIGHT COLUMN: CONFIGURATION */}
        <div className="space-y-6">
          <section className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            <h3 className="flex items-center gap-2 text-sm font-bold text-gray-400 uppercase tracking-widest mb-6">
              <Tag size={16} /> Discount Config
            </h3>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-1">
                  <label className="text-xs font-bold text-gray-500 mb-1 block">
                    Type
                  </label>
                  <select
                    name="discount_type"
                    value={form.discount_type}
                    onChange={handleChange}
                    className="w-full border-2 border-gray-200 bg-gray-50 p-3 rounded-xl text-sm font-semibold outline-none focus:border-primary"
                  >
                    <option value="">Choose</option>
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FLAT">Flat Amount (₹)</option>
                  </select>
                </div>
                <div className="col-span-1">
                  <label className="text-xs font-bold text-gray-500 mb-1 block">
                    Value
                  </label>
                  <input
                    type="number"
                    name="discount_value"
                    value={form.discount_value}
                    onChange={handleChange}
                    className="w-full border-2 border-gray-200 bg-gray-50 p-3 rounded-xl outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 mb-1 block">
                  Min Order Value (₹)
                </label>
                <input
                  type="number"
                  name="min_order_value"
                  value={form.min_order_value}
                  onChange={handleChange}
                  className="w-full border-2 border-gray-200 bg-gray-50 p-3 rounded-xl outline-none focus:border-primary"
                />
              </div>
            </div>
          </section>

          <section className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            <h3 className="flex items-center gap-2 text-sm font-bold text-gray-400 uppercase tracking-widest mb-6">
              <Calendar size={16} /> Schedule
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-500 mb-1 block">
                  Starts On
                </label>
                <input
                  type="date"
                  name="start_date"
                  value={form.start_date}
                  onChange={handleChange}
                  className="w-full border-2 border-gray-200 bg-gray-50 p-3 rounded-xl outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 mb-1 block">
                  Ends On
                </label>
                <input
                  type="date"
                  name="end_date"
                  value={form.end_date}
                  onChange={handleChange}
                  className="w-full border-2 border-gray-200 bg-gray-50 p-3 rounded-xl outline-none focus:border-primary"
                />
              </div>
            </div>
          </section>

          {/* ACTION BUTTONS */}
          <div className="flex flex-col gap-3">
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-primary text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-primary-dark shadow-lg shadow-primary/20 transition-all disabled:opacity-50"
            >
              {loading ? (
                "Processing..."
              ) : (
                <>
                  <Save size={20} /> Launch Promotion
                </>
              )}
            </button>
            <button
              onClick={handleReset}
              className="w-full bg-gray-100 text-gray-500 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-gray-200 transition-all"
            >
              <RotateCcw size={18} /> Reset All
            </button>
          </div>
          {error && (
            <p className="text-red-500 text-xs text-center font-bold bg-red-50 p-3 rounded-xl">
              {error}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// import { useEffect, useState } from "react";
// import AdminHeaderWrapper from "../../../components/admin/AdminHeaderWrapper";
// import DualListBox from "./DualListBox";
// import allCategories from "../../../utils/admin/allcategories";
// import allProducts from "../../../utils/admin/allProducts";

// // ---- Dummy Categories & Products ----
// // const categories = [
// //   { id: 1, name: "Rice Products" },
// //   { id: 2, name: "Sweeteners" },
// // ];

// // const products = [
// //   { id: 1, name: "Onions", sku: "VEG-1" },
// //   { id: 2, name: "Premium Rice", sku: "RICE-2" },
// //   { id: 3, name: "Chicken Breast", sku: "MEAT-3" },
// // ];
// const categories = [...allCategories];
// const products = [...allProducts];

// const wrapperData = {
//   title: "Create Promotion / Coupon",
//   description: "Create product, category, cart or shipping promotions",
//   breadcrumb: [
//     { label: "Dashboard", to: "/admin" },
//     { label: "Promotions", to: "/admin/promotions" },
//     { label: "Create", to: "/admin/promotions/new" },
//   ],
// };

// export default function CreateNewPromotion() {
//   const [form, setForm] = useState({
//     name: "",
//     promotion_type: "",
//     discount_type: "",
//     discount_value: "",
//     minimum_order_value: "",
//     start_date: "",
//     end_date: "",
//     product_ids: [],
//     category_ids: [],
//   });

//   const [errors, setErrors] = useState({});

//   // ---------------- Handlers ----------------
//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setForm((prev) => ({ ...prev, [name]: value }));
//   };

//   const validate = () => {
//     const err = {};

//     if (!form.name.trim()) err.name = "Promotion name is required";
//     if (!form.promotion_type) err.promotion_type = "Promotion type is required";
//     if (!form.discount_type) err.discount_type = "Discount type is required";
//     if (!form.discount_value) err.discount_value = "Discount value is required";
//     if (!form.start_date) err.start_date = "Start date is required";
//     if (!form.end_date) err.end_date = "End date is required";

//     if (form.promotion_type === "PRODUCT" && form.product_ids.length === 0) {
//       err.product_ids = "Select at least one product";
//     }

//     if (form.promotion_type === "CATEGORY" && form.category_ids.length === 0) {
//       err.category_ids = "Select at least one category";
//     }

//     setErrors(err);
//     return Object.keys(err).length === 0;
//   };

//   const handleSubmit = () => {
//     if (!validate()) return;

//     const payload = {
//       ...form,
//       discount_value: Number(form.discount_value),
//     };

//     console.log("CREATE PROMOTION PAYLOAD 👉", payload);
//     alert("Promotion created successfully! (check console)");
//   };

//   const handleReset = () => {
//     setErrors({});
//     setForm((prev) => ({
//       name: "",
//       promotion_type: "",
//       discount_type: "",
//       discount_value: "",
//       minimum_order_value: "",
//       start_date: "",
//       end_date: "",
//       product_ids: [],
//       category_ids: [],
//     }));
//     console.log(" The Rest Button got clicked");
//   };
//   useEffect(() => {
//     console.log("form :", form);
//   }, [form]);
//   // ---------------- Render ----------------
//   return (
//     <>
//       <AdminHeaderWrapper {...wrapperData} />

//       <div className="bg-white p-6 rounded-2xl shadow space-y-6">
//         {/* Promotion Name */}
//         <div>
//           <label className="font-medium">Promotion Name *</label>
//           <input
//             name="name"
//             value={form.name}
//             onChange={handleChange}
//             className="w-full border-2 p-3 rounded-xl"
//           />
//           {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
//         </div>

//         {/* Promotion Type */}
//         <div>
//           <label className="font-medium">Promotion Type *</label>
//           <select
//             name="promotion_type"
//             value={form.promotion_type}
//             onChange={handleChange}
//             className="w-full border-2 p-3 rounded-xl"
//           >
//             <option value="">Select Type</option>
//             <option value="PRODUCT">Product</option>
//             <option value="CATEGORY">Category</option>
//             <option value="CART">Cart</option>
//             <option value="SHIPPING">Shipping</option>
//           </select>
//           {errors.promotion_type && (
//             <p className="text-red-500 text-sm">{errors.promotion_type}</p>
//           )}
//         </div>

//         {/* Discount */}
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//           <div>
//             <label className="font-medium">Discount Type *</label>
//             <select
//               name="discount_type"
//               value={form.discount_type}
//               onChange={handleChange}
//               className="w-full border-2 p-3 rounded-xl"
//             >
//               <option value="">Select</option>
//               <option value="PERCENTAGE">Percentage</option>
//               <option value="FLAT">Flat</option>
//             </select>
//             {errors.discount_type && (
//               <p className="text-red-500 text-sm">{errors.discount_type}</p>
//             )}
//           </div>

//           <div>
//             <label className="font-medium">Discount Value *</label>
//             <input
//               type="number"
//               name="discount_value"
//               value={form.discount_value}
//               onChange={handleChange}
//               className="w-full border-2 p-3 rounded-xl"
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
//             onChange={handleChange}
//             className="w-full border-2 p-3 rounded-xl"
//           />
//         </div>
//         {/* Dates */}
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//           <div>
//             <label className="font-medium">Start Date *</label>
//             <input
//               type="date"
//               name="start_date"
//               value={form.start_date}
//               onChange={handleChange}
//               className="w-full border-2 p-3 rounded-xl"
//             />
//             {errors.start_date && (
//               <p className="text-red-500 text-sm">{errors.start_date}</p>
//             )}
//           </div>

//           <div>
//             <label className="font-medium">End Date *</label>
//             <input
//               type="date"
//               name="end_date"
//               value={form.end_date}
//               onChange={handleChange}
//               className="w-full border-2 p-3 rounded-xl"
//             />
//             {errors.end_date && (
//               <p className="text-red-500 text-sm">{errors.end_date}</p>
//             )}
//           </div>
//         </div>

//         {/* PRODUCT Promotion */}
//         {form.promotion_type === "PRODUCT" && (
//           <div>
//             <p className="font-medium mb-2">Select Products *</p>

//             <DualListBox
//               availableItems={products}
//               selectedItems={products.filter((p) =>
//                 form.product_ids.includes(p.id)
//               )}
//               setSelectedItems={(items) =>
//                 setForm((prev) => ({
//                   ...prev,
//                   product_ids: items.map((i) => i.id),
//                 }))
//               }
//               idKey="id"
//               nameKey="name"
//               height="320px"
//             />

//             {errors.product_ids && (
//               <p className="text-red-500 text-sm">{errors.product_ids}</p>
//             )}
//           </div>
//         )}

//         {/* CATEGORY Promotion */}
//         {form.promotion_type === "CATEGORY" && (
//           <div>
//             <p className="font-medium mb-2">Select Categories *</p>

//             <DualListBox
//               availableItems={categories}
//               selectedItems={categories.filter((c) =>
//                 form.category_ids.includes(c.id)
//               )}
//               setSelectedItems={(items) =>
//                 setForm((prev) => ({
//                   ...prev,
//                   category_ids: items.map((i) => i.id),
//                 }))
//               }
//               idKey="id"
//               nameKey="name"
//               height="320px"
//             />

//             {errors.category_ids && (
//               <p className="text-red-500 text-sm">{errors.category_ids}</p>
//             )}
//           </div>
//         )}

//         {/* Submit */}
//         <div className="pt-4">
//           <button
//             type="button"
//             onClick={handleSubmit}
//             className="bg-primary text-white px-8 py-3 rounded-xl hover:bg-primary-dark"
//           >
//             Create Promotion
//           </button>
//           <button
//             type="reset"
//             onClick={handleReset}
//             className="bg-secondary text-white ms-3 px-8 py-3 rounded-xl hover:bg-secondary-dark"
//           >
//             Reset Promotion
//           </button>
//         </div>
//       </div>
//     </>
//   );
// }

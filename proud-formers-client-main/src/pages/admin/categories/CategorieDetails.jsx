// src/pages/admin/categories/CategoryDetails.jsx
import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  Pencil,
  Trash2,
  Save,
  X,
  LayoutGrid,
  Info,
  Tag,
  FileText,
  Calendar,
  Layers,
} from "lucide-react";
import AdminHeaderWrapper from "../../../components/admin/AdminHeaderWrapper";
import { useAdminProductStore } from "../../../store/admin/AdminProductStore";

export default function CategoryDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [editMode, setEditMode] = useState(false);
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState({ name: "", description: "" });

  const { fetchCategoryById, selectedCategory, loading, error } =
    useAdminProductStore();

  useEffect(() => {
    fetchCategoryById(id);
  }, [id, fetchCategoryById]);

  useEffect(() => {
    if (selectedCategory) {
      setForm({
        name: selectedCategory.name || "",
        description: selectedCategory.description || "",
      });
    }
  }, [selectedCategory]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        <p className="text-sm font-black text-gray-400 uppercase tracking-widest">
          Retrieving Dossier...
        </p>
      </div>
    );
  }

  if (error || !selectedCategory) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <div className="p-4 bg-red-50 text-red-500 rounded-3xl">
          <Info size={40} />
        </div>
        <p className="text-xl font-black text-gray-800">Category Not Found</p>
        <button
          onClick={() => navigate("/admin/categories")}
          className="text-primary font-bold hover:underline"
        >
          Return to Directory
        </button>
      </div>
    );
  }

  const validate = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = "Category name is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    console.log("Updated Category:", form);
    // TODO: API PUT request here
    setEditMode(false);
  };

  const handleReset = () => {
    setForm({
      name: selectedCategory.name || "",
      description: selectedCategory.description || "",
    });
    setErrors({});
    setEditMode(false);
  };

  const handleDelete = () => {
    if (
      !window.confirm(
        "Are you sure you want to delete this category? All linked products will be unassigned."
      )
    )
      return;
    console.log("Deleted Category ID:", id);
    navigate("/admin/categories");
  };

  return (
    <div className="pb-10">
      {/* <div className="flex flex-col md:flex-row md:items-center justify-between gap-4"> */}
      <div className="md:flex justify-between items-center">
        <AdminHeaderWrapper
          title={`Category Dossier`}
          description="Management and metadata for specific product classification."
          breadcrumb={[
            { label: "Dashboard", to: "/admin" },
            { label: "Categories", to: "/admin/categories" },
            { label: `#${id.slice(-5)}` },
          ]}
        />

        {/* <div className="flex gap-3 self-end"> */}
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
              onClick={handleSubmit}
              className="bg-primary text-white px-6 py-3 rounded-2xl cursor-pointer font-black text-xs uppercase tracking-widest hover:bg-primary-dark transition-all flex items-center gap-2 shadow-lg shadow-primary/20"
            >
              <Save size={16} /> Save
            </button>
          )}
          <button
            onClick={handleDelete}
            className="bg-red-50 text-red-600 px-6 py-3 rounded-2xl cursor-pointer font-black text-xs uppercase tracking-widest hover:bg-red-100 transition-all flex items-center gap-2"
          >
            <Trash2 size={16} /> Delete
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8 mt-8">
        {/* MAIN DATA FORM */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 border-b border-gray-50 pb-6 mb-8">
              <div className="p-3 bg-primary/10 text-primary rounded-2xl">
                <LayoutGrid size={24} />
              </div>
              <div>
                <h3 className="text-lg font-black text-gray-800">
                  Primary Configuration
                </h3>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em] mt-0.5">
                  Basic Identification
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                  Category Name
                </label>
                <div className="relative group">
                  <Tag
                    className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${
                      editMode ? "text-primary" : "text-gray-300"
                    }`}
                    size={18}
                  />
                  <input
                    type="text"
                    disabled={!editMode}
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className={`w-full pl-12 pr-4 py-4 rounded-2xl text-sm font-bold transition-all outline-none border-2 border-gray-200 
                      ${
                        editMode
                          ? "bg-gray-50 ring-2 ring-primary/10 focus:ring-primary/30"
                          : "bg-transparent text-gray-500 cursor-not-allowed"
                      }`}
                  />
                </div>
                {errors.name && (
                  <p className="text-red-500 text-[10px] font-black uppercase tracking-tight ml-2">
                    {errors.name}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                  Description
                </label>
                <div className="relative group">
                  <FileText
                    className={`absolute left-4 top-5 transition-colors ${
                      editMode ? "text-primary" : "text-gray-300"
                    }`}
                    size={18}
                  />
                  <textarea
                    rows="5"
                    disabled={!editMode}
                    value={form.description}
                    onChange={(e) =>
                      setForm({ ...form, description: e.target.value })
                    }
                    className={`w-full pl-12 pr-4 py-4 rounded-2xl text-sm font-medium transition-all outline-none border-2 border-gray-200 resize-none
                      ${
                        editMode
                          ? "bg-gray-50 ring-2 ring-primary/10 focus:ring-primary/30"
                          : "bg-transparent text-gray-500 cursor-not-allowed"
                      }`}
                  />
                </div>
              </div>

              {editMode && (
                <div className="flex items-center gap-4 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-primary text-white cursor-pointer font-black py-4 rounded-2xl shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all"
                  >
                    Commit Changes
                  </button>
                  <button
                    type="button"
                    onClick={handleReset}
                    className="px-8 py-4 bg-gray-100 text-gray-600 font-bold cursor-pointer rounded-2xl hover:bg-gray-200 transition-all flex items-center gap-2"
                  >
                    <X size={18} /> Cancel
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>

        {/* SIDEBAR METADATA */}
        <div className="space-y-6">
          <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-6">
              Metadata
            </h4>

            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400">
                  <Layers size={18} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">
                    Unique Identifier
                  </p>
                  <p className="text-sm font-black text-gray-800">
                    #{id.slice(-8).toUpperCase()}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400">
                  <Calendar size={18} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">
                    System Created
                  </p>
                  <p className="text-sm font-black text-gray-800">
                    {selectedCategory.created_at || "N/A"}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-gray-50">
              <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10 text-center">
                <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">
                  Status
                </p>
                <div className="flex items-center justify-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-sm font-black text-gray-800">
                    Active Category
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 bg-gradient-to-br from-gray-800 to-gray-900 rounded-[2rem] text-white">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-white/10 rounded-lg">
                <Info size={16} className="text-primary" />
              </div>
              <p className="text-xs font-black uppercase tracking-widest">
                Admin Note
              </p>
            </div>
            <p className="text-xs text-gray-400 font-medium leading-relaxed">
              Modifying the category name will update all live listings
              instantly. Ensure SEO keywords are maintained.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// import { useNavigate, useParams } from "react-router-dom";
// import { useState, useEffect } from "react";
// import { Pencil, Trash2, Save } from "lucide-react";
// import AdminHeaderWrapper from "../../../components/admin/AdminHeaderWrapper";
// import { fetchCategoryDetailsById } from "../../../utils/admin/categories";
// import { useAdminProductStore } from "../../../store/admin/AdminProductStore";
// export default function CategoryDetails() {
//   const { id } = useParams();
//   const navigate = useNavigate();

//   const [categoryDetail, setCategoryDetail] = useState(null);
//   const [editMode, setEditMode] = useState(false);
//   const [errors, setErrors] = useState({});

//   const [form, setForm] = useState({
//     name: "",
//     description: "",
//   });

//   const { fetchCategoryById, selectedCategory, loading, error } =
//     useAdminProductStore();

//   // ✅ FETCH CATEGORY
//   useEffect(() => {
//     fetchCategoryById(id);
//   }, [id]);

//   useEffect(() => {
//     if (selectedCategory) {
//       setCategoryDetail(selectedCategory);
//       setForm({
//         name: selectedCategory.name || "",
//         description: selectedCategory.description || "",
//       });
//     }
//   }, [selectedCategory]);
//   console.log(" setCategory details data :", categoryDetail);
//   // ✅ LOADING STATE
//   if (loading || !categoryDetail) {
//     return <div className="p-6">Loading category...</div>;
//   }

//   // ✅ NOT FOUND STATE
//   if (!categoryDetail || error) {
//     return <div className="p-6 text-red-600">Category not found</div>;
//   }

//   const validate = () => {
//     const newErrors = {};

//     if (!form.name.trim()) newErrors.name = "Category name is required";
//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };
//   // ------------------------------------
//   // Handlers
//   // ------------------------------------

//   const updateField = (field, value) => {
//     setForm((prev) => ({ ...prev, [field]: value }));
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();

//     if (!validate()) return;

//     console.log("Updated Category:", form);

//     // TODO: API PUT request here
//     setEditMode(false);
//   };

//   const handleReset = () => {
//     setForm({ name: "", description: "" });
//     setErrors({});
//   };

//   const handleDelete = () => {
//     if (!window.confirm("Are you sure you want to delete this category?"))
//       return;

//     console.log("Deleted Category ID:", id);

//     // TODO: API DELETE request here

//     navigate("/admin/categories");
//   };

//   return (
//     <div className="categorie-details p-2 md:p-4 mx-auto">
//       {/* Header & Actions */}
//       {/* HEADER */}
//       <div className="md:flex justify-between items-center">
//         <AdminHeaderWrapper
//           title={`Category #${categoryDetail.id}`}
//           description="View / Edit Category details"
//           breadcrumb={[
//             { label: "Dashboard", to: "/admin" },
//             { label: "Categories", to: "/admin/categories" },
//             { label: categoryDetail.id },
//           ]}
//         />

//         <div className="flex gap-3 justify-end mb-3 mb:mb-0">
//           {!editMode ? (
//             <button
//               type="button"
//               onClick={() => setEditMode(true)}
//               className="border bg-primary-light cursor-pointer text-white px-4 py-2 rounded-lg flex items-center gap-2"
//             >
//               <Pencil size={16} /> Edit
//             </button>
//           ) : (
//             <button
//               type="button"
//               onClick={handleSubmit}
//               className="bg-primary text-white px-4 py-2 rounded-lg flex items-center gap-2"
//             >
//               <Save size={16} /> Save
//             </button>
//           )}

//           <button
//             type="button"
//             onClick={handleDelete}
//             className="border border-red-500 text-red-600 px-4 py-2 rounded-lg flex items-center gap-2"
//           >
//             <Trash2 size={16} /> Delete
//           </button>
//         </div>
//       </div>
//       <div className="w-full mx-auto bg-white shadow p-6 rounded-2xl">
//         <form onSubmit={handleSubmit} className="space-y-6">
//           {/* Name */}
//           <div>
//             <label htmlFor="category_name" className="block font-medium mb-1">
//               Category Name *
//             </label>
//             <input
//               id="category_name"
//               type="text"
//               disabled={!editMode}
//               value={form.name}
//               name="name"
//               onChange={(e) => updateField("name", e.target.value)}
//               placeholder="Enter category name"
//               className={`w-full p-3 border-2 border-secondary-light rounded-xl focus:outline-none focus:ring-2 ${
//                 errors.name
//                   ? "border-red-500 focus:ring-red-400"
//                   : "focus:ring-primary"
//               }`}
//             />
//             {errors.name && (
//               <p className="text-red-500 text-sm mt-1">{errors.name}</p>
//             )}
//           </div>

//           {/* Description */}
//           <div>
//             <label
//               htmlFor="categorie_description"
//               className="block font-medium mb-1"
//             >
//               Description
//             </label>
//             <textarea
//               id="categorie_description"
//               value={form.description}
//               disabled={!editMode}
//               onChange={(e) => updateField("description", e.target.value)}
//               placeholder="Enter description"
//               name="description"
//               rows="4"
//               className="w-full p-3 border-2 border-secondary-light rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
//             />
//           </div>

//           {/* Buttons */}
//           <div className="flex flex-col md:flex-row gap-4">
//             <button
//               disabled={!editMode}
//               type="submit"
//               className="bg-primary cursor-pointer hover:bg-primary-dark text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors w-full md:w-auto justify-center"
//             >
//               Save Changes
//             </button>

//             <button
//               type="button"
//               disabled={!editMode}
//               onClick={handleReset}
//               className="bg-gray-200 cursor-pointer hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg w-full md:w-auto transition-colors"
//             >
//               Cancel
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// }

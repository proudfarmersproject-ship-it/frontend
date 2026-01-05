// src/pages/admin/categories/AddNewCategory.jsx
import { useState } from "react";
import {
  Tag,
  FileText,
  LayoutGrid,
  Plus,
  RotateCcw,
  AlertCircle,
} from "lucide-react";
import AdminHeaderWrapper from "../../../components/admin/AdminHeaderWrapper";

const wrapperData = {
  title: "Create Category",
  description:
    "Organize your inventory by adding a new product classification.",
  breadcrumb: [
    { label: "Dashboard", to: "/admin" },
    { label: "Categories", to: "/admin/categories" },
    { label: "New Category", to: "/admin/categories/new" },
  ],
};

export default function AddNewCategory() {
  const [form, setForm] = useState({
    name: "",
    description: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!form.name.trim()) {
      newErrors.name = "Category name is required";
    } else if (form.name.length < 3) {
      newErrors.name = "Name must be at least 3 characters";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    // Simulate API Call
    console.log("Submitting:", form);
    setTimeout(() => setIsSubmitting(false), 1000);
  };

  const handleReset = () => {
    setForm({ name: "", description: "" });
    setErrors({});
  };

  return (
    <div className="pb-10">
      <AdminHeaderWrapper {...wrapperData} />

      <div className="grid lg:grid-cols-3 gap-8 mt-6">
        {/* LEFT COLUMN: Main Form */}
        <div className="lg:col-span-2">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 border-b border-gray-50 pb-5 mb-8">
              <div className="p-2.5 bg-primary/10 text-primary rounded-2xl">
                <LayoutGrid size={22} />
              </div>
              <div>
                <h2 className="text-xl font-black text-gray-800 tracking-tight">
                  Category Details
                </h2>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-0.5">
                  Define your taxonomy
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Category Name */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                  Category Identifier *
                </label>
                <div className="relative group">
                  <Tag
                    className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${
                      errors.name
                        ? "text-red-400"
                        : "text-gray-400 group-focus-within:text-primary"
                    }`}
                    size={18}
                  />
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => updateField("name", e.target.value)}
                    placeholder="e.g. Organic Vegetables"
                    className={`w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-200 rounded-2xl text-sm font-bold transition-all outline-none 
                      ${
                        errors.name
                          ? "ring-2 ring-red-100 bg-red-50"
                          : "focus:ring-2 focus:ring-primary/20 hover:bg-gray-100/50"
                      }`}
                  />
                </div>
                {errors.name && (
                  <div className="flex items-center gap-1.5 text-red-500 ml-2 mt-1">
                    <AlertCircle size={12} />
                    <p className="text-[10px] font-black uppercase tracking-tight">
                      {errors.name}
                    </p>
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                  Scope & Description
                </label>
                <div className="relative group">
                  <FileText
                    className="absolute left-4 top-5 text-gray-400 group-focus-within:text-primary transition-colors"
                    size={18}
                  />
                  <textarea
                    rows="5"
                    value={form.description}
                    onChange={(e) => updateField("description", e.target.value)}
                    placeholder="What kind of products belong here?"
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-200 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-none hover:bg-gray-100/50 transition-all resize-none"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-primary hover:bg-primary-dark text-white font-black py-4 rounded-2xl shadow-xl shadow-primary/20 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Plus size={20} />
                  )}
                  Initialize Category
                </button>

                <button
                  type="button"
                  onClick={handleReset}
                  className="px-8 py-4 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold rounded-2xl transition-colors flex items-center justify-center gap-2"
                >
                  <RotateCcw size={18} />
                  Reset
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* RIGHT COLUMN: Live Preview & Tips */}
        <div className="space-y-6">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 overflow-hidden relative group">
            <div className="absolute top-0 right-0 p-4 opacity-[0.03] -rotate-12 transition-transform group-hover:rotate-0">
              <LayoutGrid size={120} />
            </div>

            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-6">
              Live Preview
            </h3>

            <div className="p-6 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 min-h-[160px] flex flex-col justify-center text-center">
              {form.name ? (
                <>
                  <h4 className="text-2xl font-black text-primary truncate">
                    {form.name}
                  </h4>
                  <p className="text-gray-500 text-xs font-medium mt-2 line-clamp-3 leading-relaxed">
                    {form.description || "No description provided yet..."}
                  </p>
                </>
              ) : (
                <div className="text-gray-300 italic text-sm font-medium">
                  Start typing to see preview...
                </div>
              )}
            </div>
          </div>

          <div className="bg-primary/5 p-8 rounded-3xl border border-primary/10">
            <h4 className="text-xs font-black text-primary uppercase tracking-widest mb-3 flex items-center gap-2">
              <AlertCircle size={14} /> Taxonomy Tip
            </h4>
            <p className="text-xs text-primary/70 font-medium leading-relaxed">
              Keep category names concise. Well-defined categories help
              customers find products 30% faster in the mobile application.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// src/pages/admin/categories/ViewAllCategories.jsx
import { useState, useMemo, useEffect } from "react";
import {
  Plus,
  Search,
  Eye,
  Trash2,
  Folder,
  LayoutGrid,
  ArrowUpDown,
  FilterX,
  Calendar,
  Layers,
} from "lucide-react";
import { Link } from "react-router-dom";
import Pagination from "../../../components/admin/Pagination";
import AdminHeaderWrapper from "../../../components/admin/AdminHeaderWrapper";
import { useAdminProductStore } from "../../../store/admin/AdminProductStore";

const wrapperData = {
  title: "Category Management",
  description:
    "Organize and classify your product inventory for better discoverability.",
  breadcrumb: [
    { label: "Dashboard", to: "/admin" },
    { label: "Categories", to: "/admin/categories" },
  ],
};

export default function ViewAllCategories() {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("name-asc");
  const [perPage, setPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const { fetchCategories, categoriesData, loading } = useAdminProductStore();

  useEffect(() => {
    const loadData = async () => {
      try {
        await fetchCategories();
      } catch (err) {
        console.error("Error while Fetching data ", err);
      }
    };
    loadData();
  }, [fetchCategories]);

  // Filtering Logic
  const filtered = useMemo(() => {
    if (!categoriesData) return [];
    return categoriesData.filter((c) =>
      c.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [categoriesData, search]);

  // Sorting Logic
  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      if (sort === "name-asc") return a.name.localeCompare(b.name);
      if (sort === "name-desc") return b.name.localeCompare(a.name);
      if (sort === "latest") return b.id - a.id;
      return 0;
    });
  }, [filtered, sort]);

  // Pagination Logic
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * perPage;
    return sorted.slice(start, start + Number(perPage));
  }, [sorted, currentPage, perPage]);

  const handleDelete = (category) => {
    if (
      window.confirm(
        `Are you sure you want to delete "${category.name}"? This will affect all associated products.`
      )
    ) {
      console.log("Delete logic here for ID:", category.id);
    }
  };

  const resetFilters = () => {
    setSearch("");
    setSort("name-asc");
    setCurrentPage(1);
  };

  return (
    <div className="pb-10">
      <AdminHeaderWrapper {...wrapperData} />

      <div className="space-y-6">
        {/* --- SMART FILTERS --- */}
        <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex flex-1 w-full md:w-auto gap-4">
            <div className="relative flex-1 max-w-md group">
              <Search className="absolute left-4 top-1/3 -translate-y-1-2 w-4 h-4 text-gray-400 group-focus-within:text-primary transition-colors" />
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Find a category..."
                className="w-full pl-11 pr-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              />
            </div>

            <div className="relative">
              <ArrowUpDown className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="pl-11 pr-8 py-3 bg-gray-50 border-2 border-gray-200 rounded-2xl text-sm font-bold text-gray-600 focus:ring-2 focus:ring-primary/20 outline-none cursor-pointer appearance-none min-w-[180px]"
              >
                <option value="name-asc">Alphabetical (A-Z)</option>
                <option value="name-desc">Alphabetical (Z-A)</option>
                <option value="latest">Recently Added</option>
              </select>
            </div>
          </div>

          <Link
            to="/admin/categories/new"
            className="w-full md:w-auto bg-primary hover:bg-primary-dark text-white px-6 py-3.5 rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-primary/20 transition-all active:scale-95"
          >
            <Plus size={18} /> New Category
          </Link>
        </div>

        {/* --- CATEGORIES TABLE --- */}
        <div className="bg-white p-4 rounded-3xl shadow mt-6 border-gray-100">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-left text-gray-600 text-sm uppercase tracking-wider border-b">
                  <th className="p-4 font-bold">Classification</th>
                  <th className="p-4 font-bold">Brief Overview</th>
                  <th className="p-4 font-bold">Metrics/Dates</th>
                  <th className="p-4 font-bold text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-300 border-b border-gray-300">
                {loading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={4} className="px-6 py-6">
                        <div className="h-12 bg-gray-100 rounded-2xl w-full"></div>
                      </td>
                    </tr>
                  ))
                ) : paginated.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-24 text-center">
                      <div className="flex flex-col items-center text-gray-400">
                        <FilterX size={64} className="mb-4 opacity-10" />
                        <p className="text-xl font-black text-gray-800">
                          Category not found
                        </p>
                        <p className="text-sm font-medium mt-1">
                          Refine your search or create a new entry.
                        </p>
                        <button
                          onClick={resetFilters}
                          className="mt-4 text-primary font-black text-xs uppercase tracking-widest hover:underline"
                        >
                          Reset Filter Dashboard
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginated.map((cat) => (
                    <tr
                      key={cat.id}
                      className="hover:bg-gray-50/80 transition-colors group"
                    >
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                          <div className="w-11 h-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shadow-sm transition-transform group-hover:rotate-6 group-hover:scale-110">
                            <Folder
                              size={20}
                              fill="currentColor"
                              fillOpacity={0.2}
                            />
                          </div>
                          <div>
                            <p className="font-black text-gray-800 text-sm">
                              {cat.name}
                            </p>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter mt-0.5 flex items-center gap-1">
                              <Layers size={10} /> ID: #
                              {cat.id?.toString().slice(-5)}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <p className="text-xs text-gray-500 font-medium line-clamp-2 max-w-xs leading-relaxed italic">
                          "{cat.description || "No description provided."}"
                        </p>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2 text-gray-400">
                          <Calendar size={14} className="shrink-0" />
                          <span className="text-xs font-bold uppercase tracking-tight">
                            {cat.created_at || "Legacy Entry"}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex justify-center items-center gap-2">
                          <Link
                            to={`/admin/categories/${cat.id}`}
                            className="text-blue-600 hover:bg-blue-50 p-2 rounded-lg border border-blue-100"
                            title="Edit Category"
                          >
                            <Eye size={20} />
                          </Link>
                          <button
                            onClick={() => handleDelete(cat)}
                            className="text-red-600 hover:bg-red-50 p-2 rounded-lg border border-red-100 cursor-pointer"
                            title="Remove Category"
                          >
                            <Trash2 size={20} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* --- FOOTER / PAGINATION --- */}
          <div className="px-6 py-4 bg-gray-50/30 border-t border-gray-100">
            <Pagination
              totalItems={sorted.length}
              currentPage={currentPage}
              perPage={perPage}
              onPageChange={setCurrentPage}
              onPerPageChange={setPerPage}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// import { useState, useMemo, useEffect } from "react";
// import { Plus, Search, ChevronDown, Eye, Trash2 } from "lucide-react";
// import { Link } from "react-router-dom";
// import Pagination from "../../../components/admin/Pagination";
// import AdminHeaderWrapper from "../../../components/admin/AdminHeaderWrapper";
// const wrapperData = {
//   title: "List Category",
//   description: "These are the List of categories",
//   breadcrumb: [
//     { label: "Dashboard", to: "/admin" },
//     { label: "Categories List", to: "/admin/categories" },
//   ],
// };
// import { useAdminProductStore } from "../../../store/admin/AdminProductStore";

// export default function ViewAllCategories() {
//   const [search, setSearch] = useState("");
//   const [sort, setSort] = useState("name-asc");
//   const [perPage, setPerPage] = useState(10);
//   const [currentPage, setCurrentPage] = useState(1);
//   const { fetchCategories, categoriesData } = useAdminProductStore();

//   const loadData = async () => {
//     try {
//       await fetchCategories();
//     } catch (err) {
//       console.log("Error while Fetching data ", err);
//     }
//   };
//   useEffect(() => {
//     loadData();
//   }, []);

//   // Filtering
//   const filtered = useMemo(() => {
//     return categoriesData.filter((c) =>
//       c.name.toLowerCase().includes(search.toLowerCase())
//     );
//   }, [categoriesData, search]);

//   // Sorting
//   const sorted = useMemo(() => {
//     return [...filtered].sort((a, b) => {
//       if (sort === "name-asc") return a.name.localeCompare(b.name);
//       if (sort === "name-desc") return b.name.localeCompare(a.name);
//       if (sort === "latest") return b.id - a.id;
//       return 0;
//     });
//   }, [filtered, sort]);

//   // Pagination Logic

//   const start = useMemo(() => {
//     return (currentPage - 1) * perPage;
//   }, [currentPage, perPage]);

//   const paginated = useMemo(() => {
//     return sorted.slice(start, start + Number(perPage));
//   }, [sorted, start, perPage]);

//   // Handle the events
//   // const handlePerPage = (e) => {
//   //   setPerPage(e.target.value);
//   // };
//   // const handlePage = (num) => {
//   //   setPage(num);
//   // };
//   const handleSort = (e) => {
//     setSort(e.target.value);
//   };
//   const handleSearch = (e) => {
//     setSearch(e.target.value);
//   };
//   const handleDelete = (categorie) => {
//     alert(`Delete ID ${categorie.id}`);

//     /// Remove the sorted Data
//   };
//   return (
//     <>
//       <AdminHeaderWrapper
//         title={wrapperData.title}
//         description={wrapperData.description}
//         breadcrumb={wrapperData.breadcrumb}
//       />
//       <div className="w-full space-y-6">
//         {/* Filters + Create Button */}
//         <div className="bg-[var(--color-surface)] p-4 rounded-2xl shadow flex flex-col md:flex-row md:items-center md:justify-between gap-4">
//           {/* Left Filters */}
//           <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
//             {/* Search */}
//             <div className="relative w-full md:w-64">
//               <Search className="absolute left-3 top-3 text-gray-500 w-5 h-5" />
//               <input
//                 type="text"
//                 placeholder="Search categories..."
//                 value={search}
//                 onChange={handleSearch}
//                 className="w-full pl-10 pr-3 py-2 border rounded-xl focus:ring-2 focus:ring-primary bg-white"
//               />
//             </div>

//             {/* Sort Filter */}
//             <select
//               value={sort}
//               onChange={handleSort}
//               className="border cursor-pointer px-3 py-2 rounded-xl focus:ring-2 focus:ring-primary bg-white"
//             >
//               <option value="name-asc">Name (A → Z)</option>
//               <option value="name-desc">Name (Z → A)</option>
//               <option value="latest">Latest First</option>
//             </select>
//           </div>

//           {/* Right Add New */}
//           <Link
//             to="/admin/categories/new"
//             className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-colors w-full md:w-auto justify-center"
//           >
//             <Plus size={18} /> Add New Category
//           </Link>
//         </div>

//         {/* Categories Table */}
//         <div className="bg-[var(--color-surface)] p-4 rounded-2xl shadow">
//           <div className="overflow-x-auto py-2">
//             <table className="w-full min-w-[600px]">
//               <thead>
//                 <tr className="text-left bg-[var(--color-muted-bg)]">
//                   {/* <th className="p-3">Image</th> */}
//                   <th className="p-3">Id</th>
//                   <th className="p-3">Name</th>
//                   <th className="p-3">Description</th>
//                   <th className="p-3">Created At</th>
//                   <th className="p-3 text-center">Actions</th>
//                 </tr>
//               </thead>

//               <tbody>
//                 {paginated.length === 0 ? (
//                   <tr>
//                     <td className="col-span-full text-center py-8 text-text-muted">
//                       No categories found
//                     </td>
//                   </tr>
//                 ) : (
//                   paginated.map((cat) => (
//                     <tr
//                       key={cat.id}
//                       className="border-b odd:bg-white even:bg-gray-50 hover:bg-gray-100"
//                     >
//                       <td className="p-3 font-medium">{cat.id}</td>
//                       <td className="p-3 font-medium">{cat.name}</td>
//                       <td className="p-3 text-gray-600">{cat.description}</td>
//                       <td className="p-3 text-gray-600">{cat.createdAt}</td>
//                       <td>
//                         <div className="p-3 flex items-center justify-center gap-3">
//                           {/* View */}
//                           <Link
//                             to={`/admin/categories/${cat.id}`}
//                             className="border border-blue-400 text-blue-600 hover:bg-blue-50
//                  rounded-lg p-2 flex items-center justify-center"
//                           >
//                             <Eye size={20} />
//                           </Link>

//                           {/* Delete */}
//                           <button
//                             className="border border-red-400 cursor-pointer text-red-600 hover:bg-red-50
//                  rounded-lg p-2 flex items-center justify-center"
//                             onClick={() => handleDelete(cat)}
//                             type="button"
//                           >
//                             <Trash2 size={20} />
//                           </button>
//                         </div>
//                       </td>
//                     </tr>
//                   ))
//                 )}
//               </tbody>
//             </table>
//           </div>
//           {/* Pagination */}
//           <Pagination
//             totalItems={sorted.length}
//             currentPage={currentPage}
//             perPage={perPage}
//             onPageChange={setCurrentPage} // Pass the setter function
//             onPerPageChange={setPerPage} // pass the setter function
//           />
//         </div>
//       </div>
//     </>
//   );
// }

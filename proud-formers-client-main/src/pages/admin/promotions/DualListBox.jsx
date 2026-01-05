import { useState, useMemo } from "react";
import {
  Search,
  Plus,
  Trash2,
  ChevronRight,
  ChevronsRight,
  X,
  Layers,
} from "lucide-react";

export default function DualListBox({
  availableItems,
  selectedItems,
  setSelectedItems,
  idKey = "id",
  nameKey = "name",
  imageKey = "images",
  skuKey = "sku",
  height = "400px",
  disabled = false,
}) {
  const [searchAvailable, setSearchAvailable] = useState("");
  const [searchSelected, setSearchSelected] = useState("");

  // Filter available items (excluding those already selected)
  const filteredAvailable = useMemo(() => {
    return availableItems
      .filter((a) => !selectedItems.some((s) => s[idKey] === a[idKey]))
      .filter(
        (a) =>
          a[nameKey].toLowerCase().includes(searchAvailable.toLowerCase()) ||
          a[idKey].toString().includes(searchAvailable)
      );
  }, [availableItems, selectedItems, searchAvailable, idKey, nameKey]);

  // Filter selected items for searching within the selection
  const filteredSelected = useMemo(() => {
    return selectedItems.filter(
      (s) =>
        s[nameKey].toLowerCase().includes(searchSelected.toLowerCase()) ||
        s[idKey].toString().includes(searchSelected)
    );
  }, [selectedItems, searchSelected, nameKey, idKey]);

  // --- Bulk Actions ---
  const addAllVisible = () => {
    if (disabled) return;
    setSelectedItems([...selectedItems, ...filteredAvailable]);
    setSearchAvailable("");
  };

  const removeAllVisible = () => {
    if (disabled) return;
    const remaining = selectedItems.filter(
      (s) => !filteredSelected.some((f) => f[idKey] === s[idKey])
    );
    setSelectedItems(remaining);
    setSearchSelected("");
  };

  const selectItem = (item) => {
    if (!disabled) setSelectedItems([...selectedItems, item]);
  };

  const removeItem = (item) => {
    if (!disabled)
      setSelectedItems(selectedItems.filter((s) => s[idKey] !== item[idKey]));
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* --- Available Section --- */}
      <div className="flex flex-col">
        <div className="flex justify-between items-end mb-2">
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">
            Available Items ({filteredAvailable.length})
          </label>
          <button
            type="button"
            onClick={addAllVisible}
            disabled={disabled || filteredAvailable.length === 0}
            className="text-xs font-bold text-primary hover:text-primary-dark flex items-center gap-1 transition-colors disabled:opacity-30"
          >
            <ChevronsRight size={14} /> Add All Visible
          </button>
        </div>

        <div className="relative mb-3">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={16}
          />
          <input
            type="text"
            placeholder="Search products..."
            value={searchAvailable}
            onChange={(e) => setSearchAvailable(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border-2 border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/10 outline-none transition-all"
          />
        </div>

        <div
          className="border-2 border-gray-200 rounded-2xl overflow-y-auto bg-white custom-scrollbar shadow-inner"
          style={{ height }}
        >
          {filteredAvailable.length ? (
            filteredAvailable.map((item) => (
              <div
                key={item[idKey]}
                onClick={() => selectItem(item)}
                className="group flex items-center gap-3 p-3 cursor-pointer border-b border-gray-50 last:border-0 hover:bg-primary/5 transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0 border border-gray-50">
                  {item[imageKey]?.[0] ? (
                    <img
                      src={item[imageKey][0]}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                      <Layers size={16} />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-700 text-sm truncate">
                    {item[nameKey]}
                  </p>
                  <p className="text-[10px] text-gray-400 font-mono uppercase tracking-tighter">
                    ID: {item[idKey]} {item[skuKey] && `• SKU: ${item[skuKey]}`}
                  </p>
                </div>
                <Plus
                  size={16}
                  className="text-gray-300 group-hover:text-primary transition-colors mr-2"
                />
              </div>
            ))
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-2">
              <Search size={32} strokeWidth={1} />
              <p className="text-xs">No items found</p>
            </div>
          )}
        </div>
      </div>

      {/* --- Selected Section --- */}
      <div className="flex flex-col">
        <div className="flex justify-between items-end mb-2">
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">
            Selected Items ({selectedItems.length})
          </label>
          <button
            type="button"
            onClick={removeAllVisible}
            disabled={disabled || filteredSelected.length === 0}
            className="text-xs font-bold text-red-500 hover:text-red-600 flex items-center gap-1 transition-colors disabled:opacity-30"
          >
            <X size={14} /> Remove All Visible
          </button>
        </div>

        <div className="relative mb-3">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={16}
          />
          <input
            type="text"
            placeholder="Filter selection..."
            value={searchSelected}
            onChange={(e) => setSearchSelected(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border-2 border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/10 outline-none transition-all"
          />
        </div>

        <div
          className="border-2 border-gray-200 rounded-2xl overflow-y-auto bg-white shadow-inner"
          style={{ height }}
        >
          {filteredSelected.length ? (
            filteredSelected.map((item) => (
              <div
                key={item[idKey]}
                className="flex items-center gap-3 p-3 border-b border-gray-200 last:border-0 hover:bg-red-50/50 transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0 opacity-80">
                  {item[imageKey]?.[0] ? (
                    <img
                      src={item[imageKey][0]}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                      <Layers size={16} />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-700 text-sm truncate">
                    {item[nameKey]}
                  </p>
                  <p className="text-[10px] text-gray-400 uppercase tracking-tighter">
                    ID: {item[idKey]}
                  </p>
                </div>
                {!disabled && (
                  <button
                    onClick={() => removeItem(item)}
                    className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-100 rounded-lg transition-all"
                    title="Remove item"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            ))
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-2 p-10 text-center">
              <ChevronRight size={32} strokeWidth={1} />
              <p className="text-xs">
                Click items on the left to add them to this promotion
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// // components/admin/DualListBox.jsx
// import { useState, useMemo } from "react";

// export default function DualListBox({
//   availableItems,
//   selectedItems,
//   setSelectedItems,
//   idKey = "id",
//   nameKey = "name",
//   imageKey = "images",
//   skuKey = "sku",
//   height = "400px",
//   disabled = false,
// }) {
//   const [searchAvailable, setSearchAvailable] = useState("");
//   const [searchSelected, setSearchSelected] = useState("");

//   const filteredAvailable = useMemo(() => {
//     return availableItems
//       .filter((a) => !selectedItems.some((s) => s[idKey] === a[idKey]))
//       .filter(
//         (a) =>
//           a[nameKey].toLowerCase().includes(searchAvailable.toLowerCase()) ||
//           a[idKey].toString().includes(searchAvailable)
//       );
//   }, [availableItems, selectedItems, searchAvailable]);

//   const filteredSelected = useMemo(() => {
//     return selectedItems.filter(
//       (s) =>
//         s[nameKey].toLowerCase().includes(searchSelected.toLowerCase()) ||
//         s[idKey].toString().includes(searchSelected)
//     );
//   }, [selectedItems, searchSelected]);

//   const selectItem = (item) => {
//     if (!disabled) setSelectedItems([...selectedItems, item]);
//   };

//   const removeItem = (item) => {
//     if (!disabled)
//       setSelectedItems(selectedItems.filter((s) => s[idKey] !== item[idKey]));
//   };

//   return (
//     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//       {/* Available */}
//       <div>
//         <input
//           type="text"
//           placeholder="Search by Name or ID"
//           value={searchAvailable}
//           onChange={(e) => setSearchAvailable(e.target.value)}
//           className="w-full mb-2 p-2 rounded-xl border border-gray-300"
//         />
//         <div className={`border rounded-xl overflow-y-auto`} style={{ height }}>
//           {filteredAvailable.length ? (
//             filteredAvailable.map((item) => (
//               <div
//                 key={item[idKey]}
//                 onClick={() => selectItem(item)}
//                 className="flex items-center gap-2 p-2 cursor-pointer hover:bg-gray-100 rounded"
//               >
//                 {imageKey && item[imageKey]?.[0] && (
//                   <img
//                     src={item[imageKey][0]}
//                     className="w-10 h-10 rounded object-cover"
//                   />
//                 )}
//                 <div>
//                   <p className="font-medium">
//                     {item[nameKey]} (ID: {item[idKey]})
//                   </p>
//                   {skuKey && item[skuKey] && (
//                     <p className="text-xs text-gray-500">SKU: {item[skuKey]}</p>
//                   )}
//                 </div>
//               </div>
//             ))
//           ) : (
//             <p className="p-2 text-gray-400 text-sm">No items found</p>
//           )}
//         </div>
//       </div>

//       {/* Selected */}
//       <div>
//         <input
//           type="text"
//           placeholder="Search Selected"
//           value={searchSelected}
//           onChange={(e) => setSearchSelected(e.target.value)}
//           className="w-full mb-2 p-2 rounded-xl border border-gray-300"
//         />
//         <div className={`border rounded-xl overflow-y-auto`} style={{ height }}>
//           {filteredSelected.length ? (
//             filteredSelected.map((item) => (
//               <div
//                 key={item[idKey]}
//                 className="flex items-center gap-2 p-2 hover:bg-red-100 rounded"
//               >
//                 {imageKey && item[imageKey]?.[0] && (
//                   <img
//                     src={item[imageKey][0]}
//                     className="w-10 h-10 rounded object-cover"
//                   />
//                 )}
//                 <div className="flex-1">
//                   <p className="font-medium">
//                     {item[nameKey]} (ID: {item[idKey]})
//                   </p>
//                 </div>
//                 {!disabled && (
//                   <button
//                     onClick={() => removeItem(item)}
//                     className="text-red-500 px-2 py-1 rounded hover:bg-red-200"
//                   >
//                     Remove
//                   </button>
//                 )}
//               </div>
//             ))
//           ) : (
//             <p className="p-2 text-gray-400 text-sm">No selected items</p>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }

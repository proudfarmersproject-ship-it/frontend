import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";

/**
 * Logic helper for page number ranges
 */
const getVisiblePages = (currentPage, totalPages, windowSize = 1) => {
  const pages = [];
  const start = Math.max(2, currentPage - windowSize);
  const end = Math.min(totalPages - 1, currentPage + windowSize);

  pages.push(1);
  if (start > 2) pages.push("...");

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  if (end < totalPages - 1) pages.push("...");
  if (totalPages > 1) pages.push(totalPages);

  return pages;
};

const Pagination = ({
  totalItems,
  perPage,
  currentPage,
  onPageChange,
  onPerPageChange,
  perPageOptions = [1, 2, 5, 10, 20, 50],
  windowSize = 1,
}) => {
  const totalPages = Math.ceil(totalItems / perPage);
  const pageNumbersToRender = getVisiblePages(
    currentPage,
    totalPages,
    windowSize
  );

  const handlePerPageChange = (e) => {
    onPerPageChange(+e.target.value);
    onPageChange(1);
  };

  if (totalItems === 0) return null;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-3">
      {/* Left Side: Stats */}
      <div className="flex items-center gap-4">
        <p className="text-sm text-slate-500 font-medium">
          Showing{" "}
          <span className="text-slate-900">
            {Math.min(totalItems, (currentPage - 1) * perPage + 1)}
          </span>{" "}
          to{" "}
          <span className="text-slate-900">
            {Math.min(totalItems, currentPage * perPage)}
          </span>{" "}
          of <span className="text-slate-900">{totalItems}</span> results
        </p>

        <div className="hidden sm:block h-4 w-px bg-slate-200" />

        <select
          value={perPage}
          onChange={handlePerPageChange}
          className="bg-transparent text-sm text-slate-600 font-medium focus:outline-none cursor-pointer hover:text-primary transition-colors"
        >
          {perPageOptions.map((o) => (
            <option key={o} value={o}>
              {o} / page
            </option>
          ))}
        </select>
      </div>

      {/* Right Side: Navigation Buttons */}
      <div className="flex items-center gap-1.5">
        {/* PREV BUTTON */}
        <button
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-primary disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-all"
          aria-label="Previous Page"
        >
          <ChevronLeft size={18} />
        </button>

        {/* PAGE NUMBERS */}
        <div className="flex items-center gap-1">
          {pageNumbersToRender.map((p, i) =>
            p === "..." ? (
              <span key={`dots-${i}`} className="px-2 text-slate-400">
                <MoreHorizontal size={16} />
              </span>
            ) : (
              <button
                key={p}
                onClick={() => onPageChange(p)}
                className={`min-w-[36px] h-9 px-2 text-sm font-semibold rounded-lg transition-all border ${
                  currentPage === p
                    ? "bg-primary border-primary text-white shadow-sm shadow-primary/30"
                    : "bg-white border-slate-200 text-slate-600 hover:border-primary hover:text-primary"
                }`}
              >
                {p}
              </button>
            )
          )}
        </div>

        {/* NEXT BUTTON */}
        <button
          disabled={currentPage === totalPages || totalPages === 0}
          onClick={() => onPageChange(currentPage + 1)}
          className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-primary disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-all"
          aria-label="Next Page"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
};

export default Pagination;

// const getVisiblePages = (currentPage, totalPages, windowSize = 1) => {
//   const pages = [];
//   const start = Math.max(2, currentPage - windowSize);
//   const end = Math.min(totalPages - 1, currentPage + windowSize);
//   pages.push(1); // we will always show the page 1
//   if (start > 2) {
//     pages.push("...");
//   }

//   for (let i = start; i <= end; i++) {
//     // range pushing
//     pages.push(i);
//   }

//   if (end < totalPages - 1) {
//     pages.push("...");
//   }

//   if (totalPages > 1) {
//     // if the total pages is more than one we will place the last page number as a static
//     pages.push(totalPages);
//   }
//   return pages;
// };

// const Pagination = ({
//   totalItems,
//   perPage,
//   currentPage,
//   onPageChange,
//   onPerPageChange,
//   perPageOptions = [2, 5, 10, 20, 50],
//   windowSize = 1,
// }) => {
//   const totalPages = Math.ceil(totalItems / perPage);
//   const pageNumbersToRender = getVisiblePages(
//     currentPage,
//     totalPages,
//     windowSize
//   );
//   // if (totalPages <= 1) {
//   //   return null;
//   // }
//   /// Handle Events ////
//   const handlePerPageChange = (e) => {
//     onPerPageChange(+e.target.value);
//     onPageChange(1);
//   };
//   const handlePageChange = (value) => {
//     onPageChange(value);
//   };

//   return (
//     <div className="md:flex md:justify-between items-center mt-4">
//       {/* ... Page Info and Prev Button are the same ... */}
//       <p className="text-sm text-gray-500 mb-4 md:mb-0">
//         Page {currentPage} of {totalPages}
//       </p>

//       <div className="flex flex-wrap gap-2">
//         <div>
//           <select
//             value={perPage}
//             onChange={handlePerPageChange}
//             className="border-2 px-3 h-9 rounded-xl focus:ring-1 focus:ring-primary bg-white focus:outline-none border-[var(--color-border-color)]"
//           >
//             {perPageOptions.map((o, i) => (
//               <option key={i} value={o}>{`${o} per Page`}</option>
//             ))}
//           </select>
//         </div>
//         <div className="flex flex-wrap gap-2">
//           {/* PREV BUTTON */}
//           <button
//             disabled={currentPage === 1}
//             onClick={() => onPageChange((p) => p - 1)}
//             className="px-3 h-9 border rounded-full hover:bg-primary hover:text-white disabled:opacity-50"
//           >
//             Prev
//           </button>

//           {pageNumbersToRender.map((p, i) =>
//             p === "..." ? (
//               <span key={i} className="px-3 py-1 text-gray-500 cursor-default">
//                 ...
//               </span>
//             ) : (
//               <button
//                 key={i}
//                 onClick={() => handlePageChange(p)}
//                 className={`min-w-[36px] h-9 border rounded-full ${
//                   currentPage === p
//                     ? "bg-primary text-white text-white border-blue-600" // Highlight color
//                     : "hover:bg-primary hover:text-white flex items-center justify-center"
//                 }`}
//               >
//                 {p}
//               </button>
//             )
//           )}
//           {/* NEXT BUTTON */}
//           <button
//             disabled={currentPage === totalPages}
//             onClick={() => onPageChange((p) => p + 1)}
//             className="px-3 h-9 border rounded-full hover:bg-primary hover:text-white disabled:opacity-50"
//           >
//             Next
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Pagination;

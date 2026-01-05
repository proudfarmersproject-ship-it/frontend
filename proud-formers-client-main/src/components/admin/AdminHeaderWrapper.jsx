import { Link, useLocation } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";

export default function AdminHeaderWrapper({
  title,
  description,
  breadcrumb = [],
  children,
}) {
  const location = useLocation();

  return (
    <div className="w-full mb-8">
      {/* Header Container */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 py-2">
        {/* Left Section: Title & Description */}
        <div className="space-y-1">
          {/* Breadcrumb Navigation - Positioned above Title for modern look */}
          <nav className="flex items-center space-x-2 text-xs font-medium text-slate-400 mb-2">
            <Link
              to="/admin"
              className="hover:text-primary transition-colors flex items-center gap-1"
            >
              <Home size={14} />
            </Link>

            {breadcrumb.map((item, index) => {
              const isLast = index === breadcrumb.length - 1;

              return (
                <div key={index} className="flex items-center space-x-2">
                  <ChevronRight size={12} className="text-slate-300" />
                  {item.to && !isLast ? (
                    <Link
                      to={item.to}
                      className="hover:text-primary transition-colors whitespace-nowrap"
                    >
                      {item.label}
                    </Link>
                  ) : (
                    <span className="text-slate-600 whitespace-nowrap">
                      {item.label}
                    </span>
                  )}
                </div>
              );
            })}
          </nav>

          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 md:text-4xl">
            {title}
          </h1>

          {description && (
            <p className="text-base text-slate-500 max-w-2xl">{description}</p>
          )}
        </div>

        {/* Right Section: Optional Actions (Slot for buttons if needed) */}
        {children && (
          <div className="flex items-center gap-3 pt-2 md:pt-0">{children}</div>
        )}
      </div>

      {/* Subtle Divider */}
      <div className="h-px w-full bg-slate-200 mt-6" />
    </div>
  );
}

// import { Link } from "react-router-dom";
// import { ChevronRight } from "lucide-react";

// export default function AdminHeaderWrapper({
//   title,
//   description,
//   breadcrumb = [],
//   children,
// }) {
//   return (
//     <div className="w-full space-y-6">
//       {/* Header + Breadcrumb Section */}
//       <div className="bg-[var(--color-bg)] p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
//         {/* Left: Title & Description */}
//         <div>
//           <h1 className="text-2xl font-bold text-[var(--color-text-heading)]">
//             {title}
//           </h1>
//           {description && (
//             <p className="text-[var(--color-text-body)] mt-1">{description}</p>
//           )}
//         </div>

//         {/* Right: Breadcrumb Navigation */}
//         <div className="flex items-center flex-wrap text-sm text-[var(--color-text-muted)]">
//           {breadcrumb.map((item, index) => (
//             <div key={index} className="flex items-center">
//               {item.to ? (
//                 <Link
//                   to={item.to}
//                   className="hover:text-[var(--color-primary)] transition-colors"
//                 >
//                   {item.label}
//                 </Link>
//               ) : (
//                 <span className="font-medium text-[var(--color-text-heading)]">
//                   {item.label}
//                 </span>
//               )}

//               {index < breadcrumb.length - 1 && (
//                 <ChevronRight className="w-4 h-4 mx-2" />
//               )}
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* Page Content */}
//       {/* <div className="bg-[var(--color-surface)] shadow p-6 rounded-2xl">
//         {children}
//       </div> */}
//     </div>
//   );
// }

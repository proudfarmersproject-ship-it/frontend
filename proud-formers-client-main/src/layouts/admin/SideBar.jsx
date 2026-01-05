import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  Users,
  FolderTree,
  Tag,
  Ticket,
  ShoppingCart,
  Activity,
  Settings,
  X,
  ChevronDown,
  Plus,
  Eye,
} from "lucide-react";

export default function SideBar({ isOpen, setIsOpen }) {
  const location = useLocation();

  const [expanded, setExpanded] = useState({
    products: false,
    categories: false,
    customers: false,
    orders: false,
    promotions: false,
    coupons: false,
    health: false,
  });

  const toggle = (key) => {
    setExpanded((p) => ({ ...p, [key]: !p[key] }));
  };
  const mainPage = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      path: "/admin",
      sub: [
        { label: "Overview", icon: Eye, path: "/admin" },
        // { label: "orders", icon: Plus, path: "/admin/dashboard/orders" },
      ],
    },
  ];

  const menu = [
    {
      id: "products",
      label: "Products",
      icon: Package,
      sub: [
        { label: "View All Products", icon: Eye, path: "/admin/products" },
        { label: "Add Product", icon: Plus, path: "/admin/products/new" },
      ],
    },
    {
      id: "categories",
      label: "Categories",
      icon: FolderTree,
      sub: [
        {
          label: "View All Categories",
          icon: Eye,
          path: "/admin/categories",
        },
        { label: "Add Category", icon: Plus, path: "/admin/categories/new" },
      ],
    },
    {
      id: "customers",
      label: "Customers",
      icon: Users,
      sub: [
        { label: "View All Customers", icon: Eye, path: "/admin/customers" },
        { label: "Add Customer", icon: Plus, path: "/admin/customers/new" },
      ],
    },
    {
      id: "orders",
      label: "Orders",
      icon: ShoppingCart,
      sub: [{ label: "View All Orders", icon: Eye, path: "/admin/orders" }],
    },
    {
      id: "promotions",
      label: "Promotions",
      icon: Tag,
      sub: [
        { label: "View All Promotions", icon: Eye, path: "/admin/promotions" },
        { label: "Add Promotion", icon: Plus, path: "/admin/promotions/new" },
      ],
    },
    {
      id: "coupons",
      label: "Coupons",
      icon: Ticket,
      sub: [
        { label: "View All Coupons", icon: Eye, path: "/admin/coupons" },
        { label: "Add Coupon", icon: Plus, path: "/admin/coupons/new" },
      ],
    },
    // {
    //   id: "health",
    //   label: "System Health",
    //   icon: Activity,
    //   sub: [{ label: "View System Status", icon: Eye, path: "/admin/health" }],
    // },
    // {
    //   id: "settings",
    //   label: "Settings",
    //   icon: Settings,
    //   path: "/admin/settings",
    // },
  ];

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-[rgba(0,0,0,0.45)] bg-opacity-40 z-20 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-30 w-64 bg-white shadow-lg
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          flex flex-col h-screen
        `}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-primary">Admin</h1>
            <p className="text-sm text-gray-500">Dashboard</p>
          </div>

          <button
            onClick={() => setIsOpen(false)}
            className="lg:hidden text-gray-500 hover:text-black"
          >
            <X size={24} />
          </button>
        </div>

        {/* Menu */}
        <nav className="flex-1 overflow-y-auto py-4 scrollbar-hide">
          <p className="text-gray-500 text-sm font-bold uppercase my-3 ml-3">
            Main Page
          </p>
          {mainPage.map((item) => {
            const Icon = item.icon;
            const isRouteActive =
              location.pathname === item.path ||
              location.pathname.startsWith(`/admin/${item.id}`);

            return (
              <div key={item.id} className="mb-1">
                {/* If no sub menu → direct link */}
                {!item.sub ? (
                  <NavLink
                    to={item.path}
                    onClick={() => setIsOpen(false)}
                    className={({ isActive }) =>
                      `
                      w-full flex items-center gap-3 px-6 py-3 text-sm font-medium
                      transition-all duration-200
                      ${
                        isActive
                          ? "bg-primary text-white border-r-4 border-accent"
                          : "text-gray-700 hover:bg-gray-100"
                      }
                    `
                    }
                  >
                    <Icon size={20} />
                    {item.label}
                  </NavLink>
                ) : (
                  <>
                    {/* Collapsible parent */}
                    <button
                      onClick={() => toggle(item.id)}
                      className={`
                        w-full flex items-center justify-between px-6 py-3 text-sm font-medium
                        transition-all duration-200
                        ${
                          isRouteActive
                            ? "bg-primary/20 text-primary"
                            : "text-gray-700 hover:bg-gray-100"
                        }
                      `}
                    >
                      <div className="flex items-center gap-3">
                        <Icon size={20} />
                        {item.label}
                      </div>
                      <ChevronDown
                        size={18}
                        className={`transition-transform ${
                          expanded[item.id] ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {/* Sub menu */}
                    {expanded[item.id] && (
                      <div className="bg-gray-50">
                        {item.sub.map((sub) => {
                          const SubIcon = sub.icon;
                          return (
                            <NavLink
                              key={sub.path}
                              to={sub.path}
                              onClick={() => setIsOpen(false)}
                              className={({ isActive }) =>
                                `
                                w-full flex items-center gap-2 px-10 py-2 text-sm
                                transition-all duration-200
                                ${
                                  isActive
                                    ? "bg-primary text-white border-r-4 border-accent"
                                    : "text-gray-700 hover:bg-gray-100"
                                }
                              `
                              }
                            >
                              <SubIcon size={16} />
                              {sub.label}
                            </NavLink>
                          );
                        })}
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })}
          <p className="text-gray-500 text-sm font-bold uppercase my-3 ml-3">
            All Pages
          </p>
          {menu.map((item) => {
            const Icon = item.icon;
            const isRouteActive =
              location.pathname === item.path ||
              location.pathname.startsWith(`/admin/${item.id}`);

            return (
              <div key={item.id} className="mb-1">
                {/* If no sub menu → direct link */}
                {!item.sub ? (
                  <NavLink
                    to={item.path}
                    onClick={() => setIsOpen(false)}
                    className={({ isActive }) =>
                      `
                      w-full flex items-center gap-3 px-6 py-3 text-sm font-medium
                      transition-all duration-200
                      ${
                        isActive
                          ? "bg-primary text-white border-r-4 border-accent"
                          : "text-gray-700 hover:bg-gray-100"
                      }
                    `
                    }
                  >
                    <Icon size={20} />
                    {item.label}
                  </NavLink>
                ) : (
                  <>
                    {/* Collapsible parent */}
                    <button
                      onClick={() => toggle(item.id)}
                      className={`
                        w-full flex items-center justify-between px-6 py-3 text-sm font-medium
                        transition-all duration-200
                        ${
                          isRouteActive
                            ? "bg-primary/20 text-primary"
                            : "text-gray-700 hover:bg-gray-100"
                        }
                      `}
                    >
                      <div className="flex items-center gap-3">
                        <Icon size={20} />
                        {item.label}
                      </div>
                      <ChevronDown
                        size={18}
                        className={`transition-transform ${
                          expanded[item.id] ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {/* Sub menu */}
                    {expanded[item.id] && (
                      <div className="bg-gray-50">
                        {item.sub.map((sub) => {
                          const SubIcon = sub.icon;
                          return (
                            <NavLink
                              key={sub.path}
                              to={sub.path}
                              end
                              onClick={() => setIsOpen(false)}
                              className={({ isActive }) =>
                                `
                                w-full flex items-center gap-2 px-10 py-2 text-sm
                                transition-all duration-200
                                ${
                                  isActive
                                    ? "bg-primary text-white border-r-4 border-accent"
                                    : "text-gray-700 hover:bg-gray-100"
                                }
                              `
                              }
                            >
                              <SubIcon size={16} />
                              {sub.label}
                            </NavLink>
                          );
                        })}
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-semibold">
              A
            </div>
            <div>
              <p className="font-medium">Admin User</p>
              <p className="text-sm text-gray-500">admin@example.com</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

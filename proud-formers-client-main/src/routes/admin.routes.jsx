import { lazy, Suspense } from "react";
import Layout from "../layouts/admin/layout";
import Loader from "../components/admin/Loader";

// Lazy imports
const Dashboard = lazy(() => import("../pages/admin/Dashboard"));
const Overview = lazy(() => import("../pages/admin/dashboard/Overview"));
const AdminProfile = lazy(() => import("../pages/admin/profile/AdminProfile"));
const AddNewProduct = lazy(() =>
  import("../pages/admin/products/AddNewProduct")
);
const ViewAllProducts = lazy(() =>
  import("../pages/admin/products/ViewAllProducts")
);
const ProductDetails = lazy(() =>
  import("../pages/admin/products/ProductDetails")
);
const AddNewCategory = lazy(() =>
  import("../pages/admin/categories/AddNewCategories")
);
const ViewAllCategories = lazy(() =>
  import("../pages/admin/categories/ViewAllCategories")
);
const CategoryDetails = lazy(() =>
  import("../pages/admin/categories/CategorieDetails")
);
const ViewAllCustomers = lazy(() =>
  import("../pages/admin/customers/ViewAllCustomers")
);
const AddNewCustomer = lazy(() =>
  import("../pages/admin/customers/AddNewCustomer")
);
const CustomerDetails = lazy(() =>
  import("../pages/admin/customers/CustomerDetails")
);

const ViewAllOrders = lazy(() => import("../pages/admin/orders/ViewAllOrders"));
const OrderDetails = lazy(() => import("../pages/admin/orders/OrderDetails"));
const ViewAllPromotions = lazy(() =>
  import("../pages/admin/promotions/ViewAllPromotions")
);
const CreateNewPromotion = lazy(() =>
  import("../pages/admin/promotions/CreateNewPromotion")
);
const PromotionDetails = lazy(() =>
  import("../pages/admin/promotions/PromotionDetails")
);
const ViewAllCoupons = lazy(() =>
  import("../pages/admin/coupons/ViewAllCoupons")
);
const AddNewCoupon = lazy(() => import("../pages/admin/coupons/AddNewCoupon"));
const ViewCouponDetail = lazy(() =>
  import("../pages/admin/coupons/CouponDetails")
);
const SystemHealth = lazy(() => import("../pages/admin/SystemHealth"));

export const adminRoutes = {
  path: "/admin",
  element: <Layout />,
  children: [
    {
      index: true,
      element: (
        <Suspense fallback={<Loader />}>
          {/* <Dashboard /> */}
          <Overview />
        </Suspense>
      ),
    },
    {
      path: "profile",
      element: (
        <Suspense fallback={<Loader />}>
          <AdminProfile />
        </Suspense>
      ),
    },
    {
      path: "products",
      children: [
        {
          patch: "",
          index: true,
          element: (
            <Suspense fallback={<Loader />}>
              <ViewAllProducts />
            </Suspense>
          ),
        },
        {
          path: "new",
          element: (
            <Suspense fallback={<Loader />}>
              <AddNewProduct />
            </Suspense>
          ),
        },
        // ⭐ NEW ROUTE → For Viewing a Single Category
        {
          path: ":id",
          element: (
            <Suspense fallback={<Loader />}>
              <ProductDetails />
            </Suspense>
          ),
        },
      ],
    },
    {
      path: "categories",
      children: [
        {
          patch: "",
          index: true,
          element: (
            <Suspense fallback={<Loader />}>
              <ViewAllCategories />
            </Suspense>
          ),
        },
        {
          path: "new",
          element: (
            <Suspense fallback={<Loader />}>
              <AddNewCategory />
            </Suspense>
          ),
        },
        // ⭐ NEW ROUTE → For Viewing a Single Category
        {
          path: ":id",
          element: (
            <Suspense fallback={<Loader />}>
              <CategoryDetails />
            </Suspense>
          ),
        },
      ],
    },
    {
      path: "customers",
      children: [
        {
          patch: "",
          index: true,
          element: (
            <Suspense fallback={<Loader />}>
              <ViewAllCustomers />
            </Suspense>
          ),
        },
        {
          path: "new",
          element: (
            <Suspense fallback={<Loader />}>
              <AddNewCustomer />
            </Suspense>
          ),
        },
        // ⭐ NEW ROUTE → For Viewing a Single Category
        {
          path: ":id",
          element: (
            <Suspense fallback={<Loader />}>
              <CustomerDetails />
            </Suspense>
          ),
        },
      ],
    },
    {
      path: "orders",
      children: [
        {
          patch: "",
          index: true,
          element: (
            <Suspense fallback={<Loader />}>
              {/* <Orders /> */}
              <ViewAllOrders />
            </Suspense>
          ),
        },
        // ⭐ NEW ROUTE → For Viewing a Single Category
        {
          path: ":id",
          element: (
            <Suspense fallback={<Loader />}>
              <OrderDetails />
            </Suspense>
          ),
        },
      ],
    },
    {
      path: "promotions",
      children: [
        {
          patch: "",
          index: true,
          element: (
            <Suspense fallback={<Loader />}>
              <ViewAllPromotions />
            </Suspense>
          ),
        },
        {
          path: "new",
          element: (
            <Suspense fallback={<Loader />}>
              <CreateNewPromotion />
            </Suspense>
          ),
        },
        // ⭐ NEW ROUTE → For Viewing a Single Category
        {
          path: ":id",
          element: (
            <Suspense fallback={<Loader />}>
              <PromotionDetails />
            </Suspense>
          ),
        },
      ],
    },
    {
      path: "coupons",

      children: [
        {
          patch: "",
          index: true,
          element: (
            <Suspense fallback={<Loader />}>
              {/* <Coupons /> */}
              <ViewAllCoupons />
            </Suspense>
          ),
        },
        {
          path: "new",
          element: (
            <Suspense fallback={<Loader />}>
              <AddNewCoupon />
            </Suspense>
          ),
        },
        // ⭐ NEW ROUTE → For Viewing a Single Category
        {
          path: ":id",
          element: (
            <Suspense fallback={<Loader />}>
              <ViewCouponDetail />
            </Suspense>
          ),
        },
      ],
    },
    {
      path: "health",
      element: (
        <Suspense fallback={<Loader />}>
          <SystemHealth />
        </Suspense>
      ),
    },
  ],
};

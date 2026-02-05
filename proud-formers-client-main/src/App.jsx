import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react"; // Add this
import { useCartStore } from './services/cartService';
import Register from "./pages/user/Register";
import Login from "./pages/user/Login";
import ResetPassword from "./pages/user/ResetPassword";
import Products from "./pages/user/Products";
import ForgotPassword from "./pages/user/ForgotPassword";
import HomePage from "./pages/user/HomePage";
import ProductDetailPage from "./pages/user/ProductDetailPage";
import CartPage from "./pages/user/CartPage";
import Navbar from "./pages/user/Navbar";
import Footer from "./pages/user/Footer";
import UserEditForm from "./pages/user/UserEditForm";
import OrdersPage from "./pages/user/OrdersPage";
import CheckOut from "./pages/user/CheckOut";

// AppInitializer Component
function AppInitializer() {
  const loadCart = useCartStore((state) => state.loadCart);
  
  useEffect(() => {
    console.log("🔄 AppInitializer: Loading cart...");
    loadCart();
  }, [loadCart]);
  
  return null;
}

function AppRoutes() {
  const location = useLocation();

  // Pages where Navbar & Footer should NOT appear
  const hideLayoutRoutes = [
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
  ];

  const hideLayout = hideLayoutRoutes.includes(location.pathname);

  return (
    <>
      {/* AppInitializer runs once when app starts */}
      <AppInitializer />
      
      {!hideLayout && <Navbar />}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/products" element={<Products />} />
        <Route path="/product/:id" element={<ProductDetailPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/profile" element={<UserEditForm />} />
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="/checkout" element={<CheckOut />} />

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Routes>

      {!hideLayout && <Footer />}
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;
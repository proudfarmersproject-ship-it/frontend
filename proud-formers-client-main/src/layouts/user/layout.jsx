import { Outlet, Link } from "react-router-dom";
import useThemeLoader from "../../hooks/common/useThemeLoader";

export default function Layout() {
  // useThemeLoader();
  return (
    <div>
      <nav className="p-4 bg-primary text-white flex gap-4">
        <Link to="/">Home</Link>
        <Link to="/about">About</Link>
        <Link to="/admin">Admin</Link>
      </nav>

      <Outlet />
    </div>
  );
}

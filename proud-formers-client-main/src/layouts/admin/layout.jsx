import { useState } from "react";
import Sidebar from "./SideBar";
import Header from "./Header";
import { Outlet } from "react-router-dom";
import useThemeLoader from "../../hooks/common/useThemeLoader";

function Layout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  // useThemeLoader();
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header setIsOpen={setIsSidebarOpen} />

        <main className="flex-1 overflow-y-auto p-4 lg:p-8 bg-[var(--color-bg)]">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default Layout;

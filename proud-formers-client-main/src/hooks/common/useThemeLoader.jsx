import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

export default function useThemeLoader() {
  const { pathname } = useLocation();
  const lastTheme = useRef(null);

  useEffect(() => {
    const isAdmin = pathname.startsWith("/admin");
    // const themePath = isAdmin
    //   ? "src/styles/themes/admin.css"
    //   : "src/styles/themes/user.css";
    // const currentTheme = isAdmin ? "admin" : "user";
    // // stop reloading same theme
    // if (lastTheme.current === currentTheme) return;
    // lastTheme.current = currentTheme;

    // /// creating a link tag from here
    // let linkEl = document.getElementById("app-theme");

    // // If link doesn't exist, create it
    // if (!linkEl) {
    //   linkEl = document.createElement("link");
    //   linkEl.rel = "stylesheet";
    //   linkEl.id = "app-theme";
    //   document.head.appendChild(linkEl);
    // }

    // // Update theme file
    // linkEl.href = themePath;
    // const currentTheme = isAdmin ? "admin" : "user";
    // if (lastTheme.current === currentTheme) return;
    // lastTheme.current = currentTheme;
    // const html = document.documentElement;
    // html.classList.remove("admin-theme", "user-theme");
    // html.classList.add(isAdmin ? "admin-theme" : "user-theme");
  }, [pathname]);
}

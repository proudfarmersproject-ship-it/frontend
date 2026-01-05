import Layout from "../layouts/user/layout";
import User from "../pages/user/User";
import About from "../pages/user/About";

export const userRoutes = {
  path: "/",
  element: <Layout />,
  children: [
    { index: true, element: <User /> },
    { path: "about", element: <About /> },
  ],
};

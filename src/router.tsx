import { createBrowserRouter, Navigate } from "react-router"

import AppLayout from "./layouts/AppLayout"
import Dashboard from "./pages/Dashboard"
// import Products from "./pages/Products"
// import Orders from "./pages/Orders"
// import NotFound from "./pages/NotFound"

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: "dashboard",
        element: <Dashboard />,
      },
    ],
  },
])

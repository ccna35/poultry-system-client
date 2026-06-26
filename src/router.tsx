import { createBrowserRouter } from "react-router"

import AppLayout from "./layouts/AppLayout"

function lazyPage<T extends { default: React.ComponentType }>(
  importer: () => Promise<T>
) {
  return async () => {
    const module = await importer()

    return { Component: module.default }
  }
}

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      {
        index: true,
        lazy: lazyPage(() => import("./pages/Dashboard")),
      },
      {
        path: "cycles",
        lazy: lazyPage(() => import("./pages/Cycles")),
      },
      {
        path: "daily",
        lazy: lazyPage(() => import("./pages/DailyLogs")),
      },
      {
        path: "feed",
        lazy: lazyPage(() => import("./pages/FeedPurchases")),
      },
      {
        path: "weight",
        lazy: lazyPage(() => import("./pages/WeightLogs")),
      },
      {
        path: "medication",
        lazy: lazyPage(() => import("./pages/MedicationLogs")),
      },
      {
        path: "expenses",
        lazy: lazyPage(() => import("./pages/Expenses")),
      },
      {
        path: "sales",
        lazy: lazyPage(() => import("./pages/Sales")),
      },
      {
        path: "reports",
        lazy: lazyPage(() => import("./pages/Reports")),
      },
      {
        path: "settings",
        lazy: lazyPage(() => import("./pages/Settings")),
      },
    ],
  },
])

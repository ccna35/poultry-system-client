import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { RouterProvider } from "react-router"

import { router } from "./router"

import "./index.css"
import { ThemeProvider } from "@/components/theme-provider.tsx"

const rootElement = document.documentElement
rootElement.lang = "ar"
rootElement.dir = "rtl"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <RouterProvider router={router} />
    </ThemeProvider>
  </StrictMode>
)

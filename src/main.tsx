import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { QueryClientProvider } from "@tanstack/react-query"

import App from "./App"
import { ThemeProvider } from "@/components/theme-provider.tsx"
import Toaster from "@/components/ui/toaster"
import { queryClient } from "@/lib/query-client"

import "./index.css"

const rootElement = document.documentElement
rootElement.lang = "ar"
rootElement.dir = "rtl"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <App />
        <Toaster />
      </QueryClientProvider>
    </ThemeProvider>
  </StrictMode>
)

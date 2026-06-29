import {
  ChartColumn,
  ClipboardList,
  Home,
  LayoutDashboard,
  Pill,
  Scale,
  Settings,
  ShoppingCart,
  Wallet,
  type LucideIcon,
} from "lucide-react"

export type NavigationItem = {
  path: string
  label: string
  icon: LucideIcon
}

export const navigationItems: NavigationItem[] = [
  { path: "/", label: "لوحة التحكم", icon: LayoutDashboard },
  { path: "/cycles", label: "دورات الإنتاج", icon: Home },
  { path: "/daily", label: "العمليات اليومية", icon: ClipboardList },
  { path: "/feed", label: "مشتريات العلف", icon: ShoppingCart },
  { path: "/weight", label: "متابعة الأوزان", icon: Scale },
  { path: "/medication", label: "سجلات الأدوية", icon: Pill },
  { path: "/expenses", label: "المصروفات", icon: Wallet },
  { path: "/sales", label: "المبيعات", icon: ChartColumn },
  { path: "/reports", label: "التقارير", icon: ChartColumn },
  { path: "/settings", label: "الإعدادات", icon: Settings },
]

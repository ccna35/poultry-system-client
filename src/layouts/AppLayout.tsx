// layouts/DashboardLayout.tsx
import { NavLink, Outlet } from "react-router"
import { cn } from "@/lib/utils"
import {
  Activity,
  Bell,
  Bird,
  CalendarDays,
  ChartColumn,
  CheckCircle2,
  ChevronDown,
  CircleDollarSign,
  ClipboardList,
  Drumstick,
  Egg,
  FileText,
  FlaskConical,
  Gauge,
  HeartPulse,
  Home,
  LayoutDashboard,
  Pill,
  RefreshCw,
  Scale,
  Settings,
  ShoppingCart,
  SunMedium,
  Target,
  Thermometer,
  TriangleAlert,
  Wallet,
  Waves,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { useFarmDashboard } from "@/hooks/use-farm-dashboard"

type PageId =
  | "dashboard"
  | "cycles"
  | "daily"
  | "feed"
  | "weight"
  | "medication"
  | "expenses"
  | "sales"
  | "reports"
  | "settings"

type NavItem = {
  id: PageId
  label: string
  icon: LucideIcon
}

const navigationItems: NavItem[] = [
  { id: "dashboard", label: "لوحة التحكم", icon: LayoutDashboard },
  { id: "cycles", label: "دورات الإنتاج", icon: Home },
  { id: "daily", label: "العمليات اليومية", icon: ClipboardList },
  { id: "feed", label: "مشتريات العلف", icon: ShoppingCart },
  { id: "weight", label: "متابعة الأوزان", icon: Scale },
  { id: "medication", label: "سجلات الأدوية", icon: Pill },
  { id: "expenses", label: "المصروفات", icon: Wallet },
  { id: "sales", label: "المبيعات / إغلاق الدورة", icon: ChartColumn },
  { id: "reports", label: "التقارير", icon: FileText },
  { id: "settings", label: "الإعدادات", icon: Settings },
]

type SurfaceCardProps = {
  className?: string
  children: React.ReactNode
}

function SurfaceCard({ className, children }: SurfaceCardProps) {
  return (
    <section
      className={cn(
        "rounded-[1.8rem] border border-[rgba(121,154,109,0.14)] bg-white shadow-[0_18px_50px_rgba(63,92,56,0.08)]",
        className
      )}
    >
      {children}
    </section>
  )
}

function AppLayout() {
  const {
    cycles,
    selectedCycleId,
    setSelectedCycleId,
    selectedCycle,
    dashboard,
    report,
    operations,
    isLoading,
    error,
    refresh,
  } = useFarmDashboard()
  return (
    <div className="min-h-svh bg-[radial-gradient(circle_at_10%_0%,rgba(201,226,189,0.26),transparent_28%),linear-gradient(180deg,#fbfbf8_0%,#f7f8f2_60%,#f3f4ee_100%)] text-slate-900">
      <div className="mx-auto flex min-h-svh max-w-[1520px] gap-5 px-3 py-3 sm:px-4 lg:px-5">
        <aside className="hidden w-[272px] shrink-0 flex-col overflow-hidden rounded-[2rem] border border-[#E7ECE2] bg-[linear-gradient(180deg,#FBFCF8_0%,#F4F7EE_100%)] shadow-[0_18px_60px_rgba(83,110,75,0.08)] xl:flex">
          {/* <SidebarHeader /> */}

          <nav className="flex-1 space-y-1 px-4 py-5">
            {navigationItems.map((item) => {
              const Icon = item.icon

              return (
                <NavLink
                  key={item.id}
                  to={item.id}
                  //   end={item.end}
                  className={({ isActive }) =>
                    cn(
                      "flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition",
                      isActive
                        ? "bg-[#EEF5E8] text-[#5E8F58] shadow-[inset_0_0_0_1px_rgba(126,169,116,0.06)]"
                        : "text-slate-600 hover:bg-white hover:text-slate-900"
                    )
                  }
                >
                  <Icon className="size-4" />
                  <span>{item.label}</span>
                </NavLink>
              )
            })}
          </nav>

          {/* <SidebarUserCard /> */}
        </aside>

        <main className="flex min-w-0 flex-1 flex-col gap-5">
          {/* <DashboardHeader /> */}

          <SurfaceCard className="p-4 sm:p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-start gap-3">
                <div className="mt-1 flex size-10 items-center justify-center rounded-2xl bg-[#FFF4D8] text-[#E0A433]">
                  <SunMedium className="size-5" />
                </div>
                <div>
                  <h2 className="font-heading text-2xl font-semibold text-slate-900">
                    صباح الخير، مدير المزرعة
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    إليك ملخص ما يحدث في المزرعة اليوم.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-3 rounded-[1.35rem] border border-[#E5ECE2] bg-white px-4 py-3 shadow-[0_10px_30px_rgba(83,110,75,0.05)]">
                  <div className="flex size-9 items-center justify-center rounded-xl bg-[#EDF6E8] text-[#6A965F]">
                    <CalendarDays className="size-4" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">الدورة النشطة</p>
                    <div className="flex items-center gap-2">
                      <select
                        className="appearance-none bg-transparent text-sm font-medium text-slate-800 outline-none"
                        value={selectedCycleId ?? ""}
                        disabled={cycles.length === 0 || isLoading}
                        onChange={(event) =>
                          setSelectedCycleId(event.target.value)
                        }
                      >
                        {cycles.length === 0 ? (
                          <option value="">لا توجد دورات</option>
                        ) : (
                          cycles.map((cycle: Cycle) => (
                            <option key={cycle.id} value={cycle.id}>
                              {cycle.name}
                            </option>
                          ))
                        )}
                      </select>
                      <ChevronDown className="size-4 text-slate-400" />
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  className="relative flex size-11 items-center justify-center rounded-2xl border border-[#E5ECE2] bg-white text-slate-500 shadow-[0_10px_30px_rgba(83,110,75,0.05)]"
                >
                  <Bell className="size-4" />
                  <span className="absolute -top-1 -right-1 inline-flex size-5 items-center justify-center rounded-full bg-[#71A86B] text-[10px] font-semibold text-white">
                    3
                  </span>
                </button>
              </div>
            </div>
          </SurfaceCard>

          <div className="flex gap-2 overflow-x-auto xl:hidden">
            {navigationItems.map((item) => {
              const Icon = item.icon

              return (
                <NavLink
                  key={item.id}
                  to={item.id}
                  //   end={item.end}
                  className={({ isActive }) =>
                    cn(
                      "flex shrink-0 items-center gap-2 rounded-2xl border px-4 py-2.5 text-sm",
                      isActive
                        ? "border-[#CFE0C8] bg-[#EEF5E8] text-[#5E8F58]"
                        : "border-[#E5ECE2] bg-white text-slate-600"
                    )
                  }
                >
                  <Icon className="size-4" />
                  {item.label}
                </NavLink>
              )
            })}
          </div>

          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default AppLayout

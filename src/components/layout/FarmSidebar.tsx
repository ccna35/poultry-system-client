import { Bird, CheckCircle2, ChevronDown } from "lucide-react"
import { NavLink } from "react-router"

import { cn } from "@/lib/utils"
import { navigationItems } from "@/components/layout/navigation"

function FarmSidebar() {
  return (
    <aside className="hidden w-[272px] shrink-0 flex-col overflow-hidden rounded-[2rem] border border-[#E7ECE2] bg-[linear-gradient(180deg,#FBFCF8_0%,#F4F7EE_100%)] shadow-[0_18px_60px_rgba(83,110,75,0.08)] xl:flex">
      <div className="border-b border-[#E7ECE2] px-5 py-5">
        <div className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-2xl bg-[#EAF5E3] text-[#66935C]">
            <Bird className="size-5" />
          </div>
          <div>
            <h1 className="font-heading text-lg font-semibold text-slate-900">
              مزرعة الدواجن
            </h1>
            <p className="text-sm text-slate-500">لوحة الإدارة</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-4 py-5">
        {navigationItems.map((item) => {
          const Icon = item.icon

          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/"}
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

      <div className="mx-4 mt-auto mb-4 overflow-hidden rounded-[1.7rem] border border-[#E7ECE2] bg-[linear-gradient(180deg,#F8FBF3_0%,#EEF4E6_100%)]">
        <div className="h-28 bg-[radial-gradient(circle_at_20%_20%,rgba(151,189,134,0.24),transparent_32%),linear-gradient(180deg,rgba(255,255,255,0)_0%,rgba(169,198,150,0.22)_100%)]" />
        <div className="flex items-center gap-3 border-t border-[#E7ECE2] px-4 py-4">
          <div className="flex size-10 items-center justify-center rounded-full bg-[#E7F1E0] text-[#6C9562]">
            <CheckCircle2 className="size-4" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-slate-900">
              مدير المزرعة
            </p>
            <p className="truncate text-xs text-slate-500">farm@example.com</p>
          </div>
          <ChevronDown className="size-4 text-slate-400" />
        </div>
      </div>
    </aside>
  )
}

export function FarmMobileNav() {
  return (
    <div className="flex gap-2 overflow-x-auto xl:hidden">
      {navigationItems.map((item) => {
        const Icon = item.icon

        return (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === "/"}
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
  )
}

export default FarmSidebar

import {
  Bird,
  CheckCircle2,
  ChevronDown,
  LoaderCircle,
  LogOut,
} from "lucide-react"
import { NavLink, useNavigate } from "react-router"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { navigationItems } from "@/components/layout/navigation"
import { useAuth, useLogout } from "@/hooks/use-auth"
import { toast } from "@/lib/toast"
import { cn } from "@/lib/utils"
import { ApiError } from "@/services/api-client"

function getUserDisplayName(user: ReturnType<typeof useAuth>["user"]) {
  return user?.fullName ?? user?.name ?? user?.email ?? "مدير المزرعة"
}

function getUserSecondaryText(user: ReturnType<typeof useAuth>["user"]) {
  return user?.email ?? user?.role ?? "جلسة نشطة"
}

function getLogoutErrorMessage(error: unknown) {
  if (error instanceof ApiError) {
    return error.message
  }

  if (error instanceof Error) {
    return error.message
  }

  return "تعذر تسجيل الخروج حاليًا. حاول مرة أخرى."
}

function UserMenu({ compact = false }: { compact?: boolean }) {
  const navigate = useNavigate()
  const { user } = useAuth()
  const logoutMutation = useLogout()
  const displayName = getUserDisplayName(user)
  const secondaryText = getUserSecondaryText(user)

  async function handleLogout() {
    try {
      await logoutMutation.mutateAsync()
      toast.success("تم تسجيل الخروج بنجاح.")
      navigate("/login", { replace: true })
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        toast.success("تم إنهاء الجلسة الحالية.")
        navigate("/login", { replace: true })
        return
      }

      toast.error(getLogoutErrorMessage(error))
    }
  }

  if (compact) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className="h-11 shrink-0 rounded-2xl border-[#E5ECE2] bg-white px-4 text-slate-600 shadow-[0_10px_30px_rgba(83,110,75,0.05)]"
          >
            <CheckCircle2 className="size-4 text-[#6C9562]" />
            <span className="max-w-28 truncate text-sm">{displayName}</span>
            <ChevronDown className="size-4 text-slate-400" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 min-w-56 rounded-2xl">
          <DropdownMenuLabel className="space-y-1">
            <p className="text-sm font-semibold text-slate-900">
              {displayName}
            </p>
            <p className="truncate text-xs font-normal text-slate-500">
              {secondaryText}
            </p>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            disabled={logoutMutation.isPending}
            onSelect={(event) => {
              event.preventDefault()
              if (!logoutMutation.isPending) {
                void handleLogout()
              }
            }}
          >
            {logoutMutation.isPending ? (
              <LoaderCircle className="size-4 animate-spin" />
            ) : (
              <LogOut className="size-4" />
            )}
            تسجيل الخروج
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex w-full items-center gap-3 border-t border-[#E7ECE2] px-4 py-4 text-right transition hover:bg-white/50"
        >
          <div className="flex size-10 items-center justify-center rounded-full bg-[#E7F1E0] text-[#6C9562]">
            <CheckCircle2 className="size-4" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-slate-900">
              {displayName}
            </p>
            <p className="truncate text-xs text-slate-500">{secondaryText}</p>
          </div>
          <ChevronDown className="size-4 text-slate-400" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 min-w-56 rounded-2xl">
        <DropdownMenuLabel className="space-y-1">
          <p className="text-sm font-semibold text-slate-900">{displayName}</p>
          <p className="truncate text-xs font-normal text-slate-500">
            {secondaryText}
          </p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          disabled={logoutMutation.isPending}
          onSelect={(event) => {
            event.preventDefault()
            if (!logoutMutation.isPending) {
              void handleLogout()
            }
          }}
        >
          {logoutMutation.isPending ? (
            <LoaderCircle className="size-4 animate-spin" />
          ) : (
            <LogOut className="size-4" />
          )}
          تسجيل الخروج
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

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
        <UserMenu />
      </div>
    </aside>
  )
}

export function FarmMobileNav() {
  return (
    <div className="flex items-center gap-2 overflow-x-auto xl:hidden">
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

      <UserMenu compact />
    </div>
  )
}

export default FarmSidebar

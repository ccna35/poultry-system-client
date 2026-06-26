import {
  Bell,
  CalendarDays,
  ChevronDown,
  RefreshCw,
  SunMedium,
} from "lucide-react"

import SurfaceCard from "@/components/common/SurfaceCard"
import { Button } from "@/components/ui/button"
import type { Cycle } from "@/types/api"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type FarmTopbarProps = {
  cycles: Cycle[]
  selectedCycleId: string | null
  isLoading: boolean
  onCycleChange: (cycleId: string) => void
  onRefresh: () => void
}

function FarmTopbar({
  cycles,
  selectedCycleId,
  isLoading,
  onCycleChange,
  onRefresh,
}: FarmTopbarProps) {
  const currentCycleName = cycles.filter(
    (cycle) => cycle.id === selectedCycleId
  )[0]?.name

  return (
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
          <div className="flex items-center gap-3 rounded-[1.35rem] bg-white px-4 py-3">
            <div>
              <p className="text-xs text-slate-400">الدورة الحالية</p>

              {/* <Select
                value={selectedCycleId ?? ""}
                disabled={cycles.length === 0 || isLoading}
                onValueChange={onCycleChange}
              >
                <SelectTrigger className="h-auto w-fit gap-2 border-0 bg-transparent p-0 text-sm font-medium text-slate-800 shadow-none focus:ring-0 focus:ring-offset-0 [&>svg]:size-4 [&>svg]:text-slate-400">
                  <SelectValue placeholder="لا توجد دورات" />
                </SelectTrigger>

                <SelectContent align="start" className="rounded-xl">
                  {cycles.map((cycle) => (
                    <SelectItem key={cycle.id} value={cycle.id}>
                      {cycle.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select> */}

              <p className="text-lg font-semibold text-slate-800">
                {currentCycleName}
              </p>
            </div>
          </div>

          {/* <Button
            type="button"
            variant="outline"
            className="h-11 rounded-2xl border-[#E5ECE2] bg-white px-4 text-slate-500 shadow-[0_10px_30px_rgba(83,110,75,0.05)]"
            onClick={onRefresh}
          >
            <RefreshCw className="size-4" />
            تحديث
          </Button>

          <button
            type="button"
            className="relative flex size-11 items-center justify-center rounded-2xl border border-[#E5ECE2] bg-white text-slate-500 shadow-[0_10px_30px_rgba(83,110,75,0.05)]"
          >
            <Bell className="size-4" />
            <span className="absolute -top-1 -right-1 inline-flex size-5 items-center justify-center rounded-full bg-[#71A86B] text-[10px] font-semibold text-white">
              3
            </span>
          </button> */}
        </div>
      </div>
    </SurfaceCard>
  )
}

export default FarmTopbar

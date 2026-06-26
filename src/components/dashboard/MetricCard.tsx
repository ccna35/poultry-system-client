import type { LucideIcon } from "lucide-react"

import SurfaceCard from "@/components/common/SurfaceCard"
import { cn } from "@/lib/utils"

type MetricCardProps = {
  label: string
  value: string
  meta?: string
  icon: LucideIcon
  iconClassName: string
  iconSurfaceClassName: string
}

function MetricCard({
  label,
  value,
  meta,
  icon: Icon,
  iconClassName,
  iconSurfaceClassName,
}: MetricCardProps) {
  return (
    <SurfaceCard className="p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[0.78rem] font-medium text-slate-500">{label}</p>
          <p className="mt-2 font-heading text-[1.7rem] font-semibold text-slate-900">
            {value}
          </p>
          {meta ? <p className="mt-1 text-xs text-slate-400">{meta}</p> : null}
        </div>
        <div
          className={cn(
            "flex size-11 items-center justify-center rounded-2xl",
            iconSurfaceClassName
          )}
        >
          <Icon className={cn("size-5", iconClassName)} />
        </div>
      </div>
    </SurfaceCard>
  )
}

export default MetricCard

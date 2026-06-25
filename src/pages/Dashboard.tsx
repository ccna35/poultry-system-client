import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useFarmDashboard } from "@/hooks/use-farm-dashboard"
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
  type LucideIcon,
} from "lucide-react"
import {
  formatCurrency,
  formatDate,
  formatNullableNumber,
  formatNumber,
  formatPercent,
} from "@/lib/format"
import type {
  CreateCycleRequest,
  CreateDailyLogRequest,
  CreateFeedPurchaseRequest,
  CreateManualExpenseRequest,
  CreateMedicationLogRequest,
  CreateSaleRequest,
  CreateWeightLogRequest,
  Cycle,
  DailyLog,
  ExpenseCategory,
  FeedType,
  MedicationLog,
} from "@/types/api"
import {
  Area,
  AreaChart,
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  LineChart as RechartsLineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

type SurfaceCardProps = {
  className?: string
  children: React.ReactNode
}
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

type TableColumn<Row> = {
  key: string
  title: string
  render: (row: Row) => React.ReactNode
}

type DataTableProps<Row> = {
  title: string
  actionLabel?: string
  rows: Row[]
  columns: TableColumn<Row>[]
  emptyText: string
}

function DataTable<Row>({
  title,
  actionLabel,
  rows,
  columns,
  emptyText,
}: DataTableProps<Row>) {
  return (
    <SurfaceCard className="overflow-hidden">
      <div className="flex items-center justify-between border-b border-[#EDF1EA] px-5 py-4 sm:px-6">
        <h3 className="font-heading text-lg font-semibold text-slate-900">
          {title}
        </h3>
        {actionLabel ? (
          <span className="text-sm font-medium text-[#6E8F68]">
            {actionLabel}
          </span>
        ) : null}
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-right text-sm">
          <thead className="bg-[#FBFCF8] text-slate-500">
            <tr>
              {columns.map((column) => (
                <th key={column.key} className="px-5 py-3 font-medium sm:px-6">
                  {column.title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length > 0 ? (
              rows.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  className="border-t border-[#EDF1EA] text-slate-700"
                >
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className="px-5 py-3 align-top sm:px-6"
                    >
                      {column.render(row)}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  className="px-5 py-10 text-center text-slate-400 sm:px-6"
                  colSpan={columns.length}
                >
                  {emptyText}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </SurfaceCard>
  )
}

type PageHeaderProps = {
  eyebrow: string
  title: string
  description: string
  actions?: React.ReactNode
}

function PageHeader({ eyebrow, title, description, actions }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
      <div>
        <p className="text-sm font-medium text-[#6E8F68]">{eyebrow}</p>
        <h2 className="mt-1 font-heading text-[1.75rem] font-semibold tracking-tight text-slate-900">
          {title}
        </h2>
        <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-500">
          {description}
        </p>
      </div>
      {actions ? (
        <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>
      ) : null}
    </div>
  )
}

function getLastNumericValue(values: Array<number | null>) {
  const numericValue = [...values]
    .reverse()
    .find((value): value is number => value !== null)
  return numericValue ?? null
}

function buildCumulative(values: Array<number | null>) {
  let total = 0
  return values.map((value) => {
    total += value ?? 0
    return total
  })
}

function toNumber(value: string) {
  return Number(value)
}

function toOptionalNumber(value: string) {
  if (value.trim() === "") {
    return null
  }

  return Number(value)
}

function formatTooltipValue(value: unknown) {
  if (typeof value === "number") {
    return formatNumber(value)
  }

  return value == null ? "—" : String(value)
}

function ActionNotice({ message }: { message: StatusMessage | null }) {
  if (!message) {
    return null
  }

  return (
    <div
      className={cn(
        "rounded-[1.5rem] border px-4 py-3 text-sm",
        message.tone === "success"
          ? "border-[#CFE5C7] bg-[#F4FAF1] text-[#4C7A49]"
          : "border-destructive/20 bg-destructive/6 text-destructive"
      )}
    >
      {message.text}
    </div>
  )
}

type LineChartProps = {
  values: Array<number | null>
  stroke: string
  fill?: string
  dashed?: boolean
  heightClassName?: string
}

type BarLineChartProps = {
  bars: number[]
  line: number[]
  barColor: string
  lineColor: string
}

const fallbackSeries = [5, 12, 14, 19, 22, 25, 27]

function LineChart({
  values,
  stroke,
  fill,
  dashed,
  heightClassName,
}: LineChartProps) {
  const normalizedValues = values.filter(
    (value): value is number => value !== null
  )
  const source = normalizedValues.length > 1 ? normalizedValues : fallbackSeries
  const data = source.map((value, index) => ({
    day: `${index + 1}`,
    value,
  }))

  return (
    <div className={cn("w-full", heightClassName ?? "h-44")}>
      <ResponsiveContainer>
        {fill ? (
          <AreaChart
            data={data}
            margin={{ top: 8, right: 4, left: 4, bottom: 0 }}
          >
            <CartesianGrid
              stroke="rgba(148, 163, 184, 0.18)"
              strokeDasharray="2 3"
              vertical={false}
            />
            <XAxis dataKey="day" hide />
            <YAxis hide />
            <Tooltip
              formatter={(value) => formatTooltipValue(value)}
              labelFormatter={(label) => `اليوم ${label}`}
              contentStyle={{
                borderRadius: "0.75rem",
                borderColor: "#E3E8DF",
                backgroundColor: "#ffffff",
              }}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke={stroke}
              fill={fill}
              strokeWidth={2.4}
              strokeDasharray={dashed ? "4 3" : undefined}
              dot={false}
              activeDot={{ r: 4 }}
            />
          </AreaChart>
        ) : (
          <RechartsLineChart
            data={data}
            margin={{ top: 8, right: 4, left: 4, bottom: 0 }}
          >
            <CartesianGrid
              stroke="rgba(148, 163, 184, 0.18)"
              strokeDasharray="2 3"
              vertical={false}
            />
            <XAxis dataKey="day" hide />
            <YAxis hide />
            <Tooltip
              formatter={(value) => formatTooltipValue(value)}
              labelFormatter={(label) => `اليوم ${label}`}
              contentStyle={{
                borderRadius: "0.75rem",
                borderColor: "#E3E8DF",
                backgroundColor: "#ffffff",
              }}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke={stroke}
              strokeWidth={2.4}
              strokeDasharray={dashed ? "4 3" : undefined}
              dot={false}
              activeDot={{ r: 4 }}
            />
          </RechartsLineChart>
        )}
      </ResponsiveContainer>
    </div>
  )
}

function BarLineChart({ bars, line, barColor, lineColor }: BarLineChartProps) {
  const normalizedBars = bars.length > 0 ? bars : [1, 3, 2, 5, 4, 2, 6]
  const normalizedLine = line.length > 0 ? line : [5, 8, 12, 17, 20, 23, 30]
  const data = normalizedBars.map((barValue, index) => ({
    day: `${index + 1}`,
    bar: barValue,
    line: normalizedLine[index] ?? 0,
  }))

  return (
    <div className="h-44 w-full">
      <ResponsiveContainer>
        <ComposedChart
          data={data}
          margin={{ top: 8, right: 4, left: 4, bottom: 0 }}
        >
          <CartesianGrid
            stroke="rgba(148, 163, 184, 0.18)"
            strokeDasharray="2 3"
            vertical={false}
          />
          <XAxis dataKey="day" hide />
          <YAxis hide />
          <Tooltip
            formatter={(value, name) => [
              formatTooltipValue(value),
              name === "bar" ? "نفوق يومي" : "نفوق تراكمي",
            ]}
            labelFormatter={(label) => `اليوم ${label}`}
            contentStyle={{
              borderRadius: "0.75rem",
              borderColor: "#E3E8DF",
              backgroundColor: "#ffffff",
            }}
          />
          <Bar
            dataKey="bar"
            fill={barColor}
            radius={[4, 4, 0, 0]}
            opacity={0.85}
          />
          <Line
            type="monotone"
            dataKey="line"
            stroke={lineColor}
            strokeWidth={2.4}
            dot={false}
            activeDot={{ r: 4 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}

function MetricCardSkeleton() {
  return (
    <SurfaceCard className="p-5">
      <div className="flex items-start justify-between">
        <div className="flex-1 space-y-3">
          <Skeleton className="h-3 w-24 rounded-full" />
          <Skeleton className="h-8 w-20 rounded-lg" />
          <Skeleton className="h-3 w-32 rounded-full" />
        </div>

        <Skeleton className="size-12 rounded-2xl" />
      </div>
    </SurfaceCard>
  )
}

export default function Dashboard() {
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

  const cycleSummary = React.useMemo(() => {
    if (!selectedCycle || !dashboard) {
      return null
    }

    return {
      startedAt: formatDate(selectedCycle.startDate),
      currentDay: `اليوم ${formatNumber(dashboard.currentDay)}`,
      targetWeight: `${formatNumber(selectedCycle.expectedFinalWeightKg)} كجم`,
      targetSaleDate: selectedCycle.endDate
        ? formatDate(selectedCycle.endDate)
        : "غير محدد",
    }
  }, [dashboard, selectedCycle])

  const latestTemperature = getLastNumericValue(
    dashboard?.charts.temperature.map((point) => point.value) ?? []
  )
  const latestHumidity = getLastNumericValue(
    dashboard?.charts.humidity.map((point) => point.value) ?? []
  )
  function deriveHealthState(
    temperature: number | null,
    humidity: number | null
  ) {
    if (temperature === null || humidity === null) {
      return "غير محدد"
    }

    if (
      temperature <= 31 &&
      temperature >= 27 &&
      humidity >= 55 &&
      humidity <= 70
    ) {
      return "ممتاز"
    }

    return "بحاجة لمراجعة"
  }

  const healthState = deriveHealthState(latestTemperature, latestHumidity)

  const metrics = dashboard
    ? [
        // {
        //   label: "اليوم الحالي",
        //   value: formatNumber(dashboard.currentDay),
        //   meta: `من أصل ~${formatNumber(42)} يومًا`,
        //   icon: CalendarDays,
        //   iconClassName: "text-slate-500",
        //   iconSurfaceClassName: "bg-slate-100",
        // },
        {
          label: "عدد الطيور الابتدائي",
          value: formatNumber(dashboard.initialBirds),
          meta: selectedCycle ? selectedCycle.name : undefined,
          icon: Egg,
          iconClassName: "text-[#E7A922]",
          iconSurfaceClassName: "bg-[#FFF6DA]",
        },
        {
          label: "الطيور المتبقية",
          value: formatNumber(dashboard.remainingBirds),
          meta: `${formatPercent((dashboard.remainingBirds / dashboard.initialBirds) * 100)} من القطيع`,
          icon: Bird,
          iconClassName: "text-[#71B16B]",
          iconSurfaceClassName: "bg-[#EAF7E8]",
        },
        {
          label: "إجمالي النفوق",
          value: formatNumber(dashboard.totalDeaths),
          meta: `معدل النفوق ${formatPercent(dashboard.mortalityRate)}`,
          icon: HeartPulse,
          iconClassName: "text-[#E25A4A]",
          iconSurfaceClassName: "bg-[#FFF0ED]",
        },
        // {
        //   label: "معدل النفوق",
        //   value: formatPercent(dashboard.mortalityRate),
        //   meta: "المعدل التراكمي",
        //   icon: Activity,
        //   iconClassName: "text-[#E47B6E]",
        //   iconSurfaceClassName: "bg-[#FFF5F2]",
        // },
        {
          label: "إجمالي العلف المستهلك",
          value: `${formatNumber(dashboard.totalFeedConsumedKg)} كجم`,
          meta: `تكلفة العلف ${formatCurrency(dashboard.feedCost)}`,
          icon: Drumstick,
          iconClassName: "text-[#4F95D8]",
          iconSurfaceClassName: "bg-[#EAF5FF]",
        },
        {
          label: "آخر متوسط وزن",
          value: `${formatNullableNumber(dashboard.latestAverageWeightKg)} كجم`,
          meta: operations.weightLogs.data[0]
            ? formatDate(operations.weightLogs.data[0].date)
            : "لا توجد قراءات بعد",
          icon: Scale,
          iconClassName: "text-[#62A772]",
          iconSurfaceClassName: "bg-[#F0F8EE]",
        },
        {
          label: "إجمالي المصروفات",
          value: formatCurrency(dashboard.totalExpenses),
          meta: `مصروفات أخرى ${formatCurrency(dashboard.otherExpenses)}`,
          icon: Wallet,
          iconClassName: "text-[#F08A35]",
          iconSurfaceClassName: "bg-[#FFF5EA]",
        },
        {
          label: "الإيراد المتوقع",
          value: formatCurrency(dashboard.estimatedRevenue),
          meta: "قيمة البيع المتوقعة",
          icon: CircleDollarSign,
          iconClassName: "text-[#63A957]",
          iconSurfaceClassName: "bg-[#EDF8EA]",
        },
        {
          label: "الربح المتوقع",
          value: formatCurrency(dashboard.estimatedProfit),
          meta:
            dashboard.actualProfit === null
              ? "تقديري"
              : `فعلي ${formatCurrency(dashboard.actualProfit)}`,
          icon: ChartColumn,
          iconClassName: "text-[#8DBB62]",
          iconSurfaceClassName: "bg-[#F1F8E8]",
        },
        {
          label: "تقدير معامل التحويل",
          value: formatNullableNumber(dashboard.fcrEstimate),
          meta:
            dashboard.actualFcr === null
              ? "بانتظار البيع"
              : `فعلي ${formatNullableNumber(dashboard.actualFcr)}`,
          icon: Target,
          iconClassName: "text-[#AC83D8]",
          iconSurfaceClassName: "bg-[#F6EDFF]",
        },
        // {
        //   label: "البيئة",
        //   value: healthState,
        //   meta: `${latestTemperature === null ? "—" : `${formatNumber(latestTemperature)}°C`} • ${latestHumidity === null ? "—" : `${formatNumber(latestHumidity)}%`}`,
        //   icon: Thermometer,
        //   iconClassName: "text-[#E56A57]",
        //   iconSurfaceClassName: "bg-[#FFF1ED]",
        // },
      ]
    : []

  const recentDailyLogs = React.useMemo(
    () =>
      [...operations.dailyLogs.data]
        .sort((left, right) => right.date.localeCompare(left.date))
        .slice(0, 4),
    [operations.dailyLogs.data]
  )

  const mortalityBars = React.useMemo(
    () => dashboard?.charts.deaths.map((point) => point.value ?? 0) ?? [],
    [dashboard]
  )
  const mortalityLine = React.useMemo(
    () => buildCumulative(mortalityBars),
    [mortalityBars]
  )
  const targetWeightSeries = React.useMemo(() => {
    const actualValues = dashboard?.charts.averageWeightKg ?? []
    const targetWeight = selectedCycle?.expectedFinalWeightKg ?? 2.2
    return actualValues.map(
      (_, index) =>
        ((index + 1) / Math.max(actualValues.length, 1)) * targetWeight
    )
  }, [dashboard, selectedCycle])

  return (
    <div className="space-y-5">
      <SurfaceCard className="p-5 sm:p-6">
        <PageHeader
          //   eyebrow="اليوم التشغيلي"
          title="صباح الخير، مدير المزرعة"
          //   description="هذه نظرة فورية على ما يحدث في دورة التسمين الحالية، بنفس بنية اللوحة المرجعية: بطاقات المؤشرات، الرسوم، والعمليات الأخيرة."
          actions={
            <>
              <Button
                variant="outline"
                className="h-11 rounded-2xl border-[#DDE7D7] bg-white px-4 text-slate-600"
                // onClick={() => {
                //   void refresh()
                // }}
              >
                <RefreshCw className="size-4" />
                تحديث
              </Button>
              <Button className="h-11 rounded-2xl bg-[#7EA974] px-5 text-white hover:bg-[#6C9562]">
                عرض تفاصيل الدورة
              </Button>
            </>
          }
        />

        {/* <div className="mt-6 rounded-[1.6rem] border border-[#E5ECE2] bg-[#FCFDFB] px-5 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <div className="mb-3 flex flex-wrap items-center gap-3">
                <span className="rounded-full bg-[#E8F5E4] px-3 py-1 text-xs font-semibold text-[#5E905C]">
                  {selectedCycle?.status === "ACTIVE"
                    ? "نشطة"
                    : selectedCycle?.status === "COMPLETED"
                      ? "مكتملة"
                      : "غير محددة"}
                </span>
                <h3 className="font-heading text-[1.55rem] font-semibold text-slate-900">
                  {selectedCycle?.name ?? "دفعة تسمين رقم ٧"}
                </h3>
              </div>
              <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-500">
                <span>بدأت في: {cycleSummary?.startedAt ?? "—"}</span>
                <span>{cycleSummary?.currentDay ?? "اليوم —"}</span>
                <span>الوزن المستهدف: {cycleSummary?.targetWeight ?? "—"}</span>
                <span>
                  موعد البيع المستهدف: {cycleSummary?.targetSaleDate ?? "—"}
                </span>
              </div>
            </div>
            <Button className="h-11 rounded-2xl bg-white px-5 text-[#6B8C63] shadow-[0_10px_24px_rgba(122,168,108,0.15)] hover:bg-[#F7FBF5]">
              عرض تفاصيل الدورة
            </Button>
          </div>
        </div> */}

        {error ? (
          <div className="mt-5 flex items-start gap-3 rounded-[1.5rem] border border-destructive/15 bg-destructive/6 px-4 py-3 text-sm text-destructive">
            <TriangleAlert className="mt-0.5 size-4 shrink-0" />
            <div>
              <p className="font-medium">تعذر تحميل بعض الأقسام من الخادم</p>
              <p className="mt-1 text-destructive/80">{error}</p>
            </div>
          </div>
        ) : null}
      </SurfaceCard>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metrics.length > 0
          ? metrics.map((metric) => (
              <MetricCard key={metric.label} {...metric} />
            ))
          : Array.from({ length: 12 }).map((_, index) => (
              <MetricCardSkeleton key={index} />
            ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <SurfaceCard className="p-5 sm:p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              {/* <p className="text-sm font-medium text-slate-500">
                Feed Consumption (kg)
              </p> */}
              <h3 className="mt-1 font-heading text-lg font-semibold text-slate-900">
                اتجاه الاستهلاك اليومي للعلف
              </h3>
            </div>
            <span className="text-xs font-medium text-[#6F9168]">
              العلف المستهلك (كجم)
            </span>
          </div>
          <LineChart
            values={
              dashboard?.charts.feedConsumedKg.map((point) => point.value) ?? []
            }
            stroke="#6FA96B"
            fill="rgba(111, 169, 107, 0.12)"
          />
        </SurfaceCard>

        <SurfaceCard className="p-5 sm:p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              {/* <p className="text-sm font-medium text-slate-500">
                Mortality (Birds)
              </p> */}
              <h3 className="mt-1 font-heading text-lg font-semibold text-slate-900">
                النفوق اليومي مقابل التراكمي
              </h3>
            </div>
            <div className="flex items-center gap-4 text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <span className="size-2 rounded-full bg-[#F58A81]" />
                يومي
              </span>
              <span className="flex items-center gap-1">
                <span className="size-2 rounded-full bg-[#5B9AE6]" />
                تراكمي
              </span>
            </div>
          </div>
          <BarLineChart
            bars={mortalityBars}
            line={mortalityLine}
            barColor="#F58A81"
            lineColor="#5B9AE6"
          />
        </SurfaceCard>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <SurfaceCard className="p-5 sm:p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              {/* <p className="text-sm font-medium text-slate-500">
                Weight Growth (kg)
              </p> */}
              <h3 className="mt-1 font-heading text-lg font-semibold text-slate-900">
                الوزن (كجم)
              </h3>
            </div>
            {/* <div className="flex items-center gap-4 text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <span className="size-2 rounded-full bg-[#72AE71]" />
                متوسط
              </span>
              <span className="flex items-center gap-1">
                <span className="size-2 rounded-full bg-[#F1A84B]" />
                مستهدف
              </span>
            </div> */}
          </div>
          <div className="relative">
            <LineChart
              values={
                dashboard?.charts.averageWeightKg.map((point) => point.value) ??
                []
              }
              stroke="#72AE71"
              fill="rgba(114, 174, 113, 0.08)"
              heightClassName="h-40"
            />
            {/* <div className="absolute inset-0">
              <LineChart
                values={targetWeightSeries}
                stroke="#F1A84B"
                dashed
                heightClassName="h-40"
              />
            </div> */}
          </div>
        </SurfaceCard>

        <SurfaceCard className="p-5 sm:p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              {/* <p className="text-sm font-medium text-slate-500">
                    Temperature (°C)
                </p> */}
              <h3 className="mt-1 font-heading text-lg font-semibold text-slate-900">
                درجة حرارة البيئة
              </h3>
            </div>
            <Thermometer className="size-4 text-[#F39A36]" />
          </div>
          <LineChart
            values={
              dashboard?.charts.temperature.map((point) => point.value) ?? []
            }
            stroke="#F39A36"
            heightClassName="h-40"
          />
        </SurfaceCard>

        <SurfaceCard className="p-5 sm:p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              {/* <p className="text-sm font-medium text-slate-500">Humidity (%)</p> */}
              <h3 className="mt-1 font-heading text-lg font-semibold text-slate-900">
                رطوبة البيئة
              </h3>
            </div>
            <Waves className="size-4 text-[#5B9AE6]" />
          </div>
          <LineChart
            values={
              dashboard?.charts.humidity.map((point) => point.value) ?? []
            }
            stroke="#5B9AE6"
            heightClassName="h-40"
          />
        </SurfaceCard>
      </div>

      <DataTable
        title="آخر العمليات اليومية"
        actionLabel="عرض كل العمليات اليومية"
        rows={recentDailyLogs}
        emptyText="لا توجد سجلات يومية حديثة لعرضها."
        columns={[
          {
            key: "date",
            title: "التاريخ",
            render: (row: DailyLog) => formatDate(row.date),
          },
          {
            key: "day",
            title: "اليوم",
            render: (row: DailyLog) => {
              const index = recentDailyLogs.findIndex(
                (log) => log.id === row.id
              )
              return dashboard
                ? formatNumber(dashboard.currentDay - index)
                : "—"
            },
          },
          {
            key: "deaths",
            title: "النفوق",
            render: (row: DailyLog) => formatNumber(row.deaths),
          },
          {
            key: "feed",
            title: "العلف (كجم)",
            render: (row: DailyLog) => formatNumber(row.feedConsumedKg),
          },
          {
            key: "temp",
            title: "الحرارة (°م)",
            render: (row: DailyLog) => formatNullableNumber(row.temperature),
          },
          {
            key: "humidity",
            title: "الرطوبة (%)",
            render: (row: DailyLog) => formatNullableNumber(row.humidity),
          },
          {
            key: "notes",
            title: "ملاحظات",
            render: (row: DailyLog) => row.notes ?? "—",
          },
        ]}
      />
    </div>
  )
}

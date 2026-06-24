import * as React from "react"
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

import { Button } from "@/components/ui/button"
import { useFarmDashboard } from "@/hooks/use-farm-dashboard"
import { cn } from "@/lib/utils"
import {
  formatCurrency,
  formatDate,
  formatNullableNumber,
  formatNumber,
  formatPercent,
} from "@/lib/format"
import { cyclesService } from "@/services/cycles.service"
import { operationsService } from "@/services/operations.service"
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

type StatusMessage = {
  tone: "success" | "error"
  text: string
}

type SurfaceCardProps = {
  className?: string
  children: React.ReactNode
}

type PageHeaderProps = {
  eyebrow: string
  title: string
  description: string
  actions?: React.ReactNode
}

type MetricCardProps = {
  label: string
  value: string
  meta?: string
  icon: LucideIcon
  iconClassName: string
  iconSurfaceClassName: string
}

type InputFieldProps = {
  label: string
  hint?: string
  children: React.ReactNode
}

type TextInputProps = React.InputHTMLAttributes<HTMLInputElement>

type SelectInputProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  options: Array<{
    label: string
    value: string
  }>
}

type TextAreaInputProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>

type FormPanelProps = {
  title: string
  description: string
  submitLabel: string
  busy: boolean
  disabled?: boolean
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void
  children: React.ReactNode
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

const feedTypeOptions: Array<{ label: string; value: FeedType }> = [
  { label: "بادئ", value: "STARTER" },
  { label: "نامي", value: "GROWER" },
  { label: "ناهٍ", value: "FINISHER" },
]

const expenseCategoryOptions: Array<{ label: string; value: ExpenseCategory }> =
  [
    { label: "كتاكيت", value: "CHICKS" },
    { label: "علف", value: "FEED" },
    { label: "أدوية", value: "MEDICATION" },
    { label: "عمالة", value: "LABOR" },
    { label: "كهرباء", value: "ELECTRICITY" },
    { label: "نقل", value: "TRANSPORT" },
    { label: "متفرقات", value: "MISC" },
    { label: "أخرى", value: "OTHER" },
  ]

const fallbackSeries = [5, 12, 14, 19, 22, 25, 27]

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

function InputField({ label, hint, children }: InputFieldProps) {
  return (
    <label className="block space-y-2">
      <div className="flex items-center justify-between gap-3 text-sm font-medium text-slate-700">
        <span>{label}</span>
        {hint ? (
          <span className="text-xs font-normal text-slate-400">{hint}</span>
        ) : null}
      </div>
      {children}
    </label>
  )
}

function TextInput({ className, ...props }: TextInputProps) {
  return (
    <input
      className={cn(
        "h-11 w-full rounded-2xl border border-[#E3E8DF] bg-[#FBFCF8] px-4 text-sm text-slate-800 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] transition outline-none placeholder:text-slate-400 focus:border-[#8CB17F] focus:bg-white focus:ring-4 focus:ring-[#DDECD7]",
        className
      )}
      {...props}
    />
  )
}

function SelectInput({ className, options, ...props }: SelectInputProps) {
  return (
    <select
      className={cn(
        "h-11 w-full rounded-2xl border border-[#E3E8DF] bg-[#FBFCF8] px-4 text-sm text-slate-800 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] transition outline-none focus:border-[#8CB17F] focus:bg-white focus:ring-4 focus:ring-[#DDECD7]",
        className
      )}
      {...props}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  )
}

function TextAreaInput({ className, ...props }: TextAreaInputProps) {
  return (
    <textarea
      className={cn(
        "min-h-28 w-full rounded-2xl border border-[#E3E8DF] bg-[#FBFCF8] px-4 py-3 text-sm text-slate-800 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] transition outline-none placeholder:text-slate-400 focus:border-[#8CB17F] focus:bg-white focus:ring-4 focus:ring-[#DDECD7]",
        className
      )}
      {...props}
    />
  )
}

function FormPanel({
  title,
  description,
  submitLabel,
  busy,
  disabled,
  onSubmit,
  children,
}: FormPanelProps) {
  return (
    <SurfaceCard className="p-5 sm:p-6">
      <div className="mb-5">
        <h3 className="font-heading text-xl font-semibold text-slate-900">
          {title}
        </h3>
        <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>
      </div>
      <form className="space-y-4" onSubmit={onSubmit}>
        {children}
        <Button
          className="h-11 rounded-2xl bg-[#7EA974] px-5 text-white hover:bg-[#6C9562]"
          disabled={busy || disabled}
        >
          {busy ? "جارٍ الحفظ..." : submitLabel}
        </Button>
      </form>
    </SurfaceCard>
  )
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

export function App() {
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

  const [activePage, setActivePage] = React.useState<PageId>("dashboard")
  const [statusMessage, setStatusMessage] =
    React.useState<StatusMessage | null>(null)
  const [submittingKey, setSubmittingKey] = React.useState<string | null>(null)

  const [cycleForm, setCycleForm] = React.useState({
    name: "",
    startDate: "",
    initialBirds: "5000",
    chickPrice: "24",
    expectedFinalWeightKg: "2.2",
    expectedSellingPricePerKg: "65",
    expectedRemainingCost: "25000",
  })
  const [dailyLogForm, setDailyLogForm] = React.useState({
    date: "",
    deaths: "0",
    feedConsumedKg: "",
    temperature: "",
    humidity: "",
    notes: "",
  })
  const [feedForm, setFeedForm] = React.useState({
    purchaseDate: "",
    feedType: "STARTER" as FeedType,
    quantityKg: "",
    unitPrice: "",
  })
  const [weightForm, setWeightForm] = React.useState({
    date: "",
    sampleSize: "50",
    averageWeightKg: "",
    notes: "",
  })
  const [medicationForm, setMedicationForm] = React.useState({
    date: "",
    medicineName: "",
    dosage: "",
    cost: "",
    notes: "",
  })
  const [expenseForm, setExpenseForm] = React.useState({
    expenseDate: "",
    category: "OTHER" as ExpenseCategory,
    amount: "",
    description: "",
  })
  const [saleForm, setSaleForm] = React.useState({
    saleDate: "",
    birdsSold: "",
    averageSellingWeightKg: "",
    pricePerKg: "",
  })
  const [settingsForm, setSettingsForm] = React.useState({
    farmName: "مزرعة الدواجن",
    managerName: "مدير المزرعة",
    email: "farm@example.com",
    enableAlerts: true,
    currencyLabel: "جنيه مصري",
  })

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
  const healthState = deriveHealthState(latestTemperature, latestHumidity)

  const metrics = dashboard
    ? [
        {
          label: "اليوم الحالي",
          value: formatNumber(dashboard.currentDay),
          meta: `من أصل ~${formatNumber(42)} يومًا`,
          icon: CalendarDays,
          iconClassName: "text-slate-500",
          iconSurfaceClassName: "bg-slate-100",
        },
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
        {
          label: "معدل النفوق",
          value: formatPercent(dashboard.mortalityRate),
          meta: "المعدل التراكمي",
          icon: Activity,
          iconClassName: "text-[#E47B6E]",
          iconSurfaceClassName: "bg-[#FFF5F2]",
        },
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
        {
          label: "البيئة",
          value: healthState,
          meta: `${latestTemperature === null ? "—" : `${formatNumber(latestTemperature)}°C`} • ${latestHumidity === null ? "—" : `${formatNumber(latestHumidity)}%`}`,
          icon: Thermometer,
          iconClassName: "text-[#E56A57]",
          iconSurfaceClassName: "bg-[#FFF1ED]",
        },
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

  const canUseCycleActions = Boolean(selectedCycleId)
  const apiBaseUrl =
    import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000"

  const runSubmission = React.useCallback(
    async (
      submissionKey: string,
      action: () => Promise<void>,
      successText: string
    ) => {
      setStatusMessage(null)
      setSubmittingKey(submissionKey)

      try {
        await action()
        setStatusMessage({ tone: "success", text: successText })
        await refresh()
      } catch (submissionError) {
        const text =
          submissionError instanceof Error
            ? submissionError.message
            : "تعذر حفظ البيانات. راجع القيم المدخلة وحاول مرة أخرى."

        setStatusMessage({ tone: "error", text })
      } finally {
        setSubmittingKey(null)
      }
    },
    [refresh]
  )

  const submitCycle = React.useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault()

      const payload: CreateCycleRequest = {
        name: cycleForm.name,
        startDate: cycleForm.startDate,
        initialBirds: toNumber(cycleForm.initialBirds),
        chickPrice: toNumber(cycleForm.chickPrice),
        expectedFinalWeightKg: toNumber(cycleForm.expectedFinalWeightKg),
        expectedSellingPricePerKg: toNumber(
          cycleForm.expectedSellingPricePerKg
        ),
        expectedRemainingCost: toNumber(cycleForm.expectedRemainingCost),
      }

      void runSubmission(
        "cycle",
        async () => {
          await cyclesService.create(payload)
          setCycleForm({
            name: "",
            startDate: "",
            initialBirds: "5000",
            chickPrice: "24",
            expectedFinalWeightKg: "2.2",
            expectedSellingPricePerKg: "65",
            expectedRemainingCost: "25000",
          })
        },
        "تم إنشاء الدورة الجديدة بنجاح."
      )
    },
    [cycleForm, runSubmission]
  )

  const submitDailyLog = React.useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault()

      if (!selectedCycleId) {
        setStatusMessage({
          tone: "error",
          text: "اختر دورة أولًا قبل إضافة سجل يومي.",
        })
        return
      }

      const payload: CreateDailyLogRequest = {
        date: dailyLogForm.date,
        deaths: toNumber(dailyLogForm.deaths),
        feedConsumedKg: toNumber(dailyLogForm.feedConsumedKg),
        temperature: toOptionalNumber(dailyLogForm.temperature),
        humidity: toOptionalNumber(dailyLogForm.humidity),
        notes: dailyLogForm.notes.trim() === "" ? null : dailyLogForm.notes,
      }

      void runSubmission(
        "daily",
        async () => {
          await operationsService.createDailyLog(selectedCycleId, payload)
          setDailyLogForm({
            date: "",
            deaths: "0",
            feedConsumedKg: "",
            temperature: "",
            humidity: "",
            notes: "",
          })
        },
        "تمت إضافة السجل اليومي."
      )
    },
    [dailyLogForm, runSubmission, selectedCycleId]
  )

  const submitFeedPurchase = React.useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault()

      if (!selectedCycleId) {
        setStatusMessage({
          tone: "error",
          text: "اختر دورة أولًا قبل إضافة مشتريات العلف.",
        })
        return
      }

      const payload: CreateFeedPurchaseRequest = {
        purchaseDate: feedForm.purchaseDate,
        feedType: feedForm.feedType,
        quantityKg: toNumber(feedForm.quantityKg),
        unitPrice: toNumber(feedForm.unitPrice),
      }

      void runSubmission(
        "feed",
        async () => {
          await operationsService.createFeedPurchase(selectedCycleId, payload)
          setFeedForm({
            purchaseDate: "",
            feedType: "STARTER",
            quantityKg: "",
            unitPrice: "",
          })
        },
        "تم تسجيل شراء العلف."
      )
    },
    [feedForm, runSubmission, selectedCycleId]
  )

  const submitWeightLog = React.useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault()

      if (!selectedCycleId) {
        setStatusMessage({
          tone: "error",
          text: "اختر دورة أولًا قبل إضافة قراءة الوزن.",
        })
        return
      }

      const payload: CreateWeightLogRequest = {
        date: weightForm.date,
        sampleSize: toNumber(weightForm.sampleSize),
        averageWeightKg: toNumber(weightForm.averageWeightKg),
        notes: weightForm.notes.trim() === "" ? null : weightForm.notes,
      }

      void runSubmission(
        "weight",
        async () => {
          await operationsService.createWeightLog(selectedCycleId, payload)
          setWeightForm({
            date: "",
            sampleSize: "50",
            averageWeightKg: "",
            notes: "",
          })
        },
        "تم حفظ قراءة الوزن."
      )
    },
    [runSubmission, selectedCycleId, weightForm]
  )

  const submitMedicationLog = React.useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault()

      if (!selectedCycleId) {
        setStatusMessage({
          tone: "error",
          text: "اختر دورة أولًا قبل تسجيل الدواء.",
        })
        return
      }

      const payload: CreateMedicationLogRequest = {
        date: medicationForm.date,
        medicineName: medicationForm.medicineName,
        dosage: medicationForm.dosage,
        cost: toNumber(medicationForm.cost),
        notes: medicationForm.notes.trim() === "" ? null : medicationForm.notes,
      }

      void runSubmission(
        "medication",
        async () => {
          await operationsService.createMedicationLog(selectedCycleId, payload)
          setMedicationForm({
            date: "",
            medicineName: "",
            dosage: "",
            cost: "",
            notes: "",
          })
        },
        "تم حفظ سجل الدواء."
      )
    },
    [medicationForm, runSubmission, selectedCycleId]
  )

  const submitExpense = React.useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault()

      if (!selectedCycleId) {
        setStatusMessage({
          tone: "error",
          text: "اختر دورة أولًا قبل إضافة مصروف.",
        })
        return
      }

      const payload: CreateManualExpenseRequest = {
        expenseDate: expenseForm.expenseDate,
        category: expenseForm.category,
        amount: toNumber(expenseForm.amount),
        description:
          expenseForm.description.trim() === ""
            ? null
            : expenseForm.description,
      }

      void runSubmission(
        "expense",
        async () => {
          await operationsService.createExpense(selectedCycleId, payload)
          setExpenseForm({
            expenseDate: "",
            category: "OTHER",
            amount: "",
            description: "",
          })
        },
        "تم إضافة المصروف بنجاح."
      )
    },
    [expenseForm, runSubmission, selectedCycleId]
  )

  const submitSale = React.useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault()

      if (!selectedCycleId) {
        setStatusMessage({
          tone: "error",
          text: "اختر دورة أولًا قبل تسجيل البيع.",
        })
        return
      }

      const payload: CreateSaleRequest = {
        saleDate: saleForm.saleDate,
        birdsSold: toNumber(saleForm.birdsSold),
        averageSellingWeightKg: toNumber(saleForm.averageSellingWeightKg),
        pricePerKg: toNumber(saleForm.pricePerKg),
      }

      void runSubmission(
        "sale",
        async () => {
          await operationsService.createSale(selectedCycleId, payload)
          setSaleForm({
            saleDate: "",
            birdsSold: "",
            averageSellingWeightKg: "",
            pricePerKg: "",
          })
        },
        "تم تسجيل عملية البيع وإغلاق الدورة عند نجاح المعاملة."
      )
    },
    [runSubmission, saleForm, selectedCycleId]
  )

  const settingsSubmit = React.useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      setStatusMessage({
        tone: "success",
        text: "تم حفظ الإعدادات المحلية للواجهة.",
      })
    },
    []
  )

  const dashboardContent = (
    <div className="space-y-5">
      <SurfaceCard className="p-5 sm:p-6">
        <PageHeader
          eyebrow="اليوم التشغيلي"
          title="صباح الخير، مدير المزرعة"
          description="هذه نظرة فورية على ما يحدث في دورة التسمين الحالية، بنفس بنية اللوحة المرجعية: بطاقات المؤشرات، الرسوم، والعمليات الأخيرة."
          actions={
            <>
              <Button
                variant="outline"
                className="h-11 rounded-2xl border-[#DDE7D7] bg-white px-4 text-slate-600"
                onClick={() => {
                  void refresh()
                }}
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

        <div className="mt-6 rounded-[1.6rem] border border-[#E5ECE2] bg-[#FCFDFB] px-5 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]">
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
        </div>

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

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
        {metrics.length > 0
          ? metrics.map((metric) => (
              <MetricCard key={metric.label} {...metric} />
            ))
          : Array.from({ length: 12 }).map((_, index) => (
              <MetricCard
                key={index}
                label="تحميل"
                value={isLoading ? "جارٍ التحميل..." : "—"}
                meta="بانتظار البيانات الحية"
                icon={Gauge}
                iconClassName="text-slate-400"
                iconSurfaceClassName="bg-slate-100"
              />
            ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <SurfaceCard className="p-5 sm:p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Feed Consumption (kg)
              </p>
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
              <p className="text-sm font-medium text-slate-500">
                Mortality (Birds)
              </p>
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
              <p className="text-sm font-medium text-slate-500">
                Weight Growth (kg)
              </p>
              <h3 className="mt-1 font-heading text-lg font-semibold text-slate-900">
                الفعلي مقابل المستهدف
              </h3>
            </div>
            <div className="flex items-center gap-4 text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <span className="size-2 rounded-full bg-[#72AE71]" />
                متوسط
              </span>
              <span className="flex items-center gap-1">
                <span className="size-2 rounded-full bg-[#F1A84B]" />
                مستهدف
              </span>
            </div>
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
            <div className="absolute inset-0">
              <LineChart
                values={targetWeightSeries}
                stroke="#F1A84B"
                dashed
                heightClassName="h-40"
              />
            </div>
          </div>
        </SurfaceCard>

        <SurfaceCard className="p-5 sm:p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Temperature (°C)
              </p>
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
              <p className="text-sm font-medium text-slate-500">Humidity (%)</p>
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

  const cyclesContent = (
    <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
      <div className="space-y-5">
        <SurfaceCard className="p-5 sm:p-6">
          <PageHeader
            eyebrow="دورات الإنتاج"
            title="إدارة دورات التسمين"
            description="اعرض جميع الدورات، راقب الحالة الحالية، وأنشئ دورة جديدة بنفس أسلوب البطاقات النظيفة المستخدم في اللوحة الرئيسية."
            actions={
              <Button
                variant="outline"
                className="h-11 rounded-2xl border-[#DDE7D7] bg-white px-4 text-slate-600"
                onClick={() => {
                  void refresh()
                }}
              >
                <RefreshCw className="size-4" />
                مزامنة الدورات
              </Button>
            }
          />
        </SurfaceCard>

        <div className="grid gap-4 md:grid-cols-2">
          {cycles.map((cycle) => (
            <SurfaceCard key={cycle.id} className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="mb-2 flex items-center gap-2">
                    <span
                      className={cn(
                        "rounded-full px-2.5 py-1 text-xs font-semibold",
                        cycle.status === "ACTIVE"
                          ? "bg-[#E8F5E4] text-[#5E905C]"
                          : "bg-[#EEF2F7] text-slate-500"
                      )}
                    >
                      {cycle.status}
                    </span>
                    <span className="text-xs text-slate-400">{cycle.id}</span>
                  </div>
                  <h3 className="font-heading text-xl font-semibold text-slate-900">
                    {cycle.name}
                  </h3>
                  <p className="mt-2 text-sm text-slate-500">
                    بدأت {formatDate(cycle.startDate)} •{" "}
                    {formatNumber(cycle.initialBirds)} طائر
                  </p>
                </div>
                <Button
                  variant={selectedCycleId === cycle.id ? "default" : "outline"}
                  className={cn(
                    "h-10 rounded-2xl px-4",
                    selectedCycleId === cycle.id
                      ? "bg-[#7EA974] text-white"
                      : "border-[#DDE7D7] bg-white text-slate-600"
                  )}
                  onClick={() => {
                    setSelectedCycleId(cycle.id)
                    setActivePage("dashboard")
                  }}
                >
                  {selectedCycleId === cycle.id ? "الحالية" : "فتح"}
                </Button>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-2xl bg-[#F7FAF5] p-3">
                  <p className="text-xs text-slate-400">الوزن المستهدف</p>
                  <p className="mt-1 font-medium text-slate-800">
                    {formatNumber(cycle.expectedFinalWeightKg)} كجم
                  </p>
                </div>
                <div className="rounded-2xl bg-[#F7FAF5] p-3">
                  <p className="text-xs text-slate-400">سعر البيع المتوقع</p>
                  <p className="mt-1 font-medium text-slate-800">
                    {formatCurrency(cycle.expectedSellingPricePerKg)}
                  </p>
                </div>
              </div>
            </SurfaceCard>
          ))}
        </div>
      </div>

      <div className="space-y-5">
        <ActionNotice message={statusMessage} />
        <FormPanel
          title="إنشاء دورة جديدة"
          description="أدخل بيانات دورة إنتاج جديدة، وستظهر فورًا ضمن قائمة الدورات المتاحة ويمكن اختيارها من اللوحة الرئيسية."
          submitLabel="حفظ الدورة"
          busy={submittingKey === "cycle"}
          onSubmit={submitCycle}
        >
          <InputField label="اسم الدورة">
            <TextInput
              value={cycleForm.name}
              onChange={(event) => {
                setCycleForm((current) => ({
                  ...current,
                  name: event.target.value,
                }))
              }}
              placeholder="مثال: دفعة تسمين رقم ٨"
              required
            />
          </InputField>
          <InputField label="تاريخ البداية">
            <TextInput
              type="date"
              value={cycleForm.startDate}
              onChange={(event) => {
                setCycleForm((current) => ({
                  ...current,
                  startDate: event.target.value,
                }))
              }}
              required
            />
          </InputField>
          <div className="grid gap-4 md:grid-cols-2">
            <InputField label="عدد الطيور الابتدائي">
              <TextInput
                type="number"
                min="1"
                value={cycleForm.initialBirds}
                onChange={(event) => {
                  setCycleForm((current) => ({
                    ...current,
                    initialBirds: event.target.value,
                  }))
                }}
                required
              />
            </InputField>
            <InputField label="سعر الكتكوت">
              <TextInput
                type="number"
                min="0"
                step="0.01"
                value={cycleForm.chickPrice}
                onChange={(event) => {
                  setCycleForm((current) => ({
                    ...current,
                    chickPrice: event.target.value,
                  }))
                }}
                required
              />
            </InputField>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <InputField label="الوزن النهائي المتوقع (كجم)">
              <TextInput
                type="number"
                min="0.1"
                step="0.01"
                value={cycleForm.expectedFinalWeightKg}
                onChange={(event) => {
                  setCycleForm((current) => ({
                    ...current,
                    expectedFinalWeightKg: event.target.value,
                  }))
                }}
                required
              />
            </InputField>
            <InputField label="سعر البيع المتوقع / كجم">
              <TextInput
                type="number"
                min="0"
                step="0.01"
                value={cycleForm.expectedSellingPricePerKg}
                onChange={(event) => {
                  setCycleForm((current) => ({
                    ...current,
                    expectedSellingPricePerKg: event.target.value,
                  }))
                }}
                required
              />
            </InputField>
          </div>
          <InputField label="التكلفة المتبقية المتوقعة">
            <TextInput
              type="number"
              min="0"
              step="0.01"
              value={cycleForm.expectedRemainingCost}
              onChange={(event) => {
                setCycleForm((current) => ({
                  ...current,
                  expectedRemainingCost: event.target.value,
                }))
              }}
              required
            />
          </InputField>
        </FormPanel>
      </div>
    </div>
  )

  const dailyContent = (
    <div className="grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
      <div className="space-y-5">
        <ActionNotice message={statusMessage} />
        <FormPanel
          title="إضافة سجل يومي"
          description="نفس اللغة البصرية للوحة المؤشرات، ولكن مخصصة لإدخال النفوق واستهلاك العلف والظروف البيئية اليومية."
          submitLabel="حفظ السجل اليومي"
          busy={submittingKey === "daily"}
          disabled={!canUseCycleActions}
          onSubmit={submitDailyLog}
        >
          <InputField label="التاريخ">
            <TextInput
              type="date"
              value={dailyLogForm.date}
              onChange={(event) => {
                setDailyLogForm((current) => ({
                  ...current,
                  date: event.target.value,
                }))
              }}
              required
            />
          </InputField>
          <div className="grid gap-4 md:grid-cols-2">
            <InputField label="النفوق">
              <TextInput
                type="number"
                min="0"
                value={dailyLogForm.deaths}
                onChange={(event) => {
                  setDailyLogForm((current) => ({
                    ...current,
                    deaths: event.target.value,
                  }))
                }}
                required
              />
            </InputField>
            <InputField label="استهلاك العلف (كجم)">
              <TextInput
                type="number"
                min="0"
                step="0.01"
                value={dailyLogForm.feedConsumedKg}
                onChange={(event) => {
                  setDailyLogForm((current) => ({
                    ...current,
                    feedConsumedKg: event.target.value,
                  }))
                }}
                required
              />
            </InputField>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <InputField label="الحرارة °C">
              <TextInput
                type="number"
                step="0.1"
                value={dailyLogForm.temperature}
                onChange={(event) => {
                  setDailyLogForm((current) => ({
                    ...current,
                    temperature: event.target.value,
                  }))
                }}
              />
            </InputField>
            <InputField label="الرطوبة %">
              <TextInput
                type="number"
                step="0.1"
                value={dailyLogForm.humidity}
                onChange={(event) => {
                  setDailyLogForm((current) => ({
                    ...current,
                    humidity: event.target.value,
                  }))
                }}
              />
            </InputField>
          </div>
          <InputField label="ملاحظات">
            <TextAreaInput
              value={dailyLogForm.notes}
              onChange={(event) => {
                setDailyLogForm((current) => ({
                  ...current,
                  notes: event.target.value,
                }))
              }}
              placeholder="سلوك الطيور، التهوية، حالة العنبر..."
            />
          </InputField>
        </FormPanel>
      </div>

      <DataTable
        title="آخر العمليات اليومية"
        rows={[...operations.dailyLogs.data].sort((left, right) =>
          right.date.localeCompare(left.date)
        )}
        emptyText="لا توجد سجلات يومية مسجلة حتى الآن."
        columns={[
          {
            key: "date",
            title: "التاريخ",
            render: (row: DailyLog) => formatDate(row.date),
          },
          {
            key: "deaths",
            title: "النفوق",
            render: (row: DailyLog) => formatNumber(row.deaths),
          },
          {
            key: "feed",
            title: "العلف",
            render: (row: DailyLog) =>
              `${formatNumber(row.feedConsumedKg)} كجم`,
          },
          {
            key: "temp",
            title: "الحرارة",
            render: (row: DailyLog) =>
              `${formatNullableNumber(row.temperature)} °م`,
          },
          {
            key: "humidity",
            title: "الرطوبة",
            render: (row: DailyLog) =>
              `${formatNullableNumber(row.humidity)} %`,
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

  const feedContent = (
    <div className="grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
      <div className="space-y-5">
        <ActionNotice message={statusMessage} />
        <FormPanel
          title="تسجيل شراء علف"
          description="استخدم نفس أسلوب الحقول المستديرة والبطاقات البيضاء لإضافة نوع العلف والكمية وسعر الوحدة."
          submitLabel="حفظ المشتريات"
          busy={submittingKey === "feed"}
          disabled={!canUseCycleActions}
          onSubmit={submitFeedPurchase}
        >
          <InputField label="تاريخ الشراء">
            <TextInput
              type="date"
              value={feedForm.purchaseDate}
              onChange={(event) => {
                setFeedForm((current) => ({
                  ...current,
                  purchaseDate: event.target.value,
                }))
              }}
              required
            />
          </InputField>
          <InputField label="نوع العلف">
            <SelectInput
              value={feedForm.feedType}
              onChange={(event) => {
                setFeedForm((current) => ({
                  ...current,
                  feedType: event.target.value as FeedType,
                }))
              }}
              options={feedTypeOptions}
            />
          </InputField>
          <div className="grid gap-4 md:grid-cols-2">
            <InputField label="الكمية (كجم)">
              <TextInput
                type="number"
                min="0.1"
                step="0.01"
                value={feedForm.quantityKg}
                onChange={(event) => {
                  setFeedForm((current) => ({
                    ...current,
                    quantityKg: event.target.value,
                  }))
                }}
                required
              />
            </InputField>
            <InputField label="سعر الوحدة">
              <TextInput
                type="number"
                min="0"
                step="0.01"
                value={feedForm.unitPrice}
                onChange={(event) => {
                  setFeedForm((current) => ({
                    ...current,
                    unitPrice: event.target.value,
                  }))
                }}
                required
              />
            </InputField>
          </div>
        </FormPanel>
      </div>

      <DataTable
        title="مشتريات العلف"
        rows={[...operations.feedPurchases.data].sort((left, right) =>
          right.purchaseDate.localeCompare(left.purchaseDate)
        )}
        emptyText="لا توجد مشتريات علف مسجلة حتى الآن."
        columns={[
          {
            key: "date",
            title: "التاريخ",
            render: (row) => formatDate(row.purchaseDate),
          },
          {
            key: "type",
            title: "نوع العلف",
            render: (row) =>
              row.feedType === "STARTER"
                ? "بادئ"
                : row.feedType === "GROWER"
                  ? "نامي"
                  : "ناهٍ",
          },
          {
            key: "qty",
            title: "الكمية",
            render: (row) => `${formatNumber(row.quantityKg)} كجم`,
          },
          {
            key: "price",
            title: "سعر الوحدة",
            render: (row) => formatCurrency(row.unitPrice),
          },
          {
            key: "total",
            title: "الإجمالي",
            render: (row) => formatCurrency(row.quantityKg * row.unitPrice),
          },
        ]}
      />
    </div>
  )

  const weightContent = (
    <div className="grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
      <div className="space-y-5">
        <ActionNotice message={statusMessage} />
        <FormPanel
          title="تسجيل وزن جديد"
          description="أدخل متوسط الوزن وعدد العينة، وسينعكس ذلك مباشرة في رسم النمو على لوحة التحكم."
          submitLabel="حفظ الوزن"
          busy={submittingKey === "weight"}
          disabled={!canUseCycleActions}
          onSubmit={submitWeightLog}
        >
          <InputField label="التاريخ">
            <TextInput
              type="date"
              value={weightForm.date}
              onChange={(event) => {
                setWeightForm((current) => ({
                  ...current,
                  date: event.target.value,
                }))
              }}
              required
            />
          </InputField>
          <div className="grid gap-4 md:grid-cols-2">
            <InputField label="حجم العينة">
              <TextInput
                type="number"
                min="1"
                value={weightForm.sampleSize}
                onChange={(event) => {
                  setWeightForm((current) => ({
                    ...current,
                    sampleSize: event.target.value,
                  }))
                }}
                required
              />
            </InputField>
            <InputField label="متوسط الوزن (كجم)">
              <TextInput
                type="number"
                min="0.1"
                step="0.01"
                value={weightForm.averageWeightKg}
                onChange={(event) => {
                  setWeightForm((current) => ({
                    ...current,
                    averageWeightKg: event.target.value,
                  }))
                }}
                required
              />
            </InputField>
          </div>
          <InputField label="ملاحظات">
            <TextAreaInput
              value={weightForm.notes}
              onChange={(event) => {
                setWeightForm((current) => ({
                  ...current,
                  notes: event.target.value,
                }))
              }}
            />
          </InputField>
        </FormPanel>
      </div>

      <DataTable
        title="متابعة الأوزان"
        rows={[...operations.weightLogs.data].sort((left, right) =>
          right.date.localeCompare(left.date)
        )}
        emptyText="لا توجد قراءات وزن مسجلة حتى الآن."
        columns={[
          {
            key: "date",
            title: "التاريخ",
            render: (row) => formatDate(row.date),
          },
          {
            key: "sample",
            title: "العينة",
            render: (row) => formatNumber(row.sampleSize),
          },
          {
            key: "avg",
            title: "متوسط الوزن",
            render: (row) => `${formatNumber(row.averageWeightKg)} كجم`,
          },
          { key: "notes", title: "ملاحظات", render: (row) => row.notes ?? "—" },
        ]}
      />
    </div>
  )

  const medicationContent = (
    <div className="grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
      <div className="space-y-5">
        <ActionNotice message={statusMessage} />
        <FormPanel
          title="إضافة سجل دواء"
          description="نفس نظام التصميم المستخدم في جميع النماذج: حقول هادئة، حدود خفيفة، وأزرار خضراء متناسقة."
          submitLabel="حفظ الدواء"
          busy={submittingKey === "medication"}
          disabled={!canUseCycleActions}
          onSubmit={submitMedicationLog}
        >
          <InputField label="التاريخ">
            <TextInput
              type="date"
              value={medicationForm.date}
              onChange={(event) => {
                setMedicationForm((current) => ({
                  ...current,
                  date: event.target.value,
                }))
              }}
              required
            />
          </InputField>
          <InputField label="اسم الدواء">
            <TextInput
              value={medicationForm.medicineName}
              onChange={(event) => {
                setMedicationForm((current) => ({
                  ...current,
                  medicineName: event.target.value,
                }))
              }}
              required
            />
          </InputField>
          <div className="grid gap-4 md:grid-cols-2">
            <InputField label="الجرعة">
              <TextInput
                value={medicationForm.dosage}
                onChange={(event) => {
                  setMedicationForm((current) => ({
                    ...current,
                    dosage: event.target.value,
                  }))
                }}
                required
              />
            </InputField>
            <InputField label="التكلفة">
              <TextInput
                type="number"
                min="0"
                step="0.01"
                value={medicationForm.cost}
                onChange={(event) => {
                  setMedicationForm((current) => ({
                    ...current,
                    cost: event.target.value,
                  }))
                }}
                required
              />
            </InputField>
          </div>
          <InputField label="ملاحظات">
            <TextAreaInput
              value={medicationForm.notes}
              onChange={(event) => {
                setMedicationForm((current) => ({
                  ...current,
                  notes: event.target.value,
                }))
              }}
            />
          </InputField>
        </FormPanel>
      </div>

      <DataTable
        title="سجلات الأدوية"
        rows={[...operations.medicationLogs.data].sort((left, right) =>
          right.date.localeCompare(left.date)
        )}
        emptyText="لا توجد سجلات أدوية مسجلة حتى الآن."
        columns={[
          {
            key: "date",
            title: "التاريخ",
            render: (row: MedicationLog) => formatDate(row.date),
          },
          {
            key: "name",
            title: "الدواء",
            render: (row: MedicationLog) => row.medicineName,
          },
          {
            key: "dose",
            title: "الجرعة",
            render: (row: MedicationLog) => row.dosage,
          },
          {
            key: "cost",
            title: "التكلفة",
            render: (row: MedicationLog) => formatCurrency(row.cost),
          },
          {
            key: "notes",
            title: "ملاحظات",
            render: (row: MedicationLog) => row.notes ?? "—",
          },
        ]}
      />
    </div>
  )

  const expensesContent = (
    <div className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
      <div className="space-y-5">
        <ActionNotice message={statusMessage} />
        <FormPanel
          title="إضافة مصروف يدوي"
          description="تتبع المصروفات اليدوية بنفس التكوين البصري المتبع في الشاشة المرجعية، مع دعم تصنيف مباشر للفئات."
          submitLabel="حفظ المصروف"
          busy={submittingKey === "expense"}
          disabled={!canUseCycleActions}
          onSubmit={submitExpense}
        >
          <InputField label="التاريخ">
            <TextInput
              type="date"
              value={expenseForm.expenseDate}
              onChange={(event) => {
                setExpenseForm((current) => ({
                  ...current,
                  expenseDate: event.target.value,
                }))
              }}
              required
            />
          </InputField>
          <InputField label="الفئة">
            <SelectInput
              value={expenseForm.category}
              onChange={(event) => {
                setExpenseForm((current) => ({
                  ...current,
                  category: event.target.value as ExpenseCategory,
                }))
              }}
              options={expenseCategoryOptions}
            />
          </InputField>
          <InputField label="المبلغ">
            <TextInput
              type="number"
              min="0"
              step="0.01"
              value={expenseForm.amount}
              onChange={(event) => {
                setExpenseForm((current) => ({
                  ...current,
                  amount: event.target.value,
                }))
              }}
              required
            />
          </InputField>
          <InputField label="الوصف">
            <TextAreaInput
              value={expenseForm.description}
              onChange={(event) => {
                setExpenseForm((current) => ({
                  ...current,
                  description: event.target.value,
                }))
              }}
            />
          </InputField>
        </FormPanel>
      </div>

      <div className="space-y-5">
        <SurfaceCard className="p-5 sm:p-6">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                تفصيل المصروفات
              </p>
              <h3 className="mt-1 font-heading text-lg font-semibold text-slate-900">
                الفئات الأعلى تكلفة
              </h3>
            </div>
            <Wallet className="size-5 text-[#74A36A]" />
          </div>
          <div className="space-y-3">
            {Object.entries(operations.expenseBreakdown.data)
              .sort(([, leftValue], [, rightValue]) => rightValue - leftValue)
              .map(([category, value]) => (
                <div
                  key={category}
                  className="rounded-2xl border border-[#E8EEE4] bg-[#FBFCF8] px-4 py-3"
                >
                  <div className="flex items-center justify-between gap-3 text-sm text-slate-700">
                    <span>{category}</span>
                    <span className="font-medium text-slate-900">
                      {formatCurrency(value)}
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </SurfaceCard>

        <DataTable
          title="كل المصروفات"
          rows={[...operations.expenses.data].sort((left, right) =>
            right.expenseDate.localeCompare(left.expenseDate)
          )}
          emptyText="لا توجد مصروفات مسجلة بعد."
          columns={[
            {
              key: "date",
              title: "التاريخ",
              render: (row) => formatDate(row.expenseDate),
            },
            { key: "category", title: "الفئة", render: (row) => row.category },
            {
              key: "amount",
              title: "المبلغ",
              render: (row) => formatCurrency(row.amount),
            },
            {
              key: "source",
              title: "المصدر",
              render: (row) => row.sourceType ?? "يدوي",
            },
            {
              key: "desc",
              title: "الوصف",
              render: (row) => row.description ?? "—",
            },
          ]}
        />
      </div>
    </div>
  )

  const salesContent = (
    <div className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
      <div className="space-y-5">
        <ActionNotice message={statusMessage} />
        <FormPanel
          title="إغلاق الدورة وتسجيل البيع"
          description="هذا القسم يتبع نفس اللغة البصرية المرجعية، لكنه مخصص لتسجيل نتائج البيع النهائية للدورة المحددة."
          submitLabel="حفظ عملية البيع"
          busy={submittingKey === "sale"}
          disabled={!canUseCycleActions}
          onSubmit={submitSale}
        >
          <InputField label="تاريخ البيع">
            <TextInput
              type="date"
              value={saleForm.saleDate}
              onChange={(event) => {
                setSaleForm((current) => ({
                  ...current,
                  saleDate: event.target.value,
                }))
              }}
              required
            />
          </InputField>
          <div className="grid gap-4 md:grid-cols-2">
            <InputField label="عدد الطيور المباعة">
              <TextInput
                type="number"
                min="1"
                value={saleForm.birdsSold}
                onChange={(event) => {
                  setSaleForm((current) => ({
                    ...current,
                    birdsSold: event.target.value,
                  }))
                }}
                required
              />
            </InputField>
            <InputField label="متوسط وزن البيع (كجم)">
              <TextInput
                type="number"
                min="0.1"
                step="0.01"
                value={saleForm.averageSellingWeightKg}
                onChange={(event) => {
                  setSaleForm((current) => ({
                    ...current,
                    averageSellingWeightKg: event.target.value,
                  }))
                }}
                required
              />
            </InputField>
          </div>
          <InputField label="سعر البيع لكل كجم">
            <TextInput
              type="number"
              min="0"
              step="0.01"
              value={saleForm.pricePerKg}
              onChange={(event) => {
                setSaleForm((current) => ({
                  ...current,
                  pricePerKg: event.target.value,
                }))
              }}
              required
            />
          </InputField>
        </FormPanel>
      </div>

      <div className="space-y-5">
        <SurfaceCard className="p-5 sm:p-6">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">ملخص البيع</p>
              <h3 className="mt-1 font-heading text-lg font-semibold text-slate-900">
                وضع البيع الحالي
              </h3>
            </div>
            <CircleDollarSign className="size-5 text-[#74A36A]" />
          </div>
          {operations.sale.data ? (
            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-2xl bg-[#F7FAF5] p-4">
                <p className="text-xs text-slate-400">تاريخ البيع</p>
                <p className="mt-1 font-medium text-slate-900">
                  {formatDate(operations.sale.data.saleDate)}
                </p>
              </div>
              <div className="rounded-2xl bg-[#F7FAF5] p-4">
                <p className="text-xs text-slate-400">عدد الطيور المباعة</p>
                <p className="mt-1 font-medium text-slate-900">
                  {formatNumber(operations.sale.data.birdsSold)}
                </p>
              </div>
              <div className="rounded-2xl bg-[#F7FAF5] p-4">
                <p className="text-xs text-slate-400">متوسط وزن البيع</p>
                <p className="mt-1 font-medium text-slate-900">
                  {formatNumber(operations.sale.data.averageSellingWeightKg)}{" "}
                  كجم
                </p>
              </div>
              <div className="rounded-2xl bg-[#F7FAF5] p-4">
                <p className="text-xs text-slate-400">السعر لكل كجم</p>
                <p className="mt-1 font-medium text-slate-900">
                  {formatCurrency(operations.sale.data.pricePerKg)}
                </p>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-[#DDE7D7] bg-[#FBFCF8] px-4 py-8 text-sm text-slate-400">
              لم يتم تسجيل أي عملية بيع لهذه الدورة بعد.
            </div>
          )}
        </SurfaceCard>

        <SurfaceCard className="p-5 sm:p-6">
          <h3 className="font-heading text-lg font-semibold text-slate-900">
            نظرة عامة على الربحية
          </h3>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl bg-[#F7FAF5] p-4">
              <p className="text-xs text-slate-400">الإيراد الفعلي</p>
              <p className="mt-1 font-medium text-slate-900">
                {dashboard
                  ? formatNullableNumber(
                      dashboard.actualRevenue,
                      formatCurrency
                    )
                  : "—"}
              </p>
            </div>
            <div className="rounded-2xl bg-[#F7FAF5] p-4">
              <p className="text-xs text-slate-400">الربح الفعلي</p>
              <p className="mt-1 font-medium text-slate-900">
                {dashboard
                  ? formatNullableNumber(dashboard.actualProfit, formatCurrency)
                  : "—"}
              </p>
            </div>
          </div>
        </SurfaceCard>
      </div>
    </div>
  )

  const reportsContent = (
    <div className="space-y-5">
      <SurfaceCard className="p-5 sm:p-6">
        <PageHeader
          eyebrow="التقارير"
          title="تقارير الدورة الحالية"
          description="هذه الصفحة تعرض خلاصة التقرير، أهم المؤشرات المستخرجة، وتفصيل المصروفات بصياغة بصرية متوافقة مع بقية التطبيق."
          actions={
            <Button className="h-11 rounded-2xl bg-[#7EA974] px-5 text-white hover:bg-[#6C9562]">
              تحديث التقرير
            </Button>
          }
        />
      </SurfaceCard>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="الطيور الابتدائية"
          value={report ? formatNumber(report.initialBirds) : "—"}
          icon={Egg}
          meta="عند بداية الدورة"
          iconClassName="text-[#E7A922]"
          iconSurfaceClassName="bg-[#FFF6DA]"
        />
        <MetricCard
          label="الطيور المتبقية"
          value={report ? formatNumber(report.remainingBirds) : "—"}
          icon={Bird}
          meta="جاهزة للبيع"
          iconClassName="text-[#71B16B]"
          iconSurfaceClassName="bg-[#EAF7E8]"
        />
        <MetricCard
          label="تكلفة العلف"
          value={report ? formatCurrency(report.feedCost) : "—"}
          icon={Drumstick}
          meta="الإجمالي الحالي"
          iconClassName="text-[#4F95D8]"
          iconSurfaceClassName="bg-[#EAF5FF]"
        />
        <MetricCard
          label="تكلفة الأدوية"
          value={report ? formatCurrency(report.medicationCost) : "—"}
          icon={FlaskConical}
          meta="مصروفات العلاج"
          iconClassName="text-[#A67FE0]"
          iconSurfaceClassName="bg-[#F6EDFF]"
        />
      </div>
      <div className="grid gap-4 xl:grid-cols-[1fr_0.9fr]">
        <DataTable
          title="تفصيل المصروفات"
          rows={Object.entries(operations.expenseBreakdown.data).map(
            ([category, amount]) => ({ category, amount })
          )}
          emptyText="لا توجد بيانات تفصيلية للتقرير."
          columns={[
            { key: "category", title: "الفئة", render: (row) => row.category },
            {
              key: "amount",
              title: "المبلغ",
              render: (row) => formatCurrency(row.amount),
            },
          ]}
        />
        <SurfaceCard className="p-5 sm:p-6">
          <h3 className="font-heading text-lg font-semibold text-slate-900">
            ملاحظات التقرير
          </h3>
          <div className="mt-4 space-y-3 text-sm text-slate-600">
            <div className="rounded-2xl bg-[#F7FAF5] p-4">
              معامل التحويل الحالي:{" "}
              {report ? formatNullableNumber(report.actualFcr) : "—"}
            </div>
            <div className="rounded-2xl bg-[#F7FAF5] p-4">
              الربح المتوقع:{" "}
              {report ? formatCurrency(report.estimatedProfit) : "—"}
            </div>
            <div className="rounded-2xl bg-[#F7FAF5] p-4">
              آخر وزن مسجل:{" "}
              {report
                ? `${formatNullableNumber(report.latestAverageWeightKg)} كجم`
                : "—"}
            </div>
            <div className="rounded-2xl bg-[#F7FAF5] p-4">
              عنوان واجهة API: {apiBaseUrl}
            </div>
          </div>
        </SurfaceCard>
      </div>
    </div>
  )

  const settingsContent = (
    <div className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
      <div className="space-y-5">
        <ActionNotice message={statusMessage} />
        <FormPanel
          title="إعدادات الواجهة"
          description="صفحة إعدادات متسقة مع بقية النظام، لتجميع تفضيلات العرض والتنبيهات وبيانات المسؤول."
          submitLabel="حفظ الإعدادات"
          busy={submittingKey === "settings"}
          onSubmit={settingsSubmit}
        >
          <InputField label="اسم المزرعة">
            <TextInput
              value={settingsForm.farmName}
              onChange={(event) =>
                setSettingsForm((current) => ({
                  ...current,
                  farmName: event.target.value,
                }))
              }
            />
          </InputField>
          <InputField label="اسم المسؤول">
            <TextInput
              value={settingsForm.managerName}
              onChange={(event) =>
                setSettingsForm((current) => ({
                  ...current,
                  managerName: event.target.value,
                }))
              }
            />
          </InputField>
          <InputField label="البريد الإلكتروني">
            <TextInput
              type="email"
              value={settingsForm.email}
              onChange={(event) =>
                setSettingsForm((current) => ({
                  ...current,
                  email: event.target.value,
                }))
              }
            />
          </InputField>
          <InputField label="العملة الافتراضية">
            <TextInput
              value={settingsForm.currencyLabel}
              onChange={(event) =>
                setSettingsForm((current) => ({
                  ...current,
                  currencyLabel: event.target.value,
                }))
              }
            />
          </InputField>
          <label className="flex items-center justify-between rounded-2xl border border-[#E3E8DF] bg-[#FBFCF8] px-4 py-3 text-sm text-slate-700">
            <span>تفعيل تنبيهات البيئة</span>
            <input
              type="checkbox"
              checked={settingsForm.enableAlerts}
              onChange={(event) => {
                setSettingsForm((current) => ({
                  ...current,
                  enableAlerts: event.target.checked,
                }))
              }}
              className="size-4 rounded border-[#DDE7D7] text-[#7EA974]"
            />
          </label>
        </FormPanel>
      </div>

      <SurfaceCard className="p-5 sm:p-6">
        <PageHeader
          eyebrow="النظام"
          title="ملخص الإعدادات الحالية"
          description="هذه المساحة توضح كيف تُستخدم نفس بطاقات النظام الهادئة لعرض المعلومات غير التشغيلية أيضًا."
        />
        <div className="mt-5 space-y-3 text-sm text-slate-600">
          <div className="rounded-2xl bg-[#F7FAF5] p-4">
            عنوان API: {apiBaseUrl}
          </div>
          <div className="rounded-2xl bg-[#F7FAF5] p-4">
            الدورة الحالية: {selectedCycle?.name ?? "لا توجد دورة مختارة"}
          </div>
          <div className="rounded-2xl bg-[#F7FAF5] p-4">
            تنبيهات البيئة: {settingsForm.enableAlerts ? "مفعلة" : "معطلة"}
          </div>
          <div className="rounded-2xl bg-[#F7FAF5] p-4">
            اختصارات تغيير المظهر ما زالت متاحة عبر مزود السمات الحالي.
          </div>
        </div>
      </SurfaceCard>
    </div>
  )

  const contentByPage: Record<PageId, React.ReactNode> = {
    dashboard: dashboardContent,
    cycles: cyclesContent,
    daily: dailyContent,
    feed: feedContent,
    weight: weightContent,
    medication: medicationContent,
    expenses: expensesContent,
    sales: salesContent,
    reports: reportsContent,
    settings: settingsContent,
  }

  return (
    <div className="min-h-svh bg-[radial-gradient(circle_at_10%_0%,rgba(201,226,189,0.26),transparent_28%),linear-gradient(180deg,#fbfbf8_0%,#f7f8f2_60%,#f3f4ee_100%)] text-slate-900">
      <div className="mx-auto flex min-h-svh max-w-[1520px] gap-5 px-3 py-3 sm:px-4 lg:px-5">
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
              const isActive = activePage === item.id

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActivePage(item.id)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition",
                    isActive
                      ? "bg-[#EEF5E8] text-[#5E8F58] shadow-[inset_0_0_0_1px_rgba(126,169,116,0.06)]"
                      : "text-slate-600 hover:bg-white hover:text-slate-900"
                  )}
                >
                  <Icon className="size-4" />
                  <span>{item.label}</span>
                </button>
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
                <p className="truncate text-xs text-slate-500">
                  farm@example.com
                </p>
              </div>
              <ChevronDown className="size-4 text-slate-400" />
            </div>
          </div>
        </aside>

        <main className="flex min-w-0 flex-1 flex-col gap-5">
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
              const isActive = item.id === activePage

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActivePage(item.id)}
                  className={cn(
                    "flex shrink-0 items-center gap-2 rounded-2xl border px-4 py-2.5 text-sm",
                    isActive
                      ? "border-[#CFE0C8] bg-[#EEF5E8] text-[#5E8F58]"
                      : "border-[#E5ECE2] bg-white text-slate-600"
                  )}
                >
                  <Icon className="size-4" />
                  {item.label}
                </button>
              )
            })}
          </div>

          {contentByPage[activePage]}
        </main>
      </div>
    </div>
  )
}

export default App

import * as React from "react"
import {
  Activity,
  Bird,
  CalendarDays,
  Drumstick,
  Scale,
  Thermometer,
  Wallet,
  Waves,
} from "lucide-react"

import DataTable from "@/components/common/DataTable"
import EmptyState from "@/components/common/EmptyState"
import PageHeader from "@/components/common/PageHeader"
import SurfaceCard from "@/components/common/SurfaceCard"
import BarLineChart from "@/components/dashboard/BarLineChart"
import LineChart from "@/components/dashboard/LineChart"
import MetricCard from "@/components/dashboard/MetricCard"
import { useFarmCycle } from "@/context/FarmCycleContext"
import {
  useDailyLogsQuery,
  useDashboardSummaryQuery,
  useWeightLogsQuery,
  getErrorMessage,
} from "@/hooks/use-farm-queries"
import {
  buildCumulative,
  deriveHealthState,
  getLastNumericValue,
} from "@/lib/farm-utils"
import {
  formatCurrency,
  formatDate,
  formatNullableNumber,
  formatNumber,
  formatPercent,
} from "@/lib/format"
import type { DailyLog } from "@/types/api"

export default function Dashboard() {
  const { selectedCycle, selectedCycleId, refreshAll } = useFarmCycle()
  const dashboardQuery = useDashboardSummaryQuery(selectedCycleId)
  const dailyLogsQuery = useDailyLogsQuery(selectedCycleId)
  const weightLogsQuery = useWeightLogsQuery(selectedCycleId)

  const dashboard = dashboardQuery.data ?? null
  const dailyLogs = dailyLogsQuery.data ?? []
  const weightLogs = weightLogsQuery.data ?? []

  const latestTemperature = getLastNumericValue(
    dashboard?.charts.temperature.map((point) => point.value) ?? []
  )
  const latestHumidity = getLastNumericValue(
    dashboard?.charts.humidity.map((point) => point.value) ?? []
  )
  const healthState = deriveHealthState(
    latestTemperature ?? null,
    latestHumidity ?? null
  )

  const recentDailyLogs = React.useMemo(
    () =>
      [...dailyLogs]
        .sort((left, right) => right.date.localeCompare(left.date))
        .slice(0, 5),
    [dailyLogs]
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

  const metrics = dashboard
    ? [
        {
          label: "اليوم الحالى",
          value: formatNumber(dashboard.currentDay),
          meta: selectedCycle ? selectedCycle.name : undefined,
          icon: CalendarDays,
          iconClassName: "text-slate-500",
          iconSurfaceClassName: "bg-slate-100",
        },
        {
          label: "الطيور المتبقية",
          value: formatNumber(dashboard.remainingBirds),
          meta: `من ${dashboard.initialBirds}طائر`,
          icon: Bird,
          iconClassName: "text-[#71B16B]",
          iconSurfaceClassName: "bg-[#EAF7E8]",
        },
        {
          label: "معدل الوفيات",
          value: formatPercent(dashboard.mortalityRate),
          meta: `${formatNumber(dashboard.totalDeaths)} إجمالى وفيات`,
          icon: Activity,
          iconClassName: "text-[#E47B6E]",
          iconSurfaceClassName: "bg-[#FFF5F2]",
        },
        {
          label: "العلف المستهلك",
          value: `${formatNumber(dashboard.totalFeedConsumedKg)} كجم`,
          // meta: `Cost ${formatCurrency(dashboard.feedCost)}`,
          icon: Drumstick,
          iconClassName: "text-[#4F95D8]",
          iconSurfaceClassName: "bg-[#EAF5FF]",
        },
        {
          label: "أخر حساب وزن",
          value: `${formatNullableNumber(dashboard.latestAverageWeightKg)} كجم`,
          meta: weightLogs[0]
            ? formatDate(weightLogs[0].date)
            : "لا توجد قراءات بعد",
          icon: Scale,
          iconClassName: "text-[#62A772]",
          iconSurfaceClassName: "bg-[#F0F8EE]",
        },
        {
          label: "إجمالى التكاليف",
          value: formatCurrency(dashboard.totalExpenses),
          // meta: `تكاليف ${formatCurrency(dashboard.totalExpenses)}`,
          icon: Wallet,
          iconClassName: "text-[#F08A35]",
          iconSurfaceClassName: "bg-[#FFF5EA]",
        },
      ]
    : []

  const errorMessage = [
    dashboardQuery.error,
    dailyLogsQuery.error,
    weightLogsQuery.error,
  ]
    .filter(Boolean)
    .map((error) => getErrorMessage(error))
    .join(" ")

  if (!selectedCycleId) {
    return (
      <EmptyState
        title="ابدأ بإضافة دورة"
        description="أنشئ دورة جديدة من صفحة الدورات حتى تبدأ متابعة الأداء والعمليات اليومية."
      />
    )
  }

  return (
    <div className="space-y-5">
      {/* <SurfaceCard className="p-5 sm:p-6">
        <PageHeader
          eyebrow="نظرة عامة"
          title={selectedCycle?.name ?? "لوحة التحكم"}
          description="لوحة مقسمة إلى بطاقات ورسوم وجداول، وكل جزء منها يقرأ من React Query بدل التحميل اليدوي داخل App.tsx."
          actions={
            <button
              type="button"
              className="rounded-2xl bg-[#7EA974] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#6C9562]"
              onClick={() => {
                void refreshAll()
              }}
            >
              تحديث البيانات
            </button>
          }
        />
      </SurfaceCard> */}

      {errorMessage ? (
        <div className="rounded-[1.5rem] border border-destructive/15 bg-destructive/6 px-4 py-3 text-sm text-destructive">
          {errorMessage}
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {metrics.map((metric) => (
          <MetricCard key={metric.label} {...metric} />
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <SurfaceCard className="p-5 sm:p-6">
          <div className="mb-4">
            <h3 className="mt-1 font-heading text-lg font-semibold text-slate-900">
              استهلاك العلف اليومي (كجم)
            </h3>
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
          <div className="mb-4">
            <h3 className="mt-1 font-heading text-lg font-semibold text-slate-900">
              الوفيات اليومي مقابل التراكمي
            </h3>
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
              <h3 className="mt-1 font-heading text-lg font-semibold text-slate-900">
                متوسط الوزن (كجم)
              </h3>
            </div>
            <Scale className="size-4 text-[#72AE71]" />
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
          </div>
        </SurfaceCard>

        <SurfaceCard className="p-5 sm:p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
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
              <h3 className="mt-1 font-heading text-lg font-semibold text-slate-900">
                الرطوبة
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
        rows={recentDailyLogs}
        emptyText="لا توجد عمليات يومية مسجلة بعد."
        columns={[
          {
            key: "date",
            title: "التاريخ",
            render: (row: DailyLog) => formatDate(row.date),
          },
          {
            key: "deaths",
            title: "الوفيات",
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
            render: (row: DailyLog) => formatNullableNumber(row.temperature),
          },
          {
            key: "humidity",
            title: "الرطوبة",
            render: (row: DailyLog) => formatNullableNumber(row.humidity),
          },
          {
            key: "notes",
            title: "ملاحظات",
            render: (row: DailyLog) => row.notes ?? "--",
          },
        ]}
      />
    </div>
  )
}

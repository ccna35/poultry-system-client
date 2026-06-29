import { Bird, Drumstick, Egg, FlaskConical } from "lucide-react"

import DataTable from "@/components/common/DataTable"
import EmptyState from "@/components/common/EmptyState"
import PageHeader from "@/components/common/PageHeader"
import SurfaceCard from "@/components/common/SurfaceCard"
import MetricCard from "@/components/dashboard/MetricCard"
import { useFarmCycle } from "@/context/FarmCycleContext"
import {
  useDashboardReportQuery,
  useExpenseBreakdownQuery,
} from "@/hooks/use-farm-queries"
import {
  formatCurrency,
  formatNullableNumber,
  formatNumber,
} from "@/lib/format"

export default function Reports() {
  const { selectedCycle, selectedCycleId } = useFarmCycle()
  const reportQuery = useDashboardReportQuery(selectedCycleId)
  const expenseBreakdownQuery = useExpenseBreakdownQuery(selectedCycleId)

  if (!selectedCycleId) {
    return (
      <EmptyState
        title="لا توجد دورة محددة"
        description="اختر دورة أولًا لعرض التقرير."
      />
    )
  }

  const report = reportQuery.data
  const expenseRows = Object.entries(expenseBreakdownQuery.data ?? {}).map(
    ([category, amount]) => ({
      category,
      amount,
    })
  )
  const apiBaseUrl =
    import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000"

  return (
    <div className="space-y-5">
      <SurfaceCard className="p-5 sm:p-6">
        <PageHeader
          eyebrow="التقارير"
          title={`تقرير الدورة - ${selectedCycle?.name ?? ""}`}
          description="قراءة منفصلة لبيانات التقرير بدل مزجها مع بقية الصفحات داخل نفس الملف."
        />
      </SurfaceCard>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="الطيور الابتدائية"
          value={report ? formatNumber(report.initialBirds) : "--"}
          icon={Egg}
          meta="عند بداية الدورة"
          iconClassName="text-[#E7A922]"
          iconSurfaceClassName="bg-[#FFF6DA]"
        />
        <MetricCard
          label="الطيور المتبقية"
          value={report ? formatNumber(report.remainingBirds) : "--"}
          icon={Bird}
          meta="جاهزة للبيع"
          iconClassName="text-[#71B16B]"
          iconSurfaceClassName="bg-[#EAF7E8]"
        />
        <MetricCard
          label="تكلفة العلف"
          value={report ? formatCurrency(report.feedCost) : "--"}
          icon={Drumstick}
          meta="الإجمالي الحالي"
          iconClassName="text-[#4F95D8]"
          iconSurfaceClassName="bg-[#EAF5FF]"
        />
        <MetricCard
          label="تكلفة الأدوية"
          value={report ? formatCurrency(report.medicationCost) : "--"}
          icon={FlaskConical}
          meta="مصروفات العلاج"
          iconClassName="text-[#A67FE0]"
          iconSurfaceClassName="bg-[#F6EDFF]"
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_0.9fr]">
        <DataTable
          title="تفاصيل المصروفات"
          rows={expenseRows}
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
              {report ? formatNullableNumber(report.actualFcr) : "--"}
            </div>
            <div className="rounded-2xl bg-[#F7FAF5] p-4">
              الربح المتوقع:{" "}
              {report ? formatCurrency(report.estimatedProfit) : "--"}
            </div>
            <div className="rounded-2xl bg-[#F7FAF5] p-4">
              آخر وزن مسجل:{" "}
              {report
                ? `${formatNullableNumber(report.latestAverageWeightKg)} كجم`
                : "--"}
            </div>
          </div>
        </SurfaceCard>
      </div>
    </div>
  )
}

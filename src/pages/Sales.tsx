import { useState } from "react"
import { CircleDollarSign } from "lucide-react"

import ActionNotice, { type StatusMessage } from "@/components/common/ActionNotice"
import EmptyState from "@/components/common/EmptyState"
import FormPanel from "@/components/common/FormPanel"
import InputField from "@/components/common/InputField"
import PageHeader from "@/components/common/PageHeader"
import SurfaceCard from "@/components/common/SurfaceCard"
import TextInput from "@/components/common/TextInput"
import { useFarmCycle } from "@/context/FarmCycleContext"
import { useCreateSaleMutation } from "@/hooks/use-farm-mutations"
import { useDashboardSummaryQuery, useSaleQuery } from "@/hooks/use-farm-queries"
import { formatCurrency, formatDate, formatNullableNumber, formatNumber } from "@/lib/format"
import { toNumber } from "@/lib/farm-utils"
import type { CreateSaleRequest } from "@/types/api"

export default function Sales() {
  const { selectedCycle, selectedCycleId } = useFarmCycle()
  const saleQuery = useSaleQuery(selectedCycleId)
  const dashboardQuery = useDashboardSummaryQuery(selectedCycleId)
  const createSaleMutation = useCreateSaleMutation(selectedCycleId)
  const [statusMessage, setStatusMessage] = useState<StatusMessage | null>(null)
  const [form, setForm] = useState({
    saleDate: "",
    birdsSold: "",
    averageSellingWeightKg: "",
    pricePerKg: "",
  })

  if (!selectedCycleId) {
    return <EmptyState title="لا توجد دورة محددة" description="اختر دورة أولًا لتسجيل البيع." />
  }

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setStatusMessage(null)

    const payload: CreateSaleRequest = {
      saleDate: form.saleDate,
      birdsSold: toNumber(form.birdsSold),
      averageSellingWeightKg: toNumber(form.averageSellingWeightKg),
      pricePerKg: toNumber(form.pricePerKg),
    }

    void createSaleMutation
      .mutateAsync(payload)
      .then(() => {
        setForm({ saleDate: "", birdsSold: "", averageSellingWeightKg: "", pricePerKg: "" })
        setStatusMessage({ tone: "success", text: "تم تسجيل عملية البيع." })
      })
      .catch((error: unknown) => {
        setStatusMessage({
          tone: "error",
          text: error instanceof Error ? error.message : "تعذر تسجيل البيع.",
        })
      })
  }

  const sale = saleQuery.data
  const dashboard = dashboardQuery.data

  return (
    <div className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
      <div className="space-y-5">
        <SurfaceCard className="p-5 sm:p-6">
          <PageHeader
            eyebrow="المبيعات"
            title={`المبيعات - ${selectedCycle?.name ?? ""}`}
            description="تسجيل البيع وإغلاق الدورة أصبح في صفحة مستقلة مع تحديث تلقائي للربحية والملخصات."
          />
        </SurfaceCard>
        <ActionNotice message={statusMessage} />
        <FormPanel
          title="إغلاق الدورة وتسجيل البيع"
          description="أدخل بيانات البيع النهائية للدورة الحالية."
          submitLabel="حفظ عملية البيع"
          busy={createSaleMutation.isPending}
          onSubmit={onSubmit}
        >
          <InputField label="تاريخ البيع">
            <TextInput type="date" value={form.saleDate} onChange={(event) => setForm((current) => ({ ...current, saleDate: event.target.value }))} required />
          </InputField>
          <div className="grid gap-4 md:grid-cols-2">
            <InputField label="عدد الطيور المباعة">
              <TextInput type="number" min="1" value={form.birdsSold} onChange={(event) => setForm((current) => ({ ...current, birdsSold: event.target.value }))} required />
            </InputField>
            <InputField label="متوسط وزن البيع">
              <TextInput type="number" min="0.1" step="0.01" value={form.averageSellingWeightKg} onChange={(event) => setForm((current) => ({ ...current, averageSellingWeightKg: event.target.value }))} required />
            </InputField>
          </div>
          <InputField label="سعر البيع لكل كجم">
            <TextInput type="number" min="0" step="0.01" value={form.pricePerKg} onChange={(event) => setForm((current) => ({ ...current, pricePerKg: event.target.value }))} required />
          </InputField>
        </FormPanel>
      </div>

      <div className="space-y-5">
        <SurfaceCard className="p-5 sm:p-6">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">ملخص البيع</p>
              <h3 className="mt-1 font-heading text-lg font-semibold text-slate-900">وضع البيع الحالي</h3>
            </div>
            <CircleDollarSign className="size-5 text-[#74A36A]" />
          </div>
          {sale ? (
            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-2xl bg-[#F7FAF5] p-4">
                <p className="text-xs text-slate-400">تاريخ البيع</p>
                <p className="mt-1 font-medium text-slate-900">{formatDate(sale.saleDate)}</p>
              </div>
              <div className="rounded-2xl bg-[#F7FAF5] p-4">
                <p className="text-xs text-slate-400">عدد الطيور المباعة</p>
                <p className="mt-1 font-medium text-slate-900">{formatNumber(sale.birdsSold)}</p>
              </div>
              <div className="rounded-2xl bg-[#F7FAF5] p-4">
                <p className="text-xs text-slate-400">متوسط وزن البيع</p>
                <p className="mt-1 font-medium text-slate-900">{formatNumber(sale.averageSellingWeightKg)} كجم</p>
              </div>
              <div className="rounded-2xl bg-[#F7FAF5] p-4">
                <p className="text-xs text-slate-400">السعر لكل كجم</p>
                <p className="mt-1 font-medium text-slate-900">{formatCurrency(sale.pricePerKg)}</p>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-[#DDE7D7] bg-[#FBFCF8] px-4 py-8 text-sm text-slate-400">
              لم يتم تسجيل أي عملية بيع لهذه الدورة بعد.
            </div>
          )}
        </SurfaceCard>

        <SurfaceCard className="p-5 sm:p-6">
          <h3 className="font-heading text-lg font-semibold text-slate-900">نظرة عامة على الربحية</h3>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl bg-[#F7FAF5] p-4">
              <p className="text-xs text-slate-400">الإيراد الفعلي</p>
              <p className="mt-1 font-medium text-slate-900">
                {dashboard ? formatNullableNumber(dashboard.actualRevenue, formatCurrency) : "--"}
              </p>
            </div>
            <div className="rounded-2xl bg-[#F7FAF5] p-4">
              <p className="text-xs text-slate-400">الربح الفعلي</p>
              <p className="mt-1 font-medium text-slate-900">
                {dashboard ? formatNullableNumber(dashboard.actualProfit, formatCurrency) : "--"}
              </p>
            </div>
          </div>
        </SurfaceCard>
      </div>
    </div>
  )
}

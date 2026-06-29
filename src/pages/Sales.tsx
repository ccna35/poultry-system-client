import { useState } from "react"
import { CircleDollarSign } from "lucide-react"
import { useForm } from "react-hook-form"

import { toast } from "@/lib/toast"
import EmptyState from "@/components/common/EmptyState"
import FormDialog from "@/components/common/FormDialog"
import InputField from "@/components/common/InputField"
import SurfaceCard from "@/components/common/SurfaceCard"
import TextInput from "@/components/common/TextInput"
import { useFarmCycle } from "@/context/FarmCycleContext"
import { useCreateSaleMutation } from "@/hooks/use-farm-mutations"
import {
  useDashboardSummaryQuery,
  useSaleQuery,
} from "@/hooks/use-farm-queries"
import {
  formatCurrency,
  formatDate,
  formatNullableNumber,
  formatNumber,
} from "@/lib/format"
import { toNumber } from "@/lib/farm-utils"
import type { CreateSaleRequest } from "@/types/api"

type SaleFormValues = {
  saleDate: string
  totalWeightKg: string
  pricePerKg: string
}

const defaultSaleValues: SaleFormValues = {
  saleDate: "",
  totalWeightKg: "",
  pricePerKg: "",
}

export default function Sales() {
  const { selectedCycleId } = useFarmCycle()
  const saleQuery = useSaleQuery(selectedCycleId)
  const dashboardQuery = useDashboardSummaryQuery(selectedCycleId)
  const createSaleMutation = useCreateSaleMutation(selectedCycleId)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SaleFormValues>({
    defaultValues: defaultSaleValues,
  })

  if (!selectedCycleId) {
    return (
      <EmptyState
        title="لا توجد دورة محددة"
        description="اختر دورة أولًا لتسجيل البيع."
      />
    )
  }

  function handleDialogOpenChange(open: boolean) {
    setIsFormOpen(open)

    if (!open) {
      reset(defaultSaleValues)
    }
  }

  function submitSale(values: SaleFormValues) {
    const payload: CreateSaleRequest = {
      saleDate: values.saleDate,
      totalWeightKg: toNumber(values.totalWeightKg),
      pricePerKg: toNumber(values.pricePerKg),
    }

    void createSaleMutation
      .mutateAsync(payload)
      .then(() => {
        reset(defaultSaleValues)
        setIsFormOpen(false)
        toast.success("تم تسجيل عملية البيع.")
      })
      .catch((error: unknown) => {
        toast.error(
          error instanceof Error ? error.message : "تعذر تسجيل البيع."
        )
      })
  }

  const sale = saleQuery.data
  const dashboard = dashboardQuery.data

  return (
    <div className="space-y-5">
      <FormDialog
        open={isFormOpen}
        onOpenChange={handleDialogOpenChange}
        triggerLabel="تسجيل عملية البيع"
        title="إغلاق الدورة وتسجيل البيع"
        description="أدخل بيانات البيع النهائية للدورة الحالية."
        submitLabel="حفظ عملية البيع"
        busy={createSaleMutation.isPending}
        onSubmit={handleSubmit(submitSale)}
      >
        <InputField label="تاريخ البيع" error={errors.saleDate?.message}>
          <TextInput
            type="date"
            {...register("saleDate", { required: "تاريخ البيع مطلوب" })}
            aria-invalid={Boolean(errors.saleDate)}
          />
        </InputField>

        <div className="grid gap-4 md:grid-cols-2">
          <InputField
            label="الوزن الكلي عند البيع"
            error={errors.totalWeightKg?.message}
          >
            <TextInput
              type="number"
              min="0.1"
              step="0.01"
              {...register("totalWeightKg", {
                required: "الوزن الكلي مطلوب",
              })}
              aria-invalid={Boolean(errors.totalWeightKg)}
            />
          </InputField>

          <InputField
            label="سعر البيع لكل كجم"
            error={errors.pricePerKg?.message}
          >
            <TextInput
              type="number"
              min="0"
              step="0.01"
              {...register("pricePerKg", {
                required: "سعر البيع لكل كجم مطلوب",
              })}
              aria-invalid={Boolean(errors.pricePerKg)}
            />
          </InputField>
        </div>
      </FormDialog>

      <div className="grid gap-5 xl:grid-cols-2">
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
          {sale ? (
            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-2xl bg-[#F7FAF5] p-4">
                <p className="text-xs text-slate-400">تاريخ البيع</p>
                <p className="mt-1 font-medium text-slate-900">
                  {formatDate(sale.saleDate)}
                </p>
              </div>
              <div className="rounded-2xl bg-[#F7FAF5] p-4">
                <p className="text-xs text-slate-400">الوزن الكلي عند البيع</p>
                <p className="mt-1 font-medium text-slate-900">
                  {formatNumber(sale.totalWeightKg)} كجم
                </p>
              </div>
              <div className="rounded-2xl bg-[#F7FAF5] p-4">
                <p className="text-xs text-slate-400">السعر لكل كجم</p>
                <p className="mt-1 font-medium text-slate-900">
                  {formatCurrency(sale.pricePerKg)}
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
                  : "--"}
              </p>
            </div>
            <div className="rounded-2xl bg-[#F7FAF5] p-4">
              <p className="text-xs text-slate-400">الربح الفعلي</p>
              <p className="mt-1 font-medium text-slate-900">
                {dashboard
                  ? formatNullableNumber(dashboard.actualProfit, formatCurrency)
                  : "--"}
              </p>
            </div>
          </div>
        </SurfaceCard>
      </div>
    </div>
  )
}

import { useMemo, useState } from "react"
import { Wallet } from "lucide-react"
import { Controller, useForm } from "react-hook-form"

import { toast } from "@/lib/toast"
import DataTable from "@/components/common/DataTable"
import EmptyState from "@/components/common/EmptyState"
import FormDialog from "@/components/common/FormDialog"
import InputField from "@/components/common/InputField"
import SelectInput from "@/components/common/SelectInput"
import SurfaceCard from "@/components/common/SurfaceCard"
import TextAreaInput from "@/components/common/TextAreaInput"
import TextInput from "@/components/common/TextInput"
import { useFarmCycle } from "@/context/FarmCycleContext"
import { useCreateExpenseMutation } from "@/hooks/use-farm-mutations"
import {
  useExpenseBreakdownQuery,
  useExpensesQuery,
} from "@/hooks/use-farm-queries"
import { formatCurrency, formatDate } from "@/lib/format"
import { toNumber } from "@/lib/farm-utils"
import type {
  CreateManualExpenseRequest,
  ExpenseCategory,
  ExpenseSourceType,
} from "@/types/api"

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

const expenseCategoryArabicMap: Record<ExpenseCategory, string> = {
  CHICKS: "كتاكيت",
  FEED: "علف",
  MEDICATION: "أدوية",
  LABOR: "عمالة",
  ELECTRICITY: "كهرباء",
  TRANSPORT: "نقل",
  MISC: "متفرقات",
  OTHER: "أخرى",
}

const expenseSourceTypeArMap: Record<ExpenseSourceType, string> = {
  MANUAL: "إدخال يدوي",
  FEED_PURCHASE: "شراء علف",
  MEDICATION_LOG: "سجل أدوية",
  SYSTEM: "النظام",
}

type ExpenseFormValues = {
  expenseDate: string
  category: ExpenseCategory
  amount: string
  description: string
}

const defaultExpenseValues: ExpenseFormValues = {
  expenseDate: "",
  category: "OTHER",
  amount: "",
  description: "",
}

export default function Expenses() {
  const { selectedCycleId } = useFarmCycle()
  const expensesQuery = useExpensesQuery(selectedCycleId)
  const expenseBreakdownQuery = useExpenseBreakdownQuery(selectedCycleId)
  const createExpenseMutation = useCreateExpenseMutation(selectedCycleId)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ExpenseFormValues>({
    defaultValues: defaultExpenseValues,
  })

  const expenseRows = useMemo(
    () =>
      [...(expensesQuery.data ?? [])].sort((left, right) =>
        right.expenseDate.localeCompare(left.expenseDate)
      ),
    [expensesQuery.data]
  )
  const breakdownEntries = useMemo(
    () =>
      Object.entries(expenseBreakdownQuery.data ?? {}).sort(
        ([, leftValue], [, rightValue]) => rightValue - leftValue
      ),
    [expenseBreakdownQuery.data]
  )

  if (!selectedCycleId) {
    return (
      <EmptyState
        title="لا توجد دورة محددة"
        description="اختر دورة أولًا لتسجيل المصروفات."
      />
    )
  }

  function handleDialogOpenChange(open: boolean) {
    setIsFormOpen(open)

    if (!open) {
      reset(defaultExpenseValues)
    }
  }

  function submitExpense(values: ExpenseFormValues) {
    const payload: CreateManualExpenseRequest = {
      expenseDate: values.expenseDate,
      category: values.category,
      amount: toNumber(values.amount),
      description: values.description.trim() === "" ? null : values.description,
    }

    void createExpenseMutation
      .mutateAsync(payload)
      .then(() => {
        reset(defaultExpenseValues)
        setIsFormOpen(false)
        toast.success("تمت إضافة المصروف بنجاح.")
      })
      .catch((error: unknown) => {
        toast.error(
          error instanceof Error ? error.message : "تعذر حفظ المصروف."
        )
      })
  }

  return (
    <div className="space-y-5">
      <FormDialog
        open={isFormOpen}
        onOpenChange={handleDialogOpenChange}
        triggerLabel="إضافة مصروف يدوي"
        title="إضافة مصروف يدوي"
        description="سجّل أي مصروف إضافي مرتبط بالدورة المحددة."
        submitLabel="حفظ المصروف"
        busy={createExpenseMutation.isPending}
        onSubmit={handleSubmit(submitExpense)}
      >
        <InputField label="التاريخ" error={errors.expenseDate?.message}>
          <TextInput
            type="date"
            {...register("expenseDate", { required: "التاريخ مطلوب" })}
            aria-invalid={Boolean(errors.expenseDate)}
          />
        </InputField>

        <div className="grid gap-4 md:grid-cols-2">
          <InputField label="الفئة" error={errors.category?.message}>
            <Controller
              name="category"
              control={control}
              rules={{ required: "الفئة مطلوبة" }}
              render={({ field }) => (
                <SelectInput
                  options={expenseCategoryOptions}
                  value={field.value}
                  onValueChange={field.onChange}
                  onBlur={field.onBlur}
                  name={field.name}
                  aria-invalid={Boolean(errors.category)}
                />
              )}
            />
          </InputField>

          <InputField label="المبلغ" error={errors.amount?.message}>
            <TextInput
              type="number"
              min="0"
              step="0.01"
              {...register("amount", { required: "المبلغ مطلوب" })}
              aria-invalid={Boolean(errors.amount)}
            />
          </InputField>
        </div>

        <InputField label="الوصف" error={errors.description?.message}>
          <TextAreaInput {...register("description")} />
        </InputField>
      </FormDialog>

      <SurfaceCard className="p-5 sm:p-6">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h3 className="font-heading mt-1 text-lg font-semibold text-slate-900">
              تفاصيل المصروفات
            </h3>
          </div>
          <Wallet className="size-5 text-[#74A36A]" />
        </div>
        <div className="space-y-3">
          {breakdownEntries.length > 0 ? (
            <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-4">
              {breakdownEntries.map(([category, value]) => (
                <div
                  key={category}
                  className="rounded-2xl border border-[#E8EEE4] bg-[#FBFCF8] px-4 py-3"
                >
                  <div className="flex flex-col items-center justify-between gap-3 text-sm text-slate-700">
                    <span>
                      {expenseCategoryArabicMap[category as ExpenseCategory]}
                    </span>
                    <span className="text-xl font-bold text-slate-900">
                      {formatCurrency(value).replace("ج.م.", "")}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-400">
              لا توجد بيانات تفصيلية بعد.
            </p>
          )}
        </div>
      </SurfaceCard>

      <DataTable
        title="كل المصروفات"
        rows={expenseRows}
        emptyText="لا توجد مصروفات مسجلة بعد."
        columns={[
          {
            key: "date",
            title: "التاريخ",
            render: (row) => formatDate(row.expenseDate),
          },
          {
            key: "category",
            title: "الفئة",
            render: (row) => expenseCategoryArabicMap[row.category],
          },
          {
            key: "amount",
            title: "المبلغ",
            render: (row) => formatCurrency(row.amount),
          },
          {
            key: "source",
            title: "المصدر",
            render: (row) =>
              expenseSourceTypeArMap[row.sourceType as ExpenseSourceType] ??
              "MANUAL",
          },
          {
            key: "desc",
            title: "الوصف",
            render: (row) => row.description ?? "--",
          },
        ]}
      />
    </div>
  )
}
